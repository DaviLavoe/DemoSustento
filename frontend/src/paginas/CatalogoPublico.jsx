import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingCart, Search, Filter, MessageSquare, ArrowUpRight, Grid, List } from 'lucide-react';
import { supabase } from '../config/supabase';
import useSmoothScroll from '../hooks/useSmoothScroll';
import PantallaCargaPublica from '../components/ui/PantallaCargaPublica';
import Tilt3D from '../components/ui/Tilt3D';

export default function CatalogoPublico() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [categories, setCategories] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Activar scroll suave con Lenis una vez que termine la carga de datos
  useSmoothScroll(!loading);

  useEffect(() => {
    async function fetchCatalogData() {
      try {
        // 1. Obtener datos de la empresa por su slug
        let companyData = null;
        if (slug) {
          const { data, error } = await supabase
            .from('empresas')
            .select('*')
            .eq('slug', slug)
            .single();
            
          if (!error && data) {
            companyData = data;
          }
        }

        // Si no hay base de datos o empresa, usar valores de demostración premium
        if (!companyData) {
          companyData = {
            id: 'demo-id',
            nombre: 'Sustento Concept Store',
            slug: slug || 'sustento-demo',
            telefono_whatsapp: '51999999999',
            logo_url: null,
            descripcion: 'Muebles de diseño y decoración minimalista con materiales sustentables.',
            config: {
              primaryColor: '#1a1a1a',
              secondaryColor: '#f5f5f7',
              accentColor: '#d4af37',
              fontFamily: 'serif'
            }
          };
        }
        setCompany(companyData);

        // 2. Obtener productos activos de la empresa
        let productsData = [];
        if (companyData.id !== 'demo-id') {
          const { data, error } = await supabase
            .from('productos')
            .select('*')
            .eq('empresa_id', companyData.id)
            .eq('activo', true);

          if (!error && data) {
            productsData = data;
          }
        }

        // Cargar lista de demostración de alta calidad solo para la tienda de demo
        if (companyData.id === 'demo-id') {
          productsData = [
            {
              id: '1',
              nombre: 'Silla Minimalista Nórdica',
              categoria: 'Sillas',
              precio: 189.00,
              stock: 12,
              descripcion: 'Silla de madera de roble con cojín ergonómico de lino natural.',
              imagen_url: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=600'
            },
            {
              id: '2',
              nombre: 'Lámpara de Pie Éter',
              categoria: 'Iluminación',
              precio: 245.00,
              stock: 8,
              descripcion: 'Lámpara con base de travertino y difusor de vidrio soplado opalino.',
              imagen_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=600'
            },
            {
              id: '3',
              nombre: 'Mesa de Centro Orgánica',
              categoria: 'Mesas',
              precio: 420.00,
              stock: 4,
              descripcion: 'Mesa de madera maciza de nogal recuperada con acabado de cera de abejas.',
              imagen_url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=600'
            },
            {
              id: '4',
              nombre: 'Jarrón Wabi-Sabi Grande',
              categoria: 'Decoración',
              precio: 95.00,
              stock: 15,
              descripcion: 'Cerámica artesanal texturizada con engobe de cenizas volcánicas.',
              imagen_url: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&q=80&w=600'
            },
            {
              id: '5',
              nombre: 'Sillón Bauhaus Cuero',
              categoria: 'Sillones',
              precio: 780.00,
              stock: 3,
              descripcion: 'Estructura tubular cromada con cuero italiano de curtido vegetal.',
              imagen_url: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&q=80&w=600'
            },
            {
              id: '6',
              nombre: 'Macetero Escultural Terra',
              categoria: 'Decoración',
              precio: 110.00,
              stock: 20,
              descripcion: 'Maceta de concreto aligerado ideal para interiores y terrazas semi-cubiertas.',
              imagen_url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=600'
            }
          ];
        }

        setProducts(productsData);
        setFilteredProducts(productsData);

        // Extraer categorías únicas
        const uniqueCategories = ['Todas', ...new Set(productsData.map(p => p.categoria).filter(Boolean))];
        setCategories(uniqueCategories);

      } catch (err) {
        console.error('Error al cargar datos del catálogo:', err);
      }
    }

    fetchCatalogData();
  }, [slug]);

  // Manejo de búsqueda y filtros
  useEffect(() => {
    let result = products;

    if (selectedCategory !== 'Todas') {
      result = result.filter(p => p.categoria === selectedCategory);
    }

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.nombre.toLowerCase().includes(term) || 
        (p.descripcion && p.descripcion.toLowerCase().includes(term))
      );
    }

    setFilteredProducts(result);
  }, [searchTerm, selectedCategory, products]);

  // Carrito de compras
  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => item.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item);
      }
      return [...prev, { ...product, cantidad: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, amount) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.cantidad + amount;
        return newQty > 0 ? { ...item, cantidad: newQty } : item;
      }
      return item;
    }));
  };

  // Generar link dinámico de WhatsApp
  const sendWhatsAppOrder = () => {
    if (cart.length === 0 || !company) return;

    let message = `*Nuevo pedido de ${company.nombre}*\n\n`;
    let total = 0;

    cart.forEach(item => {
      const subtotal = item.precio * item.cantidad;
      message += `• ${item.cantidad}x *${item.nombre}* - $${item.precio.toFixed(2)} (Subtotal: $${subtotal.toFixed(2)})\n`;
      total += subtotal;
    });

    message += `\n*Total a pagar: $${total.toFixed(2)}*\n\n_Por favor, confírmame disponibilidad y método de pago._`;
    
    const encodedText = encodeURIComponent(message);
    const phoneNumber = company.telefono_whatsapp || '51999999999';
    window.open(`https://wa.me/${phoneNumber}?text=${encodedText}`, '_blank');
  };

  const totalCartPrice = cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  const totalCartItems = cart.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a1a] font-sans">
      
      {/* 1. Loader Interactivo Premium */}
      <PantallaCargaPublica 
        nombreTienda={company?.nombre || "Sustento"} 
        onComplete={() => setLoading(false)} 
      />

      {/* Solo renderizar el contenido cuando termine la animación de carga */}
      {!loading && (
        <div className="animate-reveal duration-1000">
          
          {/* 2. Barra de Navegación */}
          <nav className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-[#e5e5e5] z-30 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
              
              <div className="flex items-center gap-3">
                {company?.logo_url ? (
                  <img 
                    src={company.logo_url} 
                    alt="Logo" 
                    className="w-9 h-9 rounded-xl object-contain border border-[#e5e5e5]" 
                  />
                ) : (
                  <div className="w-9 h-9 bg-[#1a1a1a] rounded-xl flex items-center justify-center">
                    <span className="text-white font-serif font-bold text-xl italic leading-none">
                      {company?.nombre ? company.nombre.charAt(0).toUpperCase() : 'S'}
                    </span>
                  </div>
                )}
                <span className="font-serif text-xl font-semibold tracking-wider uppercase">{company?.nombre}</span>
              </div>

              {/* Botón Carrito */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 rounded-xl bg-white border border-[#e5e5e5] hover:bg-[#fafafa] active:scale-95 transition-all duration-200 shadow-sm flex items-center gap-2 group"
              >
                <ShoppingCart size={18} className="text-[#1a1a1a]" />
                <span className="text-xs font-semibold font-mono hidden sm:inline">Carrito</span>
                {totalCartItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#1a1a1a] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                    {totalCartItems}
                  </span>
                )}
              </button>

            </div>
          </nav>

          {/* 3. Header de la Tienda (Hero) */}
          <header className="max-w-7xl mx-auto px-6 py-16 sm:py-24 flex flex-col items-start gap-6 border-b border-[#e5e5e5]">
            <span className="px-3.5 py-1 bg-[#1a1a1a]/5 text-[#1a1a1a] text-[10px] font-semibold tracking-widest uppercase rounded-full animate-reveal">
              Catálogo de Exposición
            </span>
            <h1 className="font-serif text-5xl sm:text-7xl font-bold tracking-tight text-[#1a1a1a] max-w-3xl leading-[1.05] animate-reveal delay-100">
              {company?.nombre}
            </h1>
            <p className="text-neutral-500 text-lg sm:text-xl font-light max-w-2xl leading-relaxed animate-reveal delay-200">
              {company?.descripcion}
            </p>
          </header>

          {/* 4. Filtros & Controles */}
          <section className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e5e5e5]">
            
            {/* Buscador */}
            <div className="relative max-w-md w-full animate-reveal delay-300">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <input
                type="text"
                placeholder="Buscar en el catálogo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#e5e5e5] rounded-2xl text-sm text-[#1a1a1a] placeholder-neutral-400 focus:outline-none focus:border-[#1a1a1a] focus:ring-2 focus:ring-[#1a1a1a]/5 transition-all"
              />
            </div>

            {/* Selector de Categorías (Scroll Horizontal en móvil) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none animate-reveal delay-400">
              <Filter size={16} className="text-neutral-400 hidden sm:inline" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                    selectedCategory === cat
                      ? 'bg-[#1a1a1a] text-white shadow-md shadow-black/5'
                      : 'bg-white border border-[#e5e5e5] text-neutral-600 hover:text-[#1a1a1a] hover:bg-[#fafafa]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Alternar Vista */}
            <div className="hidden md:flex items-center gap-1.5 p-1 bg-white border border-[#e5e5e5] rounded-xl animate-reveal delay-500">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#fafafa] text-[#1a1a1a]' : 'text-neutral-400'}`}
              >
                <Grid size={16} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#fafafa] text-[#1a1a1a]' : 'text-neutral-400'}`}
              >
                <List size={16} />
              </button>
            </div>

          </section>

          {/* 5. Cuadrícula / Lista de Productos */}
          <main className="max-w-7xl mx-auto px-6 py-12">
            
            {filteredProducts.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-neutral-500 text-lg">No se encontraron productos en esta categoría.</p>
              </div>
            ) : viewMode === 'grid' ? (
              
              /* Vista Grid con Tarjetas Tilt3D e interacción premium */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product, idx) => (
                  <div 
                    key={product.id} 
                    className="animate-reveal"
                    style={{ animationDelay: `${(idx % 3) * 150 + 200}ms` }}
                  >
                    <Tilt3D maxTilt={10} scale={1.015} className="bg-white rounded-3xl border border-[#e5e5e5] h-full flex flex-col group/card shadow-sm hover:shadow-xl transition-shadow duration-500 overflow-hidden">
                      
                      {/* Imagen con Hover Zoom */}
                      <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-100 relative">
                        <img
                          src={product.imagen_url || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600'}
                          alt={product.nombre}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
                          loading="lazy"
                        />
                        <span className="absolute top-4 left-4 px-2.5 py-1 bg-white/90 backdrop-blur-md text-[10px] font-bold text-[#1a1a1a] rounded-lg border border-[#e5e5e5]/50 shadow-xs uppercase tracking-wider">
                          {product.categoria}
                        </span>
                      </div>

                      {/* Detalles del Producto */}
                      <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                        <div className="space-y-2">
                          <h3 className="font-serif text-xl font-semibold text-[#1a1a1a] leading-snug group-hover/card:text-[#1a1a1a]/85 transition-colors">
                            {product.nombre}
                          </h3>
                          <p className="text-neutral-500 text-xs font-light line-clamp-2 leading-relaxed">
                            {product.descripcion}
                          </p>
                        </div>

                        {/* Fila de Precio & Botón Agregar */}
                        <div className="flex items-center justify-between border-t border-[#e5e5e5]/60 pt-4">
                          <span className="font-serif text-lg font-bold text-[#1a1a1a]">
                            ${product.precio.toFixed(2)}
                          </span>
                          <button
                            onClick={() => addToCart(product)}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1a1a1a] text-white hover:bg-black active:scale-95 text-xs font-semibold rounded-xl transition-all duration-200 group/btn shadow-md hover:shadow-lg shadow-black/5"
                          >
                            Añadir
                            <ArrowUpRight size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                          </button>
                        </div>
                      </div>

                    </Tilt3D>
                  </div>
                ))}
              </div>

            ) : (

              /* Vista de Lista */
              <div className="space-y-4">
                {filteredProducts.map((product, idx) => (
                  <div 
                    key={product.id}
                    className="bg-white rounded-2xl border border-[#e5e5e5] p-5 flex flex-col sm:flex-row items-center gap-6 hover:shadow-md transition-shadow animate-reveal"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="w-full sm:w-32 h-24 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                      <img 
                        src={product.imagen_url || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600'} 
                        alt={product.nombre} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1 text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{product.categoria}</span>
                        <span className="hidden sm:inline text-neutral-300">•</span>
                        <h3 className="font-serif text-lg font-bold text-[#1a1a1a] truncate">{product.nombre}</h3>
                      </div>
                      <p className="text-neutral-500 text-xs font-light line-clamp-2 leading-relaxed">{product.descripcion}</p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0">
                      <span className="font-serif text-lg font-bold text-[#1a1a1a]">${product.precio.toFixed(2)}</span>
                      <button
                        onClick={() => addToCart(product)}
                        className="px-4 py-2.5 bg-[#1a1a1a] text-white hover:bg-black active:scale-95 text-xs font-semibold rounded-xl transition-all"
                      >
                        Añadir al Carrito
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            )}

          </main>

          {/* 6. Cajón Flotante del Carrito (Drawer Lateral Animado) */}
          {isCartOpen && (
            <div className="fixed inset-0 z-50 overflow-hidden">
              <div 
                onClick={() => setIsCartOpen(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
              />

              <div className="absolute inset-y-0 right-0 max-w-full flex">
                <div className="w-screen max-w-md bg-white border-l border-[#e5e5e5] shadow-2xl flex flex-col justify-between animate-reveal h-full">
                  
                  {/* Cabecera del Carrito */}
                  <div className="px-6 py-6 border-b border-[#e5e5e5] flex items-center justify-between bg-[#fafafa]">
                    <div className="flex items-center gap-3">
                      <ShoppingCart size={20} className="text-[#1a1a1a]" />
                      <h2 className="font-serif text-xl font-bold text-[#1a1a1a]">Tu Carrito</h2>
                      <span className="px-2 py-0.5 bg-[#1a1a1a]/5 text-[#1a1a1a] text-[10px] font-bold rounded-md">
                        {totalCartItems}
                      </span>
                    </div>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="px-3 py-1.5 rounded-xl border border-[#e5e5e5] hover:bg-[#fafafa] text-xs font-medium transition-all"
                    >
                      Cerrar
                    </button>
                  </div>

                  {/* Listado de Productos en Carrito */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {cart.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
                        <ShoppingCart size={40} className="text-neutral-300 animate-bounce" />
                        <p className="text-neutral-500 text-sm">Tu carrito está vacío.</p>
                        <button 
                          onClick={() => setIsCartOpen(false)}
                          className="text-xs font-bold text-[#1a1a1a] underline underline-offset-4"
                        >
                          Explorar productos
                        </button>
                      </div>
                    ) : (
                      cart.map((item) => (
                        <div key={item.id} className="flex gap-4 p-3 bg-[#fafafa] rounded-xl border border-[#e5e5e5]/50 animate-reveal">
                          <img 
                            src={item.imagen_url || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600'} 
                            alt={item.nombre} 
                            className="w-16 h-16 object-cover rounded-lg bg-neutral-100 shrink-0"
                          />
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <h4 className="text-sm font-semibold text-[#1a1a1a] truncate">{item.nombre}</h4>
                              <p className="text-neutral-500 text-xs font-bold font-mono mt-0.5">${item.precio.toFixed(2)}</p>
                            </div>
                            
                            {/* Selector de cantidad */}
                            <div className="flex items-center gap-2 mt-2">
                              <button 
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-6 h-6 rounded-md border border-[#e5e5e5] hover:bg-white flex items-center justify-center text-xs font-bold active:scale-90 transition-all"
                              >
                                -
                              </button>
                              <span className="text-xs font-bold font-mono w-6 text-center">{item.cantidad}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-6 h-6 rounded-md border border-[#e5e5e5] hover:bg-white flex items-center justify-center text-xs font-bold active:scale-90 transition-all"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-neutral-400 hover:text-red-500 transition-colors text-xs font-semibold self-start"
                          >
                            Quitar
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Resumen & Botón Pedido WhatsApp */}
                  {cart.length > 0 && (
                    <div className="p-6 border-t border-[#e5e5e5] bg-[#fafafa] space-y-4">
                      <div className="flex justify-between items-baseline">
                        <span className="text-neutral-500 text-sm">Total Estimado</span>
                        <span className="font-serif text-2xl font-bold text-[#1a1a1a]">${totalCartPrice.toFixed(2)}</span>
                      </div>
                      
                      <button
                        onClick={sendWhatsAppOrder}
                        className="w-full py-3.5 bg-emerald-600 text-white rounded-2xl text-sm font-semibold hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20"
                      >
                        <MessageSquare size={16} />
                        Enviar Pedido a WhatsApp
                      </button>
                      
                      <p className="text-[10px] text-neutral-500 text-center leading-relaxed">
                        Redirigirá a WhatsApp con la lista de tus productos seleccionados para acordar la compra con el negocio.
                      </p>
                    </div>
                  )}

                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
