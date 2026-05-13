import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../config/supabase';

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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#fafafa] selection:bg-[#1a1a1a] selection:text-white px-4 py-12">
      
      <div className="w-full max-w-sm animate-reveal" style={{ animationDelay: '0.1s' }}>
        <header className="mb-10 text-center">
          <h1 className="font-serif text-4xl font-semibold tracking-tight text-[#1a1a1a] mb-2">Crear cuenta</h1>
          <p className="text-[#666666] text-sm">Eleva el control de tu inventario.</p>
        </header>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#1a1a1a]">Nombre completo</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-white border border-[#e5e5e5] rounded text-sm text-[#1a1a1a] placeholder-[#a1a1aa] focus:outline-none focus:border-[#1a1a1a] transition-colors"
                placeholder="Tu nombre"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#1a1a1a]">Empresa</label>
              <input
                type="text"
                name="company"
                required
                value={formData.company}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-white border border-[#e5e5e5] rounded text-sm text-[#1a1a1a] placeholder-[#a1a1aa] focus:outline-none focus:border-[#1a1a1a] transition-colors"
                placeholder="Nombre de tu negocio"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#1a1a1a]">Correo electrónico</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-white border border-[#e5e5e5] rounded text-sm text-[#1a1a1a] placeholder-[#a1a1aa] focus:outline-none focus:border-[#1a1a1a] transition-colors"
                placeholder="nombre@ejemplo.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#1a1a1a]">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-white border border-[#e5e5e5] rounded text-sm text-[#1a1a1a] placeholder-[#a1a1aa] focus:outline-none focus:border-[#1a1a1a] transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a1a1aa] hover:text-[#1a1a1a] transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-2.5 mt-2 bg-[#1a1a1a] text-white rounded text-sm font-medium hover:bg-[#333333] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registrando...
              </span>
            ) : 'Registrarse'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-[#666666]">
            ¿Ya tienes cuenta?{' '}
            <Link to="/iniciar-sesion" className="text-[#1a1a1a] underline decoration-[#e5e5e5] underline-offset-4 hover:decoration-[#1a1a1a] transition-colors">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
