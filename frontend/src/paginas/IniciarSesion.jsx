import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function IniciarSesion() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password });
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#fafafa] selection:bg-[#1a1a1a] selection:text-white px-4">
      
      <div className="w-full max-w-sm animate-reveal">
        <header className="mb-12 text-center">
          <h1 className="font-serif text-4xl font-semibold tracking-tight text-[#1a1a1a] mb-2">Iniciar sesión</h1>
          <p className="text-[#666666] text-sm">Gestiona tu inventario con precisión.</p>
        </header>

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
            className="w-full py-2.5 mt-2 bg-[#1a1a1a] text-white rounded text-sm font-medium hover:bg-[#333333] active:scale-[0.98] transition-all"
          >
            Entrar
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
