/**
 * 퍼스널 컬러 분석 온보딩 플로우의 sessionStorage 저장소.
 * @TODO: API (2026/04/18) — 서버 세션/업로드 API 연동 시 교체
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
};

const KEY = 'colorme_analysis';

const isBrowser = () => typeof window !== 'undefined';

const readState = (): AnalysisState => {
  if (!isBrowser())
    return { styles: [], photoDataUrl: null, includePreference: true };
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return { styles: [], photoDataUrl: null, includePreference: true };
    const parsed = JSON.parse(raw);
    return {
      styles: Array.isArray(parsed.styles) ? parsed.styles : [],
      photoDataUrl:
        typeof parsed.photoDataUrl === 'string' ? parsed.photoDataUrl : null,
      includePreference:
        typeof parsed.includePreference === 'boolean'
          ? parsed.includePreference
          : true,
    };
  } catch {
    return { styles: [], photoDataUrl: null, includePreference: true };
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
    writeState({ ...readState(), photoDataUrl });
  },
  setIncludePreference(includePreference: boolean) {
    writeState({ ...readState(), includePreference });
  },
  reset() {
    if (!isBrowser()) return;
    window.sessionStorage.removeItem(KEY);
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
