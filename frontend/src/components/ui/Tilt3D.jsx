import { useState, useRef, useEffect } from 'react';

export default function Tilt3D({ children, maxTilt = 12, scale = 1.02, className = "" }) {
  const cardRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const requestRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Calcular posición relativa del mouse en porcentaje (-0.5 a 0.5)
    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;

    // Actualizar coordenadas usando requestAnimationFrame para máxima fluidez
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }

    requestRef.current = requestAnimationFrame(() => {
      setCoords({ x: mouseX, y: mouseY });
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    // Volver suavemente al centro
    setCoords({ x: 0, y: 0 });
  };

  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Calcular la rotación basándose en las coordenadas
  // rotateX usa la coordenada Y (el eje vertical hace rotar sobre el eje X)
  // rotateY usa la coordenada X (el eje horizontal hace rotar sobre el eje Y)
  const rotateX = -coords.y * maxTilt;
  const rotateY = coords.x * maxTilt;

  // Calcular el brillo (glare) basándose en la posición del puntero
  const glareX = (coords.x + 0.5) * 100;
  const glareY = (coords.y + 0.5) * 100;

  const cardStyle = {
    transform: isHovered 
      ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`
      : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
    transition: isHovered ? 'transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.5s ease',
    transformStyle: 'preserve-3d',
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={cardStyle}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Efecto Glare (Brillo/Reflejo dinámico) */}
      <div
        className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 0.15 : 0,
          background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 60%)`,
        }}
      />
      
      {/* Contenedor del contenido que habilita el renderizado 3D */}
      <div style={{ transformStyle: 'preserve-3d' }} className="relative z-20 w-full h-full">
        {children}
      </div>
    </div>
  );
}
