"use client"
import { useState, useCallback } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { DocumentTable } from '@/components/Table/DocumentTable'
import { DocumentForm } from '@/components/Table/DocumentForm'
import { Button } from '@/components/ui/button'
import type { Document } from '@/lib/api/contract'

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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Documentos</h1>
          <Button onClick={() => setShowForm(true)}>
            Adicionar Documento
          </Button>
        </div>

        <div className="p-6 bg-white rounded-lg border">
          <DocumentTable
            onEdit={handleEdit}
            key={refreshTrigger}
          />
        </div>
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