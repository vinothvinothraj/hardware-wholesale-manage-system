import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'LKR',
  maximumFractionDigits: 0,
})

export function formatCurrency(value: number) {
  return currencyFormatter.format(value || 0)
}

export function formatCompactCurrency(value: number) {
  const absolute = Math.abs(value || 0)
  if (absolute >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`
  if (absolute >= 100000) return `${(value / 100000).toFixed(1)}L`
  return formatCurrency(value)
}

export function formatDate(value?: string | number | Date) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function getStockStatus(stock: number, reorderLevel: number) {
  if (stock === 0) return 'out'
  if (stock <= reorderLevel) return 'low'
  return 'ok'
}
