/**
 * Получает базовый URL для API запросов
 * Использует NEXT_PUBLIC_API_URL из переменных окружения
 * Если переменная не установлена, использует относительный путь
 * Next.js rewrites автоматически проксируют /api/* на бэкенд (порт 3001)
 */
export const getApiUrl = (): string => {
  // В браузере используем переменную окружения или относительный путь
  if (typeof window !== 'undefined') {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    if (apiUrl) {
      // Убираем trailing slash если есть
      return apiUrl.replace(/\/$/, '')
    }
    // Если переменная не установлена, используем относительный путь
    // Next.js rewrites в next.config.js автоматически проксируют на бэкенд
    return ''
  }
  // На сервере используем переменную окружения или localhost
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
}

/**
 * Создает полный URL для API запроса
 */
export const apiUrl = (path: string): string => {
  const baseUrl = getApiUrl()
  // Убираем начальный слеш из path если есть
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  // Если baseUrl пустой, используем относительный путь
  if (!baseUrl) {
    return `/${cleanPath}`
  }
  return `${baseUrl}/${cleanPath}`
}

