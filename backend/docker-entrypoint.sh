#!/bin/sh
set -e

DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"

echo "⏳ Waiting for PostgreSQL to be ready at ${DB_HOST}:${DB_PORT}..."
until nc -z "${DB_HOST}" "${DB_PORT}"; do
  echo "   PostgreSQL is unavailable - sleeping 1s..."
  sleep 1
done
echo "✅ PostgreSQL is ready!"

# 1. Kiểm tra node_modules trong Named Volume của Docker Container
if [ ! -d "node_modules/@nestjs/core" ]; then
  echo "📦 Installing npm dependencies inside Docker container..."
  npm install
else
  echo "✅ node_modules found in container volume."
fi

# 2. Generate Prisma Client
echo "⏳ Generating Prisma Client..."
npx prisma generate

# 3. Migration / Schema Push
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  echo "⏳ Running Prisma Migrate Deploy..."
  npx prisma migrate deploy
else
  echo "⏳ No migrations directory found. Running Prisma DB Push..."
  npx prisma db push --skip-generate
fi

# 4. Seed Database
echo "🌱 Seeding Database..."
npx ts-node prisma/seed.ts || true

# 5. Khởi chạy ứng dụng NestJS
echo "🚀 Starting NestJS application..."
exec "$@"
