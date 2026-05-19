import React from 'react';
import { 
  Search, Edit2, Trash2, ArrowUpDown, Package, 
  Loader2, Image as ImageIcon, Plus 
} from 'lucide-react';

export default function TablaProductos({
  productos,
  isLoading,
  onEdit,
  onDelete,
  sortField,
  sortOrder,
  onSort,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categoriasUnicas,
  onAddClick
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden shadow-xs">
      
      {/* Barra de Acciones */}
      <div className="p-5 md:p-6 border-b border-[#e5e5e5] flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white">
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          {/* Buscador */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a1a1aa]" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, descripción o categoría..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#fafafa] border border-transparent rounded-xl text-sm text-[#1a1a1a] placeholder-[#a1a1aa] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10 focus:border-[#1a1a1a] transition-all duration-200 hover:border-[#e5e5e5]"
            />
          </div>
          {/* Filtro Categoría */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 bg-[#fafafa] border border-transparent rounded-xl text-sm text-[#1a1a1a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10 focus:border-[#1a1a1a] transition-all duration-200 hover:border-[#e5e5e5] cursor-pointer"
          >
            <option value="">Todas las Categorías</option>
            {categoriasUnicas.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <button
          onClick={onAddClick}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1a1a1a] text-white rounded-xl text-sm font-medium hover:bg-black active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Plus size={16} />
          Agregar Producto
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-[#1a1a1a]" size={32} />
            <p className="text-sm text-[#666666] font-medium tracking-wide">Cargando inventario...</p>
          </div>
        ) : productos.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#fafafa] border border-[#e5e5e5] flex items-center justify-center text-[#a1a1aa] mx-auto">
              <Package size={24} />
            </div>
            <p className="text-sm font-medium text-[#666666]">No se encontraron productos registrados</p>
            <p className="text-xs text-[#a1a1aa] max-w-xs mx-auto">Comienza agregando un nuevo artículo a tu inventario utilizando el botón superior.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fafafa] border-b border-[#e5e5e5]">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#666666] w-20">Imagen</th>
                <th onClick={() => onSort('nombre')} className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#666666] cursor-pointer hover:text-[#1a1a1a] transition-colors select-none">
                  <span className="flex items-center gap-1.5">
                    Producto
                    <ArrowUpDown size={12} className="opacity-50" />
                  </span>
                </th>
                <th onClick={() => onSort('categoria')} className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#666666] cursor-pointer hover:text-[#1a1a1a] transition-colors select-none">
                  <span className="flex items-center gap-1.5">
                    Categoría
                    <ArrowUpDown size={12} className="opacity-50" />
                  </span>
                </th>
                <th onClick={() => onSort('precio')} className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#666666] cursor-pointer hover:text-[#1a1a1a] transition-colors select-none text-right">
                  <span className="flex items-center gap-1.5 justify-end">
                    Precio
                    <ArrowUpDown size={12} className="opacity-50" />
                  </span>
                </th>
                <th onClick={() => onSort('stock')} className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#666666] cursor-pointer hover:text-[#1a1a1a] transition-colors select-none text-center">
                  <span className="flex items-center gap-1.5 justify-center">
                    Stock
                    <ArrowUpDown size={12} className="opacity-50" />
                  </span>
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#666666] text-center w-24">Estado</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#666666] text-right w-24">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e5e5]">
              {productos.map((producto) => (
                <tr key={producto.id} className="hover:bg-[#fafafa]/50 transition-colors group">
                  {/* Imagen */}
                  <td className="px-6 py-3.5">
                    <div className="w-12 h-12 rounded-xl border border-[#e5e5e5] bg-[#fafafa] flex items-center justify-center overflow-hidden">
                      {producto.imagen_url ? (
                        <img src={producto.imagen_url} alt={producto.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={18} className="text-[#a1a1aa]" />
                      )}
                    </div>
                  </td>
                  {/* Nombre & Descripción */}
                  <td className="px-6 py-3.5">
                    <div className="max-w-[280px]">
                      <h4 className="text-sm font-semibold text-[#1a1a1a] truncate">{producto.nombre}</h4>
                      <p className="text-xs text-[#666666] truncate mt-0.5">{producto.descripcion || 'Sin descripción'}</p>
                    </div>
                  </td>
                  {/* Categoría */}
                  <td className="px-6 py-3.5">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#fafafa] border border-[#e5e5e5] text-[#666666]">
                      {producto.categoria || 'Sin Categoría'}
                    </span>
                  </td>
                  {/* Precio */}
                  <td className="px-6 py-3.5 text-right font-medium text-[#1a1a1a]">
                    ${parseFloat(producto.precio).toFixed(2)}
                  </td>
                  {/* Stock */}
                  <td className="px-6 py-3.5 text-center">
                    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                      producto.stock === 0 
                        ? 'bg-red-50 text-red-700 border border-red-100'
                        : producto.stock <= 5 
                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}>
                      {producto.stock} uds
                    </span>
                  </td>
                  {/* Estado */}
                  <td className="px-6 py-3.5 text-center">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                      producto.activo ? 'text-emerald-600' : 'text-[#666666]'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        producto.activo ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
                      }`}></span>
                      {producto.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  {/* Acciones */}
                  <td className="px-6 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(producto)}
                        className="p-1.5 rounded-lg border border-transparent hover:border-[#e5e5e5] hover:bg-white text-[#666666] hover:text-[#1a1a1a] transition-all"
                        title="Editar"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(producto)}
                        className="p-1.5 rounded-lg border border-transparent hover:border-red-100 hover:bg-red-50 text-[#666666] hover:text-red-600 transition-all"
                        title="Eliminar"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
