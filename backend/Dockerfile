# Dockerfile para o backend
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl
# Instalar dependências do sistema

# Copiar arquivos de dependências
COPY package.json package-lock.json* ./

# Instalar dependências
RUN npm ci

# Copiar o restante dos arquivos
COPY . .

ENV PRISMA_CLI_QUERY_ENGINE_TYPE=binary

# Gerar o Prisma Client
RUN npx prisma generate

# Compilar o TypeScript
RUN npm run build

# Expor a porta
EXPOSE 3001

# Comando para iniciar a aplicação
CMD ["npm", "run", "start"]
