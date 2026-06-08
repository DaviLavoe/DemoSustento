import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useSmoothScroll from '../hooks/useSmoothScroll';
import { useCart } from '../hooks/useCart';
import { getSupabaseClienteForSlug } from '../config/supabaseEmpresa';
import { API_BASE_URL } from '../config/api';

import PantallaCargaPublica from '../components/ui/PantallaCargaPublica';
import DrawerCuentaCliente from '../components/catalogo/DrawerCuentaCliente';
import PortalCliente from '../components/catalogo/PortalCliente';

import CatalogHeader from '../components/catalogo/CatalogHeader';
import CatalogFooter from '../components/catalogo/CatalogFooter';
import ProductCard from '../components/catalogo/ProductCard';
import CartDrawer from '../components/catalogo/CartDrawer';

// Skeleton Component
function ProductSkeleton({ viewMode }) {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-2xl border border-[#e5e5e5] p-5 flex flex-col sm:flex-row items-center gap-6 animate-pulse">
        <div className="w-full sm:w-32 h-24 rounded-xl bg-neutral-200 shrink-0"></div>
        <div className="flex-1 space-y-3 w-full">
          <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
          <div className="h-6 bg-neutral-200 rounded w-3/4"></div>
          <div className="h-3 bg-neutral-200 rounded w-full"></div>
        </div>
        <div className="w-full sm:w-24 h-10 bg-neutral-200 rounded-xl shrink-0"></div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-[24px] border border-[#e5e5e5] h-[360px] flex flex-col animate-pulse">
      <div className="aspect-[4/3] w-full bg-neutral-200 rounded-t-[24px]"></div>
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="h-6 bg-neutral-200 rounded w-3/4"></div>
          <div className="h-4 bg-neutral-200 rounded w-full"></div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
          <div className="h-10 bg-neutral-200 rounded-xl w-24"></div>
        </div>
      </div>
    </div>
  );
}

const formatSlugToName = (slug) => {
  if (!slug) return 'Catálogo';
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function CatalogoPublico() {
  const { slug } = useParams();
  const supabase = getSupabaseClienteForSlug(slug);
  
  // Referencia directa al DOM para máximo rendimiento (evita re-renderizados que causan lag)
  const glowRef = React.useRef(null);

  useEffect(() => {
    let animationFrameId;
    
    const handleMouseMove = (e) => {
      // Usamos requestAnimationFrame y translate3d para fluidez a 60fps (Aceleración por Hardware)
      if (glowRef.current) {
        animationFrameId = requestAnimationFrame(() => {
          if (glowRef.current) {
            glowRef.current.style.transform = `translate3d(${e.clientX - 300}px, ${e.clientY - 300}px, 0)`;
          }
        });
      }
    };
    
    // Centrar inicialmente si estamos en PC
    if (typeof window !== 'undefined' && glowRef.current) {
      glowRef.current.style.transform = `translate3d(${window.innerWidth / 2 - 300}px, ${window.innerHeight / 2 - 300}px, 0)`;
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

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
  const [viewMode, setViewMode] = useState('list');
  
  const [wishlist, setWishlist] = useState([]);

  // Portal Clientes
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isPortalOpen, setIsPortalOpen] = useState(false);

  // Cart Hook
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalCartPrice,
    totalCartItems,
    clienteAuth,
    handleReorder
  } = useCart();

  // Checkout State
  const [isCheckoutMode, setIsCheckoutMode] = useState(false);
  const [checkoutNombre, setCheckoutNombre] = useState('');
  const [checkoutTelefono, setCheckoutTelefono] = useState('');
  const [checkoutDireccion, setCheckoutDireccion] = useState('');
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [metodoPago, setMetodoPago] = useState('whatsapp');
  const [pedidoCompletado, setPedidoCompletado] = useState(null);
  const [portalInitialTab, setPortalInitialTab] = useState('inicio');

  const handleCloseReceipt = () => {
    setPedidoCompletado(null);
    setIsCartOpen(false);
    setIsCheckoutMode(false);
    setMetodoPago('whatsapp');
  };

  const handleOpenPortalFromCheckout = (tab = 'credito') => {
    setPortalInitialTab(tab);
    setIsPortalOpen(true);
    setIsCartOpen(false);
  };

  const handleOpenLoginFromCheckout = () => {
    setIsAccountOpen(true);
    setIsCartOpen(false);
  };

  // Load wishlist
  useEffect(() => {
    if (slug) {
      const stored = localStorage.getItem(`wishlist_${slug}`);
      if (stored) {
        try { setWishlist(JSON.parse(stored)); } catch (e) { console.error(e); }
      }
    }
  }, [slug]);

  const toggleWishlist = (product) => {
    const exists = wishlist.some(item => item.id === product.id);
    const newWishlist = exists ? wishlist.filter(item => item.id !== product.id) : [...wishlist, product];
    setWishlist(newWishlist);
    localStorage.setItem(`wishlist_${slug}`, JSON.stringify(newWishlist));
  };

  const isInWishlist = (id) => wishlist.some(item => item.id === id);

  // Pre-fill checkout
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

  // Bloquear scroll global al abrir modales
  useEffect(() => {
    if (isCartOpen || isAccountOpen || isPortalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isCartOpen, isAccountOpen, isPortalOpen]);

  useSmoothScroll(!loading);

  // Fetch Data
  useEffect(() => {
    async function fetchCatalogData() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/catalogo/${slug}`, {
          signal: AbortSignal.timeout(8000)
        });
        if (response.ok) {
          const resData = await response.json();
          if (resData.success && resData.empresa) {
            setCompany(resData.empresa);
            const productsData = resData.productos || [];
            setProducts(productsData);
            setFilteredProducts(productsData);
            setCategories(['Todas', ...new Set(productsData.map(p => p.categoria).filter(Boolean))]);
          } else {
            setNotFound(true);
          }
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error(err);
        setNotFound(true);
      } finally {
        setDataReady(true);
      }
    }
    fetchCatalogData();
  }, [slug]);

  // Filters
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

  // Checkout Handler
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!checkoutNombre || !checkoutTelefono) {
      setCheckoutError('El nombre y el teléfono móvil son requeridos.');
      return;
    }
    setCheckoutSubmitting(true);
    setCheckoutError(null);

    try {
      const payload = {
        nombre_cliente: checkoutNombre,
        telefono_cliente: checkoutTelefono,
        total: totalCartPrice,
        empresa_id: company.id,
        productos: cart.map(item => ({
          producto_id: item.id,
          cantidad: item.cantidad,
          precio_unitario: item.precio
        })),
        metodo_pago: metodoPago
      };

      const { data: { session } } = await supabase.auth.getSession();
      const headers = { 'Content-Type': 'application/json' };
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;

      const res = await fetch(`${API_BASE_URL}/api/pedidos`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || 'Error al registrar pedido');

      const pedidoGuardado = resData.data?.pedido;
      
      if (clienteAuth.cliente) {
        await clienteAuth.registrarPedido(
          cart, 
          totalCartPrice, 
          resData.data?.saldo, 
          resData.data?.puntos
        );
      }

      if (metodoPago === 'credito') {
        setPedidoCompletado(pedidoGuardado);
        clearCart();
      } else {
        let message = `*Nuevo pedido de ${company.nombre}*\n`;
        if (pedidoGuardado?.id) message += `*Pedido ID:* ${pedidoGuardado.id.substring(0, 8).toUpperCase()}\n`;
        message += `----------------------------------------\n\n`;

        cart.forEach(item => {
          const subtotal = Number(item.precio) * item.cantidad;
          message += `• ${item.cantidad}x *${item.nombre}* - $${Number(item.precio).toFixed(2)} (Subtotal: $${subtotal.toFixed(2)})\n`;
        });

        message += `\n*Total a pagar: $${totalCartPrice.toFixed(2)}*\n\n`;
        message += `*Datos de Entrega:*\n👤 Cliente: ${checkoutNombre}\n📞 Teléfono: ${checkoutTelefono}\n`;
        if (checkoutDireccion) message += `📍 Dirección: ${checkoutDireccion}\n`;
        message += `\n_Por favor, confírmame disponibilidad y método de pago._`;

        const encodedText = encodeURIComponent(message);
        const phoneNumber = company.telefono_whatsapp || '51999999999';

        clearCart();
        setIsCartOpen(false);
        setIsCheckoutMode(false);
        window.open(`https://wa.me/${phoneNumber}?text=${encodedText}`, '_blank');
      }
    } catch (err) {
      console.error(err);
      setCheckoutError(err.message || 'Error interno');
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  const primaryColor = company?.color_primario || '#1a1a1a';

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-[#1a1a1a] dark:text-white font-sans selection:bg-[#1a1a1a] dark:selection:bg-white selection:text-white dark:selection:text-black pb-24 md:pb-0 transition-colors duration-300 relative">
      
      {/* Resplandor Global que sigue al cursor en TODA la página (Acelerado por GPU) */}
      <div 
        ref={glowRef}
        className="fixed pointer-events-none z-0 w-[600px] h-[600px] rounded-full blur-[120px] opacity-40 dark:opacity-20 will-change-transform"
        style={{ 
          backgroundColor: primaryColor !== '#1a1a1a' ? primaryColor : '#e5e5e5',
          left: 0,
          top: 0
        }}
      ></div>

      <PantallaCargaPublica 
        nombreTienda={company?.nombre || formatSlugToName(slug)} 
        logoUrl={company?.logo_url} 
        onComplete={() => setAnimationDone(true)} 
      />

      {!loading && notFound && (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center animate-reveal">
          <div className="w-20 h-20 rounded-3xl bg-white dark:bg-neutral-800 border border-[#e5e5e5] dark:border-neutral-700 flex items-center justify-center text-4xl shadow-xl shadow-black/5">🔍</div>
          <div className="space-y-3">
            <p className="text-neutral-500 text-base max-w-sm mx-auto leading-relaxed">No existe ninguna tienda con el enlace <span className="font-mono bg-white border border-[#e5e5e5] px-2 py-0.5 rounded-md text-xs shadow-sm">{slug}</span>.</p>
          </div>
        </div>
      )}

      {!notFound && (
        <div className={`transition-opacity duration-1000 ${animationDone ? 'opacity-100' : 'opacity-0'}`}>
          <CatalogHeader 
            company={company}
            clienteAuth={clienteAuth}
            setIsAccountOpen={setIsAccountOpen}
            setIsCartOpen={setIsCartOpen}
            totalCartItems={totalCartItems}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            viewMode={viewMode}
            setViewMode={setViewMode}
            primaryColor={primaryColor}
          />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            
            {/* --- SECCIÓN PRINCIPAL DE PRODUCTOS --- */}
            {dataReady && (searchTerm !== '' || selectedCategory !== 'Todas') && (
              <div className="mb-6 flex items-center justify-between animate-reveal">
                <h2 className="font-serif text-2xl font-bold text-[#1a1a1a] dark:text-white transition-colors">Resultados de búsqueda</h2>
                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full transition-colors">{filteredProducts.length} productos</span>
              </div>
            )}
            
            {!dataReady ? (
              <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-8" : "space-y-4"}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <ProductSkeleton key={i} viewMode={viewMode} />)}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-24 text-center animate-reveal">
                <div className="w-16 h-16 bg-white border border-[#e5e5e5] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm text-2xl">📦</div>
                <p className="text-neutral-500 text-lg font-medium">No se encontraron productos.</p>
              </div>
            ) : (
              <>
                <div className="animate-reveal delay-300 mb-16">
                  {searchTerm === '' && selectedCategory === 'Todas' && (
                    <h2 className="font-serif text-2xl font-bold text-[#1a1a1a] dark:text-white mb-6 border-b border-[#e5e5e5]/60 dark:border-neutral-800 pb-3 transition-colors">
                      Todos los productos
                    </h2>
                  )}
                  <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-8" : "space-y-4"}>
                    {filteredProducts.map((product, idx) => (
                      <ProductCard 
                        key={product.id}
                        product={product}
                        viewMode={viewMode}
                        idx={idx}
                        primaryColor={primaryColor}
                        isInWishlist={isInWishlist}
                        toggleWishlist={toggleWishlist}
                        addToCart={addToCart}
                      />
                    ))}
                  </div>
                </div>

                {/* --- SECCIÓN PRODUCTOS DESTACADOS (Movida abajo) --- */}
                {searchTerm === '' && selectedCategory === 'Todas' && filteredProducts.length > 0 && (
                  <div className="mb-20 animate-reveal delay-500">
                    <div className="bg-[#fafafa] dark:bg-neutral-900 rounded-[32px] p-6 sm:p-10 border border-[#e5e5e5] dark:border-neutral-800 shadow-inner relative overflow-hidden transition-colors">
                      {/* Decoración de fondo */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 dark:bg-yellow-400/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
                      
                      <div className="flex items-center justify-between mb-8 pb-4">
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1a1a1a] dark:text-white flex items-center gap-3 transition-colors">
                          <span className="text-yellow-500">✨</span> Recomendados para ti
                        </h2>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8 relative z-10">
                        {/* Tomamos hasta 4 productos como "destacados" para la demo */}
                        {filteredProducts.slice(0, 4).map((product, idx) => (
                          <ProductCard 
                            key={`destacado-${product.id}`}
                            product={product}
                            viewMode="grid"
                            idx={idx}
                            primaryColor={primaryColor}
                            isInWishlist={isInWishlist}
                            toggleWishlist={toggleWishlist}
                            addToCart={addToCart}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
          
          {/* Pie de Página */}
          {dataReady && <CatalogFooter company={company} primaryColor={primaryColor} />}
        </div>
      )}

      {/* Carrito Sticky para Móvil */}
      {!loading && !notFound && totalCartItems > 0 && (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-[#1a1a1a] text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between active:scale-[0.98] transition-transform"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">
                {totalCartItems}
              </div>
              <span className="font-semibold text-sm">Ver Carrito</span>
            </div>
            <span className="font-serif font-bold text-lg">${totalCartPrice.toFixed(2)}</span>
          </button>
        </div>
      )}

      <CartDrawer 
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        isCheckoutMode={isCheckoutMode}
        setIsCheckoutMode={setIsCheckoutMode}
        cart={cart}
        totalCartItems={totalCartItems}
        totalCartPrice={totalCartPrice}
        removeFromCart={removeFromCart}
        updateQuantity={updateQuantity}
        handleCheckoutSubmit={handleCheckoutSubmit}
        checkoutNombre={checkoutNombre}
        setCheckoutNombre={setCheckoutNombre}
        checkoutTelefono={checkoutTelefono}
        setCheckoutTelefono={setCheckoutTelefono}
        checkoutDireccion={checkoutDireccion}
        setCheckoutDireccion={setCheckoutDireccion}
        checkoutError={checkoutError}
        setCheckoutError={setCheckoutError}
        isSubmitting={checkoutSubmitting}
        primaryColor={primaryColor}
        pedidoCompletado={pedidoCompletado}
        onCloseReceipt={handleCloseReceipt}
        metodoPago={metodoPago}
        setMetodoPago={setMetodoPago}
        clienteAuth={clienteAuth}
        onOpenPortal={() => handleOpenPortalFromCheckout('credito')}
        onOpenLogin={handleOpenLoginFromCheckout}
      />

      <DrawerCuentaCliente
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        clienteAuth={clienteAuth}
        onReorder={(orderProducts) => handleReorder(orderProducts, products)}
        onOpenPortal={() => {
          setIsAccountOpen(false);
          setIsPortalOpen(true);
        }}
      />

      <PortalCliente
        isOpen={isPortalOpen}
        onClose={() => {
          setIsPortalOpen(false);
          setPortalInitialTab('inicio');
        }}
        clienteAuth={clienteAuth}
        onReorder={(orderProducts) => handleReorder(orderProducts, products)}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        onAddToCart={addToCart}
        primaryColor={primaryColor}
        cart={cart}
        removeFromCart={removeFromCart}
        updateQuantity={updateQuantity}
        checkoutNombre={checkoutNombre}
        setCheckoutNombre={setCheckoutNombre}
        checkoutTelefono={checkoutTelefono}
        setCheckoutTelefono={setCheckoutTelefono}
        checkoutDireccion={checkoutDireccion}
        setCheckoutDireccion={setCheckoutDireccion}
        checkoutSubmitting={checkoutSubmitting}
        checkoutError={checkoutError}
        handleCheckoutSubmit={handleCheckoutSubmit}
        totalCartPrice={totalCartPrice}
        empresa={company}
        initialTab={portalInitialTab}
      />
    </div>
  );
}
