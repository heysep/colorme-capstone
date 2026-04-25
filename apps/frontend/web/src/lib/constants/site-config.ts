/**
 * 사이트 메타, CTA 텍스트 등 설정
 */

export const siteConfig = {
  brand: 'ColorMe',
  tagline: 'AI로 나만의 색과 스타일 찾기',
  valueProp:
    '패션·뷰티 도메인에 특화된 AI 기반 개인화 서비스를 제공합니다.',
  ctaLabel: '시작하기',
  features: [
    {
      title: 'AI 퍼스널 컬러 진단',
      description:
        '사용자 사진과 피부톤 분석을 통해 나에게 어울리는 퍼스널 컬러를 추천합니다.',
    },
    {
      title: '가상 피팅',
      description:
        'AI 기반 옷 가상 착용 시연으로 구매 전 스타일을 미리 확인하세요.',
    },
    {
      title: '패션·뷰티 개인화',
      description:
        '당신만의 컬러와 스타일에 맞는 맞춤형 추천을 제공합니다.',
    },
  ],
  footer: {
    copyright: '© ColorMe. All rights reserved.',
  },
} as const;
