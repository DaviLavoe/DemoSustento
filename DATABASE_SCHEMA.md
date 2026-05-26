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

### `configuracion_catalogo` (Personalización - Semana 3)
Contiene las configuraciones visuales y de contacto de la tienda. Relacionada 1:1 con `empresas`.
- `id`: UUID único.
- `empresa_id`: Relaciona la configuración a una empresa específica (Unique).
- `telefono_whatsapp`, `color_primario`, `logo_url`, `banner_url`, `mensaje_bienvenida`: Configuraciones de personalización del catálogo.

### `clientes` (Cuentas de Clientes - Semana 3)
Almacena los perfiles de los compradores de la vitrina digital.
- `id`: UUID del cliente.
- `empresa_id`: Relaciona al cliente con la empresa donde se registró.
- `nombre`, `email`, `telefono`, `direccion`: Datos personales de facturación y entrega.

### `pedidos` (Historial de Compras - Semana 4)
Almacena las intenciones de compra generadas desde el catálogo público.
- `id`: UUID del pedido.
- `empresa_id`: Para saber a qué negocio se le hizo el pedido.
- `nombre_cliente`, `telefono_cliente`, `total`, `estado`: Detalles generales.

### `detalles_pedido` (Detalles de compra - Semana 4)
Almacena los productos y cantidades incluidos en cada pedido. Relacionada N:1 con `pedidos`.
- `id`: UUID del detalle.
- `pedido_id`: Vincula al pedido principal.
- `producto_id`: Vincula al producto adquirido.
- `cantidad`, `precio_unitario`: Cantidad de ítems y precio de compra de cada uno.

---

## 2. Diagrama de Relaciones (Entidad-Relación)

* La tabla `empresas` tiene una relación de **1 a Muchos (1:N)** con `usuarios`. Una empresa tiene muchos empleados.
* La tabla `empresas` tiene una relación de **1 a Muchos (1:N)** con `productos`. Una empresa tiene su propio inventario.
* La tabla `empresas` tiene una relación de **1 a 1 (1:1)** con `configuracion_catalogo`.
* La tabla `empresas` tiene una relación de **1 a Muchos (1:N)** con `clientes`.
* La tabla `empresas` tiene una relación de **1 a Muchos (1:N)** con `pedidos`.
* La tabla `pedidos` tiene una relación de **1 a Muchos (1:N)** con `detalles_pedido`.

Todos estos vínculos se mantienen usando el campo `empresa_id` o `pedido_id`. Si una empresa se elimina, gracias a la regla `ON DELETE CASCADE`, también se eliminarán todos sus usuarios, productos, configuraciones, clientes y pedidos para evitar datos huérfanos.

---

## 3. Seguridad y Aislamiento de Datos (RLS)

Hemos habilitado las políticas de Seguridad a Nivel de Fila (Row Level Security) en Supabase para garantizar la privacidad y seguridad:

1. **Aislamiento Total del Inventario:**
   Un usuario autenticado solo puede hacer operaciones (Ver, Insertar, Actualizar, Eliminar) en la tabla `productos` si el `empresa_id` de ese producto coincide con el `empresa_id` del usuario que está logueado. Esto impide que una empresa modifique o vea el stock de su competencia.

2. **Visibilidad Pública del Catálogo:**
   Existe una regla de "Solo Lectura" para la tabla `productos` y la tabla `configuracion_catalogo` que permite a cualquier persona (incluso sin estar logueada) ver los productos **siempre y cuando** la columna `activo` sea `true` y consultar la información de marca. Esto es lo que permite que el catálogo público (la vitrina para clientes finales) funcione correctamente.

3. **Privacidad de la Empresa:**
   Un administrador solo puede consultar o actualizar los datos de la tabla `empresas` y `configuracion_catalogo` de la empresa a la que pertenece.

4. **Gestión de Clientes e Historial:**
   Una empresa solo puede consultar y gestionar los clientes (`clientes`) y pedidos (`pedidos`, `detalles_pedido`) registrados bajo su `empresa_id`. Asimismo, se habilitan permisos para inserción pública (`INSERT`) sin autenticar en pedidos y detalles para que los clientes finales puedan realizar su checkout desde la tienda.

---

## 4. Almacenamiento de Archivos (Supabase Storage)

Hemos configurado un bucket público de almacenamiento denominado `productos` con las siguientes políticas:
- **Lectura Pública:** Cualquier persona puede ver y renderizar las imágenes de los productos desde el catálogo público.
- **Escritura y Gestión Protegida:** Solo los usuarios autenticados de las empresas pueden subir (`INSERT`), actualizar (`UPDATE`) o eliminar (`DELETE`) imágenes en el bucket, manteniendo la integridad del almacenamiento del tenant.
