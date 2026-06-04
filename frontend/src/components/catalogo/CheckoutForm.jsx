import React from 'react';

export default function CheckoutForm({
  checkoutNombre,
  setCheckoutNombre,
  checkoutTelefono,
  setCheckoutTelefono,
  checkoutDireccion,
  setCheckoutDireccion,
  handleCheckoutSubmit,
  checkoutError,
  cart,
  totalCartPrice,
  primaryColor,
  isSubmitting
}) {
  return (
    <form onSubmit={handleCheckoutSubmit} className="space-y-6 animate-reveal">
      <div>
        <h3 className="font-serif text-xl font-bold text-[#1a1a1a]">Datos del Destinatario</h3>
        <p className="text-xs text-neutral-400 font-light mt-1">Ingresa tus datos para registrar el pedido y coordinar por WhatsApp.</p>
      </div>

      {checkoutError && (
        <div className="p-4 bg-red-50/80 backdrop-blur-sm border border-red-100/50 text-red-600 text-xs rounded-xl text-center shadow-sm">
          {checkoutError}
        </div>
      )}

      <div className="space-y-4">
        {/* Nombre */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#1a1a1a] tracking-wide">Nombre Completo <span className="text-red-500">*</span></label>
          <input
            type="text"
            required
            value={checkoutNombre}
            onChange={(e) => setCheckoutNombre(e.target.value)}
            placeholder="Ej. Juan Pérez"
            className="w-full px-4 py-3.5 bg-[#fafafa] border border-[#e5e5e5] rounded-xl text-sm text-[#1a1a1a] focus:bg-white focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all shadow-sm placeholder:text-neutral-400"
          />
        </div>

        {/* Teléfono */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#1a1a1a] tracking-wide">Teléfono Móvil <span className="text-red-500">*</span></label>
          <input
            type="tel"
            required
            value={checkoutTelefono}
            onChange={(e) => setCheckoutTelefono(e.target.value)}
            placeholder="Ej. +51 999 999 999"
            className="w-full px-4 py-3.5 bg-[#fafafa] border border-[#e5e5e5] rounded-xl text-sm text-[#1a1a1a] focus:bg-white focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all shadow-sm placeholder:text-neutral-400"
          />
        </div>

        {/* Dirección */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-baseline">
            <label className="text-xs font-semibold text-[#1a1a1a] tracking-wide">Dirección de Entrega</label>
            <span className="text-[10px] text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">Opcional</span>
          </div>
          <textarea
            rows="3"
            value={checkoutDireccion}
            onChange={(e) => setCheckoutDireccion(e.target.value)}
            placeholder="Calle, Edificio, Referencias..."
            className="w-full px-4 py-3.5 bg-[#fafafa] border border-[#e5e5e5] rounded-xl text-sm text-[#1a1a1a] focus:bg-white focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all shadow-sm resize-none placeholder:text-neutral-400"
          />
        </div>
      </div>

      {/* Resumen Compacto */}
      <div className="p-5 bg-neutral-50/80 backdrop-blur-sm rounded-2xl border border-[#e5e5e5] shadow-inner space-y-3">
        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
          Resumen de Pedido
          <span className="flex-1 h-px bg-[#e5e5e5]"></span>
        </p>
        <div className="max-h-32 overflow-y-auto space-y-2 text-xs text-neutral-600 pr-2 scrollbar-none">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between items-center bg-white p-2 rounded-lg border border-[#e5e5e5]/50 shadow-sm">
              <span className="truncate pr-2 font-medium">{item.cantidad}x {item.nombre}</span>
              <span className="font-mono text-neutral-500 font-bold shrink-0">${(Number(item.precio) * item.cantidad).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 text-white text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 filter hover:brightness-110 flex items-center justify-center gap-2 active:scale-[0.98]"
        style={{ backgroundColor: primaryColor || '#1a1a1a', boxShadow: `0 10px 25px -5px ${primaryColor}40` }}
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            Procesando...
          </span>
        ) : (
          <span>Enviar Pedido por WhatsApp</span>
        )}
      </button>
    </form>
  );
}
