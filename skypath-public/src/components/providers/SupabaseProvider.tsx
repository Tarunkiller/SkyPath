'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { Session } from '@supabase/supabase-js';
import { useUserStore } from '../../store/userStore';
import type { UserState } from '../../store/userStore';

interface SupabaseProviderProps {
  children: ReactNode;
}

export function SupabaseProvider({ children }: SupabaseProviderProps) {
  const setSession = useUserStore((state: UserState) => state.setSession);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      if (data.session) {
        setSession(data.session);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setSession(session);
    });
    return () => listener?.subscription.unsubscribe();
  }, [setSession]);

  return <>{children}</>;
}
