import { useState, useEffect } from 'react';
import { 
  X, User, Mail, Phone, MapPin, History, LogOut, Check, ShoppingBag, 
  Heart, CreditCard, Wallet, ChevronDown, ChevronUp, Clock, CheckCircle, 
  MessageSquare, HelpCircle, ArrowLeft, Trash, Plus, Search, Send
} from 'lucide-react';

export default function PortalCliente({
  isOpen,
  onClose,
  clienteAuth,
  onReorder,
  wishlist = [],
  toggleWishlist,
  onAddToCart,
  primaryColor = '#1a1a1a',
  cart = [],
  removeFromCart,
  updateQuantity,
  checkoutNombre,
  setCheckoutNombre,
  checkoutTelefono,
  setCheckoutTelefono,
  checkoutDireccion,
  setCheckoutDireccion,
  checkoutSubmitting,
  checkoutError,
  handleCheckoutSubmit,
  totalCartPrice = 0
}) {
  const { cliente, loading, pedidos, cerrarSesion, actualizarPerfil } = clienteAuth;
  const [activeTab, setActiveTab] = useState('inicio'); // inicio | pedidos | wishlist | perfil | tarjetas | credito
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Formulario Perfil
  const [editNombre, setEditNombre] = useState(cliente?.nombre || '');
  const [editTelefono, setEditTelefono] = useState(cliente?.telefono || '');
  const [editDireccion, setEditDireccion] = useState(cliente?.direccion || '');
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState(null);

  // Estados de Pedidos
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // all | 7days | 30days
  const [statusFilter, setStatusFilter] = useState('all'); // all | pendiente | enviado | completado
  const [expandedPedidoId, setExpandedPedidoId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedPedidoId(prev => prev === id ? null : id);
  };

  // Estados de Tarjetas
  const [cards, setCards] = useState([
    { id: 1, type: 'visa', number: '•••• •••• •••• 4242', holder: cliente?.nombre || 'Cliente', expiry: '12/28', bank: 'Tech Bank' },
    { id: 2, type: 'mastercard', number: '•••• •••• •••• 8888', holder: cliente?.nombre || 'Cliente', expiry: '06/30', bank: 'Global Premium' }
  ]);
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardHolder, setNewCardHolder] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [showAddCard, setShowAddCard] = useState(false);
  const [tiltStyle, setTiltStyle] = useState({});

  // Reset/Sincronizar campos de perfil cuando el cliente cambia
  useEffect(() => {
    if (cliente) {
      setEditNombre(cliente.nombre || '');
      setEditTelefono(cliente.telefono || '');
      setEditDireccion(cliente.direccion || '');
    }
  }, [cliente]);

  if (!isOpen || !cliente) return null;

  // 1. Estadísticas de Compras
  const totalInvertido = pedidos.reduce((acc, p) => acc + p.total, 0);
  const totalPedidos = pedidos.length;
  const totalArticulos = pedidos.reduce((acc, p) => 
    acc + p.productos.reduce((sum, prod) => sum + prod.cantidad, 0), 0
  );

  // Manejo de Perfil
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSubmitting(true);
    setProfileSuccess(false);
    setProfileError(null);
    try {
      await actualizarPerfil({
        nombre: editNombre,
        telefono: editTelefono,
        direccion: editDireccion
      });
      setProfileSuccess(true);
      setIsEditingProfile(false);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError('Error al actualizar la información.');
    } finally {
      setProfileSubmitting(false);
    }
  };

  // Filtrado de Pedidos
  const filteredPedidos = pedidos.filter((pedido) => {
    const matchesSearch = 
      pedido.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.productos.some((p) => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

    let matchesDate = true;
    const fechaPedido = new Date(pedido.fecha);
    const ahora = new Date();
    if (dateFilter === '7days') {
      const sieteDiasAgo = new Date(ahora.setDate(ahora.getDate() - 7));
      matchesDate = fechaPedido >= sieteDiasAgo;
    } else if (dateFilter === '30days') {
      const treintaDiasAgo = new Date(ahora.setDate(ahora.getDate() - 30));
      matchesDate = fechaPedido >= treintaDiasAgo;
    }

    const matchesStatus = 
      statusFilter === 'all' || 
      (pedido.estado || 'pendiente').toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesDate && matchesStatus;
  });

  // Manejo de Tarjetas (Agregar/Eliminar)
  const handleAddCard = (e) => {
    e.preventDefault();
    if (!newCardNumber || !newCardHolder || !newCardExpiry) return;
    const newCard = {
      id: Date.now(),
      type: newCardNumber.startsWith('5') ? 'mastercard' : 'visa',
      number: `•••• •••• •••• ${newCardNumber.slice(-4)}`,
      holder: newCardHolder,
      expiry: newCardExpiry,
      bank: 'Tarjeta Guardada'
    };
    setCards([...cards, newCard]);
    setNewCardNumber('');
    setNewCardHolder('');
    setNewCardExpiry('');
    setShowAddCard(false);
  };

  const handleDeleteCard = (id) => {
    setCards(cards.filter(c => c.id !== id));
  };

  // Efecto 3D Tilt para la Tarjeta de Crédito Principal
  const handleMouseMove = (e) => {
    const cardElement = e.currentTarget;
    const box = cardElement.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    const rotateX = -y / 10;
    const rotateY = x / 15;
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s ease'
    });
  };

  return (
    <div data-lenis-prevent className="fixed inset-0 z-[100] flex flex-col bg-white overflow-hidden animate-reveal">
      
      {/* 1. Header del Portal */}
      <header className="px-6 py-4 bg-white border-b border-neutral-100 flex items-center justify-between shrink-0 shadow-sm">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-xs font-bold text-neutral-600 hover:text-black transition-all group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Volver a la tienda</span>
        </button>

        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-lg text-white flex items-center justify-center font-serif font-bold italic"
            style={{ backgroundColor: primaryColor }}
          >
            {cliente.nombre ? cliente.nombre.charAt(0).toUpperCase() : 'C'}
          </div>
          <span className="font-serif text-sm font-bold tracking-wider uppercase hidden sm:inline">Portal de Cliente</span>
        </div>

        <button 
          onClick={() => {
            cerrarSesion();
            onClose();
          }}
          className="px-3.5 py-1.5 rounded-xl border border-red-100 text-red-600 hover:bg-red-50 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
        >
          <LogOut size={13} />
          <span>Cerrar sesión</span>
        </button>
      </header>

      {/* 2. Cuerpo del Portal (Layout de dos columnas) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Barra Lateral Izquierda (Menú de Navegación) */}
        <aside className="w-64 border-r border-neutral-100 bg-[#fafafa] p-6 hidden md:flex flex-col justify-between shrink-0 overflow-y-auto scrollbar-none">
          <div className="space-y-6">
            <div>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-2">Mi cuenta</p>
              <nav className="space-y-1">
                {[
                  { id: 'inicio', label: 'Inicio de la cuenta', icon: User },
                  { id: 'pedidos', label: 'Mis pedidos', icon: History, badge: pedidos.length },
                  { id: 'wishlist', label: 'Lista de deseos', icon: Heart, badge: wishlist.length },
                  { id: 'carrito', label: 'Mi carrito de compras', icon: ShoppingBag, badge: cart.reduce((acc, item) => acc + item.cantidad, 0) },
                  { id: 'perfil', label: 'Mi perfil', icon: User },
                  { id: 'credito', label: 'Crédito de la cuenta', icon: Wallet }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive 
                          ? 'bg-neutral-900 text-white shadow-md' 
                          : 'text-neutral-500 hover:text-black hover:bg-neutral-100/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={15} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                          isActive ? 'bg-white/20 text-white' : 'bg-neutral-200/60 text-neutral-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-2">Configuraciones</p>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('tarjetas')}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'tarjetas' 
                      ? 'bg-neutral-900 text-white shadow-md' 
                      : 'text-neutral-500 hover:text-black hover:bg-neutral-100/50'
                  }`}
                >
                  <CreditCard size={15} />
                  <span>Tarjetas de pago</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Soporte */}
          <div className="p-4 bg-neutral-100/50 rounded-2xl border border-neutral-200/30 space-y-2">
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Servicio al Cliente</p>
            <a 
              href="https://wa.me/51999999991" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-2 text-xs font-bold text-[#1a1a1a] hover:underline"
            >
              <MessageSquare size={14} />
              <span>Chatear por WhatsApp</span>
            </a>
          </div>
        </aside>

        {/* Panel de Contenido Principal */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-none bg-white">
          
          {/* Navegación móvil tipo píldora (solo visible en pantallas pequeñas) */}
          <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-4 mb-4 border-b border-neutral-100 scrollbar-none shrink-0">
            {[
              { id: 'inicio', label: 'Inicio' },
              { id: 'pedidos', label: `Pedidos (${pedidos.length})` },
              { id: 'wishlist', label: `Deseos (${wishlist.length})` },
              { id: 'carrito', label: `Carrito (${cart.reduce((acc, item) => acc + item.cantidad, 0)})` },
              { id: 'perfil', label: 'Perfil' },
              { id: 'tarjetas', label: 'Tarjetas' },
              { id: 'credito', label: 'Crédito' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-black text-white'
                    : 'bg-neutral-100 text-neutral-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* =======================================================
              1. PESTAÑA: INICIO (HOME)
             ======================================================= */}
          {activeTab === 'inicio' && (
            <div className="space-y-8 animate-reveal">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-md text-white shadow-xs" style={{ backgroundColor: primaryColor }}>
                  Mi cuenta
                </span>
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-neutral-900 mt-2">
                  Bienvenido, {cliente.nombre || 'Javicho pe'}
                </h1>
                <p className="text-sm text-neutral-400 font-light">
                  Administra tus compras, actualiza tus datos y gestiona tus métodos de pago.
                </p>
              </div>

              {/* Grid de Accesos Directos (Estilo MyProtein) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Mis Pedidos */}
                <div 
                  onClick={() => setActiveTab('pedidos')}
                  className="p-5 bg-white border border-neutral-200/80 rounded-2xl hover:border-neutral-400 cursor-pointer shadow-xs hover:shadow-md transition-all space-y-3 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center border border-neutral-100 group-hover:bg-black group-hover:text-white transition-all">
                    <History size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">Mis pedidos</h3>
                    <p className="text-xs text-neutral-400 font-light mt-1 leading-relaxed">
                      Ver y administrar tus pedidos, comprobar el estado de entrega y reordenar artículos.
                    </p>
                  </div>
                </div>

                {/* Lista de Deseos */}
                <div 
                  onClick={() => setActiveTab('wishlist')}
                  className="p-5 bg-white border border-neutral-200/80 rounded-2xl hover:border-neutral-400 cursor-pointer shadow-xs hover:shadow-md transition-all space-y-3 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center border border-neutral-100 group-hover:bg-red-500 group-hover:text-white transition-all">
                    <Heart size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">Lista de deseos</h3>
                    <p className="text-xs text-neutral-400 font-light mt-1 leading-relaxed">
                      Explora todos tus productos favoritos guardados en un solo lugar y llévalos al carrito.
                    </p>
                  </div>
                </div>

                {/* Crédito de la cuenta */}
                <div 
                  onClick={() => setActiveTab('credito')}
                  className="p-5 bg-white border border-neutral-200/80 rounded-2xl hover:border-neutral-400 cursor-pointer shadow-xs hover:shadow-md transition-all space-y-3 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center border border-neutral-100 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <Wallet size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">Crédito de la cuenta</h3>
                    <p className="text-xs text-neutral-400 font-light mt-1 leading-relaxed">
                      Revisa tu saldo acumulado de crédito de la tienda e historial de puntos de lealtad.
                    </p>
                  </div>
                </div>

                {/* Mi perfil */}
                <div 
                  onClick={() => setActiveTab('perfil')}
                  className="p-5 bg-white border border-neutral-200/80 rounded-2xl hover:border-neutral-400 cursor-pointer shadow-xs hover:shadow-md transition-all space-y-3 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center border border-neutral-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <User size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">Mi perfil</h3>
                    <p className="text-xs text-neutral-400 font-light mt-1 leading-relaxed">
                      Actualiza tus datos personales de contacto y cambia tu dirección predeterminada de entrega.
                    </p>
                  </div>
                </div>

                {/* Tarjetas de Pago */}
                <div 
                  onClick={() => setActiveTab('tarjetas')}
                  className="p-5 bg-white border border-neutral-200/80 rounded-2xl hover:border-neutral-400 cursor-pointer shadow-xs hover:shadow-md transition-all space-y-3 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center border border-neutral-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">Tarjetas de pago</h3>
                    <p className="text-xs text-neutral-400 font-light mt-1 leading-relaxed">
                      Administra y vincula tus tarjetas de pago bancarias para realizar compras rápidas de prueba.
                    </p>
                  </div>
                </div>

                {/* Centro de Ayuda */}
                <a 
                  href="https://wa.me/51999999991"
                  target="_blank"
                  rel="noreferrer"
                  className="p-5 bg-white border border-neutral-200/80 rounded-2xl hover:border-neutral-400 cursor-pointer shadow-xs hover:shadow-md transition-all space-y-3 group block"
                >
                  <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center border border-neutral-100 group-hover:bg-[#25D366] group-hover:text-white transition-all">
                    <HelpCircle size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">Centro de ayuda</h3>
                    <p className="text-xs text-neutral-400 font-light mt-1 leading-relaxed">
                      Ponte en contacto con la administración de la tienda para consultar dudas sobre tus envíos.
                    </p>
                  </div>
                </a>

              </div>
            </div>
          )}

          {/* =======================================================
              2. PESTAÑA: MIS PEDIDOS (HISTORIAL INTEGRADO)
             ======================================================= */}
          {activeTab === 'pedidos' && (
            <div className="space-y-6 animate-reveal">
              <div className="border-b border-neutral-100 pb-4">
                <h2 className="font-serif text-2xl font-bold text-[#1a1a1a]">Historial de Pedidos</h2>
                <p className="text-xs text-neutral-400 font-light mt-0.5">Listado histórico de todas tus compras registradas</p>
              </div>

              {/* Filtros */}
              <div className="bg-neutral-50 border border-neutral-100 p-4 rounded-2xl space-y-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                  <input
                    type="text"
                    placeholder="Buscar por ID de pedido o nombre de producto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs text-[#1a1a1a] focus:outline-none focus:border-black transition-all"
                  />
                </div>
                <div className="flex gap-3">
                  <select 
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="all">Todo el historial</option>
                    <option value="7days">Últimos 7 días</option>
                    <option value="30days">Últimos 30 días</option>
                  </select>
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="enviado">Enviado</option>
                    <option value="completado">Completado</option>
                  </select>
                </div>
              </div>

              {/* Listado */}
              <div className="space-y-4">
                {filteredPedidos.length === 0 ? (
                  <div className="text-center py-12 bg-neutral-50 border border-neutral-100 rounded-2xl text-xs text-neutral-400">
                    No se encontraron pedidos.
                  </div>
                ) : (
                  filteredPedidos.map((pedido) => {
                    const isExpanded = expandedPedidoId === pedido.id;
                    const isPendiente = (pedido.estado || 'pendiente').toLowerCase() === 'pendiente';
                    const isEnviado = (pedido.estado || 'pendiente').toLowerCase() === 'enviado';
                    return (
                      <div key={pedido.id} className="border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
                        <div 
                          onClick={() => toggleExpand(pedido.id)}
                          className="p-4 bg-neutral-50/50 hover:bg-neutral-50 cursor-pointer flex items-center justify-between gap-4 text-xs select-none"
                        >
                          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 items-center">
                            <div>
                              <p className="font-mono font-bold text-neutral-900">{pedido.id.substring(0, 8).toUpperCase()}...</p>
                              <p className="text-[10px] text-neutral-400 mt-0.5">
                                {new Date(pedido.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                              </p>
                            </div>
                            <div className="hidden md:block">
                              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Total</p>
                              <p className="font-bold text-neutral-800">${pedido.total.toFixed(2)}</p>
                            </div>
                            <div className="hidden md:block">
                              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Productos</p>
                              <p className="font-semibold text-neutral-600">
                                {pedido.productos.reduce((sum, p) => sum + p.cantidad, 0)} items
                              </p>
                            </div>
                            <div>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                isPendiente ? 'bg-amber-50 text-amber-700 border-amber-100' : isEnviado ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              }`}>
                                {pedido.estado ? pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1) : 'Pendiente'}
                              </span>
                            </div>
                          </div>
                          <div className="text-neutral-400 shrink-0">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="border-t border-neutral-100 p-4 bg-white space-y-4">
                            <div className="space-y-1 text-xs bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-2">Artículos</p>
                              {pedido.productos.map((prod, pIdx) => (
                                <div key={pIdx} className="flex justify-between py-1 border-b border-neutral-200/30 last:border-0">
                                  <span className="font-medium text-neutral-800">{prod.cantidad}x {prod.nombre}</span>
                                  <span className="font-mono text-neutral-600">${(prod.precio * prod.cantidad).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1 text-xs">
                              <div>
                                <p className="text-[10px] text-neutral-400 font-bold">Datos de Envío</p>
                                <p className="text-neutral-700 font-medium mt-0.5">{pedido.nombre_cliente} • {pedido.telefono_cliente}</p>
                              </div>
                              <button
                                onClick={() => onReorder(pedido.productos)}
                                className="py-2.5 px-4 bg-black text-white hover:bg-black/90 active:scale-[0.98] rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all self-end sm:self-center"
                              >
                                <ShoppingBag size={13} />
                                Reordenar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* =======================================================
              3. PESTAÑA: LISTA DE DESEOS (WISHLIST DE LOCALSTORAGE)
             ======================================================= */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6 animate-reveal">
              <div className="border-b border-neutral-100 pb-4">
                <h2 className="font-serif text-2xl font-bold text-[#1a1a1a]">Lista de Deseos</h2>
                <p className="text-xs text-neutral-400 font-light mt-0.5">Tus productos favoritos guardados en este navegador</p>
              </div>

              {wishlist.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-neutral-200 rounded-2xl space-y-3">
                  <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
                    <Heart size={20} />
                  </div>
                  <p className="text-sm font-semibold text-neutral-500">Tu lista está vacía</p>
                  <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                    Navega por la tienda y haz clic en el icono de corazón sobre cualquier producto para agregarlo aquí.
                  </p>
                  <button 
                    onClick={onClose}
                    className="px-4 py-2 bg-black text-white rounded-xl text-xs font-bold active:scale-95 transition-all mt-2"
                  >
                    Explorar Productos
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlist.map((prod) => (
                    <div key={prod.id} className="border border-neutral-200 rounded-2xl overflow-hidden bg-white shadow-xs flex flex-col justify-between group">
                      <div className="aspect-[4/3] bg-neutral-100 overflow-hidden relative">
                        <img 
                          src={prod.imagen_url || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600'} 
                          alt={prod.nombre} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                        />
                        <button 
                          onClick={() => toggleWishlist(prod)}
                          className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/95 text-red-500 border border-neutral-100 hover:scale-110 active:scale-90 transition-all shadow-sm"
                          aria-label="Quitar de favoritos"
                        >
                          <Heart size={14} fill="currentColor" />
                        </button>
                      </div>
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">{prod.categoria}</span>
                          <h4 className="text-sm font-bold text-neutral-800 line-clamp-1">{prod.nombre}</h4>
                        </div>
                        <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
                          <span className="font-mono font-bold text-sm text-neutral-900">${prod.precio.toFixed(2)}</span>
                          <button
                            onClick={() => onAddToCart(prod)}
                            className="py-1.5 px-3 bg-black text-white hover:bg-black/90 active:scale-95 transition-all rounded-lg text-[10px] font-bold flex items-center gap-1"
                          >
                            <ShoppingBag size={11} />
                            <span>Añadir</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =======================================================
              3.5. PESTAÑA: MI CARRITO DE COMPRAS
             ======================================================= */}
          {activeTab === 'carrito' && (
            <div className="space-y-6 animate-reveal">
              <div className="border-b border-neutral-100 pb-4 flex justify-between items-center">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#1a1a1a]">Mi Carrito de Compras</h2>
                  <p className="text-xs text-neutral-400 font-light mt-0.5">Revisa tus artículos seleccionados y completa tu compra</p>
                </div>
                {cart.length > 0 && (
                  <span className="bg-black text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                    {cart.reduce((acc, item) => acc + item.cantidad, 0)} Items
                  </span>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-neutral-200 rounded-2xl space-y-3">
                  <div className="w-12 h-12 rounded-full bg-neutral-50 text-neutral-400 flex items-center justify-center mx-auto border border-neutral-100">
                    <ShoppingBag size={20} />
                  </div>
                  <p className="text-sm font-semibold text-neutral-500">Tu carrito está vacío</p>
                  <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                    Navega por nuestro catálogo público y agrega los productos que desees comprar.
                  </p>
                  <button 
                    onClick={onClose}
                    className="px-4 py-2 bg-black text-white rounded-xl text-xs font-bold active:scale-95 transition-all mt-2"
                  >
                    Explorar Catálogo
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Lista de productos (Columna Izquierda - 7/12) */}
                  <div className="lg:col-span-7 space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4 p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-xs flex-col sm:flex-row items-start sm:items-center">
                        <img 
                          src={item.imagen_url || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600'} 
                          alt={item.nombre} 
                          className="w-16 h-16 object-cover rounded-xl bg-neutral-50 shrink-0 border border-neutral-100"
                        />
                        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                          <div>
                            <h4 className="text-sm font-bold text-neutral-800 truncate">{item.nombre}</h4>
                            <p className="text-xs text-neutral-400 font-light mt-0.5 line-clamp-1">{item.descripcion}</p>
                            <p className="text-neutral-900 text-xs font-bold font-mono mt-1">${Number(item.precio).toFixed(2)}</p>
                          </div>
                          
                          {/* Controles de cantidad y botón quitar */}
                          <div className="flex items-center gap-3 self-end sm:self-center">
                            <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 p-1 rounded-xl">
                              <button 
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-7 h-7 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-50 flex items-center justify-center text-xs font-bold active:scale-90 transition-all shadow-xs"
                              >
                                -
                              </button>
                              <span className="text-xs font-bold font-mono w-6 text-center">{item.cantidad}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-7 h-7 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-50 flex items-center justify-center text-xs font-bold active:scale-90 transition-all shadow-xs"
                              >
                                +
                              </button>
                            </div>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors px-2 py-1"
                            >
                              Quitar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Checkout & Resumen (Columna Derecha - 5/12) */}
                  <div className="lg:col-span-5 bg-neutral-50 border border-neutral-200/80 p-6 rounded-2xl space-y-6">
                    <h3 className="font-serif text-lg font-bold text-neutral-800 border-b border-neutral-200 pb-2">Resumen y Envío</h3>
                    
                    {/* Formulario de Checkout rápido */}
                    <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-neutral-600">Nombre de contacto *</label>
                          <input 
                            type="text" 
                            required
                            value={checkoutNombre}
                            onChange={(e) => setCheckoutNombre(e.target.value)}
                            className="w-full px-4.5 py-3 bg-white border border-neutral-200 rounded-xl text-xs text-[#1a1a1a] focus:outline-none focus:border-black"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-neutral-600">Teléfono Móvil *</label>
                          <input 
                            type="tel" 
                            required
                            value={checkoutTelefono}
                            onChange={(e) => setCheckoutTelefono(e.target.value)}
                            className="w-full px-4.5 py-3 bg-white border border-neutral-200 rounded-xl text-xs text-[#1a1a1a] focus:outline-none focus:border-black"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-neutral-600">Dirección de Entrega</label>
                          <textarea 
                            rows="2"
                            value={checkoutDireccion}
                            onChange={(e) => setCheckoutDireccion(e.target.value)}
                            className="w-full px-4.5 py-3 bg-white border border-neutral-200 rounded-xl text-xs text-[#1a1a1a] focus:outline-none focus:border-black resize-none"
                            placeholder="Calle, número, departamento / distrito"
                          />
                        </div>
                      </div>

                      {/* Subtotal y total */}
                      <div className="border-t border-neutral-200 pt-4 space-y-2">
                        <div className="flex justify-between text-xs text-neutral-500">
                          <span>Subtotal estimado</span>
                          <span className="font-mono">${totalCartPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-neutral-800 pt-1">
                          <span>Total del Pedido</span>
                          <span className="font-mono text-base text-black font-bold">${totalCartPrice.toFixed(2)}</span>
                        </div>
                      </div>

                      {checkoutError && (
                        <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-[11px] leading-relaxed">
                          {checkoutError}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={checkoutSubmitting}
                        className="w-full py-3.5 bg-black text-white hover:bg-black/90 active:scale-[0.98] transition-all rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-black/5 disabled:opacity-50"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {checkoutSubmitting ? (
                          <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Procesando...</span>
                          </>
                        ) : (
                          <>
                            <Send size={14} />
                            <span>Confirmar y Enviar a WhatsApp</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* =======================================================
              4. PESTAÑA: MI PERFIL (ACTUALIZAR DATOS DE ENTREGA)
             ======================================================= */}
          {activeTab === 'perfil' && (
            <div className="space-y-6 animate-reveal">
              <div className="border-b border-neutral-100 pb-4">
                <h2 className="font-serif text-2xl font-bold text-[#1a1a1a]">Mi Perfil</h2>
                <p className="text-xs text-neutral-400 font-light mt-0.5">Administra tus datos personales y de entrega del paquete</p>
              </div>

              {profileSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold text-center animate-reveal">
                  ✓ ¡Tus cambios de perfil se guardaron exitosamente!
                </div>
              )}
              {profileError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-semibold text-center animate-reveal">
                  {profileError}
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-lg bg-neutral-50/50 p-6 border border-neutral-100 rounded-2xl">
                <div className="space-y-3.5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-600">Nombre Completo</label>
                    <input 
                      type="text" 
                      required
                      value={editNombre}
                      disabled={!isEditingProfile}
                      onChange={(e) => setEditNombre(e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-xl text-xs text-[#1a1a1a] focus:outline-none focus:border-black transition-all ${
                        isEditingProfile ? 'bg-white border-neutral-300' : 'bg-neutral-100 border-transparent cursor-not-allowed'
                      }`}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-600">Correo Electrónico (No modificable)</label>
                    <input 
                      type="email" 
                      disabled
                      value={cliente.email}
                      className="w-full px-4 py-2.5 bg-neutral-100 border border-transparent rounded-xl text-xs text-neutral-400 cursor-not-allowed"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-600">Teléfono Móvil</label>
                    <input 
                      type="tel" 
                      required
                      value={editTelefono}
                      disabled={!isEditingProfile}
                      onChange={(e) => setEditTelefono(e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-xl text-xs text-[#1a1a1a] focus:outline-none focus:border-black transition-all ${
                        isEditingProfile ? 'bg-white border-neutral-300' : 'bg-neutral-100 border-transparent cursor-not-allowed'
                      }`}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-600">Dirección Predeterminada de Entrega</label>
                    <textarea 
                      rows="3"
                      required
                      value={editDireccion}
                      disabled={!isEditingProfile}
                      onChange={(e) => setEditDireccion(e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-xl text-xs text-[#1a1a1a] focus:outline-none focus:border-black transition-all resize-none ${
                        isEditingProfile ? 'bg-white border-neutral-300' : 'bg-neutral-100 border-transparent cursor-not-allowed'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-neutral-200/50">
                  {isEditingProfile ? (
                    <>
                      <button 
                        type="button" 
                        onClick={() => {
                          setIsEditingProfile(false);
                          setEditNombre(cliente.nombre || '');
                          setEditTelefono(cliente.telefono || '');
                          setEditDireccion(cliente.direccion || '');
                        }}
                        className="px-4 py-2.5 rounded-xl border border-neutral-200 hover:bg-white text-xs font-medium"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        disabled={profileSubmitting}
                        className="px-4 py-2.5 rounded-xl bg-black text-white hover:bg-black/90 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {profileSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                    </>
                  ) : (
                    <button 
                      type="button" 
                      onClick={() => setIsEditingProfile(true)}
                      className="px-4 py-2.5 rounded-xl bg-black text-white hover:bg-black/90 text-xs font-bold transition-all"
                    >
                      Editar Perfil
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* =======================================================
              5. PESTAÑA: TARJETAS DE PAGO (BILLETERA 3D INTERACTIVA)
             ======================================================= */}
          {activeTab === 'tarjetas' && (
            <div className="space-y-6 animate-reveal">
              <div className="border-b border-neutral-100 pb-4">
                <h2 className="font-serif text-2xl font-bold text-[#1a1a1a]">Tarjetas de Pago</h2>
                <p className="text-xs text-neutral-400 font-light mt-0.5">Administra de forma segura tus tarjetas bancarias para checkout rápido</p>
              </div>

              {/* Contenedor Flex: Tarjeta 3D izquierda, Formulario y lista derecha */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Visualizador 3D Tarjeta (Columnas 1 a 5) */}
                <div className="lg:col-span-5 flex flex-col items-center">
                  <div 
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{
                      ...tiltStyle,
                      background: `linear-gradient(135deg, ${primaryColor} 0%, #000000 100%)`
                    }}
                    className="w-full max-w-[340px] aspect-[1.586/1] rounded-2xl p-6 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all duration-100 ease-out border border-white/10 select-none cursor-pointer"
                  >
                    {/* Detalles estéticos de la Tarjeta */}
                    <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
                    <div className="absolute -left-12 -top-12 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
                    
                    {/* Fila 1: Banco y Chip */}
                    <div className="flex justify-between items-center relative z-10">
                      <span className="text-[10px] font-mono tracking-widest text-white/70 font-semibold">TECH WALLET</span>
                      <div className="w-10 h-8 bg-amber-200/80 rounded-md border border-amber-300/40 relative overflow-hidden">
                        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-amber-950/20" />
                        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-amber-950/20" />
                      </div>
                    </div>

                    {/* Fila 2: Número de Tarjeta */}
                    <div className="my-4 relative z-10">
                      <p className="font-mono text-lg md:text-xl tracking-[0.2em] font-semibold text-white/95">
                        {newCardNumber ? newCardNumber.replace(/(\d{4})/g, '$1 ').trim() || '•••• •••• •••• 4242' : '•••• •••• •••• 4242'}
                      </p>
                    </div>

                    {/* Fila 3: Holder y Expiry */}
                    <div className="flex justify-between items-end relative z-10">
                      <div className="min-w-0 flex-1 pr-4">
                        <p className="text-[8px] text-white/50 uppercase tracking-widest">Titular</p>
                        <p className="font-mono text-xs font-bold tracking-wider truncate uppercase mt-0.5">
                          {newCardHolder || cliente.nombre || 'Nombre Apellido'}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[8px] text-white/50 uppercase tracking-widest">Vence</p>
                        <p className="font-mono text-xs font-bold tracking-wider mt-0.5">
                          {newCardExpiry || '12/28'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-3 font-medium text-center">
                    Mueve el cursor sobre la tarjeta para interactuar con el efecto 3D.
                  </p>
                </div>

                {/* Lista de Tarjetas y Formulario (Columnas 6 a 12) */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Lista de Tarjetas */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Mis Tarjetas Guardadas</p>
                    
                    {cards.map((card) => (
                      <div key={card.id} className="p-4 border border-neutral-200 rounded-2xl flex items-center justify-between gap-4 bg-[#fafafa]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0 shadow-sm font-bold font-mono text-xs italic">
                            {card.type === 'visa' ? 'V' : 'MC'}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-neutral-800">{card.bank}</p>
                            <p className="font-mono text-[11px] text-neutral-500 mt-0.5">{card.number} (Vence {card.expiry})</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteCard(card.id)}
                          className="p-2 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 active:scale-95 transition-all"
                          aria-label="Eliminar tarjeta"
                        >
                          <Trash size={15} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Formulario Agregar Tarjeta */}
                  <div>
                    {!showAddCard ? (
                      <button
                        onClick={() => setShowAddCard(true)}
                        className="py-2.5 px-4 border border-dashed border-neutral-300 hover:border-black rounded-xl text-xs font-bold w-full flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Plus size={14} />
                        Añadir Nueva Tarjeta
                      </button>
                    ) : (
                      <form onSubmit={handleAddCard} className="p-5 border border-neutral-200 rounded-2xl space-y-3 bg-neutral-50/50 animate-reveal">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1 col-span-2">
                            <label className="text-[10px] font-bold text-neutral-500">Número de Tarjeta (16 dígitos)</label>
                            <input 
                              type="text" 
                              maxLength={16}
                              required
                              placeholder="4242 4242 4242 4242"
                              value={newCardNumber}
                              onChange={(e) => setNewCardNumber(e.target.value.replace(/\D/g, ''))}
                              className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-black"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-neutral-500">Titular de Tarjeta</label>
                            <input 
                              type="text" 
                              required
                              placeholder="Ej. Juan Pérez"
                              value={newCardHolder}
                              onChange={(e) => setNewCardHolder(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-black"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-neutral-500">Expiración (MM/AA)</label>
                            <input 
                              type="text" 
                              maxLength={5}
                              required
                              placeholder="12/28"
                              value={newCardExpiry}
                              onChange={(e) => {
                                let val = e.target.value;
                                if (val.length === 2 && !val.includes('/')) {
                                  val += '/';
                                }
                                setNewCardExpiry(val);
                              }}
                              className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-black"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end pt-2">
                          <button 
                            type="button" 
                            onClick={() => setShowAddCard(false)}
                            className="px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-semibold"
                          >
                            Cancelar
                          </button>
                          <button 
                            type="submit" 
                            className="px-3.5 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-black/90"
                          >
                            Guardar Tarjeta
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* =======================================================
              6. PESTAÑA: CRÉDITO DE LA CUENTA
             ======================================================= */}
          {activeTab === 'credito' && (
            <div className="space-y-6 animate-reveal">
              <div className="border-b border-neutral-100 pb-4">
                <h2 className="font-serif text-2xl font-bold text-[#1a1a1a]">Crédito de la Cuenta</h2>
                <p className="text-xs text-neutral-400 font-light mt-0.5">Controla tu saldo acumulado de lealtad para canjes directos</p>
              </div>

              {/* Tarjeta de Crédito Principal */}
              <div className="p-6 bg-gradient-to-r from-neutral-900 to-black text-white rounded-3xl border border-neutral-800 max-w-md space-y-6 shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-xl" />
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono tracking-widest text-white/50">TECH LOYALTY</span>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold font-serif italic text-xs">
                    S
                  </div>
                </div>

                <div>
                  <p className="text-xs text-white/60">Saldo Disponible</p>
                  <p className="font-serif text-3xl font-bold mt-1">$0.00</p>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/10 text-xs">
                  <div>
                    <p className="text-[10px] text-white/40">Mis Puntos de Lealtad</p>
                    <p className="font-bold text-white/90 mt-0.5">150 Puntos</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40">Nivel de Cuenta</p>
                    <p className="font-bold text-amber-400 mt-0.5 flex items-center gap-1">★ Cliente Gold</p>
                  </div>
                </div>
              </div>

              {/* Detalle explicativo */}
              <div className="p-5 bg-neutral-50 border border-neutral-100 rounded-2xl space-y-3 max-w-md text-xs leading-relaxed text-neutral-600">
                <p className="font-bold text-neutral-800">¿Cómo funciona el crédito?</p>
                <p>
                  Por cada compra que realizas en nuestro catálogo público, acumulas el **5% del total pagado** en puntos de lealtad.
                </p>
                <p>
                  Cuando alcances los **500 puntos**, podrás convertirlos directamente en crédito de la cuenta para canjearlos en tu próximo pedido a través de WhatsApp.
                </p>
              </div>

            </div>
          )}

        </main>
      </div>

    </div>
  );
}
