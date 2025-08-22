# --- Builder stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Runtime stage (Nginx)
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Nginx default listens on 80
EXPOSE 80
HEALTHCHECK CMD wget -qO- http://127.0.0.1:80/ || exit 1
