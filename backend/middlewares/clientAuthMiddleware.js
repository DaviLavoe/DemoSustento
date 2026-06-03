const supabase = require('../config/supabaseClient');

const clientAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No se proporcionó token de autenticación (Bearer token requerido)' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verificar token con Supabase de forma nativa
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ success: false, message: 'Token inválido o expirado', error: authError?.message });
    }

    // Adjuntar la info al request
    req.user = {
      id: user.id,
      email: user.email,
      rol: user.user_metadata?.rol || 'cliente',
      telefono: user.user_metadata?.telefono || null
    };

    next();
  } catch (error) {
    console.error('Error en middleware de autenticación del cliente:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor al validar token del cliente' });
  }
};

module.exports = clientAuthMiddleware;
