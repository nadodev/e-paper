"use client"
import { useState, useCallback } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { DocumentTable } from '@/components/Table/DocumentTable'
import { DocumentForm } from '@/components/Table/DocumentForm'
import { Button } from '@/components/ui/button'
import type { Document } from '@/lib/api/contract'
import { Plus } from 'lucide-react'

export default function DocumentsPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingDocument, setEditingDocument] = useState<Document | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleEdit = (document: Document) => {
    setEditingDocument(document)
    setShowForm(true)
  }

  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  const handleSuccess = () => {
    handleRefresh()
    setShowForm(false)
    setEditingDocument(null)
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between w-full pb-6 mx-auto border-b max-w-screen-2xl border-b-neutral-200">
          <div className='flex flex-col'>
            <h3 className="text-2xl font-bold text-neutral-700">Documentos</h3>
            <p className='text-sm text-neutral-500'>Crie, gerencie e visualize os documentos</p>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className='text-white bg-[#05C151] hover:bg-primary-600 py-[9.5px] text-sm font-medium gap-2 hidden md:flex' 
          >
            <Plus size={16} color='#fff'/>
            Novo documento
          </Button>
        </div>

        <div className="w-full pb-6 mx-auto bg-white border-0 rounded-lg max-w-screen-2xl pt-[47px]">
          <DocumentTable
            onEdit={handleEdit}
            key={refreshTrigger}
          />
        </div>

        <Button
          onClick={() => setShowForm(true)}
          className='fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg md:hidden flex items-center justify-center bg-[#05C151] hover:bg-primary-600'
        >
          <Plus size={24} color='#fff' />
        </Button>
      </div>

      {showForm && (
        <DocumentForm
          initialData={editingDocument}
          onClose={() => {
            setShowForm(false)
            setEditingDocument(null)
          }}
          onSuccess={handleSuccess}
        />
      )}
    </DashboardLayout>
  )
} 