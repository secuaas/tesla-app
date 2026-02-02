# TODO - SecuOps Conformité pour tesla-app

Ce projet nécessite les modifications suivantes pour être conforme SecuOps:

## ❌ Dockerfile manquant

Créer un Dockerfile avec build multi-stage:

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
CMD ["npm", "start"]
```

## ❌ .secuops.yaml manquant

Créer un fichier .secuops.yaml à la racine du projet:

```yaml
name: tesla-app
type: nodejs
description: Description du projet
port: 8080

github:
  repo: https://github.com/secuaas/tesla-app.git
  branch: main

kubernetes:
  namespace: tesla-app
  replicas: 1
```

## ❌ .dockerignore manquant

Créer un .dockerignore pour exclure:
- .git/
- node_modules/
- .env
- README.md
- .gitignore

## Commandes pour déployer

Une fois conforme:

```bash
# Build l'image
secuops build --app=tesla-app

# Déployer en dev
secuops deploy --app=tesla-app --env=k8s-dev

# Déployer en prod
secuops deploy --app=tesla-app --env=k8s-prod
```
