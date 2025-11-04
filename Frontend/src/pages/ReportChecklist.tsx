import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reportService } from '../services/reportService';
import { useToast } from '../contexts/ToastContext';
import './ReportChecklist.css';

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
  const { success, error: toastError, info } = useToast();

  const [report, setReport] = useState<Report | null>(null);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [showObservationModal, setShowObservationModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null);
  const [observationText, setObservationText] = useState('');
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadReport() {
    try {
      const data = await reportService.getById(Number(id));
      setReport(data);
      if (data?.categorias && currentCategoryIndex >= data.categorias.length) {
        setCurrentCategoryIndex(0);
      }
    } catch (err) {
      console.error('Erro ao carregar relatório:', err);
      toastError('Não foi possível carregar o relatório.');
    }
  }

  async function handleResponseChange(itemId: number, resposta: 'conforme' | 'nao_conforme' | 'na') {
    try {
      await reportService.updateChecklistItem(itemId, { resposta });
      setReport((prev) => {
        if (!prev?.categorias) return prev;
        const categorias = prev.categorias.map((cat) => ({
          ...cat,
          itens: cat.itens.map((it) => (it.id === itemId ? { ...it, resposta } : it)),
        }));
        return { ...prev, categorias };
      });
    } catch (err) {
      console.error('Erro ao atualizar item:', err);
      toastError('Erro ao atualizar o item do checklist.');
    }
  }

  function openObservationModal(item: ChecklistItem) {
    setSelectedItem(item);
    setObservationText(item.observacoes || '');
    setShowObservationModal(true);
  }

  async function saveObservation() {
    if (!selectedItem) return;
    try {
      await reportService.updateChecklistItem(selectedItem.id, { observacoes: observationText });
      setReport((prev) => {
        if (!prev?.categorias) return prev;
        const categorias = prev.categorias.map((cat) => ({
          ...cat,
          itens: cat.itens.map((it) =>
            it.id === selectedItem.id ? { ...it, observacoes: observationText } : it
          ),
        }));
        return { ...prev, categorias };
      });
      setShowObservationModal(false);
      success('Observação salva!');
    } catch (err) {
      console.error('Erro ao salvar observação:', err);
      toastError('Erro ao salvar observação.');
    }
  }

  function nextCategory() {
    if (report?.categorias && currentCategoryIndex < report.categorias.length - 1) {
      setCurrentCategoryIndex((i) => i + 1);
    } else {
      info('Você já está na última categoria.');
    }
  }

  function prevCategory() {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex((i) => i - 1);
    } else {
      info('Você já está na primeira categoria.');
    }
  }

  // ✅ Finalização com redirecionamento automático
  async function doFinishReport() {
    if (!report || finishing) return;
    try {
      setFinishing(true);
      await reportService.finalizar(report.id);
      setShowFinishModal(false);
      success('Relatório finalizado com sucesso!');
      navigate('/reports'); // 🔁 redireciona para a lista
    } catch (err) {
      console.error('Erro ao finalizar relatório:', err);
      toastError('Erro ao finalizar relatório.');
    } finally {
      setFinishing(false);
    }
  }

  async function handleExportPDF() {
    if (!report) return;
    try {
      setExporting(true);
      await reportService.exportPDF(report.id);
      success('PDF gerado com sucesso!');
    } catch (err) {
      console.error('Erro ao exportar PDF:', err);
      toastError('Erro ao exportar PDF.');
    } finally {
      setExporting(false);
    }
  }

  if (!report || !report.categorias || report.categorias.length === 0) {
    return (
      <div className="report-page">
        <div className="report-container">Carregando...</div>
      </div>
    );
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
              <button onClick={() => setShowFinishModal(true)} className="btn btn-success">
                ✅ Finalizar Relatório
              </button>
            )}
            <button onClick={handleExportPDF} className="btn btn-primary" disabled={exporting}>
              {exporting ? 'Gerando...' : '📥 Exportar PDF'}
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
          <button
            onClick={prevCategory}
            disabled={currentCategoryIndex === 0}
            className="btn btn-secondary"
          >
            ← Anterior
          </button>

          <h3 style={{ margin: 0 }}>
            {currentCategory.nome} ({currentCategoryIndex + 1}/{totalCategories})
          </h3>

          <button
            onClick={nextCategory}
            disabled={currentCategoryIndex === totalCategories - 1}
            className="btn btn-primary"
          >
            Próxima →
          </button>
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

        {/* Modal de Observação */}
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

        {/* Modal de Finalização */}
        {showFinishModal && (
          <div className="modal-overlay" onClick={() => setShowFinishModal(false)}>
            <div className="modal-content fade-in" onClick={(e) => e.stopPropagation()}>
              <h3>Finalizar relatório</h3>
              <p>Após finalizado, o relatório não poderá mais ser editado.</p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button onClick={() => setShowFinishModal(false)} className="btn btn-secondary">Cancelar</button>
                <button onClick={doFinishReport} className="btn btn-success" disabled={finishing}>
                  {finishing ? 'Finalizando...' : 'Finalizar'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default ReportChecklist;
