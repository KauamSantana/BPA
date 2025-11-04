import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useToast } from '../contexts/ToastContext';
import './Login.css';
import imagemLogin from '../assets/imagem_login.png';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { success, error: toastError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // validação simples no front
    const trimmed = email.trim();
    if (!trimmed) {
      toastError('Informe o e-mail!');
      return;
    }
    // regex simples para e-mail
    if (!/\S+@\S+\.\S+/.test(trimmed)) {
      toastError('E-mail inválido.');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.forgotPassword(trimmed);
      // backend costuma retornar { message: '...' }
      const msg = response?.message || 'Se existir uma conta, você receberá instruções no e-mail informado.';
      success(msg);
    } catch (err: any) {
      const detail = err?.response?.data?.detail || 'Erro ao processar solicitação';
      toastError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <Link to="/login" style={{ color: '#05A672', textDecoration: 'none', padding: 26 }}>
          ← Voltar para Login
        </Link>
      </div>

      <div className="login-shell">
        <div className="login-left">
          <div className="login-panel">
            <div>
              <div className="brand-title">BPA</div>
              <div className="brand-sub">Digital</div>
            </div>

            <div className="login-box">
              <div className="login-intro">
                <h2>Esqueci minha senha</h2>
              </div>
              <div>
                <p style={{ color: '#666', marginTop: '0.5rem' }}>
                  Digite seu e-mail para receber instruções de recuperação
                </p>
              </div>

              <form onSubmit={handleSubmit} className="login-form" noValidate>
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

                <button
                  type="submit"
                  className="login-button"
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading ? 'Enviando...' : 'Enviar Instruções'}
                </button>

                <div style={{ marginTop: 12, textAlign: 'center' }}>
                  <small style={{ color: '#6b7280' }}>
                    Se o e-mail estiver cadastrado, você receberá um link de redefinição.
                  </small>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="photo">
          <img src={imagemLogin} alt="Login" />
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
