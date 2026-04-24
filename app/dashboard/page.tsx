'use client'

import { useMemo } from 'react'
import { useStore } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCompactCurrency, formatCurrency, getStockStatus } from '@/lib/utils'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AlertTriangle, ArrowUpRight, Building2, Package2, ShoppingCart, Truck, Users } from 'lucide-react'

function groupByDay(items: { date: Date; amount: number }[], days = 7) {
  const lookup = new Map<string, number>()
  const today = new Date()

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today)
    date.setDate(today.getDate() - offset)
    const key = date.toISOString().slice(0, 10)
    lookup.set(key, 0)
  }

  items.forEach(item => {
    const key = new Date(item.date).toISOString().slice(0, 10)
    if (lookup.has(key)) lookup.set(key, (lookup.get(key) || 0) + item.amount)
  })

  return Array.from(lookup.entries()).map(([date, amount]) => ({
    date: new Date(date).toLocaleDateString('en-IN', { weekday: 'short' }),
    amount,
  }))
}

export default function DashboardPage() {
  const { currentUser, purchases, sales, brandVariants, customers, suppliers, categories } = useStore()

  const metrics = useMemo(() => {
    const now = new Date()
    const todayKey = now.toISOString().slice(0, 10)
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const todaySales = sales.filter(sale => new Date(sale.saleDate).toISOString().slice(0, 10) === todayKey)
    const monthSales = sales.filter(sale => new Date(sale.saleDate).toISOString().slice(0, 7) === monthKey)
    const monthPurchases = purchases.filter(purchase => new Date(purchase.purchaseDate).toISOString().slice(0, 7) === monthKey)

    const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0)
    const totalPurchases = purchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0)
    const todaySalesValue = todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0)
    const monthSalesValue = monthSales.reduce((sum, sale) => sum + sale.totalAmount, 0)
    const monthPurchaseValue = monthPurchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0)
    const totalProfit = sales.reduce((sum, sale) => {
      const cost = sale.lineItems.reduce((lineSum, item) => {
        const variant = brandVariants.find(candidate => candidate.id === item.brandVariantId)
        return lineSum + (variant?.costPrice || 0) * item.quantity
      }, 0)
      return sum + (sale.totalAmount - cost)
    }, 0)

    return {
      todaySalesValue,
      monthSalesValue,
      monthPurchaseValue,
      totalSales,
      totalPurchases,
      totalProfit,
    }
  }, [brandVariants, purchases, sales])

  const lowStockVariants = useMemo(
    () =>
      brandVariants
        .filter(variant => getStockStatus(variant.currentStock, variant.reorderLevel) !== 'ok')
        .sort((a, b) => a.currentStock - b.currentStock)
        .slice(0, 6),
    [brandVariants]
  )

  const topProducts = useMemo(() => {
    return brandVariants
      .map(variant => {
        const soldQuantity = sales.flatMap(sale => sale.lineItems).filter(item => item.brandVariantId === variant.id).reduce((sum, item) => sum + item.quantity, 0)
        const revenue = sales.flatMap(sale => sale.lineItems).filter(item => item.brandVariantId === variant.id).reduce((sum, item) => sum + item.totalAmount, 0)
        const profit = soldQuantity * Math.max(0, variant.sellingPrice - variant.costPrice)

        return {
          id: variant.id,
          name: `${variant.brand} ${variant.variantName}`,
          quantity: soldQuantity,
          revenue,
          profit,
          stock: variant.currentStock,
        }
      })
      .filter(item => item.quantity > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
  }, [brandVariants, sales])

  const chartData = useMemo(() => {
    const salesSeries = sales.map(sale => ({ date: new Date(sale.saleDate), amount: sale.totalAmount }))
    const purchaseSeries = purchases.map(purchase => ({ date: new Date(purchase.purchaseDate), amount: purchase.totalAmount }))
    const salesByDay = groupByDay(salesSeries)
    const purchasesByDay = groupByDay(purchaseSeries)

    return salesByDay.map((entry, index) => ({
      name: entry.date,
      sales: entry.amount,
      purchases: purchasesByDay[index]?.amount || 0,
    }))
  }, [purchases, sales])

  const inventoryValue = useMemo(
    () => brandVariants.reduce((sum, variant) => sum + variant.currentStock * variant.costPrice, 0),
    [brandVariants]
  )

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <Card className="border-0 bg-gradient-to-br from-white via-sky-50 to-cyan-100 text-slate-950 shadow-2xl shadow-sky-200/30 dark:from-slate-950 dark:via-slate-900 dark:to-cyan-900 dark:text-white dark:shadow-none">
          <CardContent className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
            <div className="space-y-4">
              <Badge className="w-fit border-sky-200 bg-white/80 text-slate-900 shadow-sm hover:bg-white/90 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/15">Operational overview</Badge>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
                  Welcome back, {currentUser?.name || 'team member'}.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700 sm:text-base dark:text-slate-300">
                  This dashboard tracks the full hardware workflow from product hierarchy to payment collection, stock pressure, and daily performance.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:via-sky-400 hover:to-blue-400 dark:text-slate-950 dark:bg-cyan-400 dark:shadow-none">Create sale</Button>
                <Button variant="outline" className="border-sky-200 bg-white/70 text-slate-900 hover:bg-white dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10">
                  Record purchase
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: 'Today sales', value: formatCurrency(metrics.todaySalesValue), icon: ShoppingCart },
                { label: 'Month sales', value: formatCompactCurrency(metrics.monthSalesValue), icon: ArrowUpRight },
                { label: 'Inventory value', value: formatCompactCurrency(inventoryValue), icon: Package2 },
                { label: 'Low stock', value: `${lowStockVariants.length}`, icon: AlertTriangle },
              ].map(item => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="rounded-2xl border border-sky-200 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
                    <Icon className="mb-4 h-5 w-5 text-sky-700 dark:text-cyan-200" />
                    <p className="text-sm text-slate-600 dark:text-slate-300">{item.label}</p>
                    <p className="text-xl font-semibold">{item.value}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">System snapshot</CardTitle>
            <CardDescription>Core shop counts and alerts</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {[
              { label: 'Categories', value: categories.length, icon: Package2 },
              { label: 'Customers', value: customers.length, icon: Users },
              { label: 'Suppliers', value: suppliers.length, icon: Truck },
              { label: 'Profit', value: formatCompactCurrency(metrics.totalProfit), icon: Building2 },
            ].map(item => {
              const Icon = item.icon
              return (
                <div key={item.label} className="rounded-2xl border bg-muted/30 p-4">
                  <div className="flex items-center justify-between">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </div>
                  <p className="mt-3 text-2xl font-semibold">{item.value}</p>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Sales', value: formatCompactCurrency(metrics.totalSales), hint: `${sales.length} invoices` },
          { label: 'Total Purchases', value: formatCompactCurrency(metrics.totalPurchases), hint: `${purchases.length} orders` },
          { label: 'Monthly Sales', value: formatCompactCurrency(metrics.monthSalesValue), hint: 'Current month activity' },
          { label: 'Monthly Purchases', value: formatCompactCurrency(metrics.monthPurchaseValue), hint: 'Current month buying' },
        ].map(item => (
          <Card key={item.label}>
            <CardHeader className="pb-2">
              <CardDescription>{item.label}</CardDescription>
              <CardTitle className="text-2xl">{item.value}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{item.hint}</CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Sales vs Purchase movement</CardTitle>
            <CardDescription>Last seven days of business activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" radius={[8, 8, 0, 0]} fill="hsl(var(--chart-1))" />
                  <Bar dataKey="purchases" radius={[8, 8, 0, 0]} fill="hsl(var(--chart-2))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue trend</CardTitle>
            <CardDescription>Daily sales flow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="sales" stroke="hsl(var(--chart-3))" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Low stock alerts</CardTitle>
            <CardDescription>Items that need replenishment now</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStockVariants.length > 0 ? (
              lowStockVariants.map(variant => {
                const status = getStockStatus(variant.currentStock, variant.reorderLevel)
                return (
                  <div key={variant.id} className="flex items-center justify-between rounded-2xl border p-4">
                    <div>
                      <p className="font-medium">{variant.brand} {variant.variantName}</p>
                      <p className="text-sm text-muted-foreground">Reorder level: {variant.reorderLevel}</p>
                    </div>
                    <Badge variant={status === 'out' ? 'destructive' : 'secondary'}>
                      {variant.currentStock} stock
                    </Badge>
                  </div>
                )
              })
            ) : (
              <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
                All tracked items are above their reorder level.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top selling products</CardTitle>
            <CardDescription>Highest revenue SKUs in the current dataset</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topProducts.length > 0 ? (
              topProducts.map(product => (
                <div key={product.id} className="rounded-2xl border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.quantity} units sold · Stock {product.stock}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCompactCurrency(product.revenue)}</p>
                      <p className="text-sm text-emerald-600">{formatCompactCurrency(product.profit)} profit</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
                Sales data will appear here after invoices are created.
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
