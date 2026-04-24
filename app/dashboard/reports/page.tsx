'use client';

import { useMemo, useState } from 'react';
import autoTable from 'jspdf-autotable';
import { useStore } from '@/lib/store';
import type { Sale } from '@/lib/types';
import { formatCompactCurrency } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  AlertTriangle,
  BadgeDollarSign,
  ChevronLeft,
  ChevronRight,
  Download,
  Package2,
  Percent,
  Printer,
  TrendingUp,
} from 'lucide-react';

type ReportLineItem = {
  brandVariantId: string;
  quantity: number;
  totalAmount: number;
};

type ReportSalesRow = {
  invoiceNumber: string;
  customerName: string;
  date: string;
  sortKey: number;
  items: number;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
};

type ReportProductRow = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
  stock: number;
};

type ReportCategoryRow = {
  category: string;
  quantity: number;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
};

type DailyTrendRow = {
  date: string;
  sortKey: number;
  sales: number;
  cost: number;
  profit: number;
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

function formatPdfNumber(value: number) {
  return `LKR ${value.toLocaleString()}`;
}

function getDateValue(item: { saleDate?: Date | string; purchaseDate?: Date | string; createdAt?: Date | string }) {
  const value = item.saleDate || item.purchaseDate || item.createdAt;
  return value ? new Date(value) : new Date(0);
}

function getDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getDisplayDateLabel(date: Date) {
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
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
  const [isExporting, setIsExporting] = useState(false);

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
    return {
      start: new Date(year, month - 1, 1),
      end: new Date(year, month, 0, 23, 59, 59, 999),
      label: monthLabel(year, month - 1),
    };
  })();

  const yearlyRange = (() => {
    return {
      start: new Date(selectedYear, 0, 1),
      end: new Date(selectedYear, 11, 31, 23, 59, 59, 999),
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

  const filterByDate = <T extends { saleDate?: Date; purchaseDate?: Date; createdAt?: Date }>(items: T[]) => {
    if (activeMode === 'custom' && !dateFrom && !dateTo) return items;
    return items.filter(item => {
      const itemDate = getDateValue(item);
      if (activeRange.start && itemDate < activeRange.start) return false;
      if (activeRange.end && itemDate > activeRange.end) return false;
      return true;
    });
  };

  const filteredSales = filterByDate(store.sales);
  const filteredPurchases = filterByDate(store.purchases);

  const saleCost = (sale: Sale) =>
    sale.lineItems.reduce((sum, item) => {
      const variant = store.brandVariants.find(b => b.id === item.brandVariantId);
      return sum + (variant?.costPrice || 0) * item.quantity;
    }, 0);

  const reportSales = useMemo<ReportSalesRow[]>(() => {
    return filteredSales
      .map((sale) => {
        const customer = store.customers.find(c => c.id === sale.customerId);
        const cost = saleCost(sale);
        const profit = sale.totalAmount - cost;
        const margin = sale.totalAmount > 0 ? (profit / sale.totalAmount) * 100 : 0;

        return {
          invoiceNumber: sale.invoiceNumber,
          customerName: customer?.companyName || 'Unknown',
          date: getDisplayDateLabel(new Date(sale.saleDate)),
          sortKey: new Date(sale.saleDate).getTime(),
          items: sale.lineItems.length,
          revenue: sale.totalAmount,
          cost,
          profit,
          margin,
        };
      })
      .sort((a, b) => a.sortKey - b.sortKey);
  }, [filteredSales, store.customers, store.brandVariants]);

  const productStats = useMemo<ReportProductRow[]>(() => {
    return store.brandVariants
      .map(variant => {
        const salesItems = filteredSales.flatMap(sale => sale.lineItems).filter(item => item.brandVariantId === variant.id);
        const quantity = salesItems.reduce((sum, item) => sum + item.quantity, 0);
        const revenue = salesItems.reduce((sum, item) => sum + item.totalAmount, 0);
        const cost = quantity * variant.costPrice;
        const profit = revenue - cost;
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
        const model = store.models.find(m => m.id === variant.modelId);
        const productType = store.productTypes.find(p => p.id === model?.productTypeId);
        const subcategory = store.subcategories.find(s => s.id === productType?.subcategoryId);
        const category = store.categories.find(c => c.id === subcategory?.categoryId);

        return {
          id: variant.id,
          name: `${variant.brand} ${variant.variantName}`,
          category: category?.name || 'Uncategorized',
          quantity,
          revenue,
          cost,
          profit,
          margin,
          stock: variant.currentStock,
        };
      })
      .filter(row => row.quantity > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [filteredSales, store.brandVariants, store.categories, store.models, store.productTypes, store.subcategories]);

  const categoryStats = useMemo<ReportCategoryRow[]>(() => {
    const map = new Map<string, ReportCategoryRow>();

    filteredSales.forEach(sale => {
      sale.lineItems.forEach(item => {
        const variant = store.brandVariants.find(b => b.id === item.brandVariantId);
        if (!variant) return;

        const model = store.models.find(m => m.id === variant.modelId);
        const productType = store.productTypes.find(p => p.id === model?.productTypeId);
        const subcategory = store.subcategories.find(s => s.id === productType?.subcategoryId);
        const category = store.categories.find(c => c.id === subcategory?.categoryId);
        const key = category?.name || 'Uncategorized';
        const cost = (variant.costPrice || 0) * item.quantity;

        const current = map.get(key) || {
          category: key,
          quantity: 0,
          revenue: 0,
          cost: 0,
          profit: 0,
          margin: 0,
        };

        current.quantity += item.quantity;
        current.revenue += item.totalAmount;
        current.cost += cost;
        current.profit += item.totalAmount - cost;
        map.set(key, current);
      });
    });

    return Array.from(map.values())
      .map(row => ({
        ...row,
        margin: row.revenue > 0 ? (row.profit / row.revenue) * 100 : 0,
      }))
      .sort((a, b) => b.profit - a.profit);
  }, [filteredSales, store.brandVariants, store.categories, store.models, store.productTypes, store.subcategories]);

  const dailyProfitData = useMemo<DailyTrendRow[]>(() => {
    const map = new Map<string, { sales: number; cost: number; profit: number }>();

    filteredSales.forEach(sale => {
      const saleDate = new Date(sale.saleDate);
      const key = getDateKey(saleDate);
      const cost = saleCost(sale);
      const current = map.get(key) || { sales: 0, cost: 0, profit: 0 };

      map.set(key, {
        sales: current.sales + sale.totalAmount,
        cost: current.cost + cost,
        profit: current.profit + (sale.totalAmount - cost),
      });
    });

    return Array.from(map.entries())
      .map(([date, data]) => ({
        date: getDisplayDateLabel(new Date(date)),
        sortKey: new Date(date).getTime(),
        ...data,
      }))
      .sort((a, b) => a.sortKey - b.sortKey);
  }, [filteredSales, store.brandVariants]);

  const lowMarginProducts = useMemo(() => productStats.filter(product => product.margin > 0 && product.margin < 15).slice(0, 8), [productStats]);

  const totalSalesRevenue = reportSales.reduce((sum, row) => sum + row.revenue, 0);
  const totalCost = reportSales.reduce((sum, row) => sum + row.cost, 0);
  const totalProfit = totalSalesRevenue - totalCost;
  const profitMargin = totalSalesRevenue > 0 ? (totalProfit / totalSalesRevenue) * 100 : 0;
  const totalPurchaseAmount = filteredPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalCustomerDue = store.customers.reduce((sum, c) => sum + c.outstandingBalance, 0);
  const totalSupplierDue = store.suppliers.reduce((sum, s) => sum + s.outstandingBalance, 0);

  const monthOptions = Array.from({ length: 84 }, (_, index) => {
    const yearOffset = Math.floor(index / 12);
    const monthIndex = index % 12;
    const year = today.getFullYear() - 2 + yearOffset;
    return {
      value: monthValue(year, monthIndex),
      label: monthLabel(year, monthIndex),
    };
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setIsExporting(true);

    try {
      const { jsPDF } = await import('jspdf/dist/jspdf.es.min.js');
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const marginX = 12;
      const generatedAt = new Date().toLocaleString();

      doc.setProperties({
        title: `Hardware Shop Profit Report - ${activeRange.label}`,
      });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('Hardware Shop Profit Report', marginX, 14);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Report Range: ${activeRange.label}`, marginX, 20);
      doc.text(`Generated: ${generatedAt}`, marginX, 25);

      autoTable(doc, {
        startY: 30,
        head: [['Metric', 'Value']],
        body: [
          ['Total Revenue', formatPdfNumber(totalSalesRevenue)],
          ['Total Cost', formatPdfNumber(totalCost)],
          ['Total Profit', formatPdfNumber(totalProfit)],
          ['Profit Margin', `${profitMargin.toFixed(1)}%`],
          ['Purchase Value', formatPdfNumber(totalPurchaseAmount)],
          ['Customer Due', formatPdfNumber(totalCustomerDue)],
          ['Supplier Due', formatPdfNumber(totalSupplierDue)],
          ['Sales Count', String(filteredSales.length)],
          ['Purchase Count', String(filteredPurchases.length)],
        ],
        theme: 'grid',
        styles: { fontSize: 8.5, cellPadding: 2.5 },
        headStyles: { fillColor: [15, 118, 110] },
        margin: { left: marginX, right: marginX },
      });

      autoTable(doc, {
        startY: ((doc as any).lastAutoTable?.finalY || 40) + 8,
        head: [['Invoice', 'Customer', 'Date', 'Revenue', 'Cost', 'Profit', 'Margin %']],
        body: reportSales.map(row => [
          row.invoiceNumber,
          row.customerName,
          row.date,
          formatPdfNumber(row.revenue),
          formatPdfNumber(row.cost),
          formatPdfNumber(row.profit),
          `${row.margin.toFixed(1)}%`,
        ]),
        theme: 'striped',
        styles: { fontSize: 7.5, cellPadding: 2 },
        headStyles: { fillColor: [59, 130, 246] },
        margin: { left: marginX, right: marginX },
      });

      autoTable(doc, {
        startY: ((doc as any).lastAutoTable?.finalY || 40) + 8,
        head: [['Category', 'Units', 'Revenue', 'Cost', 'Profit', 'Margin %']],
        body: categoryStats.map(row => [
          row.category,
          String(row.quantity),
          formatPdfNumber(row.revenue),
          formatPdfNumber(row.cost),
          formatPdfNumber(row.profit),
          `${row.margin.toFixed(1)}%`,
        ]),
        theme: 'grid',
        styles: { fontSize: 7.5, cellPadding: 2 },
        headStyles: { fillColor: [14, 165, 233] },
        margin: { left: marginX, right: marginX },
      });

      autoTable(doc, {
        startY: ((doc as any).lastAutoTable?.finalY || 40) + 8,
        head: [['Top Product', 'Category', 'Units', 'Revenue', 'Cost', 'Profit', 'Margin %']],
        body: productStats.map(row => [
          row.name,
          row.category,
          String(row.quantity),
          formatPdfNumber(row.revenue),
          formatPdfNumber(row.cost),
          formatPdfNumber(row.profit),
          `${row.margin.toFixed(1)}%`,
        ]),
        theme: 'striped',
        styles: { fontSize: 7.5, cellPadding: 2 },
        headStyles: { fillColor: [37, 99, 235] },
        margin: { left: marginX, right: marginX },
      });

      autoTable(doc, {
        startY: ((doc as any).lastAutoTable?.finalY || 40) + 8,
        head: [['Date', 'Sales', 'Cost', 'Profit']],
        body: dailyProfitData.map(row => [
          row.date,
          formatPdfNumber(row.sales),
          formatPdfNumber(row.cost),
          formatPdfNumber(row.profit),
        ]),
        theme: 'grid',
        styles: { fontSize: 7.5, cellPadding: 2 },
        headStyles: { fillColor: [20, 184, 166] },
        margin: { left: marginX, right: marginX },
      });

      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i += 1) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`Hardware Shop Profit Report`, marginX, doc.internal.pageSize.getHeight() - 6);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - marginX - 18, doc.internal.pageSize.getHeight() - 6);
      }

      doc.save(`hardware-shop-profit-report-${activeMode}-${toLocalDateInputValue(today)}.pdf`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/15 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
            <div className="grid w-full gap-1 rounded-2xl bg-muted p-1 sm:grid-cols-4 xl:max-w-[26rem]">
              {[
                { value: 'daily' as const, label: 'Daily' },
                { value: 'monthly' as const, label: 'Monthly' },
                { value: 'yearly' as const, label: 'Yearly' },
                { value: 'custom' as const, label: 'Custom' },
              ].map(mode => (
                <Button
                  key={mode.value}
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveMode(mode.value)}
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
                    ].map(preset => (
                      <Button
                        key={preset.value}
                        type="button"
                        variant={dailyPreset === preset.value ? 'default' : 'outline'}
                        onClick={() => {
                          setActiveMode('daily');
                          setDailyPreset(preset.value);
                        }}
                        className={`h-10 rounded-xl px-4 ${dailyPreset === preset.value ? 'shadow-sm' : 'bg-transparent'}`}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                  <div className="text-sm font-medium text-primary">Showing: {dailyRange.label}</div>
                </div>
              )}

              {activeMode === 'monthly' && (
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <div className="w-full max-w-[22rem] space-y-1">
                    <Label className="pl-1">Select Month</Label>
                    <Select
                      value={selectedMonth}
                      onValueChange={value => {
                        setSelectedMonth(value);
                        setActiveMode('monthly');
                      }}
                    >
                      <SelectTrigger className="h-11 w-full border-primary/30 bg-background">
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {monthOptions.map(month => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-sm font-medium text-primary">Showing: {monthlyRange.label}</div>
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
                          setSelectedYear(value => value - 1);
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
                          setSelectedYear(value => value + 1);
                          setActiveMode('yearly');
                        }}
                        className="h-10 w-10"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-primary">Showing: {yearlyRange.label}</div>
                </div>
              )}

              {activeMode === 'custom' && (
                <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
                  <div className="space-y-1">
                    <Label className="pl-1">Start Date</Label>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={e => {
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
                      onChange={e => {
                        setDateTo(e.target.value);
                        setActiveMode('custom');
                      }}
                      className="h-11 border-primary/30"
                    />
                  </div>
                  <div className="text-sm font-medium text-primary lg:pb-2">Showing: {customRange.label}</div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold">Active profit report</p>
          <p className="text-sm text-muted-foreground">
            {activeRange.label} | {filteredSales.length} sales | {filteredPurchases.length} purchases
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={handleDownloadPdf} disabled={isExporting}>
            <Download className="h-4 w-4" />
            {isExporting ? 'Preparing PDF...' : 'Download PDF'}
          </Button>
          <Button variant="outline" className="gap-2" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCompactCurrency(totalSalesRevenue)}</div>
            <p className="mt-1 text-xs text-muted-foreground">{filteredSales.length} invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCompactCurrency(totalProfit)}</div>
            <p className="mt-1 text-xs text-muted-foreground">{profitMargin.toFixed(1)}% margin</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{formatCompactCurrency(totalCustomerDue)}</div>
            <p className="mt-1 text-xs text-muted-foreground">Pending collection</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Margin SKUs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sky-600">{lowMarginProducts.length}</div>
            <p className="mt-1 text-xs text-muted-foreground">Below 15% margin</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCompactCurrency(totalCost)}</div>
            <p className="mt-1 text-xs text-muted-foreground">COGS</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Purchase Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCompactCurrency(totalPurchaseAmount)}</div>
            <p className="mt-1 text-xs text-muted-foreground">{filteredPurchases.length} orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Supplier Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{formatCompactCurrency(totalSupplierDue)}</div>
            <p className="mt-1 text-xs text-muted-foreground">Pending payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Position</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCompactCurrency(totalSalesRevenue - totalPurchaseAmount - totalSupplierDue + totalCustomerDue)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Revenue - purchases - dues</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
          <TabsTrigger value="profit">Profit Analysis</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Financial Trend</CardTitle>
              <CardDescription>Revenue, cost, and profit progression for the selected range</CardDescription>
            </CardHeader>
            <CardContent>
              {dailyProfitData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyProfitData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sales" stroke="hsl(var(--chart-1))" name="Sales" />
                    <Line type="monotone" dataKey="cost" stroke="hsl(var(--chart-2))" name="Cost" />
                    <Line type="monotone" dataKey="profit" stroke="hsl(var(--chart-3))" name="Profit" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-64 items-center justify-center text-muted-foreground">
                  No sales data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Sales Profit Details</CardTitle>
                <CardDescription>Invoice level revenue, cost, profit, and margin</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {reportSales.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Profit</TableHead>
                        <TableHead>Margin %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportSales.map(row => (
                        <TableRow key={row.invoiceNumber}>
                          <TableCell className="font-medium">{row.invoiceNumber}</TableCell>
                          <TableCell>{row.customerName}</TableCell>
                          <TableCell>{row.date}</TableCell>
                          <TableCell>LKR {row.revenue.toLocaleString()}</TableCell>
                          <TableCell>LKR {row.cost.toLocaleString()}</TableCell>
                          <TableCell className={row.profit >= 0 ? 'font-medium text-green-600' : 'font-medium text-red-600'}>
                            LKR {row.profit.toLocaleString()}
                          </TableCell>
                          <TableCell>{row.margin.toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  No sales data for selected period
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profit" className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <CardHeader>
                <CardTitle>Daily Profit Trend</CardTitle>
                <CardDescription>Daily sales, cost, and profit for the active filter</CardDescription>
              </CardHeader>
              <CardContent>
                {dailyProfitData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={dailyProfitData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="profit" stroke="hsl(var(--chart-4))" name="Profit" strokeWidth={3} />
                      <Line type="monotone" dataKey="sales" stroke="hsl(var(--chart-1))" name="Sales" />
                      <Line type="monotone" dataKey="cost" stroke="hsl(var(--chart-2))" name="Cost" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-64 items-center justify-center text-muted-foreground">
                    No profit trend data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Profit</CardTitle>
                <CardDescription>Profit contribution by hardware category</CardDescription>
              </CardHeader>
              <CardContent>
                {categoryStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={categoryStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" interval={0} angle={-12} textAnchor="end" height={64} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="profit" fill="hsl(var(--chart-3))" radius={[8, 8, 0, 0]} name="Profit" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-64 items-center justify-center text-muted-foreground">
                    No category profit data
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Category Profit Table</CardTitle>
              <CardDescription>Revenue, cost, profit, and margin by category</CardDescription>
            </CardHeader>
            <CardContent>
              {categoryStats.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Units</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Profit</TableHead>
                        <TableHead>Margin %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoryStats.map(row => (
                        <TableRow key={row.category}>
                          <TableCell className="font-medium">{row.category}</TableCell>
                          <TableCell>{row.quantity}</TableCell>
                          <TableCell>LKR {row.revenue.toLocaleString()}</TableCell>
                          <TableCell>LKR {row.cost.toLocaleString()}</TableCell>
                          <TableCell className={row.profit >= 0 ? 'font-medium text-green-600' : 'font-medium text-red-600'}>
                            LKR {row.profit.toLocaleString()}
                          </TableCell>
                          <TableCell>{row.margin.toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  No category data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Low Margin Products</CardTitle>
              <CardDescription>Products below 15% margin that need pricing review</CardDescription>
            </CardHeader>
            <CardContent>
              {lowMarginProducts.length > 0 ? (
                <div className="space-y-2">
                  {lowMarginProducts.map(product => (
                    <div key={product.id} className="flex items-center justify-between rounded-xl border p-3">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.category} | {product.quantity} units sold</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-amber-600">{product.margin.toFixed(1)}%</p>
                        <p className="text-sm text-muted-foreground">Profit: LKR {product.profit.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  No low margin products in the current report range.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Products by Revenue</CardTitle>
              <CardDescription>Best performing products by sales value and profit</CardDescription>
            </CardHeader>
            <CardContent>
              {productStats.length > 0 ? (
                <div className="space-y-2">
                  {productStats.map((product, idx) => (
                    <div key={product.id} className="flex items-center justify-between rounded-md border p-3 hover:bg-muted">
                      <div>
                        <p className="font-medium">
                          {idx + 1}. {product.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {product.category} | {product.quantity} units sold | {product.margin.toFixed(1)}% margin
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">LKR {product.revenue.toLocaleString()}</p>
                        <p className="text-sm text-green-600">Profit: LKR {product.profit.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  No product sales data
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Sales Orders:</span>
                  <span className="font-semibold">{filteredSales.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Purchase Orders:</span>
                  <span className="font-semibold">{filteredPurchases.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Avg Order Value:</span>
                  <span className="font-semibold">LKR {filteredSales.length > 0 ? (totalSalesRevenue / filteredSales.length).toLocaleString() : '0'}</span>
                </div>
                <div className="flex items-center justify-between">
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
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Customer Due:</span>
                  <span className="font-semibold text-amber-600">LKR {totalCustomerDue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Supplier Due:</span>
                  <span className="font-semibold text-amber-600">LKR {totalSupplierDue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Inventory Value:</span>
                  <span className="font-semibold">LKR {store.brandVariants.reduce((sum, v) => sum + (v.currentStock * v.costPrice), 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="font-semibold text-muted-foreground">Net Position:</span>
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
