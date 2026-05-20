import { useEffect, useState } from 'react';

export default function PantallaCargaPublica({ onComplete, nombreTienda = "Sustento" }) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isRendered, setIsRendered] = useState(true);

  useEffect(() => {
    // Incremento progresivo del contador con velocidad variable para simular carga
    let start = 0;
    const duration = 1600; // 1.6 segundos
    const intervalTime = 20;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      start += step + Math.random() * 3; // Añadimos aleatoriedad para naturalidad
      if (start >= 100) {
        start = 100;
        clearInterval(timer);
        setTimeout(() => {
          setIsExiting(true); // Iniciar transición de salida
          setTimeout(() => {
            setIsRendered(false);
            if (onComplete) onComplete();
          }, 800); // Duración de la animación de salida
        }, 400); // Pausa al llegar a 100%
      }
      setProgress(Math.floor(start));
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  if (!isRendered) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {/* Panel Trasero (Gris/Claro para efecto de capas) */}
      <div 
        className={`absolute inset-0 bg-neutral-100 transition-transform duration-700 cubic-bezier(0.85, 0, 0.15, 1)`}
        style={{ 
          transform: isExiting ? 'translateY(-100%)' : 'translateY(0%)',
          transitionDelay: '100ms'
        }}
      />

      {/* Panel Principal (Negro o Gris muy Oscuro) */}
      <div 
        className={`absolute inset-0 bg-neutral-950 flex flex-col justify-between p-10 sm:p-16 transition-transform duration-700 cubic-bezier(0.85, 0, 0.15, 1) pointer-events-auto`}
        style={{ 
          transform: isExiting ? 'translateY(-100%)' : 'translateY(0%)'
        }}
      >
        {/* Cabecera del Loader */}
        <div className="flex items-center gap-3 animate-pulse">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
            <span className="text-white font-serif italic text-lg font-bold">S</span>
          </div>
          <span className="text-white/60 text-xs font-semibold tracking-widest uppercase">
            Catálogo Digital
          </span>
        </div>

        {/* Centro: Nombre de la tienda y efecto de revelado */}
        <div className="flex flex-col items-start gap-4">
          <div className="overflow-hidden">
            <h2 className="font-serif text-5xl sm:text-7xl text-white font-medium leading-none tracking-tight animate-reveal">
              {nombreTienda}
            </h2>
          </div>
          <p className="text-neutral-400 text-sm font-light tracking-wide max-w-xs animate-reveal delay-200">
            Cargando catálogo interactivo y catálogo de productos...
          </p>
        </div>

        {/* Pie: Contador de progreso con diseño minimalista */}
        <div className="flex justify-between items-end border-t border-white/10 pt-8">
          <div className="flex flex-col gap-1">
            <span className="text-neutral-500 text-xs uppercase tracking-wider">Cargando Activos</span>
            <span className="text-neutral-300 text-sm font-mono">Por favor, espera</span>
          </div>
          <div className="overflow-hidden flex items-baseline">
            <span className="font-serif text-7xl sm:text-8xl text-white font-light leading-none">
              {String(progress).padStart(3, '0')}
            </span>
            <span className="text-white/60 text-sm font-mono ml-2">%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
