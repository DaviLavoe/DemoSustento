import React from 'react';
import { MapPin, Phone, Mail, ArrowRight, MessageCircle, Globe, AtSign } from 'lucide-react';

export default function CatalogFooter({ company, primaryColor }) {
  const currentYear = new Date().getFullYear();
  const themeColor = primaryColor || '#1a1a1a';

  return (
    <footer className="bg-[#111111] text-neutral-300 pt-16 pb-8 border-t-4" style={{ borderColor: themeColor }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Columna 1: Sobre Nosotros */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              {company?.logo_url ? (
                <img src={company.logo_url} alt="Logo" className="w-8 h-8 object-contain filter brightness-0 invert opacity-90" />
              ) : (
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <span className="text-white font-serif font-bold italic">{company?.nombre?.charAt(0) || 'S'}</span>
                </div>
              )}
              <span className="font-serif text-xl font-bold tracking-widest uppercase text-white">
                {company?.nombre || 'Sustento'}
              </span>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed">
              {company?.descripcion || 'Ofrecemos los mejores productos con una calidad inigualable. Nuestra misión es brindarte la mejor experiencia de compra.'}
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/20 transition-colors text-white" aria-label="WhatsApp">
                <MessageCircle size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/20 transition-colors text-white" aria-label="Web">
                <Globe size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/20 transition-colors text-white" aria-label="Social">
                <AtSign size={18} />
              </a>
            </div>
          </div>

          {/* Columna 2: Enlaces Rápidos */}
          <div className="space-y-6">
            <h3 className="text-white font-bold tracking-widest uppercase text-sm">Enlaces Rápidos</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm hover:text-white transition-colors flex items-center gap-2"><ArrowRight size={14} className="text-neutral-500" /> Sobre Nosotros</a></li>
              <li><a href="#" className="text-sm hover:text-white transition-colors flex items-center gap-2"><ArrowRight size={14} className="text-neutral-500" /> Tienda</a></li>
              <li><a href="#" className="text-sm hover:text-white transition-colors flex items-center gap-2"><ArrowRight size={14} className="text-neutral-500" /> Ofertas Especiales</a></li>
              <li><a href="#" className="text-sm hover:text-white transition-colors flex items-center gap-2"><ArrowRight size={14} className="text-neutral-500" /> Blog</a></li>
            </ul>
          </div>

          {/* Columna 3: Contacto */}
          <div className="space-y-6">
            <h3 className="text-white font-bold tracking-widest uppercase text-sm">Contacto</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-neutral-500 shrink-0 mt-0.5" />
                <span className="text-sm">123 Avenida Principal, Ciudad Comercial, CP 10001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-neutral-500 shrink-0" />
                <span className="text-sm">{company?.telefono_whatsapp || '+51 999 999 999'}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-neutral-500 shrink-0" />
                <span className="text-sm">contacto@{company?.slug || 'tienda'}.com</span>
              </li>
            </ul>
          </div>

          {/* Columna 4: Newsletter */}
          <div className="space-y-6">
            <h3 className="text-white font-bold tracking-widest uppercase text-sm">Boletín Exclusivo</h3>
            <p className="text-sm text-neutral-400">Suscríbete para recibir noticias, ofertas especiales y actualizaciones exclusivas.</p>
            <form className="relative" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Tu correo electrónico" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
                required
              />
              <button 
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-4 rounded-lg text-white font-semibold text-xs transition-colors hover:brightness-110"
                style={{ backgroundColor: themeColor }}
              >
                Unirse
              </button>
            </form>
          </div>

        </div>

        {/* Línea inferior */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-500 text-center md:text-left">
            &copy; {currentYear} {company?.nombre || 'Sustento'}. Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" alt="Visa" className="h-6 opacity-50 grayscale" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/MasterCard_Logo.svg/200px-MasterCard_Logo.svg.png" alt="Mastercard" className="h-6 opacity-50 grayscale" />
          </div>
        </div>

      </div>
    </footer>
  );
}
