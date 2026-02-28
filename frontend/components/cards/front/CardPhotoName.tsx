'use client'

import { useEffect, useState } from 'react'

interface CardPhotoNameProps {
  photo: File | string | null
  lastName: string
  firstName: string
  middleName: string
}

export default function CardPhotoName({ photo, lastName, firstName, middleName }: CardPhotoNameProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  useEffect(() => {
    if (photo) {
      // Если это строка (URL), используем её напрямую
      if (typeof photo === 'string') {
        setPhotoPreview(photo)
      } else {
        // Если это File, читаем как DataURL
        const reader = new FileReader()
        reader.onloadend = () => {
          setPhotoPreview(reader.result as string)
        }
        reader.readAsDataURL(photo)
      }
    } else {
      setPhotoPreview(null)
    }
  }, [photo])

  return (
    <div className="flex items-start" style={{ gap: '16px' }}>
      {/* Фото */}
      <div className="flex-shrink-0">
        {photoPreview ? (
          <img 
            src={photoPreview} 
            alt="Фото" 
            className="rounded-lg object-cover border-2 border-gray-300"
            style={{
              width: '96px',
              height: '96px'
            }}
          />
        ) : (
          <div 
            className="rounded-lg bg-gray-100 flex items-center justify-center border-2 border-gray-300"
            style={{
              width: '96px',
              height: '96px'
            }}
          >
            <svg 
              className="text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              style={{ width: '48px', height: '48px' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
      </div>

      {/* ФИО */}
      <div className="flex-1 min-w-0">
        <div>
          {lastName && (
            <div 
              className="font-bold leading-tight text-gray-900 truncate"
              style={{ fontSize: '24px' }}
            >
              {lastName}
            </div>
          )}
          {firstName && (
            <div 
              className="font-bold leading-tight text-gray-900 truncate"
              style={{ fontSize: '24px' }}
            >
              {firstName}
            </div>
          )}
          {middleName && (
            <div 
              className="font-bold leading-tight text-gray-900 truncate"
              style={{ fontSize: '24px' }}
            >
              {middleName}
            </div>
          )}
          {!lastName && !firstName && !middleName && (
            <div 
              className="font-bold leading-tight text-gray-900"
              style={{ fontSize: '24px' }}
            >
              Ваше имя
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
