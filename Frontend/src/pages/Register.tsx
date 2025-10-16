import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import './Login.css'; // Reutilizando os mesmos estilos do Login

function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.register({ nome, email, senha });
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">✨</div>
            <h1 className="login-title">Criar Conta</h1>
            <p className="login-subtitle">Bem-vindo ao BPA Digital</p>
          </div>

          {success ? (
            <div style={{ 
              background: '#D5F4E6', 
              color: 'var(--success-color)', 
              padding: 'var(--spacing-lg)', 
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              fontWeight: 600
            }}>
              ✓ Conta criada com sucesso! Redirecionando...
            </div>
          ) : (
            <form onSubmit={handleRegister} className="login-form">
              <div className="input-group">
                <label>Nome Completo</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  placeholder="Seu nome"
                />
              </div>

              <div className="input-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                />
              </div>

              <div className="input-group">
                <label>Senha</label>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              {error && <div className="login-error">{error}</div>}

              <button 
                type="submit" 
                className="login-button"
                disabled={loading}
              >
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </button>
            </form>
          )}

          <div className="login-footer">
            Já tem conta? <a href="/">Fazer login</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
