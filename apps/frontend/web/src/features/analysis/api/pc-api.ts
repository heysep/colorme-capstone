/**
 * 퍼스널 컬러 분석 / 가상 피팅 API 클라이언트.
 * 게이트웨이(기본 http://localhost:3300) 경유로 service-personal-color를 호출한다.
 * 인증은 게스트 세션 토큰(x-pc-session-token) 기반.
 */
import axios from 'axios';

export const GATEWAY_ORIGIN =
  process.env.NEXT_PUBLIC_GATEWAY_ORIGIN ?? 'http://localhost:3300';

const PC_BASE = `${GATEWAY_ORIGIN}/api/serv/personal-color/v1/personal-color/default`;

export const SESSION_HEADER = 'x-pc-session-token';

const pcClient = axios.create({ timeout: 30_000 });

/** 백엔드 공통 응답 래퍼 */
type ApiEnvelope<T> = {
  data: T;
  status: number;
  resultCode: string;
  message: string;
};

export type PcAnalysisStatus = 'ANALYZING' | 'COMPLETED' | 'FAILED';
export type PcLookStatus =
  | 'TRYON_PENDING'
  | 'TRYON_PROCESSING'
  | 'TRYON_COMPLETED'
  | 'FAILED';

export type PcPaletteColor = { label: string; hex: string };

export type PcCatalogItem = {
  itemId: number;
  name: string;
  imageUrl: string;
  dominantColorHex: string | null;
  styleTags: string[];
  reason: string;
};

export type PcRecommendations = {
  tops: PcCatalogItem[];
  bottoms: PcCatalogItem[];
  accessories: PcCatalogItem[];
};

export type PcAnalyzeUploadResponse = {
  sessionToken: string;
  analysisId: number;
  status: PcAnalysisStatus;
};

export type PcAnalysisDetail = {
  analysisId: number;
  status: PcAnalysisStatus;
  seasonCode: string | null;
  seasonName: string | null;
  reason: string | null;
  primaryConfidence: number | null;
  seasonScores: Record<string, number> | null;
  estimatedGender: string | null;
  palette: { colors: PcPaletteColor[] } | null;
  recommendations: PcRecommendations | null;
  retryGuide: string[] | null;
};

export type PcTryOnResponse = { lookId: number; status: PcLookStatus };

export type PcSelectedLookItem = Omit<PcCatalogItem, 'reason'>;

export type PcLookDetail = {
  lookId: number;
  status: PcLookStatus;
  tryOnImageUrl: string | null;
  selectedItems: {
    top: PcSelectedLookItem;
    bottom: PcSelectedLookItem;
    accessory: PcSelectedLookItem | null;
  };
  savedYn: boolean;
};

export type PcSharedLook = {
  lookId: number;
  seasonCode: string | null;
  seasonName: string | null;
  tryOnImageUrl: string | null;
  selectedItems: PcLookDetail['selectedItems'];
  palette: { colors: PcPaletteColor[] } | null;
};

/** 백엔드가 주는 상대 경로 이미지 URL을 게이트웨이 절대 경로로 변환 */
export const resolveFileUrl = (url: string | null): string | null => {
  if (!url) return null;
  return url.startsWith('http') ? url : `${GATEWAY_ORIGIN}${url}`;
};

const sessionHeaders = (sessionToken?: string | null) =>
  sessionToken ? { [SESSION_HEADER]: sessionToken } : {};

export const pcApi = {
  /** 얼굴 사진 업로드 + 분석 시작 */
  async uploadForAnalysis(
    photo: Blob,
    sessionToken?: string | null,
  ): Promise<PcAnalyzeUploadResponse> {
    const form = new FormData();
    form.append('photo', photo, 'face.png');
    const res = await pcClient.post<ApiEnvelope<PcAnalyzeUploadResponse>>(
      `${PC_BASE}/analyze/upload`,
      form,
      { headers: sessionHeaders(sessionToken) },
    );
    return res.data.data;
  },

  /** 분석 상태/결과 조회 (폴링용) */
  async getAnalysis(
    analysisId: number,
    sessionToken: string,
  ): Promise<PcAnalysisDetail> {
    const res = await pcClient.get<ApiEnvelope<PcAnalysisDetail>>(
      `${PC_BASE}/analyze/${analysisId}`,
      { headers: sessionHeaders(sessionToken) },
    );
    return res.data.data;
  },

  /** 선택한 의상으로 가상 피팅 생성 */
  async createTryOn(
    body: {
      analysisId: number;
      topItemId: number;
      bottomItemId: number;
      accessoryItemId?: number;
    },
    sessionToken: string,
  ): Promise<PcTryOnResponse> {
    const res = await pcClient.post<ApiEnvelope<PcTryOnResponse>>(
      `${PC_BASE}/looks/try-on`,
      body,
      { headers: sessionHeaders(sessionToken) },
    );
    return res.data.data;
  },

  /** 가상 피팅 상태/결과 조회 (폴링용) */
  async getLook(lookId: number, sessionToken: string): Promise<PcLookDetail> {
    const res = await pcClient.get<ApiEnvelope<PcLookDetail>>(
      `${PC_BASE}/looks/${lookId}`,
      { headers: sessionHeaders(sessionToken) },
    );
    return res.data.data;
  },

  /** 가상 피팅 룩 저장 */
  async saveLook(
    lookId: number,
    sessionToken: string,
    description?: string,
  ): Promise<{ lookId: number; savedYn: boolean }> {
    const res = await pcClient.post<
      ApiEnvelope<{ lookId: number; savedYn: boolean }>
    >(`${PC_BASE}/looks/${lookId}/save`, { description }, {
      headers: sessionHeaders(sessionToken),
    });
    return res.data.data;
  },

  /** 공유 토큰 발급 */
  async shareLook(
    lookId: number,
    sessionToken: string,
  ): Promise<{ lookId: number; shareToken: string; shareUrl: string }> {
    const res = await pcClient.post<
      ApiEnvelope<{ lookId: number; shareToken: string; shareUrl: string }>
    >(`${PC_BASE}/looks/${lookId}/share`, {}, {
      headers: sessionHeaders(sessionToken),
    });
    return res.data.data;
  },

  /** 공유된 룩 조회 (인증 불필요) */
  async getSharedLook(shareToken: string): Promise<PcSharedLook> {
    const res = await pcClient.get<ApiEnvelope<PcSharedLook>>(
      `${PC_BASE}/share/${shareToken}`,
    );
    return res.data.data;
  },
};

/** 서버 에러 응답에서 사용자에게 보여줄 메시지 추출 */
export const extractApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string }
      | undefined;
    if (data?.message) return data.message;
    if (error.code === 'ERR_NETWORK')
      return '서버에 연결할 수 없습니다. 백엔드 실행 상태를 확인해 주세요.';
  }
  return '알 수 없는 오류가 발생했습니다.';
};
