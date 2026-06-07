import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Globe, Zap, AlertTriangle, Loader2, Shield } from 'lucide-react';
import { supabaseAdmin } from '../../config/supabaseAdmin';
import ClickSpark from '../../components/ClickSpark';

export default function LoginSuperAdmin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Si ya hay sesión de superadmin activa, redirigir directamente
  useEffect(() => {
    supabaseAdmin.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const { data } = await supabaseAdmin
        .from('usuarios')
        .select('rol')
        .eq('id', session.user.id)
        .single();
      if (data?.rol === 'superadmin') navigate('/superadmin', { replace: true });
    });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { data, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // Verificar que sea superadmin
      const { data: usuarioData } = await supabaseAdmin
        .from('usuarios')
        .select('rol')
        .eq('id', data.user.id)
        .single();

      if (usuarioData?.rol !== 'superadmin') {
        await supabaseAdmin.auth.signOut();
        throw new Error('Esta cuenta no tiene permisos de Super-Administrador');
      }

      navigate('/superadmin');
    } catch (err) {
      setError(
        err.message === 'Invalid login credentials'
          ? 'Correo o contraseña incorrectos'
          : err.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#06060a] selection:bg-violet-500 selection:text-white">
      <ClickSpark sparkColor="#7c3aed" sparkSize={10} sparkRadius={20} sparkCount={8} duration={400}>
        <div className="w-full min-h-screen flex">

          {/* ── Panel izquierdo decorativo ─────────────────────────── */}
          <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0a0a14] border-r border-white/5 flex-col justify-between p-14">
            {/* Fondo animado con gradientes */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
              <div className="absolute top-3/4 left-1/3 w-48 h-48 bg-purple-600/8 rounded-full blur-2xl" />
            </div>

            {/* Grid de puntos decorativos */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
                backgroundSize: '32px 32px'
              }}
            />

            {/* Logo en la parte superior */}
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-violet-900/50">
                <Globe size={18} className="text-white" />
              </div>
              <div>
                <span className="text-white font-bold text-lg tracking-tight">GlobalInventory</span>
                <p className="text-violet-400 text-[10px] font-semibold uppercase tracking-widest leading-none">Admin Panel</p>
              </div>
            </div>

            {/* Mensaje central */}
            <div className="relative z-10">
              {/* Ícono grande central */}
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-600/30 to-indigo-700/20 border border-violet-500/20 flex items-center justify-center mb-8 shadow-2xl shadow-violet-900/30">
                <Globe size={38} className="text-violet-400" />
              </div>

              <h2 className="text-5xl font-bold text-white leading-[1.1] mb-4">
                Control<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                  Total.
                </span>
              </h2>
              <p className="text-neutral-400 text-lg leading-relaxed max-w-sm">
                Panel de gestión global de la plataforma SaaS. Acceso exclusivo para administradores del sistema.
              </p>

              {/* Features */}
              <div className="mt-10 space-y-3">
                {[
                  'Gestión de todas las empresas registradas',
                  'Estadísticas globales en tiempo real',
                  'Control total del ecosistema de inventarios',
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                      <Zap size={10} className="text-violet-400" />
                    </div>
                    <span className="text-neutral-400 text-sm">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer del panel izquierdo */}
            <div className="relative z-10">
              <p className="text-neutral-600 text-xs">
                © 2025 GlobalInventory · Panel de Super-Administración
              </p>
            </div>
          </div>

          {/* ── Panel derecho: Formulario ──────────────────────────── */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
            <div className="w-full max-w-sm">

              {/* Logo móvil */}
              <div className="lg:hidden flex items-center gap-3 mb-10">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center">
                  <Globe size={16} className="text-white" />
                </div>
                <div>
                  <span className="text-white font-bold text-base">GlobalInventory</span>
                  <p className="text-violet-400 text-[9px] font-semibold uppercase tracking-widest leading-none">Admin Panel</p>
                </div>
              </div>

              {/* Encabezado del form */}
              <header className="mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 mb-5">
                  <Shield size={11} className="text-violet-400" />
                  <span className="text-violet-300 text-[11px] font-semibold uppercase tracking-wider">Acceso Restringido</span>
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Iniciar sesión</h1>
                <p className="text-neutral-500 text-sm mt-2">Solo para Super-Administradores del sistema.</p>
              </header>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertTriangle size={15} className="text-red-400 mt-0.5 shrink-0" />
                  <p className="text-red-300 text-sm leading-relaxed">{error}</p>
                </div>
              )}

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@globalinventory.com"
                    className="w-full px-4 py-3 bg-white/5 border border-white/8 rounded-xl text-white placeholder-neutral-600 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-white/8 transition-all"
                  />
                </div>

                {/* Contraseña */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-white/5 border border-white/8 rounded-xl text-white placeholder-neutral-600 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-white/8 transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Botón submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold disabled:opacity-60 transition-all shadow-lg shadow-violet-900/30 active:scale-[0.98]"
                >
                  {isLoading ? (
                    <><Loader2 size={16} className="animate-spin" /> Verificando...</>
                  ) : (
                    <><Globe size={15} /> Acceder al Panel <ArrowRight size={14} className="ml-1" /></>
                  )}
                </button>
              </form>

              {/* Separador */}
              <div className="flex items-center gap-3 mt-8">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-[10px] text-neutral-700 uppercase tracking-wider">o accede como empresa</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              {/* Footer */}
              <p className="text-center text-neutral-600 text-xs mt-5">
                ¿Eres admin de una empresa?{' '}
                <a href="/login/tech-store-lima" className="text-neutral-500 hover:text-neutral-300 transition-colors underline underline-offset-4">
                  Ir al login de empresas
                </a>
              </p>
            </div>
          </div>

        </div>
      </ClickSpark>
    </div>
  );
}
