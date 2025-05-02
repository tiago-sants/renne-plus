
# Dockerfile para o frontend
# FROM node:20-alpine

# WORKDIR /app

# Copiar arquivos de dependências
# COPY package.json package-lock.json* ./

# Instalar dependências
# RUN npm ci

# Copiar o restante dos arquivos
# COPY . .

# Compilar a aplicação Next.js
# RUN npm run build

# Expor a porta
# EXPOSE 3000

# Comando para iniciar a aplicação
# CMD ["npm", "run", "start"]


# Usar a imagem base do Node
FROM node:20-alpine

# Criar e usar um usuário não-root
RUN addgroup --system app && adduser --system --ingroup app app
USER app

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json* ./

# Limpar o cache do NPM e instalar as dependências com --force
RUN npm cache clean --force && npm ci --force

# Copiar o restante dos arquivos
COPY . .

# Compilar a aplicação Next.js
RUN npm run build

# Expor a porta 3000 para a aplicação
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "run", "dev"]
