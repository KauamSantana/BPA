import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reportService } from '../services/reportService';
import './ReportChecklist.css'; // novo CSS separado

interface ChecklistItem {
  id: number;
  codigo: string;
  descricao: string;
  resposta: 'conforme' | 'nao_conforme' | 'na' | null;
  observacoes: string;
}

interface ChecklistCategory {
  id: number;
  nome: string;
  ordem: number;
  itens: ChecklistItem[];
}

interface Report {
  id: number;
  descricao: string;
  cliente?: { nome_fantasia: string };
  categoria?: string;
  status: 'em_andamento' | 'concluido';
  categorias?: ChecklistCategory[];
}

function ReportChecklist() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [showObservationModal, setShowObservationModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null);
  const [observationText, setObservationText] = useState('');

  useEffect(() => {
    loadReport();
  }, [id]);

  const loadReport = async () => {
    try {
      const data = await reportService.getById(Number(id));
      setReport(data);
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
    }
  };

  const handleResponseChange = async (itemId: number, resposta: 'conforme' | 'nao_conforme' | 'na') => {
    try {
      await reportService.updateChecklistItem(itemId, { resposta });
      setReport((prev) => {
        if (!prev || !prev.categorias) return prev;
        const newCategorias = prev.categorias.map((cat) => ({
          ...cat,
          itens: cat.itens.map((item) =>
            item.id === itemId ? { ...item, resposta } : item
          ),
        }));
        return { ...prev, categorias: newCategorias };
      });
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
    }
  };

  const openObservationModal = (item: ChecklistItem) => {
    setSelectedItem(item);
    setObservationText(item.observacoes || '');
    setShowObservationModal(true);
  };

  const saveObservation = async () => {
    if (!selectedItem) return;
    try {
      await reportService.updateChecklistItem(selectedItem.id, {
        observacoes: observationText,
      });
      setReport((prev) => {
        if (!prev || !prev.categorias) return prev;
        const newCategorias = prev.categorias.map((cat) => ({
          ...cat,
          itens: cat.itens.map((item) =>
            item.id === selectedItem.id ? { ...item, observacoes: observationText } : item
          ),
        }));
        return { ...prev, categorias: newCategorias };
      });
      setShowObservationModal(false);
    } catch (error) {
      console.error('Erro ao salvar observação:', error);
    }
  };

  const nextCategory = () => {
    if (report && report.categorias && currentCategoryIndex < report.categorias.length - 1) {
      setCurrentCategoryIndex(currentCategoryIndex + 1);
    }
  };

  const prevCategory = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(currentCategoryIndex - 1);
    }
  };

  const finishReport = async () => {
    if (!confirm('Deseja finalizar este relatório? Após finalizado, não poderá mais ser editado.')) return;

    try {
      await reportService.finalizar(Number(id));
      alert('Relatório finalizado com sucesso!');
      loadReport();
    } catch (error) {
      alert('Erro ao finalizar relatório');
      console.error('Erro ao finalizar relatório:', error);
    }
  };

  const handleExportPDF = async () => {
    try {
      await reportService.exportPDF(Number(id));
    } catch (error) {
      alert('Erro ao exportar PDF');
      console.error('Erro ao exportar PDF:', error);
    }
  };

  if (!report || !report.categorias || report.categorias.length === 0) {
    return <div className="report-page"><div className="report-container">Carregando...</div></div>;
  }

  const currentCategory = report.categorias[currentCategoryIndex];
  const totalCategories = report.categorias.length;
  const isFinalized = report.status === 'concluido';

  return (
    <div className="report-page fade-in">
      <div className="report-container">
        <div className="report-header">
          <button onClick={() => navigate('/reports')} className="btn btn-secondary">
            ← Voltar para Relatórios
          </button>

          <div className="report-actions">
            {!isFinalized && (
              <button onClick={finishReport} className="btn btn-success">
                ✅ Finalizar Relatório
              </button>
            )}
            <button onClick={handleExportPDF} className="btn btn-primary">
              📥 Exportar PDF
            </button>
          </div>
        </div>

        <div className="report-info">
          <div className="flex justify-between">
            <div>
              <h2>{report.descricao}</h2>
              <p><strong>Cliente:</strong> {report.cliente?.nome_fantasia || 'N/A'}</p>
              <p><strong>Categoria:</strong> {report.categoria || 'N/A'}</p>
            </div>
            <span className={`report-status ${isFinalized ? 'completed' : 'in-progress'}`}>
              {isFinalized ? '✓ Concluído' : '⏱ Em Andamento'}
            </span>
          </div>
        </div>

        <div className="report-category-nav">
          <button onClick={prevCategory} disabled={currentCategoryIndex === 0}>← Anterior</button>
          <h3>{currentCategory.nome} ({currentCategoryIndex + 1}/{totalCategories})</h3>
          <button onClick={nextCategory} disabled={currentCategoryIndex === totalCategories - 1}>Próxima →</button>
        </div>

        <div>
          {currentCategory.itens.map((item) => (
            <div key={item.id} className="report-item fade-in">
              <div><strong>{item.codigo}</strong> - {item.descricao}</div>

              <div className="report-item-buttons">
                <button
                  onClick={() => !isFinalized && handleResponseChange(item.id, 'conforme')}
                  className={`btn ${item.resposta === 'conforme' ? 'btn-success' : 'btn-secondary'}`}
                  disabled={isFinalized}
                >
                  ✓ Conforme
                </button>
                <button
                  onClick={() => !isFinalized && handleResponseChange(item.id, 'nao_conforme')}
                  className={`btn ${item.resposta === 'nao_conforme' ? 'btn-danger' : 'btn-secondary'}`}
                  disabled={isFinalized}
                >
                  ✗ Não Conforme
                </button>
                <button
                  onClick={() => !isFinalized && handleResponseChange(item.id, 'na')}
                  className={`btn ${item.resposta === 'na' ? 'btn-secondary' : 'btn-secondary'}`}
                  disabled={isFinalized}
                >
                  N/A
                </button>
                <button
                  onClick={() => openObservationModal(item)}
                  className="btn btn-primary"
                  style={{ marginLeft: 'auto' }}
                >
                  💬 Comentário
                </button>
              </div>
            </div>
          ))}
        </div>

        {showObservationModal && (
          <div className="modal-overlay" onClick={() => setShowObservationModal(false)}>
            <div className="modal-content fade-in" onClick={(e) => e.stopPropagation()}>
              <h3>Observações</h3>
              <p><strong>{selectedItem?.codigo}</strong> - {selectedItem?.descricao}</p>
              <textarea
                value={observationText}
                onChange={(e) => setObservationText(e.target.value)}
                rows={5}
                placeholder="Digite suas observações..."
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button onClick={() => setShowObservationModal(false)} className="btn btn-secondary">Cancelar</button>
                <button onClick={saveObservation} className="btn btn-success">Salvar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportChecklist;
