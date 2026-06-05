import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../config/supabase';
import { API_BASE_URL } from '../../config/api';
import { BarChart3, TrendingUp, ShoppingBag, DollarSign, X } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import { 
  motion, 
  useMotionValue, 
  useSpring, 
  useTransform, 
  AnimatePresence 
} from 'framer-motion';
import { cn } from '@/lib/utils';

export default function Reportes() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    ventasTotales: 0,
    graficoLineas: [],
    graficoPastel: [],
    pedidos: []
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [expandedPedidoId, setExpandedPedidoId] = useState(null);

  // Estados del Radar Táctico para el AreaChart
  const chartContainerRef = useRef(null);
  const [isRadarActive, setIsRadarActive] = useState(false);
  const [isRadarLocked, setIsRadarLocked] = useState(false);

  // Coordenadas brutas y suavizadas (physics spring)
  const radarX = useMotionValue(50);
  const radarY = useMotionValue(50);
  const smoothRadarX = useSpring(radarX, { stiffness: 280, damping: 26 });
  const smoothRadarY = useSpring(radarY, { stiffness: 280, damping: 26 });

  // Transforms a porcentajes para la mira (crosshair)
  const crosshairX = useTransform(smoothRadarX, (val) => `${val}%`);
  const crosshairY = useTransform(smoothRadarY, (val) => `${val}%`);

  // Efecto de inclinación por velocidad
  const velocityX = useTransform(smoothRadarX, (latest) => (latest - radarX.get()) * 0.5);
  const velocityY = useTransform(smoothRadarY, (latest) => (latest - radarY.get()) * 0.5);

  const handlePointerMove = (e) => {
    if (chartContainerRef.current) {
      const rect = chartContainerRef.current.getBoundingClientRect();
      const newX = ((e.clientX - rect.left) / rect.width) * 100;
      const newY = ((e.clientY - rect.top) / rect.height) * 100;
      radarX.set(Math.min(Math.max(newX, 0), 100));
      radarY.set(Math.min(Math.max(newY, 0), 100));
    }
  };

  const handlePointerLeave = () => {
    setIsRadarActive(false);
    setIsRadarLocked(false);
    radarX.set(50);
    radarY.set(50);
  };

  // Colores premium armonizados para los gráficos
  const COLORS = ['#1a1a1a', '#4b5563', '#9ca3af', '#d1d5db', '#f3f4f6'];

  useEffect(() => {
    async function fetchAnaliticas() {
      setLoading(true);
      setError(null);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Sesión no encontrada. Vuelve a ingresar.');

        const response = await fetch(`${API_BASE_URL}/api/pedidos/analiticas`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        const resData = await response.json();
        if (!response.ok) {
          throw new Error(resData.message || 'Error al obtener las analíticas');
        }

        if (resData.success && resData.data) {
          setData({
            ventasTotales: resData.data.ventasTotales || 0,
            graficoLineas: resData.data.graficoLineas || [],
            graficoPastel: resData.data.graficoPastel || [],
            pedidos: resData.data.pedidos || []
          });
        }
      } catch (err) {
        console.error('Error al cargar analíticas:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAnaliticas();
  }, []);

  const totalPedidos = data.graficoLineas.reduce((sum, item) => sum + item.cantidad, 0);

  // Filtrar pedidos del día seleccionado
  const pedidosDelDia = data.pedidos.filter(p => {
    if (!p.created_at) return false;
    const fechaPedido = new Date(p.created_at).toISOString().split('T')[0];
    return fechaPedido === selectedDate;
  });

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-reveal">
      
      {/* Mensaje de error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="p-1 text-red-500 hover:text-red-700">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Tarjetas de Métricas Core */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Ventas Totales */}
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5e5e5] dark:border-zinc-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-black/5 dark:bg-white/10 rounded-xl flex items-center justify-center text-black dark:text-white">
            <DollarSign size={22} />
          </div>
          <div>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">Ventas Acumuladas</p>
            <p className="font-serif text-2xl font-bold text-[#1a1a1a] dark:text-white mt-0.5">
              ${data.ventasTotales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Total Pedidos */}
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5e5e5] dark:border-zinc-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-black/5 dark:bg-white/10 rounded-xl flex items-center justify-center text-black dark:text-white">
            <ShoppingBag size={22} />
          </div>
          <div>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">Total de Pedidos</p>
            <p className="font-serif text-2xl font-bold text-[#1a1a1a] dark:text-white mt-0.5">{totalPedidos} pedidos</p>
          </div>
        </div>

        {/* Tasa Promedio */}
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5e5e5] dark:border-zinc-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-black/5 dark:bg-white/10 rounded-xl flex items-center justify-center text-black dark:text-white">
            <TrendingUp size={22} />
          </div>
          <div>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">Promedio por Pedido</p>
            <p className="font-serif text-2xl font-bold text-[#1a1a1a] dark:text-white mt-0.5">
              ${totalPedidos > 0 
                ? (data.ventasTotales / totalPedidos).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
                : '0.00'}
            </p>
          </div>
        </div>

      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico 1: Evolución Temporal de Pedidos con Radar Táctico Integrado */}
        <div className="bg-white dark:bg-zinc-900 text-[#1a1a1a] dark:text-neutral-100 rounded-2xl border border-[#e5e5e5] dark:border-zinc-800 shadow-xs p-6 lg:col-span-2 space-y-4 relative overflow-hidden group select-none">
          
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1a1a1a] dark:text-neutral-100">Volumen de Pedidos por Día</h3>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 font-light">Evolución de las solicitudes e intenciones de compra registradas en el catálogo</p>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-[9px] font-mono tracking-wider text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center gap-1.5">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full transition-colors duration-300",
                  isRadarActive 
                    ? (isRadarLocked ? "bg-red-500 shadow-[0_0_8px_red]" : "bg-neutral-800 dark:bg-white shadow-[0_0_8px_var(--radar-accent)]") 
                    : "bg-neutral-300 dark:bg-neutral-800"
                )} />
                <span>RADAR_CURSOR: {isRadarActive ? (isRadarLocked ? "LOCKED" : "ACTIVE") : "IDLE"}</span>
              </div>
            </div>
          </div>

          <div 
            ref={chartContainerRef}
            className="relative h-80 w-full overflow-hidden outline-none focus:outline-none"
            onPointerMove={handlePointerMove}
            onPointerEnter={() => setIsRadarActive(true)}
            onPointerLeave={handlePointerLeave}
            onPointerDown={() => setIsRadarLocked(true)}
            onPointerUp={() => setIsRadarLocked(false)}
          >
            {/* Grid Pattern overlay behind the chart */}
            <div 
              className="absolute inset-0 opacity-40 pointer-events-none transition-opacity duration-500 group-hover:opacity-60"
              style={{ 
                  backgroundImage: `linear-gradient(var(${isRadarLocked ? "--radar-grid-red" : "--radar-grid"}) 1px, transparent 1px), linear-gradient(90deg, var(${isRadarLocked ? "--radar-grid-red" : "--radar-grid"}) 1px, transparent 1px)`,
                  backgroundSize: "30px 30px",
                  backgroundPosition: "-1px -1px"
              }}
            />

            {/* Corner brackets */}
            <div className={cn("absolute top-0 left-0 w-3 h-3 border-t border-l transition-colors duration-300 pointer-events-none", isRadarLocked ? "border-red-500/30" : "border-neutral-300/30 dark:border-neutral-700/30")} />
            <div className={cn("absolute top-0 right-0 w-3 h-3 border-t border-r transition-colors duration-300 pointer-events-none", isRadarLocked ? "border-red-500/30" : "border-neutral-300/30 dark:border-neutral-700/30")} />
            <div className={cn("absolute bottom-0 left-0 w-3 h-3 border-b border-l transition-colors duration-300 pointer-events-none", isRadarLocked ? "border-red-500/30" : "border-neutral-300/30 dark:border-neutral-700/30")} />
            <div className={cn("absolute bottom-0 right-0 w-3 h-3 border-b border-r transition-colors duration-300 pointer-events-none", isRadarLocked ? "border-red-500/30" : "border-neutral-300/30 dark:border-neutral-700/30")} />

            {/* Radar Laser Scanning Line */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-b from-transparent to-transparent h-[200%] w-full animate-scan pointer-events-none",
              isRadarLocked ? "via-red-500/10" : "via-neutral-400/5 dark:via-neutral-100/5"
            )} />

            {/* RADAR CROSSHAIRS */}
            <motion.div 
              className={cn(
                "absolute top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent to-transparent pointer-events-none transition-colors duration-300 z-10",
                isRadarLocked ? "via-red-400/50 dark:via-red-400/60" : "via-neutral-400/30 dark:via-neutral-200/30"
              )} 
              style={{ left: crosshairX }}
            />
            <motion.div 
              className={cn(
                "absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent to-transparent pointer-events-none transition-colors duration-300 z-10",
                isRadarLocked ? "via-red-400/50 dark:via-red-400/60" : "via-neutral-400/30 dark:via-neutral-200/30"
              )} 
              style={{ top: crosshairY }}
            />

            {/* RETICLE PUCK WITH SMOOTH MOTION */}
            <motion.div
              className="absolute w-0 h-0 z-20 pointer-events-none"
              style={{ left: crosshairX, top: crosshairY }}
            >
              <motion.div 
                className="relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                animate={{ scale: isRadarActive ? (isRadarLocked ? 0.9 : 1) : 0 }}
                style={{ rotateX: velocityY, rotateY: velocityX }}
              >
                {/* Center dot */}
                <div className={cn(
                  "w-1 h-1 shadow-[0_0_8px_currentColor] rounded-full transition-colors duration-300",
                  isRadarLocked ? "bg-red-50 text-red-50" : "bg-neutral-900 dark:bg-neutral-100 text-[#1a1a1a] dark:text-white"
                )} />
                
                {/* Outer box */}
                <motion.div 
                  className={cn(
                    "absolute border shadow-[0_0_12px_rgba(0,0,0,0.4)] transition-colors duration-300",
                    isRadarLocked ? "border-red-600 dark:border-red-500 shadow-red-600/10 dark:shadow-red-500/20" : "border-neutral-800 dark:border-neutral-200 shadow-neutral-800/10 dark:shadow-neutral-200/20"
                  )}
                  initial={false}
                  animate={{ 
                      width: isRadarActive ? (isRadarLocked ? 24 : 36) : 0, 
                      height: isRadarActive ? (isRadarLocked ? 24 : 36) : 0,
                      opacity: isRadarActive ? 1 : 0
                  }}
                >
                  <div className={cn("absolute top-0 left-0 w-1 h-1 border-t border-l transition-colors duration-300", isRadarLocked ? "border-red-600 dark:border-red-200" : "border-neutral-800 dark:border-neutral-200")} />
                  <div className={cn("absolute top-0 right-0 w-1 h-1 border-t border-r transition-colors duration-300", isRadarLocked ? "border-red-600 dark:border-red-200" : "border-neutral-800 dark:border-neutral-200")} />
                  <div className={cn("absolute bottom-0 left-0 w-1 h-1 border-b border-l transition-colors duration-300", isRadarLocked ? "border-red-600 dark:border-red-200" : "border-neutral-800 dark:border-neutral-200")} />
                  <div className={cn("absolute bottom-0 right-0 w-1 h-1 border-b border-r transition-colors duration-300", isRadarLocked ? "border-red-600 dark:border-red-200" : "border-neutral-800 dark:border-neutral-200")} />
                </motion.div>

                {/* Radar sweep echo circle */}
                <AnimatePresence>
                  {isRadarActive && !isRadarLocked && (
                    <motion.div 
                      initial={{ scale: 0.5, opacity: 1 }}
                      animate={{ scale: 2, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute border border-neutral-800 dark:border-neutral-200 rounded-full w-8 h-8"
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>

            {data.graficoLineas.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-neutral-500">Sin datos de volumen diario.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={data.graficoLineas} 
                  margin={{ top: 15, right: 15, left: -25, bottom: 5 }}
                  onClick={(chartData) => {
                    if (chartData && chartData.activeLabel) {
                      setSelectedDate(chartData.activeLabel);
                      setExpandedPedidoId(null);
                    }
                  }}
                  style={{ cursor: 'pointer', outline: 'none' }}
                >
                  <defs>
                    <linearGradient id="colorCantidadActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--radar-accent)" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="var(--radar-accent)" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorCantidadRed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorCantidadGray" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-stroke-default)" stopOpacity={0.12}/>
                      <stop offset="95%" stopColor="var(--chart-stroke-default)" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid-stroke)" />
                  <XAxis 
                    dataKey="fecha" 
                    stroke="#a1a1aa" 
                    fontSize={10} 
                    tickLine={false}
                    tickFormatter={(tick) => {
                      const parts = tick.split('-');
                      return parts.length >= 3 ? `${parts[2]}/${parts[1]}` : tick;
                    }}
                  />
                  <YAxis stroke="#a1a1aa" fontSize={10} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    cursor={false}
                    contentStyle={{ 
                      backgroundColor: 'var(--tooltip-bg)', 
                      borderRadius: '12px', 
                      border: '1px solid var(--tooltip-border)', 
                      color: 'var(--tooltip-text)', 
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
                    }}
                    labelStyle={{ fontWeight: 'bold', color: isRadarLocked ? '#ef4444' : 'var(--radar-accent)', marginBottom: '4px' }}
                    itemStyle={{ color: 'var(--tooltip-text)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cantidad" 
                    stroke={isRadarLocked ? "#ef4444" : (isRadarActive ? "var(--radar-accent)" : "var(--chart-stroke-default)")} 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill={isRadarLocked ? "url(#colorCantidadRed)" : (isRadarActive ? "url(#colorCantidadActive)" : "url(#colorCantidadGray)")} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Gráfico 2: Categorías más vendidas (Torta / Pastel) */}
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5e5e5] dark:border-zinc-800 shadow-xs space-y-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#1a1a1a] dark:text-neutral-100">Ventas por Categoría</h3>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 font-light">Distribución porcentual de las unidades vendidas por rubro</p>
          </div>
          <div className="h-80 w-full flex flex-col justify-center items-center">
            {data.graficoPastel.length === 0 ? (
              <div className="text-xs text-neutral-400 dark:text-neutral-500">Sin datos de categorías.</div>
            ) : (
              <>
                <div className="h-56 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.graficoPastel}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="cantidad"
                        nameKey="categoria"
                      >
                        {data.graficoPastel.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`var(--pie-color-${index % 5})`} style={{ outline: 'none' }} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--tooltip-bg)', 
                          borderRadius: '12px', 
                          border: '1px solid var(--tooltip-border)', 
                          fontSize: '11px', 
                          color: 'var(--tooltip-text)' 
                        }}
                        itemStyle={{ color: 'var(--tooltip-text)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Centro de la Dona */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 dark:text-neutral-500 tracking-wider">Unidades</span>
                    <span className="font-serif text-2xl font-bold text-[#1a1a1a] dark:text-white">
                      {data.graficoPastel.reduce((sum, item) => sum + item.cantidad, 0)}
                    </span>
                  </div>
                </div>

                {/* Leyenda Personalizada */}
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-4">
                  {data.graficoPastel.map((entry, index) => (
                    <div key={entry.categoria} className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: `var(--pie-color-${index % 5})` }}></div>
                      <span className="font-medium truncate max-w-[80px]">{entry.categoria}</span>
                      <span className="text-neutral-400 dark:text-neutral-500 font-mono">({entry.cantidad})</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

      </div>



      {/* Detalle de Ventas del Día Seleccionado */}
      {selectedDate && (
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5e5e5] dark:border-zinc-800 shadow-xs space-y-4 animate-reveal mt-6">
          <div className="flex items-center justify-between border-b border-[#f0f0f0] dark:border-zinc-800 pb-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1a1a1a] dark:text-white flex items-center gap-2">
                <BarChart3 size={18} />
                <span>Ventas del día: {selectedDate.split('-').reverse().join('/')}</span>
              </h3>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 font-light mt-0.5">
                Se encontraron {pedidosDelDia.length} {pedidosDelDia.length === 1 ? 'pedido' : 'pedidos'} registrados en esta fecha.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedDate(null);
                setExpandedPedidoId(null);
              }}
              className="px-3 py-1.5 rounded-xl border border-[#e5e5e5] dark:border-zinc-800 hover:bg-[#fafafa] dark:hover:bg-zinc-800 text-xs font-semibold text-[#1a1a1a] dark:text-white transition-all flex items-center gap-1 active:scale-95"
            >
              <X size={14} />
              <span>Cerrar Detalle</span>
            </button>
          </div>

          {pedidosDelDia.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400 dark:text-neutral-500">
              No se registraron ventas en esta fecha.
            </div>
          ) : (
            <div className="space-y-3">
              {pedidosDelDia.map((pedido) => {
                const isExpanded = expandedPedidoId === pedido.id;
                const totalPedido = parseFloat(pedido.total);
                const fechaFormat = new Date(pedido.created_at).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                });

                let badgeClass = "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50";
                if (pedido.estado === 'enviado' || pedido.estado === 'completado') {
                  badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50";
                } else if (pedido.estado === 'cancelado') {
                  badgeClass = "bg-red-50 text-red-700 border-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50";
                }

                return (
                  <div
                    key={pedido.id}
                    className="border border-[#e5e5e5] dark:border-zinc-800 rounded-xl overflow-hidden transition-all duration-300 shadow-xs bg-white dark:bg-zinc-900"
                  >
                    {/* Fila Encabezado Pedido */}
                    <div
                      onClick={() => setExpandedPedidoId(isExpanded ? null : pedido.id)}
                      className="p-4 bg-[#fafafa]/50 hover:bg-[#fafafa] dark:bg-zinc-900/50 dark:hover:bg-zinc-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div>
                          <p className="font-mono text-xs font-bold text-black dark:text-white uppercase">{pedido.id.substring(0, 8)}</p>
                          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium mt-0.5">Hora: {fechaFormat}</p>
                        </div>
                        <div className="h-4 w-px bg-neutral-200 dark:bg-zinc-800 hidden sm:block"></div>
                        <div>
                          <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">{pedido.nombre_cliente}</p>
                          <p className="text-[10px] text-neutral-400 dark:text-neutral-500">{pedido.telefono_cliente || 'Sin teléfono'}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <div className="text-right">
                          <p className="text-[9px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">Total</p>
                          <p className="font-mono font-bold text-xs text-black dark:text-white mt-0.5">
                            ${totalPedido.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wider font-mono ${badgeClass}`}>
                          {pedido.estado}
                        </span>
                        <div className="text-neutral-400 dark:text-neutral-500 transition-transform duration-300">
                          <svg
                            className={`w-4 h-4 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Fila Detalle Productos */}
                    {isExpanded && (
                      <div className="border-t border-[#e5e5e5] dark:border-zinc-800 p-4 bg-white dark:bg-zinc-900 animate-reveal">
                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider mb-2.5">Artículos del Pedido</p>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-[#f0f0f0] dark:border-zinc-800 text-neutral-400 dark:text-neutral-500 font-medium">
                                <th className="pb-2 font-medium">Producto</th>
                                <th className="pb-2 text-center font-medium">Cantidad</th>
                                <th className="pb-2 text-right font-medium">Precio Unit.</th>
                                <th className="pb-2 text-right font-medium">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#fafafa] dark:divide-zinc-800/50">
                              {pedido.detalles_pedido && pedido.detalles_pedido.length > 0 ? (
                                pedido.detalles_pedido.map((item) => {
                                  const precio = parseFloat(item.precio_unitario);
                                  const subtotal = precio * item.cantidad;
                                  return (
                                    <tr key={item.id} className="text-neutral-600 dark:text-neutral-400">
                                      <td className="py-2.5 font-medium text-neutral-800 dark:text-neutral-200">
                                        {item.productos ? item.productos.nombre : 'Producto no disponible'}
                                      </td>
                                      <td className="py-2.5 text-center font-mono text-neutral-500 dark:text-neutral-400">{item.cantidad}</td>
                                      <td className="py-2.5 text-right font-mono text-neutral-500 dark:text-neutral-400">${precio.toFixed(2)}</td>
                                      <td className="py-2.5 text-right font-mono font-bold text-neutral-800 dark:text-neutral-200">${subtotal.toFixed(2)}</td>
                                    </tr>
                                  );
                                })
                              ) : (
                                <tr>
                                  <td colSpan="4" className="py-3 text-center text-neutral-400 dark:text-neutral-500">
                                    No hay detalles de productos para este pedido.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
