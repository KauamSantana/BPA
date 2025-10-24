// src/pages/ClientForm.tsx

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { clientService, ClientCreate } from '../services/clientService';
import './ClientForm.css';

// Tipagem inicial para o estado do formulário
const initialFormData: ClientCreate = {
    status: 'ativo',
    nome_fantasia: '',
    categoria: 'restaurante',
    razao_social: '',
    cnpj: '',
    email: '',
    telefone_contato_1: '',
    cep: '',
    endereco: '',
    bairro: '',
    cidade: '',
    estado: 'SP',
    logo_url: undefined,
};

function ClientForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<ClientCreate>(initialFormData);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingCep, setLoadingCep] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    useEffect(() => {
        if (isEditMode && id) {
            loadClient(parseInt(id));
        }
    }, [id, isEditMode]);

    const loadClient = async (clientId: number) => {
        try {
            setLoading(true);
            const client = await clientService.getById(clientId);
            setFormData({
                ...initialFormData,
                ...client,
                razao_social: client.razao_social || '',
                estado: client.estado || 'SP',
            });
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

    const buscarCep = async (cep: string) => {
        const cepLimpo = cep.replace(/\D/g, '');
        if (cepLimpo.length !== 8) return;

        setLoadingCep(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const data = await response.json();

            if (data.erro) {
                setError('CEP não encontrado');
                setFormData(prev => ({
                    ...prev,
                    endereco: '',
                    bairro: '',
                    cidade: '',
                    estado: 'SP',
                }));
                return;
            }

            setFormData(prev => ({
                ...prev,
                endereco: data.logradouro || '',
                bairro: data.bairro || '',
                cidade: data.localidade || '',
                estado: data.uf || 'SP',
            }));
            setError('');
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            setError('Erro ao buscar CEP. Tente novamente.');
        } finally {
            setLoadingCep(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Mantém o CNPJ formatado como o backend espera (com máscara)
            const dataToSend = {
                ...formData,
                telefone_contato_1: formData.telefone_contato_1?.replace(/\D/g, '') || '',
                cep: formData.cep?.replace(/\D/g, '') || '',
            };

            if (isEditMode && id) {
                await clientService.update(parseInt(id), dataToSend);
                alert('Cliente atualizado com sucesso!');
            } else {
                await clientService.create(dataToSend);
                alert('Cliente criado com sucesso!');
            }
            navigate('/clients');
        } catch (err: any) {
            const detail = err.response?.data?.detail;

            if (Array.isArray(detail)) {
                const messages = detail.map((d: any) => d.msg).join(', ');
                setError(messages);
            } else if (typeof detail === 'string') {
                setError(detail);
            } else {
                setError(isEditMode ? 'Erro ao atualizar cliente' : 'Erro ao criar cliente');
            }

            console.error('Erro ao salvar cliente:', err.response?.data || err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let maskedValue = value;

        if (name === 'cnpj') {
            const numbers = value.replace(/\D/g, '').substring(0, 14);
            if (numbers.length > 0) {
                maskedValue = numbers
                    .replace(/^(\d{2})(\d)/, '$1.$2')
                    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
                    .replace(/\.(\d{3})(\d)/, '.$1/$2')
                    .replace(/(\d{4})(\d{2})$/, '$1-$2');
            } else maskedValue = '';
        } else if (name === 'telefone_contato_1') {
            const numbers = value.replace(/\D/g, '').substring(0, 11);
            if (numbers.length > 0) {
                maskedValue = numbers
                    .replace(/^(\d{2})(\d)/, '($1) $2')
                    .replace(/(\d{4,5})(\d{4})$/, '$1-$2');
            } else maskedValue = '';
        } else if (name === 'cep') {
            const numbers = value.replace(/\D/g, '').substring(0, 8);
            if (numbers.length > 0) maskedValue = numbers.replace(/^(\d{5})(\d)/, '$1-$2');
            else maskedValue = '';
            if (numbers.length === 8) buscarCep(numbers);
        } else if (name === 'estado') {
            maskedValue = value.toUpperCase().substring(0, 2);
        }

        setFormData(prev => ({ ...prev, [name]: maskedValue }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Por favor, selecione uma imagem válida (JPG, PNG, GIF)');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('A imagem deve ter no máximo 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setLogoPreview(base64String);
                setFormData(prev => ({ ...prev, logo_url: base64String }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLogoClick = () => {
        fileInputRef.current?.click();
    };

    if (loading && !isEditMode) {
        return (
            <div className="client-form-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
                Carregando...
            </div>
        );
    }

    return (
        <div className="client-form-page">
            <div className="client-form-container">
                <div className="client-form-header">
                    <button
                        onClick={() => navigate('/clients')}
                        className="client-form-header-link"
                        type="button"
                    >
                        ← Voltar para Clientes
                    </button>
                    <h1>{isEditMode ? 'Edição de cliente' : 'Cadastro de novo cliente'}</h1>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Upload da logo */}
                    <div className="logo-upload-section">
                        <div className="logo-icon-container" onClick={handleLogoClick} role="button" tabIndex={0}>
                            <input
                                type="file"
                                accept="image/jpeg, image/png, image/gif"
                                onChange={handleLogoChange}
                                ref={fileInputRef}
                            />
                            {logoPreview ? (
                                <img src={logoPreview} alt="Preview da logo" className="logo-preview" />
                            ) : (
                                <span className="logo-icon">+</span>
                            )}
                        </div>
                        <div>
                            <p className="font-semibold text-sm">Logo do Cliente</p>
                            <small className="text-gray text-sm mt-sm">
                                Formatos aceitos: JPG, PNG, GIF. Máx: 5MB
                            </small>
                        </div>
                    </div>

                    {/* Campos principais */}
                    <div className="form-grid-2">
                        <div className="input-group">
                            <label htmlFor="status">Status do cliente *</label>
                            <select id="status" name="status" value={formData.status} onChange={handleChange} required>
                                <option value="ativo">Ativo</option>
                                <option value="inativo">Inativo</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label htmlFor="nome_fantasia">Nome Fantasia *</label>
                            <input
                                id="nome_fantasia"
                                type="text"
                                name="nome_fantasia"
                                value={formData.nome_fantasia}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="categoria">Categoria *</label>
                            <select
                                id="categoria"
                                name="categoria"
                                value={formData.categoria}
                                onChange={handleChange}
                                required
                            >
                                <option value="restaurante">Restaurante</option>
                                <option value="mercado">Mercado</option>
                                <option value="hortifruti">Hortifrúti</option>
                                <option value="lanchonete_cafeteria">Lanchonete/Cafeteria</option>
                                <option value="bar">Bar</option>
                                <option value="padaria_confeitaria">Padaria/Confeitaria</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label htmlFor="razao_social">Razão Social *</label>
                            <input
                                id="razao_social"
                                type="text"
                                name="razao_social"
                                value={formData.razao_social}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* CNPJ */}
                    <div className="form-grid-2">
                        <div className="input-group">
                            <label htmlFor="cnpj">CNPJ *</label>
                            <input
                                id="cnpj"
                                type="text"
                                name="cnpj"
                                value={formData.cnpj}
                                onChange={handleChange}
                                required
                                placeholder="00.000.000/0000-00"
                                maxLength={18}
                            />
                        </div>
                        <div></div>
                    </div>

                    {/* Contato */}
                    <div className="form-grid-2">
                        <div className="input-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email || ''}
                                onChange={handleChange}
                                placeholder="email@exemplo.com"
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="telefone_contato_1">Telefone</label>
                            <input
                                id="telefone_contato_1"
                                type="text"
                                name="telefone_contato_1"
                                value={formData.telefone_contato_1 || ''}
                                onChange={handleChange}
                                placeholder="(00) 00000-0000"
                                maxLength={15}
                            />
                        </div>
                    </div>

                    {/* Endereço */}
                    <h3 className="address-title">📍 Endereço</h3>

                    <div className="input-group">
                        <label htmlFor="cep" className="cep-label">
                            CEP:
                            {loadingCep && <span className="cep-loading-text">🔄 Buscando...</span>}
                        </label>
                        <input
                            id="cep"
                            type="text"
                            name="cep"
                            value={formData.cep || ''}
                            onChange={handleChange}
                            placeholder="00000-000"
                            maxLength={9}
                            disabled={loadingCep}
                        />
                        <small className="text-gray text-sm mt-sm">
                            Digite o CEP para preencher os campos automaticamente
                        </small>
                    </div>

                    <div className="form-grid-2">
                        <div className="input-group">
                            <label htmlFor="endereco">Endereço</label>
                            <input
                                id="endereco"
                                type="text"
                                name="endereco"
                                value={formData.endereco || ''}
                                onChange={handleChange}
                                placeholder="Rua, Avenida, etc."
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="bairro">Bairro</label>
                            <input
                                id="bairro"
                                type="text"
                                name="bairro"
                                value={formData.bairro || ''}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-grid-2" style={{ gridTemplateColumns: '3fr 1fr' }}>
                        <div className="input-group">
                            <label htmlFor="cidade">Cidade</label>
                            <input
                                id="cidade"
                                type="text"
                                name="cidade"
                                value={formData.cidade || ''}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="estado">Estado</label>
                            <input
                                id="estado"
                                type="text"
                                name="estado"
                                value={formData.estado || ''}
                                onChange={handleChange}
                                maxLength={2}
                                placeholder="SP"
                            />
                        </div>
                    </div>

                    {/* Exibição do erro */}
                    {error && <p className="error-message">{error}</p>}

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={() => navigate('/clients')}
                            className="btn btn-secondary"
                        >
                            Voltar
                        </button>
                        <button type="submit" className="btn btn-success" disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ClientForm;
