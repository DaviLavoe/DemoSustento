import { Navigate, useParams } from 'react-router-dom';
import { useAuthSession } from '../hooks/useAuthSession';
import PantallaCarga from './ui/PantallaCarga';

/**
 * Guard para rutas del dashboard de empresa.
 * Usa useAuthSession (cliente supabase regular).
 * El slug siempre está disponible desde useParams() ya que la ruta
 * es /login/:slug/dashboard/* — se usa para redirigir al login correcto
 * si la sesión expira o no existe.
 */
export default function RutaProtegida({ children }) {
  const { session, isLoading } = useAuthSession();
  // El slug viene de /login/:slug/dashboard/*
  const { slug } = useParams();

  if (isLoading) {
    return <PantallaCarga slug={slug} />;
  }

  if (!session) {
    // Redirigir al login de ESTA empresa específica
    if (slug) {
      return <Navigate to={`/login/${slug}`} replace />;
    }
    return <Navigate to="/superadmin/login" replace />;
  }

  return children;
}
