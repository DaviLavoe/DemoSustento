import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Registro() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Register attempt:', formData);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#fafafa] selection:bg-[#1a1a1a] selection:text-white px-4 py-12">
      
      <div className="w-full max-w-sm animate-reveal" style={{ animationDelay: '0.1s' }}>
        <header className="mb-10 text-center">
          <h1 className="font-serif text-4xl font-semibold tracking-tight text-[#1a1a1a] mb-2">Crear cuenta</h1>
          <p className="text-[#666666] text-sm">Eleva el control de tu inventario.</p>
        </header>

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
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-white border border-[#e5e5e5] rounded text-sm text-[#1a1a1a] placeholder-[#a1a1aa] focus:outline-none focus:border-[#1a1a1a] transition-colors"
              />
            </div>

          </div>

          <button
            type="submit"
            className="w-full py-2.5 mt-2 bg-[#1a1a1a] text-white rounded text-sm font-medium hover:bg-[#333333] active:scale-[0.98] transition-all"
          >
            Registrarse
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
