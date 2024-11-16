"use client"
import { useState } from 'react'
import { Document, User } from '@/lib/api/contract'
import { Input } from '../ui/input'
import { DocumentFilters } from './DocumentFilters'
import { DocumentActions } from './DocumentActions'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { FileText } from 'lucide-react'
import { Button } from '../ui/button'

interface FilterValues {
  emitente?: string;
  dateStart?: string;
  dateEnd?: string;
  valorTotalMin?: number;
  valorTotalMax?: number;
  valorLiquidoMin?: number;
  valorLiquidoMax?: number;
}

interface DocumentTableProps {
  onEdit: (document: Document) => void
  onDelete: (id: string) => Promise<void>
  documents: Document[]
  users: User[]
}

export function DocumentTable({ onEdit, onDelete, documents, users }: DocumentTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [sortField, setSortField] = useState<string>('codigo')
  const [filters, setFilters] = useState<FilterValues>({})
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());

  const handleSort = (field: string) => {
    const newSortOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc'
    setSortField(field)
    setSortOrder(newSortOrder)
  }

  const handleFilter = (newFilters: FilterValues) => {
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    setFilters({})
  }

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allIds = new Set(documents.map(doc => doc.id));
      setSelectedDocuments(allIds);
    } else {
      setSelectedDocuments(new Set());
    }
  }

  const handleSelectDocument = (id: string) => {
    const newSelectedDocuments = new Set(selectedDocuments);
    if (newSelectedDocuments.has(id)) {
      newSelectedDocuments.delete(id);
    } else {
      newSelectedDocuments.add(id);
    }
    setSelectedDocuments(newSelectedDocuments);
  }

  const handleDeleteSelected = async () => {
    for (const id of Array.from(selectedDocuments)) {
      await onDelete(id);
    }
    setSelectedDocuments(new Set());
  }

  // Filtragem e ordenação dos documentos
  const filteredDocuments = documents.filter(doc => {
    const matchesSearchTerm = doc.codigo.includes(searchTerm) || doc.emitente.includes(searchTerm);
    const matchesEmitente = filters.emitente ? doc.emitente === filters.emitente : true;
    const matchesDateStart = filters.dateStart ? new Date(doc.data_criacao) >= new Date(filters.dateStart) : true;
    const matchesDateEnd = filters.dateEnd ? new Date(doc.data_criacao) <= new Date(filters.dateEnd) : true;
    const matchesValorTotalMin = filters.valorTotalMin ? doc.valor_total_tributos >= filters.valorTotalMin : true;
    const matchesValorTotalMax = filters.valorTotalMax ? doc.valor_total_tributos <= filters.valorTotalMax : true;
    const matchesValorLiquidoMin = filters.valorLiquidoMin ? doc.valor_liquido >= filters.valorLiquidoMin : true;
    const matchesValorLiquidoMax = filters.valorLiquidoMax ? doc.valor_liquido <= filters.valorLiquidoMax : true;

    return matchesSearchTerm && matchesEmitente && matchesDateStart && matchesDateEnd &&
           matchesValorTotalMin && matchesValorTotalMax && matchesValorLiquidoMin && matchesValorLiquidoMax;
  }).sort((a, b) => {
    const aValue = a[sortField as keyof Document] ?? ''
    const bValue = b[sortField as keyof Document] ?? ''

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  // Função para formatar a data
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(date))
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Buscar por código ou emitente..."
          className="w-full sm:max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <DocumentFilters
          users={users}
          onFilter={handleFilter}
          onClear={handleClearFilters}
          initialFilters={filters}
        />
        {selectedDocuments.size > 0 && ( // Mostrar botão de exclusão apenas se houver documentos selecionados
          <Button onClick={handleDeleteSelected} disabled={selectedDocuments.size === 0}>
            Excluir Selecionados ({selectedDocuments.size}) {/* Exibir a quantidade de selecionados */}
          </Button>
        )}
      </div>

      <div className="w-full border rounded-md overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <input type="checkbox" onChange={handleSelectAll} />
              </TableHead>
              <TableHead onClick={() => handleSort('codigo')} className="cursor-pointer">
                Código {sortField === 'codigo' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </TableHead>
              <TableHead onClick={() => handleSort('emitente')} className="cursor-pointer">
                Emitente {sortField === 'emitente' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </TableHead>
              <TableHead onClick={() => handleSort('valor_total_tributos')} className="cursor-pointer">
                Valor Total {sortField === 'valor_total_tributos' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </TableHead>
              <TableHead onClick={() => handleSort('valor_liquido')} className="cursor-pointer">
                Valor Líquido {sortField === 'valor_liquido' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </TableHead>
              <TableHead onClick={() => handleSort('data_criacao')} className="cursor-pointer">
                Data Criação {sortField === 'data_criacao' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <input 
                    type="checkbox" 
                    checked={selectedDocuments.has(item.id)} 
                    onChange={() => handleSelectDocument(item.id)} 
                  />
                </TableCell>
                <TableCell className="flex items-center">
                  <FileText className="mr-2" color="#079942" />
                  {item.codigo}
                </TableCell>
                <TableCell>{item.emitente}</TableCell>
                <TableCell>{item.valor_total_tributos}</TableCell>
                <TableCell>{item.valor_liquido}</TableCell>
                <TableCell>{formatDate(item.data_criacao)}</TableCell>
                <TableCell>
                  <DocumentActions
                    document={item}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 