"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Filter, Download, Search } from "lucide-react"
import { DataImport } from "@/components/data-import"
import type { Transaction } from "@/types/transaction"

interface TransactionFiltersProps {
  transactions: Transaction[]
  onFilter: (filtered: Transaction[]) => void
  onImport: (transactions: Omit<Transaction, "id">[]) => void
  onClearData: () => void
}

export function TransactionFilters({ transactions, onFilter, onImport, onClearData }: TransactionFiltersProps) {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    category: "",
    type: "",
    description: "",
    period: "all", // Nova opção para período geral
  })

  const [showFilters, setShowFilters] = useState(false)

  const categories = Array.from(new Set(transactions.map((t) => t.category))).sort()

  // Opções de período
  const periodOptions = [
    { value: "all", label: "Geral (Todos)" },
    { value: "current-month", label: "Mês Atual" },
    { value: "current-year", label: "Ano Atual" },
    { value: "last-30-days", label: "Últimos 30 dias" },
    { value: "last-90-days", label: "Últimos 90 dias" },
    { value: "custom", label: "Período Personalizado" },
  ]

  useEffect(() => {
    let filtered = transactions

    // Filtro por período predefinido
    if (filters.period !== "all" && filters.period !== "custom") {
      const now = new Date()
      let startDate: Date
      const endDate: Date = now

      switch (filters.period) {
        case "current-month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case "current-year":
          startDate = new Date(now.getFullYear(), 0, 1)
          break
        case "last-30-days":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case "last-90-days":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          break
        default:
          startDate = new Date(0)
      }

      filtered = filtered.filter((t) => {
        const transactionDate = new Date(t.date)
        return transactionDate >= startDate && transactionDate <= endDate
      })
    }

    // Filtros personalizados (apenas se período for "custom" ou "all")
    if (filters.period === "custom" || filters.period === "all") {
      if (filters.startDate) {
        filtered = filtered.filter((t) => new Date(t.date) >= new Date(filters.startDate))
      }

      if (filters.endDate) {
        filtered = filtered.filter((t) => new Date(t.date) <= new Date(filters.endDate))
      }
    }

    if (filters.category && filters.category !== "all") {
      filtered = filtered.filter((t) => t.category === filters.category)
    }

    if (filters.type && filters.type !== "all") {
      filtered = filtered.filter((t) => t.type === filters.type)
    }

    if (filters.description) {
      filtered = filtered.filter((t) => t.description.toLowerCase().includes(filters.description.toLowerCase()))
    }

    onFilter(filtered)
  }, [filters, transactions, onFilter])

  const clearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      category: "",
      type: "",
      description: "",
      period: "all",
    })
  }

  const hasActiveFilters = Object.values(filters).some((value) => value !== "" && value !== "all")

  const exportToCSV = () => {
    const headers = ["Data", "Descrição", "Categoria", "Tipo", "Valor"]
    const csvContent = [
      headers.join(","),
      ...transactions.map((t) =>
        [
          new Date(t.date).toLocaleDateString("pt-BR"),
          `"${t.description}"`,
          t.category,
          t.type === "income" ? "Ganho" : "Gasto",
          t.amount.toFixed(2).replace(".", ","),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `transacoes_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className="shadow-lg border-0 dark:card-dark">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
              {hasActiveFilters && (
                <Badge
                  variant="secondary"
                  className="ml-2 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                >
                  {Object.values(filters).filter((v) => v !== "" && v !== "all").length}
                </Badge>
              )}
            </Button>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <X className="w-4 h-4 mr-2" />
                Limpar
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <DataImport onImport={onImport} onClearData={onClearData} currentTransactions={transactions} />
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              className="shadow-md hover:shadow-lg transition-all duration-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-400"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="space-y-4">
            {/* Filtro de Período */}
            <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/30 rounded-lg border dark:border-gray-700">
              <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Período</label>
              <Select
                value={filters.period}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, period: value }))}
              >
                <SelectTrigger className="shadow-sm dark:bg-gray-800 dark:border-gray-600">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtros Personalizados - apenas se período for "custom" ou "all" */}
            {(filters.period === "custom" || filters.period === "all") && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/30 rounded-lg border dark:border-gray-700">
                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">
                    Data Inicial
                  </label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                    className="shadow-sm dark:bg-gray-800 dark:border-gray-600"
                    disabled={filters.period !== "custom" && filters.period !== "all"}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Data Final</label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                    className="shadow-sm dark:bg-gray-800 dark:border-gray-600"
                    disabled={filters.period !== "custom" && filters.period !== "all"}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Categoria</label>
                  <Select
                    value={filters.category}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="shadow-sm dark:bg-gray-800 dark:border-gray-600">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Tipo</label>
                  <Select
                    value={filters.type}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger className="shadow-sm dark:bg-gray-800 dark:border-gray-600">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="income">Ganhos</SelectItem>
                      <SelectItem value="expense">Gastos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Descrição</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <Input
                      placeholder="Buscar..."
                      value={filters.description}
                      onChange={(e) => setFilters((prev) => ({ ...prev, description: e.target.value }))}
                      className="pl-10 shadow-sm dark:bg-gray-800 dark:border-gray-600"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-4">
            {filters.period !== "all" && (
              <Badge
                variant="secondary"
                className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
              >
                Período: {periodOptions.find((p) => p.value === filters.period)?.label}
              </Badge>
            )}
            {filters.startDate && (filters.period === "custom" || filters.period === "all") && (
              <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                De: {new Date(filters.startDate).toLocaleDateString("pt-BR")}
              </Badge>
            )}
            {filters.endDate && (filters.period === "custom" || filters.period === "all") && (
              <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                Até: {new Date(filters.endDate).toLocaleDateString("pt-BR")}
              </Badge>
            )}
            {filters.category && filters.category !== "all" && (
              <Badge
                variant="secondary"
                className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"
              >
                Categoria: {filters.category}
              </Badge>
            )}
            {filters.type && filters.type !== "all" && (
              <Badge
                variant="secondary"
                className="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300"
              >
                Tipo: {filters.type === "income" ? "Ganhos" : "Gastos"}
              </Badge>
            )}
            {filters.description && (
              <Badge
                variant="secondary"
                className="bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300"
              >
                Busca: {filters.description}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
