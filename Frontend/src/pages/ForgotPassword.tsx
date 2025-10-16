import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import './Login.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      setMessage(response.message);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao processar solicitação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
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
                <p style={{ color: '#666', marginTop: '0.5rem' }}>
                  Digite seu email para receber instruções de recuperação
                </p>
              </div>

              {success ? (
                <div className="success-message">
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                  <p style={{ marginBottom: '1.5rem' }}>{message}</p>
                  <Link to="/login" className="login-button" style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>
                    Voltar para Login
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="login-form">
                  <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>

                  {error && <div className="login-error">{error}</div>}
                  {message && !success && <div className="login-info">{message}</div>}

                  <button
                    type="submit"
                    className="login-button"
                    disabled={loading}
                  >
                    {loading ? 'Enviando...' : 'Enviar Instruções'}
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <Link to="/login" style={{ color: '#667eea', textDecoration: 'none' }}>
                      ← Voltar para Login
                    </Link>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="visual-card">
            <div className="visual-frame">
              <div className="visual-grid">
                <div className="photo">
                  <img src="https://placehold.co/600x400" alt="Segurança 1" />
                </div>
                <div className="photo">
                  <img src="https://placehold.co/600x400" alt="Segurança 2" />
                </div>
                <div className="photo">
                  <img src="https://placehold.co/600x400" alt="Segurança 3" />
                </div>
                <div className="photo">
                  <img src="https://placehold.co/600x400" alt="Segurança 4" />
                </div>
              </div>

              <div className="visual-footer">
                <div className="visual-logo">🔐</div>
                <div className="visual-name">Recuperação Segura</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
