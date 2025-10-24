# 🍽️ BPA Digital

Sistema para gerenciamento de Boas Práticas em Alimentação, desenvolvido como projeto acadêmico.

## 📋 Sobre o Projeto

O BPA Digital é uma aplicação completa para fiscalização e gerenciamento de estabelecimentos alimentícios, permitindo:
- Cadastro e gerenciamento de clientes (estabelecimentos)
- Criação de relatórios de inspeção com checklists
- Controle de conformidades e não-conformidades
- Acompanhamento de múltiplos estabelecimentos

## 🏗️ Arquitetura

O projeto está dividido em duas partes independentes:

```
BPA/
├── Backend/     # API REST com FastAPI + SQLite
└── Frontend/    # Interface React + TypeScript + Vite
```

## 🛠️ Tecnologias Utilizadas

### Backend
- **FastAPI** - Framework web Python moderno e rápido
- **SQLAlchemy** - ORM para manipulação do banco de dados
- **SQLite** - Banco de dados leve e local
- **Pydantic** - Validação de dados
- **JWT** - Autenticação com tokens
- **Alembic** - Migrações de banco de dados

### Frontend
- **React 18** - Biblioteca para interfaces
- **TypeScript** - JavaScript tipado
- **Vite** - Build tool rápido
- **React Router** - Navegação
- **Axios** - Cliente HTTP

## 🚀 Como Executar o Projeto Completo

### Pré-requisitos
- Python 3.8+
- Node.js 18+
- npm ou yarn

### 1. Backend

```powershell
# Entrar na pasta do backend
cd Backend

# Criar ambiente virtual
python -m venv venv
.\venv\Scripts\Activate.ps1

# Instalar dependências
pip install -r requirements.txt

# Executar o servidor
uvicorn app.main:app --reload
```

Backend rodará em: **http://localhost:8000**

Documentação (Swagger): **http://localhost:8000/docs**

### 2. Frontend

```powershell
# Entrar na pasta do frontend
cd Frontend

# Instalar dependências
npm install

# Executar o servidor de desenvolvimento
npm run dev
```

Frontend rodará em: **http://localhost:5173**

## 📊 Modelo do Banco de Dados

### Principais Tabelas

**users** - Usuários do sistema
- id, nome, email, senha_hash, criado_em

**clients** - Clientes (estabelecimentos)
- id, status, nome_fantasia, categoria, razao_social, cnpj
- Campos opcionais: email, telefones, endereço completo, etc.

**client_responsibles** - Responsáveis do estabelecimento
- id, cliente_id, tipo, nome_completo, email, telefone, cpf

**client_collaborators** - Informações de colaboradores
- id, cliente_id, numero_total_colaboradores, numero_manipuladores_alimentos

**reports** - Relatórios de inspeção
- id, descricao, cliente_id, categoria, responsavel_inspecao_id, status

**checklist_categories** - Categorias do checklist
- id, relatorio_id, nome, ordem

**checklist_items** - Itens individuais do checklist
- id, categoria_id, codigo, descricao, resposta, observacoes, ordem

## 🔐 Autenticação

O sistema usa JWT (JSON Web Token) para autenticação:

1. Usuário se registra em `/auth/register`
2. Faz login em `/auth/login` ou `/auth/login-json`
3. Recebe um token de acesso
4. Token é incluído no header `Authorization: Bearer <token>` em todas as requisições

## 📚 Documentação da API

Após iniciar o backend, acesse:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Principais Endpoints

**Autenticação**
- `POST /auth/register` - Registrar usuário
- `POST /auth/login` - Login (OAuth2)
- `POST /auth/login-json` - Login (JSON)

**Clientes**
- `GET /clients/` - Listar clientes
- `POST /clients/` - Criar cliente
- `GET /clients/{id}` - Buscar cliente
- `PUT /clients/{id}` - Atualizar cliente
- `DELETE /clients/{id}` - Deletar cliente

**Relatórios**
- `GET /reports/` - Listar relatórios
- `POST /reports/` - Criar relatório
- `GET /reports/{id}` - Buscar relatório
- `PUT /reports/{id}` - Atualizar relatório
- `DELETE /reports/{id}` - Deletar relatório
- `PUT /reports/items/{id}` - Atualizar item checklist

## 📝 Campos do Cadastro de Cliente

### Obrigatórios (*)
- Status (ativo/inativo)
- Nome fantasia
- Categoria (restaurante, mercado, hortifrúti, lanchonete/cafeteria, bar, padaria/confeitaria)
- Razão social
- CNPJ (formato: 00.000.000/0000-00)

### Opcionais
- Inscrição estadual/municipal
- Email
- Site/Instagram
- Telefones (1 e 2)
- Endereço completo (rua, número, bairro, complemento, cidade, estado, CEP)
- Logo

### Responsáveis (não obrigatórios)
- Nome completo
- Email
- Telefone
- CPF
- Tipo (responsável estabelecimento / responsável técnico)

### Colaboradores
- Número total de colaboradores
- Número de manipuladores de alimentos

## 🎯 Funcionalidades Principais

✅ **Autenticação** - Login/registro com JWT
✅ **CRUD de Clientes** - Completo com todos os campos
✅ **CRUD de Relatórios** - Com categorias e checklists
✅ **Validações** - Automáticas com Pydantic
✅ **Banco de Dados** - SQLite modelado corretamente
✅ **API REST** - Documentada automaticamente
✅ **Frontend Funcional** - Todas as telas básicas

## 📌 Próximos Passos

### Backend
- [ ] Implementar exportação de relatórios em PDF
- [ ] Adicionar endpoints de estatísticas/dashboard
- [ ] Implementar upload de imagens (logos)
- [ ] Adicionar paginação otimizada
- [ ] Testes unitários

### Frontend
- [ ] Aplicar design dos mockups
- [ ] Adicionar framework UI (MUI, Chakra)
- [ ] Melhorar validações de formulários
- [ ] Implementar feedback visual (toasts)
- [ ] Adicionar tela de detalhes do cliente
- [ ] Implementar tela de preenchimento de checklist
- [ ] Testes E2E

## 🤝 Contribuidores

- **Backend** - [Seu nome]
- **Frontend** - [Nome do colega]

## 📄 Licença

Este é um projeto acadêmico desenvolvido para fins educacionais.

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique a documentação em `/docs`
2. Consulte os READMEs específicos (Backend/Frontend)
3. Verifique os logs de erro no terminal

---

**Desenvolvido com 💚 para a disciplina de BPA**
