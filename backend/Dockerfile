# Stage 1: Base image & layer caching for dependencies
FROM node:18-alpine AS base

WORKDIR /app

# Cài đặt OpenSSL (cho Prisma) và netcat-openbsd (để chờ PostgreSQL sẵn sàng)
RUN apk add --no-cache openssl netcat-openbsd

# Tối ưu Docker layer: copy package files và schema prisma trước
COPY package*.json ./
COPY prisma ./prisma/

# Cài đặt toàn bộ dependencies (bao gồm devDependencies cho build & dev mode)
RUN npm install

# Copy toàn bộ mã nguồn vào container
COPY . .

# Phân quyền thực thi cho entrypoint script
RUN chmod +x docker-entrypoint.sh

# Stage 2: Development Mode (Môi trường phát triển với Hot Reload)
FROM base AS development

ENV NODE_ENV=development
EXPOSE 5000

ENTRYPOINT ["/bin/sh", "docker-entrypoint.sh"]
CMD ["npm", "run", "start:dev"]

# Stage 3: Production Build
FROM base AS build

RUN npx prisma generate
RUN npm run build
RUN npm prune --production

# Stage 4: Production Runtime (Môi trường sản xuất)
FROM node:18-alpine AS production

WORKDIR /app

# Cài OpenSSL và netcat-openbsd cho môi trường production
RUN apk add --no-cache openssl netcat-openbsd

COPY package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x docker-entrypoint.sh

ENV NODE_ENV=production
EXPOSE 5000

ENTRYPOINT ["/bin/sh", "docker-entrypoint.sh"]
CMD ["npm", "run", "start:prod"]