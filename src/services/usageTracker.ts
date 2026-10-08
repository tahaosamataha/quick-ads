import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { TeamMember } from './teamAuth';

export interface LoginLogItem {
  id?: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  role: string;
  loginAt: string;
  timestamp: number;
}

export interface AiUsageItem {
  id?: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  tool: string;
  model: string; // 'gemini-2.5-flash' | 'gemini-2.5-pro' | 'imagen-3.0' | 'gemini-tts'
  tokens: number;
  count: number;
  timestamp: number;
  createdAt: string;
}

export interface MemberUsageSummary {
  memberId: string;
  memberName: string;
  memberEmail: string;
  role: string;
  lastLoginAt?: string;
  totalRequests: number;
  flashTokens: number;
  proTokens: number;
  imageGenerations: number;
  voiceGenerations: number;
}

const LOCAL_STORAGE_LOGINS_KEY = 'kwh_team_logins_v1';
const LOCAL_STORAGE_USAGE_KEY = 'kwh_team_usage_v1';

// 1. Record Member Login
export async function recordMemberLogin(member: TeamMember): Promise<void> {
  const loginEntry: LoginLogItem = {
    memberId: member.id,
    memberName: member.name,
    memberEmail: member.email,
    role: member.role,
    loginAt: new Date().toISOString(),
    timestamp: Date.now()
  };

  // Local storage backup
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_LOGINS_KEY);
    const list: LoginLogItem[] = raw ? JSON.parse(raw) : [];
    list.unshift(loginEntry);
    localStorage.setItem(LOCAL_STORAGE_LOGINS_KEY, JSON.stringify(list.slice(0, 100)));
  } catch (e) {
    console.error("Local login log error", e);
  }

  // Firestore sync
  try {
    await addDoc(collection(db, 'team_logins'), {
      ...loginEntry,
      serverTime: serverTimestamp()
    });
  } catch (err) {
    // Handled silently
  }
}

// 2. Record AI Usage
export async function recordAiUsage(params: {
  member?: TeamMember | null;
  tool: string;
  model: 'gemini-2.5-flash' | 'gemini-2.5-pro' | 'imagen-3.0' | 'gemini-tts' | string;
  tokens?: number;
  count?: number;
}): Promise<void> {
  const member = params.member;
  if (!member) return;

  const usageEntry: AiUsageItem = {
    memberId: member.id,
    memberName: member.name,
    memberEmail: member.email,
    tool: params.tool,
    model: params.model,
    tokens: params.tokens || (params.model.includes('pro') ? 1200 : 600),
    count: params.count || 1,
    timestamp: Date.now(),
    createdAt: new Date().toISOString()
  };

  // Local storage backup
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_USAGE_KEY);
    const list: AiUsageItem[] = raw ? JSON.parse(raw) : [];
    list.unshift(usageEntry);
    localStorage.setItem(LOCAL_STORAGE_USAGE_KEY, JSON.stringify(list.slice(0, 500)));
  } catch (e) {
    console.error("Local usage log error", e);
  }

  // Firestore sync
  try {
    await addDoc(collection(db, 'team_ai_usage'), {
      ...usageEntry,
      serverTime: serverTimestamp()
    });
  } catch (err) {
    // Handled silently
  }
}

// 3. Fetch Recent Logins
export async function getRecentLogins(): Promise<LoginLogItem[]> {
  let list: LoginLogItem[] = [];

  // Try Firestore first
  try {
    const q = query(collection(db, 'team_logins'), orderBy('timestamp', 'desc'), limit(50));
    const snap = await getDocs(q);
    if (!snap.empty) {
      list = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      return list;
    }
  } catch {
    // Fallback to local storage
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_LOGINS_KEY);
    if (raw) list = JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }

  return list;
}

// 4. Fetch Aggregated Member Usage
export async function getTeamUsageBreakdown(members: TeamMember[]): Promise<MemberUsageSummary[]> {
  let usageList: AiUsageItem[] = [];
  let loginsList: LoginLogItem[] = [];

  try {
    const snap = await getDocs(query(collection(db, 'team_ai_usage'), limit(500)));
    if (!snap.empty) {
      usageList = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    }
  } catch {
    // Local fallback
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_USAGE_KEY);
      if (raw) usageList = JSON.parse(raw);
    } catch {}
  }

  try {
    loginsList = await getRecentLogins();
  } catch {}

  // Aggregate by member
  return members.map(m => {
    const memberUsages = usageList.filter(u => u.memberId === m.id || u.memberEmail === m.email);
    const memberLogins = loginsList.filter(l => l.memberId === m.id || l.memberEmail === m.email);
    const lastLogin = memberLogins[0]?.loginAt || m.createdAt;

    let flashTokens = 0;
    let proTokens = 0;
    let imageGenerations = 0;
    let voiceGenerations = 0;

    for (const u of memberUsages) {
      if (u.model.includes('flash')) {
        flashTokens += u.tokens || 600;
      } else if (u.model.includes('pro')) {
        proTokens += u.tokens || 1200;
      } else if (u.model.includes('imagen') || u.tool.includes('photoshoot') || u.tool.includes('image')) {
        imageGenerations += u.count || 1;
      } else if (u.model.includes('tts') || u.tool.includes('voice')) {
        voiceGenerations += u.count || 1;
      }
    }

    return {
      memberId: m.id,
      memberName: m.name,
      memberEmail: m.email,
      role: m.role,
      lastLoginAt: lastLogin,
      totalRequests: memberUsages.length,
      flashTokens,
      proTokens,
      imageGenerations,
      voiceGenerations
    };
  });
}
