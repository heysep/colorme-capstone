import axios from 'axios';

// 기본 API 설정
// 실제 게이트웨이 포트에 따라 조정 필요 (기본 3000으로 가정)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 임시로 만든거 (2026-04-05)
 * 테넌트코드 및 API 엔드포인트 확인 및 수정 필요 (작동 제대로 안함)
 */
export const loginApi = {
  /**
   * 루트 사용자 로그인
   */
  loginRoot: async (payload: { userId: string; password: string }) => {
    const response = await authApi.post('/v1/login/default/root', payload);
    return response.data;
  },

  /**
   * 테넌트 사용자 로그인 (필요시)
   */
  loginTenant: async (payload: { userId: string; password: string }, tenantCode: string = 'test') => {
    const response = await authApi.post('/v1/login/default/tenant', payload, {
      headers: {
        'X-Tenant-Code': tenantCode,
      },
    });
    return response.data;
  },
};
