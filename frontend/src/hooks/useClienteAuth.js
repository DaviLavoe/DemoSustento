import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { API_BASE_URL } from '../config/api';

export function useClienteAuth() {
  const [cliente, setCliente] = useState(null); // Contiene { id, email, nombre, telefono, direccion }
  const [loading, setLoading] = useState(true);
  const [pedidos, setPedidos] = useState([]);

  // Cargar sesión inicial y suscribirse a cambios de auth
  useEffect(() => {
    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const metadata = session.user.user_metadata || {};
          const clientData = {
            id: session.user.id,
            email: session.user.email,
            nombre: metadata.nombre || (metadata.rol === 'admin' ? 'Administrador' : 'Usuario'),
            telefono: metadata.telefono || '',
            direccion: metadata.direccion || '',
          };
          setCliente(clientData);
          loadPedidos();
        }
      } catch (err) {
        console.error('Error al comprobar sesión del cliente:', err);
      } finally {
        setLoading(false);
      }
    }

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const metadata = session.user.user_metadata || {};
        const clientData = {
          id: session.user.id,
          email: session.user.email,
          nombre: metadata.nombre || (metadata.rol === 'admin' ? 'Administrador' : 'Usuario'),
          telefono: metadata.telefono || '',
          direccion: metadata.direccion || '',
        };
        setCliente(clientData);
        loadPedidos();
      } else {
        setCliente(null);
        setPedidos([]);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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
        // Map the backend pedidos structure to match the frontend expectations:
        // id, fecha, total, estado, productos: [{ nombre, cantidad, precio }]
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

  // Registrar cliente con metadatos personalizados en Supabase Auth
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

      const user = data?.user;
      const metadata = user?.user_metadata || {};
      
      // Si por alguna razón un admin inicia sesión, permitimos pero asignamos rol cliente temporal
      const clientData = {
        id: user.id,
        email: user.email,
        nombre: metadata.nombre || 'Administrador',
        telefono: metadata.telefono || '',
        direccion: metadata.direccion || '',
      };
      
      setCliente(clientData);
      loadPedidos();
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
    } catch (err) {
      console.error('Error al cerrar sesión del cliente:', err);
      throw err;
    }
  };

  // Actualizar perfil (teléfono y dirección)
  const actualizarPerfil = async ({ nombre, telefono, direccion }) => {
    if (!cliente) return;
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          nombre,
          telefono,
          direccion,
        },
      });

      if (error) throw error;

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
  const registrarPedido = async (productos, total) => {
    if (!cliente) return null;
    try {
      await loadPedidos();
      return true;
    } catch (err) {
      console.error('Error al registrar pedido localmente:', err);
      return null;
    }
  };

  return {
    cliente,
    loading,
    pedidos,
    registrar,
    iniciarSesion,
    cerrarSesion,
    actualizarPerfil,
    registrarPedido,
  };
}
