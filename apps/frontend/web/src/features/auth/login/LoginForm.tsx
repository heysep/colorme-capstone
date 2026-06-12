'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { authStorage } from '../lib/auth-storage';
import { analysisStorage } from '@/features/analysis/lib/analysis-storage';
import { extractApiErrorMessage, pcAuthApi } from '@/features/analysis/api/pc-api';
import Image from 'next/image';
import googleLogo from '@/assets/icons/googleLogo.png';
import naverLogo from '@/assets/icons/naverLogo.png';
import Link from 'next/link';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', description: '' });

  const openInfoModal = (title: string, description: string) => {
    setModalContent({ title, description });
    setIsModalOpen(true);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const profile = await pcAuthApi.login({ userId: email, password });

      authStorage.setMemberSession(profile);
      // 분석 플로우를 회원 세션 토큰으로 초기화
      analysisStorage.reset();
      analysisStorage.adoptSessionToken(profile.sessionToken);
      router.push('/analysis/style');
    } catch (error) {
      openInfoModal('로그인 실패', extractApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const openComingSoonModal = (featureName: string) => {
    openInfoModal(
      '구현 준비중입니다.',
      `현재 ${featureName} 기능은 개발 중이며\n곧 제공될 예정입니다.`
    );
  };

  return (
    <div className="auth-card space-y-6 p-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <Link href="/" className="inline-block cursor-pointer">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.4rem] bg-gradient-to-br from-primary to-accent p-0.5 shadow-xl shadow-primary/20 transition-transform hover:scale-105 active:scale-95">
             <div className="flex h-full w-full items-center justify-center rounded-[1.2rem] bg-white text-3xl dark:bg-[var(--color-auth-surface)]">
                🎨
             </div>
          </div>
        </Link>
        <h1 className="text-2xl font-black tracking-tighter text-gray-900 dark:text-gray-100">
          ColorMe <span className="text-primary italic">로그인</span>
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="이메일을 입력해 주세요"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
             <label htmlFor="password" title="Password" className="text-sm font-semibold text-[var(--color-auth-label)]">Password</label>
             <button
               type="button"
               onClick={() => openComingSoonModal('비밀번호 찾기')}
               className="cursor-pointer text-xs font-bold text-primary hover:underline"
             >
               비밀번호를 잊으셨나요?
             </button>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="비밀번호를 입력해 주세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          variant="primary"
          size="xl"
          className="h-14 w-full cursor-pointer rounded-2xl text-lg font-black shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95"
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center py-1">
        <div className="flex-grow border-t border-gray-100 dark:border-[var(--color-auth-divider)]"></div>
        <span className="mx-4 flex-shrink text-xs font-bold text-gray-300 uppercase tracking-widest dark:text-gray-500">OR</span>
        <div className="flex-grow border-t border-gray-100 dark:border-[var(--color-auth-divider)]"></div>
      </div>

      {/* Social Login */}
      <div className="grid grid-cols-1 gap-3">
        <button
          type="button"
          onClick={() => openComingSoonModal('Google 로그인')}
          className="flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-gray-50 bg-[var(--color-auth-input-bg)] px-4 font-bold text-[var(--color-auth-label)] transition-all hover:bg-gray-50 hover:border-gray-100 active:scale-95 dark:border-white/5 dark:hover:bg-white/5 dark:hover:border-white/10"
        >
          <Image src={googleLogo} alt="Google" width={20} height={20} />
          <span>Continue with Google</span>
        </button>
        <button
          type="button"
          onClick={() => openComingSoonModal('Naver 로그인')}
          className="flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-gray-50 bg-[var(--color-auth-input-bg)] px-4 font-bold text-[var(--color-auth-label)] transition-all hover:bg-gray-50 hover:border-gray-100 active:scale-95 dark:border-white/5 dark:hover:bg-white/5 dark:hover:border-white/10"
        >
          <Image src={naverLogo} alt="Naver" width={20} height={20} />
          <span>Continue with Naver</span>
        </button>
      </div>

      {/* Footer */}
      <div className="pt-2 text-center">
        <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
          계정이 없으신가요?{' '}
          <Link
            href="/signup"
            className="cursor-pointer font-bold text-primary hover:underline"
          >
            회원가입
          </Link>
        </p>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalContent.title}
        description={modalContent.description}
      />
    </div>
  );
}
