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
      .select('*')
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

    const { 
      nombre, color_primario, telefono_whatsapp, logo_url,
      descripcion, direccion, email_contacto, banner_url,
      instagram_url, facebook_url, mensaje_bienvenida
    } = req.body;

    if (!nombre) {
      return res.status(400).json({ success: false, message: 'El nombre de la empresa es obligatorio' });
    }

    const { data: empresa, error } = await supabase
      .from('empresas')
      .update({
        nombre,
        color_primario: color_primario || '#1a1a1a',
        telefono_whatsapp: telefono_whatsapp || null,
        logo_url: logo_url || null,
        descripcion: descripcion || null,
        direccion: direccion || null,
        email_contacto: email_contacto || null,
        banner_url: banner_url || null,
        instagram_url: instagram_url || null,
        facebook_url: facebook_url || null,
        mensaje_bienvenida: mensaje_bienvenida || null
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

// ─────────────────────────────────────────────
// GESTIÓN DE COLABORADORES/TRABAJADORES DE EMPRESA
// ─────────────────────────────────────────────

// GET /api/auth/usuarios
// Obtiene todos los trabajadores de la empresa actual
router.get('/usuarios', authMiddleware, async (req, res) => {
  try {
    const { empresa_id, rol } = req.user;

    // Solo permitir a admins listar colaboradores
    if (rol !== 'admin') {
      return res.status(403).json({ success: false, message: 'Acceso denegado: Se requiere rol de Administrador' });
    }

    // Obtener de public.usuarios
    const { data: dbUsers, error: dbError } = await supabase
      .from('usuarios')
      .select('id, nombre, rol, created_at')
      .eq('empresa_id', empresa_id)
      .order('created_at', { ascending: false });

    if (dbError) throw dbError;

    // Obtener correos desde auth
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;

    const usersWithEmail = dbUsers.map(user => {
      const authUser = authData.users.find(u => u.id === user.id);
      return {
        ...user,
        email: authUser ? authUser.email : 'N/A'
      };
    });

    res.json({ success: true, usuarios: usersWithEmail });
  } catch (err) {
    console.error('Error en GET /api/auth/usuarios:', err);
    res.status(500).json({ success: false, message: 'Error al obtener los trabajadores', error: err.message });
  }
});

// POST /api/auth/usuarios
// Crea un nuevo colaborador en la empresa
router.post('/usuarios', authMiddleware, async (req, res) => {
  try {
    const { email, password, nombre, rol } = req.body;
    const { empresa_id, rol: userRol } = req.user;

    if (userRol !== 'admin') {
      return res.status(403).json({ success: false, message: 'Acceso denegado: Solo administradores pueden crear colaboradores' });
    }

    if (!email || !password || !nombre || !rol) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }

    if (rol !== 'admin' && rol !== 'vendedor') {
      return res.status(400).json({ success: false, message: 'Rol inválido. Debe ser admin o vendedor' });
    }

    // 1. Crear en auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: nombre }
    });

    if (authError) throw authError;

    // 2. Crear en public.usuarios
    const { error: dbError } = await supabase
      .from('usuarios')
      .insert({
        id: authData.user.id,
        nombre,
        rol,
        empresa_id
      });

    if (dbError) {
      // Revertir
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw dbError;
    }

    res.status(201).json({ success: true, message: 'Colaborador creado con éxito' });
  } catch (err) {
    console.error('Error en POST /api/auth/usuarios:', err);
    res.status(500).json({ success: false, message: 'Error al crear el colaborador', error: err.message });
  }
});

// DELETE /api/auth/usuarios/:id
// Elimina un colaborador de la empresa
router.delete('/usuarios/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { empresa_id, rol: userRol, id: adminId } = req.user;

    if (userRol !== 'admin') {
      return res.status(403).json({ success: false, message: 'Acceso denegado: Solo administradores pueden dar de baja colaboradores' });
    }

    if (id === adminId) {
      return res.status(400).json({ success: false, message: 'No puedes eliminarte a ti mismo de la empresa' });
    }

    // Verificar pertenencia
    const { data: targetUser, error: checkError } = await supabase
      .from('usuarios')
      .select('empresa_id')
      .eq('id', id)
      .single();

    if (checkError || !targetUser) {
      return res.status(404).json({ success: false, message: 'Colaborador no encontrado' });
    }

    if (targetUser.empresa_id !== empresa_id) {
      return res.status(403).json({ success: false, message: 'Acceso denegado: El colaborador no pertenece a tu empresa' });
    }

    // 1. Borrar de auth
    const { error: authError } = await supabase.auth.admin.deleteUser(id);
    if (authError) throw authError;

    // 2. Borrar de public.usuarios
    await supabase.from('usuarios').delete().eq('id', id);

    res.json({ success: true, message: 'Colaborador eliminado correctamente' });
  } catch (err) {
    console.error('Error en DELETE /api/auth/usuarios/:id:', err);
    res.status(500).json({ success: false, message: 'Error al eliminar el colaborador', error: err.message });
  }
});

module.exports = router;
