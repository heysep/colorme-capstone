/**
 * sessionStorage 기반 임시 인증 저장소.
 * 실제 백엔드 연동 전까지 사용하는 목업 레이어.
 * @TODO: API (2026/04/18) — 실제 서버 인증으로 교체 필요
 */

export type CountryCode = 'KR' | 'US' | 'JP' | 'CN';

export type StoredUser = {
  email: string;
  password: string;
  username: string;
  country: CountryCode;
};

const USERS_KEY = 'colorme_users';
const SESSION_KEY = 'colorme_session';

const isBrowser = () => typeof window !== 'undefined';

const readUsers = (): StoredUser[] => {
  if (!isBrowser()) return [];
  try {
    const raw = window.sessionStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredUser[]) : [];
  } catch {
    return [];
  }
};

const writeUsers = (users: StoredUser[]) => {
  if (!isBrowser()) return;
  window.sessionStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const authStorage = {
  findUserByEmail(email: string): StoredUser | null {
    return readUsers().find((u) => u.email === email) ?? null;
  },

  existsEmail(email: string): boolean {
    return readUsers().some((u) => u.email === email);
  },

  createUser(user: StoredUser): void {
    const users = readUsers();
    if (users.some((u) => u.email === user.email)) {
      throw new Error('이미 가입된 이메일입니다.');
    }
    users.push(user);
    writeUsers(users);
  },

  verifyCredentials(email: string, password: string): StoredUser | null {
    const user = readUsers().find((u) => u.email === email);
    if (!user) return null;
    return user.password === password ? user : null;
  },

  setSession(email: string): void {
    if (!isBrowser()) return;
    window.sessionStorage.setItem(SESSION_KEY, email);
  },

  getSession(): string | null {
    if (!isBrowser()) return null;
    return window.sessionStorage.getItem(SESSION_KEY);
  },

  clearSession(): void {
    if (!isBrowser()) return;
    window.sessionStorage.removeItem(SESSION_KEY);
  },
};

export const COUNTRIES: { code: CountryCode; label: string }[] = [
  { code: 'KR', label: '대한민국' },
  { code: 'US', label: '미국' },
  { code: 'JP', label: '일본' },
  { code: 'CN', label: '중국' },
];
