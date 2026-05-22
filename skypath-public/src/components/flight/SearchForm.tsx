'use client';

import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useFlightStore } from '../../store/flightStore';
import { CABIN_CLASS_OPTIONS } from '../../lib/constants';

export function SearchForm() {
  const router = useRouter();
  const setSearchQuery = useFlightStore((state) => state.setSearchQuery);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [pax, setPax] = useState(1);
  const [cabinClass, setCabinClass] = useState<'economy' | 'business' | 'first'>('economy');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!origin.trim() || !destination.trim() || !date) {
      setError('Please complete origin, destination, and date.');
      return;
    }
    setError('');
    const query = { origin: origin.trim(), destination: destination.trim(), date, pax, cabinClass };
    setSearchQuery(query);
    router.push(`/search?origin=${encodeURIComponent(query.origin)}&destination=${encodeURIComponent(query.destination)}&date=${encodeURIComponent(query.date)}&pax=${query.pax}&cabinClass=${encodeURIComponent(query.cabinClass)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-800">
          Origin
          <Input value={origin} onChange={(event: ChangeEvent<HTMLInputElement>) => setOrigin(event.target.value)} placeholder="Delhi" aria-label="Origin" />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-800">
          Destination
          <Input value={destination} onChange={(event: ChangeEvent<HTMLInputElement>) => setDestination(event.target.value)} placeholder="Mumbai" aria-label="Destination" />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="space-y-2 text-sm font-medium text-slate-800">
          Departure Date
          <Input type="date" value={date} onChange={(event: ChangeEvent<HTMLInputElement>) => setDate(event.target.value)} aria-label="Departure date" />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-800">
          Passengers
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
            <button type="button" className="text-slate-500" onClick={() => setPax(Math.max(1, pax - 1))}>-</button>
            <span className="min-w-[2rem] text-center text-sm font-semibold">{pax}</span>
            <button type="button" className="text-slate-500" onClick={() => setPax(Math.min(9, pax + 1))}>+</button>
          </div>
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-800">
          Cabin Class
          <Select value={cabinClass} onChange={(event: ChangeEvent<HTMLSelectElement>) => setCabinClass(event.target.value as 'economy' | 'business' | 'first')}>
            {CABIN_CLASS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>
        </label>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" className="w-full">Search flights</Button>
    </form>
  );
}
