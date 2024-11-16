"use client"
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { DocumentTable } from '@/components/Table/DocumentTable'
import { DocumentForm } from '@/components/Table/DocumentForm'
import { Button } from '@/components/ui/button'
import type { Document, User } from '@/lib/api/contract'
import { Plus } from 'lucide-react'
import { api } from '@/lib/api/client'

export default function DocumentsPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingDocument, setEditingDocument] = useState<Document | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [users, setUsers] = useState<User[]>([])

  const fetchDocuments = async () => {
    try {
      const response = await api.getDocuments();
      if (response.status === 200) {
        setDocuments(response.body);
      }
    } catch (error) {
      console.error('Erro ao buscar documentos:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await api.getUsers();
      if (response.status === 200) {
        setUsers(response.body);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
    }
  }

  useEffect(() => {
    fetchDocuments()
    fetchUsers()
  }, [])

  const handleEdit = (document: Document) => {
    setEditingDocument(document)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await api.deleteDocument({ params: { id } });
      fetchDocuments();
    } catch (error) {
      console.error('Erro ao deletar documento:', error);
    }
  }

  const handleSuccess = () => {
    fetchDocuments();
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
            onDelete={handleDelete}
            documents={documents}
            users={users}
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