import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { API_BASE_URL } from '../config/api';
import { Package, Settings, BarChart3, Users } from 'lucide-react';

export function useDashboard() {
  const [user, setUser] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function cargarDatosUsuario() {
      // supabase.auth funciona bien aunque el REST API no acepte la key
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      setUser(session.user);

      // Llamar al backend para obtener la empresa (el backend tiene acceso correcto a Supabase)
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.empresa) {
            setEmpresa(data.empresa);
          }
          if (data.success && data.user) {
            setUser((prev) => ({ ...prev, ...data.user }));
          }
        }
      } catch (err) {
        console.error('useDashboard: error al cargar empresa:', err);
      }
    }

    cargarDatosUsuario();
  }, []);

  const handleCerrarSesion = async () => {
    try {
      const slug = empresa?.slug;
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      if (slug) {
        navigate(`/login/${slug}`);
      } else {
        navigate('/iniciar-sesion');
      }
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
      name: 'Reportes',
      path: '/dashboard/reportes',
      icon: BarChart3,
    },
    ...(user?.rol === 'admin' ? [{
      name: 'Trabajadores',
      path: '/dashboard/usuarios',
      icon: Users,
    }] : []),
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

  const pageTitles = {
    '/dashboard': empresa?.nombre || 'Inventario',
    '/dashboard/inventario': empresa?.nombre || 'Inventario',
    '/dashboard/reportes': 'Reportes y Analíticas',
    '/dashboard/configuracion': 'Configuración',
    '/dashboard/usuarios': 'Trabajadores',
  };

  const activePageTitle = () => pageTitles[location.pathname] || 'Dashboard';

  // Actualizar el título del tab del navegador dinámicamente
  useEffect(() => {
    const title = pageTitles[location.pathname] || 'Dashboard';
    document.title = empresa
      ? `${title} · ${empresa.nombre}`
      : `${title} · Sustento`;
  }, [location.pathname, empresa]);

  return {
    user,
    empresa,
    setEmpresa,
    sidebarOpen,
    setSidebarOpen,
    handleCerrarSesion,
    navItems,
    isActive,
    activePageTitle,
    empresaSlug: empresa?.slug || null
  };
}
