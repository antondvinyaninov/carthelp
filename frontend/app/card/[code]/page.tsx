'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import OnlinePagePreview from '@/components/cards/OnlinePagePreview'

interface CardData {
  id: number
  name: string
  last_name: string
  first_name: string
  middle_name: string
  birth_date: string
  photo: string | null
  unique_code: string
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
  medical_notes?: string
  doctors_info?: string
  insurance_info?: string
  additional_contacts?: string
  special_instructions?: string
}

export default function PublicCardPage() {
  const params = useParams()
  const code = params.code as string
  const [card, setCard] = useState<CardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCard()
  }, [code])

  const fetchCard = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/cards/public/${code}`)
      const data = await response.json()

      if (data.success) {
        setCard(data.card)
      } else {
        setError(data.message || 'Карта не найдена')
      }
    } catch (err) {
      console.error('Error fetching card:', err)
      setError('Ошибка при загрузке карты')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка карты...</p>
        </div>
      </div>
    )
  }

  if (error || !card) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Карта не найдена</h1>
          <p className="text-gray-600 mb-6">{error || 'Карта с таким кодом не существует'}</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            На главную
          </a>
        </div>
      </div>
    )
  }

  if (!card.is_public) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Доступ ограничен</h1>
          <p className="text-gray-600 mb-6">Владелец карты ограничил публичный доступ к данным</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            На главную
          </a>
        </div>
      </div>
    )
  }

  // Расширенная информация (совмещаем плоские поля и JSON additional_info)
  const rawAdditionalInfo: any = (card as any).additional_info || {}

  const additionalInfo = {
    medicalNotes: card.medical_notes || rawAdditionalInfo.medicalNotes || '',
    doctorsInfo: card.doctors_info || rawAdditionalInfo.doctorsInfo || '',
    insuranceInfo: card.insurance_info || rawAdditionalInfo.insuranceInfo || '',
    additionalContacts: card.additional_contacts || rawAdditionalInfo.additionalContacts || '',
    specialInstructions: card.special_instructions || rawAdditionalInfo.specialInstructions || '',
    snils: (card as any).snils || rawAdditionalInfo.snils || '',
    omsPolicyNumber: (card as any).oms_policy_number || rawAdditionalInfo.omsPolicyNumber || '',
    dmsInsurance: (card as any).dms_insurance || rawAdditionalInfo.dmsInsurance || '',
    disabilityGroup: (card as any).disability_group || rawAdditionalInfo.disabilityGroup || '',
    procedureContraindications:
      (card as any).procedure_contraindications || rawAdditionalInfo.procedureContraindications || '',
    organDonationConsent: Boolean(
      (card as any).organ_donation_consent ?? rawAdditionalInfo.organDonationConsent ?? false
    ),
    dnrRefusal: Boolean((card as any).dnr_refusal ?? rawAdditionalInfo.dnrRefusal ?? false),
    additionalWishes: (card as any).additional_wishes || rawAdditionalInfo.additionalWishes || '',
    vaccinationHistory: (card as any).vaccination_history || rawAdditionalInfo.vaccinationHistory || '',
    currentMedications: (card as any).current_medications || rawAdditionalInfo.currentMedications || '',
    fullAllergiesList: (card as any).full_allergies_list || rawAdditionalInfo.fullAllergiesList || '',
    surgeriesHistory: (card as any).surgeries_history || rawAdditionalInfo.surgeriesHistory || '',
    attendingPhysician: (card as any).attending_physician || rawAdditionalInfo.attendingPhysician || '',
    additionalMedicalNotes:
      (card as any).additional_medical_notes || rawAdditionalInfo.additionalMedicalNotes || ''
  }

  const onlinePreviewData = {
    lastName: card.last_name || '',
    firstName: card.first_name || '',
    middleName: card.middle_name || '',
    birthDate: card.birth_date || '',
    photo: card.photo ? `http://localhost:3001/uploads/avatars/${card.photo}` : null,
    bloodType: card.blood_type || '',
    rhFactor: card.rh_factor || '',
    allergies: card.allergies ? card.allergies.split(', ').slice(0, 3) : ['', '', ''],
    chronicDiseases: card.chronic_diseases ? card.chronic_diseases.split(', ').slice(0, 3) : ['', '', ''],
    contacts:
      card.contacts && card.contacts.length > 0
        ? card.contacts.slice(0, 2).map((c) => ({
            name: c.name || '',
            phone: c.phone || '',
            relationship: c.relationship || ''
          }))
        : [
            { name: '', phone: '', relationship: '' },
            { name: '', phone: '', relationship: '' }
          ],
    additionalInfo
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <OnlinePagePreview data={onlinePreviewData} />
        </div>
      </div>
    </div>
  )
}
