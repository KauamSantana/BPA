import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import './Login.css';

function Login() {
  // Mantive “email” para não quebrar o backend, mas rotulei como “Usuário”
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login({ email, senha });
      localStorage.setItem('token', response.access_token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-shell">
        {/* Coluna esquerda - Formulário */}
        <div className="login-left">
          <div className="login-panel">
            <div>
              <div className="brand-title">BPA</div>
              <div className="brand-sub">Digital</div>
            </div>

            <div className="login-box">
              <div className="login-intro">
                <h2>Fazer login</h2>
                <Link to="/register">Não possui uma conta? Crie uma.</Link>
              </div>

              <form onSubmit={handleLogin} className="login-form" noValidate>
                <div className="input-group">
                  <label htmlFor="usuario">Usuário</label>
                  <input
                    id="usuario"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Acesse com seu usuário"
                    autoComplete="username"
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="senha">Senha</label>
                  <input
                    id="senha"
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                </div>

                <div className="form-meta">
                  <span />
                  <Link to="/forgot-password">Esqueci minha senha</Link>
                </div>

                {error && <div className="login-error">{error}</div>}

                <button
                  type="submit"
                  className="login-button"
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading ? 'Entrando...' : 'Acessar'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Coluna direita - Card visual */}
        <div className="login-right">
          <div className="visual-card">
            <div className="visual-frame">
              {/* Top recortado/branco pode ser feito via SVG; aqui mantemos simples */}
              <div className="visual-grid">
                <div className="photo">
                  <img src="https://placehold.co/600x400" alt="Profissional 1" />
                </div>
                <div className="photo">
                  <img src="https://placehold.co/600x400" alt="Profissional 2" />
                </div>
                <div className="photo">
                  <img src="https://placehold.co/600x400" alt="Profissional 3" />
                </div>
                <div className="photo">
                  <img src="https://placehold.co/600x400" alt="Profissional 4" />
                </div>
              </div>

              <div className="visual-footer">
                <div className="visual-logo">🍽️</div>
                <div className="visual-name">BPA Digital</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;