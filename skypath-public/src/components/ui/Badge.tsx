'use client';

import { cn } from '../../lib/utils';

interface BadgeProps {
  status: 'confirmed' | 'rescheduled' | 'cancelled' | 'scheduled' | 'delayed' | 'departed' | 'landed';
}

const badgeStyles: Record<string, string> = {
  confirmed: 'bg-emerald-100 text-emerald-700',
  rescheduled: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-red-100 text-red-700',
  scheduled: 'bg-indigo-100 text-indigo-700',
  delayed: 'bg-amber-100 text-amber-700',
  departed: 'bg-slate-100 text-slate-700',
  landed: 'bg-slate-100 text-slate-700',
};

export function Badge({ status }: BadgeProps) {
  return <span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-semibold', badgeStyles[status])}>{status.replace(/^(.)/, (match) => match.toUpperCase())}</span>;
}
