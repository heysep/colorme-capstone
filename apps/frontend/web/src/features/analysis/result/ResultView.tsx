'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import {
  analysisStorage,
  type AnalysisState,
} from '../lib/analysis-storage';
import {
  extractApiErrorMessage,
  pcApi,
  type PcAnalysisDetail,
  type PcCatalogItem,
} from '../api/pc-api';
import { RecommendationSection, type TryOnSelection } from './RecommendationSection';
import { TryOnPanel } from './TryOnPanel';

const POLL_INTERVAL_MS = 2500;
const POLL_TIMEOUT_MS = 90_000;

const SEASON_GRADIENTS: Record<string, string> = {
  SPRING_WARM: 'from-orange-400 via-pink-400 to-rose-500',
  SUMMER_COOL: 'from-sky-400 via-blue-400 to-indigo-500',
  AUTUMN_WARM: 'from-amber-500 via-orange-500 to-red-600',
  WINTER_COOL: 'from-slate-500 via-indigo-500 to-fuchsia-600',
};

const SEASON_SCORE_LABELS: Record<string, string> = {
  SPRING_WARM: '봄 웜톤',
  SUMMER_COOL: '여름 쿨톤',
  AUTUMN_WARM: '가을 웜톤',
  WINTER_COOL: '겨울 쿨톤',
};

type Phase = 'preparing' | 'analyzing' | 'failed' | 'completed' | 'error';

export function ResultView() {
  const router = useRouter();
  const [state, setState] = useState<AnalysisState | null>(null);
  const [phase, setPhase] = useState<Phase>('preparing');
  const [analysis, setAnalysis] = useState<PcAnalysisDetail | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selection, setSelection] = useState<TryOnSelection>({
    top: null,
    bottom: null,
    accessory: null,
  });
  const startedRef = useRef(false);

  const runAnalysisFlow = useCallback(async (current: AnalysisState) => {
    try {
      let { sessionToken, analysisId } = current;

      // 1) 아직 서버 분석이 시작되지 않았다면 사진 업로드로 시작
      if (!analysisId) {
        if (!current.photoDataUrl) {
          router.replace('/analysis/upload');
          return;
        }
        setPhase('preparing');
        const photoBlob = await (await fetch(current.photoDataUrl)).blob();
        const uploaded = await pcApi.uploadForAnalysis(photoBlob, sessionToken);
        sessionToken = uploaded.sessionToken;
        analysisId = uploaded.analysisId;
        analysisStorage.setAnalysisSession(sessionToken, analysisId);
        setState(analysisStorage.getState());
      }

      if (!sessionToken || !analysisId) {
        router.replace('/analysis/upload');
        return;
      }

      // 2) 분석 완료까지 폴링
      setPhase('analyzing');
      const startedAt = Date.now();
      for (;;) {
        const detail = await pcApi.getAnalysis(analysisId, sessionToken);
        if (detail.status === 'COMPLETED') {
          setAnalysis(detail);
          setPhase('completed');
          return;
        }
        if (detail.status === 'FAILED') {
          setAnalysis(detail);
          setPhase('failed');
          return;
        }
        if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
          setErrorMessage(
            '분석 처리 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.',
          );
          setPhase('error');
          return;
        }
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      }
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error));
      setPhase('error');
    }
  }, [router]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const current = analysisStorage.getState();
    setState(current);
    if (!current.photoDataUrl && !current.analysisId) {
      router.replace('/analysis/upload');
      return;
    }
    void runAnalysisFlow(current);
  }, [router, runAnalysisFlow]);

  const handleSelect = (slot: keyof TryOnSelection, item: PcCatalogItem) => {
    setSelection((prev) => ({
      ...prev,
      // 같은 아이템을 다시 누르면 선택 해제
      [slot]: prev[slot]?.itemId === item.itemId ? null : item,
    }));
  };

  const retryFromUpload = () => {
    analysisStorage.clearAnalysis();
    analysisStorage.setPhoto(null);
    router.push('/analysis/upload');
  };

  // 선택한 스타일 선호는 유지하고 사진/분석만 비워 바로 재촬영으로 보낸다.
  const startNewAnalysis = () => {
    analysisStorage.clearAnalysis();
    analysisStorage.setPhoto(null);
    router.push('/analysis/upload');
  };

  if (!state) {
    return <div className="section-shell" />;
  }

  const appliedStyles = state.includePreference ? state.styles : [];

  return (
    <div className="section-shell">
      <div className="z-10 mx-auto flex w-full max-w-6xl flex-col gap-8">
        {/* Top bar */}
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
            돌아가기
          </button>

          {phase === 'completed' && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={startNewAnalysis}
              className="flex items-center gap-2 rounded-full px-5 font-bold"
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
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
              다른 사진으로 새 분석
            </Button>
          )}
        </div>

        {/* 분석 진행 중 */}
        {(phase === 'preparing' || phase === 'analyzing') && (
          <section className="panel-card">
            <div className="flex flex-col items-center gap-6 py-10">
              {state.photoDataUrl && (
                <div className="relative h-44 w-44 overflow-hidden rounded-[2rem] border-4 border-primary/20 shadow-xl shadow-primary/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={state.photoDataUrl}
                    alt="분석 중인 사진"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-x-0 top-0 h-1 animate-pulse bg-gradient-to-r from-primary to-accent" />
                </div>
              )}
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-3 w-3 animate-bounce rounded-full bg-primary"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <div className="space-y-2 text-center">
                <h1 className="text-gradient text-2xl font-black tracking-tight sm:text-3xl">
                  {phase === 'preparing'
                    ? '사진을 업로드하고 있어요'
                    : 'AI가 퍼스널 컬러를 분석하고 있어요'}
                </h1>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  피부톤·명도·채도·대비를 종합해 가장 어울리는 시즌을 찾는 중입니다.
                  <br />
                  최대 1분 정도 걸릴 수 있어요.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* 분석 실패 (사진 부적합) */}
        {phase === 'failed' && (
          <section className="panel-card space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl dark:text-gray-100">
                사진을 다시 선택해 주세요
              </h1>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                업로드한 사진으로는 정확한 분석이 어려워요. 아래 가이드를 참고해 주세요.
              </p>
            </div>
            <ul className="space-y-2">
              {(analysis?.retryGuide ?? [
                '자연광 아래에서 얼굴 전체가 선명하게 보이도록 촬영해주세요.',
              ]).map((guide) => (
                <li
                  key={guide}
                  className="flex gap-3 rounded-2xl border border-amber-100 bg-amber-50/60 p-4 dark:border-amber-500/30 dark:bg-amber-500/10"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m0 3.75h.008M3.75 19.5h16.5L12 4.5 3.75 19.5Z"
                    />
                  </svg>
                  <span className="text-sm font-medium leading-relaxed text-gray-700 dark:text-gray-300">
                    {guide}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex justify-center">
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={retryFromUpload}
                className="h-14 min-w-48 rounded-2xl text-base font-bold"
              >
                새 사진으로 다시 분석
              </Button>
            </div>
          </section>
        )}

        {/* 네트워크/서버 오류 */}
        {phase === 'error' && (
          <section className="panel-card space-y-6 text-center">
            <h1 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl dark:text-gray-100">
              결과를 불러오지 못했습니다
            </h1>
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              {errorMessage}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => window.location.reload()}
                className="h-14 min-w-36 rounded-2xl text-base font-bold"
              >
                다시 시도
              </Button>
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={retryFromUpload}
                className="h-14 min-w-36 rounded-2xl text-base font-bold"
              >
                새 사진 업로드
              </Button>
            </div>
          </section>
        )}

        {/* 분석 완료 */}
        {phase === 'completed' && analysis && (
          <>
            <section className="panel-card">
              <h2 className="mb-6 text-xl font-black text-gray-900 sm:text-2xl dark:text-gray-100">
                당신의 퍼스널 컬러
              </h2>

              <div className="grid gap-8 lg:grid-cols-[minmax(0,260px)_1fr]">
                {/* 분석한 사진 */}
                <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 dark:border-[var(--color-auth-divider)] dark:bg-white/5">
                  {state.photoDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
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

                {/* 시즌 + 팔레트 + 점수 */}
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <div
                      className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${
                        SEASON_GRADIENTS[analysis.seasonCode ?? ''] ??
                        'from-primary to-accent'
                      } px-5 py-2 text-base font-black text-white shadow-lg`}
                    >
                      {analysis.seasonName ?? '분석 결과'}
                    </div>
                    {analysis.primaryConfidence !== null && (
                      <span className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary">
                        {/* decimal 컬럼이 문자열로 직렬화될 수 있어 Number 변환 */}
                        신뢰도 {Math.round(Number(analysis.primaryConfidence))}%
                      </span>
                    )}
                  </div>

                  {analysis.reason && (
                    <p className="text-base font-medium leading-relaxed text-gray-600 dark:text-gray-300">
                      {analysis.reason}
                    </p>
                  )}

                  {analysis.palette && analysis.palette.colors.length > 0 && (
                    <div>
                      <p className="mb-3 text-sm font-black text-gray-700 dark:text-gray-200">
                        추천 컬러 팔레트
                      </p>
                      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                        {analysis.palette.colors.map((c) => (
                          <div key={c.hex} className="flex flex-col items-center gap-2">
                            <div
                              className="h-20 w-full rounded-2xl border border-black/5 shadow-sm dark:border-white/10"
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

                  {analysis.seasonScores && (
                    <div>
                      <p className="mb-3 text-sm font-black text-gray-700 dark:text-gray-200">
                        시즌별 분석 점수
                      </p>
                      <div className="space-y-2">
                        {Object.entries(analysis.seasonScores)
                          .sort((a, b) => b[1] - a[1])
                          .map(([code, score]) => (
                            <div key={code} className="flex items-center gap-3">
                              <span className="w-20 shrink-0 text-xs font-bold text-gray-500 dark:text-gray-400">
                                {SEASON_SCORE_LABELS[code] ?? code}
                              </span>
                              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                                <div
                                  className={`h-full rounded-full bg-gradient-to-r ${
                                    SEASON_GRADIENTS[code] ?? 'from-primary to-accent'
                                  }`}
                                  style={{ width: `${Math.min(100, Math.max(2, score))}%` }}
                                />
                              </div>
                              <span className="w-10 shrink-0 text-right text-xs font-bold text-gray-600 dark:text-gray-300">
                                {Math.round(score)}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {analysis.recommendations && (
              <RecommendationSection
                recommendations={analysis.recommendations}
                preferredStyles={appliedStyles}
                selection={selection}
                onSelect={handleSelect}
              />
            )}

            {state.sessionToken && (
              <TryOnPanel
                analysisId={analysis.analysisId}
                sessionToken={state.sessionToken}
                selection={selection}
              />
            )}

          </>
        )}
      </div>
    </div>
  );
}
