import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

/**
 * Hook de sesión para admins de empresa (cliente supabase regular).
 * El superadmin usa useSuperAdminSession (cliente supabaseAdmin aislado).
 */
export function useAuthSession() {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, isLoading };
}
