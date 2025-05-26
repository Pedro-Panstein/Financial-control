"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Calendar, TrendingUp, TrendingDown, DollarSign, Tag, Clock, Plus, Minus } from "lucide-react"
import type { Transaction } from "@/types/transaction"
import { formatCurrency } from "@/lib/utils"

interface DayDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: Date | null
  transactions: Transaction[]
}

export function DayDetailsModal({ open, onOpenChange, date, transactions }: DayDetailsModalProps) {
  if (!date) return null

  const dayTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date + "T12:00:00")
    return (
      transactionDate.getDate() === date.getDate() &&
      transactionDate.getMonth() === date.getMonth() &&
      transactionDate.getFullYear() === date.getFullYear()
    )
  })

  const income = dayTransactions.filter((t) => t.type === "income")
  const expenses = dayTransactions.filter((t) => t.type === "expense")

  const totalIncome = income.reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpenses

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const isToday = new Date().toDateString() === date.toDateString()

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      Lazer: "🎮",
      Estudo: "📚",
      Comida: "🍽️",
      Transporte: "🚗",
      Namoro: "💕",
      Saúde: "🏥",
      Casa: "🏠",
      Trabalho: "💼",
      Investimentos: "📈",
      Outros: "📦",
    }
    return icons[category] || "📦"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div
              className={`p-2 rounded-full ${isToday ? "bg-blue-100 dark:bg-blue-900/50" : "bg-gray-100 dark:bg-gray-800"}`}
            >
              <Calendar
                className={`w-5 h-5 ${isToday ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}`}
              />
            </div>
            <div>
              <div className="capitalize text-lg font-semibold">
                {formatDate(date)}
                {isToday && (
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                  >
                    Hoje
                  </Badge>
                )}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {dayTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Nenhuma transação</h3>
              <p className="text-muted-foreground">Não há transações registradas para este dia.</p>
            </div>
          ) : (
            <>
              {/* Resumo do Dia */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-0 shadow-md dark:card-dark">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
                          <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Ganhos</p>
                          <p className="text-lg font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(totalIncome)}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800"
                      >
                        {income.length}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md dark:card-dark">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-full">
                          <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Gastos</p>
                          <p className="text-lg font-bold text-red-600 dark:text-red-400">
                            {formatCurrency(totalExpenses)}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800"
                      >
                        {expenses.length}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md dark:card-dark">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-2 rounded-full ${balance >= 0 ? "bg-blue-100 dark:bg-blue-900/50" : "bg-orange-100 dark:bg-orange-900/50"}`}
                        >
                          <DollarSign
                            className={`w-4 h-4 ${balance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-orange-600 dark:text-orange-400"}`}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Saldo</p>
                          <p
                            className={`text-lg font-bold ${balance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-orange-600 dark:text-orange-400"}`}
                          >
                            {formatCurrency(balance)}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${balance >= 0 ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800" : "bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800"}`}
                      >
                        {balance >= 0 ? "+" : "-"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Lista de Transações */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <h3 className="text-lg font-semibold">Transações do Dia</h3>
                  <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800">
                    {dayTransactions.length} {dayTransactions.length === 1 ? "transação" : "transações"}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {/* Ganhos */}
                  {income.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                        <Plus className="w-4 h-4" />
                        Ganhos ({income.length})
                      </div>
                      {income.map((transaction) => (
                        <Card key={transaction.id} className="border-l-4 border-l-green-500 shadow-sm dark:card-dark">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="text-2xl">{getCategoryIcon(transaction.category)}</div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                                    {transaction.description}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Tag className="w-3 h-3 text-gray-400" />
                                    <span className="text-sm text-muted-foreground">{transaction.category}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                  +{formatCurrency(transaction.amount)}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Separador */}
                  {income.length > 0 && expenses.length > 0 && <Separator />}

                  {/* Gastos */}
                  {expenses.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400">
                        <Minus className="w-4 h-4" />
                        Gastos ({expenses.length})
                      </div>
                      {expenses.map((transaction) => (
                        <Card key={transaction.id} className="border-l-4 border-l-red-500 shadow-sm dark:card-dark">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="text-2xl">{getCategoryIcon(transaction.category)}</div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                                    {transaction.description}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Tag className="w-3 h-3 text-gray-400" />
                                    <span className="text-sm text-muted-foreground">{transaction.category}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-red-600 dark:text-red-400">
                                  -{formatCurrency(transaction.amount)}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Estatísticas Adicionais */}
              {dayTransactions.length > 1 && (
                <Card className="border-0 shadow-md dark:card-dark bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/30">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Estatísticas do Dia
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Maior Ganho</p>
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          {income.length > 0 ? formatCurrency(Math.max(...income.map((t) => t.amount))) : "R$ 0,00"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Maior Gasto</p>
                        <p className="font-semibold text-red-600 dark:text-red-400">
                          {expenses.length > 0 ? formatCurrency(Math.max(...expenses.map((t) => t.amount))) : "R$ 0,00"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Ticket Médio</p>
                        <p className="font-semibold text-blue-600 dark:text-blue-400">
                          {formatCurrency((totalIncome + totalExpenses) / dayTransactions.length)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Categorias</p>
                        <p className="font-semibold text-purple-600 dark:text-purple-400">
                          {new Set(dayTransactions.map((t) => t.category)).size}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Botão de Fechar */}
          <div className="flex justify-end pt-4">
            <Button onClick={() => onOpenChange(false)} variant="outline">
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
