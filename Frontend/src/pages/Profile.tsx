import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import './Profile.css';

interface UserData {
  id: number;
  nome: string;
  email: string;
  criado_em: string;
}

function Profile() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Dados do formulário de edição
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senhaAtual: '',
    senhaNova: '',
    confirmarSenha: ''
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        setFormData({
          nome: data.nome,
          email: data.email,
          senhaAtual: '',
          senhaNova: '',
          confirmarSenha: ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    // Reseta os campos com os dados atuais ao entrar no modo de edição
    if (userData) {
      setFormData({
        nome: userData.nome,
        email: userData.email,
        senhaAtual: '',
        senhaNova: '',
        confirmarSenha: ''
      });
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reseta os campos ao cancelar
    if (userData) {
      setFormData({
        nome: userData.nome,
        email: userData.email,
        senhaAtual: '',
        senhaNova: '',
        confirmarSenha: ''
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    // Validações básicas
    if (formData.senhaNova && formData.senhaNova !== formData.confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Verifica se o email foi alterado
      const emailAlterado = userData && formData.email !== userData.email;
      
      const updateData: any = {
        nome: formData.nome,
        email: formData.email
      };

      // Só envia senha se foi preenchida
      if (formData.senhaNova) {
        updateData.senha_atual = formData.senhaAtual;
        updateData.senha_nova = formData.senhaNova;
      }

      const response = await fetch('http://localhost:8000/auth/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        // Se o email foi alterado, faz logout automático
        if (emailAlterado) {
          alert('Perfil atualizado com sucesso! Você será redirecionado para fazer login novamente com o novo email.');
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else {
          alert('Perfil atualizado com sucesso!');
          await loadUserData(); // Espera carregar os dados
          setIsEditing(false); // Depois sai do modo de edição
        }
      } else {
        const error = await response.json();
        alert(`Erro: ${error.detail}`);
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao atualizar perfil');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="profile-page">
          <div className="loading">Carregando...</div>
        </div>
      </>
    );
  }

  if (!userData) {
    return (
      <>
        <Navbar />
        <div className="profile-page">
          <div className="error">Erro ao carregar dados do usuário</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-header">
            <h1>Meu Perfil</h1>
            {!isEditing && (
              <button className="btn-primary" onClick={handleEdit}>
                ✏️ Editar Perfil
              </button>
            )}
          </div>

          {!isEditing ? (
            // Modo visualização
            <div className="profile-view">
              <div className="profile-card">
                <div className="profile-avatar">
                  <span className="avatar-placeholder">
                    {userData.nome.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                <div className="profile-info">
                  <div className="info-item">
                    <label>Nome:</label>
                    <p>{userData.nome}</p>
                  </div>
                  
                  <div className="info-item">
                    <label>Email:</label>
                    <p>{userData.email}</p>
                  </div>
                  
                  <div className="info-item">
                    <label>Membro desde:</label>
                    <p>{new Date(userData.criado_em).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Modo edição
            <div className="profile-edit">
              <div className="profile-card">
                <h2>Informações Pessoais</h2>
                
                <div className="form-group">
                  <label>Nome:</label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <hr className="divider" />

                <h2>Alterar Senha</h2>
                <p className="hint">Deixe em branco se não quiser alterar a senha</p>
                
                <div className="form-group">
                  <label>Senha Atual:</label>
                  <input
                    type="password"
                    name="senhaAtual"
                    value={formData.senhaAtual}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Nova Senha:</label>
                  <input
                    type="password"
                    name="senhaNova"
                    value={formData.senhaNova}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Confirmar Nova Senha:</label>
                  <input
                    type="password"
                    name="confirmarSenha"
                    value={formData.confirmarSenha}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-actions">
                  <button className="btn-secondary" onClick={handleCancel}>
                    Cancelar
                  </button>
                  <button className="btn-primary" onClick={handleSave}>
                    💾 Salvar Alterações
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Profile;
