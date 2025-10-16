# BPA Digital - Backend

Backend da aplicação BPA Digital para gerenciamento de Boas Práticas em Alimentação.

## 🛠️ Tecnologias

- **FastAPI** - Framework web moderno e rápido
- **SQLAlchemy** - ORM para Python
- **SQLite** - Banco de dados
- **Pydantic** - Validação de dados
- **JWT** - Autenticação com tokens

## 📁 Estrutura do Projeto

```
Backend/
├── app/
│   ├── models/          # Modelos do banco de dados
│   │   ├── user.py
│   │   ├── client.py
│   │   └── report.py
│   ├── schemas/         # Schemas Pydantic para validação
│   │   ├── user.py
│   │   ├── client.py
│   │   └── report.py
│   ├── routers/         # Endpoints da API
│   │   ├── auth.py      # Autenticação
│   │   ├── clients.py   # CRUD de clientes
│   │   └── reports.py   # CRUD de relatórios
│   ├── auth.py          # Funções de autenticação JWT
│   ├── database.py      # Configuração do banco
│   └── main.py          # Aplicação principal
├── database.db          # Banco de dados SQLite (gerado automaticamente)
├── requirements.txt     # Dependências Python
├── .env                 # Variáveis de ambiente
└── README.md
```

## 🚀 Como Executar

### 1. Criar ambiente virtual (recomendado)

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 2. Instalar dependências

```powershell
pip install -r requirements.txt
```

### 3. Executar o servidor

```powershell
uvicorn app.main:app --reload
```

O servidor estará disponível em: **http://localhost:8000**

## 📚 Documentação da API

Após iniciar o servidor, acesse:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação.

### Como usar:

1. **Registrar usuário**: `POST /auth/register`
2. **Fazer login**: `POST /auth/login` ou `POST /auth/login-json`
3. **Copiar o token** retornado
4. **No Swagger**, clicar no botão "Authorize" e colar o token
5. Agora você pode usar todos os endpoints protegidos

## 📊 Endpoints Principais

### Autenticação

- `POST /auth/register` - Registrar novo usuário
- `POST /auth/login` - Login (OAuth2 form)
- `POST /auth/login-json` - Login (JSON)

### Clientes

- `GET /clients/` - Listar clientes (com busca e paginação)
- `POST /clients/` - Criar cliente
- `GET /clients/{id}` - Buscar cliente específico
- `PUT /clients/{id}` - Atualizar cliente
- `DELETE /clients/{id}` - Deletar cliente

### Relatórios

- `GET /reports/` - Listar relatórios (com filtros)
- `POST /reports/` - Criar relatório com checklist
- `GET /reports/{id}` - Buscar relatório específico
- `PUT /reports/{id}` - Atualizar relatório
- `DELETE /reports/{id}` - Deletar relatório
- `PUT /reports/items/{id}` - Atualizar item de checklist

## 🗄️ Modelo do Banco de Dados

### Tabelas:

- **users** - Usuários do sistema
- **clients** - Clientes (estabelecimentos)
- **client_responsibles** - Responsáveis do estabelecimento
- **client_collaborators** - Informações de colaboradores
- **reports** - Relatórios de inspeção
- **checklist_categories** - Categorias do checklist
- **checklist_items** - Itens individuais do checklist

## ⚙️ Variáveis de Ambiente (.env)

```env
DATABASE_URL=sqlite:///./database.db
SECRET_KEY=sua-chave-secreta-aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**IMPORTANTE**: Troque o `SECRET_KEY` para algo seguro!

## 🧪 Testando a API

### 1. Registrar um usuário

```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@example.com",
    "senha": "senha123"
  }'
```

### 2. Fazer login

```bash
curl -X POST "http://localhost:8000/auth/login-json" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "senha": "senha123"
  }'
```

### 3. Usar o Swagger

Acesse http://localhost:8000/docs e use a interface visual!

## 📝 Observações

- O banco de dados SQLite é criado automaticamente na primeira execução
- Todos os endpoints (exceto autenticação) requerem token JWT
- A validação de dados é feita automaticamente pelo Pydantic
- CORS está configurado para aceitar requisições do frontend (localhost:3000 e localhost:5173)

## 🐛 Troubleshooting

### Erro de importação do `jose`

```powershell
pip install python-jose[cryptography]
```

### Erro de importação do `passlib`

```powershell
pip install passlib[bcrypt]
```

### Banco de dados não cria

Verifique se tem permissão de escrita na pasta do projeto.
