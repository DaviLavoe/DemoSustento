# Plan de Desarrollo: SaaS de Gestión de Inventario y Catálogo Digital

Este documento detalla el plan de trabajo de 5 semanas para construir la plataforma multitenant. El objetivo es coordinar el trabajo entre Davi, Angelo y Javicho utilizando React (Vite), Node.js/Express y Supabase.

## Decisiones Técnicas

- **Frontend Framework:** Vite (React).
- **Autenticación:** Directamente desde el Frontend conectándose a Supabase Auth.
- **Despliegue:** Vercel para el Frontend, Render para el Backend, y Supabase para la Base de Datos.

## Distribución de Roles

- **Davi (Frontend Lead):** Se enfoca en React (Vite), maquetación, UI/UX (Dashboard y Catálogo Público), diseño responsivo y el manejo del estado (Zustand o Context API).
- **Angelo (Backend Lead):** Se enfoca en Node.js, Express, lógica de negocio, validaciones, seguridad y creación de los endpoints (API REST).
- **Javicho (Fullstack / Data Lead):** Se encarga de Supabase (esquemas de base de datos, relaciones, *Row Level Security* para el multitenancy, *Storage* de imágenes), despliegues y apoya en la integración entre Frontend y Backend.

## Cronograma de 5 Semanas

### Semana 1: Arquitectura, Base de Datos y Autenticación
- **Davi (Front):** Inicializar el proyecto React con Vite. Configurar enrutamiento y crear las vistas de Login y Registro integrando Supabase Auth. Configurar TailwindCSS. Mejorar la experiencia visual del Login (modelos 3D con Spline, microinteracciones con Click Spark, visibilidad de contraseña) y robustecer la conexión con Supabase mediante `.env`.
- **Angelo (Back):** Estructurar el backend (separar rutas, controladores, middlewares). Crear middleware para verificar tokens JWT de Supabase en rutas protegidas.
- **Javicho (Data):** Diseñar las tablas core en Supabase (`empresas`, `usuarios`, `productos`). Configurar las políticas de seguridad (RLS) para garantizar que una empresa no vea los datos de otra.

### Semana 2: Core SaaS (Gestión de Inventario)
- **Davi (Front):** Construir la UI del panel de administración (Dashboard): Tablas de inventario, y modales/formularios para crear, editar y eliminar productos. Corregir fallos de carga infinita utilizando controladores de aborto (`AbortController`) al desmontar las vistas del Dashboard.
- **Angelo (Back):** Crear endpoints CRUD completos para el inventario (`POST`, `PUT`, `DELETE` en `/api/productos`).
- **Javicho (Data):** Configurar Supabase *Storage* para el almacenamiento de imágenes de los productos. Apoyar a Davi en la integración de subida de archivos. Implementar el puente de autenticación seguro `/api/auth/me` para evitar el uso directo de Supabase REST en el front, solucionando fallas de API keys en cabeceras HTTP.
- **Estado:** ✅ CRUD de productos básico, estabilidad del Dashboard y subida de imágenes a Supabase Storage completados.

### Semana 3: Micro-CMS y Catálogo Público (Vitrina)
- **Davi (Front):** Crear la vista pública del catálogo (`/catalogo/:slug-empresa`) con diseño dinámico. Resolver el slug dinámicamente y enlazar directamente el catálogo real desde la barra de navegación del Dashboard (con logos y nombres dinámicos).
- **Angelo/Javicho (Back):** Crear endpoints públicos `/api/catalogo/:slug` para consultar los productos y metadatos de la empresa sin requerir JWT, delegando la consulta a Supabase desde el backend seguro.
- **Javicho (Data):** Crear la tabla `configuracion_catalogo` en Supabase (para guardar colores, logo, y mensaje de WhatsApp de cada empresa). Crear la tabla de `clientes` y configurar políticas RLS para soportar cuentas de clientes.
- **Estado:** ⏳ Catálogo digital dinámico conectado de manera segura a la base de datos a través del API Backend. Creadas las tablas configuracion_catalogo y clientes con RLS. Pendiente desarrollo de UI en front para configuraciones y clientes.

### Semana 4: Carrito de Compras e Integración con WhatsApp
- **Davi (Front):** Implementar la lógica del carrito de compras local en el Frontend y diseñar el panel de checkout. Generar dinámicamente el enlace de `wa.me`.
- **Angelo (Back):** Crear un endpoint para registrar los "Pedidos" en la base de datos de la empresa antes de redirigir al usuario a WhatsApp, manteniendo un historial.
- **Javicho (Data):** Diseñar la tabla de `pedidos` y `detalles_pedido`. Integrar estas tablas con el panel de administración (Front) para que la empresa vea sus pedidos.
- **Estado:** ✅ Carrito de compras, Checkout pre-rellenado con sesión de cliente, registro de pedidos en base de datos API, redirección automatizada a WhatsApp y Dashboard con gráficos animados de Recharts completados al 100%.

### Semana 5: Pruebas, Refinamiento y Despliegue
- **Davi (Front):** Pulir el diseño (*UI polish*), asegurar que el catálogo sea 100% *Mobile First*, y realizar pruebas de usabilidad.
- **Angelo (Back):** Refactorización final, manejo de excepciones global y pruebas de rendimiento del servidor.
- **Javicho (Data):** Despliegue a producción de ambas partes (Vercel para Front, Render para Back, Supabase para DB). Revisión exhaustiva de reglas de seguridad (RLS) en Supabase.
