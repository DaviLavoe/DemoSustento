import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Settings, Phone, Palette, HelpCircle, UploadCloud, Loader2, CheckCircle, Trash2, ShieldAlert } from 'lucide-react';
import { supabase } from '../../config/supabase';

export default function Configuracion() {
  const { empresa, setEmpresa } = useOutletContext();
  const [nombre, setNombre] = useState('');
  const [colorPrimario, setColorPrimario] = useState('#1a1a1a');
  const [telefonoWhatsapp, setTelefonoWhatsapp] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  
  const [loadingLogo, setLoadingLogo] = useState(false);
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

      const response = await fetch('http://localhost:3000/api/auth/empresa', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          nombre: nombre.trim(),
          color_primario: colorPrimario,
          telefono_whatsapp: telefonoWhatsapp.trim() || null,
          logo_url: logoUrl || null
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
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm rounded-xl flex items-center gap-3">
          <CheckCircle size={18} className="text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center gap-3">
          <ShieldAlert size={18} className="text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-8 bg-white border border-[#e5e5e5] rounded-2xl shadow-xs space-y-6">
        
        {/* Cabecera del Panel */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#fafafa] border border-[#e5e5e5] flex items-center justify-center text-[#1a1a1a]">
            <Settings size={22} />
          </div>
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-bold text-[#1a1a1a]">Configuración del Catálogo</h2>
            <p className="text-sm text-[#666666]">Define la identidad de tu vitrina digital y los datos de contacto para tus pedidos de WhatsApp.</p>
          </div>
        </div>

        <div className="border-t border-[#e5e5e5] pt-6 space-y-6">
          
          {/* Sección 1: Apariencia Visual */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#666666] flex items-center gap-2">
              <Palette size={14} />
              Apariencia Visual
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Color Primario */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#666666]">Color Primario del Catálogo</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={colorPrimario}
                    onChange={(e) => setColorPrimario(e.target.value)}
                    className="w-11 h-11 border border-[#e5e5e5] rounded-xl cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={colorPrimario}
                    onChange={(e) => setColorPrimario(e.target.value)}
                    placeholder="#1A1A1A"
                    maxLength="7"
                    className="flex-1 px-4 py-2.5 bg-[#fafafa] border border-transparent rounded-xl text-sm text-[#1a1a1a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all hover:border-[#e5e5e5]"
                  />
                </div>
              </div>
              
              {/* Nombre de la Marca */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#666666]">Nombre de la Marca *</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Mi Tienda Express"
                  className="px-4 py-2.5 bg-[#fafafa] border border-transparent rounded-xl text-sm text-[#1a1a1a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all hover:border-[#e5e5e5]"
                />
              </div>

            </div>

            {/* Carga del Logotipo de la Empresa */}
            <div className="flex flex-col gap-2 pt-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#666666]">Logotipo de la Marca</label>
              
              {logoUrl ? (
                <div className="flex items-center gap-4 p-4 bg-[#fafafa] border border-[#e5e5e5] rounded-2xl max-w-md">
                  <img 
                    src={logoUrl} 
                    alt="Logo Empresa" 
                    className="w-16 h-16 rounded-xl object-contain border border-[#e5e5e5] bg-white shrink-0" 
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-neutral-600 truncate">logotipo_activo.png</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Imagen de marca de tu vitrina digital</p>
                  </div>
                  <button 
                    type="button"
                    onClick={handleRemoveLogo}
                    className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    title="Remover logotipo"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border border-dashed border-[#e5e5e5] hover:border-zinc-400 bg-[#fafafa] hover:bg-[#fafafa]/50 rounded-2xl p-6 cursor-pointer group transition-all max-w-md h-32">
                  {loadingLogo ? (
                    <Loader2 className="animate-spin text-zinc-500 mb-2" size={24} />
                  ) : (
                    <UploadCloud className="text-zinc-400 group-hover:text-zinc-600 mb-1.5 transition-colors" size={24} />
                  )}
                  <span className="text-xs font-semibold text-zinc-600 group-hover:text-zinc-800">
                    {loadingLogo ? 'Subiendo logotipo...' : 'Haz clic para subir un logo'}
                  </span>
                  <span className="text-[10px] text-zinc-400 mt-1">PNG, JPG o WEBP (Max. 2MB)</span>
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

          </div>

          {/* Sección 2: Enlace WhatsApp */}
          <div className="space-y-4 pt-2 border-t border-[#e5e5e5]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#666666] flex items-center gap-2">
              <Phone size={14} />
              Redirección de Pedidos
            </h3>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#666666]">Número de WhatsApp (con código de país)</label>
              <input
                type="tel"
                value={telefonoWhatsapp}
                onChange={(e) => setTelefonoWhatsapp(e.target.value)}
                placeholder="Ej. +51987654321"
                className="px-4 py-2.5 bg-[#fafafa] border border-transparent rounded-xl text-sm text-[#1a1a1a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all hover:border-[#e5e5e5]"
              />
              <p className="text-[10px] text-neutral-400 leading-normal">
                Ingresa el número con el formato internacional (ej. `+51987654321`). Aquí es donde tus clientes enviarán la confirmación y el detalle de su carrito de compras de manera automatizada.
              </p>
            </div>
          </div>

        </div>

        {/* Botón de Guardado */}
        <div className="pt-4 border-t border-[#e5e5e5] flex justify-end">
          <button
            type="submit"
            disabled={saving || loadingLogo}
            className="px-6 py-3 bg-[#1a1a1a] text-white text-sm font-semibold rounded-xl hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            {saving && <Loader2 className="animate-spin" size={16} />}
            Guardar Configuración
          </button>
        </div>

      </form>

      {/* Tarjeta Informativa de la Vitrina Digital */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-md flex items-start gap-4 text-white">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0 mt-0.5">
          <HelpCircle size={18} />
        </div>
        <div className="space-y-1.5">
          <h4 className="text-sm font-semibold tracking-wide">¿Cómo influye la configuración en tu catálogo?</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Los cambios que realices aquí se aplicarán automáticamente a tu vitrina digital pública. El color primario se utilizará para los botones y acentos de diseño del catálogo, y tu WhatsApp recibirá los pedidos desglosados directamente desde el carrito de compras del cliente.
          </p>
        </div>
      </div>

    </div>
  );
}
