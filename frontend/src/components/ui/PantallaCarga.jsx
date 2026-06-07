import React from 'react';

export default function PantallaCarga({ slug, isSuperAdmin }) {
  let letter = 'G';
  let containerBg = 'bg-[#fafafa] dark:bg-neutral-950';
  let boxBg = 'bg-[#1a1a1a] dark:bg-white';
  let textStyle = 'text-white dark:text-zinc-950';
  let pulseTextStyle = 'text-[#666666] dark:text-neutral-400';

  if (isSuperAdmin) {
    letter = 'G';
    containerBg = 'bg-[#06060a]';
    boxBg = 'bg-gradient-to-br from-violet-600 to-indigo-700 shadow-lg shadow-violet-900/30';
    textStyle = 'text-white';
    pulseTextStyle = 'text-violet-400';
  } else if (slug) {
    letter = slug.charAt(0).toUpperCase();
    if (slug === 'tech-store-lima') {
      containerBg = 'bg-[#0a0a0a]';
      boxBg = 'bg-red-600';
      textStyle = 'text-white';
      pulseTextStyle = 'text-neutral-400';
    } else if (slug === 'moda-elegante') {
      containerBg = 'bg-[#0a0a0a]';
      boxBg = 'bg-pink-600';
      textStyle = 'text-white';
      pulseTextStyle = 'text-pink-400';
    } else {
      containerBg = 'bg-[#0a0a0a]';
      boxBg = 'bg-neutral-800';
      textStyle = 'text-white';
      pulseTextStyle = 'text-neutral-400';
    }
  }

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-300 ${containerBg}`}>
      <div className="flex flex-col items-center gap-4 animate-reveal">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center animate-pulse ${boxBg}`}>
          <span className={`font-serif font-bold text-2xl italic leading-none ${textStyle}`}>{letter}</span>
        </div>
        <p className={`text-xs font-semibold tracking-widest uppercase animate-pulse ${pulseTextStyle}`}>
          Cargando...
        </p>
      </div>
    </div>
  );
}
