# Stock API — Fluxo B

API REST de produtos, unidades e movimentações de estoque usando NestJS, TypeScript, Prisma ORM, PostgreSQL, JWT e Swagger.

## Pré-requisitos
- Node.js 20 ou superior
- Docker Desktop (com Docker Compose)

## Instalação
1. Copie `.env.example` para `.env` e altere `JWT_SECRET` para um segredo aleatório longo.
2. Inicie o PostgreSQL: `docker compose up -d`
3. Instale dependências: `npm install`
4. Gere o cliente Prisma: `npx prisma generate`
5. Crie as tabelas/migration: `npx prisma migrate dev --name init`
6. Insira dados iniciais: `npm run prisma:seed`
7. Inicie a API: `npm run start:dev`

Swagger: http://localhost:3000/docs
Prefixo da API: http://localhost:3000/api/v1

## Usuários de demonstração
- Admin: `admin@stock.local` / `Admin123!`
- Gerente: `gerente@stock.local` / `Gerente123!`
- Atendente: `atendente@stock.local` / `Atendente123!`

Troque/remova essas credenciais antes de qualquer implantação. Nunca use as credenciais de seed em produção.

## Endpoints
- `POST /api/v1/auth/login`
- `POST /api/v1/produtos`
- `GET /api/v1/produtos?page=1&limit=20&search=cafe`
- `GET /api/v1/produtos/:id`
- `PATCH /api/v1/produtos/:id`
- `POST /api/v1/unidades`
- `GET /api/v1/unidades?page=1&limit=20`
- `POST /api/v1/estoques/movimentacoes`
- `GET /api/v1/estoques/saldos?unitId=<uuid>&page=1&limit=20`
- `GET /api/v1/estoques/movimentacoes?productId=<uuid>`

## Exemplos
Login:
```json
{"email":"admin@stock.local","password":"Admin123!"}
```

Criar produto (Bearer token obrigatório; ADMIN ou GERENTE):
```json
{"sku":"ARROZ-5KG","name":"Arroz 5 kg","description":"Pacote de arroz"}
```

Criar unidade (ADMIN ou GERENTE):
```json
{"code":"LOJA-NORTE","name":"Loja Norte"}
```

Entrada (ATENDENTE, GERENTE ou ADMIN):
```json
{"productId":"UUID_DO_PRODUTO","unitId":"UUID_DA_UNIDADE","type":"ENTRADA","quantity":100,"reason":"Compra de reposição"}
```

Saída:
```json
{"productId":"UUID_DO_PRODUTO","unitId":"UUID_DA_UNIDADE","type":"SAIDA","quantity":15,"reason":"Venda"}
```

O saldo após entrada de 100 e saída de 15 deve ser 85. Saídas maiores que o saldo são recusadas. O histórico é persistido com usuário, data, tipo, quantidade e saldo resultante.

## Observações
- Erros retornam `error`, `message`, `details`, `timestamp` e `path`.
- O middleware de validação rejeita campos desconhecidos e entradas inválidas.
- `CLIENTE`, `ATENDENTE`, `COZINHA`, `GERENTE` e `ADMIN` são os perfis definidos. Cadastro público de usuário não está habilitado; os usuários são provisionados pelo seed ou por processo administrativo confiável.
- Em um ambiente real, use segredos seguros, TLS, política de backup, monitoramento, rate limiting e testes automatizados.
