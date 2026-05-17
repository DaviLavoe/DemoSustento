const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');
const authMiddleware = require('../middlewares/authMiddleware');

// Proteger todas las rutas de este router con el middleware de autenticación
router.use(authMiddleware);

// Rutas CRUD para productos
router.get('/', productosController.obtenerProductos);
router.post('/', productosController.crearProducto);
router.put('/:id', productosController.actualizarProducto);
router.delete('/:id', productosController.eliminarProducto);

module.exports = router;
