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
        className="bg-white rounded-2xl border border-[#e5e5e5] p-5 flex flex-col sm:flex-row items-center gap-6 hover:shadow-xl hover:border-[#d4d4d4] transition-all duration-300 animate-reveal group/card"
        style={{ animationDelay: `${idx * 100}ms` }}
      >
        <div className="w-full sm:w-32 h-24 rounded-xl overflow-hidden bg-neutral-100 shrink-0 relative shadow-inner">
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
        <div className="flex-1 min-w-0 space-y-1.5 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest bg-[#fafafa] px-2 py-0.5 rounded-md border border-[#e5e5e5]/50">{product.categoria}</span>
            <span className="hidden sm:inline text-neutral-300">•</span>
            <h3 className="font-serif text-lg font-bold text-[#1a1a1a] truncate group-hover/card:text-[#1a1a1a]/80 transition-colors">{product.nombre}</h3>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(product);
              }}
              className="text-neutral-400 hover:text-red-500 active:scale-90 transition-colors ml-1"
              style={isInWishlist(product.id) ? { color: '#ef4444' } : {}}
              aria-label="Agregar a favoritos"
            >
              <Heart size={16} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} className="drop-shadow-sm" />
            </button>
          </div>
          <p className="text-neutral-500 text-xs font-light line-clamp-2 leading-relaxed">{product.descripcion}</p>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0 border-[#e5e5e5]/50">
          <span className="font-serif text-xl font-bold text-[#1a1a1a] drop-shadow-sm">${product.precio.toFixed(2)}</span>
          <button
            disabled={isOutOfStock}
            onClick={() => addToCart(product)}
            className={`flex items-center justify-center gap-1.5 px-4 py-2.5 text-white text-xs font-semibold rounded-xl transition-all duration-300 group/btn shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-${primaryColor}/20 hover:-translate-y-0.5 filter hover:brightness-110 ${
              isOutOfStock ? 'bg-neutral-300 border-neutral-300 cursor-not-allowed opacity-50 hover:translate-y-0 shadow-none' : 'active:scale-95 active:shadow-sm'
            }`}
            style={!isOutOfStock ? { backgroundColor: primaryColor } : {}}
          >
            <span>{isOutOfStock ? 'Agotado' : 'Añadir al Carrito'}</span>
          </button>
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
      <Tilt3D maxTilt={10} scale={1.015} className="bg-white rounded-[24px] border border-[#e5e5e5] h-full flex flex-col group/card shadow-sm hover:shadow-2xl hover:shadow-black/5 hover:border-[#d4d4d4] transition-all duration-500 overflow-hidden relative">
        
        <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-100 relative shadow-inner">
          <img
            src={imageUrl}
            alt={product.nombre}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
            loading="lazy"
          />
          {/* Capa de gradiente sutil para mejorar la legibilidad de insignias */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>

          <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
            <span className="px-3 py-1.5 bg-white/80 backdrop-blur-md text-[10px] font-bold text-[#1a1a1a] rounded-xl border border-white/50 shadow-sm uppercase tracking-wider transition-transform duration-300 group-hover/card:scale-105">
              {product.categoria}
            </span>
          </div>

          {isOutOfStock && (
            <span className="absolute top-4 right-4 px-3 py-1.5 bg-red-600/90 backdrop-blur-md text-white text-[10px] font-bold rounded-xl border border-red-500/50 shadow-md uppercase tracking-wider">
              Sin Stock
            </span>
          )}
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className="absolute bottom-4 right-4 p-2.5 rounded-xl bg-white/80 backdrop-blur-md border border-white/50 shadow-sm hover:shadow-md active:scale-90 hover:scale-110 transition-all duration-300 text-neutral-600 hover:text-red-500 z-10"
            style={isInWishlist(product.id) ? { color: '#ef4444' } : {}}
            aria-label="Agregar a favoritos"
          >
            <Heart size={16} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} className="drop-shadow-sm" />
          </button>
        </div>

        <div className="p-3 sm:p-6 flex-1 flex flex-col justify-between gap-3 sm:gap-5 relative z-10 bg-white">
          <div className="space-y-1 sm:space-y-2.5">
            <h3 className="font-serif text-sm sm:text-xl font-semibold text-[#1a1a1a] leading-tight group-hover/card:text-[#1a1a1a]/80 transition-colors line-clamp-2">
              {product.nombre}
            </h3>
            <p className="text-neutral-500 text-[10px] sm:text-xs font-light line-clamp-2 leading-relaxed">
              {product.descripcion}
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-[#e5e5e5]/60 pt-3 sm:pt-5">
            <span className="font-serif text-base sm:text-2xl font-bold text-[#1a1a1a] tracking-tight drop-shadow-sm">
              ${product.precio.toFixed(2)}
            </span>
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
