"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, TrendingUp, TrendingDown, DollarSign, Calendar, BarChart3, Wallet, Target } from "lucide-react"
import { TransactionForm } from "@/components/transaction-form"
import { TransactionCalendar } from "@/components/transaction-calendar"
import { FinancialCharts } from "@/components/financial-charts"
import { TransactionFilters } from "@/components/transaction-filters"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTransactions } from "@/hooks/use-transactions"
import { formatCurrency } from "@/lib/utils"
import type { Transaction } from "@/types/transaction"

export default function Dashboard() {
  const { transactions, addTransaction, deleteTransaction, clearAllTransactions } = useTransactions()
  const [showForm, setShowForm] = useState(false)
  const [activeView, setActiveView] = useState<"dashboard" | "calendar" | "charts">("dashboard")
  const [filteredTransactions, setFilteredTransactions] = useState(transactions)

  useEffect(() => {
    setFilteredTransactions(transactions)
  }, [transactions])

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const currentMonthTransactions = filteredTransactions.filter((t) => {
    const date = new Date(t.date)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  })

  const totalIncome = currentMonthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = currentMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses

  const recentTransactions = filteredTransactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const handleImportTransactions = (importedTransactions: Omit<Transaction, "id">[]) => {
    importedTransactions.forEach((transaction) => {
      addTransaction(transaction)
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-gray-900 dark:to-slate-800 transition-all duration-500">
      <div className="container mx-auto p-6">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Controle Financeiro
              </h1>
              <p className="text-lg text-muted-foreground">Gerencie suas finanças pessoais com inteligência</p>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <ThemeToggle />
              <Button
                variant={activeView === "dashboard" ? "default" : "outline"}
                onClick={() => setActiveView("dashboard")}
                className="shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant={activeView === "calendar" ? "default" : "outline"}
                onClick={() => setActiveView("calendar")}
                className="shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Calendário
              </Button>
              <Button
                variant={activeView === "charts" ? "default" : "outline"}
                onClick={() => setActiveView("charts")}
                className="shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Gráficos
              </Button>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 dark:neon-green"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Nova Transação
              </Button>
            </div>
          </div>

          {/* Filters */}
          <TransactionFilters
            transactions={transactions}
            onFilter={setFilteredTransactions}
            onImport={handleImportTransactions}
            onClearData={clearAllTransactions}
          />

          {/* Dashboard View */}
          {activeView === "dashboard" && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0 dark:card-dark dark:neon-green">
                  <div className="absolute inset-0 income-gradient opacity-10 dark:opacity-20"></div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Ganhos do Mês
                    </CardTitle>
                    <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
                      <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(totalIncome)}
                    </div>
                    <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">
                      {currentMonthTransactions.filter((t) => t.type === "income").length} transações
                    </p>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0 dark:card-dark dark:neon-red">
                  <div className="absolute inset-0 expense-gradient opacity-10 dark:opacity-20"></div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Gastos do Mês
                    </CardTitle>
                    <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-full">
                      <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(totalExpenses)}
                    </div>
                    <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-1">
                      {currentMonthTransactions.filter((t) => t.type === "expense").length} transações
                    </p>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0 dark:card-dark dark:neon-blue">
                  <div className="absolute inset-0 balance-gradient opacity-10 dark:opacity-20"></div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Saldo Atual</CardTitle>
                    <div
                      className={`p-2 rounded-full ${balance >= 0 ? "bg-blue-100 dark:bg-blue-900/50" : "bg-orange-100 dark:bg-orange-900/50"}`}
                    >
                      <DollarSign
                        className={`h-5 w-5 ${balance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-orange-600 dark:text-orange-400"}`}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div
                      className={`text-3xl font-bold ${balance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-orange-600 dark:text-orange-400"}`}
                    >
                      {formatCurrency(balance)}
                    </div>
                    <p
                      className={`text-xs mt-1 ${balance >= 0 ? "text-blue-600/70 dark:text-blue-400/70" : "text-orange-600/70 dark:text-orange-400/70"}`}
                    >
                      {balance >= 0 ? "Saldo positivo" : "Saldo negativo"}
                    </p>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0 dark:card-dark dark:neon-purple">
                  <div className="absolute inset-0 gradient-bg opacity-10 dark:opacity-20"></div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Total de Transações
                    </CardTitle>
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-full">
                      <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {currentMonthTransactions.length}
                    </div>
                    <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">Este mês</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Transactions */}
              <Card className="shadow-lg border-0 dark:card-dark">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-t-lg">
                  <CardTitle className="text-xl font-semibold">Transações Recentes</CardTitle>
                  <CardDescription>Suas últimas 5 transações registradas</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {recentTransactions.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                          <Wallet className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-muted-foreground text-lg">Nenhuma transação encontrada</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Adicione sua primeira transação para começar
                        </p>
                      </div>
                    ) : (
                      recentTransactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl hover:shadow-md dark:card-hover-dark transition-all duration-300"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-3 h-3 rounded-full ${transaction.type === "income" ? "bg-green-500" : "bg-red-500"}`}
                              ></div>
                              <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                                {transaction.description}
                              </h4>
                              <Badge
                                variant="outline"
                                className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600"
                              >
                                {transaction.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 ml-6">
                              {new Date(transaction.date).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          <div
                            className={`font-bold text-lg ${transaction.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                          >
                            {transaction.type === "income" ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Calendar View */}
          {activeView === "calendar" && <TransactionCalendar transactions={filteredTransactions} />}

          {/* Charts View */}
          {activeView === "charts" && <FinancialCharts transactions={filteredTransactions} />}
        </div>
      </div>

      {/* Transaction Form Modal */}
      <TransactionForm
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={(transaction) => {
          addTransaction(transaction)
          setShowForm(false)
        }}
      />
    </div>
  )
}
