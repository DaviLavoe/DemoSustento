const supabase = require('../config/supabaseClient');
const fs = require('fs');
const path = require('path');

const pedidosController = {
  // POST /api/pedidos
  crearPedido: async (req, res) => {
    try {
      // LOG DIAGNÓSTICO TEMPORAL
      const logMsg = `[${new Date().toISOString()}] crearPedido Recibido\n` +
                     `Headers: ${JSON.stringify(req.headers)}\n` +
                     `req.user: ${JSON.stringify(req.user)}\n` +
                     `Body: ${JSON.stringify(req.body)}\n\n`;
      fs.appendFileSync(path.join(__dirname, '../request_logs.txt'), logMsg);

      // 1. Obtener datos del cuerpo
      const { nombre_cliente, telefono_cliente, total, productos, empresa_id: bodyEmpresaId, metodo_pago } = req.body;
      
      // 2. Determinar empresa_id (de req.user si tiene empresa asociada, o de bodyEmpresaId en caso de cliente/petición pública)
      const empresa_id = (req.user && req.user.empresa_id) ? req.user.empresa_id : bodyEmpresaId;
      
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
      
      // Validar y debitar saldo si es pago con crédito
      if (metodo_pago === 'credito') {
        if (!req.user || req.user.rol !== 'cliente') {
          return res.status(401).json({ success: false, message: 'Debes iniciar sesión con tu cuenta de cliente para pagar con crédito.' });
        }
        
        // Obtener datos del cliente (saldo y puntos)
        const { data: cliente, error: clienteError } = await supabase
          .from('clientes')
          .select('saldo, puntos')
          .eq('id', req.user.id)
          .eq('empresa_id', empresa_id)
          .single();
          
        if (clienteError || !cliente) {
          return res.status(400).json({ success: false, message: 'No se pudo verificar el saldo de tu cuenta.' });
        }
        
        const saldoActual = Number(cliente.saldo || 0);
        if (saldoActual < total) {
          return res.status(400).json({ success: false, message: `Saldo insuficiente. Tienes $${saldoActual.toFixed(2)} pero el pedido es de $${Number(total).toFixed(2)}.` });
        }
        
        // Deducción y sumatoria de puntos
        const nuevoSaldo = saldoActual - Number(total);
        const puntosGanados = Math.round(Number(total) * 0.05);
        const nuevosPuntos = Number(cliente.puntos || 0) + puntosGanados;
        
        const { error: updateError } = await supabase
          .from('clientes')
          .update({ saldo: nuevoSaldo, puntos: nuevosPuntos })
          .eq('id', req.user.id)
          .eq('empresa_id', empresa_id);
          
        if (updateError) {
          return res.status(500).json({ success: false, message: 'Error al procesar el pago con crédito.', error: updateError.message });
        }
      }

      // 3. Insertar el pedido principal en la tabla 'pedidos'
      const logFile = path.join(__dirname, '../auth_debug.log');
      fs.appendFileSync(logFile, `[${new Date().toISOString()}] [crearPedido] req.user is: ${JSON.stringify(req.user)}\n`);
      const insertData = {
        empresa_id,
        nombre_cliente,
        telefono_cliente: telefono_cliente || null,
        total,
        estado: 'pendiente',
        cliente_id: req.user ? req.user.id : null,
        metodo_pago: metodo_pago || 'whatsapp',
        pago_estado: metodo_pago === 'credito' ? 'pagado' : 'pendiente'
      };
      fs.appendFileSync(logFile, `[${new Date().toISOString()}] [crearPedido] inserting into pedidos: ${JSON.stringify(insertData)}\n`);

      const { data: pedido, error: pedidoError } = await supabase
        .from('pedidos')
        .insert([insertData])
        .select()
        .single();
        
      if (pedidoError) {
        fs.appendFileSync(logFile, `[${new Date().toISOString()}] [crearPedido] insert error: ${pedidoError.message}\n`);
        throw pedidoError;
      }
      fs.appendFileSync(logFile, `[${new Date().toISOString()}] [crearPedido] insert success: ${JSON.stringify(pedido)}\n`);
      
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
      
      // Obtenemos los valores actualizados de saldo y puntos del cliente (si es pago con crédito)
      let saldo = null;
      let puntos = null;
      if (metodo_pago === 'credito') {
        const { data: updatedCli } = await supabase
          .from('clientes')
          .select('saldo, puntos')
          .eq('id', req.user.id)
          .eq('empresa_id', empresa_id)
          .single();
        if (updatedCli) {
          saldo = parseFloat(updatedCli.saldo);
          puntos = parseInt(updatedCli.puntos || 0);
        }
      }

      res.status(201).json({
        success: true,
        message: 'Pedido registrado exitosamente',
        data: {
          pedido,
          detalles: detallesData,
          saldo,
          puntos
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
      
      // 1. Obtener todos los pedidos con sus detalles y productos en una sola consulta
      const { data: pedidos, error: pedidosError } = await supabase
        .from('pedidos')
        .select(`
          id,
          nombre_cliente,
          telefono_cliente,
          total,
          estado,
          created_at,
          detalles_pedido (
            id,
            cantidad,
            precio_unitario,
            productos (
              id,
              nombre,
              categoria
            )
          )
        `)
        .eq('empresa_id', empresa_id)
        .order('created_at', { ascending: false });
        
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
      const categoriasMap = {};
      pedidos.forEach(p => {
        if (p.detalles_pedido && Array.isArray(p.detalles_pedido)) {
          p.detalles_pedido.forEach(d => {
            const categoria = (d.productos && d.productos.categoria) ? d.productos.categoria : 'Sin categoría';
            categoriasMap[categoria] = (categoriasMap[categoria] || 0) + d.cantidad;
          });
        }
      });
      
      const graficoPastel = Object.entries(categoriasMap)
        .map(([categoria, cantidad]) => ({ categoria, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad);
      
      res.json({
        success: true,
        data: {
          ventasTotales,
          graficoLineas,
          graficoPastel,
          pedidos
        }
      });
      
    } catch (error) {
      console.error('Error al obtener analíticas:', error.message);
      res.status(500).json({ success: false, message: 'Error al obtener analíticas del servidor', error: error.message });
    }
  },

  // GET /api/pedidos/cliente
  obtenerPedidosCliente: async (req, res) => {
    try {
      const clienteId = req.user.id;
      
      // Vincular retroactivamente pedidos con cliente_id nulo pero con el mismo teléfono
      if (req.user.telefono) {
        await supabase
          .from('pedidos')
          .update({ cliente_id: clienteId })
          .is('cliente_id', null)
          .eq('telefono_cliente', req.user.telefono);
      }

      // Consultar todos los pedidos del cliente autenticado con sus detalles de productos
      const { data: pedidos, error: pedidosError } = await supabase
        .from('pedidos')
        .select(`
          id,
          nombre_cliente,
          telefono_cliente,
          total,
          estado,
          created_at,
          detalles_pedido (
            id,
            cantidad,
            precio_unitario,
            productos (
              id,
              nombre,
              imagen_url
            )
          )
        `)
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false });
        
      if (pedidosError) throw pedidosError;
      
      res.json({
        success: true,
        data: pedidos
      });
    } catch (error) {
      console.error('Error al obtener pedidos del cliente:', error.message);
      res.status(500).json({ success: false, message: 'Error al obtener el historial de pedidos', error: error.message });
    }
  }
};

module.exports = pedidosController;
