'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import googleLogo from '@/assets/icons/googleLogo.png';
import naverLogo from '@/assets/icons/naverLogo.png';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { COUNTRIES, type CountryCode, authStorage } from '../lib/auth-storage';
import { analysisStorage } from '@/features/analysis/lib/analysis-storage';
import { extractApiErrorMessage, pcAuthApi } from '@/features/analysis/api/pc-api';

type FormState = {
  email: string;
  password: string;
  passwordConfirm: string;
  username: string;
  country: CountryCode | '';
};

const PASSWORD_POLICY_TEXT =
  '비밀번호는 8자 이상면서 영어와 숫자 및 특수문자를\n포함하여야 합니다.';
const USERNAME_POLICY_TEXT =
  '사용자명은 영숫자 또는 하이픈만 포함할 수 있으며,\n하이픈으로 시작하거나 끝날 수 없습니다.';

const USERNAME_REGEX = /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/;

function validatePassword(pw: string): boolean {
  return (
    pw.length >= 8 &&
    /[A-Za-z]/.test(pw) &&
    /[0-9]/.test(pw) &&
    /[^A-Za-z0-9]/.test(pw)
  );
}

export function SignupForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    email: '',
    password: '',
    passwordConfirm: '',
    username: '',
    country: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState({
    title: '',
    description: '',
  });
  const [comingSoon, setComingSoon] = useState<string | null>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const passwordMatch = useMemo(() => {
    if (!form.passwordConfirm) return 'empty' as const;
    return form.password === form.passwordConfirm ? 'match' : 'mismatch';
  }, [form.password, form.passwordConfirm]);

  const canSubmit =
    !submitting &&
    !!form.email &&
    !!form.password &&
    !!form.passwordConfirm &&
    !!form.username &&
    !!form.country &&
    passwordMatch === 'match';

  const openError = (title: string, description: string) => {
    setErrorMessage({ title, description });
    setErrorOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    if (!validatePassword(form.password)) {
      openError('비밀번호 규칙 미충족', PASSWORD_POLICY_TEXT);
      return;
    }
    if (!USERNAME_REGEX.test(form.username)) {
      openError('사용자명 형식 오류', USERNAME_POLICY_TEXT);
      return;
    }

    setSubmitting(true);
    try {
      // 게스트로 분석한 이력이 있으면 그 세션을 계정으로 승계
      const guestToken = analysisStorage.getState().sessionToken;
      const profile = await pcAuthApi.signup(
        {
          userId: form.email,
          password: form.password,
          userName: form.username,
          userCountry: form.country || undefined,
        },
        guestToken,
      );

      // 가입 즉시 로그인 상태로 전환
      authStorage.setMemberSession(profile);
      analysisStorage.adoptSessionToken(profile.sessionToken);
      setSuccessOpen(true);
    } catch (err) {
      openError('회원가입 실패', extractApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const goHome = () => {
    setSuccessOpen(false);
    router.push('/');
  };

  const goAnalysis = () => {
    setSuccessOpen(false);
    router.push('/analysis/style');
  };

  return (
    <>
      <div className="auth-card space-y-8">
        {/* Top-right Sign in link */}
        <div className="flex items-center justify-end text-sm">
          <span className="text-gray-400 dark:text-gray-500">
            이미 계정이 있으신가요?
          </span>
          <Link
            href="/login"
            className="ml-2 font-bold text-primary hover:underline"
          >
            Sign in →
          </Link>
        </div>

        {/* Header */}
        <div className="text-center space-y-6">
          <Link href="/" className="inline-block cursor-pointer">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-accent p-0.5 shadow-xl shadow-primary/20 transition-transform hover:scale-105 active:scale-95">
              <div className="flex h-full w-full items-center justify-center rounded-[1.4rem] bg-white text-4xl dark:bg-[var(--color-auth-surface)]">
                🎨
              </div>
            </div>
          </Link>
          <h1 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-gray-100">
            ColorMe <span className="text-primary italic">회원가입</span>
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="signup-email"
            label="이메일"
            type="email"
            autoComplete="email"
            placeholder="이메일을 입력해 주세요"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            required
          />

          <div className="space-y-2">
            <Input
              id="signup-password"
              label="비밀번호"
              type="password"
              autoComplete="new-password"
              placeholder="비밀번호를 입력해 주세요"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              required
            />
            <p className="px-1 text-xs text-gray-400 dark:text-gray-500 whitespace-pre-line">
              {PASSWORD_POLICY_TEXT}
            </p>
          </div>

          <div className="space-y-2">
            <Input
              id="signup-password-confirm"
              label="비밀번호 확인"
              type="password"
              autoComplete="new-password"
              placeholder="비밀번호를 다시 입력해 주세요"
              value={form.passwordConfirm}
              onChange={(e) => update('passwordConfirm', e.target.value)}
              required
              aria-invalid={passwordMatch === 'mismatch'}
            />
            {passwordMatch === 'mismatch' && (
              <p className="px-1 text-xs font-semibold text-[color:var(--color-danger)]">
                비밀번호가 일치하지 않습니다.
              </p>
            )}
            {passwordMatch === 'match' && (
              <p className="px-1 text-xs font-semibold text-[color:var(--color-success)]">
                비밀번호가 일치합니다.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Input
              id="signup-username"
              label="사용자명"
              type="text"
              autoComplete="username"
              placeholder="사용자명을 입력해 주세요"
              value={form.username}
              onChange={(e) => update('username', e.target.value)}
              required
            />
            <p className="px-1 text-xs text-gray-400 dark:text-gray-500 whitespace-pre-line">
              {USERNAME_POLICY_TEXT}
            </p>
          </div>

          <div className="flex w-full flex-col gap-2">
            <label
              htmlFor="signup-country"
              className="text-sm font-semibold text-[var(--color-auth-label)] select-none"
            >
              국가
            </label>
            <select
              id="signup-country"
              value={form.country}
              onChange={(e) =>
                update('country', e.target.value as CountryCode | '')
              }
              required
              data-placeholder={form.country === '' ? 'true' : 'false'}
              className="auth-select"
            >
              <option value="" disabled>
                국가를 선택해 주세요
              </option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="submit"
            disabled={!canSubmit}
            variant="primary"
            size="xl"
            className="h-16 w-full cursor-pointer rounded-2xl text-xl font-black shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95"
          >
            {submitting ? '계정 생성 중...' : '계정 만들기'}
          </Button>

          <p className="pt-2 text-center text-xs font-medium text-gray-400 dark:text-gray-500">
            계정을 만들면{' '}
            <span className="font-bold text-primary">서비스 약관</span> 및{' '}
            <span className="font-bold text-primary">개인정보 보호정책</span>에
            <br />
            동의하는 것으로 간주됩니다.
          </p>
        </form>
      </div>

      <ConfirmModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="회원가입이 완료되었습니다."
        description={'가입한 계정으로 자동 로그인되었습니다.\n바로 퍼스널 컬러 분석을 시작해 볼까요?'}
        secondaryAction={{
          label: '메인페이지로 이동',
          variant: 'outline',
          onClick: goHome,
        }}
        primaryAction={{
          label: '분석 시작하기',
          variant: 'primary',
          onClick: goAnalysis,
        }}
      />

      <Modal
        isOpen={errorOpen}
        onClose={() => setErrorOpen(false)}
        title={errorMessage.title}
        description={errorMessage.description}
      />

      <Modal
        isOpen={!!comingSoon}
        onClose={() => setComingSoon(null)}
        title="구현 준비중입니다."
        description={`현재 ${comingSoon ?? ''} 기능은 개발 중이며\n곧 제공될 예정입니다.`}
      />
    </>
  );
}
