const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');
const clientAuthMiddleware = require('../middlewares/clientAuthMiddleware');

// GET /api/tarjetas — Obtiene las tarjetas del cliente autenticado
router.get('/', clientAuthMiddleware, async (req, res) => {
  try {
    const { data: tarjetas, error } = await supabase
      .from('tarjetas_pago')
      .select('*')
      .eq('cliente_id', req.user.id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json({ success: true, data: tarjetas });
  } catch (err) {
    console.error('Error al obtener tarjetas:', err);
    res.status(500).json({ success: false, message: 'Error al obtener las tarjetas', error: err.message });
  }
});

// POST /api/tarjetas — Agrega una tarjeta para el cliente autenticado
router.post('/', clientAuthMiddleware, async (req, res) => {
  try {
    const { bank, number, holder, expiry, type } = req.body;
    if (!bank || !number || !holder || !expiry || !type) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }

    const { data: tarjeta, error } = await supabase
      .from('tarjetas_pago')
      .insert({
        cliente_id: req.user.id,
        bank,
        number,
        holder,
        expiry,
        type
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data: tarjeta });
  } catch (err) {
    console.error('Error al agregar tarjeta:', err);
    res.status(500).json({ success: false, message: 'Error al guardar la tarjeta', error: err.message });
  }
});

// DELETE /api/tarjetas/:id — Elimina una tarjeta del cliente autenticado
router.delete('/:id', clientAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Primero verificamos pertenencia
    const { data: tarjetaExistente, error: getError } = await supabase
      .from('tarjetas_pago')
      .select('cliente_id')
      .eq('id', id)
      .single();

    if (getError || !tarjetaExistente) {
      return res.status(404).json({ success: false, message: 'Tarjeta no encontrada' });
    }

    if (tarjetaExistente.cliente_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Acceso denegado' });
    }

    const { error: deleteError } = await supabase
      .from('tarjetas_pago')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    res.json({ success: true, message: 'Tarjeta eliminada correctamente' });
  } catch (err) {
    console.error('Error al eliminar tarjeta:', err);
    res.status(500).json({ success: false, message: 'Error al eliminar la tarjeta', error: err.message });
  }
});

module.exports = router;
