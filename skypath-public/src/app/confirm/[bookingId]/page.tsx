import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { formatINR, formatDuration } from '../../../lib/utils';
import { Badge } from '../../../components/ui/Badge';
import type { Metadata } from 'next';

interface ConfirmPageProps {
  params: { bookingId: string };
}

export const metadata: Metadata = {
  title: 'Booking confirmed | SkyPath',
};

export default async function ConfirmPage({ params }: ConfirmPageProps) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return notFound();
  }

  const { data, error } = await supabase
    .from('bookings')
    .select('*, flights(*), seats(*), passengers(*)')
    .eq('id', params.bookingId)
    .eq('user_id', user.id)
    .single();

  if (error || !data) {
    notFound();
  }

  const flight = data.flights;
  const seat = data.seats;
  const passenger = data.passengers[0];

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Booking confirmed</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">PNR {data.pnr_code}</h1>
            <Badge status={data.status} />
          </div>
          <div className="rounded-3xl bg-slate-50 p-4 text-right text-slate-700">
            <p className="text-sm">Total paid</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{formatINR(data.total_price)}</p>
          </div>
        </div>
      </section>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Flight details</h2>
          <dl className="mt-5 space-y-4 text-sm text-slate-600">
            <div>
              <dt className="font-semibold text-slate-900">Route</dt>
              <dd>{flight.origin} → {flight.destination}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">Flight</dt>
              <dd>{flight.flight_no}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">Departure</dt>
              <dd>{new Date(flight.departs_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">Arrival</dt>
              <dd>{new Date(flight.arrives_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">Duration</dt>
              <dd>{formatDuration(flight.departs_at, flight.arrives_at)}</dd>
            </div>
          </dl>
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Passenger & seat</h2>
          <dl className="mt-5 space-y-4 text-sm text-slate-600">
            <div>
              <dt className="font-semibold text-slate-900">Passenger</dt>
              <dd>{passenger.full_name}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">Passport</dt>
              <dd>{passenger.passport_no}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">Seat</dt>
              <dd>{seat.seat_number} • {seat.class}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">Aircraft</dt>
              <dd>{flight.aircraft_type}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
