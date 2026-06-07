import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Mapa de clientes Supabase por slug de empresa.
 * Se crea un cliente único por slug con su propio storageKey en localStorage.
 * Esto garantiza sesiones completamente independientes entre empresas:
 * - tech-store-lima  → localStorage key: "sb_empresa_tech-store-lima"
 * - moda-elegante    → localStorage key: "sb_empresa_moda-elegante"
 * - (nuevas empresas se crean automáticamente al primer uso)
 */
const clientCache = new Map();

/**
 * Retorna (o crea) el cliente Supabase aislado para la empresa identificada
 * por su slug. Cada cliente usa un storageKey distinto, por lo que sus
 * tokens JWT viven en claves de localStorage separadas y no se sobreescriben.
 *
 * @param {string} slug  - El slug de la empresa (ej: "tech-store-lima")
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function getSupabaseForSlug(slug) {
  if (!slug) {
    throw new Error('getSupabaseForSlug: se requiere un slug de empresa');
  }

  if (clientCache.has(slug)) {
    return clientCache.get(slug);
  }

  const client = createClient(
    supabaseUrl || 'https://ejemplo.supabase.co',
    supabaseAnonKey || 'public-anon-key',
    {
      auth: {
        // Clave única por empresa en localStorage
        storageKey: `sb_empresa_${slug}`,
        autoRefreshToken: true,
        persistSession: true,
      }
    }
  );

  clientCache.set(slug, client);
  return client;
}
