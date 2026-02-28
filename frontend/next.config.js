/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    API_URL: process.env.API_URL || 'http://localhost:3001'
  },
  async rewrites() {
    // Проксируем ТОЛЬКО бизнес-API на бэкенд (порт 3001)
    // NextAuth (`/api/auth/...`) остаётся внутри Next и не трогаем его
    return [
      {
        source: '/api/cards/:path*',
        destination: 'http://localhost:3001/api/cards/:path*',
      },
      {
        source: '/api/profile/:path*',
        destination: 'http://localhost:3001/api/profile/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:3001/uploads/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
