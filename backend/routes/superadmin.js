const express = require('express');
const router = express.Router();
const superAdminMiddleware = require('../middlewares/superAdminMiddleware');
const supabase = require('../config/supabaseClient');

// Proteger TODAS las rutas de este router con el middleware de super-admin
router.use(superAdminMiddleware);

// ─────────────────────────────────────────────
// GET /api/superadmin/empresas
// Lista todas las empresas del sistema con métricas básicas
// ─────────────────────────────────────────────
router.get('/empresas', async (req, res) => {
  try {
    // Obtener todas las empresas
    const { data: empresas, error } = await supabase
      .from('empresas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Para cada empresa, obtener conteos de productos, pedidos y clientes
    const empresasConMetricas = await Promise.all(
      empresas.map(async (empresa) => {
        const [productosRes, pedidosRes, clientesRes] = await Promise.all([
          supabase.from('productos').select('id', { count: 'exact', head: true }).eq('empresa_id', empresa.id),
          supabase.from('pedidos').select('id', { count: 'exact', head: true }).eq('empresa_id', empresa.id),
          supabase.from('clientes').select('id', { count: 'exact', head: true }).eq('empresa_id', empresa.id),
        ]);

        return {
          ...empresa,
          total_productos: productosRes.count ?? 0,
          total_pedidos: pedidosRes.count ?? 0,
          total_clientes: clientesRes.count ?? 0,
        };
      })
    );

    res.json({ success: true, empresas: empresasConMetricas });
  } catch (err) {
    console.error('Error en GET /api/superadmin/empresas:', err);
    res.status(500).json({ success: false, message: 'Error al obtener las empresas', error: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/superadmin/empresas
// Crea una nueva empresa en el sistema
// ─────────────────────────────────────────────
router.post('/empresas', async (req, res) => {
  try {
    const { 
      nombre, slug, color_primario, telefono_whatsapp, logo_url,
      descripcion, direccion, email_contacto, banner_url,
      instagram_url, facebook_url, mensaje_bienvenida, activo
    } = req.body;

    if (!nombre || !slug) {
      return res.status(400).json({ success: false, message: 'El nombre y el slug son obligatorios' });
    }

    // Verificar que el slug no esté en uso
    const { data: existing } = await supabase
      .from('empresas')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      return res.status(409).json({ success: false, message: `El slug "${slug}" ya está en uso por otra empresa` });
    }

    const { data: empresa, error } = await supabase
      .from('empresas')
      .insert({
        nombre,
        slug: slug.toLowerCase().replace(/\s+/g, '-'),
        color_primario: color_primario || '#1a1a1a',
        telefono_whatsapp: telefono_whatsapp || null,
        logo_url: logo_url || null,
        descripcion: descripcion || null,
        direccion: direccion || null,
        email_contacto: email_contacto || null,
        banner_url: banner_url || null,
        instagram_url: instagram_url || null,
        facebook_url: facebook_url || null,
        mensaje_bienvenida: mensaje_bienvenida || null,
        activo: activo !== undefined ? activo : true
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, message: 'Empresa creada exitosamente', empresa });
  } catch (err) {
    console.error('Error en POST /api/superadmin/empresas:', err);
    res.status(500).json({ success: false, message: 'Error al crear la empresa', error: err.message });
  }
});

// ─────────────────────────────────────────────
// PUT /api/superadmin/empresas/:id
// Edita los datos de una empresa existente
// ─────────────────────────────────────────────
router.put('/empresas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nombre, slug, color_primario, telefono_whatsapp, logo_url,
      descripcion, direccion, email_contacto, banner_url,
      instagram_url, facebook_url, mensaje_bienvenida, activo
    } = req.body;

    if (!nombre) {
      return res.status(400).json({ success: false, message: 'El nombre de la empresa es obligatorio' });
    }

    const { data: empresa, error } = await supabase
      .from('empresas')
      .update({
        nombre,
        slug: slug ? slug.toLowerCase().replace(/\s+/g, '-') : undefined,
        color_primario: color_primario || '#1a1a1a',
        telefono_whatsapp: telefono_whatsapp || null,
        logo_url: logo_url || null,
        descripcion: descripcion || null,
        direccion: direccion || null,
        email_contacto: email_contacto || null,
        banner_url: banner_url || null,
        instagram_url: instagram_url || null,
        facebook_url: facebook_url || null,
        mensaje_bienvenida: mensaje_bienvenida || null,
        activo: activo !== undefined ? activo : true
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, message: 'Empresa actualizada exitosamente', empresa });
  } catch (err) {
    console.error('Error en PUT /api/superadmin/empresas/:id:', err);
    res.status(500).json({ success: false, message: 'Error al actualizar la empresa', error: err.message });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/superadmin/empresas/:id
// Elimina una empresa (CASCADE en BD borra todo)
// ─────────────────────────────────────────────
router.delete('/empresas/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('empresas')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Empresa eliminada exitosamente' });
  } catch (err) {
    console.error('Error en DELETE /api/superadmin/empresas/:id:', err);
    res.status(500).json({ success: false, message: 'Error al eliminar la empresa', error: err.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/superadmin/estadisticas
// Retorna métricas globales de toda la plataforma
// ─────────────────────────────────────────────
router.get('/estadisticas', async (req, res) => {
  try {
    const [
      empresasRes,
      productosRes,
      pedidosRes,
      clientesRes,
      ingresosTotalesRes,
      pedidosRecientesRes,
    ] = await Promise.all([
      supabase.from('empresas').select('id', { count: 'exact', head: true }),
      supabase.from('productos').select('id', { count: 'exact', head: true }),
      supabase.from('pedidos').select('id', { count: 'exact', head: true }),
      supabase.from('clientes').select('id', { count: 'exact', head: true }),
      supabase.from('pedidos').select('total'),
      // Pedidos de los últimos 30 días con empresa y total
      supabase
        .from('pedidos')
        .select('created_at, total, empresa_id, empresas(nombre)')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true }),
    ]);

    const ingresosTotales = (ingresosTotalesRes.data || []).reduce(
      (acc, p) => acc + parseFloat(p.total || 0),
      0
    );

    // Top 5 empresas por número de pedidos
    const { data: topEmpresas } = await supabase
      .from('pedidos')
      .select('empresa_id, empresas(nombre)')
      .limit(1000);

    const empresaConteos = {};
    (topEmpresas || []).forEach((p) => {
      const nombre = p.empresas?.nombre || 'Desconocida';
      empresaConteos[nombre] = (empresaConteos[nombre] || 0) + 1;
    });
    const rankingEmpresas = Object.entries(empresaConteos)
      .map(([nombre, pedidos]) => ({ nombre, pedidos }))
      .sort((a, b) => b.pedidos - a.pedidos)
      .slice(0, 5);

    res.json({
      success: true,
      resumen: {
        total_empresas: empresasRes.count ?? 0,
        total_productos: productosRes.count ?? 0,
        total_pedidos: pedidosRes.count ?? 0,
        total_clientes: clientesRes.count ?? 0,
        ingresos_totales: ingresosTotales,
      },
      pedidos_recientes: pedidosRecientesRes.data || [],
      ranking_empresas: rankingEmpresas,
    });
  } catch (err) {
    console.error('Error en GET /api/superadmin/estadisticas:', err);
    res.status(500).json({ success: false, message: 'Error al obtener estadísticas globales', error: err.message });
  }
});

// ─────────────────────────────────────────────
// GESTIÓN DE USUARIOS SUPER-ADMIN
// ─────────────────────────────────────────────

// GET /api/superadmin/usuarios
// Lista todos los superadmins en el sistema
router.get('/usuarios', async (req, res) => {
  try {
    const { data: dbUsers, error: dbError } = await supabase
      .from('usuarios')
      .select('id, nombre, rol, created_at')
      .eq('rol', 'superadmin')
      .order('created_at', { ascending: false });

    if (dbError) throw dbError;

    // Obtener los detalles desde auth para mapear el email
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
    console.error('Error en GET /api/superadmin/usuarios:', err);
    res.status(500).json({ success: false, message: 'Error al obtener usuarios', error: err.message });
  }
});

// POST /api/superadmin/usuarios
// Crea un nuevo usuario super-admin
router.post('/usuarios', async (req, res) => {
  try {
    const { email, password, nombre, rol } = req.body;

    if (!email || !password || !nombre || !rol) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }

    if (rol !== 'superadmin') {
      return res.status(400).json({ success: false, message: 'Rol no permitido para esta sección' });
    }

    // 1. Crear el usuario en auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: nombre }
    });

    if (authError) throw authError;

    // 2. Insertar en public.usuarios
    const { error: dbError } = await supabase
      .from('usuarios')
      .insert({
        id: authData.user.id,
        nombre,
        rol,
        empresa_id: null
      });

    if (dbError) {
      // Revertir creación en auth si falla la base de datos
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw dbError;
    }

    res.status(201).json({ success: true, message: 'Super-administrador creado con éxito' });
  } catch (err) {
    console.error('Error en POST /api/superadmin/usuarios:', err);
    res.status(500).json({ success: false, message: 'Error al crear el usuario', error: err.message });
  }
});

// DELETE /api/superadmin/usuarios/:id
// Elimina un usuario super-admin
router.delete('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Borrar de auth.users (cascadea o borramos manualmente)
    const { error: authError } = await supabase.auth.admin.deleteUser(id);
    if (authError) throw authError;

    // Borrado explícito
    await supabase.from('usuarios').delete().eq('id', id);

    res.json({ success: true, message: 'Super-administrador eliminado correctamente' });
  } catch (err) {
    console.error('Error en DELETE /api/superadmin/usuarios/:id:', err);
    res.status(500).json({ success: false, message: 'Error al eliminar el usuario', error: err.message });
  }
});

// PUT /api/superadmin/usuarios/:id
// Edita un usuario super-admin
router.put('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });
    }

    // 1. Actualizar datos en Auth
    const authUpdates = {
      user_metadata: { name: nombre }
    };
    if (email) {
      authUpdates.email = email;
      authUpdates.email_confirm = true;
    }
    if (password) {
      authUpdates.password = password;
    }

    const { error: authError } = await supabase.auth.admin.updateUserById(id, authUpdates);
    if (authError) throw authError;

    // 2. Actualizar en public.usuarios
    const { error: dbError } = await supabase
      .from('usuarios')
      .update({ nombre })
      .eq('id', id);

    if (dbError) throw dbError;

    res.json({ success: true, message: 'Super-administrador actualizado con éxito' });
  } catch (err) {
    console.error('Error en PUT /api/superadmin/usuarios/:id:', err);
    res.status(500).json({ success: false, message: 'Error al actualizar el usuario', error: err.message });
  }
});


// ─────────────────────────────────────────────
// GESTIÓN DE USUARIOS DE EMPRESA (desde SuperAdmin)
// ─────────────────────────────────────────────

// GET /api/superadmin/empresas/:empresaId/usuarios
// Lista todos los usuarios de una empresa específica
router.get('/empresas/:empresaId/usuarios', async (req, res) => {
  try {
    const { empresaId } = req.params;

    const { data: dbUsers, error: dbError } = await supabase
      .from('usuarios')
      .select('id, nombre, rol, created_at')
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: false });

    if (dbError) throw dbError;

    // Mapear emails desde auth
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;

    const usersWithEmail = dbUsers.map(user => {
      const authUser = authData.users.find(u => u.id === user.id);
      return { ...user, email: authUser ? authUser.email : 'N/A' };
    });

    res.json({ success: true, usuarios: usersWithEmail });
  } catch (err) {
    console.error('Error en GET /api/superadmin/empresas/:empresaId/usuarios:', err);
    res.status(500).json({ success: false, message: 'Error al obtener los usuarios de la empresa', error: err.message });
  }
});

// POST /api/superadmin/empresas/:empresaId/usuarios
// Crea un usuario (admin o vendedor) para una empresa específica
router.post('/empresas/:empresaId/usuarios', async (req, res) => {
  try {
    const { empresaId } = req.params;
    const { email, password, nombre, rol } = req.body;

    if (!email || !password || !nombre || !rol) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }

    if (rol !== 'admin' && rol !== 'vendedor') {
      return res.status(400).json({ success: false, message: 'Rol inválido. Debe ser "admin" o "vendedor"' });
    }

    // Verificar que la empresa existe
    const { data: empresa, error: empresaError } = await supabase
      .from('empresas')
      .select('id, nombre')
      .eq('id', empresaId)
      .single();

    if (empresaError || !empresa) {
      return res.status(404).json({ success: false, message: 'Empresa no encontrada' });
    }

    // 1. Crear en auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: nombre }
    });

    if (authError) throw authError;

    // 2. Insertar en public.usuarios con empresa_id
    const { error: dbError } = await supabase
      .from('usuarios')
      .insert({
        id: authData.user.id,
        nombre,
        rol,
        empresa_id: empresaId
      });

    if (dbError) {
      // Revertir
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw dbError;
    }

    res.status(201).json({ success: true, message: `Usuario "${nombre}" creado para ${empresa.nombre}` });
  } catch (err) {
    console.error('Error en POST /api/superadmin/empresas/:empresaId/usuarios:', err);
    res.status(500).json({ success: false, message: 'Error al crear el usuario de empresa', error: err.message });
  }
});

// DELETE /api/superadmin/empresas/:empresaId/usuarios/:userId
// Elimina un usuario de empresa (solo superadmin puede hacer esto)
router.delete('/empresas/:empresaId/usuarios/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Borrar de auth (cascadeará a public.usuarios si hay FK cascade, o borrar manualmente)
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) throw authError;

    await supabase.from('usuarios').delete().eq('id', userId);

    res.json({ success: true, message: 'Usuario de empresa eliminado correctamente' });
  } catch (err) {
    console.error('Error en DELETE /api/superadmin/empresas/:empresaId/usuarios/:userId:', err);
    res.status(500).json({ success: false, message: 'Error al eliminar el usuario', error: err.message });
  }
});

module.exports = router;

