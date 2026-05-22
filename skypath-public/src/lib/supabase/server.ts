import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export function createSupabaseServerClient() {
  return createClient(cookies());
}
