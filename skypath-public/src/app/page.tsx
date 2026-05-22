import { SearchForm } from '../components/flight/SearchForm';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">SkyPath</p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">Book your next flight with confidence.</h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">Search routes across India, pick the best seat in real time, and manage your itinerary with instant booking confirmation and offline access.</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/search" className="inline-flex items-center justify-center rounded-2xl border px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-indigo-600 text-white border-transparent hover:bg-indigo-700">
              Start searching
            </Link>
            <Link href="/register" className="inline-flex items-center justify-center rounded-2xl border px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 border-slate-200 hover:bg-slate-50">
              Create account
            </Link>
          </div>
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Search flights instantly</h2>
          <p className="mt-3 text-slate-600">Find scheduled departures, compare prices, and reserve seats across multiple routes with one tap.</p>
          <div className="mt-6 space-y-3 text-sm text-slate-600">
            <p>• Realtime seat availability by flight</p>
            <p>• Secure bookings via Supabase and PostgreSQL</p>
            <p>• PWA install prompt for offline mode</p>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">Search your next departure</h3>
          <div className="mt-6">
            <SearchForm />
          </div>
        </div>
      </section>
    </div>
  );
}
