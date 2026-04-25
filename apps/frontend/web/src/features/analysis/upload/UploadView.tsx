'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { analysisStorage } from '../lib/analysis-storage';
import { CameraCaptureModal } from './CameraCaptureModal';
import { analyzeImage, type QualityReport } from './image-quality';

const NOTICE_ITEMS = [
  '본 서비스의 퍼스널 컬러 진단 및 의상 추천은 AI 분석 결과로, 의학적·전문가 진단이 아닙니다.',
  '조명, 카메라, 화장, 필터 등에 따라 결과가 달라질 수 있습니다.',
  '추천된 색상·상품은 참고용이며, 실제 구매 결정은 사용자 본인의 판단에 따릅니다.',
  '업로드한 사진은 AI 분석 목적 외에는 저장·공유되지 않습니다.',
];

export function UploadView() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorContent, setErrorContent] = useState({ title: '', description: '' });
  const [quality, setQuality] = useState<QualityReport | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const saved = analysisStorage.getState().photoDataUrl;
    if (saved) {
      setPreview(saved);
      runQualityCheck(saved);
    }
    // 최초 1회
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openError = (title: string, description: string) => {
    setErrorContent({ title, description });
    setErrorOpen(true);
  };

  const runQualityCheck = async (dataUrl: string) => {
    setChecking(true);
    setQuality(null);
    try {
      const report = await analyzeImage(dataUrl);
      setQuality(report);
    } catch {
      setQuality(null);
    } finally {
      setChecking(false);
    }
  };

  const acceptImage = async (dataUrl: string) => {
    setPreview(dataUrl);
    analysisStorage.setPhoto(dataUrl);
    await runQualityCheck(dataUrl);
  };

  const resetImage = () => {
    setPreview(null);
    setQuality(null);
    analysisStorage.setPhoto(null);
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      openError('지원되지 않는 파일', '이미지 파일만 업로드할 수 있습니다.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') acceptImage(result);
    };
    reader.onerror = () => openError('업로드 실패', '파일을 읽을 수 없습니다.');
    reader.readAsDataURL(file);
  };

  const handleCapture = (dataUrl: string) => {
    acceptImage(dataUrl);
    setCameraOpen(false);
  };

  const handleNext = () => {
    if (!preview) {
      openError('사진이 필요합니다', '사진을 업로드하거나 촬영한 뒤 진행해주세요.');
      return;
    }
    if (quality?.hasError) {
      openError(
        '사진을 다시 선택해 주세요',
        '분석에 적합하지 않은 사진입니다. 아래 안내를 참고하여 새 사진으로 교체해 주세요.'
      );
      return;
    }
    router.push('/analysis/preference');
  };

  const nextDisabled = !preview || checking || !!quality?.hasError;

  return (
    <div className="section-shell">
      <div className="z-10 mx-auto w-full max-w-4xl rounded-[3rem] border border-indigo-50/60 bg-white/60 p-8 shadow-xl shadow-indigo-100/30 backdrop-blur-sm sm:p-12 dark:border-white/5 dark:bg-white/5 dark:shadow-black/30">
      <div className="flex w-full flex-col items-center gap-10">
        <header className="space-y-3 text-center">
          <h1 className="text-gradient text-3xl font-black tracking-tight sm:text-4xl">
            나에게 맞는 컬러 찾기
          </h1>
          <p className="max-w-xl text-sm font-medium leading-relaxed text-gray-500 sm:text-base dark:text-gray-400">
            사진을 업로드하거나 촬영하여 퍼스널 컬러 분석과 가상 피팅을 받아보세요.
            가장 정확한 결과를 위해 자연광 아래 정면으로 찍은 선명한 사진을 사용해주세요.
          </p>
        </header>

        <section className="panel-card space-y-8">
          {/* Preview */}
          {preview && (
            <div className="flex flex-col items-center gap-3">
              <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-white/10 dark:bg-[var(--color-auth-surface)]">
                <img
                  src={preview}
                  alt="업로드한 사진 미리보기"
                  className="max-h-[360px] w-auto object-contain"
                />
              </div>
              <button
                type="button"
                onClick={resetImage}
                className="cursor-pointer text-xs font-bold text-gray-500 underline underline-offset-4 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                다시 선택하기
              </button>
            </div>
          )}

          {/* 품질 체크 결과 */}
          {preview && (
            <div>
              {checking && (
                <div className="flex items-center justify-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 text-sm font-bold text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
                  <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-indigo-500" />
                  사진 품질을 확인하는 중입니다...
                </div>
              )}
              {!checking && quality && quality.issues.length === 0 && (
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm font-bold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                  분석에 적합한 사진입니다. 다음 단계로 진행해 주세요.
                </div>
              )}
              {!checking && quality && quality.issues.length > 0 && (
                <ul className="space-y-2">
                  {quality.issues.map((issue) => {
                    const isError = issue.severity === 'error';
                    return (
                      <li
                        key={issue.code}
                        className={`flex gap-3 rounded-2xl border p-4 ${
                          isError
                            ? 'border-red-100 bg-red-50/70 dark:border-red-500/30 dark:bg-red-500/10'
                            : 'border-amber-100 bg-amber-50/60 dark:border-amber-500/30 dark:bg-amber-500/10'
                        }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          className={`mt-0.5 h-5 w-5 shrink-0 ${
                            isError ? 'text-red-500' : 'text-amber-600'
                          }`}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v3.75m0 3.75h.008M3.75 19.5h16.5L12 4.5 3.75 19.5Z"
                          />
                        </svg>
                        <div className="space-y-1">
                          <p
                            className={`text-sm font-black ${
                              isError ? 'text-red-700 dark:text-red-300' : 'text-amber-800 dark:text-amber-300'
                            }`}
                          >
                            {issue.title}
                          </p>
                          <p className="text-xs font-medium leading-relaxed text-gray-600 dark:text-gray-400">
                            {issue.description}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {/* 유의사항 */}
          <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5 dark:border-amber-500/30 dark:bg-amber-500/10">
            <div className="mb-3 flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m0 3.75h.008M3.75 19.5h16.5L12 4.5 3.75 19.5Z"
                />
              </svg>
              <span className="text-sm font-black">이용 전 유의사항</span>
            </div>
            <ul className="space-y-2 text-xs leading-relaxed text-gray-600 sm:text-sm dark:text-gray-400">
              {NOTICE_ITEMS.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-[0.35rem] h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Upload/Camera Buttons */}
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-16 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-base font-black text-white shadow-lg shadow-primary/20 transition-all hover:opacity-95 active:scale-[0.98]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 7.5 12 3m0 0L7.5 7.5M12 3v13.5"
                />
              </svg>
              사진 업로드
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              onClick={() => setCameraOpen(true)}
              className="flex h-16 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-accent px-4 text-base font-black text-white shadow-lg shadow-accent/20 transition-all hover:opacity-95 active:scale-[0.98]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316ZM16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z"
                />
              </svg>
              카메라 사용
            </button>
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => router.push('/analysis/style')}
            className="h-14 min-w-32 rounded-2xl text-base font-bold"
          >
            이전으로
          </Button>
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={handleNext}
            disabled={nextDisabled}
            className="h-14 min-w-40 rounded-2xl text-base font-bold"
          >
            {checking ? '확인 중...' : '다음 단계로'}
          </Button>
        </footer>
      </div>
      </div>

      <CameraCaptureModal
        isOpen={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleCapture}
      />

      <Modal
        isOpen={errorOpen}
        onClose={() => setErrorOpen(false)}
        title={errorContent.title}
        description={errorContent.description}
      />
    </div>
  );
}
