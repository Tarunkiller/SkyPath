'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SeatMap } from '../seat/SeatMap';
import { PassengerForm } from './PassengerForm';
import { BookingSummary } from './BookingSummary';
import { PaymentForm, type PaymentMethod } from './PaymentForm';
import { Button } from '../ui/Button';
import { Toast } from '../ui/Toast';
import { useFlightStore } from '../../store/flightStore';
import { createBooking } from '../../app/book/actions';
import { formatINR } from '../../lib/utils';
import type { Seat, Flight } from '../../types/database';

interface FlightBookingShellProps {
  flight: Flight;
  seats: Seat[];
}

export function FlightBookingShell({ flight, seats }: FlightBookingShellProps) {
  const router = useRouter();
  const selectedSeat = useFlightStore((state) => state.selectedSeat);
  const passengerForm = useFlightStore((state) => state.passengerForm);
  const setSelectedSeat = useFlightStore((state) => state.setSelectedSeat);
  const setConfirmation = useFlightStore((state) => state.setConfirmation);
  
  // Payment Form States
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cardDetails, setCardDetails] = useState({ name: '', number: '', expiry: '', cvv: '' });
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  
  // UPI QR Code state
  const [showQR, setShowQR] = useState(false);
  const [qrPaid, setQrPaid] = useState(false);

  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSeatConfirmed = (seat: Seat) => {
    setSelectedSeat(seat);
  };

  const handleSubmit = async () => {
    if (!selectedSeat) {
      setToast({ message: 'Select a seat before booking.', variant: 'error' });
      return;
    }
    if (!passengerForm.fullName || !passengerForm.passportNo || !passengerForm.nationality || !passengerForm.dob) {
      setToast({ message: 'Complete passenger details before booking.', variant: 'error' });
      return;
    }

    // Payment Validation
    if (paymentMethod === 'card') {
      if (!cardDetails.name || !cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
        setToast({ message: 'Complete card payment details.', variant: 'error' });
        return;
      }
      if (cardDetails.number.replace(/\s/g, '').length !== 16) {
        setToast({ message: 'Card number must be 16 digits.', variant: 'error' });
        return;
      }
      if (cardDetails.expiry.length !== 5) {
        setToast({ message: 'Expiry date must be in MM/YY format.', variant: 'error' });
        return;
      }
      if (cardDetails.cvv.length !== 3) {
        setToast({ message: 'CVV must be 3 digits.', variant: 'error' });
        return;
      }
    } else if (paymentMethod === 'upi') {
      if (!upiId && !qrPaid) {
        setToast({ message: 'Please enter a UPI ID or generate & pay via QR Code.', variant: 'error' });
        return;
      }
    } else if (paymentMethod === 'netbanking') {
      if (!selectedBank) {
        setToast({ message: 'Please select your bank for Net Banking.', variant: 'error' });
        return;
      }
    }

    setLoading(true);
    try {
      const result = await createBooking({
        flightId: flight.id,
        seatId: selectedSeat.id,
        fullName: passengerForm.fullName,
        passportNo: passengerForm.passportNo,
        nationality: passengerForm.nationality,
        dob: passengerForm.dob,
        totalPrice: flight.base_price + selectedSeat.extra_fee,
      });

      setConfirmation({ bookingId: result.booking_id, pnr: result.pnr_code });
      router.push(`/confirm/${result.booking_id}`);
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : 'Unable to complete booking.', variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_0.6fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Choose your seat</h2>
          <p className="mt-2 text-sm text-slate-600">Tap on an available seat to reserve it for booking.</p>
          <div className="mt-6">
            <SeatMap flightId={flight.id} initialSeats={seats} onSeatConfirmed={handleSeatConfirmed} />
          </div>
        </div>
        <div className="space-y-6">
          <PassengerForm />
          
          <PaymentForm
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            cardDetails={cardDetails}
            setCardDetails={setCardDetails}
            upiId={upiId}
            setUpiId={setUpiId}
            selectedBank={selectedBank}
            setSelectedBank={setSelectedBank}
            onOpenQR={() => setShowQR(true)}
          />

          {qrPaid && paymentMethod === 'upi' && (
            <div className="rounded-3xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 font-semibold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-green-600">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              UPI QR Code payment verified!
            </div>
          )}

          <BookingSummary />
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <Button type="button" onClick={handleSubmit} disabled={loading} className="w-full">
              {loading ? 'Processing payment...' : 'Pay & Confirm booking'}
            </Button>
          </div>
        </div>
      </div>

      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-center space-y-4 border border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Scan QR Code to Pay</h3>
              <p className="mt-1 text-xs text-slate-500">Scan using GPay, PhonePe, Paytm, or any UPI App.</p>
            </div>
            
            <div className="mx-auto w-48 h-48 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center p-3">
              <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 fill-current">
                <rect x="0" y="0" width="20" height="20" />
                <rect x="5" y="5" width="10" height="10" fill="white" />
                <rect x="7" y="7" width="6" height="6" />
                
                <rect x="80" y="0" width="20" height="20" />
                <rect x="85" y="5" width="10" height="10" fill="white" />
                <rect x="87" y="7" width="6" height="6" />

                <rect x="0" y="80" width="20" height="20" />
                <rect x="5" y="85" width="10" height="10" fill="white" />
                <rect x="7" y="87" width="6" height="6" />

                <rect x="30" y="5" width="5" height="15" />
                <rect x="40" y="10" width="10" height="5" />
                <rect x="60" y="0" width="5" height="5" />
                <rect x="70" y="15" width="5" height="10" />

                <rect x="35" y="30" width="15" height="10" />
                <rect x="55" y="35" width="10" height="5" />
                <rect x="75" y="30" width="5" height="15" />

                <rect x="30" y="50" width="25" height="5" />
                <rect x="60" y="55" width="10" height="15" />
                <rect x="75" y="50" width="15" height="10" />

                <rect x="30" y="70" width="5" height="20" />
                <rect x="45" y="80" width="15" height="5" />
                <rect x="65" y="85" width="10" height="10" />
                <rect x="85" y="75" width="5" height="10" />
                <rect x="90" y="90" width="10" height="10" />
              </svg>
            </div>

            <div className="text-2xl font-bold text-indigo-600">
              {formatINR(flight.base_price + (selectedSeat?.extra_fee ?? 0))}
            </div>

            <div className="bg-indigo-50 rounded-2xl p-4 text-xs text-indigo-800 text-left space-y-2">
              <p className="font-semibold text-center text-indigo-900">Demo Simulation</p>
              <p className="text-slate-600">This simulates a successful instant scan and callback trigger from the payment gateway.</p>
              <Button
                type="button"
                onClick={() => {
                  setQrPaid(true);
                  setShowQR(false);
                  setToast({ message: 'UPI Payment Confirmed successfully!', variant: 'success' });
                }}
                className="w-full bg-indigo-600 text-white hover:bg-indigo-700 text-xs py-2 rounded-xl"
              >
                Simulate Payment Success
              </Button>
            </div>

            <Button
              variant="ghost"
              type="button"
              onClick={() => setShowQR(false)}
              className="w-full border border-slate-200"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {toast ? <Toast message={toast.message} variant={toast.variant} open onClose={() => setToast(null)} /> : null}
    </div>
  );
}
