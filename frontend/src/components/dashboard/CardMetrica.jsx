import React from 'react';

export default function CardMetrica({ titulo, valor, Icono, loading, alert }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-[#e5e5e5] shadow-xs flex items-center justify-between transition-all duration-300 hover:shadow-sm">
      <div className="space-y-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#666666] truncate">{titulo}</p>
        <h3 className="font-serif text-3xl font-bold text-[#1a1a1a] truncate">
          {loading ? '...' : valor}
        </h3>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
        alert 
          ? 'bg-amber-50 border-amber-200 text-amber-600 animate-pulse' 
          : 'bg-[#fafafa] border-[#e5e5e5] text-[#1a1a1a]'
      }`}>
        <Icono size={20} />
      </div>
    </div>
  );
}
