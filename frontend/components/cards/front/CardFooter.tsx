export default function CardFooter() {
  return (
    <div 
      className="flex items-stretch overflow-hidden"
      style={{ 
        height: '40px'
      }}
    >
      <div 
        className="flex-1 bg-white flex items-center"
        style={{ 
          paddingLeft: '24px',
          maxWidth: '30%'
        }}
      >
        <p 
          className="text-gray-600 leading-tight font-semibold"
          style={{ fontSize: '14px' }}
        >
          carthelp.ru
        </p>
      </div>
      <div 
        className="bg-red-600 flex items-center justify-between flex-1"
        style={{ 
          clipPath: 'polygon(5% 0, 100% 0, 100% 100%, 0 100%)',
          paddingLeft: '32px',
          paddingRight: '24px'
        }}
      >
        <p 
          className="text-white leading-tight font-semibold whitespace-nowrap"
          style={{ fontSize: '10px' }}
        >
          Телефон экстренных спасательных служб
        </p>
        <p 
          className="font-bold text-white leading-none"
          style={{ 
            fontSize: '30px',
            marginLeft: '16px'
          }}
        >
          112
        </p>
      </div>
    </div>
  )
}
