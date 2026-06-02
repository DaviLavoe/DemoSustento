import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingCart, Search, Filter, MessageSquare, ArrowUpRight, Grid, List, User, ArrowLeft, Loader2, Sparkles, Send } from 'lucide-react';
import useSmoothScroll from '../hooks/useSmoothScroll';
import PantallaCargaPublica from '../components/ui/PantallaCargaPublica';
import Tilt3D from '../components/ui/Tilt3D';
import { useClienteAuth } from '../hooks/useClienteAuth';
import DrawerCuentaCliente from '../components/catalogo/DrawerCuentaCliente';
import { supabase } from '../config/supabase';

export default function CatalogoPublico() {
  const { slug } = useParams();
  // Bug fix: track animation and data separately so we never show empty content
  const [animationDone, setAnimationDone] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const loading = !animationDone || !dataReady;

  const [company, setCompany] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [categories, setCategories] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Portal de Clientes
  const clienteAuth = useClienteAuth();
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  // Lógica del Checkout
  const [isCheckoutMode, setIsCheckoutMode] = useState(false);
  const [checkoutNombre, setCheckoutNombre] = useState('');
  const [checkoutTelefono, setCheckoutTelefono] = useState('');
  const [checkoutDireccion, setCheckoutDireccion] = useState('');
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  // Pre-rellenar campos de checkout si el cliente tiene sesión
  useEffect(() => {
    if (clienteAuth.cliente) {
      setCheckoutNombre(clienteAuth.cliente.nombre || '');
      setCheckoutTelefono(clienteAuth.cliente.telefono || '');
      setCheckoutDireccion(clienteAuth.cliente.direccion || '');
    } else {
      setCheckoutNombre('');
      setCheckoutTelefono('');
      setCheckoutDireccion('');
    }
  }, [clienteAuth.cliente, isCartOpen]);

  // Bloquear scroll de la página principal cuando algún drawer esté abierto
  useEffect(() => {
    if (isCartOpen || isAccountOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen, isAccountOpen]);

  // Activar scroll suave con Lenis una vez que termine la carga de datos
  useSmoothScroll(!loading);

  useEffect(() => {
    async function fetchCatalogData() {
      try {
        const response = await fetch(`http://localhost:3000/api/catalogo/${slug}`, {
          signal: AbortSignal.timeout(8000)
        });

        if (response.ok) {
          const resData = await response.json();
          if (resData.success && resData.empresa) {
            setCompany(resData.empresa);
            const productsData = resData.productos || [];
            setProducts(productsData);
            setFilteredProducts(productsData);
            const uniqueCategories = ['Todas', ...new Set(productsData.map(p => p.categoria).filter(Boolean))];
            setCategories(uniqueCategories);
          } else {
            // Empresa no encontrada en la BD
            setNotFound(true);
          }
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('Error al cargar datos del catálogo:', err);
        setNotFound(true);
      } finally {
        setDataReady(true);
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
        // Evitar agregar más de lo disponible en stock
        if (exists.cantidad >= product.stock) {
          return prev;
        }
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
        // Evitar que la cantidad en el carrito supere el stock disponible del producto
        if (amount > 0 && newQty > item.stock) {
          return item;
        }
        return newQty > 0 ? { ...item, cantidad: newQty } : item;
      }
      return item;
    }));
  };

  // Confirmar pedido (Checkout) y enviar a API + WhatsApp
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!checkoutNombre || !checkoutTelefono) {
      setCheckoutError('El nombre y el teléfono móvil son requeridos.');
      return;
    }
    setCheckoutSubmitting(true);
    setCheckoutError(null);

    try {
      // 1. Preparar payload para la API
      const payload = {
        nombre_cliente: checkoutNombre,
        telefono_cliente: checkoutTelefono,
        total: totalCartPrice,
        empresa_id: company.id,
        productos: cart.map(item => ({
          producto_id: item.id,
          cantidad: item.cantidad,
          precio_unitario: item.precio
        }))
      };

      // 2. Comprobar sesión de cliente para enviar el token JWT
      const { data: { session } } = await supabase.auth.getSession();
      const headers = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      // 3. Registrar el pedido en el Backend de Angelo
      const res = await fetch('http://localhost:3000/api/pedidos', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || 'Error al registrar el pedido en el servidor');
      }

      const pedidoGuardado = resData.data?.pedido;

      // 4. Registrar localmente en el historial si está logueado
      if (clienteAuth.cliente) {
        clienteAuth.registrarPedido(cart, totalCartPrice);
      }

      // 5. Redireccionar a WhatsApp dinámicamente con mensaje detallado
      let message = `*Nuevo pedido de ${company.nombre}*\n`;
      if (pedidoGuardado?.id) {
        message += `*Pedido ID:* ${pedidoGuardado.id.substring(0, 8).toUpperCase()}\n`;
      }
      message += `----------------------------------------\n\n`;

      cart.forEach(item => {
        const itemPrecio = Number(item.precio);
        const subtotal = itemPrecio * item.cantidad;
        message += `• ${item.cantidad}x *${item.nombre}* - $${itemPrecio.toFixed(2)} (Subtotal: $${subtotal.toFixed(2)})\n`;
      });

      message += `\n*Total a pagar: $${totalCartPrice.toFixed(2)}*\n\n`;
      message += `*Datos de Entrega:*\n`;
      message += `👤 Cliente: ${checkoutNombre}\n`;
      message += `📞 Teléfono: ${checkoutTelefono}\n`;
      if (checkoutDireccion) {
        message += `📍 Dirección: ${checkoutDireccion}\n`;
      }
      message += `\n_Por favor, confírmame disponibilidad y método de pago._`;

      const encodedText = encodeURIComponent(message);
      const phoneNumber = company.telefono_whatsapp || '51999999999';

      // 6. Resetear carrito y cerrar cajones
      setCart([]);
      setIsCartOpen(false);
      setIsCheckoutMode(false);

      // Abrir enlace de WhatsApp
      window.open(`https://wa.me/${phoneNumber}?text=${encodedText}`, '_blank');
    } catch (err) {
      console.error('Error al completar pedido en API:', err);
      setCheckoutError(err.message || 'Error interno al registrar el pedido en el servidor.');
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  // Reordenar productos desde el historial de pedidos de Mi Cuenta
  const handleReorder = (orderProducts) => {
    setCart(prev => {
      let updatedCart = [...prev];
      orderProducts.forEach(prod => {
        const originalProduct = products.find(p => p.nombre.toLowerCase() === prod.nombre.toLowerCase());
        if (originalProduct) {
          const exists = updatedCart.find(item => item.id === originalProduct.id);
          if (exists) {
            updatedCart = updatedCart.map(item => 
              item.id === originalProduct.id 
                ? { ...item, cantidad: item.cantidad + prod.cantidad } 
                : item
            );
          } else {
            updatedCart.push({ ...originalProduct, cantidad: prod.cantidad });
          }
        }
      });
      return updatedCart;
    });
    setIsAccountOpen(false);
    setIsCartOpen(true);
  };

  const totalCartPrice = cart.reduce((acc, item) => acc + (Number(item.precio) * item.cantidad), 0);
  const totalCartItems = cart.reduce((acc, item) => acc + item.cantidad, 0);
  const primaryColor = company?.color_primario || '#1a1a1a';

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a1a] font-sans">
      
      {/* 1. Loader Interactivo Premium */}
      <PantallaCargaPublica 
        nombreTienda="Catálogo"
        onComplete={() => setAnimationDone(true)} 
      />

      {/* Pantalla de "Tienda no encontrada" */}
      {!loading && notFound && (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a]/5 border border-[#e5e5e5] flex items-center justify-center text-4xl">
            🔍
          </div>
          <div className="space-y-2">
            <h1 className="font-serif text-3xl font-bold text-[#1a1a1a]">Tienda no encontrada</h1>
            <p className="text-neutral-500 text-sm max-w-sm leading-relaxed">
              No existe ninguna tienda con el enlace <span className="font-mono bg-[#fafafa] border border-[#e5e5e5] px-2 py-0.5 rounded-md text-xs">{slug}</span>. Verifica que el enlace sea correcto.
            </p>
          </div>
        </div>
      )}

      {/* Solo renderizar el catálogo cuando carguen los datos correctamente */}
      {!loading && !notFound && (
        <>
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

              <div className="flex items-center gap-3">
                {/* Botón Mi Cuenta */}
                <button 
                  onClick={() => setIsAccountOpen(true)}
                  className={`relative p-2.5 rounded-xl bg-white border border-[#e5e5e5] hover:bg-[#fafafa] active:scale-95 transition-all duration-200 shadow-sm flex items-center gap-2 group ${
                    clienteAuth.cliente ? 'border-black bg-neutral-50' : ''
                  }`}
                >
                  <User size={18} className={clienteAuth.cliente ? 'text-black' : 'text-neutral-500'} />
                  <span className="text-xs font-semibold font-mono hidden sm:inline">
                    {clienteAuth.cliente ? 'Mi Cuenta' : 'Ingresar'}
                  </span>
                </button>

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

            </div>
          </nav>

          {/* 3. Header de la Tienda (Hero) */}
          <header className="max-w-7xl mx-auto px-6 py-12 sm:py-24 flex flex-col items-start gap-6 border-b border-[#e5e5e5]">
            <span className="px-3.5 py-1 bg-[#1a1a1a]/5 text-[#1a1a1a] text-[10px] font-semibold tracking-widest uppercase rounded-full animate-reveal">
              Catálogo de Exposición
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#1a1a1a] max-w-3xl leading-[1.05] animate-reveal delay-100">
              {company?.nombre}
            </h1>
            <p className="text-neutral-500 text-base sm:text-xl font-light max-w-2xl leading-relaxed animate-reveal delay-200">
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
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none animate-reveal delay-400 w-full md:w-auto">
              <Filter size={16} className="text-neutral-400 hidden sm:inline" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                    selectedCategory === cat
                      ? 'text-white shadow-md shadow-black/5'
                      : 'bg-white border border-[#e5e5e5] text-neutral-600 hover:text-[#1a1a1a] hover:bg-[#fafafa]'
                  }`}
                  style={selectedCategory === cat ? { backgroundColor: primaryColor } : {}}
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
                        {product.stock <= 0 && (
                          <span className="absolute top-4 right-4 px-2.5 py-1 bg-red-600/90 text-white text-[10px] font-bold rounded-lg border border-red-500/50 shadow-sm uppercase tracking-wider">
                            Sin Stock
                          </span>
                        )}
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
                            disabled={product.stock <= 0}
                            onClick={() => addToCart(product)}
                            className={`flex items-center gap-1.5 px-4 py-2.5 text-white text-xs font-semibold rounded-xl transition-all duration-200 group/btn shadow-md shadow-black/5 filter hover:brightness-95 ${
                              product.stock <= 0 ? 'bg-neutral-300 border-neutral-300 cursor-not-allowed opacity-50 active:scale-100' : 'active:scale-95'
                            }`}
                            style={product.stock > 0 ? { backgroundColor: primaryColor } : {}}
                          >
                            <span>{product.stock <= 0 ? 'Agotado' : 'Añadir'}</span>
                            {product.stock > 0 && <ArrowUpRight size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />}
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
                    <div className="w-full sm:w-32 h-24 rounded-xl overflow-hidden bg-neutral-100 shrink-0 relative">
                      <img 
                        src={product.imagen_url || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600'} 
                        alt={product.nombre} 
                        className="w-full h-full object-cover"
                      />
                      {product.stock <= 0 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-red-600 px-1.5 py-0.5 rounded">Agotado</span>
                        </div>
                      )}
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
                        disabled={product.stock <= 0}
                        onClick={() => addToCart(product)}
                        className={`px-4 py-2.5 text-white text-xs font-semibold rounded-xl transition-all filter hover:brightness-95 ${
                          product.stock <= 0 ? 'bg-neutral-300 cursor-not-allowed opacity-50 active:scale-100' : 'active:scale-95'
                        }`}
                        style={product.stock > 0 ? { backgroundColor: primaryColor } : {}}
                      >
                        <span>{product.stock <= 0 ? 'Agotado' : 'Añadir al Carrito'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </main>
        </div>

          {/* 6. Cajón Flotante del Carrito (Drawer Lateral Animado) */}
          {isCartOpen && (
            <div className="fixed inset-0 z-[100] overflow-hidden">
              <div 
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutMode(false);
                  setCheckoutError(null);
                }}
                className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
              />

              <div className="absolute inset-y-0 right-0 max-w-full flex">
                <div className="w-screen max-w-md bg-white border-l border-[#e5e5e5] shadow-2xl flex flex-col justify-between animate-reveal h-full">
                  
                  {/* Cabecera del Carrito / Checkout */}
                  <div className="px-6 py-6 border-b border-[#e5e5e5] flex items-center justify-between bg-[#fafafa]">
                    <div className="flex items-center">
                      {isCheckoutMode ? (
                        <button 
                          key="back-to-cart-btn"
                          onClick={() => {
                            setIsCheckoutMode(false);
                            setCheckoutError(null);
                          }}
                          className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-black font-semibold transition-colors"
                        >
                          <ArrowLeft size={16} />
                          <span>Volver al Carrito</span>
                        </button>
                      ) : (
                        <div key="cart-header-title" className="flex items-center gap-3">
                          <ShoppingCart size={20} className="text-[#1a1a1a]" />
                          <h2 className="font-serif text-xl font-bold text-[#1a1a1a]">Tu Carrito</h2>
                          <span className="px-2 py-0.5 bg-[#1a1a1a]/5 text-[#1a1a1a] text-[10px] font-bold rounded-md">
                            {totalCartItems}
                          </span>
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => {
                        setIsCartOpen(false);
                        setIsCheckoutMode(false);
                        setCheckoutError(null);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-[#e5e5e5] hover:bg-[#fafafa] text-xs font-medium transition-all"
                    >
                      <span>Cerrar</span>
                    </button>
                  </div>

                  {/* Cuerpo del Drawer: Listado de Productos o Formulario de Checkout */}
                  <div data-lenis-prevent className="flex-1 overflow-y-auto p-6 scrollbar-none space-y-4">
                    {isCheckoutMode ? (
                      /* ================== FLUJO DE CHECKOUT ================== */
                      <form key="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-5 animate-reveal">
                        <div>
                          <h3 className="font-serif text-lg font-bold text-[#1a1a1a]">Datos del Destinatario</h3>
                          <p className="text-xs text-neutral-400 font-light mt-0.5">Ingresa los datos para registrar tu pedido y enviarlo por WhatsApp.</p>
                        </div>

                        {/* Alerta de Error en Checkout */}
                        {checkoutError && (
                          <div className="p-3.5 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl text-center">
                            {checkoutError}
                          </div>
                        )}

                        <div className="space-y-3.5">
                          {/* Campo Nombre */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-[#1a1a1a]">Nombre Completo *</label>
                            <input
                              type="text"
                              required
                              value={checkoutNombre}
                              onChange={(e) => setCheckoutNombre(e.target.value)}
                              placeholder="Ej. Juan Pérez"
                              className="w-full px-4 py-3 bg-[#fafafa] border border-transparent rounded-xl text-base md:text-sm text-[#1a1a1a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all hover:border-[#e5e5e5]"
                            />
                          </div>

                          {/* Campo Teléfono */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-[#1a1a1a]">Teléfono Móvil *</label>
                            <input
                              type="tel"
                              required
                              value={checkoutTelefono}
                              onChange={(e) => setCheckoutTelefono(e.target.value)}
                              placeholder="Ej. +51 999 999 999"
                              className="w-full px-4 py-3 bg-[#fafafa] border border-transparent rounded-xl text-base md:text-sm text-[#1a1a1a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all hover:border-[#e5e5e5]"
                            />
                          </div>

                          {/* Campo Dirección */}
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-baseline">
                              <label className="text-xs font-semibold text-[#1a1a1a]">Dirección de Entrega</label>
                              <span className="text-[10px] text-neutral-400">Opcional</span>
                            </div>
                            <textarea
                              rows="3"
                              value={checkoutDireccion}
                              onChange={(e) => setCheckoutDireccion(e.target.value)}
                              placeholder="Calle, Edificio, Referencias de entrega..."
                              className="w-full px-4 py-3 bg-[#fafafa] border border-transparent rounded-xl text-base md:text-sm text-[#1a1a1a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all hover:border-[#e5e5e5] resize-none"
                            />
                          </div>
                        </div>

                        {/* Resumen Compacto de Artículos */}
                        <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-2.5">
                          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Resumen de Artículos</p>
                          <div className="max-h-28 overflow-y-auto space-y-1.5 text-xs text-neutral-600">
                            {cart.map((item) => (
                              <div key={item.id} className="flex justify-between">
                                <span>{item.cantidad}x {item.nombre}</span>
                                <span className="font-mono text-neutral-400">${(Number(item.precio) * item.cantidad).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </form>
                    ) : (
                      /* ================== LISTA DEL CARRITO ================== */
                      <div key="cart-items-list" className="space-y-4">
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
                                  <p className="text-neutral-500 text-xs font-bold font-mono mt-0.5">${Number(item.precio).toFixed(2)}</p>
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
                    )}
                  </div>

                  {/* Resumen, Totales y Botones */}
                  {cart.length > 0 && (
                    <div className="p-6 border-t border-[#e5e5e5] bg-[#fafafa] space-y-4">
                      <div className="flex justify-between items-baseline">
                        <span className="text-neutral-500 text-sm"><span>Total Estimado</span></span>
                        <span className="font-serif text-2xl font-bold text-[#1a1a1a]"><span>$</span>{totalCartPrice.toFixed(2)}</span>
                      </div>
                      
                      <div className="space-y-4">
                        {isCheckoutMode ? (
                          <button
                            key="confirm-order-btn"
                            onClick={handleCheckoutSubmit}
                            disabled={checkoutSubmitting}
                            className="w-full py-3.5 bg-emerald-600 text-white rounded-2xl text-sm font-semibold hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 disabled:opacity-75 disabled:cursor-not-allowed"
                          >
                            {checkoutSubmitting ? (
                              <span className="flex items-center justify-center gap-2">
                                <Loader2 size={16} className="animate-spin" />
                                <span>Registrando pedido...</span>
                              </span>
                            ) : (
                              <span className="flex items-center justify-center gap-2">
                                <Send size={16} />
                                <span>Confirmar y Enviar Pedido</span>
                              </span>
                            )}
                          </button>
                        ) : (
                          <button
                            key="proceed-checkout-btn"
                            onClick={() => setIsCheckoutMode(true)}
                            className="w-full py-3.5 text-white rounded-2xl text-sm font-semibold filter hover:brightness-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/5"
                            style={{ backgroundColor: primaryColor }}
                          >
                            <Sparkles size={16} />
                            <span>Proceder al Checkout</span>
                          </button>
                        )}
                        
                        {isCheckoutMode ? (
                          <p key="checkout-desc" className="text-[10px] text-neutral-500 text-center leading-relaxed">
                            <span>Al confirmar, tu pedido será registrado de forma segura y se abrirá WhatsApp con los detalles.</span>
                          </p>
                        ) : (
                          <p key="cart-desc" className="text-[10px] text-neutral-500 text-center leading-relaxed">
                            <span>Continúa al checkout para ingresar tus datos y confirmar el pedido.</span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          )}

          {/* 7. Drawer de Cuenta del Cliente (Login / Registro / Mi Cuenta) */}
          <DrawerCuentaCliente
            isOpen={isAccountOpen}
            onClose={() => setIsAccountOpen(false)}
            clienteAuth={clienteAuth}
            onReorder={handleReorder}
          />

        </>
      )}

    </div>
  );
}
