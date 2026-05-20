import React from 'react';
import { X, Loader2, UploadCloud } from 'lucide-react';

export default function ModalProducto({
  isOpen,
  onClose,
  mode,
  formData,
  setFormData,
  imageFile,
  setImageFile,
  onSubmit,
  submitting
}) {
  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const getPreviewUrl = () => {
    if (imageFile) {
      return URL.createObjectURL(imageFile);
    }
    return formData.imagen_url;
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setFormData({ ...formData, imagen_url: '' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-xs"></div>
      
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-[#e5e5e5] shadow-2xl overflow-hidden animate-reveal z-10 flex flex-col max-h-[90vh]">
        
        {/* Header del Modal */}
        <div className="p-6 border-b border-[#e5e5e5] flex items-center justify-between bg-[#fafafa]">
          <h3 className="font-serif text-xl font-bold text-[#1a1a1a]">
            {mode === 'edit' ? 'Editar Producto' : 'Nuevo Producto'}
          </h3>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-[#e5e5e5] text-[#666666] hover:text-[#1a1a1a] transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="space-y-4">
            
            {/* Nombre */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#666666]">Nombre del Producto *</label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                placeholder="Ej. Silla Ergonómica Pro"
                className="w-full px-4 py-2.5 bg-[#fafafa] border border-transparent rounded-xl text-sm text-[#1a1a1a] placeholder-[#a1a1aa] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10 focus:border-[#1a1a1a] transition-all duration-200 hover:border-[#e5e5e5]"
              />
            </div>

            {/* Categoría & Activo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#666666]">Categoría</label>
                <input
                  type="text"
                  value={formData.categoria}
                  onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                  placeholder="Ej. Oficina"
                  className="w-full px-4 py-2.5 bg-[#fafafa] border border-transparent rounded-xl text-sm text-[#1a1a1a] placeholder-[#a1a1aa] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10 focus:border-[#1a1a1a] transition-all duration-200 hover:border-[#e5e5e5]"
                />
              </div>
              
              <div className="flex flex-col gap-1.5 justify-center pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                    className="w-4 h-4 rounded text-black border-[#e5e5e5] focus:ring-black accent-[#1a1a1a] cursor-pointer"
                  />
                  <span className="text-sm font-medium text-[#1a1a1a]">Producto Activo / Visible</span>
                </label>
              </div>
            </div>

            {/* Precio & Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#666666]">Precio (USD) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0"
                  value={formData.precio}
                  onChange={(e) => setFormData({...formData, precio: e.target.value})}
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 bg-[#fafafa] border border-transparent rounded-xl text-sm text-[#1a1a1a] placeholder-[#a1a1aa] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10 focus:border-[#1a1a1a] transition-all duration-200 hover:border-[#e5e5e5]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#666666]">Stock Inicial</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  placeholder="0"
                  className="w-full px-4 py-2.5 bg-[#fafafa] border border-transparent rounded-xl text-sm text-[#1a1a1a] placeholder-[#a1a1aa] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10 focus:border-[#1a1a1a] transition-all duration-200 hover:border-[#e5e5e5]"
                />
              </div>
            </div>

            {/* Descripción */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#666666]">Descripción</label>
              <textarea
                rows="3"
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                placeholder="Describe los detalles de tu producto..."
                className="w-full px-4 py-2.5 bg-[#fafafa] border border-transparent rounded-xl text-sm text-[#1a1a1a] placeholder-[#a1a1aa] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10 focus:border-[#1a1a1a] transition-all duration-200 hover:border-[#e5e5e5] resize-none"
              ></textarea>
            </div>

            {/* Imagen del Producto (Supabase Storage) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#666666]">
                Imagen del Producto
              </label>
              
              {getPreviewUrl() ? (
                <div className="relative group rounded-xl overflow-hidden border border-[#e5e5e5] bg-[#fafafa] flex items-center justify-center h-48 transition-all">
                  <img
                    src={getPreviewUrl()}
                    alt="Vista previa"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label className="px-3 py-1.5 bg-white text-[#1a1a1a] text-xs font-semibold rounded-lg cursor-pointer hover:bg-zinc-100 active:scale-[0.98] transition-all">
                      Cambiar
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 active:scale-[0.98] transition-all"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border border-dashed border-[#e5e5e5] hover:border-zinc-400 bg-[#fafafa] hover:bg-[#fafafa]/50 rounded-xl p-6 cursor-pointer group transition-all h-48">
                  <UploadCloud className="text-zinc-400 group-hover:text-zinc-600 mb-2 transition-colors" size={32} />
                  <span className="text-xs font-medium text-zinc-600 group-hover:text-zinc-800">
                    Haz clic para subir una imagen
                  </span>
                  <span className="text-[10px] text-zinc-400 mt-1">
                    Formatos recomendados: PNG, JPG, WEBP (Max. 5MB)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

          </div>

          {/* Botones de Acción */}
          <div className="pt-4 border-t border-[#e5e5e5] flex gap-3 justify-end bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white border border-[#e5e5e5] text-[#1a1a1a] rounded-xl text-sm font-medium hover:bg-[#fafafa] active:scale-[0.98] transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-[#1a1a1a] text-white rounded-xl text-sm font-medium hover:bg-black active:scale-[0.98] transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {submitting && <Loader2 className="animate-spin" size={16} />}
              {mode === 'edit' ? 'Guardar Cambios' : 'Registrar Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
