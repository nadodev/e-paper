"use client"
import { useState, useEffect, type ChangeEvent } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { UserForm } from './UserForm'
import { api } from '@/lib/api/client'
import type { User } from '@/lib/api/contract'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'

export default function DataTable() {
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value)
  }

  const fetchUsers = async () => {
    try {
      const response = await api.getUsers();
      if (response.status === 200) {
        setUsers(response.body);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return

    try {
      const response = await api.deleteUser({ params: { id } });
      if (response.status === 200) {
        await fetchUsers()
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      alert('Erro ao excluir usuário')
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setEditingUser(null)
    setShowForm(false)
  }

  const handleSuccess = async () => {
    await fetchUsers()
    handleCloseForm()
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredData = users.filter((item) => {
    const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'todos' || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (isLoading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Input
            placeholder="Buscar..."
            className="min-w-[200px] sm:max-w-xs"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <select
            className="p-2 rounded-md border"
            value={statusFilter}
            onChange={handleStatusChange}
          >
            <option value="todos">Todos</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>
        <Button onClick={() => setShowForm(true)}>
          Adicionar Usuário
        </Button>
      </div>

      <div className="w-full rounded-md border">
        <div className="overflow-x-auto w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Nome</TableHead>
                <TableHead className="min-w-[200px]">Email</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[100px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.nome}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      item.status === 'ativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.status}
                    </span>
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(item)}
                    >
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Excluir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {filteredData.length === 0 && (
        <div className="py-10 w-full text-center">
          <p className="text-gray-500">Nenhum resultado encontrado</p>
        </div>
      )}

      {showForm && (
        <UserForm
          initialData={editingUser}
          onClose={handleCloseForm}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
} 