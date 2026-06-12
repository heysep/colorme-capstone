'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  extractApiErrorMessage,
  pcApi,
  resolveFileUrl,
  type PcLookDetail,
} from '../api/pc-api';
import { RetryImage } from './RetryImage';
import type { TryOnSelection } from './RecommendationSection';

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 120_000;

type TryOnPhase = 'idle' | 'processing' | 'completed' | 'failed';

type TryOnPanelProps = {
  analysisId: number;
  sessionToken: string;
  selection: TryOnSelection;
};

export function TryOnPanel({
  analysisId,
  sessionToken,
  selection,
}: TryOnPanelProps) {
  const [phase, setPhase] = useState<TryOnPhase>('idle');
  const [look, setLook] = useState<PcLookDetail | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ title: string; description: string } | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveMemo, setSaveMemo] = useState('');
  const [saving, setSaving] = useState(false);
  const pollStopRef = useRef(false);

  useEffect(() => () => {
    pollStopRef.current = true;
  }, []);

  const canStart = !!selection.top && !!selection.bottom && phase !== 'processing';

  const startTryOn = async () => {
    if (!selection.top || !selection.bottom) return;
    setPhase('processing');
    setErrorMessage(null);
    setLook(null);
    try {
      const created = await pcApi.createTryOn(
        {
          analysisId,
          topItemId: selection.top.itemId,
          bottomItemId: selection.bottom.itemId,
          ...(selection.accessory
            ? { accessoryItemId: selection.accessory.itemId }
            : {}),
        },
        sessionToken,
      );

      const startedAt = Date.now();
      pollStopRef.current = false;
      while (!pollStopRef.current) {
        const detail = await pcApi.getLook(created.lookId, sessionToken);
        if (detail.status === 'TRYON_COMPLETED') {
          setLook(detail);
          setPhase('completed');
          return;
        }
        if (detail.status === 'FAILED') {
          setErrorMessage(
            'AI 가상 피팅 생성에 실패했습니다. 다른 의상 조합으로 다시 시도해 주세요.',
          );
          setPhase('failed');
          return;
        }
        if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
          setErrorMessage(
            '가상 피팅 처리 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.',
          );
          setPhase('failed');
          return;
        }
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      }
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error));
      setPhase('failed');
    }
  };

  const handleSave = async () => {
    if (!look) return;
    setSaving(true);
    try {
      await pcApi.saveLook(look.lookId, sessionToken, saveMemo || undefined);
      setLook({ ...look, savedYn: true });
      setSaveOpen(false);
      setNotice({
        title: '룩 저장 완료',
        description: '가상 피팅 룩이 저장되었습니다.',
      });
    } catch (error) {
      setNotice({ title: '저장 실패', description: extractApiErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (!look) return;
    try {
      const result = await pcApi.shareLook(look.lookId, sessionToken);
      const shareUrl = `${window.location.origin}/share/${result.shareToken}`;
      await navigator.clipboard.writeText(shareUrl);
      setNotice({
        title: '공유 링크 복사 완료',
        description: `클립보드에 복사되었습니다.\n${shareUrl}`,
      });
    } catch (error) {
      setNotice({ title: '공유 실패', description: extractApiErrorMessage(error) });
    }
  };

  const selectionSummary = (
    <div className="grid gap-3 sm:grid-cols-3">
      {(
        [
          { label: '상의', item: selection.top, required: true },
          { label: '하의', item: selection.bottom, required: true },
          { label: '액세서리', item: selection.accessory, required: false },
        ] as const
      ).map(({ label, item, required }) => (
        <div
          key={label}
          className={`flex items-center gap-3 rounded-2xl border p-3 ${
            item
              ? 'border-primary/30 bg-primary/5 dark:border-primary/40 dark:bg-primary/10'
              : 'border-dashed border-gray-200 bg-gray-50/60 dark:border-white/10 dark:bg-white/5'
          }`}
        >
          {item ? (
            <>
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-white/5">
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
            </>
          ) : (
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
              {label} {required ? '선택 필요' : '(선택 사항)'}
            </p>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <section className="panel-card space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black text-gray-900 sm:text-2xl dark:text-gray-100">
          AI 가상 피팅
        </h2>
        <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
          Gemini 이미지 생성
        </span>
      </div>

      {selectionSummary}

      {phase === 'idle' && (
        <Button
          type="button"
          variant="cta"
          size="lg"
          disabled={!canStart}
          onClick={startTryOn}
          className="h-14 w-full rounded-2xl text-base font-black"
        >
          {canStart
            ? '선택한 코디로 가상 피팅 시작'
            : '상의와 하의를 먼저 선택해 주세요'}
        </Button>
      )}

      {phase === 'processing' && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-8 dark:border-indigo-500/30 dark:bg-indigo-500/10">
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-3 w-3 animate-bounce rounded-full bg-primary"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="text-sm font-black text-indigo-700 dark:text-indigo-300">
            AI가 선택한 의상을 입혀보고 있어요...
          </p>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            이미지 생성에 최대 1~2분이 걸릴 수 있습니다.
          </p>
        </div>
      )}

      {phase === 'failed' && (
        <div className="space-y-4 rounded-2xl border border-red-100 bg-red-50/70 p-6 text-center dark:border-red-500/30 dark:bg-red-500/10">
          <p className="text-sm font-black text-red-700 dark:text-red-300">
            {errorMessage ?? '가상 피팅에 실패했습니다.'}
          </p>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => setPhase('idle')}
            className="rounded-xl font-bold"
          >
            다시 시도하기
          </Button>
        </div>
      )}

      {phase === 'completed' && look && (
        <div className="space-y-5">
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-white/10 dark:bg-[var(--color-auth-surface)]">
            <RetryImage
              src={resolveFileUrl(look.tryOnImageUrl) ?? ''}
              alt="가상 피팅 결과"
              className="mx-auto max-h-[560px] w-auto object-contain"
            />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => setSaveOpen(true)}
              disabled={look.savedYn}
              className="rounded-xl font-bold"
            >
              {look.savedYn ? '저장됨 ✓' : '룩 저장'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleShare}
              className="rounded-xl font-bold"
            >
              공유 링크 복사
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setPhase('idle')}
              className="rounded-xl font-bold"
            >
              다른 조합으로 다시 피팅
            </Button>
          </div>
        </div>
      )}

      {/* 저장 메모 입력 모달 */}
      {saveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSaveOpen(false)}
          />
          <div className="relative flex w-full max-w-md flex-col gap-5 rounded-[2rem] bg-white p-8 shadow-2xl dark:bg-[var(--color-auth-surface)]">
            <h3 className="text-center text-xl font-black text-gray-900 dark:text-gray-100">
              룩 저장
            </h3>
            <Input
              id="look-memo"
              label="메모 (선택)"
              type="text"
              placeholder="예: 데일리 오피스 룩"
              value={saveMemo}
              onChange={(e) => setSaveMemo(e.target.value)}
              maxLength={500}
            />
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setSaveOpen(false)}
                className="h-12 w-full rounded-xl font-bold"
              >
                취소
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                disabled={saving}
                onClick={handleSave}
                className="h-12 w-full rounded-xl font-bold"
              >
                {saving ? '저장 중...' : '저장하기'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={!!notice}
        onClose={() => setNotice(null)}
        title={notice?.title ?? ''}
        description={notice?.description ?? ''}
      />
    </section>
  );
}
