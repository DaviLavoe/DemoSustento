import React from 'react';
import { ShoppingCart, User, Search, Filter, Grid, List } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';

export default function CatalogHeader({
  company,
  clienteAuth,
  setIsAccountOpen,
  setIsCartOpen,
  totalCartItems,
  searchTerm,
  setSearchTerm,
  categories,
  selectedCategory,
  setSelectedCategory,
  viewMode,
  setViewMode,
  primaryColor
}) {
  return (
    <>
      {/* Barra de Navegación */}
      <nav className="sticky top-0 bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-xl border-b border-[#e5e5e5]/50 dark:border-neutral-800 z-30 transition-colors duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-3 group cursor-pointer">
            {company?.logo_url ? (
              <div className="relative w-10 h-10 bg-white overflow-hidden rounded-xl border border-[#e5e5e5] dark:border-neutral-800 shadow-sm group-hover:shadow-md transition-all shrink-0">
                <img 
                  src={company.logo_url} 
                  alt="Logo" 
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
            ) : (
              <div className="w-10 h-10 bg-[#1a1a1a] rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:-translate-y-0.5 transition-all duration-300">
                <span className="text-white font-serif font-bold text-xl italic leading-none">
                  {company?.nombre ? company.nombre.charAt(0).toUpperCase() : 'S'}
                </span>
              </div>
            )}
            <span className="font-serif text-lg sm:text-xl font-bold tracking-widest uppercase text-[#1a1a1a] dark:text-white drop-shadow-sm transition-colors">
              {company?.nombre}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Toggle de Tema Oscuro/Claro */}
            <div className="hidden sm:block mr-1">
              <ThemeToggle />
            </div>

            {/* Botón Mi Cuenta */}
            <button 
              onClick={() => setIsAccountOpen(true)}
              className={`relative p-2.5 sm:px-4 sm:py-2.5 rounded-xl border transition-all duration-300 shadow-sm flex items-center gap-2 group active:scale-95 ${
                clienteAuth.cliente 
                  ? 'border-black dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800' 
                  : 'bg-white dark:bg-neutral-900 border-[#e5e5e5] dark:border-neutral-800 hover:bg-[#fafafa] dark:hover:bg-neutral-800'
              }`}
            >
              <User size={18} className={`${clienteAuth.cliente ? 'text-black dark:text-white' : 'text-neutral-500 dark:text-neutral-400 group-hover:text-[#1a1a1a] dark:group-hover:text-white'} transition-colors`} />
              <span className={`text-xs font-semibold font-mono hidden sm:inline ${clienteAuth.cliente ? 'text-black dark:text-white' : 'text-neutral-600 dark:text-neutral-300'}`}>
                {clienteAuth.cliente ? 'Mi Cuenta' : 'Ingresar'}
              </span>
            </button>

            {/* Botón Carrito */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-[#1a1a1a] border border-black hover:bg-black transition-all duration-300 shadow-lg shadow-black/10 flex items-center gap-2 group active:scale-95 text-white"
            >
              <ShoppingCart size={18} className="text-white group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold font-mono hidden sm:inline tracking-wider">CARRITO</span>
              {totalCartItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md animate-in zoom-in">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>

        </div>
      </nav>

      {/* Header de la Tienda (Hero) */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-28 flex flex-col items-center text-center gap-6 border-b border-[#e5e5e5]/50 dark:border-neutral-800 relative overflow-hidden transition-colors">
        {/* Elemento decorativo de fondo principal */}
        <div 
          className="absolute inset-0 -z-10 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        ></div>

        {/* Resplandor central estático */}
        <div 
          className="absolute top-1/2 left-1/2 -z-10 w-full max-w-xl h-full opacity-30 dark:opacity-20 blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ backgroundColor: primaryColor || '#e5e5e5' }}
        ></div>

        <span
          className="px-5 py-2 bg-white dark:bg-neutral-900 text-[#1a1a1a] dark:text-white text-[10px] font-bold tracking-widest uppercase rounded-full animate-reveal border shadow-sm flex items-center gap-2 transition-colors"
          style={{ borderColor: primaryColor ? `${primaryColor}40` : '#e5e5e5' }}
        >
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor || '#1a1a1a' }}></span>
          Catálogo Oficial
        </span>
        
        <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight text-[#1a1a1a] dark:text-white max-w-4xl leading-[1.05] animate-reveal delay-100 drop-shadow-sm transition-colors">
          {company?.nombre}
        </h1>
        
        <p className="text-neutral-500 dark:text-neutral-400 text-base sm:text-lg md:text-xl font-light max-w-2xl leading-relaxed animate-reveal delay-200 transition-colors">
          {company?.descripcion || "Descubre nuestra selección exclusiva de productos. Diseñados con calidad, estilo y pensados especialmente para ti. Explora nuestro catálogo y encuentra lo que buscas."}
        </p>
      </header>

      {/* Filtros & Controles */}
      <section className="sticky top-20 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-[#e5e5e5]/50 dark:border-neutral-800 z-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Buscador */}
          <div className="relative max-w-md w-full animate-reveal delay-300 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 group-focus-within:text-[#1a1a1a] dark:group-focus-within:text-white transition-colors" size={18} />
            <input
              type="text"
              placeholder="Buscar en el catálogo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#fafafa] dark:bg-neutral-900 border border-[#e5e5e5] dark:border-neutral-800 rounded-2xl text-sm text-[#1a1a1a] dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:bg-white dark:focus:bg-black focus:outline-none focus:border-black dark:focus:border-neutral-600 focus:ring-4 focus:ring-black/5 dark:focus:ring-white/5 transition-all shadow-inner"
            />
          </div>

          {/* Selector de Categorías */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none animate-reveal delay-400 w-full md:w-auto px-2">
            <Filter size={16} className="text-neutral-400 hidden sm:inline shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 active:scale-95 ${
                  selectedCategory === cat
                    ? 'text-white shadow-lg filter brightness-110'
                    : 'bg-white dark:bg-neutral-900 border border-[#e5e5e5] dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-[#1a1a1a] dark:hover:text-white hover:bg-[#fafafa] dark:hover:bg-neutral-800 hover:border-[#d4d4d4] dark:hover:border-neutral-700'
                }`}
                style={selectedCategory === cat ? { backgroundColor: primaryColor || '#1a1a1a', boxShadow: `0 4px 14px -2px ${primaryColor || '#1a1a1a'}40` } : {}}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Alternar Vista */}
          <div className="hidden md:flex items-center gap-1 p-1.5 bg-[#fafafa] dark:bg-neutral-900 border border-[#e5e5e5] dark:border-neutral-800 rounded-2xl animate-reveal delay-500 shadow-inner">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-xl transition-all duration-300 ${viewMode === 'list' ? 'bg-white dark:bg-neutral-800 text-[#1a1a1a] dark:text-white shadow-sm' : 'text-neutral-400 dark:text-neutral-500 hover:text-[#1a1a1a] dark:hover:text-white'}`}
              title="Vista de lista"
            >
              <List size={16} />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-xl transition-all duration-300 ${viewMode === 'grid' ? 'bg-white dark:bg-neutral-800 text-[#1a1a1a] dark:text-white shadow-sm' : 'text-neutral-400 dark:text-neutral-500 hover:text-[#1a1a1a] dark:hover:text-white'}`}
              title="Vista de cuadrícula"
            >
              <Grid size={16} />
            </button>
          </div>

        </div>
      </section>
    </>
  );
}
