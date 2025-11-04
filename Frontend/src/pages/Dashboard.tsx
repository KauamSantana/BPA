import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, DashboardStats } from '../services/authService';
import { reportService, Report } from '../services/reportService';
import Navbar from '../components/Navbar';
import { useToast } from '../contexts/ToastContext';
import './Dashboard.css';
import groupIcon from '../assets/icons/group-icon.png';
import relatorioIcon from '../assets/icons/relatorio-icon.png';
import relatorioAddIcon from '../assets/icons/relatorioAdd-icon.png';
import groupAddIcon from '../assets/icons/groupAdd-icon.png';

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [scheduledReports, setScheduledReports] = useState<Report[]>([]);
  const { error } = useToast(); // <- removido success

  useEffect(() => {
    loadStats();
    loadScheduledReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth, currentYear]);

  const loadStats = async () => {
    try {
      const data = await authService.getDashboardStats();
      setStats(data);
      // success('Estatísticas carregadas com sucesso!'); // <- removido
    } catch (err: any) {
      console.error('Erro ao carregar estatísticas:', err);
      const detail = err?.response?.data?.detail;
      error(detail ?? 'Erro ao carregar estatísticas do dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const loadScheduledReports = async () => {
    try {
      const reports = await reportService.getReportsByMonth(currentMonth, currentYear);
      setScheduledReports(reports);
    } catch (err: any) {
      console.error('Erro ao carregar relatórios agendados:', err);
    }
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month - 1, 1).getDay(); // 0 = Domingo, 6 = Sábado
  };

  const getReportsForDay = (day: number) => {
    return scheduledReports.filter(report => {
      if (!report.data_agendada) return false;
      const reportDate = new Date(report.data_agendada);
      return reportDate.getDate() === day && 
             reportDate.getMonth() + 1 === currentMonth && 
             reportDate.getFullYear() === currentYear;
    });
  };

  const changeMonth = (delta: number) => {
    let newMonth = currentMonth + delta;
    let newYear = currentYear;
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="dashboard-page">
      <Navbar />

      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-welcome">
            Olá,
            {stats ? <span style={{ color: '#05A672' }}> {stats.user_name}</span> : ''}!
          </h1>
          <p className="dashboard-welcome">O que faremos hoje?</p>
          <p className="dashboard-subtitle">
            Explore as funções e descubra possibilidades para fiscalizar e gerenciar seus relatórios.
          </p>
        </div>

        {loading && (
          <div className="loading-container">
            <div className="loading-spinner">⏳ Carregando dados...</div>
          </div>
        )}

        {!loading && stats && (
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-info">
                <h3 className="stat-number">{stats.total_clients}</h3>
                <p className="stat-label"><span>Clientes Cadastrados</span></p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-info">
                <h3 className="stat-number">{stats.total_reports}</h3>
                <p className="stat-label"><span>Relatórios Criados</span></p>
              </div>
            </div>
          </div>
        )}

        {!loading && !stats && (
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <h2 className="empty-state-title">Não foi possível carregar as estatísticas</h2>
            <p className="empty-state-description">
              Tente novamente mais tarde ou verifique sua conexão.
            </p>
            <button className="btn btn-primary" onClick={loadStats}>🔄 Recarregar</button>
          </div>
        )}

        <div className="dashboard-grid">
          <div className="dashboard-card" onClick={() => navigate('/clients')}>
            <div className="dashboard-card-icon"><img src={groupIcon} alt="Clientes" /></div>
            <h2 className="dashboard-card-title">Gerenciar Clientes</h2>
            <p className="dashboard-card-description">Visualize, cadastre e edite informações dos seus clientes</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate('/reports')}>
            <div className="dashboard-card-icon"><img src={relatorioIcon} alt="Relatórios" /></div>
            <h2 className="dashboard-card-title">Relatórios</h2>
            <p className="dashboard-card-description">Acesse e crie novos relatórios de inspeção</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate('/clients/new')}>
            <div className="dashboard-card-icon"><img src={groupAddIcon} alt="Adicionar cliente" /></div>
            <h2 className="dashboard-card-title">Novo Cliente</h2>
            <p className="dashboard-card-description">Cadastre rapidamente um novo cliente no sistema</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate('/reports/new')}>
            <div className="dashboard-card-icon"><img src={relatorioAddIcon} alt="Adicionar Relatório" /></div>
            <h2 className="dashboard-card-title">Novo Relatório</h2>
            <p className="dashboard-card-description">Inicie uma nova inspeção e checklist</p>
          </div>
        </div>

        {/* Seção de Agenda */}
        <div className="agenda-section">
          <h2 className="agenda-title">Agenda</h2>
          
          <div className="calendar-header">
            <button onClick={() => changeMonth(-1)} className="btn btn-secondary">
              ← Anterior
            </button>
            <h3>{monthNames[currentMonth - 1]} {currentYear}</h3>
            <button onClick={() => changeMonth(1)} className="btn btn-secondary">
              Próximo →
            </button>
          </div>

          <div className="calendar-grid">
            {weekDays.map(day => (
              <div key={day} className="calendar-weekday">{day}</div>
            ))}
            
            {/* Dias vazios no início do mês */}
            {Array.from({ length: getFirstDayOfMonth(currentMonth, currentYear) }).map((_, i) => (
              <div key={`empty-${i}`} className="calendar-day calendar-day-empty"></div>
            ))}
            
            {/* Dias do mês */}
            {Array.from({ length: getDaysInMonth(currentMonth, currentYear) }).map((_, i) => {
              const day = i + 1;
              const dayReports = getReportsForDay(day);
              const isToday = day === new Date().getDate() && 
                             currentMonth === new Date().getMonth() + 1 && 
                             currentYear === new Date().getFullYear();
              
              return (
                <div 
                  key={day} 
                  className={`calendar-day ${isToday ? 'calendar-day-today' : ''} ${dayReports.length > 0 ? 'calendar-day-has-reports' : ''}`}
                >
                  <div className="calendar-day-number">{day}</div>
                  {dayReports.length > 0 && (
                    <div className="calendar-day-reports">
                      {dayReports.map(report => (
                        <div 
                          key={report.id} 
                          className="calendar-report-item"
                          onClick={() => navigate(`/reports/${report.id}/checklist`)}
                          title={`${report.descricao} - ${report.cliente?.nome_fantasia || 'Cliente não especificado'}`}
                        >
                          <span className="calendar-report-icon">📋</span>
                          <span className="calendar-report-text">{report.descricao}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
