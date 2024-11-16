import { Menu } from 'lucide-react'
import { UserMenu } from './UserMenu'
import Image from 'next/image'

interface HeaderProps {
  toggleSidebar: () => void
}

export default function Header({ toggleSidebar }: HeaderProps) {
  return (
    <header className="px-6 py-4 bg-white border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-gray-100 lg:hidden"
          >
            <Menu size={24} />
          </button>
          <Image
            src="/logo.png"
            alt="Logo"
            width={120}
            height={32}
            className="hidden lg:block"
          />
        </div>
        
        <UserMenu />
      </div>
    </header>
  )
} 