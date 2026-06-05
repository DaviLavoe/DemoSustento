import React from 'react';

export default function CardMetrica({ titulo, valor, Icono, loading, alert }) {
  return (
    <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-[#e5e5e5] dark:border-zinc-800 shadow-xs flex items-center justify-between transition-all duration-300 hover:shadow-sm">
      <div className="space-y-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#666666] dark:text-[#a1a1aa] truncate">{titulo}</p>
        <h3 className="font-serif text-3xl font-bold text-[#1a1a1a] dark:text-neutral-100 truncate">
          {loading ? '...' : valor}
        </h3>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
        alert 
          ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30 text-amber-600 dark:text-amber-500 animate-pulse' 
          : 'bg-[#fafafa] dark:bg-zinc-950 border-[#e5e5e5] dark:border-zinc-800 text-[#1a1a1a] dark:text-white'
      }`}>
        <Icono size={20} />
      </div>
    </div>
  );
}
