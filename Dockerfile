FROM node:20-alpine AS base

# ============================================
# Stage 1: Backend dependencies
# ============================================
FROM base AS backend-deps
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci --only=production

# ============================================
# Stage 2: Frontend dependencies
# ============================================
FROM base AS frontend-deps
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

# ============================================
# Stage 3: Frontend build
# ============================================
FROM base AS frontend-builder
WORKDIR /app/frontend

COPY --from=frontend-deps /app/frontend/node_modules ./node_modules
COPY frontend/ .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# ============================================
# Stage 4: Production image
# ============================================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Устанавливаем необходимые пакеты
RUN apk add --no-cache dumb-init

# Создаём непривилегированного пользователя
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем backend
COPY --from=backend-deps --chown=nextjs:nodejs /app/backend/node_modules ./backend/node_modules
COPY --chown=nextjs:nodejs backend ./backend

# Копируем frontend
COPY --from=frontend-builder --chown=nextjs:nodejs /app/frontend/public ./frontend/public
COPY --from=frontend-builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./frontend
COPY --from=frontend-builder --chown=nextjs:nodejs /app/frontend/.next/static ./frontend/.next/static

# Создаём директории для загрузок
RUN mkdir -p backend/uploads/avatars backend/uploads/temp && \
    chown -R nextjs:nodejs backend/uploads

# Создаём скрипт запуска с правильной обработкой процессов
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Запускаем backend в фоне' >> /app/start.sh && \
    echo 'cd /app/backend' >> /app/start.sh && \
    echo 'node server.js &' >> /app/start.sh && \
    echo 'BACKEND_PID=$!' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Запускаем frontend' >> /app/start.sh && \
    echo 'cd /app/frontend' >> /app/start.sh && \
    echo 'node server.js &' >> /app/start.sh && \
    echo 'FRONTEND_PID=$!' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Функция для корректного завершения' >> /app/start.sh && \
    echo 'cleanup() {' >> /app/start.sh && \
    echo '  echo "Получен сигнал завершения, останавливаем процессы..."' >> /app/start.sh && \
    echo '  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true' >> /app/start.sh && \
    echo '  wait' >> /app/start.sh && \
    echo '  exit 0' >> /app/start.sh && \
    echo '}' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo 'trap cleanup SIGTERM SIGINT' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Ждём завершения процессов' >> /app/start.sh && \
    echo 'wait' >> /app/start.sh && \
    chmod +x /app/start.sh && \
    chown nextjs:nodejs /app/start.sh

USER nextjs

EXPOSE 3000 3001

# Используем dumb-init для правильной обработки сигналов
ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "/app/start.sh"]

