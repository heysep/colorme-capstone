'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  analysisStorage,
  styleLabel,
  type AnalysisState,
} from '../lib/analysis-storage';
import { authStorage } from '@/features/auth/lib/auth-storage';
import { pickSeason, RECOMMENDED_ITEMS } from './result-data';

export function ResultView() {
  const router = useRouter();
  const [state, setState] = useState<AnalysisState | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setState(analysisStorage.getState());
  }, []);

  const season = useMemo(() => {
    if (!state) return null;
    const seed =
      authStorage.getSession() ??
      state.photoDataUrl?.slice(-24) ??
      'colorme-guest';
    return pickSeason(seed);
  }, [state]);

  if (!state || !season) {
    return <div className="section-shell" />;
  }

  const appliedStyles = state.includePreference ? state.styles : [];

  const visibleItems = appliedStyles.length
    ? RECOMMENDED_ITEMS.filter((i) => appliedStyles.includes(i.style))
        .concat(RECOMMENDED_ITEMS.filter((i) => !appliedStyles.includes(i.style)))
        .slice(0, RECOMMENDED_ITEMS.length)
    : RECOMMENDED_ITEMS;

  const openComingSoon = (feature: string) => setNotice(feature);

  return (
    <div className="section-shell">
      <div className="z-10 mx-auto flex w-full max-w-6xl flex-col gap-8">
        {/* Top back */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              analysisStorage.reset();
              router.push('/');
            }}
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            돌아가기
          </button>
        </div>

        {/* Personal color card */}
        <section className="panel-card">
          <h2 className="mb-6 text-xl font-black text-gray-900 sm:text-2xl dark:text-gray-100">
            당신의 퍼스널 컬러
          </h2>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,260px)_1fr]">
            {/* Uploaded image */}
            <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 dark:border-[var(--color-auth-divider)] dark:bg-white/5">
              {state.photoDataUrl ? (
                <img
                  src={state.photoDataUrl}
                  alt="분석된 이미지"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-64 items-center justify-center text-sm text-gray-400 dark:text-gray-500">
                  이미지 없음
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-center">
                <span className="inline-block rounded-full bg-black/50 px-3 py-1 text-xs font-bold text-white">
                  분석된 이미지
                </span>
              </div>
            </div>

            {/* Season + palette */}
            <div className="space-y-5">
              <div
                className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${season.gradient} px-5 py-2 text-base font-black text-white shadow-lg`}
              >
                {season.label}
              </div>
              <p className="text-base font-medium text-gray-600 dark:text-gray-300">
                {season.description}
              </p>

              <div>
                <p className="mb-3 text-sm font-black text-gray-700 dark:text-gray-200">추천 컬러 팔레트</p>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                  {season.palette.map((c) => (
                    <div key={c.name} className="flex flex-col items-center gap-2">
                      <div
                        className="h-20 w-full rounded-2xl border border-black/5 shadow-sm dark:border-white/10"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                        {c.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recommended outfits */}
        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black text-gray-900 sm:text-2xl dark:text-gray-100">
              추천 스타일 코디
            </h2>
            {appliedStyles.length > 0 && (
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                선호도 반영됨:
                <span className="flex gap-1">
                  {appliedStyles.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-primary/15 px-2 py-0.5"
                    >
                      {styleLabel(s)}
                    </span>
                  ))}
                </span>
              </div>
            )}
          </div>

          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {visibleItems.map((item) => (
              <li
                key={item.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-[var(--color-auth-divider)] dark:bg-[var(--color-auth-surface)]"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100 dark:bg-white/5">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute right-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white shadow">
                    {styleLabel(item.style)}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div>
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500">{item.brand}</p>
                    <p className="mt-0.5 text-base font-black text-gray-900 dark:text-gray-100">
                      {item.name}
                    </p>
                    <p className="mt-1 text-sm font-bold text-gray-700 dark:text-gray-300">
                      {item.price}
                    </p>
                  </div>
                  <div className="mt-auto flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => openComingSoon('가상 피팅')}
                      className="h-11 w-full cursor-pointer rounded-xl bg-primary text-sm font-bold text-white transition-all hover:opacity-95 active:scale-[0.99]"
                    >
                      가상 피팅
                    </button>
                    <button
                      type="button"
                      onClick={() => openComingSoon('구매하기')}
                      className="h-11 w-full cursor-pointer rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-800 transition-all hover:border-primary/30 hover:bg-gray-50 active:scale-[0.99] dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10"
                    >
                      구매하기
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Actions */}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-6 dark:border-[var(--color-auth-divider)]">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => openComingSoon('공유')}
              className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-700 transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10"
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
                  d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                />
              </svg>
              공유
            </button>
            <button
              type="button"
              onClick={() => openComingSoon('저장')}
              className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-700 transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10"
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
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
              저장
            </button>
          </div>
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={() => {
              analysisStorage.reset();
              router.push('/analysis/style');
            }}
            className="flex h-12 items-center justify-center rounded-2xl px-6 py-0 text-base font-bold leading-none"
          >
            새로운 분석 시작하기
          </Button>
        </footer>
      </div>

      <Modal
        isOpen={!!notice}
        onClose={() => setNotice(null)}
        title="구현 준비중입니다."
        description={`현재 ${notice ?? ''} 기능은 개발 중이며\n곧 제공될 예정입니다.`}
      />
    </div>
  );
}
