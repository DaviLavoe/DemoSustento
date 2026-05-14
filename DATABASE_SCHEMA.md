# Documentación de la Base de Datos (SaaS Inventario)

Este documento detalla la estructura, relaciones y políticas de seguridad de la base de datos principal de nuestro sistema SaaS Multitenant, alojada en Supabase.

## Arquitectura Multitenant (Multi-inquilino)
El sistema está diseñado para que **múltiples empresas** puedan usar la misma plataforma y base de datos, garantizando que los datos estén completamente aislados mediante el uso de Row Level Security (RLS). La clave de esta arquitectura es que todas las tablas importantes tienen una columna `empresa_id` que relaciona cada registro con su respectivo dueño.

---

## 1. Estructura de Tablas

### `empresas` (Tenants)
Esta es la tabla núcleo del sistema. Representa a cada negocio o cliente que contrata el software.
- `id`: Identificador único (UUID).
- `nombre`: Nombre del negocio.
- `slug`: Un identificador amigable para la URL pública del catálogo (ej. `misitio.com/catalogo/mi-empresa`). Debe ser único.
- `telefono_whatsapp`, `color_primario`, `logo_url`: Configuraciones del Micro CMS para personalizar el catálogo de la empresa.

### `usuarios` (Perfiles de acceso)
Almacena los perfiles del personal de las empresas. Está vinculada directamente al sistema de autenticación de Supabase (`auth.users`).
- `id`: UUID que coincide exactamente con el ID de autenticación de Supabase.
- `empresa_id`: Relaciona a este usuario con la empresa en la que trabaja.
- `rol`: Puede ser `admin` (dueño) o `vendedor`, permitiendo control de acceso granular en el futuro.

### `productos` (El Inventario)
Contiene el catálogo de ítems de todas las empresas.
- `id`: UUID único del producto.
- `empresa_id`: **Clave para el aislamiento.** Define a qué empresa pertenece este producto.
- `nombre`, `descripcion`, `precio`, `stock`, `categoria`, `imagen_url`: Detalles del producto.
- `activo`: Un switch (booleano) que permite a la empresa ocultar el producto del catálogo público sin tener que borrarlo.

### `pedidos` (Historial de Compras - Semana 4)
Almacenará las intenciones de compra generadas desde el catálogo público antes de derivarlas a WhatsApp.
- `empresa_id`: Para saber a qué negocio se le hizo el pedido.
- `nombre_cliente`, `telefono_cliente`, `total`, `estado`: Detalles del pedido.

---

## 2. Diagrama de Relaciones (Entidad-Relación)

* La tabla `empresas` tiene una relación de **1 a Muchos (1:N)** con `usuarios`. Una empresa tiene muchos empleados.
* La tabla `empresas` tiene una relación de **1 a Muchos (1:N)** con `productos`. Una empresa tiene su propio inventario.
* La tabla `empresas` tiene una relación de **1 a Muchos (1:N)** con `pedidos`.

Todos estos vínculos se mantienen usando el campo `empresa_id`. Si una empresa se elimina, gracias a la regla `ON DELETE CASCADE`, también se eliminarán todos sus usuarios, productos y pedidos para evitar datos huérfanos.

---

## 3. Seguridad y Aislamiento de Datos (RLS)

Hemos habilitado las políticas de Seguridad a Nivel de Fila (Row Level Security) en Supabase para garantizar la privacidad y seguridad:

1. **Aislamiento Total del Inventario:**
   Un usuario autenticado solo puede hacer operaciones (Ver, Insertar, Actualizar, Eliminar) en la tabla `productos` si el `empresa_id` de ese producto coincide con el `empresa_id` del usuario que está logueado. Esto impide que una empresa modifique o vea el stock de su competencia.

2. **Visibilidad Pública del Catálogo:**
   Existe una regla de "Solo Lectura" para la tabla `productos` que permite a cualquier persona (incluso sin estar logueada) ver los productos **siempre y cuando** la columna `activo` sea `true`. Esto es lo que permite que el catálogo público (la vitrina para clientes finales) funcione correctamente.

3. **Privacidad de la Empresa:**
   Un administrador solo puede consultar o actualizar los datos de la tabla `empresas` (como cambiar el logo o colores) de la empresa a la que pertenece.
