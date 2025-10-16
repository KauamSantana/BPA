# BPA Digital - Frontend

Frontend da aplicação BPA Digital construído com React, TypeScript e Vite.

## 🛠️ Tecnologias

- **React 18** - Biblioteca para construção de interfaces
- **TypeScript** - JavaScript com tipagem
- **Vite** - Build tool rápido
- **React Router** - Navegação entre páginas
- **Axios** - Cliente HTTP para chamadas à API

## 📁 Estrutura do Projeto

```
Frontend/
├── src/
│   ├── pages/           # Páginas da aplicação
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Clients.tsx
│   │   ├── ClientForm.tsx
│   │   └── Reports.tsx
│   ├── services/        # Serviços para comunicação com API
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── clientService.ts
│   │   └── reportService.ts
│   ├── App.tsx          # Componente principal
│   └── main.tsx         # Ponto de entrada
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🚀 Como Executar

### 1. Instalar dependências

```powershell
npm install
```

### 2. Iniciar servidor de desenvolvimento

```powershell
npm run dev
```

O frontend estará disponível em: **http://localhost:5173**

### 3. Build para produção

```powershell
npm run build
```

## 🔗 Integração com Backend

O frontend está configurado para se comunicar com o backend em `http://localhost:8000`.

Certifique-se de que o backend está rodando antes de usar o frontend!

## 📱 Páginas Disponíveis

### Públicas
- **/** - Login
- **/register** - Registro de novo usuário

### Privadas (requerem autenticação)
- **/dashboard** - Dashboard principal
- **/clients** - Lista de clientes
- **/clients/new** - Cadastro de novo cliente
- **/reports** - Lista de relatórios

## 🔐 Autenticação

O sistema usa JWT (JSON Web Token) armazenado no localStorage.

**Fluxo:**
1. Usuário faz login
2. Token é salvo no localStorage
3. Token é automaticamente incluído em todas as requisições
4. Ao fazer logout, token é removido

## 📝 Observações

**IMPORTANTE**: Este frontend é básico e funcional, **sem foco em design/estilo**.

O objetivo é:
- ✅ Ter todos os campos necessários funcionando
- ✅ Integrar com as APIs do backend
- ✅ Servir de base para o desenvolvedor frontend

**O que NÃO foi feito (propositalmente):**
- ❌ Design bonito / CSS elaborado
- ❌ Animações
- ❌ Componentes reutilizáveis complexos
- ❌ Validações avançadas no frontend
- ❌ Loading states detalhados
- ❌ Mensagens de erro bonitas

**Para melhorar (se quiser):**
- Adicionar Material-UI (MUI) ou outro framework de componentes
- Melhorar validações de formulário
- Adicionar estados de loading mais visuais
- Implementar toasts/notificações
- Criar componentes reutilizáveis
- Adicionar tratamento de erros mais robusto

## 🐛 Troubleshooting

### Erro de CORS
Certifique-se que o backend está rodando e configurado para aceitar requisições do frontend.

### Erro "Network Error"
Verifique se o backend está rodando em `http://localhost:8000`.

### Token expirado
Faça logout e login novamente.

## 📚 Próximos Passos

Para o desenvolvedor frontend que vai trabalhar nisso:

1. **Instalar framework de UI** (MUI, Chakra UI, etc)
2. **Criar componentes reutilizáveis** (Button, Input, Card, etc)
3. **Melhorar o design** seguindo os mockups fornecidos
4. **Adicionar validações** mais robustas nos formulários
5. **Implementar feedback visual** (loading, success, error)
6. **Otimizar performance** com React Query ou SWR
7. **Adicionar testes** (Jest, React Testing Library)

Boa sorte! 🚀
