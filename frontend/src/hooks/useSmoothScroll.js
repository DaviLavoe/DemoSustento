import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

export default function useSmoothScroll(enabled = true) {
  const lenisRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    // Inicializar Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Easing custom similar a un easeOut expo
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;

    // Función de actualización por frame
    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    // Limpieza al desmontar el componente
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [enabled]);

  return lenisRef.current;
}
