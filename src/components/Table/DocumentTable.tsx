"use client"
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { api } from '@/lib/api/client'
import type { Document, User } from '@/lib/api/contract'
import { formatCurrency } from '@/lib/utils/format'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { DocumentActions } from './DocumentActions'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { FileText } from 'lucide-react'
import { DocumentFilters, type FilterValues } from './DocumentFilters'
import { toast } from 'sonner'

interface DocumentTableProps {
  onEdit: (document: Document) => void
}

const ITEMS_PER_PAGE = 3;

export function DocumentTable({ onEdit }: DocumentTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(() => {
    const page = searchParams.get('page')
    return page ? parseInt(page) : 1
  })
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [filters, setFilters] = useState<FilterValues>(() => ({
    dateStart: searchParams.get('dateStart') || undefined,
    dateEnd: searchParams.get('dateEnd') || undefined,
    emitente: searchParams.get('emitente') || undefined,
    valorTotalMin: searchParams.get('valorTotalMin') ? Number(searchParams.get('valorTotalMin')) : undefined,
    valorTotalMax: searchParams.get('valorTotalMax') ? Number(searchParams.get('valorTotalMax')) : undefined,
    valorLiquidoMin: searchParams.get('valorLiquidoMin') ? Number(searchParams.get('valorLiquidoMin')) : undefined,
    valorLiquidoMax: searchParams.get('valorLiquidoMax') ? Number(searchParams.get('valorLiquidoMax')) : undefined,
  }))

  const fetchDocuments = async () => {
    try {
      const response = await api.getDocuments();
      if (response.status === 200) {
        setDocuments(response.body);
      }
    } catch (error) {
      console.error('Erro ao buscar documentos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) return

    try {
      const response = await api.deleteDocument({ params: { id } });
      if (response.status === 200) {
        toast.success('Documento excluído com sucesso!')
        await fetchDocuments()
        setSelectedDocuments(new Set())
      }
    } catch (error) {
      console.error('Erro ao excluir documento:', error)
      toast.error('Erro ao excluir documento')
    }
  }

  const handleDeleteSelected = async () => {
    if (!confirm(`Tem certeza que deseja excluir ${selectedDocuments.size} documento(s)?`)) return

    try {
      const deletePromises = Array.from(selectedDocuments).map(id =>
        api.deleteDocument({ params: { id } })
      )
      await Promise.all(deletePromises)
      toast.success(`${selectedDocuments.size} documento(s) excluídos com sucesso!`)
      await fetchDocuments()
      setSelectedDocuments(new Set())
    } catch (error) {
      console.error('Erro ao excluir documentos:', error)
      toast.error('Erro ao excluir documentos')
    }
  }

  const toggleSelectAll = () => {
    if (selectedDocuments.size === filteredData.length) {
      setSelectedDocuments(new Set())
    } else {
      setSelectedDocuments(new Set(filteredData.map(doc => doc.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedDocuments)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedDocuments(newSelected)
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

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

  const filteredData = documents.filter((item) => {
    const matchesSearch = item.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.emitente.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesEmitente = !filters.emitente || item.emitente === filters.emitente
    
    const matchesDate = (!filters.dateStart || new Date(item.data_criacao) >= new Date(filters.dateStart)) &&
      (!filters.dateEnd || new Date(item.data_criacao) <= new Date(filters.dateEnd))
    
    const matchesValorTotal = (!filters.valorTotalMin || Number(item.valor_total_tributos) >= filters.valorTotalMin) &&
      (!filters.valorTotalMax || Number(item.valor_total_tributos) <= filters.valorTotalMax)
    
    const matchesValorLiquido = (!filters.valorLiquidoMin || Number(item.valor_liquido) >= filters.valorLiquidoMin) &&
      (!filters.valorLiquidoMax || Number(item.valor_liquido) <= filters.valorLiquidoMax)

    return matchesSearch && matchesEmitente && matchesDate && matchesValorTotal && matchesValorLiquido
  })

  // Cálculos para sumário
  const summary = {
    totalDocuments: filteredData.length,
    uniqueEmitentes: new Set(filteredData.map(doc => doc.emitente)).size,
    totalTributos: filteredData.reduce((sum, doc) => sum + Number(doc.valor_total_tributos), 0),
    totalLiquido: filteredData.reduce((sum, doc) => sum + Number(doc.valor_liquido), 0),
  }

  // Paginação
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // Função para atualizar a URL
  const updateQueryParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })

    // Remover parâmetros vazios
    Array.from(params.entries()).forEach(([key, value]) => {
      if (!value) params.delete(key)
    })

    router.push(`/documents?${params.toString()}`)
  }

  // Atualizar URL quando mudar a página
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    updateQueryParams({ page: page.toString() })
  }

  // Atualizar URL quando mudar a busca
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Resetar para primeira página
    updateQueryParams({ 
      search: value || null,
      page: null // Remover página ao fazer nova busca
    })
  }

  // Atualizar URL quando aplicar filtros
  const handleFilter = (newFilters: FilterValues) => {
    setFilters(newFilters)
    setCurrentPage(1) // Resetar para primeira página
    updateQueryParams({
      dateStart: newFilters.dateStart || null,
      dateEnd: newFilters.dateEnd || null,
      emitente: newFilters.emitente || null,
      valorTotalMin: newFilters.valorTotalMin?.toString() || null,
      valorTotalMax: newFilters.valorTotalMax?.toString() || null,
      valorLiquidoMin: newFilters.valorLiquidoMin?.toString() || null,
      valorLiquidoMax: newFilters.valorLiquidoMax?.toString() || null,
      page: null // Remover página ao aplicar filtros
    })
  }

  // Limpar filtros e URL
  const handleClearFilters = () => {
    setFilters({})
    setCurrentPage(1)
    router.push('/documents') // Remover todos os query params
  }

  const handleView = (document: Document) => {
    setViewingDocument(document)
  }

  if (isLoading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-end w-full gap-2">
          <Input
            placeholder="Buscar por código ou emitente..."
            className="max-w-sm"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <DocumentFilters
            users={users}
            onFilter={handleFilter}
            onClear={handleClearFilters}
            initialFilters={filters}
          />
          {selectedDocuments.size > 0 && (
            <Button 
              variant="outline"
              onClick={handleDeleteSelected}
              className="text-red-600 border-red-200 whitespace-nowrap bg-red-50 hover:bg-red-100 hover:text-red-700"
            >
              Excluir Selecionados ({selectedDocuments.size})
            </Button>
          )}
        </div>
      </div>

      <div className="w-full border rounded-md">
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <input
                    type="checkbox"
                    checked={selectedDocuments.size === filteredData.length && filteredData.length > 0}
                    onChange={toggleSelectAll}
                    className="border-gray-300 rounded"
                  />
                </TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Emitente</TableHead>
                <TableHead>Valor Total Tributos</TableHead>
                <TableHead>Valor Líquido</TableHead>
                <TableHead>Data Criação</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedDocuments.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="border-gray-300 rounded"
                    />
                  </TableCell>
                  <TableCell>{item.codigo}</TableCell>
                  <TableCell>{item.emitente}</TableCell>
                  <TableCell>{formatCurrency(Number(item.valor_total_tributos))}</TableCell>
                  <TableCell>{formatCurrency(Number(item.valor_liquido))}</TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat('pt-BR').format(new Date(item.data_criacao))}
                  </TableCell>
                  <TableCell>
                    <DocumentActions
                      document={item}
                      onEdit={onEdit}
                      onDelete={handleDelete}
                      onView={handleView}
                    />
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-medium bg-gray-50">
                <TableCell colSpan={2} className="text-right">
                  Total de Documentos: {summary.totalDocuments}
                </TableCell>
                <TableCell>
                  Emitentes: {summary.uniqueEmitentes}
                </TableCell>
                <TableCell>
                  {formatCurrency(summary.totalTributos)}
                </TableCell>
                <TableCell>
                  {formatCurrency(summary.totalLiquido)}
                </TableCell>
                <TableCell colSpan={2} />
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Mostrando {startIndex + 1} a {Math.min(startIndex + ITEMS_PER_PAGE, filteredData.length)} de {filteredData.length} resultados
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Próxima
          </Button>
        </div>
      </div>

      {filteredData.length === 0 && (
        <div className="w-full py-10 text-center">
          <p className="text-gray-500">Nenhum resultado encontrado</p>
        </div>
      )}

      <Dialog open={!!viewingDocument} onOpenChange={() => setViewingDocument(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Visualizar Documento</DialogTitle>
          </DialogHeader>
          {viewingDocument && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Código</label>
                <p className="mt-1">{viewingDocument.codigo}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Emitente</label>
                <p className="mt-1">{viewingDocument.emitente}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Valor Total Tributos</label>
                <p className="mt-1">{formatCurrency(Number(viewingDocument.valor_total_tributos))}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Valor Líquido</label>
                <p className="mt-1">{formatCurrency(Number(viewingDocument.valor_liquido))}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Data de Criação</label>
                <p className="mt-1">
                  {new Intl.DateTimeFormat('pt-BR').format(new Date(viewingDocument.data_criacao))}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Última Atualização</label>
                <p className="mt-1">
                  {new Intl.DateTimeFormat('pt-BR').format(new Date(viewingDocument.ultima_atualizacao))}
                </p>
              </div>
              {viewingDocument.arquivo_url != null && (
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">Arquivo</label>
                  <a
                    href={viewingDocument.arquivo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-1 text-blue-600 hover:text-blue-700"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Visualizar arquivo
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 