const supabase = require('./config/supabaseClient');

async function test() {
  try {
    const { data, error } = await supabase
      .from('empresas')
      .select('id, descripcion, direccion, banner_url, instagram_url, facebook_url, mensaje_bienvenida, activo')
      .limit(1);

    if (error) {
      console.log('Columns do not exist yet or error:', error.message);
    } else {
      console.log('Columns successfully verified. Data keys:', Object.keys(data[0] || {}));
    }
  } catch (err) {
    console.error('Execution err:', err);
  }
}

test();
