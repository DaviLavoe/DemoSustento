import { useState, useEffect, useCallback } from 'react';
import { supabaseAdmin } from '../../config/supabaseAdmin';
import {
  Building2, Plus, Search, ExternalLink, Edit2, Trash2,
  X, Check, AlertTriangle, Package, ShoppingCart, Users,
  Loader2, Globe, Phone, LogIn
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function getToken() {
  const { data: { session } } = await supabaseAdmin.auth.getSession();
  return session?.access_token;
}

// ─── Componente Modal de Crear/Editar Empresa ───────────────────────────────
function EmpresaModal({ empresa, onClose, onSaved }) {
  const [form, setForm] = useState({
    nombre: empresa?.nombre || '',
    slug: empresa?.slug || '',
    color_primario: empresa?.color_primario || '#6d28d9',
    telefono_whatsapp: empresa?.telefono_whatsapp || '',
    logo_url: empresa?.logo_url || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const token = await getToken();
      const method = empresa ? 'PUT' : 'POST';
      const url = empresa
        ? `${API_URL}/api/superadmin/empresas/${empresa.id}`
        : `${API_URL}/api/superadmin/empresas`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const autoSlug = (nombre) =>
    nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const handleNombreChange = (e) => {
    const nombre = e.target.value;
    setForm((f) => ({ ...f, nombre, slug: empresa ? f.slug : autoSlug(nombre) }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0d0d14] border border-white/10 rounded-2xl shadow-2xl shadow-violet-900/20 overflow-hidden">
        {/* Header modal */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
              <Building2 size={15} className="text-violet-400" />
            </div>
            <h2 className="text-white font-semibold text-base">
              {empresa ? 'Editar Empresa' : 'Nueva Empresa'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white transition-all">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertTriangle size={15} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Nombre de la Empresa *</label>
            <input
              type="text"
              value={form.nombre}
              onChange={handleNombreChange}
              required
              placeholder="Ej: Tienda Moderna"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-white/8 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Slug (URL) *</label>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus-within:border-violet-500/50 transition-all">
              <Globe size={13} className="text-neutral-500 shrink-0" />
              <span className="text-neutral-500 text-sm">/catalogo/</span>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                required
                placeholder="tienda-moderna"
                className="flex-1 bg-transparent text-white placeholder-neutral-500 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Color Primario</label>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus-within:border-violet-500/50 transition-all">
                <div className="w-4 h-4 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: form.color_primario }} />
                <input
                  type="text"
                  value={form.color_primario}
                  onChange={(e) => setForm((f) => ({ ...f, color_primario: e.target.value }))}
                  placeholder="#6d28d9"
                  className="flex-1 bg-transparent text-white placeholder-neutral-500 text-sm focus:outline-none"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider flex items-center gap-1"><Phone size={10} /> WhatsApp</label>
              <input
                type="text"
                value={form.telefono_whatsapp}
                onChange={(e) => setForm((f) => ({ ...f, telefono_whatsapp: e.target.value }))}
                placeholder="+51 987 654 321"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-violet-500/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">URL del Logo</label>
            <input
              type="url"
              value={form.logo_url}
              onChange={(e) => setForm((f) => ({ ...f, logo_url: e.target.value }))}
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-violet-500/50 transition-all"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-neutral-300 text-sm font-medium hover:bg-white/5 transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-900/30">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {empresa ? 'Guardar cambios' : 'Crear empresa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Componente Modal de Confirmación de Eliminación ────────────────────────
function ConfirmDeleteModal({ empresa, onClose, onConfirm, deleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[#0d0d14] border border-red-500/20 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <AlertTriangle size={24} className="text-red-400" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">Eliminar empresa</h2>
            <p className="text-neutral-400 text-sm mt-1">
              Estás a punto de eliminar <span className="text-white font-semibold">"{empresa.nombre}"</span>. Esta acción eliminará también todos sus productos, pedidos y clientes de manera permanente.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-neutral-300 text-sm font-medium hover:bg-white/5 transition-all">
              Cancelar
            </button>
            <button onClick={onConfirm} disabled={deleting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Página Principal ────────────────────────────────────────────────────────
export default function GestionEmpresas() {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalEmpresa, setModalEmpresa] = useState(null); // null | {} (nueva) | empresa (editar)
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const fetchEmpresas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/superadmin/empresas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setEmpresas(data.empresas);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEmpresas(); }, [fetchEmpresas]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/superadmin/empresas/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setDeleteTarget(null);
      fetchEmpresas();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = empresas.filter((e) =>
    e.nombre.toLowerCase().includes(search.toLowerCase()) ||
    e.slug.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Gestión de Empresas</h2>
          <p className="text-neutral-400 text-sm mt-0.5">
            {empresas.length} empresa{empresas.length !== 1 ? 's' : ''} registrada{empresas.length !== 1 ? 's' : ''} en la plataforma
          </p>
        </div>
        <button
          onClick={() => setModalEmpresa({})}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-900/30 whitespace-nowrap"
        >
          <Plus size={16} />
          Nueva Empresa
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
        <input
          type="text"
          placeholder="Buscar por nombre o slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/8 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-violet-500/40 focus:bg-white/8 transition-all"
        />
      </div>

      {/* Error global */}
      {error && (
        <div className="flex items-start gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Estado de carga */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-violet-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Building2 size={40} className="text-neutral-700 mb-4" />
          <p className="text-neutral-400 font-medium">
            {search ? 'No se encontraron resultados' : 'No hay empresas registradas'}
          </p>
          <p className="text-neutral-600 text-sm mt-1">
            {search ? 'Prueba con otro término de búsqueda' : 'Crea la primera empresa con el botón de arriba'}
          </p>
        </div>
      ) : (
        /* Tabla de empresas */
        <div className="rounded-2xl bg-[#0d0d14] border border-white/5 overflow-hidden">
          {/* Cabecera de tabla (solo desktop) */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 text-[11px] font-semibold text-neutral-500 uppercase tracking-widest">
            <div className="col-span-4">Empresa</div>
            <div className="col-span-2 text-center">Productos</div>
            <div className="col-span-2 text-center">Pedidos</div>
            <div className="col-span-2 text-center">Clientes</div>
            <div className="col-span-2 text-right">Acciones</div>
          </div>

          <div className="divide-y divide-white/5">
            {filtered.map((empresa) => (
              <div key={empresa.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 py-4 hover:bg-white/3 transition-colors group items-center">
                {/* Nombre + slug */}
                <div className="md:col-span-4 flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md"
                    style={{ backgroundColor: empresa.color_primario || '#6d28d9' }}
                  >
                    {empresa.logo_url
                      ? <img src={empresa.logo_url} alt="" className="w-full h-full object-contain rounded-xl" />
                      : empresa.nombre.charAt(0).toUpperCase()
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{empresa.nombre}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-neutral-500 text-[11px] font-mono">/{empresa.slug}</span>
                      <span className="text-[10px] text-neutral-600">·</span>
                      <span className="text-[10px] text-neutral-600">{formatDate(empresa.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Métricas */}
                <div className="md:col-span-2 flex md:justify-center items-center gap-2">
                  <Package size={13} className="text-neutral-500 md:hidden" />
                  <span className="text-sm font-semibold text-white">{empresa.total_productos}</span>
                  <span className="text-neutral-500 text-xs md:hidden">productos</span>
                </div>
                <div className="md:col-span-2 flex md:justify-center items-center gap-2">
                  <ShoppingCart size={13} className="text-neutral-500 md:hidden" />
                  <span className="text-sm font-semibold text-white">{empresa.total_pedidos}</span>
                  <span className="text-neutral-500 text-xs md:hidden">pedidos</span>
                </div>
                <div className="md:col-span-2 flex md:justify-center items-center gap-2">
                  <Users size={13} className="text-neutral-500 md:hidden" />
                  <span className="text-sm font-semibold text-white">{empresa.total_clientes}</span>
                  <span className="text-neutral-500 text-xs md:hidden">clientes</span>
                </div>

                {/* Acciones */}
                <div className="md:col-span-2 flex items-center gap-2 md:justify-end">
                  {/* Ver catálogo público */}
                  <a
                    href={`/catalogo/${empresa.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Ver catálogo público"
                    className="p-2 rounded-lg hover:bg-white/8 text-neutral-500 hover:text-emerald-400 transition-all"
                  >
                    <ExternalLink size={14} />
                  </a>
                  {/* Ir al login del inventario de esta empresa (nueva pestaña, sin afectar sesión superadmin) */}
                  <a
                    href={`/login/${empresa.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Ir al login de ${empresa.nombre}`}
                    className="p-2 rounded-lg hover:bg-white/8 text-neutral-500 hover:text-amber-400 transition-all"
                  >
                    <LogIn size={14} />
                  </a>
                  {/* Editar empresa */}
                  <button
                    onClick={() => setModalEmpresa(empresa)}
                    title="Editar empresa"
                    className="p-2 rounded-lg hover:bg-white/8 text-neutral-500 hover:text-violet-400 transition-all"
                  >
                    <Edit2 size={14} />
                  </button>
                  {/* Eliminar empresa */}
                  <button
                    onClick={() => setDeleteTarget(empresa)}
                    title="Eliminar empresa"
                    className="p-2 rounded-lg hover:bg-white/8 text-neutral-500 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modales */}
      {modalEmpresa !== null && (
        <EmpresaModal
          empresa={Object.keys(modalEmpresa).length > 0 ? modalEmpresa : null}
          onClose={() => setModalEmpresa(null)}
          onSaved={() => { setModalEmpresa(null); fetchEmpresas(); }}
        />
      )}
      {deleteTarget && (
        <ConfirmDeleteModal
          empresa={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </div>
  );
}
