// "use client"

// import dynamic from "next/dynamic"
// import type { ComponentType } from "react"

// interface RechartsComponentProps {
//   [key: string]: any
// }

// // Função auxiliar para importação dinâmica segura
// const dynamicImport = (componentName: string) =>
//   dynamic<RechartsComponentProps>(
//     async () => {
//       const mod = await import("recharts")
//       const Component = mod[componentName] as ComponentType<RechartsComponentProps>
//       return { default: Component }
//     },
//     { ssr: false }
//   )


// // Exportação dos componentes Recharts

// export const ResponsiveContainer = dynamicImport("ResponsiveContainer")
// export const ComposedChart = dynamicImport("ComposedChart")
// export const AreaChart = dynamicImport("AreaChart")
// export const LineChart = dynamicImport("LineChart")
// export const BarChart = dynamicImport("BarChart")
// export const PieChart = dynamicImport("PieChart")
// export const Bar = dynamicImport("Bar")
// export const XAxis = dynamicImport("XAxis")
// export const YAxis = dynamicImport("YAxis")
// export const CartesianGrid = dynamicImport("CartesianGrid")
// export const Tooltip = dynamicImport("Tooltip")
// export const Legend = dynamicImport("Legend")
// export const Area = dynamicImport("Area")
// export const Line = dynamicImport("Line")
// export const Pie = dynamicImport("Pie")
// export const Cell = dynamicImport("Cell")