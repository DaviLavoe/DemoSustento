import { useState, useEffect, useCallback } from 'react';
import { supabaseAdmin } from '../../config/supabaseAdmin';
import {
  Building2, Plus, Search, ExternalLink, Edit2, Trash2,
  X, Check, AlertTriangle, Package, ShoppingCart, Users,
  Loader2, Globe, Phone, LogIn, UserPlus,
  MapPin, Mail, Info, Sparkles, Palette, Image, Eye, UploadCloud
} from 'lucide-react';

const Instagram = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size || 24}
    height={props.size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Facebook = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size || 24}
    height={props.size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function getToken() {
  const { data: { session } } = await supabaseAdmin.auth.getSession();
  return session?.access_token;
}

// ─── Componente Modal de Crear/Editar Empresa ───────────────────────────────
function EmpresaModal({ empresa, onClose, onSaved }) {
  const [activeTab, setActiveTab] = useState('general');
  const [form, setForm] = useState({
    nombre: empresa?.nombre || '',
    slug: empresa?.slug || '',
    color_primario: empresa?.color_primario || '#6d28d9',
    telefono_whatsapp: empresa?.telefono_whatsapp || '',
    logo_url: empresa?.logo_url || '',
    descripcion: empresa?.descripcion || '',
    direccion: empresa?.direccion || '',
    email_contacto: empresa?.email_contacto || '',
    banner_url: empresa?.banner_url || '',
    instagram_url: empresa?.instagram_url || '',
    facebook_url: empresa?.facebook_url || '',
    mensaje_bienvenida: empresa?.mensaje_bienvenida || '',
    activo: empresa?.activo !== undefined ? empresa.activo : true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [loadingLogo, setLoadingLogo] = useState(false);
  const [loadingBanner, setLoadingBanner] = useState(false);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecciona una imagen para el logotipo.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('El logotipo no debe superar los 2MB.');
      return;
    }

    setLoadingLogo(true);
    setError(null);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo_${Math.random().toString(36).substring(2, 12)}_${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from('productos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('productos')
        .getPublicUrl(filePath);

      setForm(f => ({ ...f, logo_url: publicUrl }));
    } catch (err) {
      console.error(err);
      setError(`Error al subir logo: ${err.message}`);
    } finally {
      setLoadingLogo(false);
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecciona una imagen para la portada.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('La portada no debe superar los 2MB.');
      return;
    }

    setLoadingBanner(true);
    setError(null);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `banner_${Math.random().toString(36).substring(2, 12)}_${Date.now()}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from('productos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('productos')
        .getPublicUrl(filePath);

      setForm(f => ({ ...f, banner_url: publicUrl }));
    } catch (err) {
      console.error(err);
      setError(`Error al subir portada: ${err.message}`);
    } finally {
      setLoadingBanner(false);
    }
  };

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
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0d0d14] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl shadow-violet-900/20 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header modal */}
        <div className="p-5 border-b border-slate-200 dark:border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-600/20 border border-violet-200 dark:border-violet-500/30 flex items-center justify-center">
              <Building2 size={15} className="text-violet-600 dark:text-violet-400" />
            </div>
            <h2 className="text-slate-900 dark:text-white font-semibold text-base">
              {empresa ? 'Editar Empresa' : 'Nueva Empresa'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-white/5 px-4 bg-slate-50/50 dark:bg-white/2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'general'
                ? 'border-violet-600 text-violet-600 dark:border-violet-500 dark:text-violet-400'
                : 'border-transparent text-slate-400 dark:text-neutral-500 hover:text-slate-800 dark:hover:text-neutral-300'
            }`}
          >
            <Info size={14} />
            General
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('design')}
            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'design'
                ? 'border-violet-600 text-violet-600 dark:border-violet-500 dark:text-violet-400'
                : 'border-transparent text-slate-400 dark:text-neutral-500 hover:text-slate-800 dark:hover:text-neutral-300'
            }`}
          >
            <Palette size={14} />
            Diseño & Portada
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cms')}
            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'cms'
                ? 'border-violet-600 text-violet-600 dark:border-violet-500 dark:text-violet-400'
                : 'border-transparent text-slate-400 dark:text-neutral-500 hover:text-slate-800 dark:hover:text-neutral-300'
            }`}
          >
            <Sparkles size={14} />
            Contenido CMS
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col justify-between">
          <div className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle size={15} className="text-red-400 mt-0.5 shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* TAB: GENERAL */}
            {activeTab === 'general' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Nombre de la Empresa *</label>
                  <input
                    type="text"
                    value={form.nombre}
                    onChange={handleNombreChange}
                    required
                    placeholder="Ej: Tech Store Lima"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-white dark:focus:bg-white/8 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Slug (URL) *</label>
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus-within:border-violet-500/50 focus-within:bg-white dark:focus-within:bg-white/8 transition-all">
                    <Globe size={14} className="text-slate-400 dark:text-neutral-500 shrink-0" />
                    <span className="text-slate-500 dark:text-neutral-500 text-sm font-mono">/catalogo/</span>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                      required
                      placeholder="tech-store-lima"
                      className="flex-1 bg-transparent text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5"><Phone size={12} /> WhatsApp</label>
                    <input
                      type="text"
                      value={form.telefono_whatsapp}
                      onChange={(e) => setForm((f) => ({ ...f, telefono_whatsapp: e.target.value }))}
                      placeholder="+51 987 654 321"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:border-violet-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5"><Mail size={12} /> Correo de Contacto</label>
                    <input
                      type="email"
                      value={form.email_contacto}
                      onChange={(e) => setForm((f) => ({ ...f, email_contacto: e.target.value }))}
                      placeholder="contacto@empresa.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:border-violet-500/50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5"><MapPin size={12} /> Dirección Física</label>
                  <input
                    type="text"
                    value={form.direccion}
                    onChange={(e) => setForm((f) => ({ ...f, direccion: e.target.value }))}
                    placeholder="Av. Larco 123, Miraflores, Lima"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:border-violet-500/50 transition-all"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/10 mt-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Estado de la Cuenta</p>
                    <p className="text-xs text-slate-500 dark:text-neutral-400">Si está inactiva/suspendida, el público no podrá acceder a su catálogo.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, activo: !f.activo }))}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      form.activo ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-neutral-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        form.activo ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* TAB: DESIGN */}
            {activeTab === 'design' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5"><Palette size={12} /> Color de Marca Primario</label>
                  <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus-within:border-violet-500/50 transition-all">
                    <input
                      type="color"
                      value={form.color_primario}
                      onChange={(e) => setForm((f) => ({ ...f, color_primario: e.target.value }))}
                      className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={form.color_primario}
                      onChange={(e) => setForm((f) => ({ ...f, color_primario: e.target.value }))}
                      placeholder="#6d28d9"
                      className="flex-1 bg-transparent text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5"><Image size={12} /> Logotipo de la Empresa</label>
                  <div className="space-y-2">
                    {form.logo_url ? (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl">
                        <img src={form.logo_url} alt="Logo" className="w-12 h-12 object-contain bg-white dark:bg-zinc-805 border border-slate-200 dark:border-white/5 rounded-lg shrink-0" />
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={form.logo_url}
                            onChange={(e) => setForm(f => ({ ...f, logo_url: e.target.value }))}
                            className="w-full bg-transparent text-xs text-slate-600 dark:text-neutral-450 focus:outline-none truncate"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setForm(f => ({ ...f, logo_url: '' }))}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all shrink-0"
                          title="Remover logotipo"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-white/10 hover:border-violet-500/40 bg-slate-50 dark:bg-white/2 hover:bg-slate-100/50 dark:hover:bg-white/5 rounded-xl p-4 cursor-pointer group transition-all h-20">
                          {loadingLogo ? (
                            <Loader2 className="animate-spin text-slate-505" size={16} />
                          ) : (
                            <UploadCloud className="text-slate-400 group-hover:text-violet-500 transition-colors" size={16} />
                          )}
                          <span className="text-[11px] font-semibold text-slate-600 dark:text-neutral-400 mt-1">
                            {loadingLogo ? 'Subiendo...' : 'Subir Logotipo'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={loadingLogo}
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </label>
                        <div className="flex flex-col justify-center">
                          <input
                            type="url"
                            value={form.logo_url}
                            onChange={(e) => setForm(f => ({ ...f, logo_url: e.target.value }))}
                            placeholder="O pega una URL..."
                            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 text-xs focus:outline-none focus:border-violet-500/50 transition-all"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5"><Image size={12} /> Portada / Banner (CMS)</label>
                  <div className="space-y-2">
                    {form.banner_url ? (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl">
                        <img src={form.banner_url} alt="Portada" className="w-20 h-12 object-cover bg-white dark:bg-zinc-805 border border-slate-200 dark:border-white/5 rounded-lg shrink-0" />
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={form.banner_url}
                            onChange={(e) => setForm(f => ({ ...f, banner_url: e.target.value }))}
                            className="w-full bg-transparent text-xs text-slate-600 dark:text-neutral-455 focus:outline-none truncate"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setForm(f => ({ ...f, banner_url: '' }))}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all shrink-0"
                          title="Remover portada"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-white/10 hover:border-violet-500/40 bg-slate-50 dark:bg-white/2 hover:bg-slate-100/50 dark:hover:bg-white/5 rounded-xl p-4 cursor-pointer group transition-all h-20">
                          {loadingBanner ? (
                            <Loader2 className="animate-spin text-slate-550" size={16} />
                          ) : (
                            <UploadCloud className="text-slate-400 group-hover:text-violet-500 transition-colors" size={16} />
                          )}
                          <span className="text-[11px] font-semibold text-slate-600 dark:text-neutral-400 mt-1">
                            {loadingBanner ? 'Subiendo...' : 'Subir Portada'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={loadingBanner}
                            onChange={handleBannerUpload}
                            className="hidden"
                          />
                        </label>
                        <div className="flex flex-col justify-center">
                          <input
                            type="url"
                            value={form.banner_url}
                            onChange={(e) => setForm(f => ({ ...f, banner_url: e.target.value }))}
                            placeholder="O pega una URL..."
                            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 text-xs focus:outline-none focus:border-violet-500/50 transition-all"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: CMS CONTENT */}
            {activeTab === 'cms' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Mensaje de Bienvenida</label>
                  <textarea
                    value={form.mensaje_bienvenida}
                    onChange={(e) => setForm((f) => ({ ...f, mensaje_bienvenida: e.target.value }))}
                    rows={2}
                    placeholder="Ej: ¡Bienvenidos a nuestra tienda virtual! Encuentra las mejores ofertas."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:border-violet-500/50 transition-all resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Descripción del Negocio</label>
                  <textarea
                    value={form.descripcion}
                    onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                    rows={3}
                    placeholder="Escribe una breve reseña de la empresa, historia o rubro principal..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:border-violet-500/50 transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5"><Instagram size={12} /> Instagram URL</label>
                    <input
                      type="url"
                      value={form.instagram_url}
                      onChange={(e) => setForm((f) => ({ ...f, instagram_url: e.target.value }))}
                      placeholder="https://instagram.com/usuario"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:border-violet-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5"><Facebook size={12} /> Facebook URL</label>
                    <input
                      type="url"
                      value={form.facebook_url}
                      onChange={(e) => setForm((f) => ({ ...f, facebook_url: e.target.value }))}
                      placeholder="https://facebook.com/pagina"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:border-violet-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-white/5 mt-6 shrink-0">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-650 dark:text-neutral-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={saving || loadingLogo || loadingBanner}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-900/30">
              {saving || loadingLogo || loadingBanner ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {empresa ? 'Guardar cambios' : 'Crear empresa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal para crear usuario de empresa ──────────────────────────────────────
function UsuarioEmpresaModal({ empresa, onClose }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'admin' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/superadmin/empresas/${empresa.id}/usuarios`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setUsuarios(data.usuarios);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [empresa.id]);

  useEffect(() => { fetchUsuarios(); }, [fetchUsuarios]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/superadmin/empresas/${empresa.id}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setSuccess(data.message);
      setForm({ nombre: '', email: '', password: '', rol: 'admin' });
      fetchUsuarios();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId) => {
    setDeleting(userId);
    try {
      const token = await getToken();
      await fetch(`${API_URL}/api/superadmin/empresas/${empresa.id}/usuarios/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsuarios();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const rolColors = {
    admin: { bg: 'bg-violet-50 dark:bg-violet-500/15', text: 'text-violet-700 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-500/30', label: 'Admin' },
    vendedor: { bg: 'bg-emerald-50 dark:bg-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/30', label: 'Vendedor' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white dark:bg-[#0d0d14] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl shadow-violet-900/20 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-600/20 border border-violet-200 dark:border-violet-500/30 flex items-center justify-center">
              <Users size={15} className="text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h2 className="text-slate-900 dark:text-white font-semibold text-base">Usuarios de Empresa</h2>
              <p className="text-slate-500 dark:text-neutral-400 text-xs mt-0.5">{empresa.nombre}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white transition-all">
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Formulario crear usuario */}
          <form onSubmit={handleCreate} className="p-6 border-b border-slate-200 dark:border-white/5 space-y-3">
            <p className="text-xs font-semibold text-slate-650 dark:text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <UserPlus size={12} /> Crear Nueva Cuenta
            </p>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}
            {success && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <Check size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-emerald-300 text-sm">{success}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-slate-500 dark:text-neutral-500 uppercase tracking-wider">Nombre *</label>
                <input
                  type="text" required value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej: Juan Pérez"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-250 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-neutral-550 text-sm focus:outline-none focus:border-violet-500/50 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-slate-500 dark:text-neutral-500 uppercase tracking-wider">Rol *</label>
                <select
                  value={form.rol}
                  onChange={(e) => setForm({ ...form, rol: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-250 dark:border-white/10 text-slate-800 dark:text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all appearance-none"
                >
                  <option value="admin" className="bg-white dark:bg-[#0d0d14] text-slate-850 dark:text-white">Admin</option>
                  <option value="vendedor" className="bg-white dark:bg-[#0d0d14] text-slate-850 dark:text-white">Vendedor</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-slate-500 dark:text-neutral-500 uppercase tracking-wider">Correo *</label>
              <input
                type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="usuario@empresa.com"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-250 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-neutral-550 text-sm focus:outline-none focus:border-violet-500/50 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-slate-500 dark:text-neutral-500 uppercase tracking-wider">Contraseña *</label>
              <input
                type="password" required value={form.password} minLength={6}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-250 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-neutral-550 text-sm focus:outline-none focus:border-violet-500/50 transition-all"
              />
            </div>
            <button
              type="submit" disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-violet-900/30"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
              Crear Usuario
            </button>
          </form>

          {/* Lista de usuarios existentes */}
          <div className="p-6 space-y-3">
            <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-3">Cuentas Actuales ({usuarios.length})</p>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 size={22} className="animate-spin text-violet-400" />
              </div>
            ) : usuarios.length === 0 ? (
              <div className="text-center py-8">
                <Users size={32} className="text-slate-400 dark:text-neutral-700 mx-auto mb-2" />
                <p className="text-slate-550 dark:text-neutral-500 text-sm">Sin usuarios registrados</p>
              </div>
            ) : (
              <div className="space-y-2">
                {usuarios.map((u) => {
                  const rc = rolColors[u.rol] || rolColors.vendedor;
                  return (
                    <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/3 border border-slate-200 dark:border-white/5 group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-600/10 border border-violet-200 dark:border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold text-xs shrink-0">
                          {u.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-slate-900 dark:text-white text-sm font-medium truncate">{u.nombre}</p>
                          <p className="text-slate-500 dark:text-neutral-500 text-xs truncate">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${rc.bg} ${rc.text} ${rc.border}`}>
                          {rc.label}
                        </span>
                        <button
                          onClick={() => handleDelete(u.id)}
                          disabled={deleting === u.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 dark:text-neutral-600 hover:text-red-650 hover:text-red-400 dark:hover:text-red-400 transition-all"
                          title="Eliminar usuario"
                        >
                          {deleting === u.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Componente Modal Ficha Detalles del Tenant / CMS ───────────────────────
function EmpresaDetalleModal({ empresa, onClose }) {
  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0d0d14] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl shadow-violet-900/20 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Banner/Portada */}
        <div className="h-32 w-full relative bg-slate-100 dark:bg-slate-800 shrink-0">
          {empresa.banner_url ? (
            <img src={empresa.banner_url} alt="Portada" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-violet-650 to-indigo-600" />
          )}
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full bg-black/45 hover:bg-black/60 text-white backdrop-blur-sm transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Logo Overlapping Banner */}
        <div className="px-6 relative -mt-10 shrink-0 flex items-end justify-between">
          <div
            className="w-20 h-20 rounded-2xl border-4 border-white dark:border-[#0d0d14] shadow-md flex items-center justify-center text-white font-bold text-2xl"
            style={{ backgroundColor: empresa.color_primario || '#6d28d9' }}
          >
            {empresa.logo_url ? (
              <img src={empresa.logo_url} alt="Logo" className="w-full h-full object-contain rounded-xl" />
            ) : (
              empresa.nombre.toUpperCase().charAt(0)
            )}
          </div>
          <div className="pb-1">
            {empresa.activo ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Acreditada / Activa
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Suspendida
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Header Info */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{empresa.nombre}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-slate-500 dark:text-neutral-500 text-xs font-mono">/{empresa.slug}</span>
              <span className="text-slate-400 dark:text-neutral-650 text-xs">•</span>
              <span className="text-slate-550 dark:text-neutral-400 text-xs">Registrada: {formatDate(empresa.created_at)}</span>
            </div>
          </div>

          {/* Bienvenida & Descripción */}
          {(empresa.mensaje_bienvenida || empresa.descripcion) && (
            <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-white/3 border border-slate-150 dark:border-white/5">
              {empresa.mensaje_bienvenida && (
                <p className="text-sm italic font-medium text-slate-800 dark:text-violet-300">
                  "{empresa.mensaje_bienvenida}"
                </p>
              )}
              {empresa.descripcion && (
                <p className="text-sm text-slate-650 dark:text-neutral-350 whitespace-pre-line leading-relaxed">
                  {empresa.descripcion}
                </p>
              )}
            </div>
          )}

          {/* Grid de Metricas */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/3 border border-slate-200 dark:border-white/5 text-center">
              <Package size={16} className="text-violet-500 mx-auto mb-1.5" />
              <p className="text-lg font-bold text-slate-900 dark:text-white">{empresa.total_productos ?? 0}</p>
              <p className="text-[10px] text-slate-500 dark:text-neutral-400 font-semibold uppercase tracking-wider">Productos</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/3 border border-slate-200 dark:border-white/5 text-center">
              <ShoppingCart size={16} className="text-emerald-500 mx-auto mb-1.5" />
              <p className="text-lg font-bold text-slate-900 dark:text-white">{empresa.total_pedidos ?? 0}</p>
              <p className="text-[10px] text-slate-500 dark:text-neutral-400 font-semibold uppercase tracking-wider">Pedidos</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/3 border border-slate-200 dark:border-white/5 text-center">
              <Users size={16} className="text-blue-500 mx-auto mb-1.5" />
              <p className="text-lg font-bold text-slate-900 dark:text-white">{empresa.total_clientes ?? 0}</p>
              <p className="text-[10px] text-slate-500 dark:text-neutral-400 font-semibold uppercase tracking-wider">Clientes</p>
            </div>
          </div>

          {/* Contacto & Ubicación */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-550 dark:text-neutral-400 uppercase tracking-widest">Información de Contacto</h3>
            <div className="space-y-2.5">
              {empresa.telefono_whatsapp && (
                <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-neutral-350">
                  <Phone size={15} className="text-slate-400 dark:text-neutral-550 shrink-0" />
                  <span>{empresa.telefono_whatsapp}</span>
                </div>
              )}
              {empresa.email_contacto && (
                <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-neutral-350">
                  <Mail size={15} className="text-slate-400 dark:text-neutral-550 shrink-0" />
                  <span>{empresa.email_contacto}</span>
                </div>
              )}
              {empresa.direccion && (
                <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-neutral-355">
                  <MapPin size={15} className="text-slate-400 dark:text-neutral-550 shrink-0" />
                  <span>{empresa.direccion}</span>
                </div>
              )}
            </div>
          </div>

          {/* Redes Sociales */}
          {(empresa.instagram_url || empresa.facebook_url) && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-550 dark:text-neutral-400 uppercase tracking-widest">Redes Sociales</h3>
              <div className="flex gap-3">
                {empresa.instagram_url && (
                  <a
                    href={empresa.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 text-sm text-slate-650 dark:text-neutral-300 transition-all"
                  >
                    <Instagram size={15} className="text-pink-500" />
                    <span>Instagram</span>
                  </a>
                )}
                {empresa.facebook_url && (
                  <a
                    href={empresa.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 text-sm text-slate-650 dark:text-neutral-300 transition-all"
                  >
                    <Facebook size={15} className="text-blue-500" />
                    <span>Facebook</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-white/2 border-t border-slate-200 dark:border-white/5 flex gap-3 shrink-0">
          <a
            href={`/catalogo/${empresa.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 rounded-xl border border-slate-250 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-neutral-350 text-sm font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <ExternalLink size={14} />
            Ver Catálogo
          </a>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold flex items-center justify-center transition-all shadow-md shadow-violet-900/10"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDeleteModal({ empresa, onClose, onConfirm, deleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-[#0d0d14] border border-red-200 dark:border-red-500/20 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <AlertTriangle size={24} className="text-red-400" />
          </div>
          <div>
            <h2 className="text-slate-900 dark:text-white font-bold text-lg">Eliminar empresa</h2>
            <p className="text-slate-650 dark:text-neutral-400 text-sm mt-1">
              Estás a punto de eliminar <span className="text-slate-900 dark:text-white font-semibold">"{empresa.nombre}"</span>. Esta acción eliminará también todos sus productos, pedidos y clientes de manera permanente.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-neutral-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
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
  const [detalleEmpresa, setDetalleEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalEmpresa, setModalEmpresa] = useState(null); // null | {} (nueva) | empresa (editar)
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [gestionUsuariosEmpresa, setGestionUsuariosEmpresa] = useState(null); // empresa seleccionada para gestionar usuarios

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
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Gestión de Empresas</h2>
          <p className="text-slate-500 dark:text-neutral-400 text-sm mt-0.5">
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
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-500" />
        <input
          type="text"
          placeholder="Buscar por nombre o slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/8 text-slate-800 dark:text-white placeholder-slate-450 dark:placeholder-neutral-500 text-sm focus:outline-none focus:border-violet-500/40 focus:bg-white dark:focus:bg-white/8 transition-all shadow-sm dark:shadow-none"
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
          <Building2 size={40} className="text-slate-300 dark:text-neutral-700 mb-4" />
          <p className="text-slate-550 dark:text-neutral-400 font-medium">
            {search ? 'No se encontraron resultados' : 'No hay empresas registradas'}
          </p>
          <p className="text-slate-400 dark:text-neutral-600 text-sm mt-1">
            {search ? 'Prueba con otro término de búsqueda' : 'Crea la primera empresa con el botón de arriba'}
          </p>
        </div>
      ) : (
        /* Tabla de empresas */
        <div className="rounded-2xl bg-white dark:bg-[#0d0d14] border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
          {/* Cabecera de tabla (solo desktop) */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-200 dark:border-white/5 text-[11px] font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-widest">
            <div className="col-span-4">Empresa</div>
            <div className="col-span-2 text-center">Productos</div>
            <div className="col-span-2 text-center">Pedidos</div>
            <div className="col-span-2 text-center">Clientes</div>
            <div className="col-span-2 text-right">Acciones</div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {filtered.map((empresa) => (
              <div key={empresa.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 py-4 hover:bg-slate-50/50 dark:hover:bg-white/3 transition-colors group items-center">
                {/* Nombre + slug */}
                <div
                  className="md:col-span-4 flex items-center gap-3 cursor-pointer group/item"
                  onClick={() => setDetalleEmpresa(empresa)}
                  title="Ver detalles del CMS"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md group-hover/item:scale-105 transition-all"
                    style={{ backgroundColor: empresa.color_primario || '#6d28d9' }}
                  >
                    {empresa.logo_url
                      ? <img src={empresa.logo_url} alt="" className="w-full h-full object-contain rounded-xl" />
                      : empresa.nombre.charAt(0).toUpperCase()
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-slate-900 dark:text-white font-semibold text-sm truncate group-hover/item:text-violet-600 dark:group-hover/item:text-violet-405 transition-colors flex items-center gap-2">
                      {empresa.nombre}
                      {empresa.activo ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Activa" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" title="Suspendida" />
                      )}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-slate-500 dark:text-neutral-500 text-[11px] font-mono">/{empresa.slug}</span>
                      <span className="text-[10px] text-slate-405 dark:text-neutral-600">·</span>
                      <span className="text-[10px] text-slate-405 dark:text-neutral-600">{formatDate(empresa.created_at)}</span>
                      <span className="text-[10px] text-slate-405 dark:text-neutral-600">·</span>
                      {empresa.activo ? (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-450 font-medium">Activa</span>
                      ) : (
                        <span className="text-[10px] text-rose-600 dark:text-rose-455 font-medium">Suspendida</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Métricas */}
                <div className="md:col-span-2 flex md:justify-center items-center gap-2">
                  <Package size={13} className="text-slate-400 dark:text-neutral-500 md:hidden" />
                  <span className="text-sm font-semibold text-slate-800 dark:text-white">{empresa.total_productos}</span>
                  <span className="text-slate-500 dark:text-neutral-500 text-xs md:hidden">productos</span>
                </div>
                <div className="md:col-span-2 flex md:justify-center items-center gap-2">
                  <ShoppingCart size={13} className="text-slate-400 dark:text-neutral-500 md:hidden" />
                  <span className="text-sm font-semibold text-slate-800 dark:text-white">{empresa.total_pedidos}</span>
                  <span className="text-slate-500 dark:text-neutral-500 text-xs md:hidden">pedidos</span>
                </div>
                <div className="md:col-span-2 flex md:justify-center items-center gap-2">
                  <Users size={13} className="text-slate-400 dark:text-neutral-500 md:hidden" />
                  <span className="text-sm font-semibold text-slate-800 dark:text-white">{empresa.total_clientes}</span>
                  <span className="text-slate-500 dark:text-neutral-500 text-xs md:hidden">clientes</span>
                </div>

                {/* Acciones */}
                <div className="md:col-span-2 flex items-center gap-2 md:justify-end">
                  {/* Ver ficha de detalles del CMS */}
                  <button
                    onClick={() => setDetalleEmpresa(empresa)}
                    title="Ver detalles de la empresa (Ficha CMS)"
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/8 text-slate-400 dark:text-neutral-500 hover:text-violet-500 dark:hover:text-violet-450 transition-all"
                  >
                    <Eye size={14} />
                  </button>
                  {/* Ver catálogo público */}
                  <a
                    href={`/catalogo/${empresa.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Ver catálogo público"
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/8 text-slate-400 dark:text-neutral-500 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all"
                  >
                    <ExternalLink size={14} />
                  </a>
                  {/* Ir al login del inventario de esta empresa */}
                  <a
                    href={`/login/${empresa.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Ir al login de ${empresa.nombre}`}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/8 text-slate-400 dark:text-neutral-500 hover:text-amber-500 dark:hover:text-amber-400 transition-all"
                  >
                    <LogIn size={14} />
                  </a>
                  {/* Gestionar usuarios de esta empresa */}
                  <button
                    onClick={() => setGestionUsuariosEmpresa(empresa)}
                    title={`Gestionar usuarios de ${empresa.nombre}`}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/8 text-slate-400 dark:text-neutral-500 hover:text-blue-500 dark:hover:text-blue-400 transition-all"
                  >
                    <Users size={14} />
                  </button>
                  {/* Editar empresa */}
                  <button
                    onClick={() => setModalEmpresa(empresa)}
                    title="Editar empresa"
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/8 text-slate-400 dark:text-neutral-500 hover:text-violet-500 dark:hover:text-violet-400 transition-all"
                  >
                    <Edit2 size={14} />
                  </button>
                  {/* Eliminar empresa */}
                  <button
                    onClick={() => setDeleteTarget(empresa)}
                    title="Eliminar empresa"
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/8 text-slate-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400 transition-all"
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
      {gestionUsuariosEmpresa && (
        <UsuarioEmpresaModal
          empresa={gestionUsuariosEmpresa}
          onClose={() => setGestionUsuariosEmpresa(null)}
        />
      )}
      {detalleEmpresa && (
        <EmpresaDetalleModal
          empresa={detalleEmpresa}
          onClose={() => setDetalleEmpresa(null)}
        />
      )}
    </div>
  );
}
