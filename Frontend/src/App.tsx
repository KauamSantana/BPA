import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientForm from './pages/ClientForm';
import Reports from './pages/Reports';
import ReportForm from './pages/ReportForm';
import ReportChecklist from './pages/ReportChecklist';

function App() {
  const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
  };

  const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    const isAuth = isAuthenticated();
    
    if (!isAuth) {
      // Limpa qualquer dado antigo e redireciona para login
      localStorage.clear();
      return <Navigate to="/" replace />;
    }
    
    return children;
  };

  const PublicRoute = ({ children }: { children: JSX.Element }) => {
    const isAuth = isAuthenticated();
    
    // Se já está logado, redireciona para dashboard
    if (isAuth) {
      return <Navigate to="/dashboard" replace />;
    }
    
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } 
        />
        
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/clients"
          element={
            <PrivateRoute>
              <Clients />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/clients/new"
          element={
            <PrivateRoute>
              <ClientForm />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/clients/edit/:id"
          element={
            <PrivateRoute>
              <ClientForm />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <Reports />
            </PrivateRoute>
          }
        />

        <Route
          path="/reports/new"
          element={
            <PrivateRoute>
              <ReportForm />
            </PrivateRoute>
          }
        />

        <Route
          path="/reports/checklist/:id"
          element={
            <PrivateRoute>
              <ReportChecklist />
            </PrivateRoute>
          }
        />
        
        {/* Rota catch-all - qualquer URL não encontrada vai para login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
