import { Navigate } from 'react-router-dom';
import { useAuthSession } from '../hooks/useAuthSession';
import PantallaCarga from './ui/PantallaCarga';

/**
 * Guard para rutas del dashboard de empresa.
 * Usa useAuthSession (cliente supabase regular).
 * El superadmin tiene su propio guard (RutaSuperAdmin) con cliente aislado.
 */
export default function RutaProtegida({ children }) {
  const { session, isLoading } = useAuthSession();

  if (isLoading) {
    return <PantallaCarga />;
  }

  if (!session) {
    return <Navigate to="/iniciar-sesion" replace />;
  }

  return children;
}
