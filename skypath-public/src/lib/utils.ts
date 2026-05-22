import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: Array<string | false | null | undefined>) {
  return twMerge(clsx(inputs));
}

export function formatDuration(departsAt: string, arrivesAt: string) {
  const start = new Date(departsAt);
  const end = new Date(arrivesAt);
  const minutes = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
  const hours = Math.floor(minutes / 60);
  const remainderMinutes = minutes % 60;
  return `${hours}h ${remainderMinutes.toString().padStart(2, '0')}m`;
}

export function formatINR(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

export function canCancel(departsAt: string) {
  return new Date(departsAt).getTime() > Date.now() + 2 * 60 * 60 * 1000;
}

export function getSeatZone(row: number) {
  if (row === 1) return 'first';
  if (row <= 3) return 'business';
  return 'economy';
}
