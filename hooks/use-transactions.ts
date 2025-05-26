"use client"

import { useState, useEffect } from "react"
import type { Transaction } from "@/types/transaction"
import { generateUUID } from "@/lib/utils"

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  // Load transactions from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("financial-transactions")
    if (stored) {
      try {
        setTransactions(JSON.parse(stored))
      } catch (error) {
        console.error("Error loading transactions:", error)
      }
    }
  }, [])

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("financial-transactions", JSON.stringify(transactions))
  }, [transactions])

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: generateUUID(),
    }
    setTransactions((prev) => [...prev, newTransaction])
  }

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))
  }

  const clearAllTransactions = () => {
    setTransactions([])
    localStorage.removeItem("financial-transactions")
  }

  return {
    transactions,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    clearAllTransactions,
  }
}
