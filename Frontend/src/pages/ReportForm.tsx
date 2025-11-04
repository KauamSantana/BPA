// src/pages/ReportForm.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientService, Client } from '../services/clientService';
import { reportService, ReportCreate } from '../services/reportService';
import { useToast } from '../contexts/ToastContext';
import './ReportForm.css';

function ReportForm() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState({
    descricao: '',
    cliente_id: '',              // string no form; vamos converter ao enviar
    categoria: '',
    responsavel_inspecao_id: 1,  // mantém número SEMPRE
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    try {
      const data = await clientService.getAll();
      setClients([...data].sort((a, b) => a.nome_fantasia.localeCompare(b.nome_fantasia)));
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
      toastError('Não foi possível carregar a lista de clientes.');
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;

    // 🔧 Garanta que responsavel_inspecao_id permaneça number
    if (name === 'responsavel_inspecao_id') {
      setFormData((prev) => ({ ...prev, responsavel_inspecao_id: Number(value) || 1 }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.descricao.trim()) {
      toastError('A Descrição é obrigatória.');
      return;
    }
    if (!formData.cliente_id) {
      toastError('Selecione um cliente para o relatório.');
      return;
    }

    const checklistData: NonNullable<ReportCreate['categorias']> = [
      {
        nome: 'EDIFICAÇÃO, INSTALAÇÕES E TRANSPORTE',
        ordem: 1,
        itens: [
          {
            codigo: '1.1.1',
            descricao:
              'Livre de objetos em desuso ou estranhos ao ambiente e sem a presença de animais. Com acesso controlado, independente e exclusivo (não comum a outros usos como habitação, etc.).',
            ordem: 1,
          },
          {
            codigo: '1.2.1',
            descricao: 'Revestimento liso, impermeável e lavável em adequado estado de conservação.',
            ordem: 2,
          },
        ],
      },
      {
        nome: 'PREPARAÇÃO DO ALIMENTO',
        ordem: 2,
        itens: [
          {
            codigo: '2.1.1',
            descricao: 'Higienização adequada das mãos pelos manipuladores antes de manipular alimentos.',
            ordem: 1,
          },
        ],
      },
    ];

    const payload: ReportCreate = {
      descricao: formData.descricao.trim(),
      cliente_id: parseInt(formData.cliente_id, 10),         
      categoria: formData.categoria.trim() || undefined,
      responsavel_inspecao_id: formData.responsavel_inspecao_id,
      categorias: checklistData,
    };

    try {
      setLoading(true);
      const created = await reportService.create(payload);

      if (!created || typeof created.id !== 'number') {
        toastError('O servidor não retornou o ID do relatório.');
        return;
      }

      success('Relatório criado com sucesso!');
      navigate(`/reports/checklist/${created.id}`);
    } catch (err: any) {
      console.error('Erro ao criar relatório:', err);
      const detail =
        err?.response?.data?.detail ??
        err?.message ??
        'Erro ao criar relatório. Verifique os campos e tente novamente.';
      toastError(typeof detail === 'string' ? detail : 'Erro ao criar relatório.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="report-form-page">
      <div className="report-form-container">
        <div className="report-form-header">
         <button
          onClick={() => navigate('/reports')}
          className="btn btn-secondary btn-back"
          type="button">
            ← Voltar para Relatórios
         </button>
          <h1>Cadastro de Relatórios</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="descricao">Descrição: *</label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              required
              placeholder="Ex: Relatório de Verificação das Boas Práticas"
              rows={3}
            />
          </div>

          <div className="form-grid-2">
            <div className="input-group">
              <label htmlFor="cliente_id">Cliente: *</label>
              <select
                id="cliente_id"
                name="cliente_id"
                value={formData.cliente_id}
                onChange={handleChange}
                required
              >
                <option value="">Selecione um cliente</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome_fantasia}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="categoria">Categoria:</label>
              <input
                id="categoria"
                type="text"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                placeholder="Ex: Inspeção Sanitária"
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="responsavel_inspecao_id">Responsável pela Inspeção:</label>
            <select
              id="responsavel_inspecao_id"
              name="responsavel_inspecao_id"
              value={formData.responsavel_inspecao_id}
              onChange={handleChange}
              required
            >
              <option value={1}>Você (usuário logado)</option>
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/reports')}
              className="btn btn-secondary"
            >
              VOLTAR
            </button>
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Criando...' : 'INICIAR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportForm;
