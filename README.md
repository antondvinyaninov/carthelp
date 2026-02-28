# CartHelp - Карта Помощи

Веб-платформа для создания пластиковых карт с медицинской информацией и QR-кодами для экстренных ситуаций.

## Структура проекта

- `frontend/` - Next.js приложение с Tailwind CSS
- `backend/` - Node.js API сервер с Express

## Установка и запуск

### Локальная разработка

#### Backend
```bash
cd backend
npm install
npm run dev
```
Сервер запустится на http://localhost:3001

#### Frontend
```bash
cd frontend
npm install
npm run dev
```
Приложение запустится на http://localhost:3000

### Docker

#### Запуск через Docker Compose
```bash
docker-compose up -d
```

#### Отдельные сервисы

**Backend:**
```bash
cd backend
docker build -t carthelp-backend .
docker run -p 3001:3001 -e DATABASE_URL=... -e JWT_SECRET=... carthelp-backend
```

**Frontend:**
```bash
cd frontend
docker build -t carthelp-frontend .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=... -e NEXTAUTH_SECRET=... carthelp-frontend
```

## Переменные окружения

### Backend (.env)
```
PORT=3001
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-secret-key
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

## Деплой на Easypanel

1. Подключи репозиторий GitHub в Easypanel
2. Создай два сервиса:
   - **Backend**: укажи путь `backend/Dockerfile`
   - **Frontend**: укажи путь `frontend/Dockerfile`
3. Настрой переменные окружения для каждого сервиса
4. Настрой порты: Backend (3001), Frontend (3000)
5. Убедись, что Frontend имеет доступ к Backend через внутреннюю сеть

## API Endpoints

- `GET /api/health` - проверка статуса сервера
- `POST /api/auth/register` - регистрация
- `POST /api/auth/login` - вход
- `GET /api/cards/my-cards` - список карт пользователя
- `POST /api/cards/create` - создание карты
- `GET /api/cards/:id` - получение карты
- `PUT /api/cards/:id` - обновление карты
- `DELETE /api/cards/:id` - удаление карты

## Технологии

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, PostgreSQL
- **Аутентификация**: NextAuth.js, JWT
- **Генерация документов**: pdf-lib, pdfkit, SVG
