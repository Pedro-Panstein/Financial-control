"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import type { Transaction } from "@/types/transaction"

interface TransactionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (transaction: Omit<Transaction, "id">) => void
}

const categories = [
  "Lazer",
  "Estudo",
  "Comida",
  "Transporte",
  "Namoro",
  "Saúde",
  "Casa",
  "Trabalho",
  "Investimentos",
  "Outros",
]

export function TransactionForm({ open, onOpenChange, onSubmit }: TransactionFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm()
  const [type, setType] = useState<"income" | "expense">("expense")

  const onFormSubmit = (data: any) => {
    // Corrigir o problema de fuso horário
    const selectedDate = new Date(data.date + "T12:00:00")
    const formattedDate = selectedDate.toISOString().split("T")[0]

    const transaction = {
      date: formattedDate,
      amount: Number.parseFloat(data.amount),
      description: data.description,
      category: data.category,
      type: type,
    }

    onSubmit(transaction)
    reset()
    setType("expense")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] shadow-2xl border-0 dark:bg-gray-900 dark:border-gray-700">
        <DialogHeader className="space-y-3 pb-6">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            Nova Transação
          </DialogTitle>
          <p className="text-muted-foreground">Adicione uma nova transação ao seu controle financeiro</p>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base font-semibold dark:text-gray-200">Tipo de Transação</Label>
            <RadioGroup value={type} onValueChange={(value) => setType(value as "income" | "expense")}>
              <div
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-200 ${
                  type === "income"
                    ? "border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/30"
                    : "border-gray-200 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-700"
                }`}
              >
                <RadioGroupItem value="income" id="income" />
                <Label
                  htmlFor="income"
                  className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium cursor-pointer"
                >
                  <TrendingUp className="w-4 h-4" />
                  Ganho
                </Label>
              </div>
              <div
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-200 ${
                  type === "expense"
                    ? "border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/30"
                    : "border-gray-200 dark:border-gray-700 hover:border-red-200 dark:hover:border-red-700"
                }`}
              >
                <RadioGroupItem value="expense" id="expense" />
                <Label
                  htmlFor="expense"
                  className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium cursor-pointer"
                >
                  <TrendingDown className="w-4 h-4" />
                  Gasto
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium dark:text-gray-200">
                Data
              </Label>
              <Input
                id="date"
                type="date"
                {...register("date", { required: "Data é obrigatória" })}
                defaultValue={new Date().toLocaleDateString("en-CA")}
                className="shadow-sm dark:bg-gray-800 dark:border-gray-600"
              />
              {errors.date && <p className="text-sm text-red-600 dark:text-red-400">{errors.date.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium flex items-center gap-2 dark:text-gray-200">
                <DollarSign className="w-4 h-4" />
                Valor (R$)
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                {...register("amount", {
                  required: "Valor é obrigatório",
                  min: { value: 0.01, message: "Valor deve ser maior que zero" },
                })}
                className="shadow-sm dark:bg-gray-800 dark:border-gray-600"
              />
              {errors.amount && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.amount.message as string}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium dark:text-gray-200">
              Descrição
            </Label>
            <Textarea
              id="description"
              placeholder="Descreva a transação..."
              {...register("description", { required: "Descrição é obrigatória" })}
              className="shadow-sm resize-none dark:bg-gray-800 dark:border-gray-600"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.description.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium dark:text-gray-200">
              Categoria
            </Label>
            <Select onValueChange={(value) => setValue("category", value)}>
              <SelectTrigger {...register("category", {
                  required: "Categoria é obrigatório",
                })} className="shadow-sm dark:bg-gray-800 dark:border-gray-600">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-red-600 dark:text-red-400">Categoria é obrigatória</p>}
          </div>

          <div className="flex gap-3 pt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 shadow-sm">
              Cancelar
            </Button>
            <Button
              type="submit"
              className={`flex-1 shadow-lg hover:shadow-xl transition-all duration-300 ${
                type === "income"
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 dark:neon-green"
                  : "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 dark:neon-red"
              }`}
            >
              Salvar Transação
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
