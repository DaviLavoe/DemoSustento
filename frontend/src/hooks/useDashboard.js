import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { getSupabaseForSlug } from '../config/supabaseEmpresa';
import { API_BASE_URL } from '../config/api';
import { Package, Settings, BarChart3, Users } from 'lucide-react';

export function useDashboard() {
  const [user, setUser] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  // El slug siempre está disponible en la URL: /login/:slug/dashboard/*
  const { slug } = useParams();

  // Cliente Supabase aislado específico para esta empresa
  const supabase = getSupabaseForSlug(slug);

  useEffect(() => {
    async function cargarDatosUsuario() {
      // Obtener sesión actual y refrescar si está expirada
      let { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError || !refreshData.session) {
          await supabase.auth.signOut();
          navigate(`/login/${slug}`);
          return;
        }
        session = refreshData.session;
      }

      setUser(session.user);

      try {
        let response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Intentar refresco silencioso y reintentar
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            if (!refreshError && refreshData?.session) {
              const retryResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
                headers: {
                  'Authorization': `Bearer ${refreshData.session.access_token}`
                }
              });
              if (retryResponse.ok) {
                const data = await retryResponse.json();
                if (data.success && data.empresa) {
                  setEmpresa(data.empresa);
                }
                if (data.success && data.user) {
                  setUser((prev) => ({ ...prev, ...data.user }));
                }
                return;
              }
            }
            await supabase.auth.signOut();
            navigate(`/login/${slug}`);
            return;
          }
        } else {
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
  }, [slug]);

  const handleCerrarSesion = async () => {
    try {
      // El slug siempre está en la URL — no dependemos de estado asíncrono
      await supabase.auth.signOut();
      navigate(`/login/${slug}`);
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  // Las rutas de navegación usan el slug de la URL
  const basePath = `/login/${slug}/dashboard`;

  const navItems = [
    {
      name: 'Inventario',
      path: `${basePath}/inventario`,
      icon: Package,
    },
    {
      name: 'Reportes',
      path: `${basePath}/reportes`,
      icon: BarChart3,
    },
    ...(user?.rol === 'admin' ? [{
      name: 'Trabajadores',
      path: `${basePath}/usuarios`,
      icon: Users,
    }] : []),
    {
      name: 'Configuración',
      path: `${basePath}/configuracion`,
      icon: Settings,
    }
  ];

  const isActive = (path) => {
    if (path === `${basePath}/inventario` && location.pathname === basePath) {
      return true;
    }
    return location.pathname === path;
  };

  const pageTitles = {
    [basePath]: empresa?.nombre || 'Inventario',
    [`${basePath}/inventario`]: empresa?.nombre || 'Inventario',
    [`${basePath}/reportes`]: 'Reportes y Analíticas',
    [`${basePath}/configuracion`]: 'Configuración',
    [`${basePath}/usuarios`]: 'Trabajadores',
  };

  const activePageTitle = () => pageTitles[location.pathname] || 'Dashboard';

  // Actualizar el título del tab del navegador dinámicamente
  useEffect(() => {
    const title = pageTitles[location.pathname] || 'Dashboard';
    document.title = empresa
      ? `${title} · ${empresa.nombre}`
      : `${title} · Global Inventory`;
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
    empresaSlug: slug || empresa?.slug || null
  };
}
