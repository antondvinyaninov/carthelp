import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname
    const roles = token?.roles || []

    // Защита страниц по ролям
    if (path.startsWith('/manager')) {
      if (!roles.includes('manager') && !roles.includes('super_admin')) {
        return NextResponse.redirect(new URL('/lk', req.url))
      }
    }

    if (path.startsWith('/admin')) {
      if (!roles.includes('super_admin')) {
        return NextResponse.redirect(new URL('/lk', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ['/lk/:path*', '/manager/:path*', '/admin/:path*', '/profile/:path*'],
}
