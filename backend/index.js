// Backend API - Semana 2: Core SaaS (Gestión de Inventario)
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuración de la aplicación
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Endpoint raíz
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido al API del Sistema de Gestión de Inventario' });
});

// Rutas
const productosRoutes = require('./routes/productos');
const catalogoRoutes = require('./routes/catalogo');
const authRoutes = require('./routes/auth');
const pedidosRoutes = require('./routes/pedidos');
const superadminRoutes = require('./routes/superadmin');
const tarjetasRoutes = require('./routes/tarjetas');

// Rutas del API
app.use('/api/productos', productosRoutes);
// Ruta pública — no requiere autenticación
app.use('/api/catalogo', catalogoRoutes);
// Ruta de autenticación y perfil de usuario
app.use('/api/auth', authRoutes);
// Ruta de pedidos y analíticas
app.use('/api/pedidos', pedidosRoutes);
// Ruta del panel Super-Admin (acceso exclusivo con rol 'superadmin')
app.use('/api/superadmin', superadminRoutes);
// Ruta para gestión de tarjetas de clientes
app.use('/api/tarjetas', tarjetasRoutes);

// Middleware para capturar rutas inexistentes (404)
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'La ruta solicitada no existe en este servidor API' });
});

// Middleware de manejo global de excepciones y errores
app.use((err, req, res, next) => {
  console.error('Error global no manejado:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno en el servidor API',
    error: process.env.NODE_ENV === 'development' ? err : undefined
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo exitosamente en http://localhost:${PORT}`);
});
