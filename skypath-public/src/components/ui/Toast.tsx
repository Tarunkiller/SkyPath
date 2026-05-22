'use client';

import { useState, useEffect } from 'react';

interface ToastProps {
  message: string;
  variant?: 'success' | 'error' | 'warning';
  open: boolean;
  onClose: () => void;
}

const variants: Record<string, string> = {
  success: 'bg-emerald-500 text-white',
  error: 'bg-red-500 text-white',
  warning: 'bg-amber-500 text-slate-900',
};

export function Toast({ message, variant = 'success', open, onClose }: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const timeout = window.setTimeout(onClose, 4000);
    return () => window.clearTimeout(timeout);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl px-4 py-3 shadow-xl" data-variant={variant}>
      <div className={variants[variant]}>{message}</div>
    </div>
  );
}
