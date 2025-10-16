import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h1>BPA Digital</h1>
          <span className="navbar-subtitle">Boas Práticas de Alimentação</span>
        </div>

        <div className="navbar-menu">
          <button
            className={`navbar-item ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={() => navigate('/dashboard')}
          >
            🏠 Dashboard
          </button>
          <button
            className={`navbar-item ${isActive('/clients') ? 'active' : ''}`}
            onClick={() => navigate('/clients')}
          >
            👥 Clientes
          </button>
          <button
            className={`navbar-item ${isActive('/reports') ? 'active' : ''}`}
            onClick={() => navigate('/reports')}
          >
            📋 Relatórios
          </button>
        </div>

        <button className="navbar-logout" onClick={handleLogout}>
          🚪 Sair
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
