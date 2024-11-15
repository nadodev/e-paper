"use client"
import { useState } from 'react'
import { Filter, X } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { formatCurrency, parseCurrency } from '@/lib/utils/format'
import type { User } from '@/lib/api/contract'

interface DocumentFiltersProps {
  users: User[]
  onFilter: (filters: FilterValues) => void
  onClear: () => void
}

export interface FilterValues {
  dateStart?: string
  dateEnd?: string
  emitente?: string
  valorTotalMin?: number
  valorTotalMax?: number
  valorLiquidoMin?: number
  valorLiquidoMax?: number
}

export function DocumentFilters({ users, onFilter, onClear }: DocumentFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterValues>({})
  const [formattedValues, setFormattedValues] = useState({
    valorTotalMin: 'R$ 0,00',
    valorTotalMax: 'R$ 0,00',
    valorLiquidoMin: 'R$ 0,00',
    valorLiquidoMax: 'R$ 0,00',
  })

  const handleValorChange = (campo: keyof typeof formattedValues, valor: string) => {
    const numeroLimpo = parseCurrency(valor)
    
    setFormattedValues(prev => ({
      ...prev,
      [campo]: formatCurrency(numeroLimpo),
    }))

    const filterKey = campo.replace('formatted', '') as keyof FilterValues
    setFilters(prev => ({
      ...prev,
      [filterKey]: numeroLimpo,
    }))
  }

  const handleApplyFilters = () => {
    onFilter(filters)
    setIsOpen(false)
  }

  const handleClearFilters = () => {
    setFilters({})
    setFormattedValues({
      valorTotalMin: 'R$ 0,00',
      valorTotalMax: 'R$ 0,00',
      valorLiquidoMin: 'R$ 0,00',
      valorLiquidoMax: 'R$ 0,00',
    })
    onClear()
    setIsOpen(false)
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="h-10 w-10 p-0"
      >
        <Filter className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-96 bg-white shadow-lg">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-medium">Filtros</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Período de Criação</label>
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
              <label className="block text-sm font-medium mb-1">Emitente</label>
              <select
                className="w-full rounded-md border p-2"
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
              <label className="block text-sm font-medium mb-1">Valor Total Tributos</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Mínimo"
                  value={formattedValues.valorTotalMin}
                  onChange={(e) => handleValorChange('valorTotalMin', e.target.value)}
                />
                <Input
                  placeholder="Máximo"
                  value={formattedValues.valorTotalMax}
                  onChange={(e) => handleValorChange('valorTotalMax', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Valor Líquido</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Mínimo"
                  value={formattedValues.valorLiquidoMin}
                  onChange={(e) => handleValorChange('valorLiquidoMin', e.target.value)}
                />
                <Input
                  placeholder="Máximo"
                  value={formattedValues.valorLiquidoMax}
                  onChange={(e) => handleValorChange('valorLiquidoMax', e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleClearFilters}
              >
                Limpar
              </Button>
              <Button
                onClick={handleApplyFilters}
              >
                Aplicar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 