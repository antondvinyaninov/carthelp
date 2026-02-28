import UserMenu from '@/components/UserMenu'
import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <Link href="/lk" className="text-xl sm:text-2xl font-bold text-gray-800 hover:text-red-600 transition">
              Карта Помощи
            </Link>
            <UserMenu />
          </div>
        </div>
      </header>
      {children}
    </div>
  )
}
