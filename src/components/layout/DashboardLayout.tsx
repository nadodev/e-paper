"use client"
import { useState, useEffect, type ReactNode } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Fechar sidebar automaticamente em mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) { // 1024px é o breakpoint lg do Tailwind
        setSidebarOpen(false)
      }
    }

    // Verificar tamanho inicial
    handleResize()

    // Adicionar listener para mudanças de tamanho
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} ml-0`}>
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 