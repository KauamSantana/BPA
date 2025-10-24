import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientService, Client } from '../services/clientService';
import Navbar from '../components/Navbar';
import './Clients.css';

function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadClients = async () => {
    try {
      const data = await clientService.getAll(search);
      setClients(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadClients();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Deseja realmente deletar este cliente?')) {
      try {
        await clientService.delete(id);
        loadClients();
      } catch (error) {
        alert('Erro ao deletar cliente');
      }
    }
  };

  return (
    <div className="clients-page">
      <Navbar />
      
      <div className="clients-container">
        <div className="clients-header">
          <h1 className="clients-title">👥 Clientes</h1>
          <div className="clients-actions">
            <button 
              className="btn btn-success"
              onClick={() => navigate('/clients/new')}
            >
              ➕ Novo Cliente
            </button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            placeholder="🔍 Buscar por nome ou CNPJ..."
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
        ) : clients.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h2 className="empty-state-title">Nenhum cliente encontrado</h2>
            <p className="empty-state-description">
              {search ? 'Tente ajustar sua busca ou' : 'Comece cadastrando'} seu primeiro cliente
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/clients/new')}
            >
              ➕ Cadastrar Cliente
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="clients-table">
              <thead>
                <tr>
                  <th>Logo</th>
                  <th>Nome / Razão Social</th>
                  <th>CNPJ</th>
                  <th>Categoria</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th className="actions-column">Ações</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td className="logo-cell">
                      {client.logo_url ? (
                        <img 
                          src={client.logo_url} 
                          alt={client.nome_fantasia}
                          className="client-logo"
                        />
                      ) : (
                        <div className="client-logo-placeholder">🏢</div>
                      )}
                    </td>
                    <td>
                      <div className="client-name-cell">
                        <strong>{client.nome_fantasia}</strong>
                        {client.razao_social && client.razao_social !== client.nome_fantasia && (
                          <span className="client-razao-small">{client.razao_social}</span>
                        )}
                      </div>
                    </td>
                    <td className="cnpj-cell">{client.cnpj}</td>
                    <td>
                      <span className="category-badge">{client.categoria}</span>
                    </td>
                    <td className="email-cell">{client.email || '-'}</td>
                    <td>
                      <span className={`status-badge status-${client.status === 'ativo' ? 'active' : 'inactive'}`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        onClick={() => navigate(`/clients/edit/${client.id}`)}
                        className="btn-icon btn-edit"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="btn-icon btn-delete"
                        title="Deletar"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Clients;
