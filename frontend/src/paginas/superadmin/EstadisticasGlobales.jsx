import { useState, useEffect, useCallback } from 'react';
import { supabaseAdmin } from '../../config/supabaseAdmin';
import {
  Building2, Package, ShoppingCart, Users, DollarSign,
  TrendingUp, Loader2, AlertTriangle, BarChart2, Activity
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Area, AreaChart, Legend
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function getToken() {
  const { data: { session } } = await supabaseAdmin.auth.getSession();
  return session?.access_token;
}

// ─── Tooltip personalizado para los gráficos ────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0d0d14] border border-white/10 rounded-xl px-3 py-2 shadow-xl">
        <p className="text-neutral-400 text-xs mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Tarjeta KPI ─────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, color, suffix = '' }) {
  return (
    <div className={`rounded-2xl bg-[#0d0d14] border border-white/5 p-5 hover:border-white/10 transition-all group`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${color} shadow-lg`}>
          <Icon size={18} className="text-white" />
        </div>
        <TrendingUp size={14} className="text-neutral-600 group-hover:text-neutral-500 transition-colors" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white tracking-tight">
          {suffix}{typeof value === 'number' ? value.toLocaleString('es-PE') : (value ?? '—')}
        </p>
        <p className="text-neutral-500 text-sm mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Página de Estadísticas ───────────────────────────────────────────────────
export default function EstadisticasGlobales() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/superadmin/estadisticas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Agrupa pedidos recientes por día para el gráfico de área
  const pedidosPorDia = (() => {
    if (!stats?.pedidos_recientes?.length) return [];
    const agrupados = {};
    stats.pedidos_recientes.forEach((p) => {
      const dia = new Date(p.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
      agrupados[dia] = agrupados[dia] || { fecha: dia, pedidos: 0, ingresos: 0 };
      agrupados[dia].pedidos += 1;
      agrupados[dia].ingresos += parseFloat(p.total || 0);
    });
    return Object.values(agrupados);
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-violet-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 p-5 rounded-2xl bg-red-500/10 border border-red-500/20">
        <AlertTriangle size={18} className="text-red-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-red-300 font-medium">Error al cargar estadísticas</p>
          <p className="text-red-400/70 text-sm mt-0.5">{error}</p>
        </div>
      </div>
    );
  }

  const { resumen, ranking_empresas } = stats;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Estadísticas Globales</h2>
        <p className="text-neutral-400 text-sm mt-0.5">Métricas consolidadas de toda la plataforma SaaS</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          icon={Building2}
          label="Empresas Activas"
          value={resumen.total_empresas}
          color="from-violet-600 to-indigo-700"
        />
        <KpiCard
          icon={Package}
          label="Productos Totales"
          value={resumen.total_productos}
          color="from-blue-600 to-cyan-700"
        />
        <KpiCard
          icon={ShoppingCart}
          label="Pedidos Totales"
          value={resumen.total_pedidos}
          color="from-emerald-600 to-teal-700"
        />
        <KpiCard
          icon={Users}
          label="Clientes Registrados"
          value={resumen.total_clientes}
          color="from-amber-500 to-orange-600"
        />
        <KpiCard
          icon={DollarSign}
          label="Ingresos Estimados"
          value={resumen.ingresos_totales.toFixed(2)}
          suffix="S/ "
          color="from-rose-500 to-pink-600"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Gráfico 1: Actividad de pedidos (últimos 30 días) */}
        <div className="rounded-2xl bg-[#0d0d14] border border-white/5 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity size={16} className="text-violet-400" />
            <h3 className="text-white font-semibold text-sm">Pedidos (últimos 30 días)</h3>
          </div>
          {pedidosPorDia.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-neutral-600 text-sm">
              Sin datos en este período
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={pedidosPorDia} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradPedidos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="fecha" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="pedidos"
                  name="Pedidos"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  fill="url(#gradPedidos)"
                  dot={{ fill: '#7c3aed', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#a78bfa' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Gráfico 2: Ranking de empresas por pedidos */}
        <div className="rounded-2xl bg-[#0d0d14] border border-white/5 p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 size={16} className="text-indigo-400" />
            <h3 className="text-white font-semibold text-sm">Top Empresas por Pedidos</h3>
          </div>
          {!ranking_empresas?.length ? (
            <div className="flex items-center justify-center h-48 text-neutral-600 text-sm">
              Sin datos suficientes aún
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ranking_empresas} margin={{ top: 5, right: 5, left: -20, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="nombre"
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={100}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="pedidos" name="Pedidos" fill="url(#gradBar)" radius={[0, 6, 6, 0]}>
                  <defs>
                    <linearGradient id="gradBar" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6d28d9" />
                      <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Ingresos por día (gráfico adicional) */}
      {pedidosPorDia.length > 0 && (
        <div className="rounded-2xl bg-[#0d0d14] border border-white/5 p-6">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign size={16} className="text-emerald-400" />
            <h3 className="text-white font-semibold text-sm">Ingresos por Día (últimos 30 días)</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={pedidosPorDia} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="gradIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="fecha" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `S/${v}`} />
              <Tooltip content={<CustomTooltip />} formatter={(v) => `S/ ${v.toFixed(2)}`} />
              <Area
                type="monotone"
                dataKey="ingresos"
                name="Ingresos"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#gradIngresos)"
                dot={{ fill: '#10b981', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#34d399' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
