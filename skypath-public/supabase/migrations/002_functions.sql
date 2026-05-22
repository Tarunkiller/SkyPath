-- supabase/migrations/002_functions.sql

CREATE OR REPLACE FUNCTION reserve_seat(
  p_user_id UUID,
  p_flight_id UUID,
  p_seat_id UUID,
  p_total_price INTEGER,
  p_full_name TEXT,
  p_passport_no TEXT,
  p_nationality TEXT,
  p_dob DATE
) RETURNS JSON AS $$
DECLARE
  locked_key BIGINT := ('x' || substr(md5(p_seat_id::text), 1, 16))::bit(64)::bigint;
  seat_record seats%ROWTYPE;
  booking_id UUID;
  passenger_id UUID;
  booking_json JSON;
BEGIN
  PERFORM pg_advisory_xact_lock(locked_key);
  SELECT * INTO seat_record FROM seats WHERE id = p_seat_id AND flight_id = p_flight_id FOR UPDATE;
  IF NOT FOUND OR NOT seat_record.is_available THEN
    RAISE EXCEPTION 'Seat is unavailable' USING ERRCODE = 'P0002';
  END IF;
  UPDATE seats SET is_available = FALSE WHERE id = p_seat_id;
  booking_id := gen_random_uuid();
  INSERT INTO bookings(id, user_id, seat_id, flight_id, total_price, status)
  VALUES (booking_id, p_user_id, p_seat_id, p_flight_id, p_total_price, 'confirmed');
  passenger_id := gen_random_uuid();
  INSERT INTO passengers(id, booking_id, full_name, passport_no, nationality, dob)
  VALUES (passenger_id, booking_id, p_full_name, p_passport_no, p_nationality, p_dob);
  SELECT json_build_object(
    'booking_id', booking_id,
    'pnr_code', (SELECT pnr_code FROM bookings WHERE id = booking_id),
    'status', 'confirmed',
    'total_price', p_total_price,
    'booked_at', (SELECT booked_at FROM bookings WHERE id = booking_id)
  ) INTO booking_json;
  RETURN booking_json;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE ALL ON FUNCTION reserve_seat(UUID, UUID, UUID, INTEGER, TEXT, TEXT, TEXT, DATE) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION reserve_seat(UUID, UUID, UUID, INTEGER, TEXT, TEXT, TEXT, DATE) TO authenticated;

CREATE OR REPLACE FUNCTION cancel_booking_atomic(p_booking_id UUID) RETURNS JSON AS $$
DECLARE
  booking_record bookings%ROWTYPE;
  result JSON;
BEGIN
  SELECT * INTO booking_record FROM bookings WHERE id = p_booking_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found' USING ERRCODE = 'P0003';
  END IF;
  IF auth.uid()::text <> booking_record.user_id::text THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = 'P0004';
  END IF;
  UPDATE bookings SET status = 'cancelled' WHERE id = p_booking_id;
  UPDATE seats SET is_available = TRUE WHERE id = booking_record.seat_id;
  result := json_build_object('success', TRUE, 'booking_id', p_booking_id);
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE ALL ON FUNCTION cancel_booking_atomic(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION cancel_booking_atomic(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION reschedule_booking(
  p_booking_id UUID,
  p_new_flight_id UUID,
  p_new_seat_id UUID
) RETURNS JSON AS $$
DECLARE
  old_booking bookings%ROWTYPE;
  old_seat seats%ROWTYPE;
  new_seat seats%ROWTYPE;
  old_flight flights%ROWTYPE;
  new_flight flights%ROWTYPE;
  fee INTEGER;
  locked_key BIGINT := ('x' || substr(md5(p_new_seat_id::text), 1, 16))::bit(64)::bigint;
  result JSON;
BEGIN
  SELECT * INTO old_booking FROM bookings WHERE id = p_booking_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found' USING ERRCODE = 'P0003';
  END IF;
  IF auth.uid()::text <> old_booking.user_id::text THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = 'P0004';
  END IF;

  SELECT * INTO old_seat FROM seats WHERE id = old_booking.seat_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Original seat not found' USING ERRCODE = 'P0005';
  END IF;

  SELECT * INTO new_seat FROM seats WHERE id = p_new_seat_id AND flight_id = p_new_flight_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Seat not found for new flight' USING ERRCODE = 'P0005';
  END IF;

  SELECT * INTO old_flight FROM flights WHERE id = old_seat.flight_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Original flight not found' USING ERRCODE = 'P0006';
  END IF;
  SELECT * INTO new_flight FROM flights WHERE id = new_seat.flight_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'New flight not found' USING ERRCODE = 'P0006';
  END IF;

  IF old_flight.origin <> new_flight.origin OR old_flight.destination <> new_flight.destination THEN
    RAISE EXCEPTION 'Route mismatch' USING ERRCODE = 'P0007';
  END IF;

  PERFORM pg_advisory_xact_lock(locked_key);
  SELECT * INTO new_seat FROM seats WHERE id = p_new_seat_id FOR UPDATE;
  IF NOT new_seat.is_available THEN
    RAISE EXCEPTION 'New seat unavailable' USING ERRCODE = 'P0002';
  END IF;

  UPDATE seats SET is_available = TRUE WHERE id = old_booking.seat_id;
  UPDATE seats SET is_available = FALSE WHERE id = p_new_seat_id;

  fee := GREATEST(0, (SELECT base_price + extra_fee FROM flights JOIN seats ON flights.id = seats.flight_id WHERE seats.id = p_new_seat_id) - old_booking.total_price);

  UPDATE bookings
    SET flight_id = p_new_flight_id,
        seat_id = p_new_seat_id,
        status = 'rescheduled',
        total_price = (SELECT base_price + extra_fee FROM flights JOIN seats ON flights.id = seats.flight_id WHERE seats.id = p_new_seat_id)
    WHERE id = p_booking_id;

  INSERT INTO reschedules(booking_id, old_flight_id, new_flight_id, fee_charged)
    VALUES (p_booking_id, old_booking.flight_id, p_new_flight_id, fee);

  result := json_build_object('success', TRUE, 'booking_id', p_booking_id, 'fee_charged', fee);
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE ALL ON FUNCTION reschedule_booking(UUID, UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION reschedule_booking(UUID, UUID, UUID) TO authenticated;
