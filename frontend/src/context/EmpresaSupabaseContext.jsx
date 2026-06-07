import { createContext, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { getSupabaseForSlug } from '../config/supabaseEmpresa';

/**
 * Contexto que expone el cliente Supabase aislado de la empresa actual.
 * Se obtiene via useParams() para leer el slug de la URL
 * (/login/:slug/dashboard/*) y devuelve el cliente correcto.
 *
 * Uso:
 *   const supabase = useEmpresaSupabase();
 *   const { data: { session } } = await supabase.auth.getSession();
 */
const EmpresaSupabaseContext = createContext(null);

export function EmpresaSupabaseProvider({ children }) {
  const { slug } = useParams();
  const client = getSupabaseForSlug(slug);

  return (
    <EmpresaSupabaseContext.Provider value={client}>
      {children}
    </EmpresaSupabaseContext.Provider>
  );
}

/**
 * Hook que retorna el cliente Supabase específico de la empresa activa.
 * Úsalo en CUALQUIER componente dentro del dashboard de empresa en lugar
 * de importar el `supabase` genérico.
 */
export function useEmpresaSupabase() {
  const client = useContext(EmpresaSupabaseContext);
  if (!client) {
    throw new Error(
      'useEmpresaSupabase debe usarse dentro de <EmpresaSupabaseProvider>. ' +
      'Asegúrate de que el componente esté dentro de la ruta /login/:slug/dashboard.'
    );
  }
  return client;
}
