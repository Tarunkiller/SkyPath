import { SearchForm } from '../../components/flight/SearchForm';
import { FlightList } from '../../components/flight/FlightList';
import { searchFlights } from './actions';
import type { Metadata } from 'next';

interface SearchPageProps {
  searchParams: { origin?: string; destination?: string; date?: string; pax?: string; cabinClass?: string };
}

export const metadata: Metadata = {
  title: 'Search flights | SkyPath',
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const origin = searchParams.origin ?? '';
  const destination = searchParams.destination ?? '';
  const date = searchParams.date ?? '';
  const pax = Number(searchParams.pax ?? '1');
  const cabinClass = searchParams.cabinClass ?? 'economy';

  const flights = origin && destination && date ? await searchFlights({ origin, destination, date, pax, cabinClass }) : [];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Search flights</h1>
        <p className="mt-2 text-slate-600">Enter your route and date to view available departures.</p>
        <div className="mt-6">
          <SearchForm />
        </div>
      </div>
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Search results</p>
            <h2 className="text-xl font-semibold text-slate-900">Flights for your route</h2>
          </div>
          <p className="text-sm text-slate-500">Showing {flights.length} results</p>
        </div>
        <FlightList flights={flights} />
      </section>
    </div>
  );
}
