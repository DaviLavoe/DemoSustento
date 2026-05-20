const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');

// GET /api/catalogo/:slug  — ruta pública, sin autenticación
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;

  try {
    // 1. Obtener empresa por slug
    const { data: empresa, error: empresaError } = await supabase
      .from('empresas')
      .select('*')
      .eq('slug', slug)
      .single();

    if (empresaError || !empresa) {
      return res.status(404).json({
        success: false,
        message: `No se encontró ninguna empresa con el slug: ${slug}`
      });
    }

    // 2. Obtener productos activos de esa empresa
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select('id, nombre, descripcion, precio, stock, categoria, imagen_url, activo')
      .eq('empresa_id', empresa.id)
      .eq('activo', true)
      .order('nombre', { ascending: true });

    if (productosError) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener los productos',
        error: productosError.message
      });
    }

    res.json({
      success: true,
      empresa: {
        id: empresa.id,
        nombre: empresa.nombre,
        slug: empresa.slug,
        descripcion: empresa.descripcion || null,
        telefono_whatsapp: empresa.telefono_whatsapp || null,
        logo_url: empresa.logo_url || null,
        color_primario: empresa.color_primario || '#1a1a1a'
      },
      productos: productos || []
    });

  } catch (err) {
    console.error('Error en /api/catalogo/:slug:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

module.exports = router;
