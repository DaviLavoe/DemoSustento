const supabase = require('../config/supabaseClient');

const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('--- [Auth Middleware] Authorization Header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('--- [Auth Middleware] No Bearer token found. Proceeding as public request.');
      return next();
    }

    const token = authHeader.split(' ')[1];
    
    // Verificar token con Supabase de forma nativa
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('--- [Auth Middleware] Token verification failed:', authError?.message);
      return res.status(401).json({ success: false, message: 'Token inválido o expirado', error: authError?.message });
    }

    console.log('--- [Auth Middleware] User authenticated successfully. ID:', user.id);

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

    console.log('--- [Auth Middleware] req.user set to:', req.user);
    next();
  } catch (error) {
    console.error('--- [Auth Middleware] Unexpected error:', error);
    next();
  }
};

module.exports = optionalAuthMiddleware;
