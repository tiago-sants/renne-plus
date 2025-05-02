# renne-plus - Sistema de Gerenciamento para Barbearias e Salões

renne-plus é um sistema completo para gerenciamento de barbearias e salões, oferecendo funcionalidades como agendamento online, sistema de fila, painéis para barbeiros, clientes e administradores.

## Funcionalidades Principais

- **Sistema de Agendamento**: Permite que clientes agendem horários online, escolhendo serviço, profissional e horário.
- **Sistema de Fila**: Gerencia filas de espera em tempo real, permitindo que clientes vejam o tempo estimado de espera.
- **Painel do Barbeiro**: Dashboard para gerenciar status, fila atual e agendamentos.
- **Painel do Cliente**: Interface para visualizar agendamentos, histórico e programa de fidelidade.
- **Painel Administrativo**: Dashboard com métricas e gerenciamento de barbearias.
- **Integração com Mercado Pago**: Para processamento de pagamentos.
- **Comunicação em Tempo Real**: Atualizações instantâneas de status e filas.

## Tecnologias Utilizadas

### Backend
- Node.js com TypeScript
- Express.js para API RESTful
- Prisma ORM para PostgreSQL
- JWT para autenticação
- Socket.io para comunicação em tempo real

### Frontend
- Next.js com TypeScript
- React para interface de usuário
- Tailwind CSS para estilização
- React Query para gerenciamento de estado
- Socket.io Client para comunicação em tempo real

### Infraestrutura
- Docker e Docker Compose para containerização
- PostgreSQL para banco de dados
- AWS para hospedagem (instruções incluídas)
- GitHub para controle de versão e CI/CD

## Estrutura do Projeto

```
renne-plus/
├── backend/                 # Código do backend em TypeScript
│   ├── prisma/              # Schema e migrações do Prisma
│   ├── src/                 # Código fonte
│   │   ├── config/          # Configurações
│   │   ├── controllers/     # Controladores da API
│   │   ├── middlewares/     # Middlewares
│   │   ├── routes/          # Rotas da API
│   │   ├── services/        # Serviços
│   │   └── utils/           # Utilitários
│   ├── Dockerfile           # Configuração Docker para backend
│   └── package.json         # Dependências do backend
├── frontend/                # Código do frontend em Next.js
│   ├── src/                 # Código fonte
│   │   ├── app/             # Páginas da aplicação
│   │   ├── components/      # Componentes React
│   │   │   ├── layout/      # Componentes de layout
│   │   │   ├── providers/   # Provedores de contexto
│   │   │   └── ui/          # Componentes de UI
│   │   └── lib/             # Bibliotecas e utilitários
│   ├── Dockerfile           # Configuração Docker para frontend
│   └── package.json         # Dependências do frontend
├── docker/                  # Arquivos relacionados ao Docker
├── docs/                    # Documentação
└── docker-compose.yml       # Configuração Docker Compose
```

## Requisitos

- Node.js 20.x ou superior
- Docker e Docker Compose
- PostgreSQL 14 ou superior (ou use o contêiner Docker)
- Git

## Instalação e Execução

### Usando Docker (Recomendado)

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/renne-plus.git
   cd renne-plus
   ```

2. Crie o arquivo .env a partir do exemplo:
   ```bash
   cp .env.example .env
   ```

3. Edite o arquivo .env com suas configurações

4. Inicie os contêineres:
   ```bash
   docker-compose up -d
   ```

5. Execute as migrações do banco de dados:
   ```bash
   docker-compose exec backend npx prisma migrate deploy
   ```

6. Acesse a aplicação:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### Instalação Manual

#### Backend

1. Entre no diretório do backend:
   ```bash
   cd backend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Crie o arquivo .env a partir do exemplo:
   ```bash
   cp .env.example .env
   ```

4. Edite o arquivo .env com suas configurações

5. Execute as migrações do banco de dados:
   ```bash
   npx prisma migrate deploy
   ```

6. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

#### Frontend

1. Entre no diretório do frontend:
   ```bash
   cd frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Crie o arquivo .env.local:
   ```bash
   echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
   ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

5. Acesse a aplicação em http://localhost:3000

## Implantação

Para instruções detalhadas sobre como implantar o renne-plus na AWS, consulte o arquivo [docs/github-aws-deployment.md](docs/github-aws-deployment.md).

## Desenvolvimento

### Backend

- Para executar o servidor em modo de desenvolvimento:
  ```bash
  cd backend
  npm run dev
  ```

- Para compilar o TypeScript:
  ```bash
  npm run build
  ```

- Para executar o servidor em produção:
  ```bash
  npm start
  ```

### Frontend

- Para executar o servidor em modo de desenvolvimento:
  ```bash
  cd frontend
  npm run dev
  ```

- Para compilar o Next.js:
  ```bash
  npm run build
  ```

- Para executar o servidor em produção:
  ```bash
  npm start
  ```

## Estrutura do Banco de Dados

O renne-plus utiliza PostgreSQL com Prisma ORM. O schema do banco de dados inclui as seguintes entidades principais:

- **User**: Usuários do sistema (clientes, barbeiros, administradores)
- **Barbershop**: Barbearias/salões cadastrados
- **Barber**: Profissionais (barbeiros/cabeleireiros)
- **Service**: Serviços oferecidos
- **Appointment**: Agendamentos
- **Queue**: Sistema de fila
- **Payment**: Pagamentos
- **Subscription**: Assinaturas de barbearias

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.

## Contato

Para mais informações, entre em contato com o desenvolvedor do projeto.
