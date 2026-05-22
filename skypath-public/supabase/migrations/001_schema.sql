-- supabase/migrations/001_schema.sql

CREATE TYPE seat_class AS ENUM ('economy', 'business', 'first');
CREATE TYPE flight_status AS ENUM ('scheduled', 'delayed', 'cancelled', 'departed', 'landed');
CREATE TYPE booking_status AS ENUM ('confirmed', 'rescheduled', 'cancelled');

CREATE TABLE flights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_no TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  departs_at TIMESTAMPTZ NOT NULL,
  arrives_at TIMESTAMPTZ NOT NULL,
  aircraft_type TEXT NOT NULL,
  status flight_status NOT NULL DEFAULT 'scheduled',
  base_price INTEGER NOT NULL CHECK (base_price >= 0)
);

CREATE TABLE seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_id UUID NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
  seat_number TEXT NOT NULL,
  class seat_class NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  extra_fee INTEGER NOT NULL DEFAULT 0 CHECK (extra_fee >= 0),
  UNIQUE(flight_id, seat_number)
);

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  seat_id UUID NOT NULL REFERENCES seats(id) ON DELETE RESTRICT,
  flight_id UUID NOT NULL REFERENCES flights(id) ON DELETE RESTRICT,
  pnr_code TEXT NOT NULL UNIQUE DEFAULT upper(substr(md5(random()::text), 1, 8)),
  total_price INTEGER NOT NULL CHECK (total_price >= 0),
  status booking_status NOT NULL DEFAULT 'confirmed',
  booked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE passengers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  passport_no TEXT NOT NULL,
  nationality TEXT NOT NULL,
  dob DATE NOT NULL
);

CREATE TABLE reschedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  old_flight_id UUID NOT NULL REFERENCES flights(id) ON DELETE RESTRICT,
  new_flight_id UUID NOT NULL REFERENCES flights(id) ON DELETE RESTRICT,
  fee_charged INTEGER NOT NULL CHECK (fee_charged >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_flights_route_departure ON flights(origin, destination, departs_at);
CREATE INDEX idx_seats_flight_availability ON seats(flight_id, is_available);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);

ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reschedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY public_read_flights ON flights
  FOR SELECT USING (true);

CREATE POLICY public_read_seats ON seats
  FOR SELECT USING (true);

CREATE POLICY user_bookings_policy ON bookings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_passengers_policy ON passengers
  FOR ALL USING (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = passengers.booking_id AND bookings.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = passengers.booking_id AND bookings.user_id = auth.uid()));

CREATE POLICY user_reschedules_policy ON reschedules
  FOR ALL USING (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = reschedules.booking_id AND bookings.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = reschedules.booking_id AND bookings.user_id = auth.uid()));

CREATE OR REPLACE FUNCTION enforce_cancellation_window() RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status <> 'cancelled' THEN
    PERFORM 1 FROM flights WHERE id = NEW.flight_id AND departs_at < NOW() + INTERVAL '2 hours';
    IF FOUND THEN
      RAISE EXCEPTION 'Cancellation blocked within 2 hours of departure' USING ERRCODE = 'P0001';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_enforce_cancellation_window
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION enforce_cancellation_window();
