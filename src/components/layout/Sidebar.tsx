import { Home, Users, Settings, Menu, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (value: boolean) => void
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/' },
    { icon: Users, label: 'Usuários', href: '/users' },
    { icon: FileText, label: 'Documentos', href: '/documents' },
    { icon: Settings, label: 'Configurações', href: '/settings' },
  ]

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-40 h-screen bg-white transition-all duration-300',
        isOpen ? 'w-64' : 'w-20'
      )}
    >
      <div className="flex justify-between items-center px-4 h-16 border-b">
        <h1 className={cn('font-bold', isOpen ? 'block' : 'hidden')}>
          Dashboard
        </h1>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-1.5 hover:bg-gray-100"
        >
          <Menu size={24} />
        </button>
      </div>

      <nav className="px-2 mt-4">
        {menuItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex items-center px-4 py-2 mb-1 rounded-lg hover:bg-gray-100"
          >
            <item.icon size={20} />
            <span className={cn('ml-3', isOpen ? 'block' : 'hidden')}>
              {item.label}
            </span>
          </a>
        ))}
      </nav>
    </aside>
  )
} 