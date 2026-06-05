import React from 'react';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import CheckoutForm from './CheckoutForm';

export default function CartDrawer({
  isCartOpen,
  setIsCartOpen,
  isCheckoutMode,
  setIsCheckoutMode,
  cart,
  totalCartItems,
  totalCartPrice,
  removeFromCart,
  updateQuantity,
  handleCheckoutSubmit,
  checkoutNombre,
  setCheckoutNombre,
  checkoutTelefono,
  setCheckoutTelefono,
  checkoutDireccion,
  setCheckoutDireccion,
  checkoutError,
  setCheckoutError,
  isSubmitting,
  primaryColor
}) {
  if (!isCartOpen) return null;

  const closeCart = () => {
    setIsCartOpen(false);
    setTimeout(() => {
      setIsCheckoutMode(false);
      setCheckoutError(null);
    }, 300); // Reset after closing animation
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden flex sm:justify-end justify-center items-end sm:items-stretch">
      {/* Backdrop */}
      <div 
        onClick={closeCart}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
      />

      {/* Drawer Panel - Bottom Sheet en móvil, Drawer lateral en PC */}
      <div className="relative w-full sm:w-screen sm:max-w-md h-[90vh] sm:h-full bg-white dark:bg-[#0a0a0a] sm:border-l border-t sm:border-t-0 border-[#e5e5e5] dark:border-neutral-800 shadow-2xl flex flex-col justify-between rounded-t-3xl sm:rounded-none animate-in slide-in-from-bottom sm:slide-in-from-right duration-300 ease-out">
        
        {/* Mango de arrastre para móvil (visual) */}
        <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-12 h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="px-6 py-5 border-b border-[#e5e5e5] dark:border-neutral-800 flex items-center justify-between bg-white sm:bg-[#fafafa] dark:bg-[#0a0a0a] dark:sm:bg-[#111111] rounded-t-3xl sm:rounded-none">
          <div className="flex items-center">
            {isCheckoutMode ? (
              <button 
                onClick={() => {
                  setIsCheckoutMode(false);
                  setCheckoutError(null);
                }}
                className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white font-semibold transition-colors active:scale-95"
              >
                <ArrowLeft size={16} />
                <span>Volver al Carrito</span>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#fafafa] dark:bg-neutral-900 border border-[#e5e5e5] dark:border-neutral-800 flex items-center justify-center shadow-inner">
                  <ShoppingCart size={18} className="text-[#1a1a1a] dark:text-white" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-[#1a1a1a] dark:text-white leading-none">Tu Carrito</h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mt-1">
                    {totalCartItems} {totalCartItems === 1 ? 'artículo' : 'artículos'}
                  </p>
                </div>
              </div>
            )}
          </div>
          <button 
            onClick={closeCart}
            className="w-8 h-8 rounded-full bg-[#fafafa] dark:bg-neutral-900 border border-[#e5e5e5] dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-all active:scale-90"
          >
            <span className="sr-only">Cerrar</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div data-lenis-prevent className="flex-1 overflow-y-auto p-6 scrollbar-none space-y-4 bg-white/50 dark:bg-[#0a0a0a]/50">
          {isCheckoutMode ? (
            <CheckoutForm 
              checkoutNombre={checkoutNombre}
              setCheckoutNombre={setCheckoutNombre}
              checkoutTelefono={checkoutTelefono}
              setCheckoutTelefono={setCheckoutTelefono}
              checkoutDireccion={checkoutDireccion}
              setCheckoutDireccion={setCheckoutDireccion}
              handleCheckoutSubmit={handleCheckoutSubmit}
              checkoutError={checkoutError}
              cart={cart}
              totalCartPrice={totalCartPrice}
              primaryColor={primaryColor}
              isSubmitting={isSubmitting}
            />
          ) : (
            <div className="space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-5 text-center pt-20">
                  <div className="w-24 h-24 rounded-full bg-[#fafafa] dark:bg-neutral-900 border border-[#e5e5e5] dark:border-neutral-800 flex items-center justify-center mb-2 shadow-inner">
                    <ShoppingCart size={32} className="text-neutral-300 dark:text-neutral-600" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#1a1a1a] dark:text-white">Carrito vacío</h3>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-2 max-w-[200px] mx-auto">Aún no has agregado ningún producto a tu carrito.</p>
                  </div>
                  <button 
                    onClick={closeCart}
                    className="mt-4 px-6 py-3 bg-[#1a1a1a] dark:bg-white text-white dark:text-black text-xs font-bold rounded-xl shadow-lg shadow-black/10 hover:-translate-y-0.5 transition-all active:scale-95"
                  >
                    Explorar catálogo
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-white dark:bg-neutral-900 border border-[#e5e5e5]/80 dark:border-neutral-800 shadow-sm hover:shadow-md hover:border-[#e5e5e5] dark:hover:border-neutral-700 transition-all animate-reveal group">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-white dark:bg-white shrink-0 relative border border-black/5 dark:border-neutral-800">
                      <img 
                        src={item.imagen_url || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600'} 
                        alt={item.nombre} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="text-sm font-semibold text-[#1a1a1a] dark:text-white line-clamp-1 group-hover:text-black dark:group-hover:text-white transition-colors">{item.nombre}</h4>
                          <p className="text-neutral-500 dark:text-neutral-400 text-xs font-bold font-mono mt-1">${Number(item.precio).toFixed(2)}</p>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="w-6 h-6 rounded-md bg-neutral-50 dark:bg-neutral-950 text-neutral-400 dark:text-neutral-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 dark:hover:text-red-400 flex items-center justify-center transition-colors shrink-0"
                          title="Quitar del carrito"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center bg-[#fafafa] dark:bg-neutral-950 rounded-lg border border-[#e5e5e5] dark:border-neutral-800 p-0.5">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-7 h-7 rounded-md hover:bg-white dark:hover:bg-neutral-900 flex items-center justify-center text-xs font-bold active:scale-90 transition-all text-[#1a1a1a] dark:text-white"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold font-mono w-6 text-center text-[#1a1a1a] dark:text-white">{item.cantidad}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-7 h-7 rounded-md hover:bg-white dark:hover:bg-neutral-900 flex items-center justify-center text-xs font-bold active:scale-90 transition-all text-[#1a1a1a] dark:text-white"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isCheckoutMode && cart.length > 0 && (
          <div className="p-6 border-t border-[#e5e5e5] dark:border-neutral-800 bg-white sm:bg-[#fafafa] dark:bg-[#0a0a0a] dark:sm:bg-[#111111] space-y-5 rounded-none sm:rounded-bl-none z-20 pb-safe shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-baseline">
              <span className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">Subtotal Estimado</span>
              <span className="font-serif text-3xl font-bold text-[#1a1a1a] dark:text-white drop-shadow-sm">
                <span className="text-lg opacity-50 mr-1">$</span>{totalCartPrice.toFixed(2)}
              </span>
            </div>
            
            <button
              onClick={() => setIsCheckoutMode(true)}
              className="w-full py-4 text-white text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 filter hover:brightness-110 active:scale-[0.98]"
              style={{ backgroundColor: primaryColor || '#1a1a1a', boxShadow: `0 10px 25px -5px ${primaryColor}40` }}
            >
              Completar Pedido
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
