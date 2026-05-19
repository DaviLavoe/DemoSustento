import React from 'react';
import { Loader2 } from 'lucide-react';

export default function ModalConfirmarEliminar({
  isOpen,
  onClose,
  onConfirm,
  productoNombre,
  submitting
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-xs"></div>
      
      <div className="relative w-full max-w-md bg-white rounded-2xl border border-[#e5e5e5] shadow-2xl p-6 animate-reveal z-10 space-y-4">
        <h3 className="font-serif text-xl font-bold text-red-600">¿Eliminar Producto?</h3>
        <p className="text-sm text-[#666666] leading-relaxed">
          ¿Estás seguro de que deseas eliminar permanentemente el producto <strong className="text-[#1a1a1a]">"{productoNombre}"</strong>? Esta acción no se puede deshacer y afectará los registros actuales.
        </p>
        
        <div className="flex gap-3 justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-[#e5e5e5] text-[#1a1a1a] rounded-xl text-sm font-medium hover:bg-[#fafafa] active:scale-[0.98] transition-all duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 active:scale-[0.98] transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {submitting && <Loader2 className="animate-spin" size={16} />}
            Confirmar Eliminación
          </button>
        </div>
      </div>
    </div>
  );
}
