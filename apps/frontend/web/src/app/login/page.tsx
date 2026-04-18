import { LoginForm } from '@/features/auth/login/LoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '로그인 | ColorMe',
  description: 'ColorMe 서비스에 로그인하여 나만의 퍼스널 컬러와 가상 피팅을 관리하세요.',
};

export default function LoginPage() {
  return (
    <div className="auth-page-shell">
      <div className="z-10 w-full flex justify-center">
        <LoginForm />
      </div>
    </div>
  );
}
