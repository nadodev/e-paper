"use client"
import { useState, useEffect } from 'react'
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

interface DocumentTableProps {
  onEdit: (document: Document) => void
}

const ITEMS_PER_PAGE = 3;

export function DocumentTable({ onEdit }: DocumentTableProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [filters, setFilters] = useState<FilterValues>({})

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
        await fetchDocuments()
        setSelectedDocuments(new Set())
      }
    } catch (error) {
      console.error('Erro ao excluir documento:', error)
      alert('Erro ao excluir documento')
    }
  }

  const handleDeleteSelected = async () => {
    if (!confirm(`Tem certeza que deseja excluir ${selectedDocuments.size} documento(s)?`)) return

    try {
      const deletePromises = Array.from(selectedDocuments).map(id =>
        api.deleteDocument({ params: { id } })
      )
      await Promise.all(deletePromises)
      await fetchDocuments()
      setSelectedDocuments(new Set())
    } catch (error) {
      console.error('Erro ao excluir documentos:', error)
      alert('Erro ao excluir documentos')
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
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
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Buscar por código ou emitente..."
            className="max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <DocumentFilters
            users={users}
            onFilter={setFilters}
            onClear={() => setFilters({})}
          />
          {selectedDocuments.size > 0 && (
            <Button 
              variant="outline"
              onClick={handleDeleteSelected}
              className="whitespace-nowrap bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200"
            >
              Excluir Selecionados ({selectedDocuments.size})
            </Button>
          )}
        </div>
      </div>

      <div className="w-full rounded-md border">
        <div className="overflow-x-auto w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <input
                    type="checkbox"
                    checked={selectedDocuments.size === filteredData.length && filteredData.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300"
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
                      className="rounded border-gray-300"
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

      <div className="flex justify-between items-center">
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
        <div className="py-10 w-full text-center">
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
                    className="mt-1 inline-flex items-center text-blue-600 hover:text-blue-700"
                  >
                    <FileText className="mr-1 h-4 w-4" />
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