import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { API_BASE_URL } from '../../config/api';
import { BarChart3, TrendingUp, ShoppingBag, DollarSign, X } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';

export default function Reportes() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    ventasTotales: 0,
    graficoLineas: [],
    graficoPastel: []
  });

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
            graficoPastel: resData.data.graficoPastel || []
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
        <div className="p-6 bg-white rounded-2xl border border-[#e5e5e5] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-black/5 rounded-xl flex items-center justify-center text-black">
            <DollarSign size={22} />
          </div>
          <div>
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Ventas Acumuladas</p>
            <p className="font-serif text-2xl font-bold text-[#1a1a1a] mt-0.5">
              ${data.ventasTotales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Total Pedidos */}
        <div className="p-6 bg-white rounded-2xl border border-[#e5e5e5] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-black/5 rounded-xl flex items-center justify-center text-black">
            <ShoppingBag size={22} />
          </div>
          <div>
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Total de Pedidos</p>
            <p className="font-serif text-2xl font-bold text-[#1a1a1a] mt-0.5">{totalPedidos} pedidos</p>
          </div>
        </div>

        {/* Tasa Promedio */}
        <div className="p-6 bg-white rounded-2xl border border-[#e5e5e5] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-black/5 rounded-xl flex items-center justify-center text-black">
            <TrendingUp size={22} />
          </div>
          <div>
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Promedio por Pedido</p>
            <p className="font-serif text-2xl font-bold text-[#1a1a1a] mt-0.5">
              ${totalPedidos > 0 
                ? (data.ventasTotales / totalPedidos).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
                : '0.00'}
            </p>
          </div>
        </div>

      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico 1: Evolución Temporal de Pedidos */}
        <div className="p-6 bg-white rounded-2xl border border-[#e5e5e5] shadow-xs lg:col-span-2 space-y-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#1a1a1a]">Volumen de Pedidos por Día</h3>
            <p className="text-xs text-neutral-400 font-light">Evolución de las solicitudes e intenciones de compra registradas en el catálogo</p>
          </div>
          <div className="h-80 w-full">
            {data.graficoLineas.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-neutral-400">Sin datos de volumen diario.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.graficoLineas} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCantidad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1a1a1a" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#1a1a1a" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
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
                    contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                  />
                  <Area type="monotone" dataKey="cantidad" stroke="#1a1a1a" strokeWidth={2} fillOpacity={1} fill="url(#colorCantidad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Gráfico 2: Categorías más vendidas (Torta / Pastel) */}
        <div className="p-6 bg-white rounded-2xl border border-[#e5e5e5] shadow-xs space-y-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#1a1a1a]">Ventas por Categoría</h3>
            <p className="text-xs text-neutral-400 font-light">Distribución porcentual de las unidades vendidas por rubro</p>
          </div>
          <div className="h-80 w-full flex flex-col justify-center items-center">
            {data.graficoPastel.length === 0 ? (
              <div className="text-xs text-neutral-400">Sin datos de categorías.</div>
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
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e5e5', fontSize: '11px', color: '#1a1a1a' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Centro de la Dona */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Unidades</span>
                    <span className="font-serif text-2xl font-bold text-[#1a1a1a]">
                      {data.graficoPastel.reduce((sum, item) => sum + item.cantidad, 0)}
                    </span>
                  </div>
                </div>

                {/* Leyenda Personalizada */}
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-4">
                  {data.graficoPastel.map((entry, index) => (
                    <div key={entry.categoria} className="flex items-center gap-1.5 text-xs text-neutral-600">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="font-medium truncate max-w-[80px]">{entry.categoria}</span>
                      <span className="text-neutral-400 font-mono">({entry.cantidad})</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
