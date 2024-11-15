"use client"
import { useState, useRef, useEffect } from 'react'
import { MoreVertical, Edit, Trash2, FileText } from 'lucide-react'
import { Button } from '../ui/button'
import type { Document } from '@/lib/api/contract'

interface DocumentActionsProps {
  document: Document
  onEdit: (document: Document) => void
  onDelete: (id: string) => void
  onView: (document: Document) => void
}

export function DocumentActions({ document, onEdit, onDelete, onView }: DocumentActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

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
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 p-0"
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-md border bg-white shadow-lg">
          <div className="p-1">
            <button
              onClick={() => {
                onView(document)
                setIsOpen(false)
              }}
              className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-gray-100"
            >
              <FileText className="mr-2 h-4 w-4" />
              Visualizar
            </button>
            <button
              onClick={() => {
                onEdit(document)
                setIsOpen(false)
              }}
              className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-gray-100"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </button>
            <button
              onClick={() => {
                onDelete(document.id)
                setIsOpen(false)
              }}
              className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 