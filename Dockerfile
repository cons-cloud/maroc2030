# Étape 1 : Utiliser une image Node.js 20.19.5
FROM node:20.19.5-slim as base

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration
COPY package.json yarn.lock* ./

# Installer les dépendances
RUN yarn install --frozen-lockfile --production=false

# Copier le reste des fichiers
COPY . .

# Construire l'application
RUN yarn build

# Étape 2 : Utiliser une image nginx pour servir les fichiers statiques
FROM nginx:alpine

# Copier les fichiers construits depuis l'étape précédente
COPY --from=base /app/dist /usr/share/nginx/html

# Copier la configuration nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80
EXPOSE 80

# Démarrer nginx
CMD ["nginx", "-g", "daemon off;"]
