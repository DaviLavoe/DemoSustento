import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid, Building2, BarChart3, LogOut, Menu, X,
  Shield, ChevronRight, Zap, Users, Globe
} from 'lucide-react';
import { supabaseAdmin } from '../../config/supabaseAdmin';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import ClickSpark from '../../components/ClickSpark';

const navItems = [
  { name: 'Empresas', path: '/superadmin/empresas', icon: Building2, desc: 'Gestión de tenants' },
  { name: 'Estadísticas', path: '/superadmin/estadisticas', icon: BarChart3, desc: 'Métricas globales' },
  { name: 'Usuarios', path: '/superadmin/usuarios', icon: Users, desc: 'Cuentas de super-admin' },
];

export default function SuperAdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    supabaseAdmin.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  const handleCerrarSesion = async () => {
    await supabaseAdmin.auth.signOut();
    navigate('/superadmin/login');
  };

  const isActive = (path) => location.pathname.startsWith(path);

  const activePageTitle = () => {
    const item = navItems.find((n) => isActive(n.path));
    return item?.name || 'Super Admin';
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Super Admin';

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-[#06060a] selection:bg-violet-500 selection:text-white transition-colors duration-300 text-slate-800 dark:text-neutral-100">
      <ClickSpark sparkColor='#7c3aed' sparkSize={10} sparkRadius={16} sparkCount={6} duration={350}>
        <div className="flex w-full min-h-screen relative overflow-hidden">

          {/* ── Sidebar ── */}
          <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-[#0d0d14] border-r border-slate-200 dark:border-white/5 flex flex-col justify-between transition-all duration-300 lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>

            {/* Header del Sidebar */}
            <div>
              <div className="p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between lg:justify-start relative">
                <Link to="/superadmin" className="flex items-center gap-3 group">
                  {/* Logo Super-Admin: globo con gradiente */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-violet-900/40 group-hover:scale-105 transition-transform">
                    <Globe size={18} className="text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-900 dark:text-white font-bold text-sm leading-tight tracking-tight">GlobalInventory</span>
                    <span className="text-violet-650 dark:text-violet-400 text-[10px] font-semibold uppercase tracking-widest leading-tight">Admin Panel</span>
                  </div>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden absolute right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-neutral-400 hover:text-slate-800 dark:hover:text-white transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Etiqueta de entorno */}
              <div className="mx-4 mt-4 px-3 py-2 rounded-lg bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 flex items-center gap-2">
                <Zap size={12} className="text-violet-650 dark:text-violet-400" />
                <span className="text-violet-700 dark:text-violet-300 text-[11px] font-semibold">Panel de Control Global</span>
              </div>

              {/* Navegación */}
              <nav className="px-4 py-5 space-y-1">
                {navItems.map((item) => {
                  const IconComp = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                        active
                          ? 'bg-violet-50 dark:bg-gradient-to-r dark:from-violet-600/30 dark:to-indigo-600/20 text-violet-750 dark:text-white border border-violet-200 dark:border-violet-500/30 shadow-sm shadow-violet-500/5 dark:shadow-violet-900/20 translate-x-1'
                          : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-white/5 hover:translate-x-0.5'
                      }`}
                    >
                      <IconComp size={17} className={active ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-neutral-500 group-hover:text-slate-600 dark:group-hover:text-neutral-300'} />
                      <div className="flex-1">
                        <span>{item.name}</span>
                        <p className="text-[10px] text-slate-500 dark:text-neutral-500 font-normal leading-tight">{item.desc}</p>
                      </div>
                      {active && <ChevronRight size={14} className="text-violet-600 dark:text-violet-400 ml-auto" />}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Footer del Sidebar */}
            <div className="p-4 border-t border-slate-200 dark:border-white/5 space-y-3">
              {user && (
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white text-xs font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-white truncate capitalize">{displayName}</p>
                    <p className="text-[10px] text-violet-600 dark:text-violet-400 font-semibold">Super Administrador</p>
                  </div>
                </div>
              )}
              <button
                onClick={handleCerrarSesion}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200 group"
              >
                <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                Cerrar sesión
              </button>
            </div>
          </aside>

          {/* Overlay móvil */}
          {sidebarOpen && (
            <div
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-30 bg-black/40 dark:bg-black/60 backdrop-blur-xs lg:hidden"
            />
          )}

          {/* ── Contenido Principal ── */}
          <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

            {/* Header */}
            <header className="h-16 bg-white dark:bg-[#0d0d14] border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-6 z-20 transition-colors duration-300">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white transition-all"
                >
                  <Menu size={20} />
                </button>
                <div className="flex items-center gap-2">
                  <LayoutGrid size={16} className="text-violet-600 dark:text-violet-400" />
                  <h1 className="font-semibold text-lg text-slate-800 dark:text-white tracking-tight">
                    {activePageTitle()}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <ThemeToggle />
                {/* Badge de rol */}
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-500/15 border border-violet-100 dark:border-violet-500/25">
                  <Shield size={11} className="text-violet-600 dark:text-violet-400" />
                  <span className="text-[11px] font-semibold text-violet-700 dark:text-violet-300 uppercase tracking-wider">Super Admin</span>
                </div>
              </div>
            </header>

            {/* Contenido dinámico */}
            <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#06060a] p-6 md:p-8 transition-colors duration-300">
              <div className="max-w-7xl mx-auto">
                <Outlet />
              </div>
            </main>
          </div>

        </div>
      </ClickSpark>
    </div>
  );
}
