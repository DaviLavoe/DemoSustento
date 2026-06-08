import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Settings, Phone, Palette, HelpCircle, UploadCloud, Loader2, CheckCircle, Trash2, ShieldAlert, MapPin, Mail, Sparkles, Image, Globe, CreditCard } from 'lucide-react';
import { useEmpresaSupabase } from '../../context/EmpresaSupabaseContext';
import { API_BASE_URL } from '../../config/api';

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

export default function Configuracion() {
  // Cliente Supabase aislado de la empresa activa
  const supabase = useEmpresaSupabase();
  const context = useOutletContext();
  const empresa = context?.empresa;
  const setEmpresa = context?.setEmpresa || (() => {});
  const [nombre, setNombre] = useState('');
  const [colorPrimario, setColorPrimario] = useState('#1a1a1a');
  const [telefonoWhatsapp, setTelefonoWhatsapp] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [direccion, setDireccion] = useState('');
  const [emailContacto, setEmailContacto] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [mensajeBienvenida, setMensajeBienvenida] = useState('');
  const [metodosPago, setMetodosPago] = useState(["visa", "mastercard", "bcp", "bbva", "interbank"]);
  
  const [loadingLogo, setLoadingLogo] = useState(false);
  const [loadingBanner, setLoadingBanner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Cargar datos iniciales de la empresa cuando esté disponible
  useEffect(() => {
    if (empresa) {
      setNombre(empresa.nombre || '');
      setColorPrimario(empresa.color_primario || '#1a1a1a');
      setTelefonoWhatsapp(empresa.telefono_whatsapp || '');
      setLogoUrl(empresa.logo_url || '');
      setDescripcion(empresa.descripcion || '');
      setDireccion(empresa.direccion || '');
      setEmailContacto(empresa.email_contacto || '');
      setBannerUrl(empresa.banner_url || '');
      setInstagramUrl(empresa.instagram_url || '');
      setFacebookUrl(empresa.facebook_url || '');
      setMensajeBienvenida(empresa.mensaje_bienvenida || '');
      setMetodosPago(empresa.metodos_pago || ["visa", "mastercard", "bcp", "bbva", "interbank"]);
    }
  }, [empresa]);

  // Manejo de la subida del logotipo
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo (solo imágenes) y tamaño (max 2MB)
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecciona un archivo de imagen válido.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('El tamaño del logo no debe superar los 2MB.');
      return;
    }

    setLoadingLogo(true);
    setError(null);
    setSuccess(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo_${Math.random().toString(36).substring(2, 12)}_${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      // Subir archivo al bucket de Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('productos') // Reutilizamos el bucket productos configurado
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('productos')
        .getPublicUrl(filePath);

      setLogoUrl(publicUrl);
      setSuccess('Logotipo subido. Guarda los cambios para aplicar en tu catálogo.');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      console.error('Error al subir logo:', err);
      setError(`Error al cargar logotipo: ${err.message}`);
    } finally {
      setLoadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl('');
    setSuccess('Logotipo removido. Guarda los cambios para guardar la configuración.');
    setTimeout(() => setSuccess(null), 4000);
  };

  // Manejo de la subida del banner
  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecciona un archivo de imagen válido.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('El tamaño del banner no debe superar los 2MB.');
      return;
    }

    setLoadingBanner(true);
    setError(null);
    setSuccess(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `banner_${Math.random().toString(36).substring(2, 12)}_${Date.now()}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('productos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('productos')
        .getPublicUrl(filePath);

      setBannerUrl(publicUrl);
      setSuccess('Portada subida. Guarda los cambios para aplicar en tu catálogo.');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      console.error('Error al subir banner:', err);
      setError(`Error al cargar portada: ${err.message}`);
    } finally {
      setLoadingBanner(false);
    }
  };

  const handleRemoveBanner = () => {
    setBannerUrl('');
    setSuccess('Portada removida. Guarda los cambios para guardar la configuración.');
    setTimeout(() => setSuccess(null), 4000);
  };

  // Enviar configuración al Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError('El nombre de la marca es obligatorio.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sesión expirada. Vuelve a iniciar sesión.');

      const response = await fetch(`${API_BASE_URL}/api/auth/empresa`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          nombre: nombre.trim(),
          color_primario: colorPrimario,
          telefono_whatsapp: telefonoWhatsapp.trim() || null,
          logo_url: logoUrl || null,
          descripcion: descripcion.trim() || null,
          direccion: direccion.trim() || null,
          email_contacto: emailContacto.trim() || null,
          banner_url: bannerUrl || null,
          instagram_url: instagramUrl.trim() || null,
          facebook_url: facebook_url.trim() || null,
          mensaje_bienvenida: mensajeBienvenida.trim() || null,
          metodos_pago: metodosPago
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Error al guardar la configuración');
      }

      if (resData.success && resData.empresa) {
        setEmpresa(resData.empresa); // Actualización en tiempo real del layout lateral
        setSuccess('¡Configuración de catálogo guardada con éxito!');
        setTimeout(() => setSuccess(null), 4000);
      }
    } catch (err) {
      console.error('Error al guardar configuración:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-reveal max-w-3xl">
      
      {/* Alertas Flotantes / Notificaciones */}
      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-sm rounded-xl flex items-center gap-3">
          <CheckCircle size={18} className="text-emerald-600 dark:text-emerald-500 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm rounded-xl flex items-center gap-3">
          <ShieldAlert size={18} className="text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-8 bg-white dark:bg-zinc-900 border border-[#e5e5e5] dark:border-zinc-800 rounded-2xl shadow-xs space-y-6">
        
        {/* Cabecera del Panel */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#fafafa] dark:bg-zinc-950 border border-[#e5e5e5] dark:border-zinc-800 flex items-center justify-center text-[#1a1a1a] dark:text-white">
            <Settings size={22} />
          </div>
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-bold text-[#1a1a1a] dark:text-white">Configuración del Catálogo</h2>
            <p className="text-sm text-[#666666] dark:text-neutral-400">Define la identidad de tu vitrina digital y los datos de contacto para tus pedidos de WhatsApp.</p>
          </div>
        </div>

        <div className="border-t border-[#e5e5e5] dark:border-zinc-800 pt-6 space-y-8">
          
          {/* Sección 1: Apariencia & Branding */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-2">
              <Palette size={14} />
              Apariencia & Branding
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Color Primario */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#666666] dark:text-neutral-450">Color Primario del Catálogo</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={colorPrimario}
                    onChange={(e) => setColorPrimario(e.target.value)}
                    className="w-11 h-11 border border-[#e5e5e5] dark:border-zinc-800 rounded-xl cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={colorPrimario}
                    onChange={(e) => setColorPrimario(e.target.value)}
                    placeholder="#1A1A1A"
                    maxLength="7"
                    className="flex-1 px-4 py-2.5 bg-[#fafafa] dark:bg-zinc-950 border border-transparent dark:border-zinc-800 rounded-xl text-sm text-[#1a1a1a] dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:border-black dark:focus:border-white transition-all hover:border-[#e5e5e5] dark:hover:border-zinc-800"
                  />
                </div>
              </div>
              
              {/* Nombre de la Marca */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#666666] dark:text-neutral-450">Nombre de la Marca *</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Tech Store Lima"
                  className="px-4 py-2.5 bg-[#fafafa] dark:bg-zinc-950 border border-transparent dark:border-zinc-800 rounded-xl text-sm text-[#1a1a1a] dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:border-black dark:focus:border-white transition-all hover:border-[#e5e5e5] dark:hover:border-zinc-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Carga del Logotipo de la Empresa */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#666666] dark:text-neutral-450">Logotipo de la Marca</label>
                
                {logoUrl ? (
                  <div className="flex items-center gap-4 p-4 bg-[#fafafa] dark:bg-zinc-950 border border-[#e5e5e5] dark:border-zinc-800 rounded-2xl">
                    <img 
                      src={logoUrl} 
                      alt="Logo Empresa" 
                      className="w-16 h-16 rounded-xl object-contain border border-[#e5e5e5] dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 truncate">logotipo_activo.png</p>
                      <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">Logo en vitrina digital</p>
                    </div>
                    <button 
                      type="button"
                      onClick={handleRemoveLogo}
                      className="p-2 text-neutral-400 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                      title="Remover logotipo"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border border-dashed border-[#e5e5e5] dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 bg-[#fafafa] dark:bg-zinc-950 hover:bg-[#fafafa]/50 dark:hover:bg-zinc-900/50 rounded-2xl p-6 cursor-pointer group transition-all h-32">
                    {loadingLogo ? (
                      <Loader2 className="animate-spin text-zinc-500 mb-2" size={24} />
                    ) : (
                      <UploadCloud className="text-zinc-400 group-hover:text-zinc-605 dark:group-hover:text-neutral-250 mb-1.5 transition-colors" size={24} />
                    )}
                    <span className="text-xs font-semibold text-zinc-650 dark:text-neutral-400 group-hover:text-zinc-850 dark:group-hover:text-neutral-300">
                      {loadingLogo ? 'Subiendo logotipo...' : 'Sube un logotipo'}
                    </span>
                    <span className="text-[10px] text-zinc-400 dark:text-neutral-500 mt-1">PNG, JPG o WEBP (Max. 2MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={loadingLogo}
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Carga del Banner/Portada de la Empresa */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#666666] dark:text-neutral-450">Portada / Banner de Catálogo</label>
                
                {bannerUrl ? (
                  <div className="flex items-center gap-4 p-4 bg-[#fafafa] dark:bg-zinc-950 border border-[#e5e5e5] dark:border-zinc-800 rounded-2xl">
                    <img 
                      src={bannerUrl} 
                      alt="Banner Empresa" 
                      className="w-16 h-16 rounded-xl object-cover border border-[#e5e5e5] dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 truncate">portada_activa.png</p>
                      <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">Banner de portada superior</p>
                    </div>
                    <button 
                      type="button"
                      onClick={handleRemoveBanner}
                      className="p-2 text-neutral-400 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                      title="Remover portada"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border border-dashed border-[#e5e5e5] dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 bg-[#fafafa] dark:bg-zinc-950 hover:bg-[#fafafa]/50 dark:hover:bg-zinc-900/50 rounded-2xl p-6 cursor-pointer group transition-all h-32">
                    {loadingBanner ? (
                      <Loader2 className="animate-spin text-zinc-500 mb-2" size={24} />
                    ) : (
                      <UploadCloud className="text-zinc-400 group-hover:text-zinc-605 dark:group-hover:text-neutral-250 mb-1.5 transition-colors" size={24} />
                    )}
                    <span className="text-xs font-semibold text-zinc-650 dark:text-neutral-400 group-hover:text-zinc-855 dark:group-hover:text-neutral-300">
                      {loadingBanner ? 'Subiendo portada...' : 'Sube una portada'}
                    </span>
                    <span className="text-[10px] text-zinc-400 dark:text-neutral-500 mt-1">PNG, JPG o WEBP (Max. 2MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={loadingBanner}
                      onChange={handleBannerUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Sección 2: Datos de Contacto & Ubicación */}
          <div className="space-y-4 pt-4 border-t border-[#e5e5e5] dark:border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-2">
              <MapPin size={14} />
              Datos de Contacto & Ubicación
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* WhatsApp */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#666666] dark:text-neutral-450 flex items-center gap-1.5"><Phone size={11} /> WhatsApp de Pedidos</label>
                <input
                  type="tel"
                  value={telefonoWhatsapp}
                  onChange={(e) => setTelefonoWhatsapp(e.target.value)}
                  placeholder="Ej. +51987654321"
                  className="px-4 py-2.5 bg-[#fafafa] dark:bg-zinc-950 border border-transparent dark:border-zinc-800 rounded-xl text-sm text-[#1a1a1a] dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:border-black dark:focus:border-white transition-all hover:border-[#e5e5e5] dark:hover:border-zinc-800"
                />
              </div>

              {/* Correo Electrónico */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#666666] dark:text-neutral-450 flex items-center gap-1.5"><Mail size={11} /> Correo Electrónico Público</label>
                <input
                  type="email"
                  value={emailContacto}
                  onChange={(e) => setEmailContacto(e.target.value)}
                  placeholder="Ej. contacto@empresa.com"
                  className="px-4 py-2.5 bg-[#fafafa] dark:bg-zinc-950 border border-transparent dark:border-zinc-800 rounded-xl text-sm text-[#1a1a1a] dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:border-black dark:focus:border-white transition-all hover:border-[#e5e5e5] dark:hover:border-zinc-800"
                />
              </div>
            </div>

            {/* Dirección */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#666666] dark:text-neutral-450 flex items-center gap-1.5"><MapPin size={11} /> Dirección de la Tienda</label>
              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Ej. Av. Larco 123, Miraflores, Lima"
                className="px-4 py-2.5 bg-[#fafafa] dark:bg-zinc-950 border border-transparent dark:border-zinc-800 rounded-xl text-sm text-[#1a1a1a] dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:border-black dark:focus:border-white transition-all hover:border-[#e5e5e5] dark:hover:border-zinc-800"
              />
            </div>
          </div>

          {/* Sección 3: Redes Sociales */}
          <div className="space-y-4 pt-4 border-t border-[#e5e5e5] dark:border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-2">
              <Globe size={14} />
              Redes Sociales
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Instagram */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#666666] dark:text-neutral-450 flex items-center gap-1.5"><Instagram size={11} /> Instagram URL</label>
                <input
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/tu_marca"
                  className="px-4 py-2.5 bg-[#fafafa] dark:bg-zinc-950 border border-transparent dark:border-zinc-800 rounded-xl text-sm text-[#1a1a1a] dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:border-black dark:focus:border-white transition-all hover:border-[#e5e5e5] dark:hover:border-zinc-800"
                />
              </div>

              {/* Facebook */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#666666] dark:text-neutral-450 flex items-center gap-1.5"><Facebook size={11} /> Facebook URL</label>
                <input
                  type="url"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="https://facebook.com/tu_marca"
                  className="px-4 py-2.5 bg-[#fafafa] dark:bg-zinc-950 border border-transparent dark:border-zinc-800 rounded-xl text-sm text-[#1a1a1a] dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:border-black dark:focus:border-white transition-all hover:border-[#e5e5e5] dark:hover:border-zinc-800"
                />
              </div>
            </div>
          </div>

          {/* Sección 4: Contenido del Catálogo (CMS) */}
          <div className="space-y-4 pt-4 border-t border-[#e5e5e5] dark:border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-2">
              <Sparkles size={14} />
              Contenido del Catálogo
            </h3>

            {/* Mensaje de Bienvenida */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#666666] dark:text-neutral-450">Mensaje de Bienvenida</label>
              <input
                type="text"
                value={mensajeBienvenida}
                onChange={(e) => setMensajeBienvenida(e.target.value)}
                placeholder="¡Bienvenidos a nuestra vitrina oficial! Encuentra productos únicos."
                className="px-4 py-2.5 bg-[#fafafa] dark:bg-zinc-950 border border-transparent dark:border-zinc-800 rounded-xl text-sm text-[#1a1a1a] dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:border-black dark:focus:border-white transition-all hover:border-[#e5e5e5] dark:hover:border-zinc-800"
              />
            </div>

            {/* Descripción */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#666666] dark:text-neutral-450">Descripción del Negocio</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                placeholder="Somos una marca líder dedicada a brindar la mejor calidad en tecnología, ropa, calzado, etc..."
                className="px-4 py-2.5 bg-[#fafafa] dark:bg-zinc-950 border border-transparent dark:border-zinc-800 rounded-xl text-sm text-[#1a1a1a] dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:border-black dark:focus:border-white transition-all hover:border-[#e5e5e5] dark:hover:border-zinc-800 resize-none"
              />
            </div>
          </div>
 
          {/* Sección 5: Métodos de Pago Aceptados */}
          <div className="space-y-4 pt-4 border-t border-[#e5e5e5] dark:border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-2">
              <CreditCard size={14} />
              Métodos de Pago Aceptados
            </h3>
            <p className="text-xs text-[#666666] dark:text-neutral-450">
              Selecciona las marcas de tarjetas que tu negocio acepta. Estas opciones filtrarán las tarjetas que los clientes pueden vincular en su panel.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 pt-2">
              {[
                { id: 'visa', label: 'Visa' },
                { id: 'mastercard', label: 'Mastercard' },
                { id: 'bcp', label: 'BCP' },
                { id: 'bbva', label: 'BBVA' },
                { id: 'interbank', label: 'Interbank' }
              ].map((brand) => {
                const checked = metodosPago.includes(brand.id);
                return (
                  <label key={brand.id} className="flex items-center gap-3 p-3 bg-[#fafafa] dark:bg-zinc-950 border border-transparent dark:border-zinc-800 rounded-xl cursor-pointer hover:border-neutral-300 dark:hover:border-zinc-700 transition-all select-none">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        if (checked) {
                          setMetodosPago(metodosPago.filter(m => m !== brand.id));
                        } else {
                          setMetodosPago([...metodosPago, brand.id]);
                        }
                      }}
                      className="rounded text-violet-650 focus:ring-violet-500 bg-white dark:bg-zinc-950 border-neutral-350 dark:border-zinc-800 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-neutral-800 dark:text-white capitalize">{brand.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
 
        </div>

        {/* Botón de Guardado */}
        <div className="pt-4 border-t border-[#e5e5e5] dark:border-zinc-800 flex justify-end">
          <button
            type="submit"
            disabled={saving || loadingLogo || loadingBanner}
            className="px-6 py-3 bg-[#1a1a1a] dark:bg-white text-white dark:text-zinc-950 text-sm font-semibold rounded-xl hover:bg-black dark:hover:bg-neutral-100 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            {saving && <Loader2 className="animate-spin" size={16} />}
            Guardar Configuración
          </button>
        </div>

      </form>

      {/* Tarjeta Informativa de la Vitrina Digital */}
      <div className="p-6 bg-slate-900 dark:bg-zinc-900 border border-slate-800 dark:border-zinc-800 rounded-2xl shadow-md flex items-start gap-4 text-white">
        <div className="w-10 h-10 rounded-xl bg-white/10 dark:bg-zinc-950/50 border border-transparent dark:border-zinc-800 flex items-center justify-center text-white shrink-0 mt-0.5">
          <HelpCircle size={18} />
        </div>
        <div className="space-y-1.5">
          <h4 className="text-sm font-semibold tracking-wide text-white">¿Cómo influye la configuración en tu catálogo?</h4>
          <p className="text-xs text-slate-300 dark:text-neutral-450 leading-relaxed">
            Los cambios que realices aquí se aplicarán automáticamente a tu vitrina digital pública. El color primario se utilizará para los botones y acentos de diseño del catálogo, y tu WhatsApp recibirá los pedidos desglosados directamente desde el carrito de compras del cliente.
          </p>
        </div>
      </div>

    </div>
  );
}
