import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, User, Building, Mail, Lock } from 'lucide-react';
import { supabase } from '../config/supabase';
import Spline from '@splinetool/react-spline';
import ClickSpark from '../components/ClickSpark';

export default function Registro() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            company: formData.company
          }
        }
      });

      if (signUpError) throw signUpError;

      console.log('Registro exitoso', data);
      navigate('/iniciar-sesion'); 
    } catch (err) {
      console.error('Error al registrarse:', err);
      setError(err.message);
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

            {/* Capa sutil de oscurecimiento */}
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
                Eleva el control<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">de tu negocio.</span>
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed animate-fade-in-up delay-200 drop-shadow-md">
                Únete a la plataforma que transforma la gestión de inventario y la creación de catálogos digitales en una experiencia fluida.
              </p>
            </div>
          </div>
        </ClickSpark>
      </div>

      {/* Lado derecho: Formulario de Registro */}
      <div className="w-full lg:w-1/2 relative bg-white">
        <ClickSpark
          sparkColor='#000'
          sparkSize={12}
          sparkRadius={20}
          sparkCount={8}
          duration={400}
        >
          <div className="w-full h-full flex flex-col items-center justify-center p-6 sm:p-12 overflow-y-auto">
            <div className="w-full max-w-sm py-8">

              <header className="mb-8 text-left animate-fade-in-up">
                <h1 className="font-serif text-4xl font-semibold tracking-tight text-[#1a1a1a] mb-2">Crear cuenta</h1>
                <p className="text-[#666666] text-sm">Registra tu marca para comenzar a exponer tus productos.</p>
              </header>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center animate-reveal">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-3.5">
                  
                  {/* Nombre completo */}
                  <div className="flex flex-col gap-1.5 animate-fade-in-up delay-100">
                    <label className="text-xs font-semibold text-[#1a1a1a]">Nombre completo</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={15} />
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#fafafa] border border-transparent rounded-xl text-xs text-[#1a1a1a] placeholder-[#a1a1aa] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10 focus:border-[#1a1a1a] transition-all duration-200 hover:border-[#e5e5e5]"
                        placeholder="Ej. David Valdivia"
                      />
                    </div>
                  </div>

                  {/* Empresa */}
                  <div className="flex flex-col gap-1.5 animate-fade-in-up delay-200">
                    <label className="text-xs font-semibold text-[#1a1a1a]">Nombre de tu Empresa / Negocio</label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={15} />
                      <input
                        type="text"
                        name="company"
                        required
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#fafafa] border border-transparent rounded-xl text-xs text-[#1a1a1a] placeholder-[#a1a1aa] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10 focus:border-[#1a1a1a] transition-all duration-200 hover:border-[#e5e5e5]"
                        placeholder="Ej. Tienda Valdivia"
                      />
                    </div>
                  </div>

                  {/* Correo electrónico */}
                  <div className="flex flex-col gap-1.5 animate-fade-in-up delay-300">
                    <label className="text-xs font-semibold text-[#1a1a1a]">Correo electrónico</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={15} />
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#fafafa] border border-transparent rounded-xl text-xs text-[#1a1a1a] placeholder-[#a1a1aa] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10 focus:border-[#1a1a1a] transition-all duration-200 hover:border-[#e5e5e5]"
                        placeholder="david@ejemplo.com"
                      />
                    </div>
                  </div>

                  {/* Contraseña */}
                  <div className="flex flex-col gap-1.5 animate-fade-in-up delay-400">
                    <label className="text-xs font-semibold text-[#1a1a1a]">Contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={15} />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-10 pr-12 py-2.5 bg-[#fafafa] border border-transparent rounded-xl text-xs text-[#1a1a1a] placeholder-[#a1a1aa] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10 focus:border-[#1a1a1a] transition-all duration-200 hover:border-[#e5e5e5]"
                        placeholder="Mínimo 6 caracteres"
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a1a1aa] hover:text-[#1a1a1a] transition-colors focus:outline-none"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group w-full flex justify-center items-center gap-2 py-3 mt-4 bg-[#1a1a1a] text-white rounded-xl text-sm font-medium hover:bg-black active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg animate-fade-in-up delay-500"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Registrando...
                    </span>
                  ) : (
                    <>
                      Registrar Empresa
                      <ArrowRight size={16} className="opacity-70 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 text-left animate-fade-in-up delay-600">
                <p className="text-sm text-[#666666]">
                  ¿Ya tienes cuenta?{' '}
                  <Link to="/iniciar-sesion" className="font-medium text-[#1a1a1a] underline decoration-[#e5e5e5] underline-offset-4 hover:decoration-[#1a1a1a] transition-colors">
                    Iniciar sesión
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
