import { Menu } from 'lucide-react'

interface HeaderProps {
  toggleSidebar: () => void
}

export default function Header({ toggleSidebar }: HeaderProps) {
  return (
    <header className="border-b bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-1.5 hover:bg-gray-100 lg:hidden"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center space-x-4">
          <span className="font-medium">Admin</span>
        </div>
      </div>
    </header>
  )
} 