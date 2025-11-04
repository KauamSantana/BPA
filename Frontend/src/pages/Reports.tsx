// src/pages/Reports.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService, Report } from '../services/reportService';
import Navbar from '../components/Navbar';
import { useToast } from '../contexts/ToastContext';
import './Reports.css';
import deleteIcon from '../assets/icons/delete-icon-white.png';
import pdfIcon from '../assets/icons/pdf-icon.png';

function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // modal de confirmação
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const loadReports = async () => {
    try {
      const data = await reportService.getAll();
      setReports(data);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      setReports([]);
      toastError('Não foi possível carregar os relatórios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const filteredReports = reports.filter((report) => {
    const searchTerm = search.toLowerCase();
    const clientName = report.cliente?.nome_fantasia?.toLowerCase() || '';
    const reportDesc = report.descricao?.toLowerCase() || '';
    return reportDesc.includes(searchTerm) || clientName.includes(searchTerm);
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  // abre modal de confirmação
  const askDelete = (id: number) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  // confirma exclusão
  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      setDeleting(true);
      await reportService.delete(deletingId);
      setShowDeleteModal(false);
      setDeletingId(null);
      success('Relatório excluído com sucesso!');
      loadReports(); // recarrega a lista
    } catch (error) {
      console.error('Erro ao deletar relatório:', error);
      toastError('Erro ao deletar relatório.');
    } finally {
      setDeleting(false);
    }
  };

  const handleExportPDF = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await reportService.exportPDF(id);
      success('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toastError('Erro ao exportar PDF.');
    }
  };

  return (
    <div className="reports-page">
      <Navbar />

      <div className="reports-container">
        <div className="reports-header">
          <div className="reports-title-group">
            <h1 className="reports-title">Relatórios / Checklist</h1>
          </div>

          <div className="reports-actions">
            <button className="btn btn-success" onClick={() => navigate('/reports/new')}>
              + NOVO RELATÓRIO
            </button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            placeholder="Buscar relatórios..."
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
            <button className="btn btn-primary" onClick={() => navigate('/reports/new')}>
              + Cadastrar Relatório
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
                      <strong>Cliente:</strong>{' '}
                      {report.cliente?.nome_fantasia || `ID ${report.cliente_id}`}
                    </p>
                    <p>
                      <strong>Data:</strong>{' '}
                      {new Date(report.criado_em).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="report-actions">
                    <span
                      className={`status-badge status-${
                        report.status === 'concluido' ? 'concluido' : 'andamento'
                      }`}
                    >
                      {report.status === 'concluido' ? 'Concluído' : 'Em Andamento'}
                    </span>

                    <button
                      onClick={(e) => handleExportPDF(e, report.id)}
                      className="btn btn-primary btn-sm"
                      title="Exportar para PDF"
                    >
                      <img src={pdfIcon} alt="PDF" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        askDelete(report.id);
                      }}
                      className="btn btn-danger btn-sm"
                      title="Deletar"
                    >
                      <img src={deleteIcon} alt="Delete" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de confirmação de exclusão */}
        {showDeleteModal && (
          <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="modal-content fade-in" onClick={(e) => e.stopPropagation()}>
              <h3>Excluir relatório</h3>
              <p>Tem certeza que deseja excluir este relatório? Esta ação não pode ser desfeita.</p>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '10px',
                }}
              >
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="btn btn-secondary"
                  disabled={deleting}
                >
                  Cancelar
                </button>
                <button onClick={confirmDelete} className="btn btn-danger" disabled={deleting}>
                  {deleting ? 'Excluindo...' : 'Excluir'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;
