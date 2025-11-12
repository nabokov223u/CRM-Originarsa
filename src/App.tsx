import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { CrmMain } from './pages/CrmMain';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Ruta pública: Login */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Rutas protegidas: CRM */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <CrmMain />
              </ProtectedRoute>
            }
          />
          
          {/* Redirect por defecto */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
