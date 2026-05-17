const supabase = require('../config/supabaseClient');

const productosController = {
  // GET /api/productos
  obtenerProductos: async (req, res) => {
    try {
      const { empresa_id } = req.user;
      
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('empresa_id', empresa_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error al obtener productos:', error.message);
      res.status(500).json({ success: false, message: 'Error al obtener productos', error: error.message });
    }
  },

  // POST /api/productos
  crearProducto: async (req, res) => {
    try {
      const { empresa_id } = req.user;
      const { nombre, descripcion, precio, stock, categoria, imagen_url, activo } = req.body;

      if (!nombre || precio === undefined) {
         return res.status(400).json({ success: false, message: 'Nombre y precio son obligatorios' });
      }

      const { data, error } = await supabase
        .from('productos')
        .insert([{ 
          empresa_id, 
          nombre, 
          descripcion, 
          precio, 
          stock: stock || 0, 
          categoria, 
          imagen_url, 
          activo: activo !== undefined ? activo : true 
        }])
        .select()
        .single();

      if (error) throw error;
      res.status(201).json({ success: true, data, message: 'Producto creado exitosamente' });
    } catch (error) {
      console.error('Error al crear producto:', error.message);
      res.status(500).json({ success: false, message: 'Error al crear producto', error: error.message });
    }
  },

  // PUT /api/productos/:id
  actualizarProducto: async (req, res) => {
    try {
      const { id } = req.params;
      const { empresa_id } = req.user;
      const { nombre, descripcion, precio, stock, categoria, imagen_url, activo } = req.body;

      const { data, error } = await supabase
        .from('productos')
        .update({ nombre, descripcion, precio, stock, categoria, imagen_url, activo })
        .eq('id', id)
        .eq('empresa_id', empresa_id) // Validar que pertenezca a su empresa
        .select()
        .single();

      if (error) throw error;
      if (!data) return res.status(404).json({ success: false, message: 'Producto no encontrado o no autorizado para editar' });

      res.json({ success: true, data, message: 'Producto actualizado exitosamente' });
    } catch (error) {
      console.error('Error al actualizar producto:', error.message);
      res.status(500).json({ success: false, message: 'Error al actualizar producto', error: error.message });
    }
  },

  // DELETE /api/productos/:id
  eliminarProducto: async (req, res) => {
    try {
      const { id } = req.params;
      const { empresa_id } = req.user;

      const { data, error } = await supabase
        .from('productos')
        .delete()
        .eq('id', id)
        .eq('empresa_id', empresa_id) // Validar que pertenezca a su empresa
        .select()
        .single();

      if (error) throw error;
      if (!data) return res.status(404).json({ success: false, message: 'Producto no encontrado o no autorizado para eliminar' });

      res.json({ success: true, data, message: 'Producto eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar producto:', error.message);
      res.status(500).json({ success: false, message: 'Error al eliminar producto', error: error.message });
    }
  }
};

module.exports = productosController;
