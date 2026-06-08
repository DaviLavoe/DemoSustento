import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Cliente Supabase EXCLUSIVO para el Panel Super-Admin.
 *
 * Usa un storageKey diferente ('sb_superadmin') para que la sesión del
 * superadmin se almacene bajo una clave separada en localStorage.
 * Esto permite que el superadmin y un admin de empresa tengan sesiones
 * simultáneas en el mismo navegador sin que se pisen mutuamente.
 */
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://ejemplo.supabase.co',
  supabaseAnonKey || 'public-anon-key',
  {
    auth: {
      storageKey: 'sb_superadmin_session',
      autoRefreshToken: true,
      persistSession: true,
      broadcast: false,
    }
  }
);
