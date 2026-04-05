import { LoginForm } from '@/features/auth/login/LoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '로그인 | ColorMe',
  description: 'ColorMe 서비스에 로그인하여 나만의 퍼스널 컬러와 가상 피팅을 관리하세요.',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fdfcfd] px-6 py-20">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      <div className="z-10 w-full flex justify-center">
        <LoginForm />
      </div>
    </div>
  );
}
