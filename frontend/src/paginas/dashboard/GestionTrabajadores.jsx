import { useState, useEffect, useCallback } from 'react';
import { useEmpresaSupabase } from '../../context/EmpresaSupabaseContext';
import { useOutletContext } from 'react-router-dom';
import {
  Users, Plus, Search, Trash2, X, Check, AlertTriangle, Loader2, UserCheck, Shield, Eye, EyeOff, Pencil
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ─── Modal Crear Colaborador ─────────────────────────────────────────────────
function ColaboradorModal({ onClose, onSaved, usuario = null }) {
  const supabase = useEmpresaSupabase();
  const [form, setForm] = useState({
    nombre: usuario ? usuario.nombre : '',
    email: usuario ? usuario.email : '',
    password: '',
    rol: usuario ? usuario.rol : 'vendedor',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const token = await getToken();
      const isEdit = !!usuario;
      const url = isEdit 
        ? `${API_URL}/api/auth/usuarios/${usuario.id}`
        : `${API_URL}/api/auth/usuarios`;
      
      const payload = { ...form };
      if (isEdit && !payload.password) {
        delete payload.password;
      }

      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      onSaved(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-zinc-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300">
              <Users size={15} />
            </div>
            <h2 className="text-neutral-900 dark:text-white font-semibold text-base">
              {usuario ? 'Editar Colaborador' : 'Nuevo Colaborador'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-zinc-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-white transition-all">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertTriangle size={15} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-red-650 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Nombre Completo *</label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
              placeholder="Ej: David Valdivia"
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-850 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Correo Electrónico *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              placeholder="colaborador@empresa.com"
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-850 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              {usuario ? 'Nueva Contraseña (Opcional)' : 'Contraseña de Acceso *'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required={!usuario}
                placeholder={usuario ? 'Dejar vacío para mantener actual' : 'Mínimo 6 caracteres'}
                minLength={6}
                className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-850 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white transition-all"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Rol en el Sistema *</label>
            <select
              value={form.rol}
              onChange={(e) => setForm({ ...form, rol: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-850 text-neutral-900 dark:text-white text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 transition-all"
            >
              <option value="vendedor">Vendedor (Solo gestionar stock e inventario)</option>
              <option value="admin">Administrador (Control total y configuración)</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2 border-t border-neutral-100 dark:border-zinc-800">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-zinc-800 text-neutral-600 dark:text-neutral-300 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-zinc-800/50 transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-sm font-semibold hover:bg-black dark:hover:bg-neutral-100 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {usuario ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal Confirmar Baja ───────────────────────────────────────────────────
function ConfirmDeleteModal({ usuario, onClose, onConfirm, deleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 border border-red-500/20 dark:border-red-950/20 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-500">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h2 className="text-neutral-900 dark:text-white font-bold text-lg">Dar de baja colaborador</h2>
            <p className="text-neutral-500 dark:text-neutral-450 text-sm mt-1">
              ¿Estás seguro de que deseas eliminar a <span className="text-neutral-900 dark:text-white font-semibold">"{usuario.nombre}"</span>? Perderá el acceso al inventario de manera permanente.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-zinc-800 text-neutral-600 dark:text-neutral-300 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-zinc-800/50 transition-all">
              Cancelar
            </button>
            <button onClick={onConfirm} disabled={deleting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-red-650 hover:bg-red-700 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Página de Colaboradores ──────────────────────────────────────────────────
export default function GestionTrabajadores() {
  const supabase = useEmpresaSupabase();
  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  const context = useOutletContext();
  const empresa = context?.empresa;
  const currentUser = context?.user;
  const handleCerrarSesion = context?.handleCerrarSesion;

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(true);

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/auth/usuarios`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 403) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setUsuarios(data.usuarios);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/auth/usuarios/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setDeleteTarget(null);
      fetchUsuarios();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = usuarios.filter((u) =>
    u.nombre.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-zinc-900 flex items-center justify-center text-neutral-400 dark:text-neutral-500 border border-neutral-200 dark:border-zinc-800">
          <Shield size={28} />
        </div>
        <h2 className="text-xl font-serif font-bold text-neutral-900 dark:text-white">Acceso Restringido</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-450 leading-relaxed">
          Solo los usuarios con rol de <strong className="text-neutral-800 dark:text-neutral-200">Administrador</strong> pueden ver y gestionar los colaboradores de la empresa.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-reveal">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">Colaboradores</h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5">
            {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} registrado{usuarios.length !== 1 ? 's' : ''} en {empresa?.nombre || 'la marca'}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 text-sm font-semibold transition-all shadow-md hover:shadow-lg whitespace-nowrap"
        >
          <Plus size={16} />
          Nuevo Colaborador
        </button>
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o correo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#fafafa] dark:bg-zinc-950 border border-transparent dark:border-zinc-800 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:border-neutral-900 dark:focus:border-white transition-all hover:border-[#e5e5e5] dark:hover:border-zinc-800"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-red-650 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Carga o lista */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-neutral-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users size={40} className="text-neutral-400 mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400 font-medium">
            {search ? 'No se encontraron resultados' : 'No hay colaboradores registrados'}
          </p>
          <p className="text-neutral-450 dark:text-neutral-500 text-sm mt-1">
            {search ? 'Prueba con otro término de búsqueda' : 'Registra el primer colaborador usando el botón superior'}
          </p>
        </div>
      ) : (
        /* Tabla de Colaboradores */
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 overflow-hidden shadow-xs">
          {/* Cabecera desktop */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-neutral-100 dark:border-zinc-800 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">
            <div className="col-span-4">Colaborador</div>
            <div className="col-span-4">Correo Electrónico</div>
            <div className="col-span-2 text-center">Rol</div>
            <div className="col-span-1 text-center">Fecha Ingreso</div>
            <div className="col-span-1 text-right">Acción</div>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-zinc-800">
            {filtered.map((usuario) => (
              <div key={usuario.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 py-4 hover:bg-neutral-50/50 dark:hover:bg-zinc-850/50 transition-colors items-center">
                {/* Nombre */}
                <div className="md:col-span-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-800 flex items-center justify-center text-neutral-700 dark:text-white font-bold text-sm shrink-0 shadow-xs">
                    {usuario.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-neutral-900 dark:text-white font-semibold text-sm truncate">{usuario.nombre}</p>
                    <span className="md:hidden inline-block px-2 py-0.5 rounded-full text-[9px] font-medium bg-neutral-100 dark:bg-zinc-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-zinc-750 uppercase">
                      {usuario.rol}
                    </span>
                  </div>
                </div>

                {/* Email */}
                <div className="md:col-span-4 flex items-center gap-2">
                  <span className="text-sm text-neutral-650 dark:text-neutral-300 truncate">{usuario.email}</span>
                </div>

                {/* Rol (desktop) */}
                <div className="hidden md:col-span-2 md:flex justify-center">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border ${
                    usuario.rol === 'admin'
                      ? 'bg-neutral-900 text-white border-transparent dark:bg-white dark:text-neutral-900'
                      : 'bg-neutral-50 dark:bg-zinc-950 text-neutral-600 dark:text-neutral-350 border-neutral-200 dark:border-zinc-800'
                  }`}>
                    {usuario.rol === 'admin' ? <Shield size={10} /> : <UserCheck size={10} />}
                    <span className="capitalize">{usuario.rol}</span>
                  </span>
                </div>

                {/* Fecha */}
                <div className="md:col-span-1 flex md:justify-center items-center gap-2">
                  <span className="text-neutral-400 dark:text-neutral-550 text-xs">{formatDate(usuario.created_at)}</span>
                </div>

                {/* Acción */}
                <div className="md:col-span-1 flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => setEditTarget(usuario)}
                    title="Editar colaborador"
                    className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-zinc-800 text-neutral-450 hover:text-black dark:hover:text-white transition-all"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(usuario)}
                    title="Dar de baja colaborador"
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-neutral-450 hover:text-red-500 transition-all"
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
      {isModalOpen && (
        <ColaboradorModal
          onClose={() => setIsModalOpen(false)}
          onSaved={() => { setIsModalOpen(false); fetchUsuarios(); }}
        />
      )}
      {editTarget && (
        <ColaboradorModal
          usuario={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={(formData) => {
            setEditTarget(null);
            fetchUsuarios();
            
            // Si el administrador se auto-edita
            if (editTarget.id === currentUser?.id) {
              const emailChanged = formData.email !== currentUser.email;
              const passwordChanged = !!formData.password;
              
              if (emailChanged || passwordChanged) {
                alert("Has actualizado tus credenciales. Debes iniciar sesión nuevamente.");
                if (handleCerrarSesion) {
                  handleCerrarSesion();
                }
              } else {
                // Solo cambió nombre/rol, refrescar para actualizar visualmente la sesión
                window.location.reload();
              }
            }
          }}
        />
      )}
      {deleteTarget && (
        <ConfirmDeleteModal
          usuario={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </div>
  );
}
