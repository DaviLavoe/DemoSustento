import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';

export default function IniciarSesion() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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
      // Redirigir al dashboard (por ahora redirigimos al inicio)
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#fafafa] selection:bg-[#1a1a1a] selection:text-white px-4">
      
      <div className="w-full max-w-sm animate-reveal">
        <header className="mb-12 text-center">
          <h1 className="font-serif text-4xl font-semibold tracking-tight text-[#1a1a1a] mb-2">Iniciar sesión</h1>
          <p className="text-[#666666] text-sm">Gestiona tu inventario con precisión.</p>
        </header>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#1a1a1a]">Correo electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-[#e5e5e5] rounded text-sm text-[#1a1a1a] placeholder-[#a1a1aa] focus:outline-none focus:border-[#1a1a1a] transition-colors"
                placeholder="nombre@ejemplo.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-[#1a1a1a]">Contraseña</label>
                <a href="#" className="text-xs text-[#666666] hover:text-[#1a1a1a] transition-colors">¿Olvidaste tu contraseña?</a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-[#e5e5e5] rounded text-sm text-[#1a1a1a] placeholder-[#a1a1aa] focus:outline-none focus:border-[#1a1a1a] transition-colors"
              />
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
                Ingresando...
              </span>
            ) : 'Entrar'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-[#666666]">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="text-[#1a1a1a] underline decoration-[#e5e5e5] underline-offset-4 hover:decoration-[#1a1a1a] transition-colors">
              Solicitar acceso
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
