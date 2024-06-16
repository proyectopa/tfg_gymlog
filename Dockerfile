# Dockerfile para Node.js
FROM node:latest

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar archivos de la aplicación
COPY . .

# Instalar dependencias de Node.js
RUN npm install

# Puerto expuesto por la aplicación Node.js (configurado dinámicamente en docker-compose.yml)
EXPOSE 3001

# Comando por defecto para iniciar la aplicación
CMD ["npm", "start"]
