import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientService, Client } from '../services/clientService';
import Navbar from '../components/Navbar';
import { useToast } from '../contexts/ToastContext';
import './Clients.css';
import restaurantIcon from '../assets/icons/restaurant-icon.png';
import editIcon from '../assets/icons/edit-icon.png';
import deleteIcon from '../assets/icons/delete-icon.png';
import groupIcon from '../assets/icons/group-icon.png';

function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // modal de exclusão
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();
  const { success, error: toastError, info } = useToast();

  const loadClients = async (q: string = search) => {
    try {
      setLoading(true);
      const data = await clientService.getAll(q);
      setClients(data);
      if (q && data.length === 0) {
        info('Nenhum cliente encontrado para a busca.');
      }
    } catch (err: any) {
      console.error('Erro ao carregar clientes:', err);
      const detail = err?.response?.data?.detail;
      toastError(detail ?? 'Erro ao carregar clientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadClients();
  };

  // abrir modal
  const openDeleteModal = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  // fechar modal
  const closeDeleteModal = () => {
    if (deleting) return;
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  // confirmar exclusão
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await clientService.delete(deleteId);
      success('Cliente deletado com sucesso!');
      closeDeleteModal();
      loadClients();
    } catch (err: any) {
      console.error('Erro ao deletar cliente:', err);
      const detail = err?.response?.data?.detail;
      toastError(detail ?? 'Erro ao deletar cliente.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="clients-page">
      <Navbar />

      <div className="clients-container">
        <div className="clients-header">
          <div className="clients-title-group">
            <img src={groupIcon} alt="Clientes" className="clients-icon" />
            <h1 className="clients-title">Clientes</h1>
          </div>
        </div>

        <div className="clients-search-row">
          <form onSubmit={handleSearch} className="search-bar">
            <input
              type="text"
              placeholder="Buscar por nome ou CNPJ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              Buscar
            </button>
          </form>

          <button
            className="btn btn-success"
            onClick={() => navigate('/clients/new')}
          >
            + Novo Cliente
          </button>
        </div>

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
              + Cadastrar Cliente
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
                        <div className="client-logo-placeholder">
                          <img src={restaurantIcon} alt="Logo Restaurante" />
                        </div>
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
                        <img src={editIcon} alt="Editar" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(client.id)}
                        className="btn-icon btn-delete"
                        title="Deletar"
                      >
                        <img src={deleteIcon} alt="Deletar" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="modal-content fade-in" onClick={(e) => e.stopPropagation()}>
            <h3>Excluir cliente</h3>
            <p>Tem certeza que deseja excluir este cliente? Esta ação não poderá ser desfeita.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <button className="btn btn-secondary" onClick={closeDeleteModal} disabled={deleting}>
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={confirmDelete} disabled={deleting}>
                {deleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Clients;
