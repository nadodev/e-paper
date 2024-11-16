"use client"
import { useState, useRef, useEffect } from 'react'
import { LogOut, Settings } from 'lucide-react'

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Dados fictícios do usuário
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Administrador',
    avatar: 'JD' // Iniciais para o avatar
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    window.document.addEventListener('mousedown', handleClickOutside)
    return () => window.document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:opacity-80"
      >
        <div className="flex items-center justify-center w-8 h-8 text-white bg-blue-500 rounded-full">
          {user.avatar}
        </div>
        <span className="text-sm font-medium">{user.name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 w-64 mt-2 bg-white border rounded-md shadow-lg top-full">
          <div className="p-4 border-b">
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
            <p className="mt-1 text-xs text-gray-500">{user.role}</p>
          </div>
          <div className="p-1">
            <button
              onClick={() => {}}
              className="flex items-center w-full px-3 py-2 text-sm rounded-sm hover:bg-gray-100"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </button>
            <button
              onClick={() => {}}
              className="flex items-center w-full px-3 py-2 text-sm text-red-600 rounded-sm hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 