import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, DashboardStats } from '../services/authService';
import Navbar from '../components/Navbar';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await authService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <Navbar />
      
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-welcome">
            Bem-vindo{stats ? `, ${stats.user_name}` : ''}! 👋
          </h1>
          <p className="dashboard-subtitle">Gerencie suas inspeções e relatórios de forma simples e eficiente</p>
        </div>

        {!loading && stats && (
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <h3 className="stat-number">{stats.total_clients}</h3>
                <p className="stat-label">Clientes Cadastrados</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-info">
                <h3 className="stat-number">{stats.total_reports}</h3>
                <p className="stat-label">Relatórios Criados</p>
              </div>
            </div>
          </div>
        )}

        <div className="dashboard-grid">
          <div className="dashboard-card" onClick={() => navigate('/clients')}>
            <div className="dashboard-card-icon">👥</div>
            <h2 className="dashboard-card-title">Gerenciar Clientes</h2>
            <p className="dashboard-card-description">
              Visualize, cadastre e edite informações dos seus clientes
            </p>
          </div>

          <div className="dashboard-card" onClick={() => navigate('/reports')}>
            <div className="dashboard-card-icon">📋</div>
            <h2 className="dashboard-card-title">Relatórios</h2>
            <p className="dashboard-card-description">
              Acesse e crie novos relatórios de inspeção
            </p>
          </div>

          <div className="dashboard-card" onClick={() => navigate('/clients/new')}>
            <div className="dashboard-card-icon">➕</div>
            <h2 className="dashboard-card-title">Novo Cliente</h2>
            <p className="dashboard-card-description">
              Cadastre rapidamente um novo cliente no sistema
            </p>
          </div>

          <div className="dashboard-card" onClick={() => navigate('/reports/new')}>
            <div className="dashboard-card-icon">📝</div>
            <h2 className="dashboard-card-title">Novo Relatório</h2>
            <p className="dashboard-card-description">
              Inicie uma nova inspeção e checklist
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
