import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reportService } from '../services/reportService';

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
      // Atualiza o estado local
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
      // Atualiza o estado local
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
    if (!confirm('Deseja finalizar este relatório? Após finalizado, não poderá mais ser editado.')) {
      return;
    }
    
    try {
      await reportService.finalizar(Number(id));
      alert('Relatório finalizado com sucesso!');
      loadReport(); // Recarrega para atualizar o status
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
    return <div style={{ padding: '20px' }}>Carregando...</div>;
  }

  const currentCategory = report.categorias[currentCategoryIndex];
  const totalCategories = report.categorias.length;

  const isFinalized = report.status === 'concluido';

  return (
    <div style={{ padding: '20px', maxWidth: '900px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={() => navigate('/reports')}>← Voltar para Relatórios</button>
        <div style={{ display: 'flex', gap: '10px' }}>
          {!isFinalized && (
            <button
              onClick={finishReport}
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
              ✅ FINALIZAR RELATÓRIO
            </button>
          )}
          <button
            onClick={handleExportPDF}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            📥 EXPORTAR PDF
          </button>
        </div>
      </div>

      <div style={{ marginTop: '20px', marginBottom: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2>{report.descricao}</h2>
            <p><strong>Cliente:</strong> {report.cliente?.nome_fantasia || 'N/A'}</p>
            <p><strong>Categoria:</strong> {report.categoria || 'N/A'}</p>
          </div>
          <div>
            <span style={{
              padding: '8px 16px',
              borderRadius: '20px',
              backgroundColor: isFinalized ? '#d4edda' : '#fff3cd',
              color: isFinalized ? '#155724' : '#856404',
              fontWeight: 'bold',
              fontSize: '14px',
            }}>
              {isFinalized ? '✓ CONCLUÍDO' : '⏱ EM ANDAMENTO'}
            </span>
          </div>
        </div>
        {isFinalized && (
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#d4edda', borderRadius: '5px', color: '#155724' }}>
            ℹ️ Este relatório está finalizado e não pode mais ser editado. Você pode apenas exportar o PDF.
          </div>
        )}
      </div>

      {/* Navegação de Categorias */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={prevCategory} disabled={currentCategoryIndex === 0}>
          ← Anterior
        </button>
        <h3>
          {currentCategory.nome} ({currentCategoryIndex + 1}/{totalCategories})
        </h3>
        <button onClick={nextCategory} disabled={currentCategoryIndex === totalCategories - 1}>
          Próxima →
        </button>
      </div>

      {/* Lista de Itens */}
      <div>
        {currentCategory.itens.map((item) => (
          <div
            key={item.id}
            style={{
              marginBottom: '20px',
              padding: '15px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              backgroundColor: '#fff',
            }}
          >
            <div style={{ marginBottom: '10px' }}>
              <strong>{item.codigo}</strong> - {item.descricao}
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={() => !isFinalized && handleResponseChange(item.id, 'conforme')}
                disabled={isFinalized}
                style={{
                  padding: '8px 15px',
                  backgroundColor: item.resposta === 'conforme' ? '#28a745' : '#e0e0e0',
                  color: item.resposta === 'conforme' ? 'white' : 'black',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: isFinalized ? 'not-allowed' : 'pointer',
                  opacity: isFinalized ? 0.6 : 1,
                }}
              >
                ✓ Conforme
              </button>
              <button
                onClick={() => !isFinalized && handleResponseChange(item.id, 'nao_conforme')}
                disabled={isFinalized}
                style={{
                  padding: '8px 15px',
                  backgroundColor: item.resposta === 'nao_conforme' ? '#dc3545' : '#e0e0e0',
                  color: item.resposta === 'nao_conforme' ? 'white' : 'black',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: isFinalized ? 'not-allowed' : 'pointer',
                  opacity: isFinalized ? 0.6 : 1,
                }}
              >
                ✗ Não Conforme
              </button>
              <button
                onClick={() => !isFinalized && handleResponseChange(item.id, 'na')}
                disabled={isFinalized}
                style={{
                  padding: '8px 15px',
                  backgroundColor: item.resposta === 'na' ? '#6c757d' : '#e0e0e0',
                  color: item.resposta === 'na' ? 'white' : 'black',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: isFinalized ? 'not-allowed' : 'pointer',
                  opacity: isFinalized ? 0.6 : 1,
                }}
              >
                N/A
              </button>
              <button
                onClick={() => !isFinalized && openObservationModal(item)}
                disabled={isFinalized}
                style={{
                  padding: '8px 15px',
                  backgroundColor: isFinalized ? '#6c757d' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: isFinalized ? 'not-allowed' : 'pointer',
                  marginLeft: 'auto',
                  opacity: isFinalized ? 0.6 : 1,
                }}
              >
                {isFinalized ? '👁️ Ver Comentário' : '💬 Comentário'} {item.observacoes && '✓'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Botão Finalizar */}
      {currentCategoryIndex === totalCategories - 1 && (
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <button
            onClick={finishReport}
            style={{
              padding: '15px 30px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            FINALIZAR RELATÓRIO
          </button>
        </div>
      )}

      {/* Modal de Observações */}
      {showObservationModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowObservationModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '10px',
              maxWidth: '600px',
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Observações</h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
              <strong>{selectedItem?.codigo}</strong> - {selectedItem?.descricao}
            </p>
            <textarea
              value={observationText}
              onChange={(e) => setObservationText(e.target.value)}
              placeholder="Digite suas observações aqui..."
              rows={5}
              style={{ width: '100%', padding: '10px', marginBottom: '15px' }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowObservationModal(false)}
                style={{ padding: '8px 20px' }}
              >
                Cancelar
              </button>
              <button
                onClick={saveObservation}
                style={{
                  padding: '8px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                }}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportChecklist;
