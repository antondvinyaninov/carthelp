'use client'

import { useEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { apiUrl } from '@/utils/api'

interface CardData {
  id?: number
  lastName: string
  firstName: string
  middleName: string
  birthDate: string
  photo: File | string | null
  contacts: Array<{
    name: string
    phone: string
    relationship: string
  }>
}

const PREVIEW_PHOTO_MAX_SIDE = 512
const PREVIEW_PHOTO_JPEG_QUALITY = 0.82

function blobToRawDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Не удалось прочитать файл изображения'))
    reader.readAsDataURL(blob)
  })
}

async function blobToOptimizedDataUrl(blob: Blob): Promise<string> {
  const objectUrl = URL.createObjectURL(blob)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error('Не удалось загрузить изображение для превью'))
      image.src = objectUrl
    })

    const scale = Math.min(1, PREVIEW_PHOTO_MAX_SIDE / Math.max(img.width, img.height))
    const targetWidth = Math.max(1, Math.round(img.width * scale))
    const targetHeight = Math.max(1, Math.round(img.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = targetWidth
    canvas.height = targetHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return await blobToRawDataUrl(blob)
    }

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
    return canvas.toDataURL('image/jpeg', PREVIEW_PHOTO_JPEG_QUALITY)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

async function fileToDataUrl(file: File): Promise<string> {
  return await blobToOptimizedDataUrl(file)
}

async function urlToDataUrl(url: string, signal?: AbortSignal): Promise<string> {
  const response = await fetch(url, { signal, credentials: 'omit' })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  const blob = await response.blob()
  return await blobToOptimizedDataUrl(blob)
}

export default function CardFrontSide({ data, accessToken }: { data: CardData; accessToken?: string }) {
  const [svgUrl, setSvgUrl] = useState<string | null>(null)
  const svgUrlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (svgUrlRef.current) {
        URL.revokeObjectURL(svgUrlRef.current)
        svgUrlRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!accessToken) {
      return
    }

    const controller = new AbortController()
    let isCancelled = false

    const timer = window.setTimeout(async () => {
      try {
        let photoDataUrl = ''

        // ВАЖНО:
        // Для уже сохранённых карт (есть data.id) фото уже есть на бэкенде.
        // Нет смысла ещё раз тянуть его в браузер и конвертировать — это тормозит загрузку.
        // Поэтому photoDataUrl считаем только для черновых карт (без id).
        if (!data.id) {
          if (data.photo instanceof File) {
            photoDataUrl = await fileToDataUrl(data.photo)
          } else if (typeof data.photo === 'string' && data.photo) {
            if (data.photo.startsWith('data:image/')) {
              photoDataUrl = data.photo
            } else if (data.photo.startsWith('http://') || data.photo.startsWith('https://')) {
              photoDataUrl = await urlToDataUrl(data.photo, controller.signal)
            }
          }
        }

        let response: Response
        if (data.id) {
          response = await fetch(apiUrl(`api/cards/${data.id}/svg/front`), {
            headers: { Authorization: `Bearer ${accessToken}` },
            signal: controller.signal
          })
        } else {
          response = await fetch(apiUrl('api/cards/svg/preview/front'), {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              lastName: data.lastName || '',
              firstName: data.firstName || '',
              middleName: data.middleName || '',
              contacts: (data.contacts || []).slice(0, 2),
              photoDataUrl
            }),
            signal: controller.signal
          })
        }

        if (!response.ok && response.status === 413 && !data.id && photoDataUrl) {
          response = await fetch(apiUrl('api/cards/svg/preview/front'), {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              lastName: data.lastName || '',
              firstName: data.firstName || '',
              middleName: data.middleName || '',
              contacts: (data.contacts || []).slice(0, 2),
              photoDataUrl: ''
            }),
            signal: controller.signal
          })
        }

        if (!response.ok) {
          throw new Error(`SVG request failed: ${response.status}`)
        }

        const svgText = await response.text()
        if (isCancelled) return

        const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' })
        const nextUrl = URL.createObjectURL(blob)

        if (svgUrlRef.current) {
          URL.revokeObjectURL(svgUrlRef.current)
        }
        svgUrlRef.current = nextUrl
        setSvgUrl(nextUrl)
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Front SVG preview error:', error)
        }
      }
    }, 140)

    return () => {
      isCancelled = true
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [
    accessToken,
    data.id,
    data.lastName,
    data.firstName,
    data.middleName,
    data.photo,
    JSON.stringify(data.contacts || [])
  ])

  if (svgUrl) {
    return (
      <div
        className="absolute inset-0 backface-hidden overflow-hidden"
        data-card-front
        style={{
          backfaceVisibility: 'hidden',
          borderRadius: '12px',
          width: '600px',
          height: '378px'
        }}
      >
        <img
          src={svgUrl}
          alt="Карта экстренной помощи"
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>
    )
  }

  return (
    <div 
      className="absolute inset-0 backface-hidden bg-white shadow-2xl overflow-hidden border-2 border-gray-200"
      data-card-front
      style={{ 
        backfaceVisibility: 'hidden',
        borderRadius: '12px',
        width: '600px',
        height: '378px'
      }}
    >
      {/* Хедер */}
      <div 
        className="bg-red-600 flex items-center justify-center"
        style={{ 
          height: '40px',
          padding: '0 24px'
        }}
      >
        <span 
          className="font-bold uppercase tracking-wider text-white whitespace-nowrap"
          style={{ fontSize: '14px' }}
        >
          Карта экстренной помощи
        </span>
      </div>

      {/* Контент */}
      <div style={{ padding: '10px 24px 0 24px' }}>
        {/* Фото + ФИО */}
        <div className="flex items-start" style={{ gap: '22px', marginBottom: '24px' }}>
          {/* Фото */}
          <div className="flex-shrink-0">
            {data.photo ? (
              typeof data.photo === 'string' ? (
                <img 
                  src={data.photo} 
                  alt="Фото" 
                  crossOrigin="anonymous"
                  className="rounded-lg object-cover border-2 border-gray-300"
                  style={{ width: '122px', height: '122px' }}
                />
              ) : (
                <img 
                  src={URL.createObjectURL(data.photo)} 
                  alt="Фото" 
                  className="rounded-lg object-cover border-2 border-gray-300"
                  style={{ width: '122px', height: '122px' }}
                />
              )
            ) : (
              <div 
                className="rounded-lg bg-gray-100 flex items-center justify-center border-2 border-gray-300"
                style={{ width: '122px', height: '122px' }}
              >
                <svg 
                  className="text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  style={{ width: '58px', height: '58px' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>

          {/* ФИО */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {data.lastName && (
              <div 
                className="font-bold leading-tight text-gray-900"
                style={{ fontSize: '32px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {data.lastName}
              </div>
            )}
            {data.firstName && (
              <div 
                className="font-bold leading-tight text-gray-900"
                style={{ fontSize: '32px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {data.firstName}
              </div>
            )}
            {data.middleName && (
              <div 
                className="font-bold leading-tight text-gray-900"
                style={{ fontSize: '32px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {data.middleName}
              </div>
            )}
          </div>
        </div>

        {/* Экстренные контакты */}
        <div style={{ marginBottom: '16px' }}>
          <div className="flex items-center" style={{ gap: '10px', marginBottom: '13px' }}>
            <div 
              className="font-semibold uppercase text-red-600 whitespace-nowrap"
              style={{ fontSize: '17px' }}
            >
              Экстренные контакты
            </div>
            <div className="bg-red-600" style={{ height: '2px', flex: 1 }}></div>
          </div>
          
          {data.contacts.filter(c => c.name && c.phone).length > 0 && (
            <div className="grid grid-cols-2" style={{ gap: '24px' }}>
              {data.contacts.filter(c => c.name && c.phone).slice(0, 2).map((contact, i) => (
                <div key={i} style={{ lineHeight: '1.2' }}>
                  <div 
                    className="text-gray-600"
                    style={{ fontSize: '16px', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {contact.relationship || 'Контакт'}:
                  </div>
                  <div 
                    className="font-semibold text-gray-900"
                    style={{ fontSize: '20px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {contact.name}
                  </div>
                  <div 
                    className="text-gray-900 font-bold"
                    style={{ fontSize: '22px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {contact.phone}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Футер - абсолютное позиционирование внизу */}
      <div 
        className="flex items-stretch overflow-hidden absolute bottom-0 left-0 right-0"
        style={{ height: '44px' }}
      >
        <div 
          className="bg-white flex items-center"
          style={{ paddingLeft: '24px', width: '30%', gap: '8px' }}
        >
          {/* QR код на сайт */}
          <div className="flex-shrink-0">
            <QRCodeSVG 
              value="https://carthelp.ru" 
              size={32}
              level="M"
              includeMargin={false}
            />
          </div>
          
          <p 
            className="text-gray-600 leading-tight font-semibold"
            style={{ fontSize: '15px' }}
          >
            carthelp.ru
          </p>
        </div>
        <div 
          className="bg-red-600 flex items-center justify-between"
          style={{ 
            clipPath: 'polygon(5% 0, 100% 0, 100% 100%, 0 100%)',
            paddingLeft: '32px',
            paddingRight: '20px',
            flex: 1
          }}
        >
          <p 
            className="text-white leading-tight font-semibold whitespace-nowrap"
            style={{ fontSize: '11px' }}
          >
            Телефон экстренных спасательных служб
          </p>
          <p 
            className="font-bold text-white leading-none"
            style={{ fontSize: '28px', marginLeft: '12px' }}
          >
            112
          </p>
        </div>
      </div>
    </div>
  )
}
