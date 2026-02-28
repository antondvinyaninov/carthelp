FROM node:20-alpine

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем остальные файлы
COPY . .

# Создаём директории для загрузок
RUN mkdir -p uploads/avatars uploads/temp

# Открываем порт
EXPOSE 3001

# Запускаем сервер
CMD ["node", "server.js"]

