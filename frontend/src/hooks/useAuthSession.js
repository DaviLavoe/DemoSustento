import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSupabaseForSlug } from '../config/supabaseEmpresa';

/**
 * Hook de sesión para admins de empresa.
 * Usa el cliente Supabase aislado por slug (storageKey único por empresa).
 * El superadmin usa useSuperAdminSession (cliente supabaseAdmin aislado).
 */
export function useAuthSession() {
  const { slug } = useParams();
  // Cliente Supabase aislado para esta empresa
  const supabaseClient = getSupabaseForSlug(slug);

  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [slug]); // Re-ejecutar si cambia el slug (cambio de empresa)

  return { session, isLoading };
}
