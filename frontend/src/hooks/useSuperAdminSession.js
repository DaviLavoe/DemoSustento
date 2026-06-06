import { useState, useEffect } from 'react';
import { supabaseAdmin } from '../config/supabaseAdmin';

/**
 * Hook de sesión EXCLUSIVO para el Panel Super-Admin.
 * Usa el cliente supabaseAdmin (storageKey: 'sb_superadmin_session')
 * para que la sesión del superadmin sea completamente independiente
 * de la sesión de los admins de empresa.
 */
export function useSuperAdminSession() {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rol, setRol] = useState(null);

  useEffect(() => {
    supabaseAdmin.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) setIsLoading(false);
    });

    const { data: { subscription } } = supabaseAdmin.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setRol(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Obtener y verificar el rol cuando hay sesión activa
  useEffect(() => {
    if (!session) return;

    const verificarRol = async () => {
      try {
        const { data: usuarioData } = await supabaseAdmin
          .from('usuarios')
          .select('rol')
          .eq('id', session.user.id)
          .single();

        setRol(usuarioData?.rol || null);
      } catch {
        setRol(null);
      } finally {
        setIsLoading(false);
      }
    };

    verificarRol();
  }, [session]);

  return { session, isLoading, rol };
}
