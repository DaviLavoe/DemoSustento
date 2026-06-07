import { useState, useEffect, useCallback } from 'react';
import { supabaseAdmin } from '../../config/supabaseAdmin';
import {
  Shield, Plus, Search, Trash2, X, Check, AlertTriangle, Loader2, Edit2
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function getToken() {
  const { data: { session } } = await supabaseAdmin.auth.getSession();
  return session?.access_token;
}

// ─── Componente Modal para Crear/Editar Super-Administrador ─────────────────────
function UsuarioModal({ onClose, onSaved, usuarioEditar = null }) {
  const [form, setForm] = useState({
    nombre: usuarioEditar?.nombre || '',
    email: usuarioEditar?.email || '',
    password: '',
    rol: 'superadmin',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const token = await getToken();
      const isEdit = !!usuarioEditar;
      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit
        ? `${API_URL}/api/superadmin/usuarios/${usuarioEditar.id}`
        : `${API_URL}/api/superadmin/usuarios`;

      const payload = { ...form };
      if (isEdit && !payload.password) {
        delete payload.password; // No enviar contraseña si está vacía en edición
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0d0d14] border border-white/10 rounded-2xl shadow-2xl shadow-violet-900/20 overflow-hidden">
        {/* Header modal */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
              <Shield size={15} className="text-violet-400" />
            </div>
            <h2 className="text-white font-semibold text-base">
              {usuarioEditar ? 'Editar Super-Admin' : 'Nuevo Super-Admin'}
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
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Nombre Completo *</label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
              placeholder="Ej: Javier Aurelio Paredes Pozo"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-white/8 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Correo Electrónico *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              placeholder="javier@ejemplo.com"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-white/8 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
              {usuarioEditar ? 'Nueva Contraseña (Opcional)' : 'Contraseña Temporal *'}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={!usuarioEditar}
              placeholder={usuarioEditar ? 'Dejar en blanco para conservar la actual' : 'Mínimo 6 caracteres'}
              minLength={6}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-white/8 transition-all"
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
              {usuarioEditar ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Componente Modal de Confirmación de Eliminación ────────────────────────
function ConfirmDeleteModal({ usuario, onClose, onConfirm, deleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[#0d0d14] border border-red-500/20 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <AlertTriangle size={24} className="text-red-400" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">Eliminar Super-Admin</h2>
            <p className="text-neutral-400 text-sm mt-1">
              Estás a punto de revocar los accesos de <span className="text-white font-semibold">"{usuario.nombre}"</span>. Esta acción no se puede deshacer y el usuario perderá el acceso de forma inmediata.
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

// ─── Página Principal de Gestión de Super-Admins ──────────────────────────────
export default function GestionUsuariosSuperAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalUsuario, setModalUsuario] = useState(null); // null | {} (nuevo) | usuario (editar)
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/superadmin/usuarios`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
    const fetchSessionAndData = async () => {
      try {
        const { data: { session } } = await supabaseAdmin.auth.getSession();
        if (session?.user) {
          setCurrentUserId(session.user.id);
        }
      } catch (err) {
        console.error('Error fetching session:', err);
      }
      await fetchUsuarios();
    };
    fetchSessionAndData();
  }, [fetchUsuarios]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/superadmin/usuarios/${deleteTarget.id}`, {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Cuentas del Equipo</h2>
          <p className="text-neutral-400 text-sm mt-0.5">
            {usuarios.length} super-administrador{usuarios.length !== 1 ? 'es' : ''} registrado{usuarios.length !== 1 ? 'es' : ''}
          </p>
        </div>
        <button
          onClick={() => setModalUsuario({})}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-900/30 whitespace-nowrap"
        >
          <Plus size={16} />
          Nuevo Super-Admin
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
        <input
          type="text"
          placeholder="Buscar por nombre o correo..."
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
          <Shield size={40} className="text-neutral-700 mb-4" />
          <p className="text-neutral-400 font-medium">
            {search ? 'No se encontraron resultados' : 'No hay usuarios registrados'}
          </p>
          <p className="text-neutral-600 text-sm mt-1">
            {search ? 'Prueba con otro término de búsqueda' : 'Registra la primera cuenta con el botón de arriba'}
          </p>
        </div>
      ) : (
        /* Tabla de usuarios */
        <div className="rounded-2xl bg-[#0d0d14] border border-white/5 overflow-hidden">
          {/* Cabecera de tabla */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 text-[11px] font-semibold text-neutral-500 uppercase tracking-widest">
            <div className="col-span-5">Super-Admin</div>
            <div className="col-span-4">Correo Electrónico</div>
            <div className="col-span-2">Fecha Registro</div>
            <div className="col-span-1 text-right">Acción</div>
          </div>

          <div className="divide-y divide-white/5">
            {filtered.map((usuario) => (
              <div key={usuario.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 py-4 hover:bg-white/3 transition-colors group items-center">
                {/* Nombre */}
                <div className="md:col-span-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/25 flex items-center justify-center text-violet-400 font-bold text-sm shrink-0 shadow-md">
                    {usuario.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-semibold text-sm truncate">{usuario.nombre}</p>
                      {usuario.id === currentUserId && (
                        <span className="px-1.5 py-0.5 rounded bg-violet-500/20 border border-violet-500/30 text-violet-400 text-[9px] font-bold uppercase tracking-wider">
                          Tú
                        </span>
                      )}
                    </div>
                    <span className="text-violet-400 text-[10px] font-mono uppercase">Rol: Super-Admin</span>
                  </div>
                </div>

                {/* Correo */}
                <div className="md:col-span-4 flex items-center gap-2">
                  <span className="text-sm text-neutral-300 truncate">{usuario.email}</span>
                </div>

                {/* Fecha */}
                <div className="md:col-span-2 flex items-center gap-2">
                  <span className="text-neutral-400 text-xs">{formatDate(usuario.created_at)}</span>
                </div>

                {/* Acciones */}
                <div className="md:col-span-1 flex items-center justify-end gap-1">
                  {/* Editar usuario */}
                  <button
                    onClick={() => setModalUsuario(usuario)}
                    title="Editar usuario"
                    className="p-2 rounded-lg hover:bg-white/8 text-neutral-500 hover:text-violet-400 transition-all"
                  >
                    <Edit2 size={14} />
                  </button>

                  {/* Eliminar usuario */}
                  {usuario.id === currentUserId ? (
                    <button
                      disabled
                      title="No puedes eliminar tu propia cuenta"
                      className="p-2 rounded-lg text-neutral-700 cursor-not-allowed opacity-40"
                    >
                      <Trash2 size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setDeleteTarget(usuario)}
                      title="Eliminar usuario"
                      className="p-2 rounded-lg hover:bg-white/8 text-neutral-500 hover:text-red-400 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modales */}
      {modalUsuario && (
        <UsuarioModal
          usuarioEditar={modalUsuario.id ? modalUsuario : null}
          onClose={() => setModalUsuario(null)}
          onSaved={() => { setModalUsuario(null); fetchUsuarios(); }}
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

