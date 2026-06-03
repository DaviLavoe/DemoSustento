import { useState } from 'react';
import { X, Search, Calendar, DollarSign, ShoppingBag, Box, ChevronDown, ChevronUp, Clock, CheckCircle } from 'lucide-react';

export default function ModalHistorialCompleto({
  isOpen,
  onClose,
  pedidos = [],
  cliente = {},
  onReorder
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // all | 7days | 30days
  const [statusFilter, setStatusFilter] = useState('all'); // all | pendiente | enviado | completado
  const [expandedPedidoId, setExpandedPedidoId] = useState(null);

  if (!isOpen) return null;

  // 1. Estadísticas de Compras
  const totalInvertido = pedidos.reduce((acc, p) => acc + p.total, 0);
  const totalPedidos = pedidos.length;
  const totalArticulos = pedidos.reduce((acc, p) => 
    acc + p.productos.reduce((sum, prod) => sum + prod.cantidad, 0), 0
  );

  // Toggle Accordion
  const toggleExpand = (id) => {
    if (expandedPedidoId === id) {
      setExpandedPedidoId(null);
    } else {
      setExpandedPedidoId(id);
    }
  };

  // 2. Lógica de Filtrado
  const filteredPedidos = pedidos.filter((pedido) => {
    // Filtro de Búsqueda (ID de pedido o Nombre del producto)
    const matchesSearch = 
      pedido.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.productos.some((prod) => 
        prod.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );

    // Filtro de Fecha
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

    // Filtro de Estado
    const matchesStatus = 
      statusFilter === 'all' || 
      (pedido.estado || 'pendiente').toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesDate && matchesStatus;
  });

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center overflow-hidden bg-black/60 backdrop-blur-md animate-reveal">
      {/* Contenedor Principal */}
      <div className="relative w-full h-full md:h-[90vh] md:max-w-4xl md:rounded-3xl bg-white shadow-2xl flex flex-col overflow-hidden animate-reveal delay-100 md:border border-neutral-100">
        
        {/* Cabecera */}
        <div className="px-6 py-5 border-b border-neutral-100 bg-[#fafafa] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shadow-md">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-[#1a1a1a]">Historial Completo de Pedidos</h2>
              <p className="text-xs text-neutral-400 font-light mt-0.5">Consulta, filtra y reordena tus compras anteriores</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 active:scale-95 transition-all text-neutral-600 hover:text-black"
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Contenido (Scrollable) */}
        <div data-lenis-prevent className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none">
          
          {/* Fila de Estadísticas */}
          <div className="grid grid-cols-3 gap-4 shrink-0">
            {/* Tarjeta 1 */}
            <div className="p-4 bg-gradient-to-br from-neutral-50 to-neutral-100/50 border border-neutral-100 rounded-2xl flex items-center gap-4 transition-all hover:shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                <DollarSign size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Total Invertido</p>
                <p className="text-base md:text-lg font-serif font-bold text-neutral-900 mt-0.5 truncate">
                  ${totalInvertido.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Tarjeta 2 */}
            <div className="p-4 bg-gradient-to-br from-neutral-50 to-neutral-100/50 border border-neutral-100 rounded-2xl flex items-center gap-4 transition-all hover:shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
                <ShoppingBag size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Pedidos</p>
                <p className="text-base md:text-lg font-serif font-bold text-neutral-900 mt-0.5 truncate">
                  {totalPedidos}
                </p>
              </div>
            </div>

            {/* Tarjeta 3 */}
            <div className="p-4 bg-gradient-to-br from-neutral-50 to-neutral-100/50 border border-neutral-100 rounded-2xl flex items-center gap-4 transition-all hover:shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100">
                <Box size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Artículos</p>
                <p className="text-base md:text-lg font-serif font-bold text-neutral-900 mt-0.5 truncate">
                  {totalArticulos}
                </p>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-neutral-50 border border-neutral-100 p-4 rounded-2xl space-y-3 shrink-0">
            {/* Buscador */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
              <input
                type="text"
                placeholder="Buscar por ID de pedido o nombre de producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e5e5e5] rounded-xl text-sm text-[#1a1a1a] placeholder-neutral-400 focus:outline-none focus:border-black transition-all"
              />
            </div>

            {/* selectores de filtro */}
            <div className="flex flex-wrap gap-3">
              {/* Filtro Fecha */}
              <div className="flex-1 min-w-[140px] flex flex-col gap-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar size={10} /> Rango de Fecha
                </label>
                <select 
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-black cursor-pointer font-medium"
                >
                  <option value="all">Todo el historial</option>
                  <option value="7days">Últimos 7 días</option>
                  <option value="30days">Últimos 30 días</option>
                </select>
              </div>

              {/* Filtro Estado */}
              <div className="flex-1 min-w-[140px] flex flex-col gap-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock size={10} /> Estado del Pedido
                </label>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-black cursor-pointer font-medium"
                >
                  <option value="all">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="enviado">Enviado</option>
                  <option value="completado">Completado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Listado de Pedidos */}
          <div className="space-y-4">
            {filteredPedidos.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-neutral-200 bg-[#fafafa] rounded-2xl space-y-2">
                <p className="text-sm font-semibold text-neutral-500">No se encontraron pedidos</p>
                <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                  Prueba cambiando los términos de búsqueda o ajustando los filtros de fecha o estado.
                </p>
              </div>
            ) : (
              filteredPedidos.map((pedido, idx) => {
                const isExpanded = expandedPedidoId === pedido.id;
                const totalItemsInOrder = pedido.productos.reduce((sum, p) => sum + p.cantidad, 0);
                const isPendiente = (pedido.estado || 'pendiente').toLowerCase() === 'pendiente';
                const isEnviado = (pedido.estado || 'pendiente').toLowerCase() === 'enviado';

                return (
                  <div 
                    key={pedido.id}
                    className={`bg-white border rounded-2xl transition-all duration-300 overflow-hidden shadow-xs hover:shadow-md animate-reveal ${
                      isExpanded ? 'border-neutral-400/80 ring-1 ring-neutral-200' : 'border-neutral-200/70'
                    }`}
                    style={{ animationDelay: `${(idx % 6) * 100}ms` }}
                  >
                    {/* Encabezado de la Tarjeta */}
                    <div 
                      onClick={() => toggleExpand(pedido.id)}
                      className="p-5 flex items-center justify-between cursor-pointer select-none bg-neutral-50/50 hover:bg-neutral-50 transition-colors gap-4"
                    >
                      <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-4 gap-3 items-center">
                        {/* ID & Fecha */}
                        <div className="min-w-0">
                          <p className="font-mono text-xs font-bold text-neutral-900 truncate">
                            {pedido.id.substring(0, 8).toUpperCase()}...
                          </p>
                          <p className="text-[10px] text-neutral-400 mt-0.5">
                            {new Date(pedido.fecha).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </div>

                        {/* Resumen de Artículos */}
                        <div className="hidden md:block">
                          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Productos</p>
                          <p className="text-xs font-semibold text-neutral-700 mt-0.5">
                            {totalItemsInOrder} {totalItemsInOrder === 1 ? 'artículo' : 'artículos'}
                          </p>
                        </div>

                        {/* Total */}
                        <div>
                          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Monto Total</p>
                          <p className="text-sm font-mono font-bold text-neutral-950 mt-0.5">
                            ${pedido.total.toFixed(2)}
                          </p>
                        </div>

                        {/* Estado */}
                        <div className="justify-self-start md:justify-self-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            isPendiente 
                              ? 'bg-amber-50 text-amber-700 border-amber-100'
                              : isEnviado 
                              ? 'bg-blue-50 text-blue-700 border-blue-100'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          }`}>
                            {isPendiente ? <Clock size={10} /> : <CheckCircle size={10} />}
                            {pedido.estado ? pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1) : 'Pendiente'}
                          </span>
                        </div>
                      </div>

                      {/* Icono de Expansión */}
                      <div className="text-neutral-400 shrink-0">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>

                    {/* Desglose Expandible */}
                    {isExpanded && (
                      <div className="border-t border-neutral-100 p-5 bg-white space-y-5 animate-reveal">
                        {/* Tabla de Productos */}
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Detalle del Pedido</p>
                          <div className="bg-neutral-50 rounded-2xl border border-neutral-100 overflow-hidden">
                            <table className="w-full text-left border-collapse text-xs md:text-sm">
                              <thead>
                                <tr className="border-b border-neutral-200/60 text-[10px] text-neutral-400 font-bold uppercase tracking-wider bg-neutral-100/50">
                                  <th className="px-4 py-3">Producto</th>
                                  <th className="px-4 py-3 text-center">Cant.</th>
                                  <th className="px-4 py-3 text-right">Precio Unit.</th>
                                  <th className="px-4 py-3 text-right">Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {pedido.productos.map((prod, pIdx) => (
                                  <tr key={pIdx} className="border-b border-neutral-100/60 last:border-0 hover:bg-neutral-100/20 transition-colors">
                                    <td className="px-4 py-3 font-medium text-neutral-800">{prod.nombre}</td>
                                    <td className="px-4 py-3 text-center font-mono text-neutral-600">{prod.cantidad}</td>
                                    <td className="px-4 py-3 text-right font-mono text-neutral-500">${prod.precio.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right font-mono font-semibold text-neutral-900">
                                      ${(prod.precio * prod.cantidad).toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Datos de Entrega y Botón Reordenar */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                          {/* Datos */}
                          <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 text-xs space-y-2">
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Datos de Entrega</p>
                            <div className="space-y-1 mt-1 text-neutral-700">
                              <p><span className="font-semibold text-neutral-500">Destinatario:</span> {pedido.nombre_cliente}</p>
                              {pedido.telefono_cliente && (
                                <p><span className="font-semibold text-neutral-500">Teléfono:</span> {pedido.telefono_cliente}</p>
                              )}
                              {cliente.direccion && (
                                <p><span className="font-semibold text-neutral-500">Dirección:</span> {cliente.direccion}</p>
                              )}
                            </div>
                          </div>

                          {/* Acción Reordenar */}
                          <div className="flex flex-col justify-center items-stretch md:items-end gap-3">
                            <div className="text-right">
                              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Total del Pedido</p>
                              <p className="text-2xl font-mono font-bold text-black mt-0.5">${pedido.total.toFixed(2)}</p>
                            </div>
                            <button
                              onClick={() => onReorder(pedido.productos)}
                              className="py-3 px-6 bg-black text-white hover:bg-black/90 active:scale-[0.98] transition-all rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-black/5"
                            >
                              <ShoppingBag size={14} />
                              Volver a pedir (Reordenar)
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
