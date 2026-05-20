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
- [ ] **Javicho:** Configurar Supabase Storage para imágenes.
- [ ] **Javicho/Davi:** Integrar subida de imágenes.

## Semana 3: Micro-CMS, Catálogo Público y Cuentas de Clientes
- [ ] **Davi:** Vista pública del catálogo (`/catalogo/:slug`).
- [ ] **Davi:** Login/Registro de Clientes y panel de "Mi Cuenta" (Pedidos y Dirección).
- [ ] **Angelo:** Endpoints públicos GET para productos e historial del cliente.
- [ ] **Javicho:** Crear tabla `configuracion_catalogo`.
- [ ] **Javicho:** Crear tabla `clientes` y configurar políticas RLS de seguridad.

## Semana 4: Carrito, Checkout y Reportes Animados
- [ ] **Davi:** Lógica del carrito de compras y checkout UI pre-rellenado.
- [ ] **Davi:** Generar enlace `wa.me` dinámico.
- [ ] **Davi:** Dashboard Admin: Reportes y estadísticas con gráficos animados (Recharts).
- [ ] **Angelo:** Endpoint para registrar pedidos y consultar analíticas de ventas.
- [ ] **Javicho:** Tablas `pedidos` y `detalles_pedido`.
- [ ] **Javicho:** Programar trigger de base de datos para reducción de stock automática.

## Semana 5: Pruebas, Refinamiento y Despliegue
- [ ] **Davi:** Pulido UI/UX y Mobile First.
- [ ] **Angelo:** Manejo de excepciones y refactorización.
- [ ] **Javicho:** Despliegues en Vercel, Render y pruebas de seguridad en Supabase.
