'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cancelBooking } from '../../app/book/actions';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import { Toast } from '../../components/ui/Toast';
import { useUserStore } from '../../store/userStore';
import type { BookingWithRelations } from '../../types/database';

interface BookingsClientProps {
  bookings: BookingWithRelations[];
}

export function BookingsClient({ bookings }: BookingsClientProps) {
  const [openDialog, setOpenDialog] = useState(false);
  const [targetBookingId, setTargetBookingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);
  const updateBookingStatus = useUserStore((state) => state.updateBookingStatus);

  const confirmCancel = async () => {
    if (!targetBookingId) return;
    try {
      await cancelBooking(targetBookingId);
      updateBookingStatus(targetBookingId, 'cancelled');
      setToast({ message: 'Booking cancelled successfully.', variant: 'success' });
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : 'Unable to cancel booking.', variant: 'error' });
    } finally {
      setOpenDialog(false);
      setTargetBookingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <article key={booking.booking.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span>{booking.flight.origin} → {booking.flight.destination}</span>
                <Badge status={booking.booking.status} />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">{booking.flight.flight_no}</h2>
              <p className="text-sm text-slate-600">Seat {booking.seat.seat_number} • {booking.seat.class}</p>
              <p className="text-sm text-slate-600">Passenger: {booking.passenger.full_name}</p>
            </div>
            <div className="flex flex-col gap-3 text-right">
              <p className="text-sm text-slate-500">Departs</p>
              <p className="font-semibold text-slate-900">{new Date(booking.flight.departs_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link href={`/bookings/${booking.booking.id}/reschedule`} className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Reschedule</Link>
                <Button type="button" variant="danger" onClick={() => { setTargetBookingId(booking.booking.id); setOpenDialog(true); }}>Cancel</Button>
              </div>
            </div>
          </div>
        </article>
      ))}
      <Dialog
        open={openDialog}
        title="Cancel booking"
        description="Cancellations are blocked within two hours of departure. Are you sure you want to cancel this booking?"
        onConfirm={confirmCancel}
        onClose={() => setOpenDialog(false)}
      />
      {toast ? <Toast message={toast.message} variant={toast.variant} open onClose={() => setToast(null)} /> : null}
    </div>
  );
}
