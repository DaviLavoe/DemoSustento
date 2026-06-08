import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSupabaseClienteForSlug } from '../config/supabaseEmpresa';
import { API_BASE_URL } from '../config/api';

export function useClienteAuth() {
  const { slug } = useParams();
  const supabase = getSupabaseClienteForSlug(slug);
  const [cliente, setCliente] = useState(null); // Contiene { id, email, nombre, telefono, direccion }
  const [loading, setLoading] = useState(true);
  const [pedidos, setPedidos] = useState([]);
  const [tarjetas, setTarjetas] = useState([]);

  // Cargar sesión inicial y suscribirse a cambios de auth
  useEffect(() => {
    setLoading(true);
    let active = true;

    // Verificar sesión inicial
    async function checkInitialSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const response = await fetch(`${API_BASE_URL}/api/auth/cliente/validar-sesion`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ slug })
          });
          const resData = await response.json();
          if (active) {
            if (response.ok && resData.success) {
              setCliente(resData.cliente);
              loadPedidos();
              cargarTarjetas(session.access_token);
              setLoading(false);
            } else {
              console.warn('Fallo validación de sesión inicial de cliente:', resData.message);
              setCliente(null);
              setLoading(false);
              await supabase.auth.signOut();
            }
          }
        } else {
          if (active) {
            setCliente(null);
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('Error al comprobar sesión inicial:', err);
        if (active) {
          setCliente(null);
          setLoading(false);
        }
      }
    }

    checkInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Evitar procesar eventos redundantes durante la carga inicial
      if (event === 'INITIAL_SESSION') return;
      
      if (session?.user) {
        setLoading(true);
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/cliente/validar-sesion`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ slug })
          });
          const resData = await response.json();
          if (active) {
            if (response.ok && resData.success) {
              setCliente(resData.cliente);
              loadPedidos();
              cargarTarjetas(session.access_token);
              setLoading(false);
            } else {
              console.warn('Fallo validación de onAuthStateChange de cliente:', resData.message);
              setCliente(null);
              setLoading(false);
              await supabase.auth.signOut();
            }
          }
        } catch (err) {
          console.error('Error al validar sesión en onAuthStateChange:', err);
          if (active) {
            setCliente(null);
            setLoading(false);
          }
        }
      } else {
        if (active) {
          setCliente(null);
          setPedidos([]);
          setTarjetas([]);
          setLoading(false);
        }
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [slug]);

  // Cargar pedidos de la base de datos de Supabase para este cliente específico
  const loadPedidos = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${API_BASE_URL}/api/pedidos/cliente`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      const resData = await response.json();
      if (response.ok && resData.success) {
        const mappedPedidos = resData.data.map(p => ({
          id: p.id,
          fecha: p.created_at,
          total: parseFloat(p.total),
          estado: p.estado,
          productos: p.detalles_pedido.map(d => ({
            nombre: d.productos ? d.productos.nombre : 'Producto no disponible',
            cantidad: d.cantidad,
            precio: parseFloat(d.precio_unitario)
          }))
        }));
        setPedidos(mappedPedidos);
      } else {
        console.error('Error al cargar pedidos del backend:', resData.message);
      }
    } catch (err) {
      console.error('Error al cargar pedidos del cliente:', err);
      setPedidos([]);
    }
  };

  // Cargar tarjetas de la base de datos para este cliente
  const cargarTarjetas = async (providedToken = null) => {
    try {
      let token = providedToken;
      if (!token) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        token = session.access_token;
      }

      const response = await fetch(`${API_BASE_URL}/api/tarjetas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const resData = await response.json();
      if (response.ok && resData.success) {
        setTarjetas(resData.data);
      } else {
        console.error('Error al cargar tarjetas:', resData.message);
      }
    } catch (err) {
      console.error('Error al cargar tarjetas del cliente:', err);
    }
  };

  // Agregar tarjeta
  const agregarTarjeta = async ({ bank, number, holder, expiry, type }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No hay sesión activa');

      const response = await fetch(`${API_BASE_URL}/api/tarjetas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ bank, number, holder, expiry, type })
      });
      const resData = await response.json();
      if (response.ok && resData.success) {
        setTarjetas(prev => [...prev, resData.data]);
        return resData.data;
      } else {
        throw new Error(resData.message || 'Error al guardar tarjeta');
      }
    } catch (err) {
      console.error('Error al agregar tarjeta:', err);
      throw err;
    }
  };

  // Eliminar tarjeta
  const eliminarTarjeta = async (id) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No hay sesión activa');

      const response = await fetch(`${API_BASE_URL}/api/tarjetas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      const resData = await response.json();
      if (response.ok && resData.success) {
        setTarjetas(prev => prev.filter(t => t.id !== id));
        return true;
      } else {
        throw new Error(resData.message || 'Error al eliminar tarjeta');
      }
    } catch (err) {
      console.error('Error al eliminar tarjeta:', err);
      throw err;
    }
  };

  // Registrar cliente con metadatos personalizados en Supabase Auth y sincronizar a public.clientes
  const registrar = async ({ email, password, nombre, telefono, direccion }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            rol: 'cliente',
            nombre,
            telefono,
            direccion,
          },
        },
      });

      if (error) throw error;

      // Sincronizar con public.clientes usando el endpoint del backend
      if (data?.user) {
        const syncResponse = await fetch(`${API_BASE_URL}/api/auth/cliente/registrar-perfil`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: data.user.id,
            email,
            nombre,
            telefono,
            direccion,
            slug
          })
        });
        const syncData = await syncResponse.json();
        if (!syncResponse.ok || !syncData.success) {
          console.error('Error al registrar perfil de cliente en base de datos:', syncData.message);
        }
      }

      return data;
    } catch (err) {
      console.error('Error en registro de cliente:', err);
      throw err;
    }
  };

  // Iniciar sesión
  const iniciarSesion = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const session = data?.session;
      
      // Validar sesión contra el backend
      const response = await fetch(`${API_BASE_URL}/api/auth/cliente/validar-sesion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ slug })
      });
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        await supabase.auth.signOut();
        throw new Error(resData.message || 'No se pudo validar tu cuenta en esta empresa.');
      }
      
      setCliente(resData.cliente);
      loadPedidos();
      cargarTarjetas(session.access_token);
      return data;
    } catch (err) {
      console.error('Error en inicio de sesión de cliente:', err);
      throw err;
    }
  };

  // Cerrar sesión
  const cerrarSesion = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setCliente(null);
      setPedidos([]);
      setTarjetas([]);
    } catch (err) {
      console.error('Error al cerrar sesión del cliente:', err);
      throw err;
    }
  };

  // Actualizar perfil (teléfono y dirección)
  const actualizarPerfil = async ({ nombre, telefono, direccion }) => {
    if (!cliente) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No hay sesión activa');

      const { data, error } = await supabase.auth.updateUser({
        data: {
          nombre,
          telefono,
          direccion,
        },
      });

      if (error) throw error;

      // Actualizar en public.clientes vía backend
      const response = await fetch(`${API_BASE_URL}/api/auth/cliente/actualizar-perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ nombre, telefono, direccion, slug })
      });
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        console.error('Error al sincronizar actualización de perfil:', resData.message);
      }

      const updatedMetadata = data.user.user_metadata || {};
      const updatedClient = {
        ...cliente,
        nombre: updatedMetadata.nombre || nombre,
        telefono: updatedMetadata.telefono || telefono,
        direccion: updatedMetadata.direccion || direccion,
      };

      setCliente(updatedClient);
      return data;
    } catch (err) {
      console.error('Error al actualizar datos de entrega:', err);
      throw err;
    }
  };

  // Registrar un nuevo pedido en el historial del cliente (refrescando desde la DB)
  const registrarPedido = async (productos, total, updatedSaldo = null, updatedPuntos = null) => {
    if (!cliente) return null;
    try {
      if (updatedSaldo !== null || updatedPuntos !== null) {
        setCliente(prev => ({
          ...prev,
          ...(updatedSaldo !== null ? { saldo: updatedSaldo } : {}),
          ...(updatedPuntos !== null ? { puntos: updatedPuntos } : {})
        }));
      }
      await loadPedidos();
      return true;
    } catch (err) {
      console.error('Error al registrar pedido localmente:', err);
      return null;
    }
  };

  // Recargar saldo del cliente
  const recargarSaldo = async ({ amount, tarjetaId }) => {
    if (!cliente) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No hay sesión activa');

      const response = await fetch(`${API_BASE_URL}/api/auth/cliente/recargar-saldo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ amount, tarjetaId, slug })
      });
      const resData = await response.json();
      if (response.ok && resData.success) {
        setCliente(prev => ({
          ...prev,
          saldo: resData.saldo,
          puntos: resData.puntos
        }));
        return resData.saldo;
      } else {
        throw new Error(resData.message || 'Error al procesar la recarga');
      }
    } catch (err) {
      console.error('Error en recargarSaldo hook:', err);
      throw err;
    }
  };

  return {
    cliente,
    loading,
    pedidos,
    tarjetas,
    registrar,
    iniciarSesion,
    cerrarSesion,
    actualizarPerfil,
    registrarPedido,
    agregarTarjeta,
    eliminarTarjeta,
    cargarTarjetas,
    recargarSaldo
  };
}
