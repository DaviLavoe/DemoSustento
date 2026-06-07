import { Navigate } from 'react-router-dom';
import { useSuperAdminSession } from '../hooks/useSuperAdminSession';
import PantallaCarga from './ui/PantallaCarga';

/**
 * Guard de ruta exclusivo para el Panel Super-Admin.
 * Usa el cliente supabaseAdmin (sesión aislada) para que no interfiera
 * con la sesión de los admins de empresa.
 * - Sin sesión superadmin → redirige a /superadmin/login
 * - Sesión presente pero rol ≠ superadmin → redirige a /superadmin/login
 * - Superadmin válido → renderiza los children
 */
export default function RutaSuperAdmin({ children }) {
  const { session, isLoading, rol } = useSuperAdminSession();

  if (isLoading) {
    return <PantallaCarga isSuperAdmin={true} />;
  }

  if (!session || (rol !== null && rol !== 'superadmin')) {
    return <Navigate to="/superadmin/login" replace />;
  }

  if (rol === null) {
    return <PantallaCarga isSuperAdmin={true} />;
  }

  return children;
}
