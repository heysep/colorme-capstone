'use client';

import { useEffect, useRef, useState } from 'react';

type RetryImageProps = {
  src: string;
  alt: string;
  className?: string;
  /** 업로드 직후 저장소 반영 지연으로 404가 날 수 있어 재시도한다. */
  maxRetries?: number;
};

export function RetryImage({
  src,
  alt,
  className,
  maxRetries = 5,
}: RetryImageProps) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setAttempt(0);
    setFailed(false);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [src]);

  const handleError = () => {
    if (attempt >= maxRetries) {
      setFailed(true);
      return;
    }
    timerRef.current = setTimeout(
      () => setAttempt((n) => n + 1),
      1500 * (attempt + 1),
    );
  };

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-xs font-medium text-gray-400 dark:bg-white/5 dark:text-gray-500 ${className ?? ''}`}
      >
        이미지를 불러올 수 없습니다
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={attempt}
      src={attempt === 0 ? src : `${src}${src.includes('?') ? '&' : '?'}retry=${attempt}`}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
}
