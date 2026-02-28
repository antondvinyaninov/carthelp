# Инструкция по деплою на Easypanel

## Структура приложения

Backend и Frontend запускаются в **одном Docker контейнере**:
- Backend: порт 3001
- Frontend: порт 3000

## Шаг 1: Создание сервиса в Easypanel

1. В Easypanel создай новый сервис типа **App**
2. Выбери **GitHub** как источник
3. Укажи репозиторий: `antondvinyaninov/carthelp`
4. В настройках сборки:
   - **Dockerfile Path**: `Dockerfile` (в корне проекта)
   - **Build Context**: `.` (корень проекта)
5. Настрой порты:
   - **3000** - Frontend (основной порт)
   - **3001** - Backend (внутренний порт)

## Шаг 2: Переменные окружения

Добавь следующие переменные окружения в Easypanel:

### Общие
```
NODE_ENV=production
```

### Backend
```
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=твой-секретный-ключ-для-jwt
PORT=3001
```

### Frontend
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_URL=https://твой-домен.ru
NEXTAUTH_SECRET=твой-nextauth-секрет
PORT=3000
```

**Важно**: `NEXT_PUBLIC_API_URL` должен указывать на `http://localhost:3001`, так как оба сервиса в одном контейнере.

## Шаг 3: Настройка домена

1. Подключи домен к сервису (например, `carthelp.ru`)
2. Настрой проксирование на порт **3000** (Frontend)
3. Backend будет доступен только внутри контейнера через `localhost:3001`

## Шаг 4: Настройка базы данных

1. Создай PostgreSQL базу данных в Easypanel
2. Скопируй connection string в переменную `DATABASE_URL`
3. Убедись, что сервис может подключиться к базе данных

## Шаг 5: Volume для загрузок (опционально)

Если нужно сохранять загруженные файлы между перезапусками:
1. Создай Volume в Easypanel
2. Подключи его к пути: `/app/backend/uploads`

## Проверка деплоя

После деплоя проверь:
- Frontend доступен по основному домену
- Backend отвечает на `/api/health` (через внутренний порт)
- Frontend может обращаться к Backend API через `localhost:3001`

## Troubleshooting

### Оба сервиса не запускаются
- Проверь логи в Easypanel
- Убедись, что все переменные окружения установлены
- Проверь, что порты 3000 и 3001 открыты

### Frontend не может подключиться к Backend
- Убедись, что `NEXT_PUBLIC_API_URL=http://localhost:3001`
- Проверь, что оба процесса запущены (логи должны показывать оба сервера)

### Ошибки сборки
- Проверь, что Dockerfile находится в корне проекта
- Убедись, что все зависимости указаны в package.json файлах
- Посмотри логи сборки в Easypanel
