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
 * 테넌트 및 로그인 관련 API
 */
export const tenantApi = {
  /**
   * 테넌트 코드로 테넌트 정보 조회
   */
  getTenantByCode: async (code: string) => {
    const response = await authApi.get(`/v1/tenant/default/code/${code}`);
    return response.data;
  },

  /**
   * 도메인으로 테넌트 정보 조회
   */
  getTenantByDomain: async (domain: string) => {
    const response = await authApi.get(`/v1/tenant/default/domain/${domain}`);
    return response.data;
  },
};

export const loginApi = {
  /**
   * 루트 사용자 로그인
   */
  loginRoot: async (payload: { userId: string; password: string }) => {
    const response = await authApi.post('/v1/login/default/root', payload);
    return response.data;
  },

  /**
   * 테넌트 사용자 로그인
   */
  loginTenant: async (payload: { userId: string; password: string }, tenantCode: string) => {
    const response = await authApi.post('/v1/login/default/tenant', payload, {
      headers: {
        'X-Tenant-Code': tenantCode,
      },
    });
    return response.data;
  },
};

