import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { Package, Settings } from 'lucide-react';

export function useDashboard() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const getUserData = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
    };
    getUserData();
  }, []);

  const handleCerrarSesion = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/iniciar-sesion');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  const navItems = [
    {
      name: 'Inventario',
      path: '/dashboard/inventario',
      icon: Package,
    },
    {
      name: 'Configuración',
      path: '/dashboard/configuracion',
      icon: Settings,
    }
  ];

  const isActive = (path) => {
    if (path === '/dashboard/inventario' && location.pathname === '/dashboard') {
      return true;
    }
    return location.pathname === path;
  };

  const activePageTitle = () => {
    if (location.pathname === '/dashboard' || location.pathname === '/dashboard/inventario') {
      return 'Inventario';
    }
    return location.pathname.split('/').pop();
  };

  return {
    user,
    sidebarOpen,
    setSidebarOpen,
    handleCerrarSesion,
    navItems,
    isActive,
    activePageTitle
  };
}
