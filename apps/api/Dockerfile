# Usa a imagem Node 20 oficial
FROM node:20-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de definição de pacote
COPY package*.json ./

# Instala as dependências (em modo de produção)
RUN npm ci --omit=dev

# Copia o restante do código da API
COPY . .

# Expõe a porta que a API usa
EXPOSE 3000

# Comando para iniciar a API
CMD ["node", "index.js"]

