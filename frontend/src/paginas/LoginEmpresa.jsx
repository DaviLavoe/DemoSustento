import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Store, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '../config/supabase';
import Spline from '@splinetool/react-spline';
import ClickSpark from '../components/ClickSpark';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function LoginEmpresa() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [empresa, setEmpresa] = useState(null);
  const [loadingEmpresa, setLoadingEmpresa] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar branding de la empresa
  useEffect(() => {
    if (!slug) return;
    fetch(`${API_URL}/api/catalogo/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setEmpresa(data.empresa);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoadingEmpresa(false));
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      navigate('/dashboard');
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

  // Color de acento de la empresa
  const accentColor = empresa?.color_primario || '#ffffff';

  // Pantalla de carga
  if (loadingEmpresa) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 size={28} className="animate-spin text-neutral-600" />
      </div>
    );
  }

  // Empresa no encontrada
  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#0a0a0a] text-center p-8">
        <Store size={40} className="text-neutral-700" />
        <h1 className="text-2xl font-bold text-white">Empresa no encontrada</h1>
        <p className="text-neutral-500 text-sm">
          No existe ninguna empresa con el identificador <strong className="text-neutral-300">"{slug}"</strong>.
        </p>
        <a href="/iniciar-sesion" className="text-sm text-neutral-500 hover:text-neutral-300 underline underline-offset-4 transition-colors">
          Ir al login general
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-[#0a0a0a] selection:bg-white/20 selection:text-white">
      <ClickSpark sparkColor={accentColor} sparkSize={10} sparkRadius={20} sparkCount={8} duration={400}>
        <div className="w-full min-h-screen flex">

          {/* ── Panel izquierdo: Robot 3D + branding oscuro ───────────────── */}
          <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 bg-black">

            {/* Robot 3D de Spline — ocupa todo el panel */}
            <div className="absolute inset-0 z-0 scale-[1.2] translate-x-12 -translate-y-4 spline-watermark-hide">
              <Spline scene="https://prod.spline.design/LjmP8z5grXutLGK3/scene.splinecode" />
            </div>

            {/* Gradiente inferior para que el texto sea legible */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none z-0" />

            {/* Logo de la empresa — arriba */}
            <div className="relative z-10 flex items-center gap-3">
              {empresa?.logo_url ? (
                <img
                  src={empresa.logo_url}
                  alt={empresa.nombre}
                  className="w-10 h-10 object-contain rounded-xl bg-white/10 backdrop-blur-sm p-1.5 border border-white/10"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold text-white border border-white/10"
                  style={{ backgroundColor: `${accentColor}25` }}
                >
                  {empresa?.nombre?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <span className="text-white font-semibold text-lg tracking-tight drop-shadow-md">
                {empresa?.nombre}
              </span>
            </div>

            {/* Texto inferior */}
            <div className="relative z-10 mb-2 max-w-xs pointer-events-none">
              <h2 className="font-serif text-5xl text-white mb-4 leading-[1.1] drop-shadow-lg">
                Domina tu<br />
                <span
                  className="text-transparent bg-clip-text"
                  style={{ backgroundImage: `linear-gradient(to right, ${accentColor}, ${accentColor}99)` }}
                >
                  inventario.
                </span>
              </h2>
              <p className="text-neutral-400 text-base leading-relaxed drop-shadow">
                Una plataforma diseñada para gestionar los activos de{' '}
                <strong className="text-neutral-200">{empresa?.nombre}</strong> con claridad.
              </p>
            </div>
          </div>

          {/* ── Panel derecho: Formulario oscuro ─────────────────────────── */}
          <div className="w-full lg:w-1/2 relative bg-[#0d0d0d] border-l border-white/5 flex items-center justify-center p-8">
            {/* Gradiente sutil de fondo */}
            <div
              className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-5 pointer-events-none"
              style={{ backgroundColor: accentColor }}
            />

            <div className="relative z-10 w-full max-w-sm">

              {/* Logo móvil */}
              <div className="lg:hidden flex items-center gap-3 mb-10">
                {empresa?.logo_url ? (
                  <img src={empresa.logo_url} alt={empresa.nombre}
                    className="w-9 h-9 object-contain rounded-lg bg-white/5 p-1 border border-white/10" />
                ) : (
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white border border-white/10"
                    style={{ backgroundColor: `${accentColor}25` }}
                  >
                    {empresa?.nombre?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <span className="font-semibold text-white">{empresa?.nombre}</span>
              </div>

              {/* Encabezado */}
              <header className="mb-10">
                {/* Badge de empresa */}
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-[11px] font-semibold uppercase tracking-wider border"
                  style={{
                    backgroundColor: `${accentColor}15`,
                    borderColor: `${accentColor}30`,
                    color: accentColor,
                  }}
                >
                  <Store size={10} />
                  {empresa?.nombre}
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Bienvenido</h1>
                <p className="text-neutral-500 text-sm mt-2">Ingresa a tu cuenta para continuar.</p>
              </header>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertTriangle size={15} className="text-red-400 mt-0.5 shrink-0" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nombre@empresa.com"
                    className="w-full px-4 py-3 bg-white/5 border border-white/8 rounded-xl text-white placeholder-neutral-600 text-sm focus:outline-none transition-all hover:border-white/15"
                    onFocus={(e) => { e.target.style.borderColor = `${accentColor}60`; e.target.style.backgroundColor = 'rgba(255,255,255,0.07)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                  />
                </div>

                {/* Contraseña */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-white/5 border border-white/8 rounded-xl text-white placeholder-neutral-600 text-sm focus:outline-none transition-all hover:border-white/15 pr-12"
                      onFocus={(e) => { e.target.style.borderColor = `${accentColor}60`; e.target.style.backgroundColor = 'rgba(255,255,255,0.07)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-300 transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Botón submit — usa el color de la empresa como acento */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group w-full flex justify-center items-center gap-2 py-3 mt-4 rounded-xl text-sm font-semibold disabled:opacity-60 transition-all active:scale-[0.98] shadow-lg hover:shadow-xl hover:brightness-110"
                  style={{ backgroundColor: accentColor, color: isColorDark(accentColor) ? '#fff' : '#000' }}
                >
                  {isLoading ? (
                    <><Loader2 size={16} className="animate-spin" /> Ingresando...</>
                  ) : (
                    <>
                      Entrar a la cuenta
                      <ArrowRight size={15} className="opacity-80 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer */}
              <p className="text-center text-neutral-700 text-xs mt-10">
                ¿Eres el administrador del sistema?{' '}
                <a href="/superadmin/login" className="text-neutral-500 hover:text-neutral-300 underline underline-offset-4 transition-colors">
                  Panel Super-Admin
                </a>
              </p>
            </div>
          </div>

        </div>
      </ClickSpark>
    </div>
  );
}

// Determina si un color hex es oscuro para elegir texto blanco o negro sobre él
function isColorDark(hex) {
  const h = (hex || '#000000').replace('#', '');
  if (h.length < 6) return true;
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
}
