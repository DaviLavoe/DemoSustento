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
  isSubmitting,
  metodoPago = 'whatsapp',
  setMetodoPago,
  clienteAuth,
  onOpenPortal,
  onOpenLogin
}) {
  return (
    <form onSubmit={handleCheckoutSubmit} className="space-y-6 animate-reveal">
      <div>
        <h3 className="font-serif text-xl font-bold text-[#1a1a1a] dark:text-white">Datos del Destinatario</h3>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 font-light mt-1">
          {metodoPago === 'credito' 
            ? 'Ingresa tus datos para registrar el pedido y realizar el pago con tu crédito.'
            : 'Ingresa tus datos para registrar el pedido y coordinar por WhatsApp.'}
        </p>
      </div>

      {checkoutError && (
        <div className="p-4 bg-red-50/80 dark:bg-red-950/20 backdrop-blur-sm border border-red-100/50 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-xl text-center shadow-sm">
          {checkoutError}
        </div>
      )}

      <div className="space-y-4">
        {/* Nombre */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#1a1a1a] dark:text-neutral-300 tracking-wide">Nombre Completo <span className="text-red-500">*</span></label>
          <input
            type="text"
            required
            value={checkoutNombre}
            onChange={(e) => setCheckoutNombre(e.target.value)}
            placeholder="Ej. Juan Pérez"
            className="w-full px-4 py-3.5 bg-[#fafafa] dark:bg-neutral-950 border border-[#e5e5e5] dark:border-neutral-800 rounded-xl text-sm text-[#1a1a1a] dark:text-white focus:bg-white dark:focus:bg-black focus:outline-none focus:ring-4 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-neutral-600 transition-all shadow-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
          />
        </div>

        {/* Teléfono */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#1a1a1a] dark:text-neutral-300 tracking-wide">Teléfono Móvil <span className="text-red-500">*</span></label>
          <input
            type="tel"
            required
            value={checkoutTelefono}
            onChange={(e) => setCheckoutTelefono(e.target.value)}
            placeholder="Ej. +51 999 999 999"
            className="w-full px-4 py-3.5 bg-[#fafafa] dark:bg-neutral-950 border border-[#e5e5e5] dark:border-neutral-800 rounded-xl text-sm text-[#1a1a1a] dark:text-white focus:bg-white dark:focus:bg-black focus:outline-none focus:ring-4 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-neutral-600 transition-all shadow-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
          />
        </div>

        {/* Dirección */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-baseline">
            <label className="text-xs font-semibold text-[#1a1a1a] dark:text-neutral-300 tracking-wide">Dirección de Entrega</label>
            <span className="text-[10px] text-neutral-400 dark:text-neutral-550 bg-neutral-100 dark:bg-neutral-900 px-2 py-0.5 rounded-full">Opcional</span>
          </div>
          <textarea
            rows="3"
            value={checkoutDireccion}
            onChange={(e) => setCheckoutDireccion(e.target.value)}
            placeholder="Calle, Edificio, Referencias..."
            className="w-full px-4 py-3.5 bg-[#fafafa] dark:bg-neutral-950 border border-[#e5e5e5] dark:border-neutral-800 rounded-xl text-sm text-[#1a1a1a] dark:text-white focus:bg-white dark:focus:bg-black focus:outline-none focus:ring-4 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-neutral-600 transition-all shadow-sm resize-none placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
          />
        </div>
      </div>

      {/* Método de Pago */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-[#1a1a1a] dark:text-neutral-300 tracking-wide">Método de Pago</label>
        <div className="grid grid-cols-2 gap-3">
          {/* Opción WhatsApp */}
          <div 
            onClick={() => setMetodoPago('whatsapp')}
            className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all select-none ${
              metodoPago === 'whatsapp'
                ? 'border-green-605 bg-green-50/40 dark:bg-green-950/10 dark:border-green-500 shadow-sm'
                : 'border-[#e5e5e5] dark:border-neutral-800 bg-[#fafafa] dark:bg-neutral-950 hover:bg-neutral-50 dark:hover:bg-neutral-900'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${metodoPago === 'whatsapp' ? 'bg-green-600 text-white' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            </div>
            <span className="text-xs font-bold dark:text-white">Coordinar WhatsApp</span>
          </div>

          {/* Opción Crédito */}
          <div 
            onClick={() => setMetodoPago('credito')}
            className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all select-none ${
              metodoPago === 'credito'
                ? 'border-indigo-605 bg-indigo-50/40 dark:bg-indigo-950/10 dark:border-indigo-500 shadow-sm'
                : 'border-[#e5e5e5] dark:border-neutral-800 bg-[#fafafa] dark:bg-neutral-950 hover:bg-neutral-50 dark:hover:bg-neutral-900'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${metodoPago === 'credito' ? 'bg-indigo-600 text-white' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/><rect x="6" y="8" width="12" height="4" rx="1" ry="1"/></svg>
            </div>
            <span className="text-xs font-bold dark:text-white">Crédito de Cuenta</span>
          </div>
        </div>
      </div>

      {/* Métricas de Crédito */}
      {metodoPago === 'credito' && (
        <div className="p-4 bg-neutral-50/80 dark:bg-neutral-900/50 rounded-2xl border border-[#e5e5e5] dark:border-neutral-800 space-y-3 animate-reveal">
          {!clienteAuth.cliente ? (
            <div className="space-y-2 text-center py-2">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Debes iniciar sesión con tu cuenta de cliente para pagar con el crédito de tu cuenta.
              </p>
              <button
                type="button"
                onClick={onOpenLogin}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Iniciar Sesión / Crear Cuenta
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500 dark:text-neutral-400">Saldo Disponible:</span>
                <span className="font-bold font-mono dark:text-white">${Number(clienteAuth.cliente.saldo || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-[#e5e5e5]/80 dark:border-neutral-800/80 pt-2">
                <span className="text-neutral-500 dark:text-neutral-400">Total a Pagar:</span>
                <span className="font-bold font-mono dark:text-white">${totalCartPrice.toFixed(2)}</span>
              </div>
              
              {Number(clienteAuth.cliente.saldo || 0) < totalCartPrice ? (
                <div className="bg-red-50/50 dark:bg-red-950/10 border border-red-100/30 dark:border-red-900/20 p-3 rounded-xl space-y-2">
                  <p className="text-[11px] text-red-600 dark:text-red-400 font-medium">Saldo insuficiente para completar la compra.</p>
                  <button
                    type="button"
                    onClick={onOpenPortal}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    Ir a Recargar Saldo
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/30 dark:border-emerald-900/20 p-3 rounded-xl space-y-1 text-[11px]">
                  <p className="text-emerald-700 dark:text-emerald-400 font-bold">✓ ¡Saldo Suficiente!</p>
                  <p className="text-neutral-550 dark:text-neutral-400">
                    Saldo restante estimado: <strong className="font-mono text-neutral-700 dark:text-neutral-300">${(Number(clienteAuth.cliente.saldo || 0) - totalCartPrice).toFixed(2)}</strong>
                  </p>
                  <p className="text-neutral-550 dark:text-neutral-400">
                    Ganarás <strong className="text-neutral-700 dark:text-neutral-300">+{Math.round(totalCartPrice * 0.05)} puntos</strong> de lealtad (5% de la compra).
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Resumen Compacto */}
      <div className="p-5 bg-neutral-50/80 dark:bg-neutral-900/50 backdrop-blur-sm rounded-2xl border border-[#e5e5e5] dark:border-neutral-800 shadow-inner space-y-3">
        <p className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest flex items-center gap-2">
          Resumen de Pedido
          <span className="flex-1 h-px bg-[#e5e5e5] dark:bg-neutral-800"></span>
        </p>
        <div className="max-h-32 overflow-y-auto space-y-2 text-xs text-neutral-600 dark:text-neutral-350 pr-2 scrollbar-none">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between items-center bg-white dark:bg-neutral-950 p-2 rounded-lg border border-[#e5e5e5]/50 dark:border-neutral-800/50 shadow-sm">
              <span className="truncate pr-2 font-medium dark:text-white">{item.cantidad}x {item.nombre}</span>
              <span className="font-mono text-neutral-500 dark:text-neutral-400 font-bold shrink-0">${(Number(item.precio) * item.cantidad).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={
          isSubmitting || 
          (metodoPago === 'credito' && (!clienteAuth.cliente || Number(clienteAuth.cliente.saldo || 0) < totalCartPrice))
        }
        className="w-full py-4 text-white text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 filter hover:brightness-110 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        style={{ 
          backgroundColor: metodoPago === 'credito' ? '#4f46e5' : (primaryColor || '#1a1a1a'), 
          boxShadow: metodoPago === 'credito' 
            ? '0 10px 25px -5px rgba(79, 70, 229, 0.4)' 
            : `0 10px 25px -5px ${primaryColor}40` 
        }}
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            Procesando...
          </span>
        ) : (
          <span>
            {metodoPago === 'credito' 
              ? (!clienteAuth.cliente 
                  ? 'Inicia sesión para pagar con crédito' 
                  : (Number(clienteAuth.cliente.saldo || 0) < totalCartPrice 
                      ? 'Saldo Insuficiente' 
                      : `Pagar con Crédito ($${totalCartPrice.toFixed(2)})`
                    )
                )
              : 'Enviar Pedido por WhatsApp'
            }
          </span>
        )}
      </button>
    </form>
  );
}
