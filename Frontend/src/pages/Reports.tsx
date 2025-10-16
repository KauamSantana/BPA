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
