import { runTransaction, doc, collection, query, where, getDocs, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from './firestore-errors';

export const TOKEN_COSTS = {
   LANDING_PAGE: 10,
   SCRIPT: 2,
   VOICE_OVER: 3,
   IMAGE: 5,
   TEXT: 2
};

export async function checkBalance(amount: number) {
    if (amount <= 0) return true;
    
    let currentTokens = 0;
    let role = 'member';
    
    const currentUser = auth.currentUser;
    // Allow immediate guest access without logging in
    if (!currentUser) return true;
    
    // We can just rely on the existing profile from frontend or fetch it
    const userRef = doc(db, 'users', currentUser.uid);
    try {
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            const data = userDoc.data();
            currentTokens = data.tokens || 0;
            role = data.role || 'member';
        }
    } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'users/' + currentUser.uid);
    }
    
    if (currentTokens < amount && role !== 'owner' && role !== 'admin') {
        throw new Error("عذراً، رصيد التوكينز الخاص بك غير كافٍ. يرجى الترقية أو شحن الرصيد.");
    }
    return true;
}

export async function deductTokens(amount: number, feature: string, link: string = '', productName: string = '') {
    if (amount <= 0) return true;

    const currentUser = auth.currentUser;
    // Allow immediate guest access without logging in
    if (!currentUser) return true;

    // Pre-fetch team info outside transaction to record usage later, optional
    let agencyMemberDocId = null;
    let agencyId = null;
    try {
        const agencyTeamsRef = collection(db, 'agencyTeams');
        const q = query(agencyTeamsRef, where('email', '==', currentUser.email?.toLowerCase()));
        const teamSnap = await getDocs(q);
        if (!teamSnap.empty) {
            agencyMemberDocId = teamSnap.docs[0].id;
            agencyId = teamSnap.docs[0].data().agencyId;
        }
    } catch (error) {
        console.error("Error finding agency membership:", error);
        // We handle this as a non-fatal error but if it's permission denied we might want to know
        if (error instanceof Error && error.message.includes('permission')) {
             handleFirestoreError(error, OperationType.LIST, 'agencyTeams');
        }
    }

    try {
        await runTransaction(db, async (transaction) => {
            const userRef = doc(db, 'users', currentUser.uid);
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) {
                throw new Error("User account not found!");
            }
            
            const userData = userDoc.data();
            const currentTokens = userData.tokens || 0;
            const role = userData.role || 'member';

            if (currentTokens < amount && role !== 'owner' && role !== 'admin') {
                throw new Error("NOT_ENOUGH_TOKENS");
            }
            
            // Deduct from the acting user
            transaction.update(userRef, { tokens: Math.max(0, currentTokens - amount) });
            
            // If member, update their usage running total
            if (agencyMemberDocId) {
                const memberRef = doc(db, 'agencyTeams', agencyMemberDocId);
                const memberDoc = await transaction.get(memberRef);
                if (memberDoc.exists()) {
                    const currentMemberTokensUsed = memberDoc.data().tokensUsed || 0;
                    transaction.update(memberRef, { tokensUsed: currentMemberTokensUsed + amount });
                }
            }
            
            const txRef = doc(collection(db, 'tokenTransactions'));
            transaction.set(txRef, {
                userId: currentUser.uid,
                userEmail: currentUser.email || '',
                userName: currentUser.displayName || '',
                agencyId: agencyId, // Optional reference for the owner
                type: 'usage',
                amount: amount,
                feature: feature,
                link: link,
                productName: productName,
                createdAt: new Date().toISOString()
            });
        });
        
        return true;
    } catch (e: any) {
        if (e.message === "NOT_ENOUGH_TOKENS") {
            throw new Error("عذراً، رصيد التوكينز الخاص بك غير كافٍ. يرجى الترقية أو شحن الرصيد.");
        }
        if (e.message?.includes('permission')) {
             handleFirestoreError(e, OperationType.WRITE, 'deductTokens transaction');
        }
        throw e;
    }
}

export async function allocateTokensToMember(agencyTeamId: string, memberEmail: string, newTokenLimit: number, oldTokenLimit: number) {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("يجب تسجيل الدخول");

    const amountToTransfer = newTokenLimit - oldTokenLimit;
    if (amountToTransfer === 0) return;

    // Find member user account by email to deposit/withdraw
    let memberUid = null;
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', memberEmail));
    const memberDocs = await getDocs(q);
    if (!memberDocs.empty) {
        memberUid = memberDocs.docs[0].id;
    }

    try {
        await runTransaction(db, async (transaction) => {
            const ownerRef = doc(db, 'users', currentUser.uid);
            const ownerDoc = await transaction.get(ownerRef);
            if (!ownerDoc.exists()) throw new Error("Owner account not found");
            const ownerData = ownerDoc.data();
            const ownerTokens = ownerData.tokens || 0;

            if (amountToTransfer > 0 && ownerTokens < amountToTransfer) {
                throw new Error("NOT_ENOUGH_TOKENS");
            }

            // Deduct from owner
            transaction.update(ownerRef, { tokens: Math.max(0, ownerTokens - amountToTransfer) });
            
            // Update the agencyTeam document
            const teamRef = doc(db, 'agencyTeams', agencyTeamId);
            transaction.update(teamRef, { tokenLimit: newTokenLimit });

            // If the member has an existing account, add/remove the tokens directly
            if (memberUid) {
                const memberRef = doc(db, 'users', memberUid);
                const memberDoc = await transaction.get(memberRef);
                if (memberDoc.exists()) {
                    const memberTokens = memberDoc.data().tokens || 0;
                    transaction.update(memberRef, { tokens: Math.max(0, memberTokens + amountToTransfer) });
                }
            }
        });
    } catch (e: any) {
        if (e.message === "NOT_ENOUGH_TOKENS") {
            throw new Error("عذراً، رصيد التوكينز الخاص بك غير كافٍ.");
        }
        throw e;
    }
}

