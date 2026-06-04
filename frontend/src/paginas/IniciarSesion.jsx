import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { supabase } from '../config/supabase';
import Spline from '@splinetool/react-spline';
import ClickSpark from '../components/ClickSpark';

export default function IniciarSesion() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      console.log('Login exitoso', data);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setError(err.message === 'Invalid login credentials'
        ? 'Correo o contraseña incorrectos'
        : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white selection:bg-[#1a1a1a] selection:text-white">

      {/* Lado izquierdo: Decorativo (Solo visible en pantallas grandes) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black">
        <ClickSpark
          sparkColor='#fff'
          sparkSize={12}
          sparkRadius={20}
          sparkCount={8}
          duration={400}
        >
          <div className="relative w-full h-full flex flex-col justify-between p-12">
            {/* Escena 3D de Spline */}
            <div className="absolute inset-0 z-0 scale-[1.2] translate-x-12 -translate-y-4 spline-watermark-hide">
          <Spline scene="https://prod.spline.design/LjmP8z5grXutLGK3/scene.splinecode" />
        </div>

        {/* Capa sutil de oscurecimiento (opcional, para que los textos sigan siendo legibles) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none z-0"></div>

        {/* Marca / Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg border border-white/20">
            <span className="text-white font-serif font-bold text-2xl leading-none italic">S</span>
          </div>
          <span className="text-white text-xl font-medium tracking-widest uppercase shadow-black drop-shadow-md">Sustento</span>
        </div>

        {/* Mensaje Hero */}
        <div className="relative z-10 mb-10 max-w-lg pointer-events-none">
          <h2 className="font-serif text-5xl md:text-6xl text-white mb-6 leading-[1.1] animate-fade-in-up drop-shadow-lg">
            Domina tu<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">inventario.</span>
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed animate-fade-in-up delay-200 drop-shadow-md">
            Una plataforma diseñada con precisión y estética superior para gestionar tus activos con absoluta claridad.
          </p>
        </div>
          </div>
        </ClickSpark>
      </div>

      {/* Lado derecho: Formulario de inicio de sesión */}
      <div className="w-full lg:w-1/2 relative bg-white">
        <ClickSpark
          sparkColor='#000'
          sparkSize={12}
          sparkRadius={20}
          sparkCount={8}
          duration={400}
        >
          <div className="w-full h-full flex flex-col items-center justify-center p-6 sm:p-12">
            <div className="w-full max-w-sm">

              <header className="mb-10 text-left animate-fade-in-up">
            <h1 className="font-serif text-4xl font-semibold tracking-tight text-[#1a1a1a] mb-3">Bienvenido</h1>
            <p className="text-gray-800 text-base">Ingresa a tu cuenta para continuar.</p>
          </header>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center animate-reveal">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              {/* Input Correo */}
              <div className="flex flex-col gap-2 animate-fade-in-up delay-100">
                <label className="text-sm font-medium text-[#1a1a1a]">Correo electrónico</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#fafafa] border border-transparent rounded-xl text-sm text-[#1a1a1a] placeholder-[#a1a1aa] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10 focus:border-[#1a1a1a] transition-all duration-200 hover:border-[#e5e5e5]"
                  placeholder="nombre@ejemplo.com"
                />
              </div>

              {/* Input Contraseña */}
              <div className="flex flex-col gap-2 animate-fade-in-up delay-200">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-[#1a1a1a]">Contraseña</label>
                  <a href="#" className="text-xs font-medium text-[#666666] hover:text-[#1a1a1a] transition-colors">¿Olvidaste tu contraseña?</a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-[#fafafa] border border-transparent rounded-xl text-sm text-[#1a1a1a] placeholder-[#a1a1aa] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10 focus:border-[#1a1a1a] transition-all duration-200 hover:border-[#e5e5e5] pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a1a1aa] hover:text-[#1a1a1a] transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="group w-full flex justify-center items-center gap-2 py-3 mt-4 bg-[#1a1a1a] text-white rounded-xl text-sm font-medium hover:bg-black active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg animate-fade-in-up delay-300"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Ingresando...
                </span>
              ) : (
                <>
                  Entrar a la cuenta
                  <ArrowRight size={16} className="opacity-70 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Enlace de Registro */}
          <div className="mt-10 text-left animate-fade-in-up delay-400">
            <p className="text-sm text-[#666666]">
              ¿No tienes cuenta?{' '}
              <Link to="/registro" className="font-medium text-[#1a1a1a] underline decoration-[#e5e5e5] underline-offset-4 hover:decoration-[#1a1a1a] transition-colors">
                Solicitar acceso
              </Link>
            </p>
          </div>
            </div>
          </div>
        </ClickSpark>
      </div>
    </div>
  );
}
