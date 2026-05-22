'use client';

import { useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowserClient } from '../../lib/supabase/client';
import { useFlightStore } from '../../store/flightStore';
import { getSeatZone, formatINR } from '../../lib/utils';
import type { Seat } from '../../types/database';

interface SeatMapProps {
  flightId: string;
  initialSeats: Seat[];
  onSeatConfirmed: (seat: Seat) => void;
}

const columns = ['A', 'B', 'C', 'D', 'E', 'F'];

export function SeatMap({ flightId, initialSeats, onSeatConfirmed }: SeatMapProps) {
  const [seats, setSeats] = useState<Seat[]>(initialSeats);
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null);
  const selectSeatOptimistic = useFlightStore((state) => state.selectSeatOptimistic);

  useEffect(() => {
    setSeats(initialSeats);
  }, [initialSeats]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const channel = supabase.channel(`seat-updates-${flightId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'seats', filter: `flight_id=eq.${flightId}` }, (payload: { new: Seat }) => {
        setSeats((current) => current.map((seat) => seat.id === payload.new.id ? { ...seat, ...payload.new } : seat));
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [flightId]);

  const seatMatrix = useMemo(() => {
    const rows: Array<{ row: number; seats: Array<Seat | null> }> = [];
    for (let row = 1; row <= 19; row += 1) {
      const rowSeats = columns.map((column) => seats.find((seat) => seat.seat_number === `${row}${column}`) ?? null);
      rows.push({ row, seats: rowSeats });
    }
    return rows;
  }, [seats]);

  const selectedSeat = seats.find((seat) => seat.id === selectedSeatId) ?? null;

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white p-4 shadow-sm min-w-[360px]">
        <div className="grid gap-2 text-sm text-slate-600">
          <div className="grid grid-cols-[repeat(3,minmax(0,1fr))_1fr_repeat(3,minmax(0,1fr))] gap-2">
            <span className="col-span-3 text-left">A B C</span>
            <span />
            <span className="col-span-3 text-right">D E F</span>
          </div>
          {seatMatrix.map(({ row, seats: rowSeats }) => {
            const zone = getSeatZone(row);
            return (
              <div key={row} className="grid grid-cols-[repeat(3,minmax(0,1fr))_1fr_repeat(3,minmax(0,1fr))] items-center gap-2 rounded-3xl px-2 py-1" style={{ background: zone === 'first' ? '#fef3c7' : zone === 'business' ? '#dbeafe' : '#e2e8f0' }}>
                {rowSeats.slice(0, 3).map((seat) => (
                  <button
                    key={seat?.seat_number ?? `empty-${row}`}
                    type="button"
                    disabled={!seat || !seat.is_available}
                    onClick={() => {
                      if (seat && seat.is_available) {
                        setSelectedSeatId(seat.id);
                        selectSeatOptimistic(seat.id);
                        onSeatConfirmed(seat);
                      }
                    }}
                    onMouseEnter={() => seat && setHoveredSeat(seat)}
                    onMouseLeave={() => setHoveredSeat(null)}
                    className={`h-12 rounded-2xl border text-xs font-semibold transition ${seat ? (seat.is_available ? (selectedSeatId === seat.id ? 'bg-indigo-600 text-white ring-2 ring-indigo-500' : 'border-slate-300 bg-white text-slate-900 hover:border-indigo-500 hover:bg-indigo-50') : 'bg-transparent') : 'bg-transparent'} ${seat && !seat.is_available ? 'cursor-not-allowed bg-slate-200 text-slate-500' : 'cursor-pointer'}`}
                    aria-label={seat ? `${seat.seat_number} ${seat.class}` : 'Empty'}
                  >
                    {seat?.seat_number ?? ''}
                  </button>
                ))}
                <div className="h-12" />
                {rowSeats.slice(3, 6).map((seat) => (
                  <button
                    key={seat?.seat_number ?? `empty2-${row}`}
                    type="button"
                    disabled={!seat || !seat.is_available}
                    onClick={() => {
                      if (seat && seat.is_available) {
                        setSelectedSeatId(seat.id);
                        selectSeatOptimistic(seat.id);
                        onSeatConfirmed(seat);
                      }
                    }}
                    onMouseEnter={() => seat && setHoveredSeat(seat)}
                    onMouseLeave={() => setHoveredSeat(null)}
                    className={`h-12 rounded-2xl border text-xs font-semibold transition ${seat ? (seat.is_available ? (selectedSeatId === seat.id ? 'bg-indigo-600 text-white ring-2 ring-indigo-500' : 'border-slate-300 bg-white text-slate-900 hover:border-indigo-500 hover:bg-indigo-50') : 'bg-transparent') : 'bg-transparent'} ${seat && !seat.is_available ? 'cursor-not-allowed bg-slate-200 text-slate-500' : 'cursor-pointer'}`}
                    aria-label={seat ? `${seat.seat_number} ${seat.class}` : 'Empty'}
                  >
                    {seat?.seat_number ?? ''}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Selected seat</h3>
        {selectedSeat ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Seat</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{selectedSeat.seat_number}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Class</p>
              <p className="mt-1 text-lg font-semibold text-slate-900 capitalize">{selectedSeat.class}</p>
              <p className="text-sm text-slate-500">Extra {formatINR(selectedSeat.extra_fee)}</p>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">Tap a seat to reserve your space.</p>
        )}
        {hoveredSeat ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
            <p className="font-semibold">Hover preview</p>
            <p>{hoveredSeat.seat_number} • {hoveredSeat.class}</p>
            <p>{hoveredSeat.is_available ? 'Available' : 'Occupied'}</p>
            <p>Extra {formatINR(hoveredSeat.extra_fee)}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
