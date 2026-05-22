import { create, type StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session, User } from '@supabase/supabase-js';
import type { Booking } from '../types/database';

export interface UserState {
  session: Session | null;
  user: User | null;
  cachedBookings: Booking[];
  isLoadingBookings: boolean;
  setSession: (session: Session | null) => void;
  clearSession: () => void;
  setCachedBookings: (bookings: Booking[]) => void;
  updateBookingStatus: (bookingId: string, status: Booking['status']) => void;
  setLoadingBookings: (isLoading: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    ((set) => ({
      session: null,
      user: null,
      cachedBookings: [],
      isLoadingBookings: false,
      setSession: (session: Session | null) => set({ session, user: session?.user ?? null }),
      clearSession: () => set({ session: null, user: null, cachedBookings: [] }),
      setCachedBookings: (bookings: Booking[]) => set({ cachedBookings: bookings }),
      updateBookingStatus: (bookingId: string, status: Booking['status']) => set((state: UserState) => ({ cachedBookings: state.cachedBookings.map((booking) => (booking.id === bookingId ? { ...booking, status } : booking)) })),
      setLoadingBookings: (isLoading: boolean) => set({ isLoadingBookings: isLoading }),
    })) as StateCreator<UserState>,
    {
      name: 'skypath-user-store',
      partialize: (state: UserState) => ({
        session: state.session ? {
          access_token: state.session.access_token,
          refresh_token: state.session.refresh_token,
          expires_at: state.session.expires_at,
          token_type: state.session.token_type,
          user: state.session.user,
        } : null,
      }),
    }
  )
);
