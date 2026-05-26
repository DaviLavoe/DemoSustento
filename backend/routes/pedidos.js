const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidosController');
const authMiddleware = require('../middlewares/authMiddleware');
const optionalAuthMiddleware = require('../middlewares/optionalAuthMiddleware');

// POST /api/pedidos — creación de pedidos (público / protegido)
router.post('/', optionalAuthMiddleware, pedidosController.crearPedido);

// GET /api/pedidos/analiticas — obtención de analíticas (protegido - solo administradores)
router.get('/analiticas', authMiddleware, pedidosController.obtenerAnaliticas);

module.exports = router;
