"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import { DayDetailsModal } from "@/components/day-details-modal"
import type { Transaction } from "@/types/transaction"
import { formatCurrency } from "@/lib/utils"

interface TransactionCalendarProps {
  transactions: Transaction[]
}

export function TransactionCalendar({ transactions }: TransactionCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showModal, setShowModal] = useState(false)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const firstDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const getTransactionsForDay = (day: number) => {
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date + "T12:00:00")
      return (
        transactionDate.getDate() === day &&
        transactionDate.getMonth() === month &&
        transactionDate.getFullYear() === year
      )
    })
  }

  const getDayTotal = (dayTransactions: Transaction[]) => {
    const income = dayTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
    const expenses = dayTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
    return { income, expenses, balance: income - expenses }
  }

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(year, month, day)
    const dayTransactions = getTransactionsForDay(day)

    if (dayTransactions.length > 0) {
      setSelectedDate(clickedDate)
      setShowModal(true)
    }
  }

  const renderCalendarDays = () => {
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="h-28 border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50"
        ></div>,
      )
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayTransactions = getTransactionsForDay(day)
      const { income, expenses, balance } = getDayTotal(dayTransactions)
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()
      const hasTransactions = dayTransactions.length > 0

      days.push(
        <div
          key={day}
          onClick={() => handleDayClick(day)}
          className={`h-28 border border-gray-100 dark:border-gray-700 p-2 overflow-hidden transition-all duration-200 ${
            hasTransactions ? "cursor-pointer hover:shadow-lg hover:scale-105 hover:z-10 relative" : ""
          } ${
            isToday
              ? "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50 border-blue-300 dark:border-blue-600 shadow-md dark:neon-blue"
              : hasTransactions
                ? "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"
                : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          <div
            className={`font-semibold text-sm mb-2 ${
              isToday
                ? "text-blue-700 dark:text-blue-300"
                : hasTransactions
                  ? "text-gray-700 dark:text-gray-200"
                  : "text-gray-700 dark:text-gray-300"
            }`}
          >
            {day}
            {isToday && <span className="ml-1 text-xs">(hoje)</span>}
            {hasTransactions && (
              <div className="float-right">
                <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
          {dayTransactions.length > 0 && (
            <div className="space-y-1">
              {income > 0 && (
                <div className="text-xs text-green-600 dark:text-green-400 font-semibold bg-green-50 dark:bg-green-900/30 px-1 py-0.5 rounded border dark:border-green-800">
                  +{formatCurrency(income)}
                </div>
              )}
              {expenses > 0 && (
                <div className="text-xs text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-900/30 px-1 py-0.5 rounded border dark:border-red-800">
                  -{formatCurrency(expenses)}
                </div>
              )}
              <div className="flex flex-wrap gap-1">
                {dayTransactions.slice(0, 2).map((transaction, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs px-1 py-0 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {transaction.category}
                  </Badge>
                ))}
                {dayTransactions.length > 2 && (
                  <Badge
                    variant="outline"
                    className="text-xs px-1 py-0 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  >
                    +{dayTransactions.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>,
      )
    }

    return days
  }

  const monthTotal = transactions
    .filter((t) => {
      const date = new Date(t.date)
      return date.getMonth() === month && date.getFullYear() === year
    })
    .reduce(
      (acc, t) => {
        if (t.type === "income") acc.income += t.amount
        else acc.expenses += t.amount
        return acc
      },
      { income: 0, expenses: 0 },
    )

  return (
    <>
      <Card className="shadow-lg border-0 dark:card-dark">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-t-lg">
          <div className="flex items-center flex-wrap gap-4 justify-between">
            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
              <CalendarIcon className="w-5 h-5" />
              Calendário Financeiro
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 dark:bg-green-400 rounded shadow-sm"></div>
                  <span className="dark:text-gray-300">Ganhos: {formatCurrency(monthTotal.income)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 dark:bg-red-400 rounded shadow-sm"></div>
                  <span className="dark:text-gray-300">Gastos: {formatCurrency(monthTotal.expenses)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={previousMonth}
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="font-semibold min-w-[100px] sm:min-w-[150px] text-center text-blue-800 dark:text-blue-300">
                  {monthNames[month]} {year}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextMonth}
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/50"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              <strong>Dica:</strong> Clique em qualquer data com transações para ver os detalhes completos do dia
            </p>
          </div>

          <div className="grid grid-cols-7 gap-0 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
            {/* Week day headers */}
            {weekDays.map((day) => (
              <div
                key={day}
                className="h-12 border-r border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center font-semibold text-sm text-gray-700 dark:text-gray-300 last:border-r-0"
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {renderCalendarDays()}
          </div>

          {/* Mobile summary */}
          <div className="sm:hidden mt-4 grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border dark:border-green-800">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatCurrency(monthTotal.income)}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">Ganhos</div>
            </div>
            <div className="text-center p-3 bg-red-50 dark:bg-red-900/30 rounded-lg border dark:border-red-800">
              <div className="text-lg font-bold text-red-600 dark:text-red-400">
                {formatCurrency(monthTotal.expenses)}
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">Gastos</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes do Dia */}
      <DayDetailsModal open={showModal} onOpenChange={setShowModal} date={selectedDate} transactions={transactions} />
    </>
  )
}
