import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { Package, Settings } from 'lucide-react';

export function useDashboard() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [empresaSlug, setEmpresaSlug] = useState('sustento-demo');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const getEmpresaData = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      if (currentUser) {
        // Obtener empresa_id de la tabla usuarios
        const { data: usuarioData, error: userError } = await supabase
          .from('usuarios')
          .select('empresa_id')
          .eq('id', currentUser.id)
          .single();

        if (!userError && usuarioData) {
          // Obtener slug de la tabla empresas
          const { data: empresaData, error: empresaError } = await supabase
            .from('empresas')
            .select('slug')
            .eq('id', usuarioData.empresa_id)
            .single();

          if (!empresaError && empresaData) {
            setEmpresaSlug(empresaData.slug);
          }
        }
      }
    };
    getEmpresaData();
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
    activePageTitle,
    empresaSlug
  };
}
