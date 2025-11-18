import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import logoBPA from "../assets/logoBPA.png"
import homeIcon from "../assets/icons/home-icon.png"
import clientesIcon from "../assets/icons/group-icon.png"
import relatorioIcon from "../assets/icons/relatorio-icon.png"
import logoutIcon from "../assets/icons/logout-icon.png"

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
          <div className='navbar-icon'>
          <img onClick={() => navigate('/dashboard')} src={logoBPA} alt="Logo BPA" />
          
        </div>
        </div>

        <div className="navbar-menu">
          <button
            className={`navbar-item ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={() => navigate('/dashboard')}
          >
           <img src={homeIcon} alt="Home"></img> Home
          </button>
          <button
            className={`navbar-item ${isActive('/clients') ? 'active' : ''}`}
            onClick={() => navigate('/clients')}
          >
           <img src={clientesIcon} alt="Clientes"></img> Clientes
          </button>
          <button
            className={`navbar-item ${isActive('/reports') ? 'active' : ''}`}
            onClick={() => navigate('/reports')}
          >
          <img src={relatorioIcon} alt="Relatórios"></img>  Relatórios
          </button>
        </div>

        <div className="navbar-actions">
          <button
            className={`navbar-item ${isActive('/profile') ? 'active' : ''}`}
            onClick={() => navigate('/profile')}
            title="Meu Perfil"
          >
            👤 Perfil
          </button>
          <button className="navbar-logout" onClick={handleLogout}>
            <img src={logoutIcon} alt="Logout"></img> Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
