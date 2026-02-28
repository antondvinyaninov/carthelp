'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import CardPreview from '@/components/cards/CardPreview'
import OnlinePagePreview from '@/components/cards/OnlinePagePreview'
import ImageCropModal from '@/components/ImageCropModal'
import { apiUrl } from '@/utils/api'

function CreateCardPageInner() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  
  const [cardSide, setCardSide] = useState<'front' | 'back'>('front')
  const [activeTab, setActiveTab] = useState<'card' | 'additional'>('card')
  const [showCropModal, setShowCropModal] = useState(false)
  const [tempImage, setTempImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(!!editId)
  const [cardData, setCardData] = useState({
    // Идентификатор сохранённой карты (нужен для корректного превью без повторной загрузки фото)
    id: undefined as number | undefined,

    // Персональные данные
    lastName: '',
    firstName: '',
    middleName: '',
    birthDate: '',
    photo: null as File | string | null,
    
    // Медицинские данные
    bloodType: '',
    rhFactor: '',
    allergies: ['', '', ''],
    chronicDiseases: ['', '', ''],
    medications: '',
    isPublic: true,
    
    // Экстренные контакты
    contacts: [
      { name: '', phone: '', relationship: '' },
      { name: '', phone: '', relationship: '' }
    ],
    
    // Дополнительные данные для онлайн-страницы
    additionalInfo: {
      medicalNotes: '',
      doctorsInfo: '',
      insuranceInfo: '',
      additionalContacts: '',
      specialInstructions: '',
      snils: '',
      omsPolicyNumber: '',
      dmsInsurance: '',
      disabilityGroup: '',
      procedureContraindications: '',
      organDonationConsent: false,
      dnrRefusal: false,
      additionalWishes: '',
      vaccinationHistory: '',
      currentMedications: '',
      fullAllergiesList: '',
      surgeriesHistory: '',
      attendingPhysician: '',
      additionalMedicalNotes: ''
    }
  })

  // Загрузка данных карты при редактировании
  useEffect(() => {
    if (editId && session?.accessToken) {
      loadCardData(editId)
    }
  }, [editId, session])

  const loadCardData = async (cardId: string) => {
    try {
      setLoading(true)
      const response = await fetch(apiUrl(`api/cards/${cardId}`), {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        }
      })
      const data = await response.json()

      if (data.success && data.card) {
        const card = data.card

        // Нормализуем дату рождения в формат, который понимает <input type="date"> (yyyy-MM-dd)
        const rawBirthDate = card.birth_date || ''
        const normalizedBirthDate = rawBirthDate
          ? (rawBirthDate.includes('T') ? rawBirthDate.split('T')[0] : rawBirthDate)
          : ''

        // Извлекаем только имя файла из пути (если в БД хранится полный путь)
        // В БД может быть либо просто имя файла, либо путь вида /uploads/avatars/filename.jpg
        const photoFileName = card.photo 
          ? (card.photo.includes('/') ? card.photo.split('/').pop() : card.photo)
          : null

        setCardData({
          id: card.id,
          lastName: card.last_name || '',
          firstName: card.first_name || '',
          middleName: card.middle_name || '',
          birthDate: normalizedBirthDate,
          // Для сохранённых карт передаём только имя файла, URL формируется в компонентах
          photo: photoFileName ? `${process.env.NEXT_PUBLIC_API_URL || ''}/uploads/avatars/${photoFileName}` as any : null,
          bloodType: card.blood_type || '',
          rhFactor: card.rh_factor || '',
          allergies: card.allergies ? card.allergies.split(', ').concat(['', '', '']).slice(0, 3) : ['', '', ''],
          chronicDiseases: card.chronic_diseases ? card.chronic_diseases.split(', ').concat(['', '', '']).slice(0, 3) : ['', '', ''],
          medications: card.medications || '',
          isPublic: card.is_public || false,
          contacts: card.contacts && card.contacts.length > 0
            ? card.contacts.slice(0, 2).concat([{ name: '', phone: '', relationship: '' }, { name: '', phone: '', relationship: '' }]).slice(0, 2).map((c: any) => ({
                name: c.name || '',
                phone: c.phone || '',
                relationship: c.relationship || ''
              }))
            : [
                { name: '', phone: '', relationship: '' },
                { name: '', phone: '', relationship: '' }
              ],
          additionalInfo: {
            medicalNotes: card.medical_notes || card.additional_info?.medicalNotes || '',
            doctorsInfo: card.doctors_info || card.additional_info?.doctorsInfo || '',
            insuranceInfo: card.insurance_info || card.additional_info?.insuranceInfo || '',
            additionalContacts: card.additional_contacts || card.additional_info?.additionalContacts || '',
            specialInstructions: card.special_instructions || card.additional_info?.specialInstructions || '',
            snils: card.snils || card.additional_info?.snils || '',
            omsPolicyNumber: card.oms_policy_number || card.additional_info?.omsPolicyNumber || '',
            dmsInsurance: card.dms_insurance || card.additional_info?.dmsInsurance || '',
            disabilityGroup: card.disability_group || card.additional_info?.disabilityGroup || '',
            procedureContraindications: card.procedure_contraindications || card.additional_info?.procedureContraindications || '',
            organDonationConsent: card.organ_donation_consent || card.additional_info?.organDonationConsent || false,
            dnrRefusal: card.dnr_refusal || card.additional_info?.dnrRefusal || false,
            additionalWishes: card.additional_wishes || card.additional_info?.additionalWishes || '',
            vaccinationHistory: card.vaccination_history || card.additional_info?.vaccinationHistory || '',
            currentMedications: card.current_medications || card.additional_info?.currentMedications || '',
            fullAllergiesList: card.full_allergies_list || card.additional_info?.fullAllergiesList || '',
            surgeriesHistory: card.surgeries_history || card.additional_info?.surgeriesHistory || '',
            attendingPhysician: card.attending_physician || card.additional_info?.attendingPhysician || '',
            additionalMedicalNotes: card.additional_medical_notes || card.additional_info?.additionalMedicalNotes || ''
          }
        })
      }
    } catch (error) {
      console.error('Error loading card:', error)
      alert('Ошибка при загрузке данных карты')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setCardData(prev => ({ ...prev, [field]: value }))
  }

  const handleArrayChange = (field: 'allergies' | 'chronicDiseases', index: number, value: string) => {
    setCardData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const handleContactChange = (index: number, field: string, value: string) => {
    setCardData(prev => ({
      ...prev,
      contacts: prev.contacts.map((contact, i) => 
        i === index ? { ...contact, [field]: value } : contact
      )
    }))
  }

  const handleAdditionalInfoChange = (field: string, value: string | boolean) => {
    setCardData(prev => ({
      ...prev,
      additionalInfo: {
        ...prev.additionalInfo,
        [field]: value
      }
    }))
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Проверяем, что это изображение
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите файл изображения')
        return
      }

      // Проверяем исходный размер (максимум 10 МБ для загрузки)
      if (file.size > 10 * 1024 * 1024) {
        alert('Файл слишком большой. Максимум 10 МБ')
        return
      }

      // Создаем превью для кропа
      const reader = new FileReader()
      reader.onloadend = () => {
        setTempImage(reader.result as string)
        setShowCropModal(true)
      }
      reader.readAsDataURL(file)

    } catch (error) {
      console.error('Ошибка при загрузке фото:', error)
      alert('Не удалось загрузить изображение. Попробуйте другой файл.')
    }
  }

  const handleCropComplete = async (croppedFile: File) => {
    try {
      // Показываем индикатор загрузки
      const loadingMessage = document.createElement('div')
      loadingMessage.textContent = 'Обработка изображения...'
      loadingMessage.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #3B82F6; color: white; padding: 12px 24px; border-radius: 8px; z-index: 9999;'
      document.body.appendChild(loadingMessage)

      // Импортируем функцию обработки
      const { processCardPhoto } = await import('@/utils/imageProcessor')
      
      // Обрабатываем обрезанное изображение
      const processedFile = await processCardPhoto(croppedFile)
      
      // Удаляем индикатор
      document.body.removeChild(loadingMessage)

      // Сохраняем обработанное изображение
      setCardData(prev => ({ ...prev, photo: processedFile }))
      setShowCropModal(false)
      setTempImage(null)

      console.log('Фото успешно обработано:', {
        cropped: (croppedFile.size / 1024 / 1024).toFixed(2) + ' MB',
        processed: (processedFile.size / 1024 / 1024).toFixed(2) + ' MB'
      })
    } catch (error) {
      console.error('Ошибка при обработке фото:', error)
      alert('Не удалось обработать изображение. Попробуйте другой файл.')
    }
  }

  const handleCropCancel = () => {
    setShowCropModal(false)
    setTempImage(null)
  }

  const handleSubmit = async () => {
    try {
      const formData = new FormData()
      
      // Добавляем все поля
      formData.append('lastName', cardData.lastName)
      formData.append('firstName', cardData.firstName)
      formData.append('middleName', cardData.middleName)
      formData.append('birthDate', cardData.birthDate)
      formData.append('bloodType', cardData.bloodType)
      formData.append('rhFactor', cardData.rhFactor)
      formData.append('allergies', JSON.stringify(cardData.allergies))
      formData.append('chronicDiseases', JSON.stringify(cardData.chronicDiseases))
      formData.append('medications', cardData.medications)
      formData.append('isPublic', cardData.isPublic.toString())
      formData.append('contacts', JSON.stringify(cardData.contacts))
      formData.append('additionalInfo', JSON.stringify(cardData.additionalInfo))
      
      // Добавляем фото если есть и это File (новое фото)
      if (cardData.photo && cardData.photo instanceof File) {
        console.log('=== FRONTEND: Sending photo ===')
        console.log('Photo name:', cardData.photo.name)
        console.log('Photo type:', cardData.photo.type)
        console.log('Photo size:', (cardData.photo.size / 1024 / 1024).toFixed(2), 'MB')
        console.log('Is File:', cardData.photo instanceof File)
        console.log('Is Blob:', cardData.photo instanceof Blob)
        formData.append('photo', cardData.photo)
      } else {
        console.log('=== FRONTEND: No photo to send ===')
        console.log('Photo value:', cardData.photo)
        console.log('Photo type:', typeof cardData.photo)
      }

      // Используем разные endpoints для создания и редактирования
      const url = editId 
        ? apiUrl(`api/cards/${editId}`)
        : apiUrl('api/cards/create')
      
      const method = editId ? 'PUT' : 'POST'

      console.log('=== FRONTEND: Sending request ===')
      console.log('URL:', url)
      console.log('Method:', method)
      console.log('FormData entries:')
      for (let pair of formData.entries()) {
        if (pair[0] === 'photo') {
          console.log('  photo:', pair[1] instanceof File ? `File(${pair[1].name})` : pair[1])
        } else {
          console.log(`  ${pair[0]}:`, typeof pair[1] === 'string' ? pair[1].substring(0, 50) : pair[1])
        }
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        alert(editId ? 'Карта успешно обновлена!' : 'Карта успешно создана!')
        // Перенаправляем в личный кабинет
        window.location.href = '/lk'
      } else {
        alert(`Ошибка: ${result.message}`)
      }
    } catch (error) {
      console.error('Error saving card:', error)
      alert('Произошла ошибка при сохранении карты')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {editId ? 'Редактирование карты' : 'Создание карты помощи'}
        </h1>
        <p className="text-gray-600 mt-2">
          {editId ? 'Обновите данные вашей карты' : 'Заполните данные для создания вашей карты'}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Превью карты */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            {activeTab === 'card' ? (
              <CardPreview 
                data={cardData} 
                cardSide={cardSide}
                onFlip={setCardSide}
                accessToken={session?.accessToken}
              />
            ) : (
              <OnlinePagePreview data={cardData} />
            )}
            
            {/* Кнопка сохранения под картой */}
            <div className="mt-6">
              <button
                onClick={handleSubmit}
                className="w-full px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-lg shadow-lg hover:shadow-xl"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>

        {/* Форма */}
        <div className="lg:col-span-2">
          {/* Переключатель вкладок */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('card')}
                className={`flex-1 px-6 py-4 font-medium transition ${
                  activeTab === 'card'
                    ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Данные для карты
                </div>
              </button>
              <button
                onClick={() => setActiveTab('additional')}
                className={`flex-1 px-6 py-4 font-medium transition ${
                  activeTab === 'additional'
                    ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Дополнительно
                </div>
              </button>
            </div>
          </div>

          {activeTab === 'card' ? (
          <div className="bg-white rounded-lg shadow p-6">
            {/* Форма для лицевой стороны */}
            {cardSide === 'front' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Лицевая сторона карты</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Фото профиля
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Фамилия
                      </label>
                      <input
                        type="text"
                        value={cardData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Двинянинов"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Имя
                      </label>
                      <input
                        type="text"
                        value={cardData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Антон"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Отчество
                      </label>
                      <input
                        type="text"
                        value={cardData.middleName}
                        onChange={(e) => handleInputChange('middleName', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Александрович"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Дата рождения
                    </label>
                    <input
                      type="date"
                      value={cardData.birthDate}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Экстренные контакты</h3>
                    {cardData.contacts.map((contact, index) => (
                      <div key={index} className="p-4 border rounded-lg mb-3">
                        <h4 className="font-medium mb-3 text-gray-700">Контакт {index + 1}</h4>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Кто это
                            </label>
                            <input
                              type="text"
                              value={contact.relationship}
                              onChange={(e) => handleContactChange(index, 'relationship', e.target.value)}
                              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                              placeholder="Жена, Сын..."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Имя
                            </label>
                            <input
                              type="text"
                              value={contact.name}
                              onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                              placeholder="Вероника Двинянинова"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Телефон
                            </label>
                            <input
                              type="tel"
                              value={contact.phone}
                              onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                              placeholder="+7 (950) 155-20-09"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Форма для обратной стороны */}
              {cardSide === 'back' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Обратная сторона карты</h2>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Группа крови
                      </label>
                      <select
                        value={cardData.bloodType}
                        onChange={(e) => handleInputChange('bloodType', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">Выберите</option>
                        <option value="I">I</option>
                        <option value="II">II</option>
                        <option value="III">III</option>
                        <option value="IV">IV</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Резус-фактор
                      </label>
                      <select
                        value={cardData.rhFactor}
                        onChange={(e) => handleInputChange('rhFactor', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">Выберите</option>
                        <option value="Rh+">Rh+</option>
                        <option value="Rh-">Rh-</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Аллергии (до 3 пунктов)
                    </label>
                    {cardData.allergies.map((allergy, index) => (
                      <input
                        key={index}
                        type="text"
                        value={allergy}
                        onChange={(e) => handleArrayChange('allergies', index, e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-2"
                        placeholder={`Аллергия ${index + 1}`}
                      />
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Хронические заболевания (до 3 пунктов)
                    </label>
                    {cardData.chronicDiseases.map((disease, index) => (
                      <input
                        key={index}
                        type="text"
                        value={disease}
                        onChange={(e) => handleArrayChange('chronicDiseases', index, e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-2"
                        placeholder={`Заболевание ${index + 1}`}
                      />
                    ))}
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={cardData.isPublic}
                        onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        Разрешить публичный доступ к данным по QR-коду
                      </span>
                    </label>
                  </div>
                </div>
              )}
          </div>
          ) : activeTab === 'additional' ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Дополнительная информация</h2>
                <p className="text-gray-600 text-sm">
                  Эти данные будут доступны только на онлайн-странице при сканировании QR-кода. 
                  Они не печатаются на физической карте.
                </p>
              </div>

              {/* Документы и страхование */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Документы и страхование</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      СНИЛС
                    </label>
                    <input
                      type="text"
                      value={cardData.additionalInfo.snils}
                      onChange={(e) => handleAdditionalInfoChange('snils', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="123-456-789 00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Номер полиса ОМС
                    </label>
                    <input
                      type="text"
                      value={cardData.additionalInfo.omsPolicyNumber}
                      onChange={(e) => handleAdditionalInfoChange('omsPolicyNumber', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="1234567890123456"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дополнительная медицинская страховка (ДМС)
                  </label>
                  <textarea
                    value={cardData.additionalInfo.dmsInsurance}
                    onChange={(e) => handleAdditionalInfoChange('dmsInsurance', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Название страховой компании, номер полиса, контакты..."
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Страховая информация (общая)
                  </label>
                  <textarea
                    value={cardData.additionalInfo.insuranceInfo}
                    onChange={(e) => handleAdditionalInfoChange('insuranceInfo', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Дополнительная информация о страховании..."
                  />
                </div>
              </div>

              {/* Медицинская информация */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Медицинская информация</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Группа инвалидности
                    </label>
                    <select
                      value={cardData.additionalInfo.disabilityGroup}
                      onChange={(e) => handleAdditionalInfoChange('disabilityGroup', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Не указана</option>
                      <option value="1">I группа</option>
                      <option value="2">II группа</option>
                      <option value="3">III группа</option>
                      <option value="child">Ребенок-инвалид</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Принимаемые лекарства
                    </label>
                    <textarea
                      value={cardData.additionalInfo.currentMedications}
                      onChange={(e) => handleAdditionalInfoChange('currentMedications', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Название препарата, дозировка, частота приема..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Полный список аллергий
                    </label>
                    <textarea
                      value={cardData.additionalInfo.fullAllergiesList}
                      onChange={(e) => handleAdditionalInfoChange('fullAllergiesList', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Подробный список всех аллергических реакций..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Противопоказания к процедурам
                    </label>
                    <textarea
                      value={cardData.additionalInfo.procedureContraindications}
                      onChange={(e) => handleAdditionalInfoChange('procedureContraindications', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Процедуры и манипуляции, которые противопоказаны..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Перенесенные операции
                    </label>
                    <textarea
                      value={cardData.additionalInfo.surgeriesHistory}
                      onChange={(e) => handleAdditionalInfoChange('surgeriesHistory', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Дата, название операции, особенности..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      История прививок
                    </label>
                    <textarea
                      value={cardData.additionalInfo.vaccinationHistory}
                      onChange={(e) => handleAdditionalInfoChange('vaccinationHistory', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Список прививок и даты вакцинации..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Дополнительные медицинские заметки
                    </label>
                    <textarea
                      value={cardData.additionalInfo.additionalMedicalNotes}
                      onChange={(e) => handleAdditionalInfoChange('additionalMedicalNotes', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Любая другая важная медицинская информация..."
                    />
                  </div>
                </div>
              </div>

              {/* Врачи и контакты */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Врачи и контакты</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Лечащий врач
                    </label>
                    <textarea
                      value={cardData.additionalInfo.attendingPhysician}
                      onChange={(e) => handleAdditionalInfoChange('attendingPhysician', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="ФИО, специализация, контактный телефон..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Информация о других врачах
                    </label>
                    <textarea
                      value={cardData.additionalInfo.doctorsInfo}
                      onChange={(e) => handleAdditionalInfoChange('doctorsInfo', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Другие специалисты, которые наблюдают пациента..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Дополнительные контакты
                    </label>
                    <textarea
                      value={cardData.additionalInfo.additionalContacts}
                      onChange={(e) => handleAdditionalInfoChange('additionalContacts', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Другие важные контакты (родственники, друзья, коллеги)..."
                    />
                  </div>
                </div>
              </div>

              {/* Важные решения */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Важные решения</h3>

                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cardData.additionalInfo.organDonationConsent}
                        onChange={(e) => handleAdditionalInfoChange('organDonationConsent', e.target.checked)}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="ml-3">
                        <span className="font-medium text-gray-900">Согласие на донорство органов</span>
                        <p className="text-sm text-gray-600 mt-1">
                          Я даю согласие на использование моих органов для трансплантации в случае моей смерти
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cardData.additionalInfo.dnrRefusal}
                        onChange={(e) => handleAdditionalInfoChange('dnrRefusal', e.target.checked)}
                        className="mt-1 rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <div className="ml-3">
                        <span className="font-medium text-gray-900">Отказ от реанимации (DNR)</span>
                        <p className="text-sm text-gray-600 mt-1">
                          Я отказываюсь от проведения реанимационных мероприятий в случае остановки сердца или дыхания
                        </p>
                      </div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Дополнительные пожелания
                    </label>
                    <textarea
                      value={cardData.additionalInfo.additionalWishes}
                      onChange={(e) => handleAdditionalInfoChange('additionalWishes', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Любые другие пожелания относительно медицинской помощи..."
                    />
                  </div>
                </div>
              </div>

              {/* Особые указания */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Особые указания</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Дополнительные медицинские заметки (общие)
                    </label>
                    <textarea
                      value={cardData.additionalInfo.medicalNotes}
                      onChange={(e) => handleAdditionalInfoChange('medicalNotes', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Дополнительная информация о здоровье, которая может быть полезна врачам..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Особые указания для медперсонала
                    </label>
                    <textarea
                      value={cardData.additionalInfo.specialInstructions}
                      onChange={(e) => handleAdditionalInfoChange('specialInstructions', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Важные инструкции для врачей и медперсонала в экстренной ситуации..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          ) : null}
        </div>
      </div>

      {/* Модальное окно кропа */}
      {showCropModal && tempImage && (
        <ImageCropModal
          image={tempImage}
          onComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  )
}

export default function CreateCardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-gray-600">Загрузка формы карты...</div>
        </div>
      }
    >
      <CreateCardPageInner />
    </Suspense>
  )
}
