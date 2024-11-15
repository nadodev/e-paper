"use client"
import { useState, useEffect, type FormEvent } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { api } from '@/lib/api/client'
import type { CreateDocumentInput, Document, User } from '@/lib/api/contract'
import { formatCurrency, parseCurrency } from '@/lib/utils/format'
import { FileText, X } from 'lucide-react'
import { FileUpload } from '../ui/FileUpload'

interface DocumentFormProps {
  initialData?: Document | null
  onClose: () => void
  onSuccess: () => void
}

export function DocumentForm({ initialData, onClose, onSuccess }: DocumentFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [formData, setFormData] = useState<CreateDocumentInput>({
    codigo: generateCode(),
    emitente: '',
    valor_total_tributos: 0,
    valor_liquido: 0,
    arquivo_url: null,
  })
  const [valoresFormatados, setValoresFormatados] = useState({
    valor_total_tributos: 'R$ 0,00',
    valor_liquido: 'R$ 0,00',
  })

  // Função para gerar código automático
  function generateCode() {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `DOC${year}${month}${day}${random}`
  }

  // Buscar usuários para o select de emitente
  useEffect(() => {
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
    fetchUsers()
  }, [])

  useEffect(() => {
    if (initialData) {
      setFormData({
        codigo: initialData.codigo,
        emitente: initialData.emitente,
        valor_total_tributos: Number(initialData.valor_total_tributos),
        valor_liquido: Number(initialData.valor_liquido),
        arquivo_url: initialData.arquivo_url,
      })
      setValoresFormatados({
        valor_total_tributos: formatCurrency(Number(initialData.valor_total_tributos)),
        valor_liquido: formatCurrency(Number(initialData.valor_liquido)),
      })
    }
  }, [initialData])

  const handleValorChange = (campo: 'valor_total_tributos' | 'valor_liquido', valor: string) => {
    // Remove formataço para armazenar o valor numérico
    const numeroLimpo = parseCurrency(valor)
    
    setFormData(prev => ({
      ...prev,
      [campo]: numeroLimpo,
    }))

    // Mantém a formatação para exibição
    setValoresFormatados(prev => ({
      ...prev,
      [campo]: formatCurrency(numeroLimpo),
    }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const dataToSend = {
        ...formData,
        arquivo_url: formData.arquivo_url || null,
      }

      let response;
      if (initialData) {
        response = await api.updateDocument({
          params: { id: initialData.id },
          body: dataToSend
        });
      } else {
        response = await api.createDocument({
          body: dataToSend
        });
      }

      if (response.status === 200 || response.status === 201) {
        onSuccess()
        onClose()
      } else {
        const errorMessage = response.body && typeof response.body === 'object' && 'error' in response.body
          ? String(response.body.error)
          : 'Erro ao salvar documento';
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Erro ao salvar documento:', error)
      setError('Erro ao salvar documento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">
          {initialData ? 'Editar Documento' : 'Novo Documento'}
        </h2>
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded-md mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Código</label>
            <Input
              required
              value={formData.codigo}
              readOnly
              className="bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Emitente</label>
            <select
              required
              className="w-full rounded-md border p-2"
              value={formData.emitente}
              onChange={(e) => setFormData(prev => ({ ...prev, emitente: e.target.value }))}
            >
              <option value="">Selecione um emitente</option>
              {users.map((user) => (
                <option key={user.id} value={user.nome}>
                  {user.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Valor Total Tributos</label>
            <Input
              required
              value={valoresFormatados.valor_total_tributos}
              onChange={(e) => handleValorChange('valor_total_tributos', e.target.value)}
              placeholder="R$ 0,00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Valor Líquido</label>
            <Input
              required
              value={valoresFormatados.valor_liquido}
              onChange={(e) => handleValorChange('valor_liquido', e.target.value)}
              placeholder="R$ 0,00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Arquivo</label>
            <FileUpload
              value={formData.arquivo_url}
              onChange={(url) => setFormData(prev => ({ ...prev, arquivo_url: url }))}
              onError={setError}
              loading={loading}
            />
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