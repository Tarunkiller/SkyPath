import { create, type StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BookingPayload, Flight, Seat } from '../types/database';

export type BookingStep = 'select-seat' | 'passenger-details' | 'review';

interface PassengerFormState {
  fullName: string;
  passportNo: string;
  nationality: string;
  dob: string;
}

interface FlightState {
  searchQuery: {
    origin: string;
    destination: string;
    date: string;
    pax: number;
    cabinClass: 'economy' | 'business' | 'first';
  };
  searchResults: Flight[];
  selectedFlight: Flight | null;
  selectedSeat: Seat | null;
  currentStep: BookingStep;
  passengerForm: PassengerFormState;
  optimisticSeatId: string | null;
  confirmation: {
    bookingId: string;
    pnr: string;
  } | null;
  setSearchQuery: (query: FlightState['searchQuery']) => void;
  setSearchResults: (results: Flight[]) => void;
  selectFlight: (flight: Flight) => void;
  setSelectedSeat: (seat: Seat) => void;
  selectSeatOptimistic: (seatId: string) => void;
  clearOptimisticSeat: () => void;
  updatePassengerForm: (partial: Partial<PassengerFormState>) => void;
  setCurrentStep: (step: BookingStep) => void;
  setConfirmation: (confirmation: { bookingId: string; pnr: string } | null) => void;
  resetBooking: () => void;
}

export const useFlightStore = create<FlightState>()(
  persist(
    ((set) => ({
      searchQuery: { origin: '', destination: '', date: '', pax: 1, cabinClass: 'economy' },
      searchResults: [],
      selectedFlight: null,
      selectedSeat: null,
      currentStep: 'select-seat',
      passengerForm: { fullName: '', passportNo: '', nationality: '', dob: '' },
      optimisticSeatId: null,
      confirmation: null,
      setSearchQuery: (query: FlightState['searchQuery']) => set({ searchQuery: query }),
      setSearchResults: (results: Flight[]) => set({ searchResults: results }),
      selectFlight: (flight: Flight) => set({ selectedFlight: flight, selectedSeat: null, currentStep: 'select-seat' }),
      setSelectedSeat: (seat: Seat) => set({ selectedSeat: seat }),
      selectSeatOptimistic: (seatId: string) => set({ optimisticSeatId: seatId }),
      clearOptimisticSeat: () => set({ optimisticSeatId: null }),
      updatePassengerForm: (partial: Partial<PassengerFormState>) => set((state: FlightState) => ({ passengerForm: { ...state.passengerForm, ...partial } })),
      setCurrentStep: (step: BookingStep) => set({ currentStep: step }),
      setConfirmation: (confirmation: { bookingId: string; pnr: string } | null) => set({ confirmation }),
      resetBooking: () => set({ selectedFlight: null, selectedSeat: null, currentStep: 'select-seat', passengerForm: { fullName: '', passportNo: '', nationality: '', dob: '' }, optimisticSeatId: null, confirmation: null }),
    })) as StateCreator<FlightState>,
    {
      name: 'skypath-flight-store',
      partialize: (state: FlightState) => ({
        searchQuery: state.searchQuery,
        selectedFlight: state.selectedFlight,
        currentStep: state.currentStep,
        passengerForm: {
          fullName: state.passengerForm.fullName,
          nationality: state.passengerForm.nationality,
          dob: state.passengerForm.dob,
        },
      }),
    }
  )
);
