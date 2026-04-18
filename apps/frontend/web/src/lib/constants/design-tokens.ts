/**
 * 디자인 토큰 - UI/UX Pro Max Capstone Project
 * globals.css의 @theme 변수와 동기화
 */

export const designTokens = {
  color: {
    primary: '#6366f1',
    secondary: '#4f46e5',
    accent: '#ec4899',
    background: '#fdfcfd',
    text: '#0a0a0b',
    textMuted: '#64748b',
    success: '#2563eb',
    danger: '#ef4444',
    auth: {
      surface: '#ffffff',
      pageBg: '#fdfcfd',
      inputBg: '#fdfcfd',
      inputBorder: 'rgba(0, 0, 0, 0.05)',
      inputText: '#111827',
      label: '#374151',
      placeholder: '#9ca3af',
      muted: '#9ca3af',
      divider: '#f3f4f6',
    },
  },
  spacing: {
    section: '6rem',
    sectionMobile: '4rem',
  },
  typography: {
    headingFont: 'Outfit',
    bodyFont: 'Inter',
  },
} as const;
