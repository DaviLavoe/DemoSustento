import React, { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"

import { useParams } from 'react-router-dom';

export function ThemeToggle({ className = "" }) {
  const { slug } = useParams();
  
  // Determinamos la clave de almacenamiento aislada por empresa o panel
  const isSuperAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/superadmin');
  const storageKey = slug 
    ? `theme_${slug}` 
    : (isSuperAdminPath ? 'theme_superadmin' : 'theme');

  // Inicializar estado basado en localStorage o tema preferido del sistema
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey);
      if (stored) return stored === "dark";
      
      // Defaults premium
      if (slug === 'tech-store-lima' || isSuperAdminPath) {
        return true; 
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  // Sincronizar estado si cambia la ruta o la clave de almacenamiento
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setIsDark(stored === "dark");
      } else {
        if (slug === 'tech-store-lima' || isSuperAdminPath) {
          setIsDark(true);
        } else {
          setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
        }
      }
    }
  }, [storageKey, slug, isSuperAdminPath]);

  // Escuchar cambios de tema globales desde otros toggles en la misma pestaña
  useEffect(() => {
    const handleThemeChange = (e) => {
      setIsDark(e.detail);
    };
    window.addEventListener("theme-change", handleThemeChange);
    return () => window.removeEventListener("theme-change", handleThemeChange);
  }, []);

  // Sincronizar tema entre pestañas distintas cuando localStorage cambia (mismo storageKey)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === storageKey && e.newValue) {
        setIsDark(e.newValue === "dark");
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [storageKey]);

  // Efecto para aplicar la clase 'dark' al HTML cuando cambia el estado
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem(storageKey, "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem(storageKey, "light");
    }
  }, [isDark, storageKey]);

  const handleToggleClick = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    window.dispatchEvent(new CustomEvent("theme-change", { detail: nextDark }));
  };

  return (
    <div
      className={`flex w-16 h-8 p-1 rounded-full cursor-pointer transition-all duration-300 ${
        isDark 
          ? "bg-zinc-950 border border-zinc-800" 
          : "bg-white border border-zinc-200 shadow-inner"
      } ${className}`}
      onClick={handleToggleClick}
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
