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
          <img src={logoBPA} alt="Logo BPA" />
          
        </div>
        <h1>BPA Digital</h1>
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

        <button className="navbar-logout" onClick={handleLogout}>
           <img src={logoutIcon} alt="Logout"></img> Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
