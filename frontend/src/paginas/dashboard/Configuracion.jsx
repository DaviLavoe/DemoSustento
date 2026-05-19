import { Settings, Phone, Palette, HelpCircle } from 'lucide-react';

export default function Configuracion() {
  return (
    <div className="space-y-6 animate-reveal max-w-3xl">
      <div className="p-8 bg-white border border-[#e5e5e5] rounded-2xl shadow-xs space-y-6">
        
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#fafafa] border border-[#e5e5e5] flex items-center justify-center text-[#1a1a1a]">
            <Settings size={22} />
          </div>
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-bold text-[#1a1a1a]">Configuración del Catálogo</h2>
            <p className="text-sm text-[#666666]">Define la identidad de tu vitrina digital y los datos de contacto para tus pedidos de WhatsApp.</p>
          </div>
        </div>

        <div className="border-t border-[#e5e5e5] pt-6 space-y-6">
          {/* Apariencia */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#666666] flex items-center gap-2">
              <Palette size={14} />
              Apariencia Visual
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#1a1a1a]">Color Primario del Catálogo</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    defaultValue="#1a1a1a"
                    disabled
                    className="w-10 h-10 border border-[#e5e5e5] rounded-lg cursor-not-allowed"
                  />
                  <input
                    type="text"
                    defaultValue="#1a1a1a"
                    disabled
                    className="flex-1 px-4 py-2 bg-[#fafafa] border border-transparent rounded-xl text-sm text-[#666666] cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#1a1a1a]">Nombre de la Marca</label>
                <input
                  type="text"
                  placeholder="Ej. Mi Tienda Express"
                  disabled
                  className="px-4 py-2 bg-[#fafafa] border border-transparent rounded-xl text-sm text-[#666666] cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Enlace WhatsApp */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#666666] flex items-center gap-2">
              <Phone size={14} />
              Redirección de Pedidos
            </h3>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#1a1a1a]">Número de WhatsApp (con código de país)</label>
              <input
                type="tel"
                placeholder="Ej. +51987654321"
                disabled
                className="px-4 py-2.5 bg-[#fafafa] border border-transparent rounded-xl text-sm text-[#666666] cursor-not-allowed"
              />
              <p className="text-[11px] text-[#666666] italic mt-0.5">*(Las configuraciones se podrán guardar y editar en la Semana 3 con el Micro-CMS)*</p>
            </div>
          </div>
        </div>

      </div>

      {/* Tarjeta Informativa de Próxima Entrega */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-md flex items-start gap-4 text-white">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0 mt-0.5">
          <HelpCircle size={18} />
        </div>
        <div className="space-y-1.5">
          <h4 className="text-sm font-semibold tracking-wide">Semana 3: Micro-CMS y Personalización</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Durante la próxima semana habilitaremos completamente este panel de configuración. Podrás subir tu logotipo, seleccionar temas de color personalizados, configurar mensajes automatizados de WhatsApp y habilitar o deshabilitar tu catálogo público.
          </p>
        </div>
      </div>
    </div>
  );
}
