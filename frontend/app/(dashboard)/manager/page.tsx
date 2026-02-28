'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ManagerPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('orders')

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
        <h1 className="text-2xl font-bold text-gray-800">Панель менеджера</h1>
        <p className="text-sm text-gray-600">{session.user.name}</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex">
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
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-4 font-medium transition ${
                activeTab === 'stats'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Статистика
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'orders' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Список заказов</h2>
                <select className="px-4 py-2 border rounded-lg">
                  <option value="all">Все статусы</option>
                  <option value="pending">Новые</option>
                  <option value="processing">В обработке</option>
                  <option value="printed">Напечатаны</option>
                  <option value="shipped">Отправлены</option>
                  <option value="delivered">Доставлены</option>
                </select>
              </div>

              <div className="text-center text-gray-500 py-8">
                Здесь будут отображаться заказы
              </div>
            </div>
          )}

          {activeTab === 'cards' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Управление картами</h2>
              <p className="text-gray-500">Список всех выпущенных карт</p>
            </div>
          )}

          {activeTab === 'stats' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Статистика</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Всего заказов</p>
                  <p className="text-3xl font-bold text-blue-600">0</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Выполнено</p>
                  <p className="text-3xl font-bold text-green-600">0</p>
                </div>
                <div className="bg-yellow-50 p-6 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">В работе</p>
                  <p className="text-3xl font-bold text-yellow-600">0</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
