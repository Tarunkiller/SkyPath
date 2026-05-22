import { notFound } from 'next/navigation';
import { getFlightWithSeats } from '../../search/actions';
import { FlightBookingShell } from '../../../components/booking/FlightBookingShell';
import type { Metadata } from 'next';

interface FlightPageProps {
  params: { flightId: string };
}

export const metadata: Metadata = {
  title: 'Book flight | SkyPath',
};

export default async function FlightBookingPage({ params }: FlightPageProps) {
  const { flightId } = params;
  const { flight, seats } = await getFlightWithSeats(flightId);

  if (!flight) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Book flight {flight.flight_no}</h1>
        <p className="mt-2 text-slate-600">Select your seat and passenger details for {flight.origin} to {flight.destination}.</p>
      </div>
      <FlightBookingShell flight={flight} seats={seats} />
    </div>
  );
}
