'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

type ThemeOption = {
  value: 'light' | 'dark' | 'system';
  label: string;
  description: string;
  Icon: typeof Sun;
};

const THEME_OPTIONS: ThemeOption[] = [
  {
    value: 'light',
    label: '라이트 모드',
    description: '밝은 배경의 기본 테마를 사용합니다.',
    Icon: Sun,
  },
  {
    value: 'dark',
    label: '다크 모드',
    description: '어두운 배경으로 눈의 피로를 줄입니다.',
    Icon: Moon,
  },
  {
    value: 'system',
    label: '시스템 설정',
    description: '운영체제의 현재 테마를 따라갑니다.',
    Icon: Monitor,
  },
];

export function SettingsView() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="section-shell">
      <div className="z-10 mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
            돌아가기
          </button>
          <h1 className="text-xl font-black text-gray-900 sm:text-2xl dark:text-gray-100">
            설정
          </h1>
          <span className="w-10" aria-hidden />
        </header>

        <section className="panel-card space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-gray-900 dark:text-gray-100">
              테마
            </h2>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              원하는 화면 모드를 선택하세요.
            </p>
          </div>

          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {THEME_OPTIONS.map((opt) => {
              const isSelected = mounted && theme === opt.value;
              const Icon = opt.Icon;
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => setTheme(opt.value)}
                    data-selected={isSelected}
                    aria-pressed={isSelected}
                    className="option-card h-full w-full"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-7 w-7" aria-hidden />
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-base font-black text-gray-900 dark:text-gray-100">
                        {opt.label}
                      </p>
                      <p className="px-1 text-xs font-medium leading-relaxed text-gray-500 dark:text-gray-400">
                        {opt.description}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
