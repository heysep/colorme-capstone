/**
 * 퍼스널 컬러 분석 온보딩 플로우의 sessionStorage 저장소.
 * 사진/스타일 선택값과 서버 분석 세션(sessionToken, analysisId)을 함께 보관한다.
 */

export type StyleKey =
  | 'casual'
  | 'formal'
  | 'street'
  | 'romantic'
  | 'modern'
  | 'vintage';

export type AnalysisState = {
  styles: StyleKey[];
  photoDataUrl: string | null;
  includePreference: boolean;
  /** 백엔드 게스트 세션 토큰 (x-pc-session-token) */
  sessionToken: string | null;
  /** 진행 중/완료된 분석 ID */
  analysisId: number | null;
};

const KEY = 'colorme_analysis';

const EMPTY_STATE: AnalysisState = {
  styles: [],
  photoDataUrl: null,
  includePreference: true,
  sessionToken: null,
  analysisId: null,
};

const isBrowser = () => typeof window !== 'undefined';

const readState = (): AnalysisState => {
  if (!isBrowser()) return { ...EMPTY_STATE };
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return { ...EMPTY_STATE };
    const parsed = JSON.parse(raw);
    return {
      styles: Array.isArray(parsed.styles) ? parsed.styles : [],
      photoDataUrl:
        typeof parsed.photoDataUrl === 'string' ? parsed.photoDataUrl : null,
      includePreference:
        typeof parsed.includePreference === 'boolean'
          ? parsed.includePreference
          : true,
      sessionToken:
        typeof parsed.sessionToken === 'string' ? parsed.sessionToken : null,
      analysisId:
        typeof parsed.analysisId === 'number' ? parsed.analysisId : null,
    };
  } catch {
    return { ...EMPTY_STATE };
  }
};

const writeState = (state: AnalysisState) => {
  if (!isBrowser()) return;
  window.sessionStorage.setItem(KEY, JSON.stringify(state));
};

export const analysisStorage = {
  getState: readState,
  setStyles(styles: StyleKey[]) {
    writeState({ ...readState(), styles });
  },
  setPhoto(photoDataUrl: string | null) {
    // 사진이 바뀌면 이전 분석 결과는 무효화한다.
    writeState({ ...readState(), photoDataUrl, analysisId: null });
  },
  setIncludePreference(includePreference: boolean) {
    writeState({ ...readState(), includePreference });
  },
  setAnalysisSession(sessionToken: string, analysisId: number) {
    writeState({ ...readState(), sessionToken, analysisId });
  },
  /** 로그인/회원가입으로 발급된 회원 세션 토큰을 분석 플로우에 적용 */
  adoptSessionToken(sessionToken: string) {
    writeState({ ...readState(), sessionToken, analysisId: null });
  },
  clearAnalysis() {
    writeState({ ...readState(), analysisId: null });
  },
  reset() {
    if (!isBrowser()) return;
    const { sessionToken } = readState();
    // 게스트 세션 토큰은 유지해 같은 사용자로 이어서 분석한다.
    writeState({ ...EMPTY_STATE, sessionToken });
  },
};

export const STYLE_OPTIONS: {
  key: StyleKey;
  label: string;
  description: string;
  emoji: string;
  gradient: string;
}[] = [
  {
    key: 'casual',
    label: '캐주얼',
    description: '편안하고 자연스러운 스타일',
    emoji: '👕',
    gradient: 'from-sky-400 to-blue-500',
  },
  {
    key: 'formal',
    label: '포멀',
    description: '세련되고 격식있는 스타일',
    emoji: '👔',
    gradient: 'from-slate-500 to-slate-700',
  },
  {
    key: 'street',
    label: '스트릿',
    description: '트렌디하고 개성있는 스타일',
    emoji: '🧥',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    key: 'romantic',
    label: '로맨틱',
    description: '부드럽고 여성스러운 스타일',
    emoji: '👗',
    gradient: 'from-fuchsia-400 to-pink-500',
  },
  {
    key: 'modern',
    label: '모던',
    description: '깔끔하고 미니멀한 스타일',
    emoji: '🧢',
    gradient: 'from-teal-400 to-cyan-500',
  },
  {
    key: 'vintage',
    label: '빈티지',
    description: '레트로하고 클래식한 스타일',
    emoji: '🕶️',
    gradient: 'from-amber-400 to-orange-500',
  },
];

export const styleLabel = (key: StyleKey): string =>
  STYLE_OPTIONS.find((s) => s.key === key)?.label ?? key;
