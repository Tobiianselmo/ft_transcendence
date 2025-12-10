FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache sqlite

# Copiar los archivos de configuración y dependencias desde el directorio raíz
COPY config/package*.json ./
COPY config/tsconfig.json ./

# Instalar dependencias
RUN npm ci

# Copiar el código fuente del backend
COPY src/ ./src/

# Compilar TypeScript
RUN npm run build

RUN npm install sqlite3

# Copiar assets estáticos (por ejemplo, imágenes por defecto) a la carpeta servida
# Si colocas archivos en backend/src/uploads, quedarán disponibles en /uploads
RUN mkdir -p /app/uploads \
 && if [ -d "src/uploads" ]; then cp -r src/uploads/* /app/uploads/ || true; fi

# Crear carpeta para la base de datos
RUN mkdir -p /app/data

# Exponer el puerto
EXPOSE 3000

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Comando de inicio
CMD ["npm", "start"]
