import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useToast } from '../contexts/ToastContext';
import './Login.css';

function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    // validação rápida no front
    const nomeTrim = nome.trim();
    const emailTrim = email.trim().toLowerCase();
    const senhaTrim = senha.trim();

    if (!nomeTrim) {
      toastError('Informe o nome completo!');
      setLoading(false);
      return;
    }
    if (!emailTrim) {
      toastError('Informe o e-mail!');
      setLoading(false);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(emailTrim)) {
      toastError('E-mail inválido.');
      setLoading(false);
      return;
    }
    if (!senhaTrim) {
      toastError('Informe a senha!');
      setLoading(false);
      return;
    }
    if (senhaTrim.length < 6) {
      toastError('A senha deve ter no mínimo 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      await authService.register({ nome: nomeTrim, email: emailTrim, senha: senhaTrim });
      success('Conta criada com sucesso!');
      // redireciona após um pequeno intervalo para o usuário ver o toast
      setTimeout(() => navigate('/'), 1200);
    } catch (err: any) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;

      if (status === 409 || (typeof detail === 'string' && detail.toLowerCase().includes('já cadastrado'))) {
        toastError('E-mail já cadastrado.');
      } else if (status === 400) {
        toastError(typeof detail === 'string' ? detail : 'Requisição inválida (400).');
      } else if (status === 422) {
        toastError('Dados inválidos. Verifique os campos.');
      } else if (!err?.response) {
        toastError('Falha de conexão. Verifique sua rede.');
      } else {
        toastError('Erro ao registrar.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1 className="login-title">Criar Conta</h1>
          <p className="login-subtitle">Bem-vindo ao BPA Digital</p>
        </div>

        <form onSubmit={handleRegister} className="login-form" noValidate>
          <div className="input-group">
            <label htmlFor="nome">Nome Completo</label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome"
              autoComplete="name"
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        <div className="login-footer">
          Já tem conta? <a href="/">Fazer login</a>
        </div>
      </div>
    </div>
  );
}

export default Register;
