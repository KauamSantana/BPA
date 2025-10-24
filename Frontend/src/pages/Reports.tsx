<<<<<<< HEAD
// src/pages/Reports.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService, Report } from '../services/reportService';
import Navbar from '../components/Navbar'; 
import './Reports.css'; 

function Reports() {
    const [reports, setReports] = useState<Report[]>([]);
    const [search, setSearch] = useState(''); 
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const loadReports = async () => {
        try {
            const data = await reportService.getAll(); 
            setReports(data);
        } catch (error) {
            console.error('Erro ao carregar relatórios:', error);
            setReports([]); 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReports();
    }, []);

    const filteredReports = reports.filter(report => {
        const searchTerm = search.toLowerCase();
        const clientName = report.cliente?.nome_fantasia?.toLowerCase() || '';
        const reportDesc = report.descricao?.toLowerCase() || '';
        
        return reportDesc.includes(searchTerm) || clientName.includes(searchTerm);
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // A busca é feita no frontend, então não precisa recarregar aqui.
    };

    const handleDelete = async (id: number) => {
        if (confirm('Deseja realmente deletar este relatório?')) {
            try {
                await reportService.delete(id);
                loadReports();
            } catch (error) {
                alert('Erro ao deletar relatório');
            }
        }
    };

    const handleExportPDF = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation(); 
        try {
            await reportService.exportPDF(id);
        } catch (error) {
            alert('Erro ao exportar PDF');
            console.error('Erro ao exportar PDF:', error);
        }
    };

    return (
        <div className="reports-page">
            <Navbar /> 
            
            <div className="reports-container">
                <div className="reports-header">
                    <div className="reports-title-group">
                        {/* ADICIONADO: Ícone de grupo para o título "Relatórios / Checklist" */}
                        <h1 className="reports-title">📄 Relatórios / Checklist</h1>
                    </div>
                    
                    <div className="reports-actions">
                        <button
                            className="btn btn-success"
                            onClick={() => navigate('/reports/new')}
                        >
                            ➕ NOVO RELATÓRIO
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSearch} className="search-bar">
                    <input
                        type="text"
                        // ADICIONADO: Ícone de lupa no placeholder da busca
                        placeholder="🔍 Buscar relatórios..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary">
                        Buscar
                    </button>
                </form>

                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner">⏳</div>
                    </div>
                ) : filteredReports.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📄</div>
                        <h2 className="empty-state-title">Nenhum relatório encontrado</h2>
                        <p className="empty-state-description">
                            {search ? 'Tente ajustar sua busca ou' : 'Clique em'} "+ RELATÓRIO" para criar um novo.
                        </p>
                        <button 
                            className="btn btn-primary"
                            onClick={() => navigate('/reports/new')}
                        >
                            ➕ Cadastrar Relatório
                        </button>
                    </div>
                ) : (
                    <div className="reports-list">
                        {filteredReports.map((report) => (
                            <div
                                key={report.id}
                                className="report-card"
                                onClick={() => navigate(`/reports/checklist/${report.id}`)}
                            >
                                <div className="report-card-content">
                                    <div className="report-details">
                                        <h3>{report.descricao || `Relatório ${report.id}`}</h3>
                                        <p>
                                            <strong>Cliente:</strong> {report.cliente?.nome_fantasia || `ID ${report.cliente_id}`}
                                        </p>
                                        <p>
                                            <strong>Data:</strong> {new Date(report.criado_em).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                    <div className="report-actions">
                                        <span 
                                            className={`status-badge status-${report.status === 'concluido' ? 'concluido' : 'andamento'}`}
                                        >
                                            {report.status === 'concluido' ? 'Concluído' : 'Em Andamento'}
                                        </span>
                                        <button
                                            onClick={(e) => handleExportPDF(e, report.id)}
                                            className="btn btn-primary btn-sm"
                                            title="Exportar para PDF"
                                        >
                                            📥 PDF
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(report.id);
                                            }}
                                            className="btn btn-danger btn-sm"
                                            title="Deletar"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Reports;
=======
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService, Report } from '../services/reportService';

function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadReports = async () => {
    try {
      const data = await reportService.getAll();
      setReports(data);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm('Deseja realmente deletar este relatório?')) {
      try {
        await reportService.delete(id);
        loadReports();
      } catch (error) {
        alert('Erro ao deletar relatório');
      }
    }
  };

  const handleExportPDF = async (id: number) => {
    try {
      await reportService.exportPDF(id);
    } catch (error) {
      alert('Erro ao exportar PDF');
      console.error('Erro ao exportar PDF:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button onClick={() => navigate('/dashboard')}>← Voltar</button>
          <h1 style={{ display: 'inline-block', marginLeft: '15px' }}>Relatórios / Checklist</h1>
        </div>
        <button
          onClick={() => navigate('/reports/new')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          + RELATÓRIO
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Buscar relatórios..."
          style={{
            padding: '10px',
            width: '100%',
            maxWidth: '400px',
            border: '1px solid #ddd',
            borderRadius: '5px',
          }}
        />
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : reports.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          <p>Nenhum relatório encontrado.</p>
          <p>Clique em "+ RELATÓRIO" para criar um novo.</p>
        </div>
      ) : (
        <div>
          {reports.map((report) => (
            <div
              key={report.id}
              style={{
                marginBottom: '15px',
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)')}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)')}
              onClick={() => navigate(`/reports/checklist/${report.id}`)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 10px 0' }}>{report.descricao}</h3>
                  <p style={{ margin: '5px 0', color: '#666' }}>
                    <strong>Cliente:</strong> {report.cliente?.nome_fantasia || `ID ${report.cliente_id}`}
                  </p>
                  <p style={{ margin: '5px 0', color: '#666' }}>
                    <strong>Data:</strong> {new Date(report.criado_em).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      padding: '5px 15px',
                      borderRadius: '20px',
                      backgroundColor: report.status === 'concluido' ? '#28a745' : '#ffc107',
                      color: report.status === 'concluido' ? 'white' : 'black',
                      fontSize: '14px',
                      fontWeight: 'bold',
                    }}
                  >
                    {report.status === 'concluido' ? 'Concluído' : 'Em Andamento'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportPDF(report.id);
                    }}
                    style={{
                      padding: '8px 15px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                    }}
                    title="Exportar para PDF"
                  >
                    📥 PDF
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(report.id);
                    }}
                    style={{
                      padding: '8px 15px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                    }}
                  >
                    Deletar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Reports;
>>>>>>> a1c7daa5c62c5d83669e424428002b4a13ed19f0
