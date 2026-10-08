import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { recordMemberLogin } from './usageTracker';

export interface TeamMember {
  id: string;
  name: string;
  email: string; // Used as username/email
  password: string;
  role: 'admin' | 'editor' | 'viewer';
  permissions: string[];
  createdAt?: string;
  createdBy?: string;
  lastLoginAt?: string;
}

export const ALL_TOOLS_PERMISSIONS = [
  'photoshoot',
  'landing',
  'ads',
  'script',
  'fbAds',
  'funnelCopy',
  'winnerAngle',
  'videoScenes',
  'creativePrompts',
  'textOnVisual',
  'smartAngles',
  'flowCharacter'
];

const LOCAL_STORAGE_SESSION_KEY = 'kwh_team_session_v5';
const LOCAL_STORAGE_MEMBERS_KEY = 'kwh_local_team_members_v5';
const LOCAL_STORAGE_ADMIN_KEY = 'kwh_custom_admin_creds_v5';

// Purge old legacy storage keys
try {
  ['quickads_team_session', 'quickads_team_session_v2', 'quickads_local_team_members',
   'quickads_local_team_members_v2', 'kwh_team_session_v3', 'kwh_local_team_members_v3',
   'kwh_team_session_v4', 'kwh_local_team_members_v4'].forEach(k => localStorage.removeItem(k));
} catch {}

function isAllowedMember(email: string = ''): boolean {
  const em = email.toLowerCase().trim();
  if (!em) return false;
  if (em.includes('elashory')) return false;
  return true;
}

// 1. Get the ONE and ONLY Admin account (Synchronous cache read)
export function getSavedAdminCredentials(): TeamMember {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ADMIN_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.email && parsed.password) {
        return {
          id: 'owner-admin-1',
          name: parsed.name || 'المدير العام',
          email: parsed.email.trim(),
          password: parsed.password.trim(),
          role: 'admin',
          permissions: ALL_TOOLS_PERMISSIONS,
          createdAt: parsed.createdAt || '2026-01-01'
        };
      }
    }
  } catch {}

  // Fallback initial account if never customized
  return {
    id: 'owner-admin-1',
    name: 'المدير العام',
    email: 'admin',
    password: 'admin',
    role: 'admin',
    permissions: ALL_TOOLS_PERMISSIONS,
    createdAt: '2026-01-01'
  };
}

export const DEFAULT_ADMIN_USERS: TeamMember[] = [getSavedAdminCredentials()];

// 2. Fetch Authoritative Admin asynchronously from Backend or Firestore
export async function fetchAuthoritativeAdmin(): Promise<TeamMember> {
  // 1. Try backend server route
  try {
    const res = await fetch('/api/team/admin-credentials');
    if (res.ok) {
      const data = await res.json();
      if (data && data.email && data.password) {
        const admin: TeamMember = {
          id: 'owner-admin-1',
          name: data.name || 'المدير العام',
          email: data.email.trim(),
          password: data.password.trim(),
          role: 'admin',
          permissions: ALL_TOOLS_PERMISSIONS,
          createdAt: data.createdAt || '2026-01-01'
        };
        localStorage.setItem(LOCAL_STORAGE_ADMIN_KEY, JSON.stringify(admin));
        return admin;
      }
    }
  } catch {}

  // 2. Try Firestore system_settings
  try {
    const adminSnap = await getDoc(doc(db, 'system_settings', 'admin_credentials'));
    if (adminSnap.exists()) {
      const aData = adminSnap.data();
      if (aData.username && aData.password) {
        const admin: TeamMember = {
          id: 'owner-admin-1',
          name: aData.name || 'المدير العام',
          email: aData.username.trim(),
          password: aData.password.trim(),
          role: 'admin',
          permissions: ALL_TOOLS_PERMISSIONS,
          createdAt: aData.updatedAt || '2026-01-01'
        };
        localStorage.setItem(LOCAL_STORAGE_ADMIN_KEY, JSON.stringify(admin));
        return admin;
      }
    }
  } catch {}

  // 3. Fallback to cached localStorage
  return getSavedAdminCredentials();
}

// 3. Update Admin Username & Password (Single Authoritative General Manager)
export async function updateAdminCredentials(newUsername: string, newPassword: string, newName?: string): Promise<TeamMember> {
  const cleanUser = newUsername.trim().toLowerCase();
  const cleanPass = newPassword.trim();

  if (!cleanUser || !cleanPass) {
    throw new Error("يرجى إدخال اسم المستخدم وكلمة المرور الجديدة للمدير.");
  }

  const updatedAdmin: TeamMember = {
    id: 'owner-admin-1',
    name: newName?.trim() || 'المدير العام',
    email: cleanUser,
    password: cleanPass,
    role: 'admin',
    permissions: ALL_TOOLS_PERMISSIONS,
    createdAt: new Date().toISOString()
  };

  // 1. Save to local storage custom admin
  localStorage.setItem(LOCAL_STORAGE_ADMIN_KEY, JSON.stringify(updatedAdmin));

  // 2. Clean out any zombie 'admin' accounts or new username from local regular members
  const localList = getLocalMembers().filter(m => 
    m.id !== 'owner-admin-1' && 
    m.role !== 'admin' && 
    m.email.toLowerCase() !== 'admin' &&
    m.email.toLowerCase() !== cleanUser
  );
  saveLocalMembers(localList);

  // 3. Save to backend server API
  try {
    await fetch('/api/team/admin-credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: cleanUser, password: cleanPass, name: updatedAdmin.name })
    });
  } catch {}

  // 4. Save to Firestore system_settings
  try {
    await setDoc(doc(db, 'system_settings', 'admin_credentials'), {
      username: cleanUser,
      password: cleanPass,
      name: updatedAdmin.name,
      updatedAt: new Date().toISOString()
    });
  } catch {}

  // 5. Delete any legacy admin docs from agencyTeams collection
  try {
    const qSnap = await getDocs(collection(db, 'agencyTeams'));
    qSnap.docs.forEach(d => {
      const em = (d.data().email || '').toLowerCase().trim();
      const rl = (d.data().role || '').toLowerCase();
      if (em === 'admin' || rl === 'admin' || d.id === 'owner-admin-1' || d.id === 'admin_1' || em === cleanUser) {
        deleteDoc(d.ref).catch(() => {});
      }
    });
  } catch {}

  // 6. Update active session immediately so the current session reflects new admin
  saveActiveTeamSession(updatedAdmin);

  return updatedAdmin;
}

// Helper: load only regular non-admin team members from local storage
function getLocalMembers(): TeamMember[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_MEMBERS_KEY);
    if (raw) {
      const parsed: TeamMember[] = JSON.parse(raw);
      return parsed.filter(m => 
        m.role !== 'admin' && 
        m.id !== 'owner-admin-1' && 
        m.id !== 'admin_1' &&
        m.email.toLowerCase() !== 'admin' &&
        isAllowedMember(m.email)
      );
    }
  } catch {}
  return [];
}

function saveLocalMembers(members: TeamMember[]) {
  try {
    const cleaned = members.filter(m => 
      m.role !== 'admin' && 
      m.id !== 'owner-admin-1' && 
      m.id !== 'admin_1' &&
      m.email.toLowerCase() !== 'admin' &&
      isAllowedMember(m.email)
    );
    localStorage.setItem(LOCAL_STORAGE_MEMBERS_KEY, JSON.stringify(cleaned));
  } catch {}
}

// 4. Fetch all team members: EXACTLY ONE ADMIN AT INDEX 0 + Regular Members
export async function getTeamMembersList(): Promise<TeamMember[]> {
  // 1. Fetch the single authoritative admin
  const adminUser = await fetchAuthoritativeAdmin();
  const cleanAdminEmail = adminUser.email.toLowerCase().trim();

  const regularMembers: TeamMember[] = [];

  // 2. Fetch regular members from Server
  try {
    const res = await fetch('/api/team/members');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.members)) {
        data.members.forEach((sm: any) => {
          if (!sm.isAdmin && sm.id !== 'admin_1' && sm.id !== 'owner-admin-1') {
            const em = (sm.email || '').toLowerCase().trim();
            if (em && em !== 'admin' && em !== cleanAdminEmail && isAllowedMember(em)) {
              regularMembers.push({
                id: sm.id || 'mem_' + Date.now(),
                name: sm.name || em.split('@')[0],
                email: em,
                password: sm.password || '123456',
                role: 'editor',
                permissions: ALL_TOOLS_PERMISSIONS,
                createdAt: sm.createdAt || new Date().toISOString()
              });
            }
          }
        });
      }
    }
  } catch {}

  // 3. Fetch regular members from Firestore (agencyTeams)
  try {
    const qSnap = await getDocs(collection(db, 'agencyTeams'));
    qSnap.docs.forEach(d => {
      const data = d.data();
      const em = (data.email || '').toLowerCase().trim();
      const rl = (data.role || '').toLowerCase();
      // Strictly purge any zombie admin docs
      if (em === 'admin' || rl === 'admin' || em === cleanAdminEmail || d.id === 'owner-admin-1' || d.id === 'admin_1') {
        deleteDoc(d.ref).catch(() => {});
        return;
      }
      if (isAllowedMember(em)) {
        regularMembers.push({
          id: d.id,
          name: data.name || em.split('@')[0],
          email: em,
          password: data.password || '123456',
          role: 'editor',
          permissions: data.permissions || ALL_TOOLS_PERMISSIONS,
          createdAt: data.addedAt || data.createdAt || new Date().toISOString()
        });
      }
    });
  } catch {}

  // 4. Merge local storage regular members
  for (const lm of getLocalMembers()) {
    const em = lm.email.toLowerCase().trim();
    if (em !== cleanAdminEmail && em !== 'admin') {
      regularMembers.push(lm);
    }
  }

  // 5. Strictly deduplicate regular members uniquely by email
  const regularMap = new Map<string, TeamMember>();
  for (const m of regularMembers) {
    const em = m.email.toLowerCase().trim();
    if (em && em !== cleanAdminEmail && em !== 'admin') {
      if (!regularMap.has(em)) {
        regularMap.set(em, m);
      }
    }
  }

  const finalRegular = Array.from(regularMap.values());
  saveLocalMembers(finalRegular);

  // Return: EXACTLY ONE ADMIN AT INDEX 0 + Regular Members (guaranteed NO duplicate admins)
  return [adminUser, ...finalRegular];
}

// 5. Create a new regular team member (Only by Admin)
export async function addTeamMember(data: {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'editor' | 'viewer';
  permissions: string[];
}): Promise<TeamMember> {
  const cleanEmail = data.email.trim().toLowerCase();
  if (!cleanEmail) throw new Error("يرجى إدخال اسم المستخدم أو البريد الإلكتروني");
  if (!data.password.trim()) throw new Error("يرجى إدخال كلمة المرور");

  const currentAdmin = await fetchAuthoritativeAdmin();
  if (cleanEmail === currentAdmin.email.toLowerCase() || cleanEmail === 'admin') {
    throw new Error("اسم المستخدم هذا محجوز لحساب المدير العام ولا يمكن تكراره.");
  }

  if (!isAllowedMember(cleanEmail)) {
    throw new Error("اسم المستخدم غير متاح");
  }

  const id = 'member_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
  const newMember: TeamMember = {
    id,
    name: data.name.trim() || cleanEmail.split('@')[0],
    email: cleanEmail,
    password: data.password.trim(),
    role: 'editor', // Strictly regular member: only ONE admin allowed in system!
    permissions: data.permissions && data.permissions.length > 0 ? data.permissions : ALL_TOOLS_PERMISSIONS,
    createdAt: new Date().toISOString()
  };

  // Save to Server
  try {
    await fetch('/api/team/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newMember.name,
        email: newMember.email,
        password: newMember.password,
        role: newMember.role
      })
    });
  } catch {}

  // Save to Firestore
  try {
    await setDoc(doc(db, 'agencyTeams', id), {
      name: newMember.name,
      email: newMember.email,
      password: newMember.password,
      role: newMember.role,
      permissions: newMember.permissions,
      addedAt: newMember.createdAt
    });
  } catch {}

  // Save to localStorage
  const localList = getLocalMembers().filter(m => m.email.toLowerCase() !== cleanEmail);
  localList.push(newMember);
  saveLocalMembers(localList);

  return newMember;
}

// 6. Change Any Regular Member Password (by Admin)
export async function changeMemberPassword(memberId: string, newPass: string): Promise<void> {
  const cleanPass = newPass.trim();
  if (!cleanPass) throw new Error("يرجى كتابة كلمة المرور الجديدة.");

  const currentAdmin = await fetchAuthoritativeAdmin();
  if (memberId === currentAdmin.id || memberId === 'admin_1' || memberId === 'owner-admin-1') {
    await updateAdminCredentials(currentAdmin.email, cleanPass, currentAdmin.name);
    return;
  }

  // Update on server
  try {
    await fetch('/api/team/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, newPassword: cleanPass })
    });
  } catch {}

  // Update on Firestore
  try {
    await updateDoc(doc(db, 'agencyTeams', memberId), {
      password: cleanPass,
      updatedAt: new Date().toISOString()
    });
  } catch {}

  // Update localStorage
  const localList = getLocalMembers().map(m => m.id === memberId ? { ...m, password: cleanPass } : m);
  saveLocalMembers(localList);
}

// 7. Delete regular team member (Only by Admin)
export async function removeTeamMember(id: string): Promise<void> {
  const currentAdmin = await fetchAuthoritativeAdmin();
  if (id === currentAdmin.id || id === 'owner-admin-1' || id === 'admin_1') {
    throw new Error("لا يمكن حذف حساب المدير العام الرئيسي.");
  }

  // Delete on server
  try {
    await fetch(`/api/team/members/${id}`, { method: 'DELETE' });
  } catch {}

  // Delete on Firestore
  try {
    await deleteDoc(doc(db, 'agencyTeams', id));
  } catch {}

  // Delete from localStorage
  const localList = getLocalMembers().filter(m => m.id !== id);
  saveLocalMembers(localList);
}

// 8. Strict Authentication: Authoritative Server Verification First
export async function authenticateTeamMember(identifier: string, pass: string): Promise<TeamMember> {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = pass.trim();

  if (!cleanId || !cleanPass) {
    throw new Error("يرجى إدخال اسم المستخدم وكلمة المرور.");
  }

  // 1. Primary: Verify with backend server API
  try {
    const res = await fetch('/api/team/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanId, password: cleanPass })
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.member) {
        const sm = data.member;
        const authMember: TeamMember = {
          id: sm.isAdmin ? 'owner-admin-1' : (sm.id || 'mem_' + Date.now()),
          name: sm.name || (sm.isAdmin ? 'المدير العام' : sm.email.split('@')[0]),
          email: sm.email,
          password: cleanPass,
          role: sm.isAdmin ? 'admin' : (sm.role || 'editor'),
          permissions: sm.permissions || ALL_TOOLS_PERMISSIONS,
          createdAt: sm.createdAt || new Date().toISOString()
        };

        if (sm.isAdmin) {
          localStorage.setItem(LOCAL_STORAGE_ADMIN_KEY, JSON.stringify(authMember));
        }

        recordMemberLogin(authMember).catch(() => {});
        saveActiveTeamSession(authMember);
        return authMember;
      }
    } else if (res.status === 401 || res.status === 400) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.error || "بيانات الدخول غير صحيحة. يرجى التأكد من اسم المستخدم وكلمة المرور.");
    }
  } catch (err: any) {
    // If backend explicitly rejected the credentials, propagate the error immediately!
    if (err.message && (err.message.includes('غير مسجل') || err.message.includes('غير صحيحة') || err.message.includes('مطلوبة') || err.message.includes('محجوز'))) {
      throw err;
    }
    // Only fall back to local/firestore check if network error occurred
  }

  // 2. Offline Fallback: Check against authoritative admin
  const currentAdmin = await fetchAuthoritativeAdmin();
  const isCustomAdminSet = currentAdmin.email.toLowerCase() !== 'admin';

  // Strict check: If user typed 'admin' but a custom admin is set, REJECT!
  if (cleanId === 'admin' && isCustomAdminSet) {
    throw new Error("تم تحديث بيانات حساب المدير العام مسبقاً، ولم يعد حساب (admin) الافتراضي متاحاً. يرجى إدخال اسم المستخدم وكلمة المرور الجديدة.");
  }

  // Check admin credentials
  if (cleanId === currentAdmin.email.toLowerCase() || cleanId === currentAdmin.name.toLowerCase()) {
    if (cleanPass === currentAdmin.password) {
      recordMemberLogin(currentAdmin).catch(() => {});
      saveActiveTeamSession(currentAdmin);
      return currentAdmin;
    } else {
      throw new Error("كلمة المرور غير صحيحة لحساب المدير العام.");
    }
  }

  // 3. Check regular members
  const allMembers = await getTeamMembersList();
  const regularMembers = allMembers.filter(m => m.id !== 'owner-admin-1' && m.email.toLowerCase() !== currentAdmin.email.toLowerCase());

  const found = regularMembers.find(m => 
    (m.email.toLowerCase() === cleanId || m.name.toLowerCase() === cleanId) &&
    m.password === cleanPass
  );

  if (!found) {
    throw new Error("بيانات الدخول غير صحيحة. يرجى التأكد من اسم المستخدم وكلمة المرور المسلمة لك من مدير النظام.");
  }

  recordMemberLogin(found).catch(() => {});
  saveActiveTeamSession(found);
  return found;
}

// 9. Session management with strict admin session sync
export function getActiveTeamSession(): TeamMember | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
    if (raw) {
      const parsed: TeamMember = JSON.parse(raw);
      if (!parsed || !isAllowedMember(parsed.email)) {
        localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
        return null;
      }

      // If session is admin, always sync with latest saved admin credentials
      if (parsed.role === 'admin' || parsed.id === 'owner-admin-1' || parsed.id === 'admin_1') {
        const latestAdmin = getSavedAdminCredentials();
        return latestAdmin;
      }

      return parsed;
    }
  } catch {}
  return null;
}

export function saveActiveTeamSession(member: TeamMember | null): void {
  try {
    if (member && isAllowedMember(member.email)) {
      localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(member));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
    }
  } catch {}
}
