'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ChevronLeft, ChevronRight, Printer } from 'lucide-react';

type ReportLineItem = {
  brandVariantId: string;
  quantity: number;
  totalAmount: number;
};

type ReportMode = 'daily' | 'monthly' | 'yearly' | 'custom';
type DailyPreset = 'today' | 'yesterday' | 'previous';

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function toLocalDateInputValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseLocalDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function formatDisplayDate(date: Date) {
  return date.toLocaleDateString('en-GB');
}

function monthLabel(year: number, monthIndex: number) {
  return `${new Date(year, monthIndex, 1).toLocaleString('en-US', { month: 'long' })}-${year}`;
}

function monthValue(year: number, monthIndex: number) {
  return `${year}-${pad(monthIndex + 1)}`;
}

export default function ReportsPage() {
  const store = useStore();
  const today = new Date();
  const currentMonthValue = monthValue(today.getFullYear(), today.getMonth());
  const [activeMode, setActiveMode] = useState<ReportMode>('daily');
  const [dailyPreset, setDailyPreset] = useState<DailyPreset>('today');
  const [selectedMonth, setSelectedMonth] = useState(currentMonthValue);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [dateFrom, setDateFrom] = useState(toLocalDateInputValue(today));
  const [dateTo, setDateTo] = useState(toLocalDateInputValue(today));

  const dailyRange = (() => {
    const offset = dailyPreset === 'today' ? 0 : dailyPreset === 'yesterday' ? -1 : -2;
    const date = addDays(today, offset);
    return {
      start: startOfDay(date),
      end: endOfDay(date),
      label: `${dailyPreset === 'today' ? 'Today' : dailyPreset === 'yesterday' ? 'Yesterday' : 'Previous Day'} (${formatDisplayDate(date)})`,
    };
  })();

  const monthlyRange = (() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);
    return {
      start,
      end,
      label: monthLabel(year, month - 1),
    };
  })();

  const yearlyRange = (() => {
    const start = new Date(selectedYear, 0, 1);
    const end = new Date(selectedYear, 11, 31, 23, 59, 59, 999);
    return {
      start,
      end,
      label: String(selectedYear),
    };
  })();

  const customRange = (() => {
    const start = dateFrom ? startOfDay(parseLocalDate(dateFrom)) : null;
    const end = dateTo ? endOfDay(parseLocalDate(dateTo)) : null;
    return {
      start,
      end,
      label:
        dateFrom || dateTo
          ? `${dateFrom ? formatDisplayDate(parseLocalDate(dateFrom)) : 'Start date'} - ${dateTo ? formatDisplayDate(parseLocalDate(dateTo)) : 'End date'}`
          : 'All dates',
    };
  })();

  const activeRange =
    activeMode === 'daily'
      ? dailyRange
      : activeMode === 'monthly'
        ? monthlyRange
        : activeMode === 'yearly'
          ? yearlyRange
          : customRange;

  // Filter data by date range
  const filterByDate = (items: any[]) => {
    if (activeMode === 'custom' && !dateFrom && !dateTo) return items;
    return items.filter(item => {
      const itemDate = new Date(item.saleDate || item.purchaseDate || item.createdAt);
      if (activeRange.start && itemDate < activeRange.start) return false;
      if (activeRange.end && itemDate > activeRange.end) return false;
      return true;
    });
  };

  const filteredSales = filterByDate(store.sales);
  const filteredPurchases = filterByDate(store.purchases);

  // Calculate metrics
  const totalSalesRevenue = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalCost = filteredSales.reduce((sum, s) => {
    return sum + s.lineItems.reduce((itemSum: number, item: ReportLineItem) => {
      const variant = store.brandVariants.find(b => b.id === item.brandVariantId);
      return itemSum + (variant?.costPrice || 0) * item.quantity;
    }, 0);
  }, 0);
  const totalProfit = totalSalesRevenue - totalCost;
  const profitMargin = totalSalesRevenue > 0 ? (totalProfit / totalSalesRevenue) * 100 : 0;

  const totalPurchaseAmount = filteredPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalCustomerDue = store.customers.reduce((sum, c) => sum + c.outstandingBalance, 0);
  const totalSupplierDue = store.suppliers.reduce((sum, s) => sum + s.outstandingBalance, 0);

  // Top products
  const productStats = store.brandVariants.map(variant => {
    const sales = filteredSales.flatMap(s => s.lineItems).filter((item: ReportLineItem) => item.brandVariantId === variant.id);
    const quantity = sales.reduce((sum: number, item: ReportLineItem) => sum + item.quantity, 0);
    const revenue = sales.reduce((sum: number, item: ReportLineItem) => sum + item.totalAmount, 0);
    return {
      brand: variant.brand,
      variantName: variant.variantName,
      quantity,
      revenue,
      profit: revenue - (quantity * variant.costPrice),
    };
  }).filter(p => p.quantity > 0).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  // Daily sales chart data
  const dailySalesMap = new Map<string, { sales: number; cost: number; profit: number }>();
  filteredSales.forEach(sale => {
    const date = new Date(sale.saleDate).toLocaleDateString();
    const cost = sale.lineItems.reduce((sum: number, item: ReportLineItem) => {
      const variant = store.brandVariants.find(b => b.id === item.brandVariantId);
      return sum + (variant?.costPrice || 0) * item.quantity;
    }, 0);
    const profit = sale.totalAmount - cost;

    const existing = dailySalesMap.get(date) || { sales: 0, cost: 0, profit: 0 };
    dailySalesMap.set(date, {
      sales: existing.sales + sale.totalAmount,
      cost: existing.cost + cost,
      profit: existing.profit + profit,
    });
  });

  const dailySalesData = Array.from(dailySalesMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const monthOptions = Array.from({ length: 84 }, (_, index) => {
    const yearOffset = Math.floor(index / 12);
    const monthIndex = index % 12;
    const year = today.getFullYear() - 2 + yearOffset;
    return {
      value: monthValue(year, monthIndex),
      label: monthLabel(year, monthIndex),
    };
  });

  const updateMode = (mode: ReportMode) => {
    setActiveMode(mode);
  };

  return (
    <div className="space-y-6">
      {/* Date Filter */}
      <Card className="border-primary/15 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
            <div className="grid w-full gap-1 rounded-2xl bg-muted p-1 sm:grid-cols-4 xl:max-w-[26rem]">
              {[
                { value: 'daily' as const, label: 'Daily' },
                { value: 'monthly' as const, label: 'Monthly' },
                { value: 'yearly' as const, label: 'Yearly' },
                { value: 'custom' as const, label: 'Custom' },
              ].map((mode) => (
                <Button
                  key={mode.value}
                  type="button"
                  variant="ghost"
                  onClick={() => updateMode(mode.value)}
                  className={`h-10 rounded-xl px-4 text-sm font-semibold transition-all ${
                    activeMode === mode.value
                      ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
                      : 'bg-transparent text-muted-foreground hover:bg-background hover:text-foreground'
                  }`}
                >
                  {mode.label}
                </Button>
              ))}
            </div>

            <div className="flex-1 rounded-2xl border border-primary/15 bg-background p-3 sm:p-4">
              {activeMode === 'daily' && (
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'today' as const, label: 'Today' },
                      { value: 'yesterday' as const, label: 'Yesterday' },
                      { value: 'previous' as const, label: 'Previous Day' },
                    ].map((preset) => (
                      <Button
                        key={preset.value}
                        type="button"
                        variant={dailyPreset === preset.value ? 'default' : 'outline'}
                        onClick={() => {
                          setActiveMode('daily');
                          setDailyPreset(preset.value);
                        }}
                        className={`h-10 rounded-xl px-4 ${
                          dailyPreset === preset.value ? 'shadow-sm' : 'bg-transparent'
                        }`}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                  <div className="text-sm font-medium text-primary">
                    Showing: {dailyRange.label}
                  </div>
                </div>
              )}

              {activeMode === 'monthly' && (
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <div className="w-full max-w-[22rem] space-y-1">
                    <Label className="pl-1">Select Month</Label>
                    <Select
                      value={selectedMonth}
                      onValueChange={(value) => {
                        setSelectedMonth(value);
                        setActiveMode('monthly');
                      }}
                    >
                      <SelectTrigger className="h-11 w-full border-primary/30 bg-background">
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {monthOptions.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-sm font-medium text-primary">
                    Showing: {monthlyRange.label}
                  </div>
                </div>
              )}

              {activeMode === 'yearly' && (
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <div className="w-full max-w-[24rem] space-y-1">
                    <Label className="pl-1">Select Year</Label>
                    <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-background p-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelectedYear((value) => value - 1);
                          setActiveMode('yearly');
                        }}
                        className="h-10 w-10"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="flex h-10 flex-1 items-center justify-center rounded-lg border bg-muted px-3 text-lg font-semibold">
                        {selectedYear}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelectedYear((value) => value + 1);
                          setActiveMode('yearly');
                        }}
                        className="h-10 w-10"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-primary">
                    Showing: {yearlyRange.label}
                  </div>
                </div>
              )}

              {activeMode === 'custom' && (
                <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
                  <div className="space-y-1">
                    <Label className="pl-1">Start Date</Label>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => {
                        setDateFrom(e.target.value);
                        setActiveMode('custom');
                      }}
                      className="h-11 border-primary/30"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="pl-1">End Date</Label>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => {
                        setDateTo(e.target.value);
                        setActiveMode('custom');
                      }}
                      className="h-11 border-primary/30"
                    />
                  </div>
                  <div className="text-sm font-medium text-primary lg:pb-2">
                    Showing: {customRange.label}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">LKR {(totalSalesRevenue / 100000).toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground mt-1">{filteredSales.length} invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">LKR {(totalCost / 100000).toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground mt-1">COGS</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">LKR {(totalProfit / 100000).toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground mt-1">{profitMargin.toFixed(1)}% margin</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">LKR {(totalCustomerDue / 100000).toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground mt-1">Pending collection</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        {/* Sales Report */}
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Sales Trend</CardTitle>
              <CardDescription>Revenue, cost, and profit progression</CardDescription>
            </CardHeader>
            <CardContent>
              {dailySalesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailySalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sales" stroke="hsl(var(--color-primary))" name="Sales" />
                    <Line type="monotone" dataKey="profit" stroke="hsl(var(--color-secondary))" name="Profit" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No sales data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Sales Details</CardTitle>
                <CardDescription>All sales invoices with metrics</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
                <Printer className="w-4 h-4" />
                Print
              </Button>
            </CardHeader>
            <CardContent>
              {filteredSales.length > 0 ? (
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Profit</TableHead>
                        <TableHead>Margin %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSales.map(sale => {
                        const customer = store.customers.find(c => c.id === sale.customerId);
                        const cost = sale.lineItems.reduce((sum: number, item: ReportLineItem) => {
                          const variant = store.brandVariants.find(b => b.id === item.brandVariantId);
                          return sum + (variant?.costPrice || 0) * item.quantity;
                        }, 0);
                        const profit = sale.totalAmount - cost;
                        const margin = sale.totalAmount > 0 ? (profit / sale.totalAmount) * 100 : 0;

                        return (
                          <TableRow key={sale.id}>
                            <TableCell className="font-medium">{sale.invoiceNumber}</TableCell>
                            <TableCell>{customer?.companyName || 'Unknown'}</TableCell>
                            <TableCell>{sale.lineItems.length}</TableCell>
                            <TableCell>LKR {sale.totalAmount.toLocaleString()}</TableCell>
                            <TableCell>LKR {cost.toLocaleString()}</TableCell>
                            <TableCell className="text-green-600 font-medium">LKR {profit.toLocaleString()}</TableCell>
                            <TableCell>{margin.toFixed(1)}%</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No sales data for selected period
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Products */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Products by Revenue</CardTitle>
              <CardDescription>Best performing products</CardDescription>
            </CardHeader>
            <CardContent>
              {productStats.length > 0 ? (
                <div className="space-y-2">
                  {productStats.map((product, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted">
                      <div>
                        <p className="font-medium">{idx + 1}. {product.brand} - {product.variantName}</p>
                        <p className="text-sm text-muted-foreground">{product.quantity} units sold</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">LKR {product.revenue.toLocaleString()}</p>
                        <p className="text-sm text-green-600">Profit: LKR {product.profit.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No product sales data
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Summary */}
        <TabsContent value="summary" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Sales Orders:</span>
                  <span className="font-semibold">{filteredSales.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Purchase Orders:</span>
                  <span className="font-semibold">{filteredPurchases.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Avg Order Value:</span>
                  <span className="font-semibold">LKR {filteredSales.length > 0 ? (totalSalesRevenue / filteredSales.length).toLocaleString() : '0'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Avg Profit Margin:</span>
                  <span className="font-semibold text-green-600">{profitMargin.toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Outstanding Amounts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Customer Due:</span>
                  <span className="font-semibold text-amber-600">LKR {totalCustomerDue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Supplier Due:</span>
                  <span className="font-semibold text-amber-600">LKR {totalSupplierDue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Inventory Value:</span>
                  <span className="font-semibold">LKR {store.brandVariants.reduce((sum, v) => sum + (v.currentStock * v.costPrice), 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-t pt-3">
                  <span className="text-muted-foreground font-semibold">Net Position:</span>
                  <span className="font-bold">LKR {((totalSalesRevenue - totalPurchaseAmount - totalSupplierDue + totalCustomerDue) / 100000).toFixed(1)}L</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
