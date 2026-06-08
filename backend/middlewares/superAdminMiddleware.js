const supabase = require('../config/supabaseClient');

/**
 * Middleware de Super-Admin
 * Extiende la validación de authMiddleware: además de verificar el token JWT,
 * comprueba que el usuario tenga el rol 'superadmin' en la tabla de usuarios.
 */
const superAdminMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No se proporcionó token de autenticación (Bearer token requerido)' });
    }

    const token = authHeader.split(' ')[1];

    // Verificar token con Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Error de autenticación de superadmin (backend):', authError || 'Usuario no encontrado');
      return res.status(401).json({ success: false, message: 'Token inválido o expirado', error: authError?.message });
    }

    // Obtener el rol del usuario
    const { data: usuarioData, error: userError } = await supabase
      .from('usuarios')
      .select('empresa_id, rol')
      .eq('id', user.id)
      .single();

    if (userError || !usuarioData) {
      return res.status(403).json({ success: false, message: 'Usuario no registrado en el sistema' });
    }

    // Verificar que sea superadmin
    if (usuarioData.rol !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Acceso denegado: Se requieren permisos de Super-Administrador' });
    }

    // Adjuntar la info al request
    req.user = {
      id: user.id,
      empresa_id: usuarioData.empresa_id, // null para superadmin
      rol: usuarioData.rol
    };

    next();
  } catch (error) {
    console.error('Error en middleware de super-admin:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor al validar permisos' });
  }
};

module.exports = superAdminMiddleware;
