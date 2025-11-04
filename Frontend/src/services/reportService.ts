import api from './api';

export interface ChecklistItem {
  id: number;
  codigo: string;
  descricao: string;
  resposta: 'conforme' | 'nao_conforme' | 'na' | null;
  observacoes: string;
}

export interface ChecklistCategory {
  id: number;
  nome: string;
  ordem: number;
  itens: ChecklistItem[];
}

export interface Report {
  id: number;
  descricao: string;
  cliente_id: number;
  cliente?: { nome_fantasia: string };
  categoria?: string;
  status: 'em_andamento' | 'concluido';
  criado_em: string;
  data_agendada?: string;
  categorias?: ChecklistCategory[];
}

export interface ReportCreate {
  descricao: string;
  cliente_id: number;
  categoria?: string;
  responsavel_inspecao_id: number;
  data_agendada?: string;
  categorias?: Array<{
    nome: string;
    ordem: number;
    itens: Array<{
      codigo: string;
      descricao: string;
      ordem: number;
    }>;
  }>;
}

export const reportService = {
  getAll: async (cliente_id?: number) => {
    const params = cliente_id ? { cliente_id } : {};
    const response = await api.get<Report[]>('/reports/', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Report>(`/reports/${id}`);
    return response.data;
  },

  create: async (data: ReportCreate) => {
    const response = await api.post<Report>('/reports/', data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/reports/${id}`);
  },

  updateChecklistItem: async (itemId: number, data: { resposta?: 'conforme' | 'nao_conforme' | 'na'; observacoes?: string }) => {
    const response = await api.put(`/reports/items/${itemId}`, data);
    return response.data;
  },

  exportPDF: async (reportId: number) => {
    const response = await api.get(`/reports/${reportId}/pdf`, {
      responseType: 'blob', // Importante para download de arquivo
    });
    
    // Cria URL temporária para o blob
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_${reportId}_${new Date().getTime()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  finalizar: async (reportId: number) => {
    const response = await api.post<Report>(`/reports/${reportId}/finalizar`);
    return response.data;
  },

  getReportsByMonth: async (mes: number, ano: number) => {
    const response = await api.get<Report[]>('/reports/agenda/calendario', {
      params: { mes, ano }
    });
    return response.data;
  },
};
