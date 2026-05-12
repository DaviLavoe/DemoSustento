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

// Inicializar cliente de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan las credenciales de Supabase en el archivo .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Rutas
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido al API del Sistema de Gestión de Inventario' });
});

// Endpoint de prueba: Obtener productos
app.get('/api/productos', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*');

    if (error) {
      throw error;
    }

    res.json({ 
      success: true, 
      data 
    });
  } catch (error) {
    console.error('Error al obtener productos:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener productos', 
      error: error.message 
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo exitosamente en http://localhost:${PORT}`);
});
