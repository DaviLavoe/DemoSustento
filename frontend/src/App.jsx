import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import IniciarSesion from './paginas/IniciarSesion';
import Registro from './paginas/Registro';
import RutaProtegida from './components/RutaProtegida';
import DashboardLayout from './paginas/dashboard/DashboardLayout';
import Inventario from './paginas/dashboard/Inventario';
import Configuracion from './paginas/dashboard/Configuracion';
import CatalogoPublico from './paginas/CatalogoPublico';
import Reportes from './paginas/dashboard/Reportes';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas de Autenticación */}
        <Route path="/iniciar-sesion" element={<IniciarSesion />} />
        <Route path="/registro" element={<Registro />} />
        
        {/* Catálogo Público de la Empresa */}
        <Route path="/catalogo/:slug" element={<CatalogoPublico />} />
        
        {/* Panel de Control Protegido */}
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
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

