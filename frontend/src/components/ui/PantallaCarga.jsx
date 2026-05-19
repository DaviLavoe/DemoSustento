import React from 'react';

export default function PantallaCarga() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4 animate-reveal">
        <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center animate-pulse">
          <span className="text-white font-serif font-bold text-2xl italic">S</span>
        </div>
        <p className="text-sm font-medium tracking-widest text-[#666666] uppercase animate-pulse">
          Cargando...
        </p>
      </div>
    </div>
  );
}
