"use client"
import { useState } from 'react'
import { Filter, X } from 'lucide-react'
import { Button } from '../ui/button'
import type { User } from '@/lib/api/contract'
import { Input } from '../ui/input'

interface DocumentFiltersProps {
  users: User[]
  onFilter: (filters: FilterValues) => void
  onClear: () => void
  initialFilters: FilterValues
}

export interface FilterValues {
  emitente?: string
  dateStart?: string
  dateEnd?: string
  valorTotalMin?: number
  valorTotalMax?: number
  valorLiquidoMin?: number
  valorLiquidoMax?: number
}

export function DocumentFilters({ users, onFilter, onClear, initialFilters }: DocumentFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterValues>(initialFilters || {})

  const handleApplyFilters = () => {
    onFilter(filters)
    setIsOpen(false)
  }

  const handleClearFilters = () => {
    setFilters({})
    onClear()
    setIsOpen(false)
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-sm p-[9.5px] gap-2"
      >
        <Filter className="w-4 h-4" />
        Filtrar
      </Button>

      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 bg-white shadow-lg w-96">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-medium">Filtros</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium">Emitente</label>
              <select
                className="w-full p-2 border rounded-md"
                value={filters.emitente}
                onChange={(e) => setFilters(prev => ({ ...prev, emitente: e.target.value }))}
              >
                <option value="">Todos</option>
                {users.map((user) => (
                  <option key={user.id} value={user.nome}>
                    {user.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Data de Criação</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={filters.dateStart}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateStart: e.target.value }))}
                />
                <Input
                  type="date"
                  value={filters.dateEnd}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateEnd: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Valor Total</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Mínimo"
                  value={filters.valorTotalMin?.toString() || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, valorTotalMin: Number(e.target.value) }))}
                />
                <Input
                  placeholder="Máximo"
                  value={filters.valorTotalMax?.toString() || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, valorTotalMax: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Valor Líquido</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Mínimo"
                  value={filters.valorLiquidoMin?.toString() || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, valorLiquidoMin: Number(e.target.value) }))}
                />
                <Input
                  placeholder="Máximo"
                  value={filters.valorLiquidoMax?.toString() || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, valorLiquidoMax: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleClearFilters} variant="outline" className="mr-2">
                Limpar
              </Button>
              <Button onClick={handleApplyFilters}>
                Aplicar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 