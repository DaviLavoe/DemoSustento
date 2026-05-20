import { Link, Outlet } from 'react-router-dom';
import { Menu, X, LogOut, User, ExternalLink } from 'lucide-react';
import ClickSpark from '../../components/ClickSpark';
import { useDashboard } from '../../hooks/useDashboard';

export default function DashboardLayout() {
  const {
    user,
    sidebarOpen,
    setSidebarOpen,
    handleCerrarSesion,
    navItems,
    isActive,
    activePageTitle,
    empresaSlug
  } = useDashboard();

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario';

  return (
    <div className="min-h-screen w-full flex bg-[#fafafa] selection:bg-[#1a1a1a] selection:text-white">
      <ClickSpark
        sparkColor='#000'
        sparkSize={10}
        sparkRadius={16}
        sparkCount={6}
        duration={350}
      >
        <div className="flex w-full min-h-screen relative overflow-hidden">
          
          {/* Sidebar para pantallas grandes */}
          <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#e5e5e5] flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 lg:static ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            
            {/* Header del Sidebar */}
            <div className="p-6 border-b border-[#e5e5e5] flex items-center justify-between">
              <Link to="/dashboard" className="flex items-center gap-3 group">
                <div className="w-9 h-9 bg-[#1a1a1a] rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-105 shadow-md">
                  <span className="text-white font-serif font-bold text-xl italic leading-none">S</span>
                </div>
                <span className="text-[#1a1a1a] text-lg font-medium tracking-widest uppercase">Sustento</span>
              </Link>
              {/* Botón de cerrar sidebar en móvil */}
              <button 
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-[#fafafa] text-[#666666] hover:text-[#1a1a1a] transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Links de Navegación */}
            <nav className="flex-1 px-4 py-6 space-y-1.5">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-[#1a1a1a] text-white shadow-sm shadow-[#1a1a1a]/10 translate-x-1'
                        : 'text-[#666666] hover:text-[#1a1a1a] hover:bg-[#fafafa] hover:translate-x-0.5'
                    }`}
                  >
                    <IconComponent size={18} className={active ? 'text-white' : 'text-[#666666]'} />
                    {item.name}
                  </Link>
                );
              })}
              
              {/* Enlace externo al catálogo público */}
              <a
                href={`/catalogo/${empresaSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-[#666666] hover:text-[#1a1a1a] hover:bg-[#fafafa] hover:translate-x-0.5 transition-all duration-200 group mt-4 border border-dashed border-[#e5e5e5]"
              >
                <span className="flex items-center gap-3.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  Catálogo Público
                </span>
                <ExternalLink size={14} className="text-[#666666] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </nav>

            {/* Footer del Sidebar: Usuario & Cerrar Sesión */}
            <div className="p-4 border-t border-[#e5e5e5] space-y-3">
              {user && (
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-[#fafafa] border border-[#e5e5e5] flex items-center justify-center text-[#1a1a1a]">
                    <User size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#1a1a1a] truncate capitalize">{displayName}</p>
                    <p className="text-[10px] text-[#666666] truncate">{user.email}</p>
                  </div>
                </div>
              )}
              <button
                onClick={handleCerrarSesion}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50/50 hover:text-red-700 transition-all duration-200 group"
              >
                <LogOut size={18} className="text-red-500 group-hover:-translate-x-0.5 transition-transform" />
                Cerrar sesión
              </button>
            </div>
          </aside>

          {/* Overlay de Sidebar para móvil */}
          {sidebarOpen && (
            <div 
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-30 bg-black/10 backdrop-blur-xs lg:hidden"
            ></div>
          )}

          {/* Contenido Principal */}
          <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
            
            {/* Header del Dashboard */}
            <header className="h-16 bg-white border-b border-[#e5e5e5] flex items-center justify-between px-6 z-20">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-[#fafafa] text-[#666666] hover:text-[#1a1a1a] transition-all"
                >
                  <Menu size={20} />
                </button>
                <h1 className="font-serif text-2xl font-semibold tracking-tight text-[#1a1a1a] capitalize animate-reveal">
                  {activePageTitle()}
                </h1>
              </div>

              {/* Botón rápido del perfil */}
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-xs font-medium text-[#666666] capitalize">{user ? displayName : ''}</span>
                <div className="w-9 h-9 rounded-xl bg-[#fafafa] border border-[#e5e5e5] flex items-center justify-center text-[#1a1a1a] shadow-sm">
                  <User size={16} />
                </div>
              </div>
            </header>

            {/* Panel de Contenido Dinámico */}
            <main className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="max-w-7xl mx-auto h-full">
                <Outlet />
              </div>
            </main>
          </div>

        </div>
      </ClickSpark>
    </div>
  );
}
