'use client'

import { useEffect, useState } from 'react'

interface CardData {
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
  additionalInfo: {
    medicalNotes: string
    doctorsInfo: string
    insuranceInfo: string
    additionalContacts: string
    specialInstructions: string
    snils: string
    omsPolicyNumber: string
    dmsInsurance: string
    disabilityGroup: string
    procedureContraindications: string
    organDonationConsent: boolean
    dnrRefusal: boolean
    additionalWishes: string
    vaccinationHistory: string
    currentMedications: string
    fullAllergiesList: string
    surgeriesHistory: string
    attendingPhysician: string
    additionalMedicalNotes: string
  }
}

export default function OnlinePagePreview({ data }: { data: CardData }) {
  const fullName = [data.lastName, data.firstName, data.middleName].filter(Boolean).join(' ') || 'Имя не указано'
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!data.photo) {
      setPhotoUrl(null)
      return
    }

    if (typeof data.photo === 'string') {
      setPhotoUrl(data.photo)
      return
    }

    const nextUrl = URL.createObjectURL(data.photo)
    setPhotoUrl(nextUrl)

    return () => URL.revokeObjectURL(nextUrl)
  }, [data.photo])

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-200">
      {/* Шапка */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          <h1 className="text-xl font-bold">Карта экстренной помощи</h1>
        </div>
        <p className="text-sm opacity-90">Медицинская информация</p>
      </div>

      {/* Контент */}
      <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
        {/* Основная информация */}
        <div className="flex items-start gap-4 pb-6 border-b">
          <div className="flex-shrink-0">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Фото владельца карты"
                className="w-20 h-20 rounded-lg object-cover border-2 border-gray-300"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center border-2 border-gray-300">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{fullName}</h2>
            {data.birthDate && (
              <p className="text-gray-600">
                Дата рождения: {new Date(data.birthDate).toLocaleDateString('ru-RU')}
              </p>
            )}
          </div>
        </div>

        {/* Медицинская информация */}
        <div>
          <h3 className="text-lg font-bold text-red-600 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Медицинские данные
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Группа крови</p>
              <p className="text-xl font-bold text-gray-900">
                {data.bloodType && data.rhFactor ? `${data.bloodType} ${data.rhFactor}` : 'Не указана'}
              </p>
            </div>
            {data.additionalInfo.disabilityGroup && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Группа инвалидности</p>
                <p className="text-xl font-bold text-gray-900">
                  {data.additionalInfo.disabilityGroup === 'child' ? 'Ребенок-инвалид' : `${data.additionalInfo.disabilityGroup} группа`}
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Аллергии:</p>
              {data.allergies.filter(Boolean).length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {data.allergies.filter(Boolean).map((allergy, i) => (
                    <li key={i} className="text-gray-700">{allergy}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">Не указаны</p>
              )}
            </div>

            {data.additionalInfo.fullAllergiesList && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Полный список аллергий:</p>
                <p className="text-gray-700 whitespace-pre-wrap">{data.additionalInfo.fullAllergiesList}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Хронические заболевания:</p>
              {data.chronicDiseases.filter(Boolean).length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {data.chronicDiseases.filter(Boolean).map((disease, i) => (
                    <li key={i} className="text-gray-700">{disease}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">Не указаны</p>
              )}
            </div>

            {data.additionalInfo.currentMedications && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Принимаемые лекарства:</p>
                <p className="text-gray-700 whitespace-pre-wrap">{data.additionalInfo.currentMedications}</p>
              </div>
            )}

            {data.additionalInfo.procedureContraindications && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Противопоказания к процедурам:</p>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
                  <p className="text-gray-700 whitespace-pre-wrap">{data.additionalInfo.procedureContraindications}</p>
                </div>
              </div>
            )}

            {data.additionalInfo.surgeriesHistory && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Перенесенные операции:</p>
                <p className="text-gray-700 whitespace-pre-wrap">{data.additionalInfo.surgeriesHistory}</p>
              </div>
            )}

            {data.additionalInfo.vaccinationHistory && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">История прививок:</p>
                <p className="text-gray-700 whitespace-pre-wrap">{data.additionalInfo.vaccinationHistory}</p>
              </div>
            )}

            {data.additionalInfo.medicalNotes && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Дополнительные медицинские заметки:</p>
                <p className="text-gray-700 whitespace-pre-wrap">{data.additionalInfo.medicalNotes}</p>
              </div>
            )}

            {data.additionalInfo.additionalMedicalNotes && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Дополнительная медицинская информация:</p>
                <p className="text-gray-700 whitespace-pre-wrap">{data.additionalInfo.additionalMedicalNotes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Экстренные контакты */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-bold text-red-600 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Экстренные контакты
          </h3>
          
          <div className="space-y-3">
            {data.contacts.filter(c => c.name && c.phone).length > 0 ? (
              data.contacts.filter(c => c.name && c.phone).map((contact, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">{contact.relationship || 'Контакт'}</p>
                  <p className="font-semibold text-gray-900">{contact.name}</p>
                  <a href={`tel:${contact.phone}`} className="text-red-600 font-semibold hover:underline">
                    {contact.phone}
                  </a>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">Контакты не добавлены</p>
            )}
          </div>

          {data.additionalInfo.additionalContacts && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Дополнительные контакты:</p>
              <p className="text-gray-700 whitespace-pre-wrap">{data.additionalInfo.additionalContacts}</p>
            </div>
          )}
        </div>

        {/* Документы и страхование */}
        {(data.additionalInfo.snils || data.additionalInfo.omsPolicyNumber || data.additionalInfo.dmsInsurance || data.additionalInfo.insuranceInfo) && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-red-600 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Документы и страхование
            </h3>
            
            <div className="space-y-3">
              {data.additionalInfo.snils && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-1">СНИЛС</p>
                  <p className="text-lg font-semibold text-gray-900">{data.additionalInfo.snils}</p>
                </div>
              )}
              
              {data.additionalInfo.omsPolicyNumber && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Полис ОМС</p>
                  <p className="text-lg font-semibold text-gray-900">{data.additionalInfo.omsPolicyNumber}</p>
                </div>
              )}

              {data.additionalInfo.dmsInsurance && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">ДМС:</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{data.additionalInfo.dmsInsurance}</p>
                </div>
              )}

              {data.additionalInfo.insuranceInfo && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Дополнительная страховая информация:</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{data.additionalInfo.insuranceInfo}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Информация о врачах */}
        {(data.additionalInfo.attendingPhysician || data.additionalInfo.doctorsInfo) && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-red-600 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Лечащие врачи
            </h3>
            
            {data.additionalInfo.attendingPhysician && (
              <div className="mb-3">
                <p className="text-sm font-semibold text-gray-700 mb-2">Лечащий врач:</p>
                <p className="text-gray-700 whitespace-pre-wrap">{data.additionalInfo.attendingPhysician}</p>
              </div>
            )}
            
            {data.additionalInfo.doctorsInfo && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Другие специалисты:</p>
                <p className="text-gray-700 whitespace-pre-wrap">{data.additionalInfo.doctorsInfo}</p>
              </div>
            )}
          </div>
        )}

        {/* Важные решения */}
        {(data.additionalInfo.organDonationConsent || data.additionalInfo.dnrRefusal || data.additionalInfo.additionalWishes) && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-red-600 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Важные решения
            </h3>
            
            <div className="space-y-3">
              {data.additionalInfo.organDonationConsent && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold text-blue-900">Согласие на донорство органов</p>
                      <p className="text-sm text-blue-800 mt-1">Владелец карты дал согласие на использование органов для трансплантации</p>
                    </div>
                  </div>
                </div>
              )}

              {data.additionalInfo.dnrRefusal && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold text-red-900">Отказ от реанимации (DNR)</p>
                      <p className="text-sm text-red-800 mt-1">Владелец карты отказывается от проведения реанимационных мероприятий</p>
                    </div>
                  </div>
                </div>
              )}

              {data.additionalInfo.additionalWishes && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Дополнительные пожелания:</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{data.additionalInfo.additionalWishes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Особые указания */}
        {data.additionalInfo.specialInstructions && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-red-600 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Особые указания для медперсонала
            </h3>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{data.additionalInfo.specialInstructions}</p>
            </div>
          </div>
        )}

        {/* Номер 112 */}
        <div className="border-t pt-6">
          <div className="bg-red-600 text-white rounded-lg p-6 text-center">
            <p className="text-sm mb-2">Телефон экстренных служб</p>
            <p className="text-5xl font-bold">112</p>
          </div>
        </div>
      </div>

      {/* Футер */}
      <div className="bg-gray-50 px-6 py-4 border-t text-center">
        <p className="text-xs text-gray-600">
          Превью онлайн-страницы • Доступна по QR-коду
        </p>
      </div>
    </div>
  )
}
