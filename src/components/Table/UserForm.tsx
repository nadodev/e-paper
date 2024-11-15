"use client"
import { useState, type FormEvent, type ChangeEvent, useEffect } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { api } from '@/lib/api/client'
import type { CreateUserInput, User } from '@/lib/api/contract'

interface UserFormProps {
  initialData?: User | null
  onClose: () => void
  onSuccess: () => void
}

export function UserForm({ initialData, onClose, onSuccess }: UserFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateUserInput>({
    nome: '',
    email: '',
    status: 'ativo'
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        nome: initialData.nome,
        email: initialData.email,
        status: initialData.status
      })
    }
  }, [initialData])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let response;
      if (initialData) {
        response = await api.updateUser({
          params: { id: initialData.id },
          body: formData
        });
      } else {
        response = await api.createUser({
          body: formData
        });
      }

      if (response.status === 200 || response.status === 201) {
        onSuccess()
        onClose()
      } else {
        const errorMessage = response.body && typeof response.body === 'object' && 'error' in response.body
          ? String(response.body.error)
          : 'Erro ao salvar usuário';
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Erro ao salvar usuário:', error)
      setError('Erro ao salvar usuário')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">
          {initialData ? 'Editar Usuário' : 'Novo Usuário'}
        </h2>
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded-md mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <Input
              name="nome"
              required
              value={formData.nome}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              className="w-full rounded-md border p-2"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 