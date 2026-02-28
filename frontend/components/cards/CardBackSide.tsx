'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { apiUrl } from '@/utils/api'

interface CardData {
  id?: number
  bloodType: string
  rhFactor: string
  allergies: string[]
  chronicDiseases: string[]
}

export default function CardBackSide({ data, accessToken }: { data: CardData; accessToken?: string }) {
  const [qrCode, setQrCode] = useState('')
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
        let response: Response

        if (data.id) {
          response = await fetch(apiUrl(`api/cards/${data.id}/svg/back`), {
            headers: { Authorization: `Bearer ${accessToken}` },
            signal: controller.signal
          })
        } else {
          response = await fetch(apiUrl('api/cards/svg/preview/back'), {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              bloodType: data.bloodType || '',
              rhFactor: data.rhFactor || '',
              allergies: data.allergies || [],
              chronicDiseases: data.chronicDiseases || []
            }),
            signal: controller.signal
          })
        }

        if (!response.ok) {
          throw new Error(`Back SVG request failed: ${response.status}`)
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
          console.error('Back SVG preview error:', error)
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
    data.bloodType,
    data.rhFactor,
    JSON.stringify(data.allergies || []),
    JSON.stringify(data.chronicDiseases || [])
  ])

  useEffect(() => {
    const generateQR = async () => {
      try {
        const url = `https://carthelp.ru/card/preview-${Date.now()}`
        const qr = await QRCode.toDataURL(url, {
          width: 200,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        setQrCode(qr)
      } catch (err) {
        console.error('QR generation error:', err)
      }
    }
    generateQR()
  }, [])

  if (svgUrl) {
    return (
      <div
        className="absolute inset-0 backface-hidden overflow-hidden"
        data-card-back
        style={{
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          borderRadius: '12px',
          width: '600px',
          height: '378px'
        }}
      >
        <img
          src={svgUrl}
          alt="Обратная сторона карты"
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>
    )
  }

  return (
    <div
      className="absolute inset-0 backface-hidden bg-white shadow-2xl overflow-hidden border-2 border-gray-200"
      data-card-back
      style={{
        backfaceVisibility: 'hidden',
        transform: 'rotateY(180deg)',
        borderRadius: 'clamp(0.5rem, 2vw, 0.75rem)'
      }}
    >
      <div
        className="relative h-full flex"
      >
        <div
          className="flex"
          style={{ gap: '0', width: '100%' }}
        >
          {/* Левая часть - QR код (половина карты, на всю высоту до синей полоски) */}
          <div
            className="flex flex-col items-center"
            style={{
              width: '50%',
              padding: 'clamp(0.5rem, 2vw, 1rem)',
              paddingTop: 'clamp(1rem, 3vw, 2rem)'
            }}
          >
            <div
              className="text-center font-semibold text-gray-700 whitespace-nowrap"
              style={{
                fontSize: 'clamp(0.4rem, 1.2vw, 0.65rem)',
                marginBottom: 'clamp(0.25rem, 1vw, 0.5rem)'
              }}
            >
              СКАНИРУЙТЕ ТЕЛЕФОНОМ
            </div>
            <div
              className="flex items-center justify-center"
              style={{
                width: '100%',
                maxWidth: '100%',
                aspectRatio: '1'
              }}
            >
              {qrCode ? (
                <img
                  src={qrCode}
                  alt="QR Code"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                />
              ) : (
                <div
                  className="bg-gray-200 animate-pulse rounded"
                  style={{
                    width: '100%',
                    height: '100%'
                  }}
                ></div>
              )}
            </div>
          </div>

          {/* Правая часть - Медицинская информация (половина карты) */}
          <div
            className="flex flex-col min-w-0"
            style={{
              width: '50%',
              height: '100%'
            }}
          >
            {/* Верхняя часть - медицинская информация */}
            <div
              className="flex flex-col overflow-y-auto"
              style={{
                gap: 'clamp(0.5rem, 2vw, 1rem)',
                padding: 'clamp(0.5rem, 2vw, 1rem)',
                paddingTop: 'clamp(1rem, 3vw, 2rem)',
                flex: '1'
              }}
            >
              <div>
                <div
                  className="font-bold uppercase tracking-wider text-red-600"
                  style={{
                    fontSize: 'clamp(0.5rem, 1.5vw, 0.75rem)'
                  }}
                >
                  Группа крови
                </div>
                <div
                  className="font-bold text-gray-900"
                  style={{ fontSize: 'clamp(1rem, 3.5vw, 1.5rem)' }}
                >
                  {data.bloodType && data.rhFactor
                    ? `${data.bloodType} ${data.rhFactor}`
                    : '—'}
                </div>
              </div>

              <div>
                <div
                  className="font-bold uppercase tracking-wider text-red-600"
                  style={{
                    fontSize: 'clamp(0.5rem, 1.5vw, 0.75rem)'
                  }}
                >
                  Аллергии
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(0.0625rem, 0.25vw, 0.125rem)' }}>
                  {data.allergies.filter(Boolean).length > 0 ? (
                    data.allergies.filter(Boolean).map((allergy, i) => (
                      <div
                        key={i}
                        className="text-gray-700 truncate"
                        style={{ fontSize: 'clamp(0.5rem, 1.5vw, 0.75rem)', lineHeight: '1.2' }}
                      >
                        • {allergy}
                      </div>
                    ))
                  ) : (
                    <div
                      className="text-gray-500"
                      style={{ fontSize: 'clamp(0.5rem, 1.5vw, 0.75rem)', lineHeight: '1.2' }}
                    >
                      нет
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div
                  className="font-bold uppercase tracking-wider text-red-600"
                  style={{
                    fontSize: 'clamp(0.5rem, 1.5vw, 0.75rem)'
                  }}
                >
                  Хронические заболевания
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(0.0625rem, 0.25vw, 0.125rem)' }}>
                  {data.chronicDiseases.filter(Boolean).length > 0 ? (
                    data.chronicDiseases.filter(Boolean).map((disease, i) => (
                      <div
                        key={i}
                        className="text-gray-700 truncate"
                        style={{ fontSize: 'clamp(0.5rem, 1.5vw, 0.75rem)', lineHeight: '1.2' }}
                      >
                        • {disease}
                      </div>
                    ))
                  ) : (
                    <div
                      className="text-gray-500"
                      style={{ fontSize: 'clamp(0.5rem, 1.5vw, 0.75rem)', lineHeight: '1.2' }}
                    >
                      нет
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Синяя полоска внизу правой части */}
            <div
              className="bg-blue-600 text-white text-center font-medium"
              style={{
                padding: 'clamp(0.5rem, 2vw, 1rem)',
                fontSize: 'clamp(0.4rem, 1.2vw, 0.6rem)',
                lineHeight: '1.3'
              }}
            >
              В экстренном случае просим связаться по контактам, указанным на карте
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
