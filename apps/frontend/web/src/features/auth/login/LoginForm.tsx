'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { loginApi } from '../api/auth-api';
import Image from 'next/image';
import googleLogo from '@/assets/icons/googleLogo.png';
import naverLogo from '@/assets/icons/naverLogo.png';
import Link from 'next/link';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', description: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // 사용자 요청에 따라 root 로그인 시도
      const result = await loginApi.loginRoot({ userId: email, password });
      console.log('로그인 성공:', result);
      alert('로그인에 성공했습니다!');
      // TODO: 토큰 저장 및 메인 페이지 또는 대시보드로 이동 로직 추가
    } catch (error: any) {
      console.error('로그인 실패:', error);
      alert(`로그인 실패: ${error.response?.data?.message || '알 수 없는 오류가 발생했습니다.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const openComingSoonModal = (featureName: string) => {
    setModalContent({
      title: '구현 준비중입니다.',
      description: `현재 ${featureName} 기능은 개발 중이며\n곧 제공될 예정입니다.`,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="w-full max-w-md space-y-10 rounded-[3rem] bg-white p-10 shadow-2xl shadow-indigo-100/50 border border-indigo-50/50 transition-all hover:shadow-indigo-200/40">
      {/* Header */}
      <div className="text-center space-y-6">
        <Link href="/" className="inline-block cursor-pointer">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-accent p-0.5 shadow-xl shadow-primary/20 transition-transform hover:scale-105 active:scale-95">
             <div className="flex h-full w-full items-center justify-center rounded-[1.4rem] bg-white text-4xl">
                🎨
             </div>
          </div>
        </Link>
        <h1 className="text-3xl font-black tracking-tighter text-gray-900">
          ColorMe <span className="text-primary italic">로그인</span>
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-6">
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
             <label htmlFor="password" title="Password" className="text-sm font-semibold text-gray-700">Password</label>
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
          className="h-16 w-full cursor-pointer rounded-2xl text-xl font-black shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95"
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center py-4">
        <div className="flex-grow border-t border-gray-100"></div>
        <span className="mx-4 flex-shrink text-xs font-bold text-gray-300 uppercase tracking-widest">OR</span>
        <div className="flex-grow border-t border-gray-100"></div>
      </div>

      {/* Social Login */}
      <div className="grid grid-cols-1 gap-4">
        <button
          type="button"
          onClick={() => openComingSoonModal('Google 로그인')}
          className="flex h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-gray-50 bg-[#fdfcfd] px-4 font-bold text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-100 active:scale-95"
        >
          <Image src={googleLogo} alt="Google" width={20} height={20} />
          <span>Continue with Google</span>
        </button>
        <button
          type="button"
          onClick={() => openComingSoonModal('Naver 로그인')}
          className="flex h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-gray-50 bg-[#fdfcfd] px-4 font-bold text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-100 active:scale-95"
        >
          <Image src={naverLogo} alt="Naver" width={20} height={20} />
          <span>Continue with Naver</span>
        </button>
      </div>

      {/* Footer */}
      <div className="pt-4 text-center">
        <p className="text-sm font-medium text-gray-400">
          계정이 없으신가요?{' '}
          <button
            type="button"
            onClick={() => openComingSoonModal('회원가입')}
            className="cursor-pointer font-bold text-primary hover:underline"
          >
            회원가입
          </button>
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
