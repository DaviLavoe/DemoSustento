import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import IniciarSesion from './paginas/IniciarSesion';
import Registro from './paginas/Registro';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas de Autenticación */}
        <Route path="/iniciar-sesion" element={<IniciarSesion />} />
        <Route path="/registro" element={<Registro />} />
        
        {/* Redirección temporal */}
        <Route path="*" element={<Navigate to="/iniciar-sesion" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
