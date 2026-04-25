'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button, type ButtonVariant } from './Button';

type ConfirmAction = {
  label: string;
  onClick: () => void;
  variant?: ButtonVariant;
};

type ConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  primaryAction: ConfirmAction;
  secondaryAction?: ConfirmAction;
};

export function ConfirmModal({
  isOpen,
  onClose,
  title,
  description,
  primaryAction,
  secondaryAction,
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative flex w-full max-w-lg transform flex-col gap-6 overflow-hidden rounded-[2rem] bg-white p-10 text-center shadow-2xl transition-all dark:bg-[var(--color-auth-surface)]">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth={2.5}
            stroke="currentColor"
            className="h-10 w-10 text-primary"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-2xl font-black tracking-tight text-gray-900 dark:text-gray-100">{title}</h3>
          <p className="text-base font-medium leading-relaxed text-gray-500 whitespace-pre-wrap dark:text-gray-400">
            {description}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {secondaryAction && (
            <Button
              type="button"
              variant={secondaryAction.variant ?? 'outline'}
              size="lg"
              onClick={secondaryAction.onClick}
              className="h-14 w-full whitespace-nowrap rounded-2xl px-4 text-base font-bold"
            >
              {secondaryAction.label}
            </Button>
          )}
          <Button
            type="button"
            variant={primaryAction.variant ?? 'primary'}
            size="lg"
            onClick={primaryAction.onClick}
            className="h-14 w-full whitespace-nowrap rounded-2xl px-4 text-base font-bold"
          >
            {primaryAction.label}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
