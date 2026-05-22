import { getUserBookings } from '../search/actions';
import { BookingsClient } from './BookingsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My bookings | SkyPath',
};

export default async function BookingsPage() {
  const bookings = await getUserBookings();

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">My bookings</h1>
        <p className="mt-2 text-slate-600">Review upcoming flights, reschedule, or cancel your reservations.</p>
      </section>
      <BookingsClient bookings={bookings} />
    </div>
  );
}
