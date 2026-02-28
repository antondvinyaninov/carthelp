'use client'

import { useEffect, useRef, useState } from 'react'
import CardFrontSide from './CardFrontSide'
import CardBackSide from './CardBackSide'

interface CardData {
  id?: number
  lastName: string
  firstName: string
  middleName: string
  birthDate: string
  photo: File | string | null
  bloodType: string
  rhFactor: string
  allergies: string[]
  chronicDiseases: string[]
  contacts: Array<{
    name: string
    phone: string
    relationship: string
  }>
  isPublic: boolean
}

interface CardPreviewProps {
  data: CardData
  cardSide: 'front' | 'back'
  onFlip: (side: 'front' | 'back') => void
  showPrintButton?: boolean
  accessToken?: string
}

const CARD_WIDTH = 600
const CARD_HEIGHT = 378

async function fetchCardPngBlob(
  cardId: number,
  side: 'front' | 'back',
  accessToken: string
): Promise<Blob> {
  const response = await fetch(`http://localhost:3001/api/cards/${cardId}/png/${side}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    throw new Error(`Ошибка загрузки PNG: ${response.status}`)
  }

  return await response.blob()
}

export default function CardPreview({ data, cardSide, onFlip, showPrintButton = false, accessToken }: CardPreviewProps) {
  const isFlipped = cardSide === 'back'
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) {
        return
      }

      const containerWidth = containerRef.current.offsetWidth

      if (!containerWidth) {
        return
      }

      // Масштабируем карту так, чтобы она всегда помещалась по ширине контейнера
      const newScale = Math.min(1, containerWidth / CARD_WIDTH)
      setScale(newScale)
    }

    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  const handleFlip = () => {
    onFlip(isFlipped ? 'front' : 'back')
  }

  const handleDownloadPDF = async () => {
    if (!data.id || !accessToken) {
      alert('Невозможно скачать PDF. Сохраните карту сначала.')
      return
    }

    try {
      setIsExporting(true)

      const response = await fetch(`http://localhost:3001/api/cards/${data.id}/pdf/both`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error('Ошибка при загрузке PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `card-${data.lastName || 'help'}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Ошибка при скачивании PDF')
    } finally {
      setIsExporting(false)
    }
  }

  const handleDownloadPNG = async () => {
    if (!data.id || !accessToken) {
      alert('Невозможно скачать PNG. Сохраните карту сначала.')
      return
    }

    try {
      setIsExporting(true)

      // Скачиваем обе стороны в одном файле
      const response = await fetch(`http://localhost:3001/api/cards/${data.id}/png/both`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error('Ошибка при загрузке PNG')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `card-both-${data.lastName || 'help'}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Error downloading PNG:', error)
      alert('Ошибка при скачивании изображения')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div ref={containerRef} className="w-full px-2 sm:px-0">
      {/* Кнопка скачивания PDF */}
      {showPrintButton && data.id && (
        <div className="mb-4 flex flex-col sm:flex-row justify-end gap-2">
          <button
            onClick={handleDownloadPNG}
            disabled={isExporting}
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Загрузка...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="hidden sm:inline">Скачать PNG</span>
                <span className="sm:hidden">PNG</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Загрузка...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="hidden sm:inline">Скачать PDF</span>
                <span className="sm:hidden">PDF</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Контейнер для масштабирования */}
      <div
        ref={cardRef}
        className="w-full flex justify-center"
        style={{
          height: `${CARD_HEIGHT * scale}px`
        }}
      >
        <div
          style={{
            width: `${CARD_WIDTH}px`,
            height: `${CARD_HEIGHT}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            position: 'relative'
          }}
        >
          {/* 3D Карта с переворотом - фиксированный размер, центрируется flex-контейнером */}
          <div className="relative" style={{ perspective: '1000px', width: `${CARD_WIDTH}px`, height: `${CARD_HEIGHT}px` }}>
            <div
              data-card-container
              className="absolute inset-0 transition-transform duration-700"
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              {/* Лицевая сторона */}
              <CardFrontSide data={data} accessToken={accessToken} />

              {/* Обратная сторона */}
              <CardBackSide data={data} accessToken={accessToken} />
            </div>

            {/* Кнопка переворота */}
            {!isExporting && (
              <button
                onClick={handleFlip}
                className="absolute z-10 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-lg transition-all hover:scale-110"
                style={{
                  top: '16px',
                  right: '16px',
                  padding: '8px',
                  width: '40px',
                  height: '40px'
                }}
                title={isFlipped ? 'Показать лицевую сторону' : 'Показать обратную сторону'}
              >
                <svg
                  className="w-full h-full text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
