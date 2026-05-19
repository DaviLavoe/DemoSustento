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

// Rutas del API
app.use('/api/productos', productosRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo exitosamente en http://localhost:${PORT}`);
});
