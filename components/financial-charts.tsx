"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  PieChartIcon,
  BarChart3,
  Activity,
  Target,
  Calendar,
  DollarSign,
} from "lucide-react";
import type { Transaction } from "@/types/transaction";
import { formatCurrency } from "@/lib/utils";
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  LineChart,
  PieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  Line,
  Pie,
  Cell,
} from "recharts";
interface FinancialChartsProps {
  transactions: Transaction[];
}

// Paleta de cores moderna e elegante
const COLORS = {
  primary: "#3b82f6", // Blue
  success: "#10b981", // Emerald
  danger: "#ef4444", // Red
  warning: "#f59e0b", // Amber
  info: "#06b6d4", // Cyan
  purple: "#8b5cf6", // Violet
  pink: "#ec4899", // Pink
  categories: [
    "#3b82f6", // Blue
    "#10b981", // Emerald
    "#f59e0b", // Amber
    "#ef4444", // Red
    "#8b5cf6", // Violet
    "#06b6d4", // Cyan
    "#ec4899", // Pink
    "#84cc16", // Lime
    "#f97316", // Orange
    "#6b7280", // Gray
  ],
};

// Tooltip elegante
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl backdrop-blur-sm">
        <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600 dark:text-gray-300">
              {entry.name}:
            </span>
            <span className="font-bold" style={{ color: entry.color }}>
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Tooltip para gráfico de pizza
const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl backdrop-blur-sm">
        <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
          {data.category}
        </p>
        <div className="space-y-1">
          <p className="text-sm">
            <span className="text-gray-600 dark:text-gray-300">Total: </span>
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(data.total)}
            </span>
          </p>
          {data.ganhos > 0 && (
            <p className="text-sm">
              <span className="text-gray-600 dark:text-gray-300">Ganhos: </span>
              <span className="font-bold text-green-600 dark:text-green-400">
                {formatCurrency(data.ganhos)}
              </span>
            </p>
          )}
          {data.gastos > 0 && (
            <p className="text-sm">
              <span className="text-gray-600 dark:text-gray-300">Gastos: </span>
              <span className="font-bold text-red-600 dark:text-red-400">
                {formatCurrency(data.gastos)}
              </span>
            </p>
          )}
          <p className="text-sm">
            <span className="text-gray-600 dark:text-gray-300">
              Participação:{" "}
            </span>
            <span className="font-bold text-purple-600 dark:text-purple-400">
              {((data.total / data.totalSum) * 100).toFixed(1)}%
            </span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// Componente de loading para os gráficos
const ChartSkeleton = ({ height = "350px" }: { height?: string }) => (
  <div className="w-full animate-pulse" style={{ height }}>
    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg w-full h-full flex items-center justify-center">
      <div className="text-gray-400 dark:text-gray-500">
        <BarChart3 className="w-12 h-12" />
      </div>
    </div>
  </div>
);

export function FinancialCharts({ transactions }: FinancialChartsProps) {
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [isClient, setIsClient] = useState(false);

  // Garantir que os gráficos só renderizem no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  const years = useMemo(() => {
    if (transactions.length === 0) return [new Date().getFullYear()];
    return Array.from(
      new Set(transactions.map((t) => new Date(t.date).getFullYear()))
    ).sort((a, b) => b - a);
  }, [transactions]);

  const months = [
    { value: "all", label: "Geral (Ano Todo)" },
    { value: "1", label: "Janeiro" },
    { value: "2", label: "Fevereiro" },
    { value: "3", label: "Março" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Maio" },
    { value: "6", label: "Junho" },
    { value: "7", label: "Julho" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
  ];

  // Filtrar transações baseado no ano e mês selecionado
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const date = new Date(t.date);
      const yearMatch = date.getFullYear() === Number.parseInt(selectedYear);

      if (selectedMonth === "all") {
        return yearMatch;
      }

      const monthMatch = date.getMonth() + 1 === Number.parseInt(selectedMonth);
      return yearMatch && monthMatch;
    });
  }, [transactions, selectedYear, selectedMonth]);

  // Dados para gráfico de evolução mensal
  const monthlyEvolutionData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date(Number.parseInt(selectedYear), i, 1);
      const monthTransactions = transactions.filter((t) => {
        const transactionDate = new Date(t.date);
        return (
          transactionDate.getMonth() === date.getMonth() &&
          transactionDate.getFullYear() === date.getFullYear()
        );
      });

      const income = monthTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
      const expenses = monthTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        month: date.toLocaleDateString("pt-BR", { month: "short" }),
        ganhos: income,
        gastos: expenses,
        saldo: income - expenses,
      };
    });
  }, [transactions, selectedYear]);

  // Dados para gráfico de categorias (pizza)
  const categoryData = useMemo(() => {
    const categoryTotals = filteredTransactions.reduce((acc, transaction) => {
      if (!acc[transaction.category]) {
        acc[transaction.category] = { income: 0, expense: 0 };
      }
      if (transaction.type === "income") {
        acc[transaction.category].income += transaction.amount;
      } else {
        acc[transaction.category].expense += transaction.amount;
      }
      return acc;
    }, {} as Record<string, { income: number; expense: number }>);

    const totalSum = Object.values(categoryTotals).reduce(
      (sum, cat) => sum + cat.income + cat.expense,
      0
    );

    return Object.entries(categoryTotals).map(([category, totals]) => ({
      category,
      total: totals.income + totals.expense,
      ganhos: totals.income,
      gastos: totals.expense,
      totalSum,
    }));
  }, [filteredTransactions]);

  // Dados para gráfico de tendência (últimos 6 meses)
  const trendData = useMemo(() => {
    const currentDate = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - (5 - i),
        1
      );
      const monthTransactions = transactions.filter((t) => {
        const transactionDate = new Date(t.date);
        return (
          transactionDate.getMonth() === date.getMonth() &&
          transactionDate.getFullYear() === date.getFullYear()
        );
      });

      const income = monthTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
      const expenses = monthTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        month: date.toLocaleDateString("pt-BR", {
          month: "short",
          year: "2-digit",
        }),
        saldo: income - expenses,
        ganhos: income,
        gastos: expenses,
      };
    });
  }, [transactions]);

  // Dados para gráfico de comparação de gastos por categoria
  const expenseComparisonData = useMemo(() => {
    const categoryExpenses = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((acc, transaction) => {
        if (!acc[transaction.category]) {
          acc[transaction.category] = 0;
        }
        acc[transaction.category] += transaction.amount;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(categoryExpenses)
      .map(([category, amount]) => ({
        category,
        valor: amount,
      }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 8); // Top 8 categorias
  }, [filteredTransactions]);

  // Dados para gráfico de fluxo de caixa diário (últimos 30 dias)
  const dailyCashFlowData = useMemo(() => {
    const currentDate = new Date();
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(
        currentDate.getTime() - (29 - i) * 24 * 60 * 60 * 1000
      );
      const dayTransactions = transactions.filter((t) => {
        const transactionDate = new Date(t.date);
        return transactionDate.toDateString() === date.toDateString();
      });

      const income = dayTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
      const expenses = dayTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        day: date.getDate().toString(),
        date: date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        }),
        saldo: income - expenses,
        ganhos: income,
        gastos: expenses,
      };
    });

    return last30Days;
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <Card className="shadow-lg border-0 dark:card-dark">
        <CardContent className="flex flex-col items-center justify-center h-96 space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center">
            <BarChart3 className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Nenhum dado para exibir
            </h3>
            <p className="text-muted-foreground">
              Adicione algumas transações para ver os gráficos
            </p>
          </div>
          <Button onClick={() => window.location.reload()} variant="outline">
            <Activity className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Filtros */}
      <Card className="shadow-lg border-0 dark:card-dark">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
            <BarChart3 className="w-5 h-5" />
            Análise Financeira
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Evolução Mensal */}
        <Card className="shadow-lg border-0 overflow-hidden dark:card-dark col-span-1 lg:col-span-2">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30">
            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-300">
              <TrendingUp className="w-5 h-5" />
              Evolução Mensal - {selectedYear}
              <Badge
                variant="secondary"
                className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"
              >
                Comparativo
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="sm:p-6 p-2 ml-[-25px] sm:ml-0">
            <div className="h-[400px] w-full">
              {!isClient ? (
                <ChartSkeleton height="400px" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={monthlyEvolutionData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient
                        id="incomeGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={COLORS.success}
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor={COLORS.success}
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                      <linearGradient
                        id="expenseGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={COLORS.danger}
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor={COLORS.danger}
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                      opacity={0.5}
                    />
                    <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                    <YAxis
                      stroke="#6b7280"
                      fontSize={12}
                      tickFormatter={(value: any) =>
                        `R$ ${(value / 1000).toFixed(0)}k`
                      }
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="ganhos"
                      stackId="1"
                      stroke={COLORS.success}
                      fill="url(#incomeGradient)"
                      name="Ganhos"
                    />
                    <Area
                      type="monotone"
                      dataKey="gastos"
                      stackId="2"
                      stroke={COLORS.danger}
                      fill="url(#expenseGradient)"
                      name="Gastos"
                    />
                    <Line
                      type="monotone"
                      dataKey="saldo"
                      stroke={COLORS.primary}
                      strokeWidth={3}
                      name="Saldo"
                      dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-0 overflow-hidden dark:card-dark">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30">
            <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <TrendingUp className="w-5 h-5" />
              Tendência de Ganhos
              <Badge
                variant="secondary"
                className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"
              >
                6 meses
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="sm:p-6 p-2 ml-[-25px] sm:ml-0">
            <div className="h-[350px] w-full">
              {!isClient ? (
                <ChartSkeleton />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={trendData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient
                        id="gainGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={COLORS.success}
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor={COLORS.success}
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                      opacity={0.5}
                    />
                    <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                    <YAxis
                      stroke="#6b7280"
                      fontSize={12}
                      tickFormatter={(value: any) =>
                        `R$ ${(value / 1000).toFixed(0)}k`
                      }
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="ganhos"
                      stroke={COLORS.success}
                      fillOpacity={1}
                      fill="url(#gainGradient)"
                      strokeWidth={3}
                      name="Ganhos"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-0 overflow-hidden dark:card-dark">
          <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30">
            <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-300">
              <TrendingDown className="w-5 h-5" />
              Tendência de Gastos
              <Badge
                variant="secondary"
                className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300"
              >
                6 meses
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="sm:p-6 p-2 ml-[-25px] sm:ml-0">
            <div className="h-[350px] w-full">
              {!isClient ? (
                <ChartSkeleton />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={trendData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient
                        id="expenseGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={COLORS.danger}
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor={COLORS.danger}
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                      opacity={0.5}
                    />
                    <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                    <YAxis
                      stroke="#6b7280"
                      fontSize={12}
                      tickFormatter={(value: any) =>
                        `R$ ${(value / 1000).toFixed(0)}k`
                      }
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="gastos"
                      stroke={COLORS.danger}
                      fillOpacity={1}
                      fill="url(#expenseGradient)"
                      strokeWidth={3}
                      name="Gastos"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Distribuição por Categoria */}
        <Card className="shadow-lg border-0 overflow-hidden dark:card-dark">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30">
            <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-300">
              <PieChartIcon className="w-5 h-5" />
              Categoria de Gastos
            </CardTitle>
          </CardHeader>
          <CardContent className="sm:p-6 p-2 ml-[-25px] sm:ml-0">
            <div className="h-[350px] w-full">
              {!isClient ? (
                <ChartSkeleton />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData.filter((c) => c.gastos > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percent }: any) =>
                        `${category} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="gastos"
                    >
                      {categoryData
                        .filter((c) => c.gastos > 0)
                        .map((entry, index) => (
                          <Cell
                            key={`cell-exp-${index}`}
                            fill={
                              COLORS.categories[
                                index % COLORS.categories.length
                              ]
                            }
                          />
                        ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-0 overflow-hidden dark:card-dark">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30">
            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-300">
              <PieChartIcon className="w-5 h-5" />
              Categoria de Ganhos
            </CardTitle>
          </CardHeader>
          <CardContent className="sm:p-6 p-2 ml-[-25px] sm:ml-0">
            <div className="h-[350px] w-full">
              {!isClient ? (
                <ChartSkeleton />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData.filter((c) => c.ganhos > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percent }: any) =>
                        `${category} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="ganhos"
                    >
                      {categoryData
                        .filter((c) => c.ganhos > 0)
                        .map((entry, index) => (
                          <Cell
                            key={`cell-inc-${index}`}
                            fill={
                              COLORS.categories[
                                index % COLORS.categories.length
                              ]
                            }
                          />
                        ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Tendência dos Últimos 6 Meses */}
        <Card className="shadow-lg border-0 overflow-hidden dark:card-dark col-span-1 lg:col-span-2">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30">
            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
              <Activity className="w-5 h-5" />
              Tendência Recente
              <Badge
                variant="secondary"
                className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
              >
                6 meses
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="sm:p-6 p-2 ml-[-25px] sm:ml-0">
            <div className="h-[350px] w-full">
              {!isClient ? (
                <ChartSkeleton />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={trendData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient
                        id="balanceGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={COLORS.primary}
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor={COLORS.primary}
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                      opacity={0.5}
                    />
                    <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                    <YAxis
                      stroke="#6b7280"
                      fontSize={12}
                      tickFormatter={(value: any) =>
                        `R$ ${(value / 1000).toFixed(0)}k`
                      }
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="saldo"
                      stroke={COLORS.primary}
                      fillOpacity={1}
                      fill="url(#balanceGradient)"
                      strokeWidth={3}
                      name="Saldo"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Fluxo de Caixa Diário */}
        <Card className="shadow-lg border-0 overflow-hidden dark:card-dark col-span-1 lg:col-span-2">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30">
            <CardTitle className="flex items-center gap-2 text-indigo-800 dark:text-indigo-300">
              <Calendar className="w-5 h-5" />
              Fluxo de Caixa Diário
              <Badge
                variant="secondary"
                className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
              >
                {selectedMonth === "all"
                  ? "Ano Todo"
                  : months.find((m) => m.value === selectedMonth)?.label}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="sm:p-6 p-2 ml-[-25px] sm:ml-0">
            <div className="h-[350px] w-full">
              {!isClient ? (
                <ChartSkeleton />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={filteredTransactions
                      .map((t) => {
                        const date = new Date(t.date);
                        const label = date.toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                        });
                        return { ...t, date: label };
                      })
                      .reduce((acc, t) => {
                        const existing = acc.find((d) => d.date === t.date);
                        if (!existing) {
                          acc.push({
                            date: t.date,
                            ganhos: t.type === "income" ? t.amount : 0,
                            gastos: t.type === "expense" ? t.amount : 0,
                            saldo: t.type === "income" ? t.amount : -t.amount,
                          });
                        } else {
                          if (t.type === "income") {
                            existing.ganhos += t.amount;
                            existing.saldo += t.amount;
                          } else {
                            existing.gastos += t.amount;
                            existing.saldo -= t.amount;
                          }
                        }
                        return acc;
                      }, [] as { date: string; ganhos: number; gastos: number; saldo: number }[])}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                      opacity={0.5}
                    />
                    <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                    <YAxis
                      stroke="#6b7280"
                      fontSize={12}
                      tickFormatter={(value: any) =>
                        `R$ ${(value / 1000).toFixed(0)}k`
                      }
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="ganhos"
                      stroke={COLORS.success}
                      strokeWidth={2}
                      name="Ganhos"
                      dot={{ fill: COLORS.success, strokeWidth: 2, r: 3 }}
                      connectNulls={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="gastos"
                      stroke={COLORS.danger}
                      strokeWidth={2}
                      name="Gastos"
                      dot={{ fill: COLORS.danger, strokeWidth: 2, r: 3 }}
                      connectNulls={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="saldo"
                      stroke={COLORS.primary}
                      strokeWidth={3}
                      name="Saldo Diário"
                      dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Estatístico */}
      <Card className="shadow-lg border-0 overflow-hidden dark:card-dark">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800">
          <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
            <Target className="w-5 h-5" />
            Resumo Estatístico - {selectedYear}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                title: "Total de Ganhos",
                value: formatCurrency(
                  monthlyEvolutionData.reduce((sum, m) => sum + m.ganhos, 0)
                ),
                subtitle: `Média: ${formatCurrency(
                  monthlyEvolutionData.reduce((sum, m) => sum + m.ganhos, 0) /
                    12
                )}`,
                color: COLORS.success,
                icon: TrendingUp,
              },
              {
                title: "Total de Gastos",
                value: formatCurrency(
                  monthlyEvolutionData.reduce((sum, m) => sum + m.gastos, 0)
                ),
                subtitle: `Média: ${formatCurrency(
                  monthlyEvolutionData.reduce((sum, m) => sum + m.gastos, 0) /
                    12
                )}`,
                color: COLORS.danger,
                icon: TrendingDown,
              },
              {
                title: "Saldo Líquido",
                value: formatCurrency(
                  monthlyEvolutionData.reduce((sum, m) => sum + m.saldo, 0)
                ),
                subtitle: `Média: ${formatCurrency(
                  monthlyEvolutionData.reduce((sum, m) => sum + m.saldo, 0) / 12
                )}`,
                color: COLORS.primary,
                icon: DollarSign,
              },
              {
                title: "Melhor Mês",
                value: (() => {
                  const bestMonth = monthlyEvolutionData.reduce(
                    (best, current) =>
                      current.saldo > best.saldo ? current : best
                  );
                  return bestMonth.month;
                })(),
                subtitle: formatCurrency(
                  monthlyEvolutionData.reduce((best, current) =>
                    current.saldo > best.saldo ? current : best
                  ).saldo
                ),
                color: COLORS.purple,
                icon: Target,
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-center mb-4">
                  <div
                    className="p-3 rounded-full"
                    style={{
                      backgroundColor: `${stat.color}15`,
                      color: stat.color,
                    }}
                  >
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
                <div
                  className="tex-lg md:text-xl lg:text-2xl font-bold mb-2"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  {stat.title}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.subtitle}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
