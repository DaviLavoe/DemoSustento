import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

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
          // Validamos que sea un cliente
          if (metadata.rol === 'cliente') {
            const clientData = {
              id: session.user.id,
              email: session.user.email,
              nombre: metadata.nombre || '',
              telefono: metadata.telefono || '',
              direccion: metadata.direccion || '',
            };
            setCliente(clientData);
            loadPedidos(session.user.id);
          }
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
        if (metadata.rol === 'cliente') {
          const clientData = {
            id: session.user.id,
            email: session.user.email,
            nombre: metadata.nombre || '',
            telefono: metadata.telefono || '',
            direccion: metadata.direccion || '',
          };
          setCliente(clientData);
          loadPedidos(session.user.id);
        }
      } else {
        setCliente(null);
        setPedidos([]);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Cargar pedidos guardados en LocalStorage para este cliente específico
  const loadPedidos = (clienteId) => {
    try {
      const stored = localStorage.getItem(`pedidos_cliente_${clienteId}`);
      if (stored) {
        setPedidos(JSON.parse(stored));
      } else {
        setPedidos([]);
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
      loadPedidos(user.id);
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

  // Guardar un nuevo pedido en el historial del cliente
  const registrarPedido = (productos, total) => {
    if (!cliente) return null;
    try {
      const nuevoPedido = {
        id: `PED-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        fecha: new Date().toISOString(),
        productos: productos.map(p => ({
          nombre: p.nombre,
          cantidad: p.cantidad,
          precio: p.precio,
        })),
        total,
      };

      const nuevosPedidos = [nuevoPedido, ...pedidos];
      localStorage.setItem(`pedidos_cliente_${cliente.id}`, JSON.stringify(nuevosPedidos));
      setPedidos(nuevosPedidos);
      return nuevoPedido;
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
