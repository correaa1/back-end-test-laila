# Gerenciador de Finanças Pessoais - API

Este projeto é uma API REST para um sistema de gerenciamento de finanças pessoais, desenvolvido como parte de um teste técnico. O sistema permite que os usuários gerenciem suas receitas e despesas, categorizem seus lançamentos financeiros e visualizem resumos mensais de suas finanças.

## Tecnologias Utilizadas

- **Backend**: Node.js com NestJS
- **Banco de Dados**: PostgreSQL
- **ORM**: TypeORM
- **Autenticação**: JWT (JSON Web Token)
- **Testes**: Jest
- **Docker**: Docker e Docker Compose para containerização

## Arquitetura

O projeto segue uma arquitetura modular orientada a domínio, onde cada módulo representa uma entidade ou funcionalidade do sistema:

- **Auth**: Autenticação e registro de usuários
- **Users**: Gerenciamento de usuários
- **Categories**: Gerenciamento de categorias
- **Transactions**: Gerenciamento de lançamentos financeiros
- **Summaries**: Relatórios e resumos financeiros

### Entidades e Relacionamentos

- **User**: Representa um usuário do sistema
- **Category**: Representa uma categoria de lançamento financeiro (pertence a um usuário)
- **Transaction**: Representa um lançamento financeiro (pertence a um usuário e a uma categoria)

## Funcionalidades

1. **Autenticação**
   - Registro de novos usuários
   - Login com geração de token JWT
   - Proteção de rotas com middleware de autenticação

2. **Categorias**
   - Criação, listagem, atualização e remoção de categorias
   - Cada usuário gerencia suas próprias categorias

3. **Lançamentos Financeiros**
   - Criação, listagem, atualização e remoção de lançamentos
   - Cada lançamento tem título, valor, tipo (receita ou despesa), categoria e data

4. **Resumo Mensal**
   - Visualização do resumo financeiro mensal
   - Total de receitas, total de despesas e saldo do mês

## Execução Rápida com Docker

A maneira mais simples de testar esta aplicação é usando Docker:

```bash
# Clonar o repositório
git clone <url-do-repositorio>
cd <pasta-do-projeto>

# Iniciar aplicação completa (API + banco de dados)
docker-compose up -d

# Verificar logs da aplicação
docker-compose logs -f api
```

Após a inicialização:
- API estará disponível em: http://localhost:3001
- Migrations são executadas automaticamente
- Um usuário de teste é criado (caso configurado)

### Parando a aplicação

```bash
docker-compose down  # Mantém os dados do banco
# ou
docker-compose down -v  # Remove volumes (perde dados do banco)
```

## Como Executar o Projeto

### Pré-requisitos

- Node.js (v14 ou superior)
- Docker e Docker Compose (para execução com containers)
- PostgreSQL (para execução sem Docker)

### Instalação com Docker

1. Clone o repositório:
   ```bash
   git clone <url-do-repositorio>
   cd <nome-do-repositorio>
   ```

2. Inicie os containers com Docker Compose:
   ```bash
   docker-compose up -d
   ```

3. A API estará disponível em `http://localhost:3001`

### Instalação sem Docker

1. Clone o repositório:
   ```bash
   git clone <url-do-repositorio>
   cd <nome-do-repositorio>
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente (crie um arquivo `.env` baseado no `.env.example`)

4. Execute as migrations:
   ```bash
   npm run migration:run
   ```

5. Inicie o servidor:
   ```bash
   npm run start:dev
   ```

6. A API estará disponível em `http://localhost:3001`

## Estrutura do Projeto

```
src/
├── auth/             # Módulo de autenticação
├── categories/       # Módulo de categorias
├── common/           # Código compartilhado
├── config/           # Configurações
├── database/         # Migrations e seeds
├── summaries/        # Módulo de resumos financeiros
├── transactions/     # Módulo de lançamentos financeiros
├── users/            # Módulo de usuários
├── app.module.ts     # Módulo principal
└── main.ts           # Ponto de entrada
```

## Endpoints da API

### Autenticação

- `POST /auth/register` - Registrar novo usuário
- `POST /auth/login` - Login de usuário

### Categorias

- `GET /categories` - Listar todas as categorias
- `GET /categories/:id` - Buscar categoria por ID
- `POST /categories` - Criar nova categoria
- `PUT /categories/:id` - Atualizar categoria existente
- `DELETE /categories/:id` - Remover categoria

### Lançamentos Financeiros

- `GET /transactions` - Listar todos os lançamentos
- `GET /transactions/:id` - Buscar lançamento por ID
- `POST /transactions` - Criar novo lançamento
- `PUT /transactions/:id` - Atualizar lançamento existente
- `DELETE /transactions/:id` - Remover lançamento

### Resumos

- `GET /summaries/monthly?month=X&year=YYYY` - Obter resumo financeiro mensal

### Importar collection com os endpoints da API

- Baixe o arquivo json da collection: [Finance API Collection.postman_collection.json](./postman/Finance_API_Collection.postman_collection.json)

- importe o arquivo na ferramenta de requisição de sua preferencia.

## Testes

Execute os testes unitários com o comando:

```bash
npm run test
```

Para executar testes com cobertura:

```bash
npm run test:cov
```

## Decisões Técnicas e Arquiteturais

### Por que NestJS?

NestJS foi escolhido como framework por oferecer:
- **Arquitetura modular** com injeção de dependências que facilita a manutenção e testabilidade
- **Suporte nativo a TypeScript** proporcionando tipagem forte e melhor experiência de desenvolvimento
- **Integração simplificada** com bibliotecas como TypeORM, Passport e outros
- **Escalabilidade** através de sua estrutura organizada e módulos independentes

### Decisões de Banco de Dados

PostgreSQL foi selecionado considerando:
- **Integridade referencial** para garantir consistência nas relações entre entidades
- **Suporte a tipos ENUM** utilizado para os tipos de transação
- **Performance em operações de leitura/escrita** importantes para uma aplicação financeira
- **Maturidade e confiabilidade** para dados sensíveis financeiros

### Estratégia de Autenticação

A autenticação JWT foi implementada porque:
- **Stateless** - Não requer armazenamento de sessão no servidor
- **Escalabilidade** - Permite escalar horizontalmente sem compartilhamento de estado
- **Segurança** - Tokens são assinados e podem ter tempo de expiração
- **Facilidade de uso no frontend** - Simples de armazenar e enviar em requisições

### Padrões de Projeto Utilizados

- **Repository Pattern** - Abstração da camada de dados para facilitar testes e manutenção
- **DTO Pattern** - Validação e transformação de dados de entrada/saída
- **Decorator Pattern** - Utilizado para autorização e recuperação do usuário atual
- **Service Layer** - Encapsulamento da lógica de negócios separada dos controllers

### Validação e Segurança

- **Class-validator** para validação declarativa de DTOs
- **Bcrypt** para hashing seguro de senhas
- **Sanitização de dados** para prevenir injeção SQL e XSS
- **Isolamento de dados por usuário** para garantir acesso apenas aos próprios recursos

### Decisões de Design de API

- **RESTful** - Endpoints seguem princípios REST para consistência e previsibilidade
- **Respostas padronizadas** - Formato consistente de respostas para facilitar integração
- **Validação robusta** - Todas as entradas são validadas antes de processamento
- **Filtragem e paginação** - Suporte para busca eficiente de dados

