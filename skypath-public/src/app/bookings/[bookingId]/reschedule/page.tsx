import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import { getAlternativeFlights } from '../../../search/actions';
import { RescheduleShell } from '../../../../components/booking/RescheduleShell';
import type { BookingWithRelations } from '../../../../types/database';
import type { Metadata } from 'next';

interface ReschedulePageProps {
  params: { bookingId: string };
}

export const metadata: Metadata = {
  title: 'Reschedule booking | SkyPath',
};

export default async function ReschedulePage({ params }: ReschedulePageProps) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: bookingData, error } = await supabase
    .from('bookings')
    .select('*, flights(*), seats(*), passengers(*)')
    .eq('id', params.bookingId)
    .eq('user_id', user.id)
    .single();

  if (error || !bookingData) {
    notFound();
  }

  const booking: BookingWithRelations = {
    booking: {
      id: bookingData.id,
      user_id: bookingData.user_id,
      seat_id: bookingData.seat_id,
      flight_id: bookingData.flight_id,
      pnr_code: bookingData.pnr_code,
      total_price: bookingData.total_price,
      status: bookingData.status,
      booked_at: bookingData.booked_at,
    },
    flight: bookingData.flights,
    seat: bookingData.seats,
    passenger: bookingData.passengers?.[0],
  };
  const alternatives = await getAlternativeFlights(booking.flight.origin, booking.flight.destination, booking.flight.id);

  if (alternatives.length === 0) {
    notFound();
  }

  return <RescheduleShell booking={booking} alternatives={alternatives} />;
}
