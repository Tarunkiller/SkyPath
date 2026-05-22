export type SeatClass = 'economy' | 'business' | 'first';
export type FlightStatus = 'scheduled' | 'delayed' | 'cancelled' | 'departed' | 'landed';
export type BookingStatus = 'confirmed' | 'rescheduled' | 'cancelled';

export interface Flight {
  id: string;
  flight_no: string;
  origin: string;
  destination: string;
  departs_at: string;
  arrives_at: string;
  aircraft_type: string;
  status: FlightStatus;
  base_price: number;
}

export interface Seat {
  id: string;
  flight_id: string;
  seat_number: string;
  class: SeatClass;
  is_available: boolean;
  extra_fee: number;
}

export interface Booking {
  id: string;
  user_id: string;
  seat_id: string;
  flight_id: string;
  pnr_code: string;
  total_price: number;
  status: BookingStatus;
  booked_at: string;
}

export interface Passenger {
  id: string;
  booking_id: string;
  full_name: string;
  passport_no: string;
  nationality: string;
  dob: string;
}

export interface Reschedule {
  id: string;
  booking_id: string;
  old_flight_id: string;
  new_flight_id: string;
  fee_charged: number;
  created_at: string;
}

export interface BookingWithRelations {
  booking: Booking;
  flight: Flight;
  seat: Seat;
  passenger: Passenger;
}

export interface SearchParams {
  origin: string;
  destination: string;
  date: string;
  pax: number;
  cabinClass: SeatClass;
}

export interface BookingPayload {
  flightId: string;
  seatId: string;
  fullName: string;
  passportNo: string;
  nationality: string;
  dob: string;
}

export interface RpcReserveResult {
  booking_id: string;
  pnr_code: string;
  status: BookingStatus;
  total_price: number;
  booked_at: string;
}
