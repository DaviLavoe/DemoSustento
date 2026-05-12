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
