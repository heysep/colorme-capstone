'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  extractApiErrorMessage,
  pcApi,
  resolveFileUrl,
  type PcSharedLook,
} from '../api/pc-api';
import { RetryImage } from '../result/RetryImage';

const SEASON_GRADIENTS: Record<string, string> = {
  SPRING_WARM: 'from-orange-400 via-pink-400 to-rose-500',
  SUMMER_COOL: 'from-sky-400 via-blue-400 to-indigo-500',
  AUTUMN_WARM: 'from-amber-500 via-orange-500 to-red-600',
  WINTER_COOL: 'from-slate-500 via-indigo-500 to-fuchsia-600',
};

export function SharedLookView({ shareToken }: { shareToken: string }) {
  const [look, setLook] = useState<PcSharedLook | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    pcApi
      .getSharedLook(shareToken)
      .then(setLook)
      .catch((err) => setError(extractApiErrorMessage(err)));
  }, [shareToken]);

  if (error) {
    return (
      <div className="section-shell">
        <div className="panel-card z-10 mx-auto w-full max-w-xl space-y-6 text-center">
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">
            공유된 룩을 찾을 수 없습니다
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{error}</p>
          <Link href="/" className="inline-block">
            <Button variant="primary" size="lg" className="rounded-2xl font-bold">
              ColorMe 홈으로
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!look) {
    return (
      <div className="section-shell">
        <div className="z-10 flex gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-3 w-3 animate-bounce rounded-full bg-primary"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  const items = [
    { label: '상의', item: look.selectedItems.top },
    { label: '하의', item: look.selectedItems.bottom },
    ...(look.selectedItems.accessory
      ? [{ label: '액세서리', item: look.selectedItems.accessory }]
      : []),
  ];

  return (
    <div className="section-shell">
      <div className="z-10 mx-auto flex w-full max-w-4xl flex-col gap-8">
        <header className="space-y-3 text-center">
          <h1 className="text-gradient text-3xl font-black tracking-tight sm:text-4xl">
            공유된 AI 가상 피팅 룩
          </h1>
          {look.seasonName && (
            <div
              className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${
                SEASON_GRADIENTS[look.seasonCode ?? ''] ?? 'from-primary to-accent'
              } px-5 py-2 text-base font-black text-white shadow-lg`}
            >
              {look.seasonName}
            </div>
          )}
        </header>

        <section className="panel-card space-y-6">
          {look.tryOnImageUrl && (
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-white/10 dark:bg-[var(--color-auth-surface)]">
              <RetryImage
                src={resolveFileUrl(look.tryOnImageUrl) ?? ''}
                alt="가상 피팅 결과"
                className="mx-auto max-h-[560px] w-auto object-contain"
              />
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            {items.map(({ label, item }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-3 dark:border-white/10 dark:bg-white/5"
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-white/5">
                  <RetryImage
                    src={resolveFileUrl(item.imageUrl) ?? ''}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500">{label}</p>
                  <p className="truncate text-sm font-black text-gray-900 dark:text-gray-100">
                    {item.name}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {look.palette && look.palette.colors.length > 0 && (
            <div>
              <p className="mb-3 text-sm font-black text-gray-700 dark:text-gray-200">
                추천 컬러 팔레트
              </p>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                {look.palette.colors.map((c) => (
                  <div key={c.hex} className="flex flex-col items-center gap-2">
                    <div
                      className="h-16 w-full rounded-2xl border border-black/5 shadow-sm dark:border-white/10"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                      {c.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <footer className="flex justify-center">
          <Link href="/analysis/style">
            <Button variant="cta" size="lg" className="rounded-2xl font-black">
              나도 퍼스널 컬러 분석 받아보기 →
            </Button>
          </Link>
        </footer>
      </div>
    </div>
  );
}
