'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import {
  STYLE_OPTIONS,
  type StyleKey,
  analysisStorage,
} from '../lib/analysis-storage';

export function StyleSelectView() {
  const router = useRouter();
  const [selected, setSelected] = useState<StyleKey[]>([]);

  useEffect(() => {
    setSelected(analysisStorage.getState().styles);
  }, []);

  const toggle = (key: StyleKey) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const continueWith = (styles: StyleKey[]) => {
    analysisStorage.setStyles(styles);
    router.push('/analysis/upload');
  };

  return (
    <div className="section-shell">
      <div className="z-10 mx-auto w-full max-w-6xl rounded-[3rem] border border-indigo-50/60 bg-white/60 p-8 shadow-xl shadow-indigo-100/30 backdrop-blur-sm sm:p-12">
      <div className="flex w-full flex-col items-center gap-10">
        <header className="space-y-3 text-center">
          <h1 className="text-gradient text-3xl font-black tracking-tight sm:text-4xl">
            선호하는 스타일을 선택해주세요
          </h1>
          <p className="text-sm font-medium text-gray-500 sm:text-base">
            원하는 스타일을 선택하면 더 정확한 추천을 받을 수 있습니다 (복수 선택 가능)
          </p>
        </header>

        <section className="panel-card">
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STYLE_OPTIONS.map((opt) => {
              const isSelected = selected.includes(opt.key);
              return (
                <li key={opt.key}>
                  <button
                    type="button"
                    onClick={() => toggle(opt.key)}
                    data-selected={isSelected}
                    aria-pressed={isSelected}
                    className="option-card w-full"
                  >
                    {isSelected && (
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
                    <div
                      className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${opt.gradient} text-4xl shadow-lg shadow-black/5`}
                    >
                      <span aria-hidden>{opt.emoji}</span>
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-lg font-black text-gray-900">{opt.label}</p>
                      <p className="text-sm font-medium text-gray-500">
                        {opt.description}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <footer className="flex flex-wrap items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => router.push('/')}
            className="h-14 min-w-32 rounded-2xl text-base font-bold"
          >
            이전으로
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => continueWith([])}
            className="h-14 min-w-32 rounded-2xl text-base font-bold"
          >
            건너뛰기
          </Button>
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={() => continueWith(selected)}
            className="h-14 min-w-40 rounded-2xl text-base font-bold"
          >
            계속하기 ({selected.length})
          </Button>
        </footer>
      </div>
      </div>
    </div>
  );
}
