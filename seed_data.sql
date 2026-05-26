-- ==========================================
-- SCRIPT DE DATOS SEMILLA (SEED DATA)
-- ==========================================
-- Este script inserta datos de prueba para que el equipo de Frontend y Backend
-- pueda realizar pruebas sin tener que registrar datos manualmente cada vez.
--
-- INSTRUCCIONES PARA JAVICHO:
-- 1. Ejecuta este script en el "SQL Editor" de Supabase.
-- 2. NOTA SOBRE USUARIOS: No se insertan usuarios aquí porque la tabla 'usuarios'
--    depende de 'auth.users' de Supabase. Debes crear los usuarios reales desde
--    el Frontend (pantalla de registro) y luego asignarles el 'empresa_id' que 
--    corresponda a estas empresas de prueba.

-- 1. Limpiar datos anteriores (Opcional, ten cuidado si ya tienes datos importantes)
-- TRUNCATE TABLE public.productos CASCADE;
-- TRUNCATE TABLE public.empresas CASCADE;

-- 2. Insertar Empresas de Prueba
-- Usamos UUIDs fijos temporales para poder amarrar los productos fácilmente.
INSERT INTO public.empresas (id, nombre, slug, telefono_whatsapp, color_primario)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Tech Store Lima', 'tech-store-lima', '+51999999991', '#3b82f6'), -- Azul (Tailwind blue-500)
    ('22222222-2222-2222-2222-222222222222', 'Moda Elegante', 'moda-elegante', '+51999999992', '#ec4899')  -- Rosa (Tailwind pink-500)
ON CONFLICT (id) DO NOTHING;

-- 3. Insertar Productos de Prueba para "Tech Store Lima" (Empresa 1)
INSERT INTO public.productos (empresa_id, nombre, descripcion, precio, stock, categoria, activo)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Laptop Gamer ASUS ROG', 'Laptop de alto rendimiento con tarjeta gráfica RTX 4060.', 4500.00, 10, 'Computación', true),
    ('11111111-1111-1111-1111-111111111111', 'Mouse Inalámbrico Logitech', 'Mouse ergonómico con batería de larga duración.', 120.00, 50, 'Accesorios', true),
    ('11111111-1111-1111-1111-111111111111', 'Teclado Mecánico', 'Teclado con switches rojos ideal para programadores.', 250.00, 0, 'Accesorios', false); -- Producto sin stock y oculto

-- 4. Insertar Productos de Prueba para "Moda Elegante" (Empresa 2)
INSERT INTO public.productos (empresa_id, nombre, descripcion, precio, stock, categoria, activo)
VALUES 
    ('22222222-2222-2222-2222-222222222222', 'Camisa de Vestir Slim Fit', 'Camisa 100% algodón, perfecta para la oficina.', 85.00, 30, 'Ropa de Hombre', true),
    ('22222222-2222-2222-2222-222222222222', 'Pantalón Jean Clásico', 'Pantalón de mezclilla azul tradicional.', 110.00, 25, 'Ropa de Hombre', true),
    ('22222222-2222-2222-2222-222222222222', 'Vestido de Noche', 'Vestido elegante para eventos formales.', 180.00, 5, 'Ropa de Mujer', true);

-- 5. Insertar Pedidos Semilla para Tech Store Lima (Empresa 1 - Para reportes)
INSERT INTO public.pedidos (id, empresa_id, nombre_cliente, telefono_cliente, total, estado, created_at)
VALUES 
    ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Carlos Mendoza', '+51987654321', 4620.00, 'completado', NOW() - INTERVAL '4 days'),
    ('b2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Ana Sofia', '+51999888777', 240.00, 'completado', NOW() - INTERVAL '3 days'),
    ('c3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Miguel Arce', '+51944555666', 120.00, 'completado', NOW() - INTERVAL '2 days'),
    ('d4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Laura Flores', '+51933222111', 4500.00, 'pendiente', NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.detalles_pedido (pedido_id, producto_id, cantidad, precio_unitario)
VALUES
    ('a1111111-1111-1111-1111-111111111111', (SELECT id FROM public.productos WHERE nombre = 'Laptop Gamer ASUS ROG' LIMIT 1), 1, 4500.00),
    ('a1111111-1111-1111-1111-111111111111', (SELECT id FROM public.productos WHERE nombre = 'Mouse Inalámbrico Logitech' LIMIT 1), 1, 120.00),
    ('b2222222-2222-2222-2222-222222222222', (SELECT id FROM public.productos WHERE nombre = 'Mouse Inalámbrico Logitech' LIMIT 1), 2, 120.00),
    ('c3333333-3333-3333-3333-333333333333', (SELECT id FROM public.productos WHERE nombre = 'Mouse Inalámbrico Logitech' LIMIT 1), 1, 120.00),
    ('d4444444-4444-4444-4444-444444444444', (SELECT id FROM public.productos WHERE nombre = 'Laptop Gamer ASUS ROG' LIMIT 1), 1, 4500.00)
ON CONFLICT DO NOTHING;
