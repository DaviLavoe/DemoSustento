import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import IniciarSesion from './paginas/IniciarSesion';
import Registro from './paginas/Registro';
import LoginEmpresa from './paginas/LoginEmpresa';
import RutaProtegida from './components/RutaProtegida';
import RutaSuperAdmin from './components/RutaSuperAdmin';
import DashboardLayout from './paginas/dashboard/DashboardLayout';
import Inventario from './paginas/dashboard/Inventario';
import Configuracion from './paginas/dashboard/Configuracion';
import CatalogoPublico from './paginas/CatalogoPublico';
import Reportes from './paginas/dashboard/Reportes';
import LoginSuperAdmin from './paginas/superadmin/LoginSuperAdmin';
import SuperAdminLayout from './paginas/superadmin/SuperAdminLayout';
import GestionEmpresas from './paginas/superadmin/GestionEmpresas';
import EstadisticasGlobales from './paginas/superadmin/EstadisticasGlobales';
import GestionUsuariosSuperAdmin from './paginas/superadmin/GestionUsuariosSuperAdmin';
import GestionTrabajadores from './paginas/dashboard/GestionTrabajadores';
import { EmpresaSupabaseProvider } from './context/EmpresaSupabaseContext';

function App() {
  return (
    <Router>
      <Routes>
        {/* ── Autenticación de Empresas (sesión regular) ── */}
        <Route path="/iniciar-sesion" element={<IniciarSesion />} />
        <Route path="/registro" element={<Registro />} />

        {/* Login con branding único por empresa → /login/:slug */}
        <Route path="/login/:slug" element={<LoginEmpresa />} />

        {/* ── Catálogo Público ── */}
        <Route path="/catalogo/:slug" element={<CatalogoPublico />} />

        {/* ── Panel Super-Admin (sesión aislada con supabaseAdmin) ── */}
        <Route path="/superadmin/login" element={<LoginSuperAdmin />} />
        <Route path="/superadmin" element={
          <RutaSuperAdmin>
            <SuperAdminLayout />
          </RutaSuperAdmin>
        }>
          <Route index element={<Navigate to="empresas" replace />} />
          <Route path="empresas" element={<GestionEmpresas />} />
          <Route path="estadisticas" element={<EstadisticasGlobales />} />
          <Route path="usuarios" element={<GestionUsuariosSuperAdmin />} />
        </Route>

        {/* ── Dashboard de Empresa (sesión regular) ────────────────────────────────────────
            Ahora con prefijo /:slug para aislar sesiones por empresa en la URL.
            Ejemplo: /login/tech-store-lima/dashboard/inventario
            De este modo cada empresa tiene su propia URL y el slug siempre
            está disponible en useParams() sin depender de estado asíncrono.
            El EmpresaSupabaseProvider inyecta el cliente Supabase aislado
            (storageKey único por slug) a todos los componentes del dashboard.
        ── */}
        <Route path="/login/:slug/dashboard" element={
          <RutaProtegida>
            <EmpresaSupabaseProvider>
              <DashboardLayout />
            </EmpresaSupabaseProvider>
          </RutaProtegida>
        }>
          <Route index element={<Navigate to="inventario" replace />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="configuracion" element={<Configuracion />} />
          <Route path="usuarios" element={<GestionTrabajadores />} />
        </Route>

        {/* Compatibilidad: si alguien llega a /dashboard sin slug → superadmin */}
        <Route path="/dashboard/*" element={<Navigate to="/superadmin/login" replace />} />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/superadmin/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
