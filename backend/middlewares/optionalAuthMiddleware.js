const supabase = require('../config/supabaseClient');
const fs = require('fs');
const path = require('path');

const optionalAuthMiddleware = async (req, res, next) => {
  const logFile = path.join(__dirname, '../auth_debug.log');
  const log = (msg) => {
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);
  };

  try {
    const authHeader = req.headers.authorization;
    log(`Authorization Header: ${authHeader || 'none'}`);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      log('No Bearer token found. Proceeding as public request.');
      return next();
    }

    const token = authHeader.split(' ')[1];
    log(`Token: ${token.substring(0, 15)}...`);
    
    // Verificar token con Supabase de forma nativa
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      log(`Token verification failed: ${authError?.message || 'No user returned'}`);
      return res.status(401).json({ success: false, message: 'Token inválido o expirado', error: authError?.message });
    }

    log(`User authenticated successfully. ID: ${user.id}`);

    // Obtener la empresa del usuario validado
    const { data: usuarioData, error: userError } = await supabase
      .from('usuarios')
      .select('empresa_id, rol')
      .eq('id', user.id)
      .single();

    req.user = {
      id: user.id,
      email: user.email,
      rol: usuarioData ? usuarioData.rol : (user.user_metadata?.rol || 'cliente'),
      telefono: user.user_metadata?.telefono || null
    };

    if (usuarioData) {
      req.user.empresa_id = usuarioData.empresa_id;
    }

    log(`req.user set to: ${JSON.stringify(req.user)}`);
    next();
  } catch (error) {
    log(`Unexpected error: ${error.message}\nStack: ${error.stack}`);
    next();
  }
};

module.exports = optionalAuthMiddleware;
