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
  initialFilters?: FilterValues
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

export function DocumentFilters({ users, onFilter, onClear, initialFilters }: DocumentFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterValues>(initialFilters || {})
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
              <label className="block mb-1 text-sm font-medium">Período de Criação</label>
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
              <label className="block mb-1 text-sm font-medium">Valor Total Tributos</label>
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
              <label className="block mb-1 text-sm font-medium">Valor Líquido</label>
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

            <div className="flex justify-end pt-4 space-x-2 border-t">
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