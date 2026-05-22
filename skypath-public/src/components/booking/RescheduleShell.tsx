'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '../../lib/supabase/client';
import { Button } from '../ui/Button';
import { Toast } from '../ui/Toast';
import { SeatMap } from '../seat/SeatMap';
import { rescheduleBooking } from '../../app/book/actions';
import { formatINR, formatDuration } from '../../lib/utils';
import type { BookingWithRelations, Flight, Seat } from '../../types/database';

interface RescheduleShellProps {
  booking: BookingWithRelations;
  alternatives: Flight[];
}

export function RescheduleShell({ booking, alternatives }: RescheduleShellProps) {
  const router = useRouter();
  const [selectedFlightId, setSelectedFlightId] = useState(alternatives[0]?.id ?? '');
  const [availableSeats, setAvailableSeats] = useState<Seat[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSeats() {
      if (!selectedFlightId) return;
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.from('seats').select('*').eq('flight_id', selectedFlightId).order('seat_number', { ascending: true });
      if (error) {
        setToast({ message: error.message, variant: 'error' });
        return;
      }
      setAvailableSeats((data as Seat[]) ?? []);
      setSelectedSeat(null);
    }
    loadSeats();
  }, [selectedFlightId]);

  const flight = useMemo(() => alternatives.find((item) => item.id === selectedFlightId) ?? alternatives[0], [alternatives, selectedFlightId]);

  const totalPrice = selectedSeat ? flight.base_price + selectedSeat.extra_fee : flight.base_price;

  const handleConfirm = async () => {
    if (!selectedSeat) {
      setToast({ message: 'Select a seat to reschedule.', variant: 'error' });
      return;
    }
    setLoading(true);
    try {
      await rescheduleBooking(booking.booking.id, selectedFlightId, selectedSeat.id);
      router.push('/bookings');
      setToast({ message: 'Reschedule confirmed.', variant: 'success' });
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : 'Unable to reschedule.', variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Alternative flights</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {alternatives.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedFlightId(item.id)}
              className={`rounded-3xl border p-4 text-left transition ${selectedFlightId === item.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-300'}`}
            >
              <p className="font-semibold text-slate-900">{item.flight_no}</p>
              <p className="text-sm text-slate-500">{item.origin} → {item.destination}</p>
              <p className="text-sm text-slate-500">{new Date(item.departs_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
              <p className="text-sm text-slate-900">{formatINR(item.base_price)} • {formatDuration(item.departs_at, item.arrives_at)}</p>
            </button>
          ))}
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-[0.9fr_0.6fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Select a new seat</h2>
          <SeatMap flightId={selectedFlightId} initialSeats={availableSeats} onSeatConfirmed={setSelectedSeat} />
        </div>
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">Current booking</h3>
            <p className="mt-2 text-sm text-slate-600">{booking.flight.flight_no} • {booking.flight.origin} → {booking.flight.destination}</p>
            <p className="text-sm text-slate-600">Seat {booking.seat.seat_number}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">New booking summary</h3>
            <p className="mt-3 text-sm text-slate-600">{flight.origin} → {flight.destination}</p>
            <p className="text-sm text-slate-600">Seat {selectedSeat?.seat_number || 'None selected'}</p>
            <p className="mt-3 text-lg font-semibold text-slate-900">Total {formatINR(totalPrice)}</p>
            <Button type="button" onClick={handleConfirm} disabled={loading} className="mt-4 w-full">{loading ? 'Rescheduling...' : 'Confirm reschedule'}</Button>
          </div>
        </div>
      </section>
      {toast ? <Toast message={toast.message} variant={toast.variant} open onClose={() => setToast(null)} /> : null}
    </div>
  );
}
