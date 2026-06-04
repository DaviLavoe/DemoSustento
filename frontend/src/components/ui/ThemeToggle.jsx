import React, { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle({ className = "" }) {
  // Inicializar estado basado en localStorage o tema preferido del sistema
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      if (stored) return stored === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  // Efecto para aplicar la clase 'dark' al HTML cuando cambia el estado
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <div
      className={`flex w-16 h-8 p-1 rounded-full cursor-pointer transition-all duration-300 ${
        isDark 
          ? "bg-zinc-950 border border-zinc-800" 
          : "bg-white border border-zinc-200 shadow-inner"
      } ${className}`}
      onClick={() => setIsDark(!isDark)}
      role="button"
      tabIndex={0}
      title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      <div className="flex justify-between items-center w-full relative">
        <div
          className={`absolute flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300 ${
            isDark 
              ? "transform translate-x-0 bg-zinc-800" 
              : "transform translate-x-8 bg-neutral-100 shadow-sm"
          }`}
        >
          {isDark ? (
            <Moon 
              className="w-3.5 h-3.5 text-white" 
              strokeWidth={2}
            />
          ) : (
            <Sun 
              className="w-3.5 h-3.5 text-yellow-500" 
              strokeWidth={2}
            />
          )}
        </div>
        
        {/* Íconos de fondo inactivos */}
        <div className="flex justify-between w-full px-1.5 pointer-events-none">
          <Moon 
            className={`w-3.5 h-3.5 transition-colors duration-300 ${isDark ? 'opacity-0' : 'text-neutral-300'}`} 
            strokeWidth={2}
          />
          <Sun 
            className={`w-3.5 h-3.5 transition-colors duration-300 ${isDark ? 'text-zinc-600' : 'opacity-0'}`} 
            strokeWidth={2}
          />
        </div>
      </div>
    </div>
  )
}
