const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const supabase = require('../config/supabaseClient');

// GET /api/auth/me — devuelve el usuario y su empresa
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { empresa_id, rol, id } = req.user;

    const { data: empresa, error } = await supabase
      .from('empresas')
      .select('id, nombre, slug, logo_url, telefono_whatsapp, color_primario')
      .eq('id', empresa_id)
      .single();

    if (error || !empresa) {
      return res.status(404).json({ success: false, message: 'Empresa no encontrada' });
    }

    res.json({
      success: true,
      user: { id, rol },
      empresa
    });
  } catch (err) {
    console.error('Error en /api/auth/me:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// PUT /api/auth/empresa — actualiza la configuración de la empresa
router.put('/empresa', authMiddleware, async (req, res) => {
  try {
    const { empresa_id, rol } = req.user;

    // Solo los administradores pueden editar la empresa
    if (rol !== 'admin') {
      return res.status(403).json({ success: false, message: 'Acceso denegado: Solo administradores pueden configurar la empresa' });
    }

    const { nombre, color_primario, telefono_whatsapp, logo_url } = req.body;

    if (!nombre) {
      return res.status(400).json({ success: false, message: 'El nombre de la empresa es obligatorio' });
    }

    const { data: empresa, error } = await supabase
      .from('empresas')
      .update({
        nombre,
        color_primario: color_primario || '#1a1a1a',
        telefono_whatsapp: telefono_whatsapp || null,
        logo_url: logo_url || null
      })
      .eq('id', empresa_id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Configuración actualizada con éxito',
      empresa
    });
  } catch (err) {
    console.error('Error en PUT /api/auth/empresa:', err);
    res.status(500).json({ success: false, message: 'Error al actualizar la configuración de la empresa', error: err.message });
  }
});

module.exports = router;
