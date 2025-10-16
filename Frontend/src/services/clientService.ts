import api from './api';

export interface Client {
  id: number;
  status: 'ativo' | 'inativo';
  nome_fantasia: string;
  categoria: string;
  razao_social: string;
  cnpj: string;
  email?: string;
  telefone_contato_1?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  bairro?: string;
  logo_url?: string;
}

export interface ClientCreate {
  status: 'ativo' | 'inativo';
  nome_fantasia: string;
  categoria: string;
  razao_social: string;
  cnpj: string;
  email?: string;
  telefone_contato_1?: string;
  telefone_contato_2?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  complemento?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  site_instagram?: string;
  logo_url?: string;
}

export const clientService = {
  getAll: async (search?: string) => {
    const params = search ? { search } : {};
    const response = await api.get<Client[]>('/clients/', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Client>(`/clients/${id}`);
    return response.data;
  },

  create: async (data: ClientCreate) => {
    const response = await api.post<Client>('/clients/', data);
    return response.data;
  },

  update: async (id: number, data: Partial<ClientCreate>) => {
    const response = await api.put<Client>(`/clients/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/clients/${id}`);
  },
};
