/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    API_URL: process.env.API_URL || 'http://localhost:3001'
  },
  async rewrites() {
    // Проксируем все запросы к /api/* и /uploads/* на бэкенд (порт 3001)
    // Это работает потому что оба сервиса в одном контейнере
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:3001/uploads/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
