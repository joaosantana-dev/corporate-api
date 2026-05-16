# Corporate API

API REST para o sistema HelpDesk TI. Construída com Node.js + Express, autenticação JWT com refresh tokens, rate limiting e suporte a múltiplos bancos de dados via Knex.

> **Frontend:** [helpdesk-system](../helpdesk-system)

## Funcionalidades

- Autenticação JWT com access token (15min) e refresh token (7d)
- Recuperação de senha com token de uso único
- CRUD completo de chamados, usuários, categorias e equipes
- Controle de acesso por perfil (`admin`, `tecnico`, `usuario`)
- Relatórios: resumo, por categoria, prioridade, técnico, semanal e mensal
- Rate limiting no login (10 tentativas / 15 min)
- Headers de segurança com Helmet
- CORS configurável por ambiente

## Stack

| Tecnologia | Uso |
|---|---|
| Node.js + Express | Servidor HTTP |
| Knex.js | Query builder e migrations |
| SQLite3 | Banco de dados (desenvolvimento) |
| bcryptjs | Hash de senhas |
| jsonwebtoken | Tokens JWT |
| Helmet | Headers de segurança |
| express-rate-limit | Proteção contra brute-force |

## Como rodar

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env e defina JWT_SECRET com um valor forte:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 3. Executar migrations e seeds
npx knex migrate:latest
npx knex seed:run

# 4. Iniciar o servidor
node src/server.js
```

API disponível em: `http://localhost:3333`

## Variáveis de ambiente

| Variável | Descrição | Padrão |
|---|---|---|
| `PORT` | Porta do servidor | `3333` |
| `NODE_ENV` | Ambiente (`development` / `production`) | `development` |
| `JWT_SECRET` | Chave secreta para assinar tokens | — |
| `JWT_EXPIRES_IN` | Expiração do access token | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Expiração do refresh token | `7d` |
| `CORS_ORIGIN` | Origem permitida em produção | `http://localhost:5173` |
| `FRONTEND_URL` | URL base do frontend (para links de reset) | `http://localhost:5173` |

## Endpoints principais

```
POST   /api/helpdesk/auth/register
POST   /api/helpdesk/auth/login
POST   /api/helpdesk/auth/refresh
POST   /api/helpdesk/auth/forgot-password
POST   /api/helpdesk/auth/reset-password
POST   /api/helpdesk/auth/logout
GET    /api/helpdesk/auth/me

GET    /api/helpdesk/tickets
POST   /api/helpdesk/tickets
GET    /api/helpdesk/tickets/:id
PUT    /api/helpdesk/tickets/:id
DELETE /api/helpdesk/tickets/:id
GET    /api/helpdesk/tickets/:id/comments
POST   /api/helpdesk/tickets/:id/comments

GET    /api/helpdesk/users
POST   /api/helpdesk/users
PUT    /api/helpdesk/users/:id
DELETE /api/helpdesk/users/:id

GET    /api/helpdesk/reports/summary
GET    /api/helpdesk/reports/weekly
GET    /api/helpdesk/reports/monthly
GET    /api/helpdesk/reports/by-category
GET    /api/helpdesk/reports/by-priority
GET    /api/helpdesk/reports/by-technician

GET    /health
```

## Estrutura

```
src/
├── config/
│   └── database.js          # Conexão Knex
├── database/
│   ├── migrations/          # Migrations versionadas
│   └── seeds/               # Dados iniciais
├── middleware/
│   ├── auth.js              # Middleware JWT
│   └── errorHandler.js      # Tratamento centralizado de erros
├── modules/
│   └── helpdesk/
│       ├── queries/         # Queries por domínio
│       └── routes/          # Rotas por domínio
├── app.js                   # Configuração Express
└── server.js                # Bootstrap
```

## Contas de teste (seed)

| E-mail | Senha | Perfil |
|---|---|---|
| admin@empresa.com | 123456 | Admin |
| tecnico@empresa.com | 123456 | Técnico |
| usuario@empresa.com | 123456 | Usuário |

## Produção

Para usar PostgreSQL em produção, configure as variáveis `DB_CLIENT`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` e `DB_PASSWORD` no `.env` e defina `NODE_ENV=production`.
