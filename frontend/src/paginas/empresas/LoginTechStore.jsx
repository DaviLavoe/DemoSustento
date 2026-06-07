import { Eye, EyeOff, ArrowRight, Cpu, AlertTriangle, Loader2 } from 'lucide-react';
import Spline from '@splinetool/react-spline';
import ClickSpark from '../../components/ClickSpark';

export default function LoginTechStore({
  empresa,
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  onSubmit,
  isLoading,
  error
}) {
  const accentColor = empresa?.color_primario || '#ef4444';

  return (
    <div className="min-h-screen w-full flex bg-[#060606] selection:bg-white/20 selection:text-white overflow-hidden">
      <ClickSpark sparkColor={accentColor} sparkSize={10} sparkRadius={20} sparkCount={8} duration={400}>
        <div className="w-full min-h-screen flex">

          {/* ── Panel izquierdo: Robot 3D Spline (oscuro tecnológico) ── */}
          <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black flex-col justify-between p-12">
            {/* Escena 3D de Spline */}
            <div className="absolute inset-0 z-0 scale-[1.2] translate-x-12 -translate-y-4 spline-watermark-hide">
              <Spline scene="https://prod.spline.design/LjmP8z5grXutLGK3/scene.splinecode" />
            </div>

            {/* Gradiente inferior para legibilidad */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none z-0" />

            {/* Marca superior */}
            <div className="relative z-10 flex items-center gap-3">
              {empresa?.logo_url ? (
                <img
                  src={empresa.logo_url}
                  alt={empresa.nombre}
                  className="w-10 h-10 object-contain rounded-xl bg-white/5 backdrop-blur-md p-1.5 border border-white/10 shadow-lg"
                />
              ) : (
                <div className="w-10 h-10 bg-white/5 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg border border-white/10">
                  <Cpu size={18} style={{ color: accentColor }} />
                </div>
              )}
              <span className="text-white text-xl font-medium tracking-widest uppercase drop-shadow-md">
                {empresa?.nombre || 'Tech Store'}
              </span>
            </div>

            {/* Texto hero inferior */}
            <div className="relative z-10 mb-10 max-w-lg pointer-events-none">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5 text-[10px] font-semibold uppercase tracking-widest border"
                style={{ backgroundColor: `${accentColor}15`, borderColor: `${accentColor}40`, color: accentColor }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
                Sistema de Inventario
              </div>
              <h2 className="font-serif text-5xl md:text-6xl text-white mb-6 leading-[1.1] drop-shadow-lg">
                Domina tu<br />
                <span
                  className="text-transparent bg-clip-text"
                  style={{ backgroundImage: `linear-gradient(to right, ${accentColor}, #ffffff)` }}
                >
                  inventario.
                </span>
              </h2>
              <p className="text-neutral-400 text-base leading-relaxed drop-shadow-md">
                Una plataforma diseñada con precisión para gestionar los activos de{' '}
                <strong className="text-white font-semibold">{empresa?.nombre}</strong> con absoluta claridad.
              </p>
            </div>
          </div>

          {/* ── Panel derecho: Formulario oscuro premium ── */}
          <div className="w-full lg:w-1/2 relative bg-[#0d0d0d] border-l border-white/5 flex items-center justify-center p-8">
            {/* Orbe sutil de fondo */}
            <div
              className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[120px] opacity-10 pointer-events-none"
              style={{ backgroundColor: accentColor }}
            />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-[100px] opacity-5 pointer-events-none bg-blue-600" />

            <div className="relative z-10 w-full max-w-sm">

              {/* Logo móvil */}
              <div className="lg:hidden flex items-center gap-3 mb-10">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/10" style={{ backgroundColor: `${accentColor}20` }}>
                  <Cpu size={16} style={{ color: accentColor }} />
                </div>
                <span className="font-semibold text-white tracking-widest uppercase text-sm">{empresa?.nombre}</span>
              </div>

              {/* Encabezado */}
              <header className="mb-10">
                {/* Badge de empresa */}
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-[11px] font-semibold uppercase tracking-wider border"
                  style={{
                    backgroundColor: `${accentColor}12`,
                    borderColor: `${accentColor}30`,
                    color: accentColor,
                  }}
                >
                  <Cpu size={10} />
                  {empresa?.nombre}
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Bienvenido</h1>
                <p className="text-neutral-500 text-sm">Ingresa a tu cuenta para continuar.</p>
              </header>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertTriangle size={15} className="text-red-400 mt-0.5 shrink-0" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              {/* Formulario */}
              <form onSubmit={onSubmit} className="space-y-4">
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
                    placeholder="nombre@techstore.com"
                    className="w-full px-4 py-3 bg-white/4 border border-white/8 rounded-xl text-white placeholder-neutral-600 text-sm focus:outline-none transition-all hover:border-white/15"
                    onFocus={(e) => { e.target.style.borderColor = `${accentColor}60`; e.target.style.backgroundColor = 'rgba(255,255,255,0.06)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.backgroundColor = 'rgba(255,255,255,0.04)'; }}
                  />
                </div>

                {/* Contraseña */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Contraseña
                    </label>
                    <a href="#" className="text-[11px] text-neutral-600 hover:text-neutral-400 transition-colors">¿Olvidaste?</a>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-white/4 border border-white/8 rounded-xl text-white placeholder-neutral-600 text-sm focus:outline-none transition-all hover:border-white/15 pr-12"
                      onFocus={(e) => { e.target.style.borderColor = `${accentColor}60`; e.target.style.backgroundColor = 'rgba(255,255,255,0.06)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.backgroundColor = 'rgba(255,255,255,0.04)'; }}
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

                {/* Botón submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group w-full flex justify-center items-center gap-2 py-3 mt-5 rounded-xl text-sm font-semibold disabled:opacity-60 transition-all active:scale-[0.98] shadow-lg hover:shadow-xl hover:brightness-110"
                  style={{ backgroundColor: accentColor, color: '#fff' }}
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
                ¿No tienes acceso?{' '}
                <span className="text-neutral-500">
                  Comunícate con el administrador del sistema.
                </span>
              </p>

              {/* Separador de seguridad */}
              <div className="flex items-center gap-3 mt-8">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-[10px] text-neutral-700 uppercase tracking-wider">Acceso seguro</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>
            </div>
          </div>

        </div>
      </ClickSpark>
    </div>
  );
}
