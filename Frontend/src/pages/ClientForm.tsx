import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { clientService, ClientCreate } from '../services/clientService';

function ClientForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // Pega o ID da URL (se existir)
  const isEditMode = !!id; // Se tem ID, está em modo edição
  
  const [formData, setFormData] = useState<ClientCreate>({
    status: 'ativo',
    nome_fantasia: '',
    categoria: 'restaurante',
    razao_social: '',
    cnpj: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Carrega os dados do cliente se estiver em modo edição
  useEffect(() => {
    if (isEditMode && id) {
      loadClient(parseInt(id));
    }
  }, [id, isEditMode]);

  const loadClient = async (clientId: number) => {
    try {
      setLoading(true);
      const client = await clientService.getById(clientId);
      // Preenche o formulário com os dados do cliente
      setFormData({
        status: client.status,
        nome_fantasia: client.nome_fantasia,
        categoria: client.categoria,
        razao_social: client.razao_social || '',
        cnpj: client.cnpj,
        email: client.email,
        telefone_contato_1: client.telefone_contato_1,
        endereco: client.endereco,
        cidade: client.cidade,
        estado: client.estado,
        cep: client.cep, // ← CORRIGIDO: Agora carrega o CEP
        logo_url: client.logo_url,
      });
      // Se tiver logo, mostra preview
      if (client.logo_url) {
        setLogoPreview(client.logo_url);
      }
    } catch (err: any) {
      setError('Erro ao carregar cliente');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar endereço pelo CEP usando ViaCEP
  const buscarCep = async (cep: string) => {
    // Remove máscara do CEP
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) return;

    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        alert('CEP não encontrado');
        return;
      }

      // Preenche automaticamente os campos
      setFormData(prev => ({
        ...prev,
        endereco: data.logradouro || prev.endereco,
        bairro: data.bairro || prev.bairro,
        cidade: data.localidade || prev.cidade,
        estado: data.uf || prev.estado,
      }));
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      alert('Erro ao buscar CEP. Tente novamente.');
    } finally {
      setLoadingCep(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isEditMode && id) {
        // Modo edição
        await clientService.update(parseInt(id), formData);
        alert('Cliente atualizado com sucesso!');
      } else {
        // Modo criação
        await clientService.create(formData);
        alert('Cliente criado com sucesso!');
      }
      navigate('/clients');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao salvar cliente');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Aplicar máscaras
    let maskedValue = value;
    
    if (name === 'cnpj') {
      // Remove tudo que não é número
      const numbers = value.replace(/\D/g, '');
      // Aplica máscara: 00.000.000/0000-00
      if (numbers.length <= 14) {
        maskedValue = numbers
          .replace(/(\d{2})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1/$2')
          .replace(/(\d{4})(\d)/, '$1-$2');
      }
    } else if (name === 'telefone_contato_1' || name === 'telefone_contato_2') {
      // Remove tudo que não é número
      const numbers = value.replace(/\D/g, '');
      // Aplica máscara: (00) 00000-0000 ou (00) 0000-0000
      if (numbers.length <= 11) {
        maskedValue = numbers
          .replace(/(\d{2})(\d)/, '($1) $2')
          .replace(/(\d{5})(\d)/, '$1-$2')
          .replace(/(\d{4})(\d{4})$/, '$1-$2');
      }
    } else if (name === 'cep') {
      // Remove tudo que não é número
      const numbers = value.replace(/\D/g, '');
      // Aplica máscara: 00000-000
      if (numbers.length <= 8) {
        maskedValue = numbers.replace(/(\d{5})(\d)/, '$1-$2');
      }
      // Se CEP completo, busca endereço
      if (numbers.length === 8) {
        buscarCep(maskedValue);
      }
    }
    
    setFormData({ ...formData, [name]: maskedValue });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validação de tipo de arquivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione uma imagem válida');
        return;
      }
      
      // Validação de tamanho (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB');
        return;
      }

      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogoPreview(base64String);
        setFormData({ ...formData, logo_url: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Carregando...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <button onClick={() => navigate('/clients')}>← Voltar</button>
      <h1>{isEditMode ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Status: *</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Logo do Cliente:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            style={{ width: '100%', padding: '8px' }}
          />
          {logoPreview && (
            <div style={{ marginTop: '10px' }}>
              <img 
                src={logoPreview} 
                alt="Preview da logo" 
                style={{ 
                  maxWidth: '200px', 
                  maxHeight: '200px', 
                  borderRadius: '8px',
                  border: '2px solid #ddd',
                  objectFit: 'contain'
                }} 
              />
            </div>
          )}
          <small style={{ color: '#666' }}>Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB</small>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Nome Fantasia: *</label>
          <input
            type="text"
            name="nome_fantasia"
            value={formData.nome_fantasia}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Categoria: *</label>
          <select
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="restaurante">Restaurante</option>
            <option value="mercado">Mercado</option>
            <option value="hortifruti">Hortifrúti</option>
            <option value="lanchonete_cafeteria">Lanchonete/Cafeteria</option>
            <option value="bar">Bar</option>
            <option value="padaria_confeitaria">Padaria/Confeitaria</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Razão Social: *</label>
          <input
            type="text"
            name="razao_social"
            value={formData.razao_social}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>CNPJ: * (formato: 00.000.000/0000-00)</label>
          <input
            type="text"
            name="cnpj"
            value={formData.cnpj}
            onChange={handleChange}
            required
            placeholder="00.000.000/0000-00"
            maxLength={18}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Telefone:</label>
          <input
            type="text"
            name="telefone_contato_1"
            value={formData.telefone_contato_1 || ''}
            onChange={handleChange}
            placeholder="(00) 00000-0000"
            maxLength={15}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <hr style={{ margin: '24px 0', border: 'none', borderTop: '2px solid #eee' }} />
        <h3 style={{ marginBottom: '16px', color: '#667eea' }}>📍 Endereço</h3>

        <div style={{ marginBottom: '15px' }}>
          <label>CEP: {loadingCep && '🔄 Buscando...'}</label>
          <input
            type="text"
            name="cep"
            value={formData.cep || ''}
            onChange={handleChange}
            placeholder="00000-000"
            maxLength={9}
            style={{ width: '100%', padding: '8px' }}
            disabled={loadingCep}
          />
          <small style={{ color: '#666' }}>Digite o CEP para preencher os campos automaticamente</small>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Endereço:</label>
          <input
            type="text"
            name="endereco"
            value={formData.endereco || ''}
            onChange={handleChange}
            placeholder="Rua, Avenida, etc."
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Bairro:</label>
          <input
            type="text"
            name="bairro"
            value={formData.bairro || ''}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px', marginBottom: '15px' }}>
          <div>
            <label>Cidade:</label>
            <input
              type="text"
              name="cidade"
              value={formData.cidade || ''}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div>
            <label>Estado:</label>
            <input
              type="text"
              name="estado"
              value={formData.estado || ''}
              onChange={handleChange}
              maxLength={2}
              placeholder="SP"
              style={{ width: '100%', padding: '8px', textTransform: 'uppercase' }}
            />
          </div>
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" style={{ padding: '10px 20px', marginRight: '10px' }}>
          Salvar
        </button>
        <button
          type="button"
          onClick={() => navigate('/clients')}
          style={{ padding: '10px 20px' }}
        >
          Cancelar
        </button>
      </form>
    </div>
  );
}

export default ClientForm;
