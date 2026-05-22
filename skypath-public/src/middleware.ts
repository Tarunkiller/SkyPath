import type { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);
  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ['/', '/search/:path*', '/book/:path*', '/confirm/:path*', '/bookings/:path*', '/login', '/register'],
};
