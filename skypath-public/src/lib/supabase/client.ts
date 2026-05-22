import { createClient } from '@/utils/supabase/client';

const supabaseBrowserClient = createClient();

export function getSupabaseBrowserClient() {
  return supabaseBrowserClient;
}
