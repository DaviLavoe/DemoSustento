const supabase = require('../config/supabaseClient');

const authMiddleware = async (req, res, next) => {
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

    // Obtener la empresa del usuario validado
    const { data: usuarioData, error: userError } = await supabase
      .from('usuarios')
      .select('empresa_id, rol')
      .eq('id', user.id)
      .single();

    if (userError || !usuarioData) {
      return res.status(403).json({ success: false, message: 'Usuario no tiene una empresa asociada en el sistema' });
    }

    // Adjuntar la info al request para que los controladores puedan usar req.user.empresa_id
    req.user = {
      id: user.id,
      empresa_id: usuarioData.empresa_id,
      rol: usuarioData.rol
    };

    next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor al validar token' });
  }
};

module.exports = authMiddleware;
