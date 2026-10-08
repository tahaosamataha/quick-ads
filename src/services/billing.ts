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

export async function checkBalance(_amount: number) {
    // All token limits removed per user instructions - unlimited team access
    return true;
}

export async function deductTokens(_amount: number, _feature: string, _link: string = '', _productName: string = '') {
    // All token deductions removed per user instructions
    return true;
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

