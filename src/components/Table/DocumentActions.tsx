"use client"
import { useState, useRef, useEffect } from 'react'
import { MoreHorizontal, Edit, Trash2, FileText } from 'lucide-react'
import { Button } from '../ui/button'
import type { Document } from '@/lib/api/contract'
import { cn } from '@/lib/utils'

interface DocumentActionsProps {
  document: Document
  onEdit: (document: Document) => void
  onDelete: (id: string) => void
  onView: (document: Document) => void
  isFirstRow?: boolean
}

export function DocumentActions({ 
  document, 
  onEdit, 
  onDelete, 
  onView, 
  isFirstRow = false 
}: DocumentActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

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
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 p-0"
      >
        <MoreHorizontal className="w-4 h-4" />
      </Button>

      {isOpen && (
        <>
          {/* Overlay para mobile */}
          <div className="fixed inset-0 z-50 bg-black/20 sm:hidden" onClick={() => setIsOpen(false)} />
          
          {/* Menu flutuante */}
          <div 
            className={cn(
              "absolute z-[100] w-48 bg-white border rounded-md shadow-lg",
              "-top-2 transform -translate-y-full",
              "sm:left-1/2 sm:-translate-x-1/2"
            )}
            style={{ 
            
                left: 0, 
                top: 50,
                transform: 'translate(-100%, -100%)'
            }}
          >
            <div className="p-1">
              <button
                onClick={() => {
                  onView(document)
                  setIsOpen(false)
                }}
                className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-gray-100"
              >
                <FileText className="w-4 h-4 mr-2" />
                Visualizar
              </button>
              <button
                onClick={() => {
                  onEdit(document)
                  setIsOpen(false)
                }}
                className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-gray-100"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </button>
              <button
                onClick={() => {
                  onDelete(document.id)
                  setIsOpen(false)
                }}
                className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
} 