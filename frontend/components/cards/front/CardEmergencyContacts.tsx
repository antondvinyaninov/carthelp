interface Contact {
  name: string
  phone: string
  relationship: string
}

interface CardEmergencyContactsProps {
  contacts: Contact[]
}

export default function CardEmergencyContacts({ contacts }: CardEmergencyContactsProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center mb-1" style={{ gap: '8px' }}>
        <div 
          className="font-semibold uppercase text-red-600 whitespace-nowrap"
          style={{ fontSize: '12px' }}
        >
          Экстренные контакты
        </div>
        <div className="flex-1 bg-red-600" style={{ height: '2px' }}></div>
      </div>
      {contacts.filter(c => c.name && c.phone).length > 0 ? (
        <div 
          className="grid grid-cols-2 flex-1"
          style={{ gap: '16px' }}
        >
          {contacts.filter(c => c.name && c.phone).slice(0, 2).map((contact, i) => (
            <div key={i} className="min-w-0" style={{ lineHeight: '1.1' }}>
              <div 
                className="text-gray-600 truncate"
                style={{ 
                  fontSize: '12px',
                  marginBottom: '4px'
                }}
              >
                {contact.relationship || 'Контакт'}:
              </div>
              <div 
                className="font-semibold text-gray-900 truncate"
                style={{ 
                  fontSize: '14px',
                  marginBottom: '0'
                }}
              >
                {contact.name}
              </div>
              <div 
                className="text-gray-900 font-bold truncate"
                style={{ fontSize: '16px' }}
              >
                {contact.phone}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div 
          className="text-gray-500 italic"
          style={{ fontSize: '14px' }}
        >
          Контакты не добавлены
        </div>
      )}
    </div>
  )
}
