-- ==========================================
-- SCRIPT DE BASE DE DATOS: SAAS INVENTARIO
-- ==========================================
-- Ejecuta esto en el "SQL Editor" de tu panel de Supabase.

-- 1. TABLA: EMPRESAS
-- Almacena los negocios que se registran en el SaaS.
CREATE TABLE public.empresas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL, -- Para la URL de la vitrina: misitio.com/catalogo/mi-empresa
    telefono_whatsapp VARCHAR(20),
    color_primario VARCHAR(7) DEFAULT '#000000',
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA: USUARIOS (Perfiles)
-- Se relaciona con auth.users de Supabase. Cada usuario pertenece a una empresa.
CREATE TABLE public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'admin', -- Puede ser 'admin' o 'vendedor'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA: PRODUCTOS
-- El inventario. Tiene empresa_id para garantizar el Multitenancy (aislamiento de datos).
CREATE TABLE public.productos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    stock INTEGER NOT NULL DEFAULT 0,
    categoria VARCHAR(100),
    imagen_url TEXT,
    activo BOOLEAN DEFAULT TRUE, -- Para mostrar/ocultar en la vitrina pública
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLA: PEDIDOS (Semana 4)
-- Opcional para guardar el historial antes de enviarlo a WhatsApp
CREATE TABLE public.pedidos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    nombre_cliente VARCHAR(255) NOT NULL,
    telefono_cliente VARCHAR(20),
    total NUMERIC(10, 2) NOT NULL,
    estado VARCHAR(50) DEFAULT 'pendiente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- CONFIGURACIÓN DE SEGURIDAD (Row Level Security - RLS)
-- ==========================================
-- Habilitamos RLS en las tablas
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;

-- Política 1: Los productos públicos son visibles por todo el mundo (Para el Catálogo)
CREATE POLICY "Catálogo público: Todos pueden ver productos activos"
ON public.productos FOR SELECT
USING (activo = true);

-- Política 2: Usuarios solo pueden ver/editar productos de su propia empresa
CREATE POLICY "Admins pueden gestionar sus productos"
ON public.productos FOR ALL
USING (
    empresa_id IN (
        SELECT empresa_id FROM public.usuarios WHERE id = auth.uid()
    )
);

-- Política 3: Usuarios solo pueden ver la info de su propia empresa
CREATE POLICY "Admins ven su empresa"
ON public.empresas FOR ALL
USING (
    id IN (
        SELECT empresa_id FROM public.usuarios WHERE id = auth.uid()
    )
);

-- Nota para Javicho: 
-- 1. Carga este script en Supabase -> SQL Editor -> New Query y dale "Run".
-- 2. Cuando termines, dime para marcar tu tarea en el CHECKLIST.md.


-- 5. TABLA: CONFIGURACIÓN CATÁLOGO (Semana 3)
-- Permite personalizar colores, logos, etc. para la vitrina digital de cada empresa.
CREATE TABLE public.configuracion_catalogo (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID NOT NULL UNIQUE REFERENCES public.empresas(id) ON DELETE CASCADE,
    telefono_whatsapp VARCHAR(20),
    color_primario VARCHAR(7) DEFAULT '#1a1a1a',
    logo_url TEXT,
    banner_url TEXT,
    mensaje_bienvenida TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABLA: CLIENTES (Semana 3)
-- Almacena los clientes finales que se registran en la vitrina para ver sus pedidos.
CREATE TABLE public.clientes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABLA: DETALLES PEDIDO (Semana 4 - Adelanto)
-- Relación de productos solicitados en cada pedido.
CREATE TABLE public.detalles_pedido (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pedido_id UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES public.productos(id) ON DELETE SET NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- CONFIGURACIÓN DE SEGURIDAD (Row Level Security - RLS)
-- ==========================================
-- Habilitamos RLS en las nuevas tablas
ALTER TABLE public.configuracion_catalogo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detalles_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- Políticas para CONFIGURACION_CATALOGO
CREATE POLICY "Catálogo público: Todos pueden ver configuración"
ON public.configuracion_catalogo FOR SELECT
USING (true);

CREATE POLICY "Admins pueden gestionar configuración de su empresa"
ON public.configuracion_catalogo FOR ALL
USING (
    empresa_id IN (
        SELECT empresa_id FROM public.usuarios WHERE id = auth.uid()
    )
);

-- Políticas para CLIENTES
CREATE POLICY "Clientes: Lectura y escritura por su empresa"
ON public.clientes FOR ALL
USING (
    empresa_id IN (
        SELECT empresa_id FROM public.usuarios WHERE id = auth.uid()
    )
);

-- Políticas para PEDIDOS y DETALLES_PEDIDO (Semana 4)
CREATE POLICY "Admins pueden ver y gestionar pedidos de su empresa"
ON public.pedidos FOR ALL
USING (
    empresa_id IN (
        SELECT empresa_id FROM public.usuarios WHERE id = auth.uid()
    )
);

CREATE POLICY "Admins pueden ver detalles de pedidos de su empresa"
ON public.detalles_pedido FOR ALL
USING (
    pedido_id IN (
        SELECT id FROM public.pedidos WHERE empresa_id IN (
            SELECT empresa_id FROM public.usuarios WHERE id = auth.uid()
        )
    )
);

-- Políticas para inserción pública (cuando el cliente hace checkout)
CREATE POLICY "Clientes públicos pueden insertar sus pedidos"
ON public.pedidos FOR INSERT
WITH CHECK (true);

CREATE POLICY "Clientes públicos pueden insertar detalles de sus pedidos"
ON public.detalles_pedido FOR INSERT
WITH CHECK (true);


-- ==========================================
-- CONFIGURACIÓN DE SUPABASE STORAGE (Semana 2)
-- ==========================================
-- 1. Crear el bucket 'productos' si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('productos', 'productos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Crear política para que cualquiera pueda leer las imágenes del catálogo público
CREATE POLICY "Catálogo público: Acceso de lectura de imágenes"
ON storage.objects FOR SELECT
USING (bucket_id = 'productos');

-- 3. Crear política para que los usuarios autenticados de empresas puedan subir imágenes
CREATE POLICY "Admins pueden subir imágenes en productos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'productos');

-- 4. Crear política para que los usuarios autenticados puedan actualizar/eliminar imágenes
CREATE POLICY "Admins pueden actualizar o borrar imágenes en productos"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'productos')
WITH CHECK (bucket_id = 'productos');

