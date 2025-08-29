# Multi-stage build pour optimiser la taille de l'image
FROM node:18-alpine AS build

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Build de l'application
RUN npm run build

# Image de production avec Nginx
FROM nginx:alpine AS production

# Copier la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers buildés
COPY --from=build /app/dist /usr/share/nginx/html

# Copier les icônes PWA
COPY public/favicon.ico public/icon-*.png public/apple-touch-icon.png /usr/share/nginx/html/

# Exposer le port 3000 pour correspondre au docker-compose
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]

