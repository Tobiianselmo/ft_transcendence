# frontend/Dockerfile
FROM node:18-alpine

RUN apk add --no-cache python3 make g++ sqlite

WORKDIR /app

# Copia solo los archivos de configuración para instalar dependencias
COPY config/package*.json ./ 
COPY config/tsconfig.json ./

RUN npm install

# Copia el código fuente
COPY src ./src

# Copia los archivos estáticos del sitio (index.html, styles, etc.)
COPY website ./website

# Crea la carpeta dist si no existe (para el volumen)
RUN mkdir -p /app/dist

# Compila TypeScript durante el build para generar los JS en /app/dist
# (garantiza que la imagen contenga los artefactos estáticos)
RUN npm run build || true

# Copia los archivos estáticos dentro de dist para que estén en el volumen compartido
RUN cp -r ./website/* /app/dist || true

# Mantiene el contenedor vivo con watch
CMD ["npm", "run", "dev"]
