'use client';

import type { Flight } from '../../types/database';
import { FlightCard } from './FlightCard';

interface FlightListProps {
  flights: Flight[];
}

export function FlightList({ flights }: FlightListProps) {
  if (flights.length === 0) {
    return <p className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500">No flights match your search yet. Try a different combination.</p>;
  }

  return (
    <div className="space-y-4">
      {flights.map((flight) => (
        <FlightCard key={flight.id} flight={flight} />
      ))}
    </div>
  );
}
