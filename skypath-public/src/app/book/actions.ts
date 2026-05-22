'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '../../lib/supabase/server';

interface CreateBookingPayload {
  flightId: string;
  seatId: string;
  totalPrice: number;
  fullName: string;
  passportNo: string;
  nationality: string;
  dob: string;
}

export async function createBooking(payload: CreateBookingPayload) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const result = await supabase.rpc('reserve_seat', {
    p_user_id: user.id,
    p_flight_id: payload.flightId,
    p_seat_id: payload.seatId,
    p_total_price: payload.totalPrice,
    p_full_name: payload.fullName,
    p_passport_no: payload.passportNo,
    p_nationality: payload.nationality,
    p_dob: payload.dob,
  });

  if (result.error) {
    if (result.error.code === 'P0002') {
      throw new Error('The seat is already taken. Please choose another seat.');
    }
    throw new Error(result.error.message);
  }

  return result.data;
}

export async function cancelBooking(bookingId: string) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const result = await supabase.rpc('cancel_booking_atomic', { p_booking_id: bookingId });
  if (result.error) {
    if (result.error.message?.includes('Cancellation blocked')) {
      throw new Error('CANCELLATION_BLOCKED');
    }
    throw new Error(result.error.message);
  }

  return result.data;
}

export async function rescheduleBooking(bookingId: string, newFlightId: string, newSeatId: string) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const result = await supabase.rpc('reschedule_booking', {
    p_booking_id: bookingId,
    p_new_flight_id: newFlightId,
    p_new_seat_id: newSeatId,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}
