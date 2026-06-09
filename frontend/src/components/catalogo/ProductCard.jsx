import React from 'react';
import { ArrowUpRight, Heart } from 'lucide-react';
import Tilt3D from '../ui/Tilt3D';

export default function ProductCard({
  product,
  viewMode,
  idx,
  primaryColor,
  isInWishlist,
  toggleWishlist,
  addToCart
}) {
  const imageUrl = product.imagen_url || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600';
  const isOutOfStock = product.stock <= 0;

  if (viewMode === 'list') {
    return (
      <div 
        className="bg-white dark:bg-[#151515] rounded-2xl border border-[#e5e5e5] dark:border-neutral-800 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 hover:shadow-xl hover:border-[#d4d4d4] dark:hover:border-neutral-700 transition-all duration-300 animate-reveal group/card"
        style={{ animationDelay: `${idx * 100}ms` }}
      >
        <div className="w-full sm:w-32 h-48 sm:h-24 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0 relative shadow-inner">
          <img 
            src={imageUrl} 
            alt={product.nombre} 
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
            loading="lazy"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
              <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-red-600/90 px-1.5 py-0.5 rounded shadow-sm">Agotado</span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0 flex flex-col gap-1.5 sm:gap-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <span className="inline-block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest bg-[#fafafa] dark:bg-neutral-800 px-2 py-0.5 rounded-md border border-[#e5e5e5]/50 dark:border-neutral-700/50 mb-1">
                {product.categoria}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white leading-snug group-hover/card:text-neutral-700 dark:group-hover/card:text-neutral-300 transition-colors">
                {product.nombre}
              </h3>
            </div>
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs font-light line-clamp-2 leading-relaxed">
            {product.descripcion}
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#e5e5e5]/50 dark:border-neutral-800/50 mt-1 sm:mt-0">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className="text-neutral-400 dark:text-neutral-500 hover:text-red-500 active:scale-90 transition-colors shrink-0"
            style={isInWishlist(product.id) ? { color: '#ef4444' } : {}}
            aria-label="Agregar a favoritos"
          >
            <Heart size={20} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} className="drop-shadow-sm" />
          </button>
          
          <div className="flex items-center justify-end gap-4 flex-1 sm:flex-initial">
            <span className="font-serif text-lg sm:text-xl font-bold text-neutral-900 dark:text-white drop-shadow-sm">
              ${product.precio.toFixed(2)}
            </span>
          <button
            disabled={isOutOfStock}
            onClick={() => addToCart(product)}
            className={`flex items-center justify-center gap-1.5 px-4 py-2 sm:py-2.5 text-white text-xs font-semibold rounded-xl transition-all duration-300 group/btn shadow-lg shadow-black/5 hover:shadow-xl hover:-translate-y-0.5 filter hover:brightness-110 ${
              isOutOfStock ? 'bg-neutral-300 border-neutral-300 cursor-not-allowed opacity-50 hover:translate-y-0 shadow-none' : 'active:scale-95 active:shadow-sm'
            }`}
            style={!isOutOfStock ? { backgroundColor: primaryColor } : {}}
          >
            <span>{isOutOfStock ? 'Agotado' : 'Añadir al Carrito'}</span>
          </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid View (Default)
  return (
    <div 
      className="animate-reveal h-full"
      style={{ animationDelay: `${(idx % 3) * 150 + 200}ms` }}
    >
      <Tilt3D maxTilt={10} scale={1.015} className="bg-white dark:bg-[#151515] rounded-[24px] border border-[#e5e5e5] dark:border-neutral-800 h-full flex flex-col group/card shadow-sm hover:shadow-2xl hover:shadow-black/5 hover:border-[#d4d4d4] dark:hover:border-neutral-700 transition-all duration-500 overflow-hidden relative">
        
        <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800 relative shadow-inner">
          <img
            src={imageUrl}
            alt={product.nombre}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
            loading="lazy"
          />
          {/* Capa de gradiente sutil para mejorar la legibilidad de insignias */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>

          <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
            <span className="px-3 py-1.5 bg-white/80 dark:bg-black/80 backdrop-blur-md text-[10px] font-bold text-[#1a1a1a] dark:text-white rounded-xl border border-white/50 dark:border-white/10 shadow-sm uppercase tracking-wider transition-transform duration-300 group-hover/card:scale-105">
              {product.categoria}
            </span>
          </div>

          {isOutOfStock && (
            <span className="absolute top-4 right-4 px-3 py-1.5 bg-red-600/90 backdrop-blur-md text-white text-[10px] font-bold rounded-xl border border-red-500/50 shadow-md uppercase tracking-wider">
              Sin Stock
            </span>
          )}
        </div>

        <div className="p-3 sm:p-6 flex-1 flex flex-col justify-between gap-3 sm:gap-5 relative z-10 bg-white dark:bg-[#151515]">
          <div className="space-y-1 sm:space-y-2.5">
            <h3 className="font-serif text-sm sm:text-xl font-semibold text-[#1a1a1a] dark:text-white leading-tight group-hover/card:text-[#1a1a1a]/80 dark:group-hover/card:text-white/80 transition-colors line-clamp-2">
              {product.nombre}
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 text-[10px] sm:text-xs font-light line-clamp-2 leading-relaxed">
              {product.descripcion}
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-[#e5e5e5]/60 dark:border-neutral-800/60 pt-3 sm:pt-5">
            <div className="flex items-center gap-3">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleWishlist(product);
                }}
                className="text-neutral-400 dark:text-neutral-500 hover:text-red-500 active:scale-90 transition-colors shrink-0"
                style={isInWishlist(product.id) ? { color: '#ef4444' } : {}}
                aria-label="Agregar a favoritos"
              >
                <Heart size={20} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} className="drop-shadow-sm" />
              </button>
              <span className="font-serif text-base sm:text-2xl font-bold text-[#1a1a1a] dark:text-white tracking-tight drop-shadow-sm">
                ${product.precio.toFixed(2)}
              </span>
            </div>
            <button
              disabled={isOutOfStock}
              onClick={() => addToCart(product)}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2.5 text-white text-[10px] sm:text-xs font-semibold rounded-lg sm:rounded-xl transition-all duration-300 group/btn shadow-md shadow-black/5 hover:shadow-xl hover:-translate-y-0.5 filter hover:brightness-110 ${
                isOutOfStock ? 'bg-neutral-300 border-neutral-300 cursor-not-allowed opacity-50 hover:translate-y-0 shadow-none' : 'active:scale-95 active:shadow-sm'
              }`}
              style={!isOutOfStock ? { backgroundColor: primaryColor } : {}}
            >
              <span>{isOutOfStock ? 'Agotado' : 'Añadir'}</span>
              {!isOutOfStock && <ArrowUpRight size={12} className="hidden sm:block group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />}
            </button>
          </div>
        </div>

      </Tilt3D>
    </div>
  );
}
