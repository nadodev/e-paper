"use client"
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import DataTable from '@/components/Table/DataTable'
import { api } from '@/lib/api/client'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total: 0,
    ativos: 0
  })

  const fetchStats = async () => {
    try {
      const response = await api.getUsers();
      if (response.status === 200) {
        const users = response.body;
        setStats({
          total: users.length,
          ativos: users.filter(user => user.status === 'ativo').length
        });
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>

        {/* Cards de resumo */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Total de Usuários</h3>
            <p className="mt-2 text-3xl font-bold">{stats.total}</p>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Usuários Ativos</h3>
            <p className="mt-2 text-3xl font-bold">{stats.ativos}</p>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Usuários Inativos</h3>
            <p className="mt-2 text-3xl font-bold">{stats.total - stats.ativos}</p>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Taxa de Ativação</h3>
            <p className="mt-2 text-3xl font-bold">
              {stats.total > 0 ? Math.round((stats.ativos / stats.total) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Tabela de dados */}
        <div className="rounded-lg border bg-white p-6">
          <DataTable />
        </div>
      </div>
    </DashboardLayout>
  )
} 