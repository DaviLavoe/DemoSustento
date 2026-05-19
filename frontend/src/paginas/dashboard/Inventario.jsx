import { useProductos } from '../../hooks/useProductos';
import CardMetrica from '../../components/dashboard/CardMetrica';
import TablaProductos from '../../components/dashboard/TablaProductos';
import ModalProducto from '../../components/dashboard/ModalProducto';
import ModalConfirmarEliminar from '../../components/dashboard/ModalConfirmarEliminar';
import { Package, DollarSign, ShieldAlert, X } from 'lucide-react';

export default function Inventario() {
  const {
    productos,
    totalProductos,
    stockValorizado,
    totalStock,
    bajoStock,
    isLoading,
    error,
    successMsg,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    categoriasUnicas,
    sortField,
    sortOrder,
    handleSort,
    
    // Modales & CRUD
    isModalOpen,
    setIsModalOpen,
    modalMode,
    formData,
    setFormData,
    submitting,
    handleOpenCreate,
    handleOpenEdit,
    handleSubmit,
    
    // Eliminar
    isDeleteOpen,
    setIsDeleteOpen,
    productoToDelete,
    handleOpenDelete,
    handleDelete,
    setError
  } = useProductos();

  return (
    <div className="space-y-6 animate-reveal">
      
      {/* Notificaciones flotantes */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3.5 bg-black text-white text-sm rounded-xl shadow-xl flex items-center gap-3 border border-white/10 animate-fade-in-up">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          {successMsg}
        </div>
      )}

      {/* Manejo de Errores */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="p-1 text-red-500 hover:text-red-700">
            <X size={16} />
          </button>
        </div>
      )}

      {/* 📊 Sección de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <CardMetrica
          titulo="Total Productos"
          valor={totalProductos}
          Icono={Package}
          loading={isLoading}
        />
        
        <CardMetrica
          titulo="Stock Valorizado"
          valor={`$${stockValorizado.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          Icono={DollarSign}
          loading={isLoading}
        />
        
        <CardMetrica
          titulo="Unidades en Stock"
          valor={totalStock}
          Icono={Package}
          loading={isLoading}
        />
        
        <CardMetrica
          titulo="Alerta Stock (≤ 5)"
          valor={bajoStock}
          Icono={ShieldAlert}
          loading={isLoading}
          alert={bajoStock > 0}
        />
      </div>

      {/* 📋 Tabla de Inventario & Filtros */}
      <TablaProductos
        productos={productos}
        isLoading={isLoading}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categoriasUnicas={categoriasUnicas}
        onAddClick={handleOpenCreate}
      />

      {/* 📝 Modal Formulario: Crear / Editar */}
      <ModalProducto
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      {/* ⚠️ Modal Alerta: Confirmación de Eliminación */}
      <ModalConfirmarEliminar
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        productoNombre={productoToDelete?.nombre || ''}
        submitting={submitting}
      />

    </div>
  );
}
