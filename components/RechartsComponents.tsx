"use client"

import dynamic from "next/dynamic"
import type { ComponentType } from "react"

interface RechartsComponentProps {
  [key: string]: any
}

// Função auxiliar para importação dinâmica segura
const dynamicImport = (componentName: string) => {
  return dynamic<RechartsComponentProps>(
    () => import("recharts").then((mod) => {
      const Component = mod[componentName] as ComponentType<RechartsComponentProps>
      // Garante que o componente tenha uma propriedade displayName para melhor debugging
      Component.displayName = componentName
      return Component
    }),
    { ssr: false }
  )
}

// Exportação dos componentes Recharts
export const ResponsiveContainer = dynamicImport("ResponsiveContainer")
export const ComposedChart = dynamicImport("ComposedChart")
export const AreaChart = dynamicImport("AreaChart")
export const LineChart = dynamicImport("LineChart")
export const BarChart = dynamicImport("BarChart")
export const PieChart = dynamicImport("PieChart")
export const Bar = dynamicImport("Bar")
export const XAxis = dynamicImport("XAxis")
export const YAxis = dynamicImport("YAxis")
export const CartesianGrid = dynamicImport("CartesianGrid")
export const Tooltip = dynamicImport("Tooltip")
export const Legend = dynamicImport("Legend")
export const Area = dynamicImport("Area")
export const Line = dynamicImport("Line")
export const Pie = dynamicImport("Pie")
export const Cell = dynamicImport("Cell")