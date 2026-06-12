/**
 * 회원 세션 저장소 (localStorage).
 * 서버(service-personal-color auth API)가 발급한 세션 토큰과 프로필을 보관한다.
 */

export type CountryCode = 'KR' | 'US' | 'JP' | 'CN';

export type MemberSession = {
  sessionToken: string;
  userId: string; // 이메일
  userName: string;
  userCountry: string | null;
  seasonName: string | null;
};

const SESSION_KEY = 'colorme_member_session';

const isBrowser = () => typeof window !== 'undefined';

export const authStorage = {
  setMemberSession(session: MemberSession): void {
    if (!isBrowser()) return;
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },

  getMemberSession(): MemberSession | null {
    if (!isBrowser()) return null;
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (
        typeof parsed.sessionToken !== 'string' ||
        typeof parsed.userId !== 'string'
      ) {
        return null;
      }
      return parsed as MemberSession;
    } catch {
      return null;
    }
  },

  clearSession(): void {
    if (!isBrowser()) return;
    window.localStorage.removeItem(SESSION_KEY);
  },
};

export const COUNTRIES: { code: CountryCode; label: string }[] = [
  { code: 'KR', label: '대한민국' },
  { code: 'US', label: '미국' },
  { code: 'JP', label: '일본' },
  { code: 'CN', label: '중국' },
];
