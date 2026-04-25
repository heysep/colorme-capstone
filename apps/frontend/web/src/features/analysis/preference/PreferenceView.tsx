'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import {
  analysisStorage,
  styleLabel,
  type StyleKey,
} from '../lib/analysis-storage';

type Mode = 'include' | 'exclude';

export function PreferenceView() {
  const router = useRouter();
  const [selected, setSelected] = useState<Mode>('include');
  const [styles, setStyles] = useState<StyleKey[]>([]);

  useEffect(() => {
    const state = analysisStorage.getState();
    setStyles(state.styles);
    setSelected(state.includePreference ? 'include' : 'exclude');
    // 스타일이 하나도 없으면 자동으로 '퍼스널 컬러만'이 합리적
    if (state.styles.length === 0) setSelected('exclude');
  }, []);

  const handleSubmit = () => {
    analysisStorage.setIncludePreference(selected === 'include');
    router.push('/analysis/result');
  };

  const includeDisabled = styles.length === 0;

  return (
    <div className="section-shell">
      <div className="z-10 mx-auto flex w-full max-w-4xl flex-col items-center gap-10">
        <header className="space-y-3 text-center">
          <h1 className="text-gradient text-3xl font-black tracking-tight sm:text-4xl">
            선호도를 코디 추천에 반영할까요?
          </h1>
          <p className="text-sm font-medium text-gray-500 sm:text-base dark:text-gray-400">
            선택한 스타일 선호도를 바탕으로 맞춤형 코디를 추천받을 수 있습니다
          </p>
        </header>

        <section className="panel-card">
          <ul className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* 선호도 포함 */}
            <li>
              <button
                type="button"
                onClick={() =>
                  !includeDisabled ? setSelected('include') : void 0
                }
                disabled={includeDisabled}
                data-selected={selected === 'include'}
                className="option-card h-full w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {selected === 'include' && !includeDisabled && (
                  <span className="option-check">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                      className="h-4 w-4"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </span>
                )}
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-400 to-pink-500 text-4xl shadow-lg shadow-black/5">
                  <span aria-hidden>✨</span>
                </div>
                <div className="mt-2 space-y-1">
                  <p className="text-lg font-black text-gray-900 dark:text-gray-100">선호도 포함</p>
                  <p className="px-2 text-sm font-medium leading-relaxed text-gray-500 dark:text-gray-400">
                    퍼스널 컬러와 선택한 스타일을 모두 반영한 맞춤형 코디를 추천합니다
                  </p>
                </div>
                <div className="mt-3 w-full rounded-2xl bg-gray-50 p-4 dark:bg-white/5">
                  <p className="mb-2 text-xs font-bold text-gray-400 dark:text-gray-500">선택한 스타일:</p>
                  {styles.length > 0 ? (
                    <div className="flex flex-wrap justify-center gap-2">
                      {styles.map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary"
                        >
                          {styleLabel(s)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
                      선택된 스타일이 없습니다
                    </p>
                  )}
                </div>
              </button>
            </li>

            {/* 퍼스널 컬러만 */}
            <li>
              <button
                type="button"
                onClick={() => setSelected('exclude')}
                data-selected={selected === 'exclude'}
                className="option-card h-full w-full"
              >
                {selected === 'exclude' && (
                  <span className="option-check">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                      className="h-4 w-4"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </span>
                )}
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-500 text-4xl shadow-lg shadow-black/5">
                  <span aria-hidden>🎯</span>
                </div>
                <div className="mt-2 space-y-1">
                  <p className="text-lg font-black text-gray-900 dark:text-gray-100">퍼스널 컬러만</p>
                  <p className="px-2 text-sm font-medium leading-relaxed text-gray-500 dark:text-gray-400">
                    퍼스널 컬러에 기반한 다양한 스타일의 코디를 추천합니다
                  </p>
                </div>
                <div className="mt-3 w-full rounded-2xl bg-gray-50 p-4 dark:bg-white/5">
                  <p className="text-xs font-medium leading-relaxed text-gray-500 dark:text-gray-400">
                    선호도를 제외하고 퍼스널 컬러에 어울리는 모든 스타일을 볼 수 있습니다
                  </p>
                </div>
              </button>
            </li>
          </ul>
        </section>

        <footer className="flex flex-wrap items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => router.push('/analysis/upload')}
            className="h-14 min-w-32 rounded-2xl text-base font-bold"
          >
            이전으로
          </Button>
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={handleSubmit}
            className="h-14 min-w-40 rounded-2xl text-base font-bold"
          >
            결과 보기
          </Button>
        </footer>
      </div>
    </div>
  );
}
