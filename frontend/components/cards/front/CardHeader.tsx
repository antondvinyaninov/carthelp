export default function CardHeader() {
  return (
    <div 
      className="bg-red-600 flex items-center justify-center flex-shrink-0"
      style={{ 
        padding: '8px 24px'
      }}
    >
      <span 
        className="font-bold uppercase tracking-wider text-white whitespace-nowrap"
        style={{ fontSize: '12px' }}
      >
        Карта экстренной помощи
      </span>
    </div>
  )
}
