const supabase = require('../config/supabaseClient');

const pedidosController = {
  // POST /api/pedidos
  crearPedido: async (req, res) => {
    try {
      // 1. Obtener datos del cuerpo
      const { nombre_cliente, telefono_cliente, total, productos, empresa_id: bodyEmpresaId } = req.body;
      
      // 2. Determinar empresa_id (de req.user si está autenticado, o de bodyEmpresaId si es petición pública)
      const empresa_id = req.user ? req.user.empresa_id : bodyEmpresaId;
      
      if (!empresa_id) {
        return res.status(400).json({ success: false, message: 'El id de la empresa (empresa_id) es obligatorio' });
      }
      
      if (!nombre_cliente || total === undefined) {
        return res.status(400).json({ success: false, message: 'El nombre del cliente y el total son obligatorios' });
      }
      
      if (!productos || !Array.isArray(productos) || productos.length === 0) {
        return res.status(400).json({ success: false, message: 'Debe incluir al menos un producto en el pedido' });
      }
      
      // Validar formato de cada producto en la lista
      for (const prod of productos) {
        if (!prod.producto_id || !prod.cantidad || prod.precio_unitario === undefined) {
          return res.status(400).json({ 
            success: false, 
            message: 'Cada producto debe contener producto_id, cantidad (mayor a 0) y precio_unitario' 
          });
        }
        if (prod.cantidad <= 0) {
          return res.status(400).json({ success: false, message: 'La cantidad de cada producto debe ser mayor a 0' });
        }
      }
      
      // Validar que la empresa exista
      const { data: empresa, error: empresaError } = await supabase
        .from('empresas')
        .select('id')
        .eq('id', empresa_id)
        .single();
        
      if (empresaError || !empresa) {
        return res.status(400).json({ success: false, message: 'La empresa especificada no existe' });
      }

      // Validar stock disponible para cada producto en la base de datos
      const productIds = productos.map(p => p.producto_id);
      const { data: dbProducts, error: dbProductsError } = await supabase
        .from('productos')
        .select('id, nombre, stock')
        .in('id', productIds);
        
      if (dbProductsError) throw dbProductsError;
      
      const stockMap = {};
      dbProducts.forEach(p => {
        stockMap[p.id] = { nombre: p.nombre, stock: p.stock };
      });
      
      for (const prod of productos) {
        const dbProd = stockMap[prod.producto_id];
        if (!dbProd) {
          return res.status(404).json({ success: false, message: `El producto con ID ${prod.producto_id} no existe` });
        }
        if (dbProd.stock < prod.cantidad) {
          return res.status(400).json({ 
            success: false, 
            message: `Stock insuficiente para '${dbProd.nombre}'. Stock disponible: ${dbProd.stock}, solicitado: ${prod.cantidad}` 
          });
        }
      }
      
      // 3. Insertar el pedido principal en la tabla 'pedidos'
      const { data: pedido, error: pedidoError } = await supabase
        .from('pedidos')
        .insert([{
          empresa_id,
          nombre_cliente,
          telefono_cliente: telefono_cliente || null,
          total,
          estado: 'pendiente'
        }])
        .select()
        .single();
        
      if (pedidoError) throw pedidoError;
      
      // 4. Preparar la estructura para detalles_pedido
      const detalles = productos.map(p => ({
        pedido_id: pedido.id,
        producto_id: p.producto_id,
        cantidad: p.cantidad,
        precio_unitario: p.precio_unitario
      }));
      
      // 5. Insertar los detalles vinculados
      const { data: detallesData, error: detallesError } = await supabase
        .from('detalles_pedido')
        .insert(detalles)
        .select();
        
      if (detallesError) {
        // Rollback manual del pedido para evitar registros huérfanos
        console.error('Error al insertar detalles de pedido. Ejecutando rollback de la cabecera...', detallesError.message);
        await supabase.from('pedidos').delete().eq('id', pedido.id);
        throw detallesError;
      }
      
      res.status(201).json({
        success: true,
        message: 'Pedido registrado exitosamente',
        data: {
          pedido,
          detalles: detallesData
        }
      });
      
    } catch (error) {
      console.error('Error al registrar pedido:', error.message);
      res.status(500).json({ success: false, message: 'Error interno al registrar el pedido', error: error.message });
    }
  },

  // GET /api/pedidos/analiticas
  obtenerAnaliticas: async (req, res) => {
    try {
      const { empresa_id, rol } = req.user;
      
      // Validar que el usuario sea administrador
      if (rol !== 'admin') {
        return res.status(403).json({ success: false, message: 'Acceso denegado: Solo administradores pueden ver analíticas' });
      }
      
      // 1. Obtener todos los pedidos de la empresa para calcular total y agrupar por fecha
      const { data: pedidos, error: pedidosError } = await supabase
        .from('pedidos')
        .select('id, total, created_at')
        .eq('empresa_id', empresa_id);
        
      if (pedidosError) throw pedidosError;
      
      // Ventas totales acumuladas
      const ventasTotales = pedidos.reduce((acc, p) => acc + parseFloat(p.total), 0);
      
      // Cantidad de pedidos agrupados por fecha
      const pedidosPorFecha = {};
      pedidos.forEach(p => {
        // Convertir la fecha a formato local YYYY-MM-DD
        const fecha = new Date(p.created_at).toISOString().split('T')[0];
        pedidosPorFecha[fecha] = (pedidosPorFecha[fecha] || 0) + 1;
      });
      
      const graficoLineas = Object.entries(pedidosPorFecha)
        .map(([fecha, cantidad]) => ({ fecha, cantidad }))
        .sort((a, b) => a.fecha.localeCompare(b.fecha));
        
      // Categorías más vendidas (Gráfico de torta/dona)
      const pedidoIds = pedidos.map(p => p.id);
      let graficoPastel = [];
      
      if (pedidoIds.length > 0) {
        // Consultar los detalles de los pedidos e incluir la relación con productos
        const { data: detalles, error: detallesError } = await supabase
          .from('detalles_pedido')
          .select(`
            cantidad,
            productos (
              categoria
            )
          `)
          .in('pedido_id', pedidoIds);
          
        if (detallesError) throw detallesError;
        
        const categoriasMap = {};
        detalles.forEach(d => {
          const categoria = (d.productos && d.productos.categoria) ? d.productos.categoria : 'Sin categoría';
          categoriasMap[categoria] = (categoriasMap[categoria] || 0) + d.cantidad;
        });
        
        graficoPastel = Object.entries(categoriasMap)
          .map(([categoria, cantidad]) => ({ categoria, cantidad }))
          .sort((a, b) => b.cantidad - a.cantidad); // Ordenar de mayor a menor cantidad vendida
      }
      
      res.json({
        success: true,
        data: {
          ventasTotales,
          graficoLineas,
          graficoPastel
        }
      });
      
    } catch (error) {
      console.error('Error al obtener analíticas:', error.message);
      res.status(500).json({ success: false, message: 'Error al obtener analíticas del servidor', error: error.message });
    }
  }
};

module.exports = pedidosController;
