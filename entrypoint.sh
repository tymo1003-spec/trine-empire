#!/bin/sh
set -e

echo "⏳ Очікування підключення до бази даних..."
until npx prisma db push --skip-generate; do
  echo "🔄 База даних ще не готова, повторна спроба через 2 секунди..."
  sleep 2
done

echo "⚙️ Генерація Prisma Client..."
npx prisma generate

echo "🚀 Запуск L3 App-Chain API..."
exec node server.js
