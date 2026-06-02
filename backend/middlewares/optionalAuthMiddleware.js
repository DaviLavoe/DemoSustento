const supabase = require('../config/supabaseClient');

const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Si no hay token, continuar como petición pública
      return next();
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

    req.user = {
      id: user.id,
      email: user.email,
      rol: usuarioData ? usuarioData.rol : (user.user_metadata?.rol || 'cliente')
    };

    if (usuarioData) {
      req.user.empresa_id = usuarioData.empresa_id;
    }

    next();
  } catch (error) {
    console.error('Error en middleware de autenticación opcional:', error);
    // En caso de error inesperado, continuamos como petición pública
    next();
  }
};

module.exports = optionalAuthMiddleware;
