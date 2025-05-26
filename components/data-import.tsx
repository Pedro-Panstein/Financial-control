"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, CheckCircle, AlertCircle, Download, Trash2 } from "lucide-react"
import type { Transaction } from "@/types/transaction"
import { formatCurrency } from "@/lib/utils"

interface DataImportProps {
  onImport: (transactions: Omit<Transaction, "id">[]) => void
  onClearData: () => void
  currentTransactions: Transaction[]
}

interface ImportResult {
  success: number
  errors: string[]
  duplicates: number
  imported: Omit<Transaction, "id">[]
}

export function DataImport({ onImport, onClearData, currentTransactions }: DataImportProps) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile)
      setResult(null)
    } else {
      alert("Por favor, selecione um arquivo CSV válido.")
    }
  }

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = []
    let current = ""
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === "," && !inQuotes) {
        result.push(current.trim())
        current = ""
      } else {
        current += char
      }
    }

    result.push(current.trim())
    return result
  }

  const validateTransaction = (
    data: string[],
    lineNumber: number,
  ): { valid: boolean; transaction?: Omit<Transaction, "id">; error?: string } => {
    if (data.length < 5) {
      return {
        valid: false,
        error: `Linha ${lineNumber}: Dados insuficientes (esperado 5 colunas, encontrado ${data.length})`,
      }
    }

    const [dateStr, description, category, typeStr, amountStr] = data

    // Validar data
    const date = new Date(dateStr.split("/").reverse().join("-"))
    if (isNaN(date.getTime())) {
      return { valid: false, error: `Linha ${lineNumber}: Data inválida "${dateStr}"` }
    }

    // Validar tipo
    const type = typeStr.toLowerCase() === "ganho" ? "income" : typeStr.toLowerCase() === "gasto" ? "expense" : null
    if (!type) {
      return { valid: false, error: `Linha ${lineNumber}: Tipo inválido "${typeStr}" (deve ser "Ganho" ou "Gasto")` }
    }

    // Validar valor
    const amount = Number.parseFloat(amountStr.replace(",", "."))
    if (isNaN(amount) || amount <= 0) {
      return { valid: false, error: `Linha ${lineNumber}: Valor inválido "${amountStr}"` }
    }

    // Validar campos obrigatórios
    if (!description.trim()) {
      return { valid: false, error: `Linha ${lineNumber}: Descrição é obrigatória` }
    }

    if (!category.trim()) {
      return { valid: false, error: `Linha ${lineNumber}: Categoria é obrigatória` }
    }

    return {
      valid: true,
      transaction: {
        date: date.toISOString().split("T")[0],
        description: description.trim().replace(/^"|"$/g, ""), // Remove aspas
        category: category.trim(),
        type,
        amount,
      },
    }
  }

  const checkDuplicate = (transaction: Omit<Transaction, "id">, existing: Transaction[]): boolean => {
    return existing.some(
      (t) =>
        t.date === transaction.date &&
        t.description === transaction.description &&
        t.amount === transaction.amount &&
        t.type === transaction.type,
    )
  }

  const processFile = async () => {
    if (!file) return

    setImporting(true)
    setProgress(0)

    try {
      const text = await file.text()
      const lines = text.split("\n").filter((line) => line.trim())

      if (lines.length === 0) {
        throw new Error("Arquivo vazio")
      }

      // Pular cabeçalho se existir
      const startIndex = lines[0].toLowerCase().includes("data") ? 1 : 0
      const dataLines = lines.slice(startIndex)

      const result: ImportResult = {
        success: 0,
        errors: [],
        duplicates: 0,
        imported: [],
      }

      for (let i = 0; i < dataLines.length; i++) {
        const line = dataLines[i].trim()
        if (!line) continue

        setProgress(((i + 1) / dataLines.length) * 100)

        const data = parseCSVLine(line)
        const validation = validateTransaction(data, startIndex + i + 1)

        if (!validation.valid) {
          result.errors.push(validation.error!)
          continue
        }

        const transaction = validation.transaction!

        // Verificar duplicatas
        if (
          checkDuplicate(transaction, currentTransactions) ||
          result.imported.some(
            (t) =>
              t.date === transaction.date &&
              t.description === transaction.description &&
              t.amount === transaction.amount &&
              t.type === transaction.type,
          )
        ) {
          result.duplicates++
          continue
        }

        result.imported.push(transaction)
        result.success++

        // Simular delay para mostrar progresso
        await new Promise((resolve) => setTimeout(resolve, 10))
      }

      setResult(result)
    } catch (error) {
      setResult({
        success: 0,
        errors: [`Erro ao processar arquivo: ${error instanceof Error ? error.message : "Erro desconhecido"}`],
        duplicates: 0,
        imported: [],
      })
    } finally {
      setImporting(false)
      setProgress(100)
    }
  }

  const handleImport = () => {
    if (result && result.imported.length > 0) {
      onImport(result.imported)
      setOpen(false)
      setFile(null)
      setResult(null)
      setProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleClearData = () => {
    if (confirm("Tem certeza que deseja apagar TODOS os dados? Esta ação não pode ser desfeita.")) {
      onClearData()
      setOpen(false)
    }
  }

  const downloadTemplate = () => {
    const template = [
      "Data,Descrição,Categoria,Tipo,Valor",
      '01/01/2025,"Exemplo de ganho",Trabalho,Ganho,1000.00',
      '02/01/2025,"Exemplo de gasto",Comida,Gasto,50.00',
    ].join("\n")

    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "modelo_importacao.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="shadow-md hover:shadow-lg transition-all duration-300">
          <Upload className="w-4 h-4 mr-2" />
          Importar Dados
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="w-5 h-5" />
            Importar Dados CSV
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instruções */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>
                  <strong>Formato esperado:</strong> Data, Descrição, Categoria, Tipo, Valor
                </p>
                <p>
                  <strong>Tipos aceitos:</strong> "Ganho" ou "Gasto"
                </p>
                <p>
                  <strong>Formato de data:</strong> DD/MM/AAAA
                </p>
                <p>
                  <strong>Formato de valor:</strong> Use vírgula ou ponto para decimais
                </p>
              </div>
            </AlertDescription>
          </Alert>

          {/* Botões de ação */}
          <div className="flex gap-3 flex-wrap">
            <Button onClick={downloadTemplate} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Baixar Modelo
            </Button>
            <Button onClick={handleClearData} variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Todos os Dados
            </Button>
          </div>

          {/* Seleção de arquivo */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Selecionar arquivo CSV</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              ref={fileInputRef}
              className="cursor-pointer"
            />
          </div>

          {/* Informações do arquivo */}
          {file && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="font-medium">{file.name}</span>
                <Badge variant="secondary">{(file.size / 1024).toFixed(1)} KB</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Arquivo selecionado. Clique em "Processar" para analisar os dados.
              </p>
            </div>
          )}

          {/* Progresso */}
          {importing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processando arquivo...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Resultados */}
          {result && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{result.success}</div>
                  <div className="text-sm text-green-600 dark:text-green-400">Importados</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{result.duplicates}</div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-400">Duplicados</div>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{result.errors.length}</div>
                  <div className="text-sm text-red-600 dark:text-red-400">Erros</div>
                </div>
              </div>

              {/* Preview das transações importadas */}
              {result.imported.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Preview das transações a serem importadas:</h4>
                  <div className="max-h-40 overflow-y-auto space-y-2 border rounded-lg p-3">
                    {result.imported.slice(0, 5).map((transaction, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded"
                      >
                        <div>
                          <span className="font-medium">{transaction.description}</span>
                          <span className="text-muted-foreground ml-2">({transaction.category})</span>
                        </div>
                        <div
                          className={`font-medium ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </div>
                      </div>
                    ))}
                    {result.imported.length > 5 && (
                      <div className="text-center text-sm text-muted-foreground">
                        ... e mais {result.imported.length - 5} transações
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Erros */}
              {result.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-red-600 dark:text-red-400">Erros encontrados:</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1 border rounded-lg p-3 bg-red-50 dark:bg-red-900/20">
                    {result.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-600 dark:text-red-400">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancelar
            </Button>
            {!result && file && (
              <Button onClick={processFile} disabled={importing} className="flex-1">
                {importing ? "Processando..." : "Processar Arquivo"}
              </Button>
            )}
            {result && result.imported.length > 0 && (
              <Button onClick={handleImport} className="flex-1 bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Importar {result.success} Transações
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
