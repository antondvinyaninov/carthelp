'use client'

import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function EditCardPage() {
  const params = useParams()
  const router = useRouter()
  const cardId = params.id

  useEffect(() => {
    // Перенаправляем на страницу создания с параметром edit
    router.replace(`/lk/cards/create?edit=${cardId}`)
  }, [cardId, router])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <p className="text-gray-600">Загрузка...</p>
      </div>
    </div>
  )
}
