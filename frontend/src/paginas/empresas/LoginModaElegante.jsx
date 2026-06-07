import { useState } from 'react';
import { Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import ClickSpark from '../../components/ClickSpark';
import { Link } from 'react-router-dom';

export default function LoginModaElegante({
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
  const accentColor = empresa?.color_primario || '#ec4899'; // Pink accent for Moda Elegante
  
  // Estados para controlar el enfoque y pintar la línea inferior con el color de acento
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  return (
    <div className="min-h-screen w-full flex bg-[#faf9f6] selection:bg-[#ec4899] selection:text-white">
      <div className="w-full min-h-screen flex">
        
        {/* Lado izquierdo: Estilo Fashion/Boutique Premium (Solo visible en pantallas grandes) */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#181616] flex-col justify-between p-16">
          <ClickSpark sparkColor="#ffffff" sparkSize={10} sparkRadius={25} sparkCount={8} duration={400}>
            <div className="w-full h-full flex flex-col justify-between absolute inset-0 p-16 z-10">
              
              {/* Marca / Logo Boutique */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/5 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10">
                  <span className="text-white font-serif font-light text-xl tracking-wider uppercase">M</span>
                </div>
                <span className="text-white font-serif text-lg tracking-[0.25em] uppercase font-light">
                  {empresa?.nombre || 'Moda Elegante'}
                </span>
              </div>

              {/* Mensaje Hero - Tipografía Fashion Serif */}
              <div className="max-w-md pointer-events-none">
                <div 
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 text-xs font-serif tracking-widest border font-medium shadow-sm"
                  style={{
                    backgroundColor: `${accentColor}20`,
                    borderColor: `${accentColor}40`,
                    color: '#ffffff'
                  }}
                >
                  <Sparkles size={12} style={{ color: accentColor }} />
                  Colección Premium
                </div>
                <h2 className="font-serif text-4xl md:text-5xl text-white mb-6 leading-tight font-light tracking-wide">
                  La elegancia <br />
                  <span className="italic font-normal" style={{ color: accentColor }}>es la única</span> belleza<br />
                  que nunca se desvanece.
                </h2>
                <p className="text-neutral-300 text-sm font-light tracking-wide leading-relaxed">
                  Gestiona tu catálogo de moda, controla stock de prendas y atiende pedidos exclusivos de{' '}
                  <strong className="text-white font-normal">{empresa?.nombre}</strong> con sofisticación absoluta.
                </p>
              </div>

              {/* Footer izquierdo */}
              <div className="text-[10px] text-neutral-400 tracking-[0.2em] uppercase font-light">
                Estilo · Calidad · Distinción
              </div>

            </div>
          </ClickSpark>

          {/* Gradientes elegantes y fluidos en el fondo de la columna izquierda */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 pointer-events-none bg-[#ec4899] z-0" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-10 pointer-events-none bg-indigo-500 z-0" />
          
          {/* Overlay sutil de patrón de líneas elegantes */}
          <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none z-0" />
        </div>

        {/* Lado derecho: Formulario minimalista de boutique */}
        <div className="w-full lg:w-1/2 relative bg-[#fcfcfb] flex items-center justify-center p-6 sm:p-12 border-l border-neutral-100">
          <ClickSpark sparkColor={accentColor} sparkSize={12} sparkRadius={20} sparkCount={8} duration={450}>
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-full max-w-sm">
                <header className="mb-10 text-left">
                  {/* Badge de la empresa */}
                  <div
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-[10px] font-semibold uppercase tracking-[0.2em] border shadow-sm"
                    style={{
                      backgroundColor: `${accentColor}12`,
                      borderColor: `${accentColor}30`,
                      color: accentColor,
                    }}
                  >
                    {empresa?.nombre || 'Moda Elegante'}
                  </div>
                  <h1 className="font-serif text-3xl font-light text-[#1c1917] tracking-wider uppercase mb-2">Ingresar</h1>
                  <p className="text-neutral-600 text-xs font-light tracking-wide">Inicia sesión para gestionar tus colecciones.</p>
                </header>

                {error && (
                  <div className="mb-6 p-4 bg-red-50/50 border border-red-100 text-red-600 text-xs rounded-xl text-center font-light tracking-wide">
                    {error}
                  </div>
                )}

                <form onSubmit={onSubmit} className="space-y-6">
                  <div className="space-y-4">
                    {/* Input Correo */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium uppercase tracking-wider text-neutral-600">Correo de acceso</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setIsEmailFocused(true)}
                        onBlur={() => setIsEmailFocused(false)}
                        className="w-full px-4 py-3 bg-[#f5f5f3] border-b-2 border-transparent rounded-xl text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none transition-all duration-300 shadow-sm"
                        style={{
                          borderBottomColor: isEmailFocused ? accentColor : 'transparent'
                        }}
                        placeholder="nombre@modaelegante.com"
                      />
                    </div>

                    {/* Input Contraseña */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-medium uppercase tracking-wider text-neutral-600">Contraseña</label>
                        <a 
                          href="#" 
                          className="text-[10px] font-semibold uppercase tracking-wider transition-colors hover:opacity-80"
                          style={{ color: accentColor }}
                        >
                          ¿Olvidaste?
                        </a>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onFocus={() => setIsPasswordFocused(true)}
                          onBlur={() => setIsPasswordFocused(false)}
                          className="w-full px-4 py-3 bg-[#f5f5f3] border-b-2 border-transparent rounded-xl text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none transition-all duration-300 pr-12 shadow-sm"
                          style={{
                            borderBottomColor: isPasswordFocused ? accentColor : 'transparent'
                          }}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:opacity-80 transition-opacity focus:outline-none"
                          style={{ color: accentColor }}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Botón Submit */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group w-full flex justify-center items-center gap-2 py-3 mt-6 text-white rounded-xl text-xs uppercase tracking-widest font-semibold active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow-md hover:brightness-95"
                    style={{ backgroundColor: accentColor }}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verificando...
                      </span>
                    ) : (
                      <>
                        Entrar a la boutique
                        <ArrowRight size={14} className="opacity-70 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                {/* Enlace de Registro */}
                <div className="mt-12 text-center border-t border-neutral-100 pt-6">
                  <p className="text-xs text-neutral-600 font-light">
                    ¿No tienes cuenta?{' '}
                    <Link 
                      to="/registro" 
                      className="font-semibold hover:opacity-80 underline underline-offset-4 transition-all"
                      style={{ color: accentColor, decorationColor: `${accentColor}40` }}
                    >
                      Registrar marca
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </ClickSpark>
        </div>

      </div>
    </div>
  );
}
