'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
};

export function Modal({ isOpen, onClose, title, description }: ModalProps) {
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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative flex w-full max-w-sm transform flex-col gap-6 overflow-hidden rounded-[2rem] bg-white p-10 text-center shadow-2xl transition-all">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
          <div className="h-10 w-10 text-accent">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
              />
            </svg>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-2xl font-black tracking-tight text-gray-900">
            {title}
          </h3>
          <p className="text-lg font-medium leading-relaxed text-gray-500 whitespace-pre-wrap">
            {description}
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={onClose}
          className="h-16 w-full rounded-2xl text-lg font-bold"
        >
          확인
        </Button>
      </div>
    </div>,
    document.body
  );
}
