'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('users')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Загрузка...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Админ-панель</h1>
        <p className="text-sm text-gray-600">{session.user.name} • Супер администратор</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 mb-1">Всего пользователей</p>
          <p className="text-3xl font-bold text-blue-600">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 mb-1">Всего заказов</p>
          <p className="text-3xl font-bold text-green-600">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 mb-1">Выпущено карт</p>
          <p className="text-3xl font-bold text-purple-600">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 mb-1">Доход</p>
          <p className="text-3xl font-bold text-orange-600">0 ₽</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-4 font-medium transition ${
                activeTab === 'users'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Пользователи
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-4 font-medium transition ${
                activeTab === 'orders'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Заказы
            </button>
            <button
              onClick={() => setActiveTab('cards')}
              className={`px-6 py-4 font-medium transition ${
                activeTab === 'cards'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Карты
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-6 py-4 font-medium transition ${
                activeTab === 'payments'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Платежи
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-4 font-medium transition ${
                activeTab === 'settings'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Настройки
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Управление пользователями</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  Добавить пользователя
                </button>
              </div>

              <div className="mb-4 flex gap-4">
                <input
                  type="text"
                  placeholder="Поиск по имени или email..."
                  className="flex-1 px-4 py-2 border rounded-lg"
                />
                <select className="px-4 py-2 border rounded-lg">
                  <option value="all">Все роли</option>
                  <option value="user">Пользователь</option>
                  <option value="manager">Менеджер</option>
                  <option value="super_admin">Супер админ</option>
                </select>
              </div>

              <div className="text-center text-gray-500 py-8">
                Пользователи будут загружены из API
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Все заказы</h2>
              <p className="text-gray-500">Список всех заказов</p>
            </div>
          )}

          {activeTab === 'cards' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Управление картами</h2>
              <p className="text-gray-500">Список всех выпущенных карт помощи</p>
            </div>
          )}

          {activeTab === 'payments' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">История платежей</h2>
              <p className="text-gray-500">Список всех платежей</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Настройки системы</h2>
              <p className="text-gray-500">Конфигурация системы</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
