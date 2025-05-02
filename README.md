# renne-plus - Sistema de Gerenciamento para Barbearias e Salões

**renne-plus** é um sistema completo para gerenciamento de barbearias e salões, oferecendo funcionalidades como agendamento online, sistema de fila, dashboards personalizados e comunicação em tempo real.

## 🚀 Funcionalidades Principais

* **Agendamento Online**: Clientes escolhem serviços, profissionais e horários disponíveis.
* **Sistema de Fila em Tempo Real**: Acompanhamento ao vivo da posição na fila e estimativas de espera.
* **Painel do Barbeiro**: Gestão de status, agendamentos e fila.
* **Painel do Cliente**: Visualização de agendamentos, histórico e fidelidade.
* **Painel Administrativo**: Métricas e gerenciamento de barbearias.
* **Pagamentos via Mercado Pago** (mock para desenvolvimento).
* **Socket.IO**: Comunicação em tempo real.

## 🧰 Tecnologias Utilizadas

### Backend

* Node.js + TypeScript
* Express.js
* Prisma ORM + PostgreSQL
* JWT (autenticação)
* Socket.IO

### Frontend

* Next.js + TypeScript
* Tailwind CSS
* React Query
* Socket.IO Client

### Infraestrutura

* Docker (somente para banco de dados)
* PostgreSQL

## 📁 Estrutura do Projeto

```bash
renne-plus/
├── backend/
│   ├── prisma/              # Schema e migrações do Prisma
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   └── ...
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml       # Contêiner do banco de dados
└── README.md
```

## ⚙️ Requisitos

* Node.js 20+
* Docker + Docker Compose
* Git

## 📦 Instalação e Execução

### Usando Docker (somente banco de dados)

```bash
git clone https://github.com/seu-usuario/renne-plus.git
cd renne-plus
docker-compose up -d postgres
```

### Rodando Backend Localmente

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Rodando Frontend Localmente

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
npm run dev
```

Acesse:

* Frontend: [http://localhost:3000](http://localhost:3000)
* Backend (API): [http://localhost:3001](http://localhost:3001)

## ✅ Teste de Conexão da API

```bash
GET http://localhost:3001/health
```

Resposta esperada:

```json
{
  "status": "ok",
  "message": "renne-plus API is running"
}
```

## 💃 Entidades Principais

* `User`
* `Barbershop`
* `Barber`
* `Service`
* `Appointment`
* `Queue`
* `Payment`
* `Subscription`

## 🤝 Contribuição

1. Fork este repositório
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas alterações (`git commit -m 'feat: nova feature'`)
4. Push para sua branch (`git push origin feature/nova-feature`)
5. Crie um Pull Request

## 📝 Licença

Este projeto está licenciado sob a licença MIT.

## 📬 Contato

Para dúvidas ou sugestões, entre em contato com o desenvolvedor.
