# CartHelp2

Проект с фронтендом на Next.js + Tailwind CSS и бэкендом на Node.js

## Структура проекта

- `frontend/` - Next.js приложение с Tailwind CSS
- `backend/` - Node.js API сервер с Express

## Установка

### Backend
```bash
cd backend
npm install
npm run dev
```
Сервер запустится на http://localhost:3001

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Приложение запустится на http://localhost:3000

## API Endpoints

- `GET /api/health` - проверка статуса сервера
- `GET /api/data` - получение данных

Фронтенд автоматически подключается к бэкенду через API.
