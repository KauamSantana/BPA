<<<<<<< HEAD
// src/pages/ReportForm.tsx

=======
>>>>>>> a1c7daa5c62c5d83669e424428002b4a13ed19f0
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientService, Client } from '../services/clientService';
import { reportService } from '../services/reportService';
<<<<<<< HEAD
import './ReportForm.css'; // Importa o novo CSS

function ReportForm() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState({
    descricao: '',
    cliente_id: '',
    categoria: '',
    responsavel_inspecao_id: 1, // ID do usuário logado (depois melhoramos)
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await clientService.getAll();
      // Ordenar clientes por nome_fantasia antes de definir o estado
      const sortedData = data.sort((a, b) => 
        a.nome_fantasia.localeCompare(b.nome_fantasia)
      );
      setClients(sortedData);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.descricao) {
      setError('A Descrição é obrigatória.');
      return;
    }
    if (!formData.cliente_id) {
      setError('Selecione um cliente para o relatório.');
      return;
    }
    
    // Remove a validação da categoria, já que não é obrigatória

    try {
      setLoading(true);
      
      // Os dados do checklist fixo (categorias/itens)
      const checklistData = {
        categorias: [
          {
            nome: 'EDIFICAÇÃO, ISNTAÇÕES E TRANSPORTE',
            ordem: 1,
            itens: [
              {
                codigo: '1.1.1',
                descricao: 'Livre de objetos em desuso ou estranhos ao ambiente e sem a presença de animais. Com acesso controlado, independente e exclusivo(não comum a outros usos como habitação, etc.).',
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
        ],
      };


      const reportData = {
        descricao: formData.descricao,
        cliente_id: parseInt(formData.cliente_id),
        categoria: formData.categoria,
        responsavel_inspecao_id: formData.responsavel_inspecao_id,
        ...checklistData, // Adiciona os dados do checklist
      };

      const createdReport = await reportService.create(reportData);
      alert('Relatório criado com sucesso!');
      // Redireciona para a tela de preenchimento do checklist
      navigate(`/reports/checklist/${createdReport.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao criar relatório');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Se estiver carregando os clientes, mostra uma tela de carregamento (Opcional, mas útil)
  if (loading && clients.length === 0) {
    return <div className="report-form-page" style={{ justifyContent: 'center', alignItems: 'center' }}>Carregando clientes...</div>;
  }
  
  return (
    <div className="report-form-page">
      <div className="report-form-container">
        <div className="report-form-header">
          <button
            onClick={() => navigate('/reports')}
            className="report-form-header-link"
            type="button"
          >
            ← Voltar para Relatórios
          </button>
          <h1>Cadastro de Relatórios</h1>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Descrição do Relatório (ocupa 2 colunas com grid-template-columns: 1fr 1fr) */}
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

          {/* Grid para Cliente, Categoria e Responsável (2 colunas) */}
          <div className="form-grid-2">
            {/* Cliente */}
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
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.nome_fantasia}
                  </option>
                ))}
              </select>
            </div>

            {/* Categoria */}
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

            {/* Responsável pela Inspeção (Ocupa as 2 colunas, então colocamos fora do grid ou usamos um wrapper) */}
          </div>
          
          {/* Responsável pela Inspeção - Como só tem 1 opção, fica melhor em uma linha separada */}
          <div className="input-group">
            <label htmlFor="responsavel_inspecao_id">Responsável pela Inspeção:</label>
            <select
              id="responsavel_inspecao_id"
              name="responsavel_inspecao_id"
              value={formData.responsavel_inspecao_id}
              onChange={handleChange}
              required
            >
              <option value="1">Você (usuário logado)</option>
            </select>
          </div>


          {error && <p className="error-message">{error}</p>}

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/reports')}
              className="btn btn-secondary"
            >
              VOLTAR
            </button>
            <button 
              type="submit" 
              className="btn btn-success" 
              disabled={loading}
            >
              {loading ? 'Criando...' : 'INICIAR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportForm;
=======

function ReportForm() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState({
    descricao: '',
    cliente_id: '',
    categoria: '',
    responsavel_inspecao_id: 1, // ID do usuário logado (depois melhoramos)
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await clientService.getAll();
      setClients(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.cliente_id) {
      setError('Selecione um cliente');
      return;
    }

    try {
      setLoading(true);
      const reportData = {
        descricao: formData.descricao,
        cliente_id: parseInt(formData.cliente_id),
        categoria: formData.categoria,
        responsavel_inspecao_id: formData.responsavel_inspecao_id,
        categorias: [
          {
            nome: 'EDIFICAÇÃO, ISNTAÇÕES E TRANSPORTE',
            ordem: 1,
            itens: [
              {
                codigo: '1.1.1',
                descricao: 'Livre de objetos em desuso ou estranhos ao ambiente e sem a presença de animais. Com acesso controlado, independente e exclusivo(não comum a outros usos como habitação, etc.).',
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
        ],
      };

      const createdReport = await reportService.create(reportData);
      alert('Relatório criado com sucesso!');
      // Redireciona para a tela de preenchimento do checklist
      navigate(`/reports/checklist/${createdReport.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao criar relatório');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <button onClick={() => navigate('/reports')}>← Voltar para Relatórios</button>
      <h1>Cadastro de Relatórios</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Descrição: *</label>
          <textarea
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            required
            placeholder="Ex: Relatório de Verificação das Boas Práticas"
            rows={3}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Cliente: *</label>
          <select
            name="cliente_id"
            value={formData.cliente_id}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="">Selecione um cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.nome_fantasia}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Categoria:</label>
          <input
            type="text"
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            placeholder="Ex: Inspeção Sanitária"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Responsável pela Inspeção:</label>
          <select
            name="responsavel_inspecao_id"
            value={formData.responsavel_inspecao_id}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="1">Você (usuário logado)</option>
          </select>
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button 
          type="submit" 
          style={{ padding: '10px 20px', marginRight: '10px', backgroundColor: '#28a745', color: 'white' }}
          disabled={loading}
        >
          {loading ? 'Criando...' : 'INICIAR'}
        </button>
        <button
          type="button"
          onClick={() => navigate('/reports')}
          style={{ padding: '10px 20px' }}
        >
          VOLTAR
        </button>
      </form>
    </div>
  );
}

export default ReportForm;
>>>>>>> a1c7daa5c62c5d83669e424428002b4a13ed19f0
