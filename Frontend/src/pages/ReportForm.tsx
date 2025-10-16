import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientService, Client } from '../services/clientService';
import { reportService } from '../services/reportService';

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
