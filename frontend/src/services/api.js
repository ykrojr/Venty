import axios from 'axios';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
});

// Instancia separada para rotas de autenticação que não usam o prefixo /v1
export const authApi = axios.create({
  baseURL: `${BASE_URL}/api/auth`,
});

// Interceptor para injetar o token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@Venty:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros globais (ex: 403, 401)
const responseInterceptor = (error) => {
  if (error.response) {
    if (error.response.status === 401) {
      toast.error('Sessão expirada. Faça login novamente.');
      localStorage.removeItem('@Venty:token');
      localStorage.removeItem('@Venty:user');
      window.location.href = '/';
    } else if (error.response.status === 403) {
      toast.error('Sem permissão para acessar este recurso.');
    } else if (error.response.data && error.response.data.erro) {
      toast.error(error.response.data.erro);
    } else {
      // Erros de validação (Bean Validation)
      const errosDeValidacao = Object.values(error.response.data);
      if (errosDeValidacao.length > 0 && typeof errosDeValidacao[0] === 'string') {
        toast.error(errosDeValidacao[0]); // Mostrar a primeira mensagem de validação
      }
    }
  } else {
    toast.error('Erro de conexão com o servidor.');
  }
  return Promise.reject(error);
};

api.interceptors.response.use((response) => response, responseInterceptor);
authApi.interceptors.response.use((response) => response, responseInterceptor);
