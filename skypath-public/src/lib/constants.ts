export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  search: '/search',
  bookings: '/bookings',
  offline: '/offline'
};

export const SEAT_CLASS_FEES = {
  first: 5000,
  business: 2000,
  economy: 0
} as const;

export const CABIN_CLASS_OPTIONS = [
  { value: 'economy', label: 'Economy' },
  { value: 'business', label: 'Business' },
  { value: 'first', label: 'First Class' }
] as const;

export const FLIGHT_STATUS_LABELS: Record<string, string> = {
  scheduled: 'Scheduled',
  delayed: 'Delayed',
  cancelled: 'Cancelled',
  departed: 'Departed',
  landed: 'Landed'
};
