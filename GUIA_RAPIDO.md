# 🚀 GUIA RÁPIDO DE INÍCIO - BPA Digital

## ⚡ Setup Rápido (5 minutos)

### 1️⃣ Backend

```powershell
# 1. Entre na pasta
cd Backend

# 2. Crie ambiente virtual
python -m venv venv

# 3. Ative o ambiente
.\venv\Scripts\Activate.ps1

# 4. Instale dependências
pip install -r requirements.txt

# 5. Execute o servidor
uvicorn app.main:app --reload
```

✅ Backend rodando em: **http://localhost:8000**  
📚 Documentação em: **http://localhost:8000/docs**

---

### 2️⃣ Frontend

**Abra outro terminal (deixe o backend rodando)**

```powershell
# 1. Entre na pasta
cd Frontend

# 2. Instale dependências
npm install

# 3. Execute o servidor
npm run dev
```

✅ Frontend rodando em: **http://localhost:5173**

---

## 🎯 Testando o Sistema

### Opção 1: Pelo Frontend (mais fácil)

1. Acesse http://localhost:5173
2. Clique em "Criar conta"
3. Preencha: nome, email, senha
4. Faça login
5. Pronto! Use o sistema

### Opção 2: Pelo Swagger (para testar API)

1. Acesse http://localhost:8000/docs
2. Use o endpoint `POST /auth/register` para criar usuário
3. Use `POST /auth/login` para obter token
4. Clique em "Authorize" (cadeado) e cole o token
5. Teste todos os endpoints!

---

## 📝 Comandos Úteis

### Backend
```powershell
# Executar servidor
uvicorn app.main:app --reload

# Executar com log detalhado
uvicorn app.main:app --reload --log-level debug

# Verificar dependências
pip list

# Atualizar dependências
pip install -r requirements.txt --upgrade
```

### Frontend
```powershell
# Executar dev server
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Instalar nova dependência
npm install nome-do-pacote
```

---

## 🐛 Problemas Comuns

### ❌ Erro: "Não é possível localizar o módulo 'react'"
**Solução:** Execute `npm install` na pasta Frontend

### ❌ Erro: "No module named 'fastapi'"
**Solução:** 
1. Ative o ambiente virtual: `.\venv\Scripts\Activate.ps1`
2. Instale dependências: `pip install -r requirements.txt`

### ❌ Erro: "CORS policy"
**Solução:** Certifique-se que o backend está rodando primeiro

### ❌ Erro: "Database is locked"
**Solução:** Feche o backend, delete `database.db` e execute novamente

### ❌ Frontend não conecta com Backend
**Solução:** Verifique se:
- Backend está em http://localhost:8000
- CORS está configurado no backend (já está!)
- Não há firewall bloqueando

---

## 📊 Estrutura de Pastas

```
BPA/
│
├── Backend/              # 🔥 FOCO PRINCIPAL
│   ├── app/
│   │   ├── models/      # ✅ Tabelas do banco
│   │   ├── schemas/     # ✅ Validações
│   │   ├── routers/     # ✅ Endpoints da API
│   │   ├── auth.py      # ✅ JWT
│   │   ├── database.py  # ✅ Conexão SQLite
│   │   └── main.py      # ✅ App principal
│   ├── database.db      # 🗄️ Banco SQLite (criado automaticamente)
│   ├── requirements.txt
│   ├── .env
│   └── README.md
│
└── Frontend/            # Interface básica
    ├── src/
    │   ├── pages/       # Telas
    │   ├── services/    # Chamadas API
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    └── README.md
```

---

## 🎓 Para Apresentação

### O que mostrar:

1. **Swagger** (http://localhost:8000/docs)
   - Mostra todos os endpoints
   - Documentação automática
   - Validações

2. **Banco de Dados**
   - Abra `database.db` com DB Browser for SQLite
   - Mostre as tabelas criadas
   - Mostre os relacionamentos

3. **Frontend Funcionando**
   - Cadastro de cliente
   - Lista de clientes
   - Criação de relatório

4. **Código Backend**
   - Models bem estruturados
   - Schemas com validações
   - Routers organizados

---

## 📚 Arquivos Importantes

- `Backend/README.md` - Documentação completa do backend
- `Backend/API_EXAMPLES.md` - Exemplos de uso da API
- `Frontend/README.md` - Documentação do frontend
- `README.md` (raiz) - Visão geral do projeto

---

## 🆘 Precisa de Ajuda?

1. **Leia os READMEs** específicos de cada pasta
2. **Use o Swagger** para testar a API visualmente
3. **Verifique os logs** no terminal para erros
4. **Consulte a documentação** das tecnologias:
   - FastAPI: https://fastapi.tiangolo.com
   - React: https://react.dev
   - SQLAlchemy: https://www.sqlalchemy.org

---

**Boa sorte com o trabalho! 🍀**
