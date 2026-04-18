import { Metadata } from 'next';
import { SignupForm } from '@/features/auth/signup/SignupForm';

export const metadata: Metadata = {
  title: '회원가입 | ColorMe',
  description: 'ColorMe 서비스에 가입하여 나만의 퍼스널 컬러와 가상 피팅을 시작하세요.',
};

export default function SignupPage() {
  return (
    <div className="auth-page-shell">
      <div className="z-10 w-full flex justify-center">
        <SignupForm />
      </div>
    </div>
  );
}
