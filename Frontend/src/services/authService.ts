import api from './api';

export interface LoginData {
  email: string;
  senha: string;
}

export interface RegisterData {
  nome: string;
  email: string;
  senha: string;
  role?: 'admin' | 'chefe' | 'operador';
  superior_id?: number;
}

export interface UserSimplified {
  id: number;
  nome: string;
  email: string;
  role: 'admin' | 'chefe' | 'operador';
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface UserInfo {
  id: number;
  nome: string;
  email: string;
  criado_em: string;
}

export interface DashboardStats {
  user_name: string;
  total_clients: number;
  total_reports: number;
}

export const authService = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login-json', data);
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<UserInfo> => {
    const response = await api.get<UserInfo>('/auth/me');
    return response.data;
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/auth/dashboard-stats');
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', null, {
      params: { email }
    });
    return response.data;
  },

  getAllUsers: async (): Promise<UserSimplified[]> => {
    const response = await api.get<UserSimplified[]>('/auth/users');
    return response.data;
  },

  getSubordinates: async (): Promise<UserSimplified[]> => {
    const response = await api.get<UserSimplified[]>('/auth/users/subordinados');
    return response.data;
  },
};
