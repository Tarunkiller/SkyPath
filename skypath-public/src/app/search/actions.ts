'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '../../lib/supabase/server';
import type { Flight, Seat, BookingWithRelations, Passenger } from '../../types/database';

interface RawBookingJoin {
  id: string;
  user_id: string;
  seat_id: string;
  flight_id: string;
  pnr_code: string;
  total_price: number;
  status: 'confirmed' | 'rescheduled' | 'cancelled';
  booked_at: string;
  flights: Flight;
  seats: Seat;
  passengers: Passenger[];
}

export async function searchFlights(params: { origin: string; destination: string; date: string; pax: number; cabinClass: string }) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { origin, destination, date } = params;
  const start = new Date(`${date}T00:00:00Z`).toISOString();
  const end = new Date(`${date}T23:59:59Z`).toISOString();

  const { data, error } = await supabase
    .from('flights')
    .select('*')
    .ilike('origin', `%${origin}%`)
    .ilike('destination', `%${destination}%`)
    .gte('departs_at', start)
    .lte('departs_at', end)
    .eq('status', 'scheduled')
    .order('departs_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data as Flight[]) ?? [];
}

export async function getFlightWithSeats(flightId: string) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [flightResult, seatsResult] = await Promise.all([
    supabase.from('flights').select('*').eq('id', flightId).single(),
    supabase.from('seats').select('*').eq('flight_id', flightId).order('seat_number', { ascending: true }),
  ]);

  if (flightResult.error || seatsResult.error || !flightResult.data) {
    throw new Error(flightResult.error?.message ?? seatsResult.error?.message ?? 'Unable to load flight details');
  }

  return { flight: flightResult.data as Flight, seats: (seatsResult.data ?? []) as Seat[] };
}

export async function getUserBookings() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data, error } = await supabase
    .from('bookings')
    .select(`*, flights(*), seats(*), passengers(*)`)
    .eq('user_id', user.id)
    .order('booked_at', { ascending: false });

  if (error) throw new Error(error.message);

  return ((data as unknown as RawBookingJoin[]) ?? []).map((item) => ({
    booking: {
      id: item.id,
      user_id: item.user_id,
      seat_id: item.seat_id,
      flight_id: item.flight_id,
      pnr_code: item.pnr_code,
      total_price: item.total_price,
      status: item.status,
      booked_at: item.booked_at,
    },
    flight: item.flights,
    seat: item.seats,
    passenger: item.passengers?.[0],
  })) as BookingWithRelations[];
}

export async function getAlternativeFlights(origin: string, destination: string, excludeId: string) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data, error } = await supabase
    .from('flights')
    .select('*')
    .eq('origin', origin)
    .eq('destination', destination)
    .neq('id', excludeId)
    .eq('status', 'scheduled')
    .order('departs_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data as Flight[]) ?? [];
}
