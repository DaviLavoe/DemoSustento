import { Navigate } from 'react-router-dom';
import { useAuthSession } from '../hooks/useAuthSession';
import PantallaCarga from './ui/PantallaCarga';

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
