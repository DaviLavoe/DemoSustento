# Checklist de Tareas - SaaS Inventario

> **Nota para la IA y el Equipo:** Al iniciar una nueva sesión de trabajo, revisemos este archivo para conocer el progreso actual del proyecto y saber exactamente qué sigue. Podemos marcar las casillas usando `[x]`.

## Semana 1: Arquitectura, Base de Datos y Autenticación
- [x] **Davi:** Inicializar proyecto React con Vite y configurar TailwindCSS.
- [x] **Davi:** Configurar enrutamiento y crear vistas de Login/Registro.
- [x] **Davi:** Integrar Login/Registro directo con Supabase Auth en el Frontend.
- [x] **Davi:** Restructuración visual del Login (Integración de modelo 3D Spline).
- [x] **Davi:** Integración del icono "Ojo" para ver/ocultar contraseña en Login.
- [x] **Davi:** Integración de "Click Spark" para interactividad visual.
- [x] **Davi:** Reconfiguración de `supabase.js` y manejo seguro de `.env` en front.
- [x] **Angelo:** Configuración básica del servidor Node.js/Express. *(¡Listo!)*
- [x] **Angelo:** Estructurar carpetas del backend (rutas, controladores, middlewares).
- [x] **Angelo:** Crear middleware JWT para proteger rutas del API.
- [x] **Javicho:** Crear tablas en Supabase (`empresas`, `usuarios`, `productos`).
- [x] **Javicho:** Configurar Row Level Security (RLS) en Supabase.

## Semana 2: Core SaaS (Gestión de Inventario)
- [x] **Davi:** UI del Dashboard (Layout principal).
- [x] **Davi:** Vistas y modales de CRUD de productos.
- [x] **Angelo:** Endpoints POST, PUT, DELETE para `productos`.
- [x] **Javicho:** Configurar Supabase Storage para imágenes.
- [x] **Javicho/Davi:** Integrar subida de imágenes.
- [x] **Javicho/Davi:** Solución al bug de carga infinita del inventario al desmontar/montar vistas (implementación de limpieza con AbortController).

## Semana 3: Micro-CMS, Catálogo Público y Cuentas de Clientes
- [x] **Davi/Javicho:** Vista pública del catálogo (`/catalogo/:slug`) conectado dinámicamente al backend (limpieza de datos demo).
- [x] **Davi:** Login/Registro de Clientes y panel de "Mi Cuenta" (Pedidos y Dirección).
- [x] **Angelo/Javicho:** Endpoints públicos GET para datos de empresa y productos del catálogo (`/api/catalogo/:slug`).
- [x] **Javicho:** Crear endpoint autenticado `/api/auth/me` para obtener los datos de la empresa del usuario activo de forma segura en el dashboard.
- [x] **Javicho:** Crear tabla `configuracion_catalogo`.
- [x] **Javicho:** Crear tabla `clientes` y configurar políticas RLS de seguridad.

## Semana 4: Carrito, Checkout y Reportes Animados
- [x] **Davi:** Lógica del carrito de compras y checkout UI pre-rellenado.
- [x] **Davi:** Generar enlace `wa.me` dinámico.
- [x] **Davi:** Dashboard Admin: Reportes y estadísticas con gráficos animados (Recharts).
- [x] **Angelo:** Endpoint para registrar pedidos y consultar analíticas de ventas.
- [x] **Javicho:** Tablas `pedidos` y `detalles_pedido`.
- [x] **Javicho:** Programar trigger de base de datos para reducción de stock automática.

## Semana 5: Pruebas, Refinamiento y Despliegue
- [ ] **Davi:** Pulido UI/UX y Mobile First.
- [ ] **Angelo:** Manejo de excepciones y refactorización.
- [ ] **Javicho:** Despliegues en Vercel, Render y pruebas de seguridad en Supabase.
