const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidosController');
const authMiddleware = require('../middlewares/authMiddleware');
const optionalAuthMiddleware = require('../middlewares/optionalAuthMiddleware');
const clientAuthMiddleware = require('../middlewares/clientAuthMiddleware');

// POST /api/pedidos — creación de pedidos (público / protegido)
router.post('/', optionalAuthMiddleware, pedidosController.crearPedido);

// GET /api/pedidos/analiticas — obtención de analíticas (protegido - solo administradores)
router.get('/analiticas', authMiddleware, pedidosController.obtenerAnaliticas);

// GET /api/pedidos/cliente — obtener historial de pedidos del cliente (autenticado)
router.get('/cliente', clientAuthMiddleware, pedidosController.obtenerPedidosCliente);

module.exports = router;
