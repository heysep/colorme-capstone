'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/Button';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
};

export function CameraCaptureModal({ isOpen, onClose, onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setError(null);

    const start = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setError('이 브라우저에서는 카메라를 사용할 수 없습니다.');
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => void 0);
        }
      } catch (e: any) {
        setError('카메라 권한이 거부되었거나 사용할 수 없습니다.');
      }
    };
    start();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');
    onCapture(dataUrl);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative flex w-full max-w-2xl flex-col gap-5 overflow-hidden rounded-[2rem] bg-white p-8 shadow-2xl">
        <div className="text-center">
          <h3 className="text-2xl font-black tracking-tight text-gray-900">
            카메라로 촬영하기
          </h3>
          <p className="mt-2 text-sm font-medium text-gray-500">
            얼굴이 정면으로 잘 보이도록 위치를 맞춰주세요.
          </p>
        </div>

        <div className="relative w-full overflow-hidden rounded-2xl bg-black">
          {error ? (
            <div className="flex aspect-video items-center justify-center p-6 text-center text-sm text-white/80">
              {error}
            </div>
          ) : (
            <video
              ref={videoRef}
              className="w-full"
              autoPlay
              playsInline
              muted
            />
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onClose}
            className="h-14 w-full whitespace-nowrap rounded-2xl text-base font-bold"
          >
            취소
          </Button>
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={handleCapture}
            disabled={!!error}
            className="h-14 w-full whitespace-nowrap rounded-2xl text-base font-bold"
          >
            촬영하기
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
