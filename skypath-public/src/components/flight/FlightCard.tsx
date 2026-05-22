'use client';

import Link from 'next/link';
import { formatDuration, formatINR } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import type { Flight } from '../../types/database';

interface FlightCardProps {
  flight: Flight;
}

export function FlightCard({ flight }: FlightCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span>{flight.origin} → {flight.destination}</span>
            <Badge status={flight.status} />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">{flight.flight_no}</h2>
          <p className="text-sm text-slate-600">{flight.aircraft_type}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold text-slate-900">{formatINR(flight.base_price)}</p>
          <p className="text-sm text-slate-500">{formatDuration(flight.departs_at, flight.arrives_at)}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-semibold">Departs</p>
          <p>{new Date(flight.departs_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-semibold">Arrives</p>
          <p>{new Date(flight.arrives_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Link href={`/book/${flight.id}`} className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">Select</Link>
      </div>
    </article>
  );
}
