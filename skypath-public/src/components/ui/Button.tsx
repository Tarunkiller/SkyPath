'use client';

import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-2xl border px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500';
  const variants: Record<string, string> = {
    primary: 'bg-indigo-600 text-white border-transparent hover:bg-indigo-700',
    secondary: 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50',
    danger: 'bg-red-500 text-white border-transparent hover:bg-red-600',
    ghost: 'bg-transparent text-slate-700 border-transparent hover:bg-slate-100',
  };

  return <button className={cn(base, variants[variant], className)} {...props} />;
}
