# Instruções para GitHub e Implantação do renne-plus

Este documento contém instruções detalhadas para configurar o repositório GitHub e implantar o projeto renne-plus na AWS.

## Configuração do GitHub

### 1. Criar um novo repositório no GitHub

1. Acesse [GitHub](https://github.com) e faça login na sua conta
2. Clique no botão "+" no canto superior direito e selecione "New repository"
3. Preencha as informações:
   - Nome do repositório: `renne-plus`
   - Descrição: `Sistema de gerenciamento para barbearias e salões`
   - Visibilidade: Escolha entre público ou privado
   - Inicialize com README: Sim
   - Adicione um arquivo .gitignore para Node
4. Clique em "Create repository"

### 2. Configurar o repositório local e fazer o primeiro push

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/renne-plus.git

# Entre no diretório do projeto
cd renne-plus

# Copie os arquivos do projeto para o repositório
cp -r /caminho/para/renne-plus-typescript/* .

# Crie o arquivo .env a partir do exemplo
cp .env.example .env

# Edite o arquivo .env com suas configurações
nano .env

# Adicione os arquivos ao Git
git add .

# Faça o commit inicial
git commit -m "Commit inicial do projeto renne-plus"

# Envie para o GitHub
git push origin main
```

### 3. Configurar GitHub Actions para CI/CD

Crie o arquivo `.github/workflows/ci-cd.yml` com o seguinte conteúdo:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        
    - name: Install backend dependencies
      run: |
        cd backend
        npm ci
        
    - name: Run backend tests
      run: |
        cd backend
        npm test
        
    - name: Install frontend dependencies
      run: |
        cd frontend
        npm ci
        
    - name: Run frontend tests
      run: |
        cd frontend
        npm test

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v1
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ secrets.AWS_REGION }}
        
    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v1
      
    - name: Build, tag, and push backend image to Amazon ECR
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        ECR_REPOSITORY: renne-plus-backend
        IMAGE_TAG: ${{ github.sha }}
      run: |
        cd backend
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
        
    - name: Build, tag, and push frontend image to Amazon ECR
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        ECR_REPOSITORY: renne-plus-frontend
        IMAGE_TAG: ${{ github.sha }}
      run: |
        cd frontend
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
        
    - name: Update ECS services
      run: |
        aws ecs update-service --cluster renne-plus-cluster --service renne-plus-backend-service --force-new-deployment
        aws ecs update-service --cluster renne-plus-cluster --service renne-plus-frontend-service --force-new-deployment
```

## Implantação na AWS

### 1. Pré-requisitos

- Conta AWS ativa
- AWS CLI instalado e configurado
- Docker instalado localmente

### 2. Configurar o Amazon RDS (PostgreSQL)

1. Acesse o console da AWS e navegue até o serviço RDS
2. Clique em "Create database"
3. Selecione "PostgreSQL"
4. Configure o banco de dados:
   - DB instance identifier: `renne-plus-db`
   - Master username: `postgres` (ou outro de sua escolha)
   - Master password: Crie uma senha forte
   - DB instance class: Escolha de acordo com suas necessidades (ex: db.t3.micro para desenvolvimento)
   - Storage: 20GB (ajuste conforme necessário)
   - VPC: Selecione sua VPC padrão ou crie uma nova
   - Subnet group: Crie um novo grupo ou use um existente
   - Public access: Yes (para desenvolvimento) ou No (para produção)
   - VPC security group: Crie um novo ou use um existente
   - Database name: `renneplus`
   - Port: 5432 (padrão)
5. Clique em "Create database"

### 3. Configurar o Amazon ECR (Elastic Container Registry)

1. Acesse o console da AWS e navegue até o serviço ECR
2. Clique em "Create repository"
3. Crie dois repositórios:
   - Nome: `renne-plus-backend`
   - Nome: `renne-plus-frontend`
4. Clique em "Create repository" para cada um

### 4. Configurar o Amazon ECS (Elastic Container Service)

1. Acesse o console da AWS e navegue até o serviço ECS
2. Crie um cluster:
   - Clique em "Create Cluster"
   - Selecione "EC2 Linux + Networking"
   - Nome do cluster: `renne-plus-cluster`
   - EC2 instance type: t3.small (ajuste conforme necessário)
   - Number of instances: 2 (ajuste conforme necessário)
   - Clique em "Create"

3. Crie as definições de tarefa:
   - Navegue até "Task Definitions" e clique em "Create new Task Definition"
   - Selecione "EC2"
   - Nome: `renne-plus-backend-task`
   - Configure o container:
     - Nome: `renne-plus-backend`
     - Image: `[seu-id-aws].dkr.ecr.[sua-região].amazonaws.com/renne-plus-backend:latest`
     - Memory Limits: 512 MiB
     - Port mappings: 3001:3001
     - Environment variables: Adicione todas as variáveis do arquivo .env
   - Repita o processo para o frontend:
     - Nome: `renne-plus-frontend-task`
     - Configure o container:
       - Nome: `renne-plus-frontend`
       - Image: `[seu-id-aws].dkr.ecr.[sua-região].amazonaws.com/renne-plus-frontend:latest`
       - Memory Limits: 512 MiB
       - Port mappings: 3000:3000
       - Environment variables: Adicione NEXT_PUBLIC_API_URL

4. Crie os serviços:
   - Navegue até seu cluster e clique em "Create Service"
   - Launch type: EC2
   - Task Definition: `renne-plus-backend-task`
   - Service name: `renne-plus-backend-service`
   - Number of tasks: 1
   - Deployment type: Rolling update
   - Configure o load balancer (opcional)
   - Clique em "Create Service"
   - Repita o processo para o frontend

### 5. Configurar o Amazon Route 53 (opcional)

Se você tiver um domínio registrado, pode configurar o Route 53 para apontar para o seu serviço:

1. Acesse o console da AWS e navegue até o serviço Route 53
2. Selecione sua zona hospedada ou crie uma nova
3. Clique em "Create Record"
4. Configure o registro:
   - Nome: `app.seudominio.com`
   - Tipo: A
   - Alias: Yes
   - Target: Selecione o load balancer do seu serviço frontend
5. Clique em "Create records"

### 6. Configurar o AWS Secrets Manager (recomendado)

Para gerenciar suas credenciais de forma segura:

1. Acesse o console da AWS e navegue até o serviço Secrets Manager
2. Clique em "Store a new secret"
3. Selecione "Other type of secrets"
4. Adicione todas as variáveis do arquivo .env como pares chave/valor
5. Nome do segredo: `renne-plus-secrets`
6. Clique em "Store"

## Atualização da aplicação

Após configurar o CI/CD com GitHub Actions, qualquer push para a branch main irá automaticamente:

1. Executar os testes
2. Construir as imagens Docker
3. Enviar as imagens para o ECR
4. Atualizar os serviços ECS

Para atualizações manuais:

```bash
# Construir e enviar as imagens manualmente
aws ecr get-login-password --region [sua-região] | docker login --username AWS --password-stdin [seu-id-aws].dkr.ecr.[sua-região].amazonaws.com

cd backend
docker build -t [seu-id-aws].dkr.ecr.[sua-região].amazonaws.com/renne-plus-backend:latest .
docker push [seu-id-aws].dkr.ecr.[sua-região].amazonaws.com/renne-plus-backend:latest

cd ../frontend
docker build -t [seu-id-aws].dkr.ecr.[sua-região].amazonaws.com/renne-plus-frontend:latest .
docker push [seu-id-aws].dkr.ecr.[sua-região].amazonaws.com/renne-plus-frontend:latest

# Atualizar os serviços ECS
aws ecs update-service --cluster renne-plus-cluster --service renne-plus-backend-service --force-new-deployment
aws ecs update-service --cluster renne-plus-cluster --service renne-plus-frontend-service --force-new-deployment
```

## Monitoramento e Logs

1. Configure o CloudWatch para monitorar seus serviços:
   - Navegue até o serviço CloudWatch
   - Crie alarmes para métricas importantes (CPU, memória, etc.)
   - Configure painéis para visualizar o desempenho

2. Visualize os logs:
   - Navegue até o serviço CloudWatch
   - Selecione "Log groups"
   - Você encontrará grupos de logs para seus serviços ECS
