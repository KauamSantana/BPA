import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";
import { useToast } from "../contexts/ToastContext";
import imagemLogin from "../assets/imagem_login.png";
import "./Login.css";
import "../index.css";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  useEffect(() => {
    console.log("[toast] provider ativo no Login");
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // evita duplo clique
    setLoading(true);

    // normaliza antes de validar/enviar
    const emailNorm = email.trim().toLowerCase();
    const senhaNorm = senha.trim();

    if (!emailNorm) {
      toastError("Informe o usuário!");
      setLoading(false);
      return;
    }
    if (!senhaNorm) {
      toastError("Informe a senha!");
      setLoading(false);
      return;
    }

    try {
      const response = await authService.login({ email: emailNorm, senha: senhaNorm });
      localStorage.setItem("token", response.access_token);
      success("Login realizado com sucesso!");
      navigate("/dashboard");
    } catch (err: any) {
      console.warn("Erro no login:", err);

      if (!err?.response) {
        toastError("Falha de conexão. Verifique sua rede.");
        return;
      }

      const status = err.response.status;
      const rawDetail = err.response.data?.detail ?? "";
      const detail = String(rawDetail).toLowerCase();

      if (status === 404 || (detail.includes("não") && detail.includes("encontr"))) {
        toastError("Usuário incorreto!");
      } else if (status === 401 || detail.includes("senha")) {
        toastError("Senha está incorreta!");
      } else if (status === 400) {

        if (detail.includes("Usuário é obrigatório!")) {
          toastError("Informe o usuário!");
        } else if (detail.includes("Senha é obrigatória!")) {
          toastError("Informe a senha!");
        } else {
          toastError(typeof rawDetail === "string" ? rawDetail : "Requisição inválida (400).");
        }
      } else if (status === 422) {
        toastError("Dados inválidos. Verifique usuário e senha.");
      } else {
        toastError("Erro ao fazer login.");
      }
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
              </div>
              <div className="criar-conta">
                Não possui uma conta? <Link to="/register">Crie uma.</Link>
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

                <button
                  type="submit"
                  className="login-button"
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading ? "Entrando..." : "Acessar"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Coluna direita - Imagem */}
        <div className="photo">
          <img src={imagemLogin} alt="Login" />
        </div>
      </div>
    </div>
  );
}

export default Login;
