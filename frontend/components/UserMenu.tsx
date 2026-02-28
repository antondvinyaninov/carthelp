'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function UserMenu() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!session?.user) {
    return null
  }

  const roles = session.user.roles || ['user']
  const initials = session.user.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  const roleLinks = []
  if (roles.includes('user')) {
    roleLinks.push({ href: '/lk', label: 'Личный кабинет', icon: '👤' })
  }
  if (roles.includes('manager')) {
    roleLinks.push({ href: '/manager', label: 'Панель менеджера', icon: '📋' })
  }
  if (roles.includes('super_admin')) {
    roleLinks.push({ href: '/admin', label: 'Админ-панель', icon: '⚙️' })
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:opacity-80 transition"
        aria-label="Меню пользователя"
      >
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center font-bold text-sm sm:text-base shadow-md">
          {initials}
        </div>
        <svg
          className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-700 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">{session.user.name}</p>
            <p className="text-xs sm:text-sm text-gray-600 truncate">{session.user.email}</p>
          </div>

          {roleLinks.length > 1 && (
            <div className="py-2 border-b border-gray-200">
              <p className="px-4 py-1 text-xs text-gray-500 uppercase font-semibold">Разделы</p>
              {roleLinks.map((link) => {
                const isActive = pathname.startsWith(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition text-sm sm:text-base ${
                      isActive ? 'bg-red-50 text-red-600 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    <span className="text-lg sm:text-xl">{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                )
              })}
            </div>
          )}

          <div className="py-2">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition text-gray-700 text-sm sm:text-base"
            >
              <span className="text-lg sm:text-xl">👤</span>
              <span>Мой профиль</span>
            </Link>
          </div>

          <div className="border-t border-gray-200 pt-2">
            <button
              onClick={() => {
                setIsOpen(false)
                signOut({ callbackUrl: '/' })
              }}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition text-red-600 w-full text-left text-sm sm:text-base font-medium"
            >
              <span className="text-lg sm:text-xl">🚪</span>
              <span>Выйти</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
