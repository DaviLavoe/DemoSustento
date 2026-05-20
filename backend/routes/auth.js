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

module.exports = router;
