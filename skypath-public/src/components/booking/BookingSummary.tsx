'use client';

import { useMemo } from 'react';
import { useFlightStore } from '../../store/flightStore';
import { formatINR } from '../../lib/utils';

export function BookingSummary() {
  const selectedFlight = useFlightStore((state) => state.selectedFlight);
  const selectedSeat = useFlightStore((state) => state.selectedSeat);
  const passengerForm = useFlightStore((state) => state.passengerForm);

  const subtotal = useMemo(() => {
    if (!selectedFlight || !selectedSeat) return 0;
    return selectedFlight.base_price + selectedSeat.extra_fee;
  }, [selectedFlight, selectedSeat]);

  if (!selectedFlight || !selectedSeat) {
    return <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-500">Select a seat and passenger details to see the booking summary.</div>;
  }

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Booking summary</h2>
      <div className="grid gap-3">
        <div className="grid gap-2 rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Passenger</p>
          <p className="text-base font-semibold text-slate-900">{passengerForm.fullName || 'Passenger name pending'}</p>
          <p className="text-sm text-slate-500">{passengerForm.nationality || 'Nationality pending'}</p>
        </div>
        <div className="grid gap-2 rounded-2xl bg-slate-50 p-4">
          <div className="flex justify-between text-sm text-slate-500"><span>Base fare</span><span>{formatINR(selectedFlight.base_price)}</span></div>
          <div className="flex justify-between text-sm text-slate-500"><span>Seat surcharge</span><span>{formatINR(selectedSeat.extra_fee)}</span></div>
          <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900"><span>Total</span><span>{formatINR(subtotal)}</span></div>
        </div>
      </div>
    </div>
  );
}
