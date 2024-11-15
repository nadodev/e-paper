"use client"
import { useState, useEffect, type FormEvent } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { api } from '@/lib/api/client'
import type { CreateDocumentInput, Document, User } from '@/lib/api/contract'
import { formatCurrency, parseCurrency } from '@/lib/utils/format'
import { FileText, X } from 'lucide-react'
import { toast } from 'sonner'

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
    // Remove formataç��o para armazenar o valor numérico
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

  const handleArquivoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo de arquivo
      const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png']
      if (!tiposPermitidos.includes(file.type)) {
        setError('Tipo de arquivo não permitido. Use PDF, JPEG ou PNG.')
        return
      }
      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Arquivo muito grande. Tamanho máximo: 5MB')
        return
      }

      try {
        setLoading(true)
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Erro ao fazer upload do arquivo')
        }

        const data = await response.json()
        setFormData(prev => ({
          ...prev,
          arquivo_url: data.url
        }))
        setError(null)
      } catch (error) {
        console.error('Erro ao fazer upload:', error)
        setError('Erro ao fazer upload do arquivo')
      } finally {
        setLoading(false)
      }
    }
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
        toast.success(initialData ? 'Documento atualizado com sucesso!' : 'Documento criado com sucesso!')
        onSuccess()
        onClose()
      } else {
        const errorMessage = response.body && typeof response.body === 'object' && 'error' in response.body
          ? String(response.body.error)
          : 'Erro ao salvar documento';
        toast.error(errorMessage)
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Erro ao salvar documento:', error)
      toast.error('Erro ao salvar documento')
      setError('Erro ao salvar documento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg">
        <h2 className="mb-4 text-lg font-bold">
          {initialData ? 'Editar Documento' : 'Novo Documento'}
        </h2>
        {error && (
          <div className="p-2 mb-4 text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Código</label>
            <Input
              required
              value={formData.codigo}
              readOnly
              className="bg-gray-50"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Emitente</label>
            <select
              required
              className="w-full p-2 border rounded-md"
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
            <label className="block mb-1 text-sm font-medium">Valor Total Tributos</label>
            <Input
              required
              value={valoresFormatados.valor_total_tributos}
              onChange={(e) => handleValorChange('valor_total_tributos', e.target.value)}
              placeholder="R$ 0,00"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Valor Líquido</label>
            <Input
              required
              value={valoresFormatados.valor_liquido}
              onChange={(e) => handleValorChange('valor_liquido', e.target.value)}
              placeholder="R$ 0,00"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Arquivo</label>
            <div className="space-y-2">
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleArquivoChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              {formData.arquivo_url && (
                <div className="flex items-center justify-between p-2 rounded-md bg-gray-50">
                  <a
                    href={formData.arquivo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Ver arquivo
                  </a>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, arquivo_url: null }))}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-500">
                Formatos aceitos: PDF, JPEG, PNG. Tamanho máximo: 5MB
              </p>
            </div>
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