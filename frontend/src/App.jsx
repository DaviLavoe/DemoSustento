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

function App() {
  return (
    <Router>
      <Routes>
        {/* ── Autenticación de Empresas (sesión regular) ── */}
        <Route path="/iniciar-sesion" element={<IniciarSesion />} />
        <Route path="/registro" element={<Registro />} />
        {/* Login con branding único por empresa */}
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
        </Route>

        {/* ── Dashboard de Empresa (sesión regular) ── */}
        <Route path="/dashboard" element={
          <RutaProtegida>
            <DashboardLayout />
          </RutaProtegida>
        }>
          <Route index element={<Navigate to="inventario" replace />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="configuracion" element={<Configuracion />} />
        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/iniciar-sesion" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
