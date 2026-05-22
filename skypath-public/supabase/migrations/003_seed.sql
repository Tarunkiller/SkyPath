-- supabase/migrations/003_seed.sql

INSERT INTO flights(flight_no, origin, destination, departs_at, arrives_at, aircraft_type, base_price)
VALUES
  ('TK101', 'Delhi', 'Mumbai', NOW() + INTERVAL '1 day 03 hours', NOW() + INTERVAL '1 day 05 hours', 'Airbus A320', 1800),
  ('TK102', 'Delhi', 'Mumbai', NOW() + INTERVAL '2 day 06 hours', NOW() + INTERVAL '2 day 08 hours', 'Airbus A320', 2000),
  ('TK201', 'Mumbai', 'Hyderabad', NOW() + INTERVAL '1 day 08 hours', NOW() + INTERVAL '1 day 10 hours', 'Boeing 737', 2200),
  ('TK202', 'Mumbai', 'Hyderabad', NOW() + INTERVAL '4 day 09 hours', NOW() + INTERVAL '4 day 11 hours', 'Boeing 737', 2400),
  ('TK301', 'Hyderabad', 'Chennai', NOW() + INTERVAL '2 day 04 hours', NOW() + INTERVAL '2 day 06 hours', 'Airbus A320', 1600),
  ('TK302', 'Hyderabad', 'Chennai', NOW() + INTERVAL '5 day 07 hours', NOW() + INTERVAL '5 day 09 hours', 'Airbus A320', 1800),
  ('TK401', 'Chennai', 'Bengaluru', NOW() + INTERVAL '1 day 02 hours', NOW() + INTERVAL '1 day 03 hours 30 minutes', 'Embraer E195', 1700),
  ('TK402', 'Chennai', 'Bengaluru', NOW() + INTERVAL '3 day 05 hours', NOW() + INTERVAL '3 day 06 hours 30 minutes', 'Embraer E195', 1900);

DO $$
DECLARE
  flight_row RECORD;
  r INT;
  seat_column TEXT;
  seat_label TEXT;
  seat_class_value seat_class;
  extra_fee_value INTEGER;
  unavailable_seats TEXT[] := ARRAY['2A','2B','5C','7F','11A','11B','11C'];
BEGIN
  FOR flight_row IN SELECT id, base_price FROM flights LOOP
    FOR r IN 1..19 LOOP
      IF r = 1 THEN
        seat_class_value := 'first';
        extra_fee_value := 5000;
      ELSIF r BETWEEN 2 AND 3 THEN
        seat_class_value := 'business';
        extra_fee_value := 2000;
      ELSE
        seat_class_value := 'economy';
        extra_fee_value := 0;
      END IF;
      FOREACH seat_column IN ARRAY ARRAY['A','B','C','D','E','F'] LOOP
        seat_label := r::text || seat_column;
        INSERT INTO seats(flight_id, seat_number, class, extra_fee, is_available)
        VALUES (
          flight_row.id,
          seat_label,
          seat_class_value,
          extra_fee_value,
          NOT (seat_label = ANY(unavailable_seats))
        );
      END LOOP;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
