import { useState, useEffect } from 'react';
import { useEmpresaSupabase } from '../context/EmpresaSupabaseContext';
import { API_BASE_URL } from '../config/api';

export function useProductos() {
  // Cliente Supabase aislado de la empresa activa (via EmpresaSupabaseContext)
  const supabase = useEmpresaSupabase();

  const [productos, setProductos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Estados de Filtros e Búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortField, setSortField] = useState('nombre');
  const [sortOrder, setSortOrder] = useState('asc');

  // Estados de Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentProducto, setCurrentProducto] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [productoToDelete, setProductoToDelete] = useState(null);

  // Estado del Formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '0',
    categoria: '',
    imagen_url: '',
    activo: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const triggerNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Cargar datos del API
  const fetchProductos = async (signal) => {
    setIsLoading(true);
    setError(null);

    // Timeout de 10 segundos adicional por si el AbortController tarda más
    const timeoutId = setTimeout(() => {
      if (signal && !signal.aborted) signal.dispatchEvent(new Event('abort'));
    }, 10000);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No se detectó una sesión activa. Por favor, vuelve a iniciar sesión.');

      const response = await fetch(`${API_BASE_URL}/api/productos`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        signal
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Error al obtener productos del servidor');
      }

      setProductos(resData.data || []);
    } catch (err) {
      if (err.name === 'AbortError') {
        // Fetch cancelado por navegación — no mostrar error
        return;
      }
      console.error('Error fetching productos:', err);
      setError(err.message);
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Crear un AbortController para cancelar el fetch si el componente se desmonta
    const controller = new AbortController();
    fetchProductos(controller.signal);

    // Cleanup: abortar la petición cuando el usuario navegue a otra vista
    return () => {
      controller.abort();
    };
  }, []);

  // Controladores de Modales
  const handleOpenCreate = () => {
    setModalMode('create');
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      stock: '0',
      categoria: '',
      imagen_url: '',
      activo: true
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (producto) => {
    setModalMode('edit');
    setCurrentProducto(producto);
    setFormData({
      nombre: producto.nombre || '',
      descripcion: producto.descripcion || '',
      precio: producto.precio !== undefined ? producto.precio.toString() : '',
      stock: producto.stock !== undefined ? producto.stock.toString() : '0',
      categoria: producto.categoria || '',
      imagen_url: producto.imagen_url || '',
      activo: producto.activo !== undefined ? producto.activo : true
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (producto) => {
    setProductoToDelete(producto);
    setIsDeleteOpen(true);
  };

  // Enviar formulario (Crear / Editar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sesión expirada');

      let finalImageUrl = formData.imagen_url;

      // Subir archivo a Supabase Storage si se ha seleccionado uno nuevo
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('productos')
          .upload(filePath, imageFile);

        if (uploadError) {
          throw new Error(`Error al subir la imagen: ${uploadError.message}`);
        }

        // Obtener la URL pública del archivo subido
        const { data: { publicUrl } } = supabase.storage
          .from('productos')
          .getPublicUrl(filePath);

        finalImageUrl = publicUrl;
      }

      const payload = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock, 10) || 0,
        categoria: formData.categoria,
        imagen_url: finalImageUrl,
        activo: formData.activo
      };

      let url = `${API_BASE_URL}/api/productos`;
      let method = 'POST';

      if (modalMode === 'edit') {
        url = `${API_BASE_URL}/api/productos/${currentProducto.id}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Error al guardar el producto');
      }

      setIsModalOpen(false);
      triggerNotification(modalMode === 'edit' ? 'Producto actualizado con éxito' : 'Producto creado con éxito');
      fetchProductos();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Eliminar
  const handleDelete = async () => {
    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sesión expirada');

      const response = await fetch(`${API_BASE_URL}/api/productos/${productoToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Error al eliminar el producto');
      }

      setIsDeleteOpen(false);
      setProductoToDelete(null);
      triggerNotification('Producto eliminado correctamente');
      fetchProductos();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filtrado y Ordenamiento
  const categoriasUnicas = [...new Set(productos.map(p => p.categoria).filter(Boolean))];

  const productosFiltrados = productos
    .filter(producto => {
      const matchSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (producto.descripcion && producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (producto.categoria && producto.categoria.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchCategory = selectedCategory === '' || producto.categoria === selectedCategory;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Métricas
  const totalProductos = productos.length;
  const stockValorizado = productos.reduce((sum, p) => sum + (p.precio * (p.stock || 0)), 0);
  const totalStock = productos.reduce((sum, p) => sum + (p.stock || 0), 0);
  const bajoStock = productos.filter(p => p.stock <= 5).length;

  return {
    productos: productosFiltrados,
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
    imageFile,
    setImageFile,
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
  };
}
