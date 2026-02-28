'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import CardPreview from '@/components/cards/CardPreview'

interface Card {
  id: number
  name: string
  last_name: string
  first_name: string
  middle_name: string
  birth_date: string
  photo: string | null
  unique_code: string
  card_number: string
  status: string
  created_at: string
  blood_type: string | null
  rh_factor: string | null
  allergies: string | null
  chronic_diseases: string | null
  medications: string | null
  is_public: boolean
  contacts: Array<{
    name: string
    phone: string
    relationship: string
    priority: number
  }>
}

export default function LKPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [cardSides, setCardSides] = useState<{ [key: number]: 'front' | 'back' }>({})

  const handleCardFlip = (cardId: number, side: 'front' | 'back') => {
    setCardSides(prev => ({ ...prev, [cardId]: side }))
  }

  const handleDeleteCard = async (cardId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/cards/${cardId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        }
      })

      const data = await response.json()

      if (data.success) {
        // Удаляем карту из списка
        setCards(prev => prev.filter(card => card.id !== cardId))
        alert('Карта успешно удалена')
      } else {
        alert(`Ошибка: ${data.message}`)
      }
    } catch (error) {
      console.error('Error deleting card:', error)
      alert('Произошла ошибка при удалении карты')
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.accessToken) {
      fetchCards()
    }
  }, [session])

  const fetchCards = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/cards/my-cards', {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setCards(data.cards)
      }
    } catch (error) {
      console.error('Error fetching cards:', error)
    } finally {
      setLoading(false)
    }
  }

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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Добро пожаловать, {session.user.name}!</h2>
        <p className="text-sm sm:text-base text-gray-600">Управляйте своими картами помощи</p>
      </div>

      {/* Список карт */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800">Мои карты</h3>
          <Link
            href="/lk/cards/create"
            className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 text-sm sm:text-base font-medium shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Создать карту</span>
            <span className="sm:hidden">Создать</span>
          </Link>
        </div>

        {/* Список карт или пустое состояние */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
            <div className="text-gray-600 text-sm sm:text-base">Загрузка карт...</div>
          </div>
        ) : cards.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 sm:p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">У вас пока нет карт</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                Создайте свою первую карту помощи с экстренными контактами и медицинской информацией
              </p>
              <Link
                href="/lk/cards/create"
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm sm:text-base font-medium shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Создать первую карту
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {cards.map((card) => {
              // Преобразуем данные карты в формат для CardPreview
              const cardData = {
                id: card.id,
                lastName: card.last_name || '',
                firstName: card.first_name || '',
                middleName: card.middle_name || '',
                birthDate: card.birth_date || '',
                photo: card.photo ? `http://localhost:3001/uploads/avatars/${card.photo}` : null,
                bloodType: card.blood_type || '',
                rhFactor: card.rh_factor || '',
                allergies: card.allergies ? card.allergies.split(', ').slice(0, 3) : ['', '', ''],
                chronicDiseases: card.chronic_diseases ? card.chronic_diseases.split(', ').slice(0, 3) : ['', '', ''],
                medications: card.medications || '',
                isPublic: card.is_public || false,
                contacts: card.contacts && card.contacts.length > 0 
                  ? card.contacts.slice(0, 2).map(c => ({
                      name: c.name || '',
                      phone: c.phone || '',
                      relationship: c.relationship || ''
                    }))
                  : [
                      { name: '', phone: '', relationship: '' },
                      { name: '', phone: '', relationship: '' }
                    ],
                additionalInfo: {
                  medicalNotes: '',
                  doctorsInfo: '',
                  insuranceInfo: '',
                  additionalContacts: '',
                  specialInstructions: ''
                }
              }

              return (
                <div key={card.id} className="group">
                  {/* Карта в реальном дизайне */}
                  <div className="relative">
                    <CardPreview 
                      data={cardData} 
                      cardSide={cardSides[card.id] || 'front'}
                      onFlip={(side) => handleCardFlip(card.id, side)}
                      showPrintButton={true}
                      accessToken={session?.accessToken}
                    />
                    
                    {/* Кнопки действий */}
                    <div className="mt-4">
                      {/* Кнопки управления */}
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        <button 
                          onClick={() => router.push(`/lk/cards/create?edit=${card.id}`)}
                          className="flex flex-col sm:flex-row items-center justify-center gap-1 px-2 sm:px-3 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-medium transition shadow-md hover:shadow-lg"
                          title="Редактировать"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span className="hidden sm:inline">Редактировать</span>
                        </button>
                        
                        <button 
                          onClick={() => window.open(`/card/${card.unique_code}`, '_blank')}
                          className="flex flex-col sm:flex-row items-center justify-center gap-1 px-2 sm:px-3 py-2 sm:py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs sm:text-sm font-medium transition shadow-md hover:shadow-lg"
                          title="Открыть страницу"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          <span className="hidden sm:inline">Страница</span>
                        </button>
                        
                        <button 
                          onClick={() => {
                            if (confirm('Вы уверены, что хотите удалить эту карту?')) {
                              handleDeleteCard(card.id)
                            }
                          }}
                          className="flex flex-col sm:flex-row items-center justify-center gap-1 px-2 sm:px-3 py-2 sm:py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs sm:text-sm font-medium transition shadow-md hover:shadow-lg"
                          title="Удалить"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span className="hidden sm:inline">Удалить</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Информационные блоки */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-blue-50 p-5 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="text-3xl sm:text-4xl mb-2">🆘</div>
          <h4 className="font-semibold text-gray-800 mb-2 text-base sm:text-lg">Экстренные контакты</h4>
          <p className="text-xs sm:text-sm text-gray-600">Добавьте контакты близких для быстрой связи в критической ситуации</p>
        </div>

        <div className="bg-green-50 p-5 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="text-3xl sm:text-4xl mb-2">🩺</div>
          <h4 className="font-semibold text-gray-800 mb-2 text-base sm:text-lg">Медицинские данные</h4>
          <p className="text-xs sm:text-sm text-gray-600">Укажите группу крови, аллергии и хронические заболевания</p>
        </div>

        <div className="bg-purple-50 p-5 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
          <div className="text-3xl sm:text-4xl mb-2">📱</div>
          <h4 className="font-semibold text-gray-800 mb-2 text-base sm:text-lg">QR-код</h4>
          <p className="text-xs sm:text-sm text-gray-600">Доступ к полному профилю здоровья через QR-код на карте</p>
        </div>
      </div>
    </div>
  )
}
