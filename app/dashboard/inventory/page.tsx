'use client';

import { type ComponentType, useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertCircle,
  BarChart3,
  Boxes,
  CheckCircle2,
  CircleAlert,
  Package,
  Search,
  TrendingDown,
  XCircle,
} from 'lucide-react';

export default function InventoryPage() {
  const store = useStore();
  const [filterStatus, setFilterStatus] = useState<'all' | 'healthy' | 'low' | 'out'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [adjustmentOpen, setAdjustmentOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [quantityChange, setQuantityChange] = useState('');
  const [reason, setReason] = useState('count_correction');
  const [notes, setNotes] = useState('');

  const getStatus = (variant: (typeof store.brandVariants)[number]) => {
    if (variant.currentStock === 0) return 'out';
    if (variant.currentStock <= variant.reorderLevel) return 'low';
    return 'healthy';
  };

  const matchesSearch = (variant: (typeof store.brandVariants)[number]) => {
    if (!searchQuery.trim()) return true;
    const lower = searchQuery.toLowerCase();
    const model = store.models.find(m => m.id === variant.modelId);
    const pt = store.productTypes.find(p => p.id === model?.productTypeId);
    const sub = store.subcategories.find(s => s.id === pt?.subcategoryId);
    const cat = store.categories.find(c => c.id === sub?.categoryId);

    return (
      variant.brand.toLowerCase().includes(lower) ||
      variant.variantName.toLowerCase().includes(lower) ||
      variant.barcode?.toLowerCase().includes(lower) ||
      model?.name.toLowerCase().includes(lower) ||
      pt?.name.toLowerCase().includes(lower) ||
      sub?.name.toLowerCase().includes(lower) ||
      cat?.name.toLowerCase().includes(lower)
    );
  };

  const visibleVariants = store.brandVariants.filter(variant => {
    const status = getStatus(variant);
    if (filterStatus !== 'all' && status !== filterStatus) return false;
    return matchesSearch(variant);
  });

  const groupedVariants = {
    healthy: visibleVariants.filter(variant => getStatus(variant) === 'healthy'),
    low: visibleVariants.filter(variant => getStatus(variant) === 'low'),
    out: visibleVariants.filter(variant => getStatus(variant) === 'out'),
  };

  const healthyCount = store.brandVariants.filter(variant => getStatus(variant) === 'healthy').length;
  const lowStockCount = store.brandVariants.filter(variant => getStatus(variant) === 'low').length;
  const outOfStockCount = store.brandVariants.filter(variant => getStatus(variant) === 'out').length;
  const reorderAlertCount = lowStockCount + outOfStockCount;
  const totalValue = store.brandVariants.reduce((sum, variant) => sum + variant.currentStock * variant.costPrice, 0);
  const totalUnits = store.brandVariants.reduce((sum, variant) => sum + variant.currentStock, 0);

  type InventoryStat = {
    label: string;
    value: number | string;
    icon: ComponentType<{ className?: string }>;
    tone: string;
  };

  const handleAdjustment = () => {
    if (!selectedVariant || !quantityChange) return;

    store.recordInventoryAdjustment(
      selectedVariant,
      parseInt(quantityChange),
      reason,
      notes || undefined
    );

    setSelectedVariant('');
    setQuantityChange('');
    setReason('count_correction');
    setNotes('');
    setAdjustmentOpen(false);
  };

  const stats: InventoryStat[] = [
    {
      label: 'SKUs',
      value: store.brandVariants.length,
      icon: Boxes,
      tone: 'bg-primary/10 text-primary',
    },
    {
      label: 'Units',
      value: totalUnits,
      icon: Package,
      tone: 'bg-sky-500/10 text-sky-600',
    },
    {
      label: 'Low Stock',
      value: lowStockCount,
      icon: CircleAlert,
      tone: 'bg-amber-500/10 text-amber-600',
    },
    {
      label: 'Reorder Alerts',
      value: reorderAlertCount,
      icon: AlertCircle,
      tone: 'bg-red-500/10 text-red-600',
    },
    {
      label: 'Inventory Value',
      value: `LKR ${totalValue.toLocaleString()}`,
      icon: BarChart3,
      tone: 'bg-emerald-500/10 text-emerald-600',
    },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex min-w-0 items-center gap-3 rounded-xl border bg-muted/30 px-4 py-3">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${stat.tone}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {stat.label}
                </p>
                <p className="truncate text-xl font-semibold leading-tight">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full xl:max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product, brand, model, or barcode..."
            className="pl-9"
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center xl:justify-end">
          <div className="flex flex-wrap gap-2">
            <Button variant={filterStatus === 'all' ? 'default' : 'outline'} onClick={() => setFilterStatus('all')}>
              All ({store.brandVariants.length})
            </Button>
            <Button variant={filterStatus === 'healthy' ? 'default' : 'outline'} onClick={() => setFilterStatus('healthy')}>
              Healthy ({healthyCount})
            </Button>
            <Button variant={filterStatus === 'low' ? 'default' : 'outline'} onClick={() => setFilterStatus('low')}>
              Low Stock ({lowStockCount})
            </Button>
            <Button variant={filterStatus === 'out' ? 'default' : 'outline'} onClick={() => setFilterStatus('out')}>
              Out of Stock ({outOfStockCount})
            </Button>
          </div>

          <Dialog open={adjustmentOpen} onOpenChange={setAdjustmentOpen}>
            <DialogTrigger asChild>
              <Button className="h-11 gap-2 px-5">
                <TrendingDown className="h-4 w-4" />
                Record Adjustment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[460px]">
              <DialogHeader>
                <DialogTitle>Stock Adjustment</DialogTitle>
                <DialogDescription>Record inventory movement for stock correction or loss.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Product *</Label>
                  <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {store.brandVariants.map(variant => (
                        <SelectItem key={variant.id} value={variant.id}>
                          {variant.brand} - {variant.variantName} (Current: {variant.currentStock})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Quantity Change * (+ or -)</Label>
                    <Input
                      type="number"
                      value={quantityChange}
                      onChange={(e) => setQuantityChange(e.target.value)}
                      placeholder="e.g., 5 or -3"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Reason *</Label>
                    <Select value={reason} onValueChange={setReason}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="damage">Damage</SelectItem>
                        <SelectItem value="loss">Loss / Theft</SelectItem>
                        <SelectItem value="count_correction">Count Correction</SelectItem>
                        <SelectItem value="return">Customer Return</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional notes"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setAdjustmentOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAdjustment}>Record</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <CardTitle>Inventory</CardTitle>
          <CardDescription>Grouped by current stock health so you can spot risk quickly.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 xl:grid-cols-3">
            {[
              {
                key: 'healthy',
                title: 'Healthy',
                subtitle: 'Stock above reorder level',
                items: groupedVariants.healthy,
                tone: 'bg-emerald-500/10 text-emerald-600',
                chip: 'bg-emerald-500/10 text-emerald-600',
                border: 'border-emerald-200/70 dark:border-emerald-950/50',
              },
              {
                key: 'low',
                title: 'Low Stock',
                subtitle: 'Needs attention soon',
                items: groupedVariants.low,
                tone: 'bg-amber-500/10 text-amber-600',
                chip: 'bg-amber-500/10 text-amber-600',
                border: 'border-amber-200/70 dark:border-amber-950/50',
              },
              {
                key: 'out',
                title: 'Out of Stock',
                subtitle: 'Requires immediate restock',
                items: groupedVariants.out,
                tone: 'bg-red-500/10 text-red-600',
                chip: 'bg-red-500/10 text-red-600',
                border: 'border-red-200/70 dark:border-red-950/50',
              },
            ].map((lane) => (
              <div key={lane.key} className={`rounded-xl border bg-background p-3 ${lane.border}`}>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{lane.title}</p>
                    <p className="text-xs text-muted-foreground">{lane.subtitle}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${lane.chip}`}>
                    {lane.items.length}
                  </span>
                </div>
                <div className="space-y-2 max-h-[28rem] overflow-y-auto pr-1">
                  {lane.items.length > 0 ? (
                    lane.items.map((variant) => {
                      const model = store.models.find(m => m.id === variant.modelId);
                      const status = getStatus(variant);

                      return (
                        <div key={variant.id} className="rounded-lg border p-3 shadow-sm transition-colors hover:bg-muted/30">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-medium leading-tight">{variant.brand} - {variant.variantName}</p>
                              <p className="text-sm text-muted-foreground">{model?.name}</p>
                            </div>
                            <div className={`rounded-md px-2 py-1 text-xs font-semibold ${lane.tone}`}>
                              {status === 'healthy' ? 'Healthy' : status === 'low' ? 'Low' : 'Out'}
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <p className="text-muted-foreground">Stock</p>
                              <p className="font-semibold">{variant.currentStock}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Reorder</p>
                              <p className="font-semibold">{variant.reorderLevel}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Value</p>
                              <p className="font-semibold">LKR {(variant.currentStock * variant.costPrice).toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="mt-3 flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedVariant(variant.id);
                                setAdjustmentOpen(true);
                              }}
                            >
                              Adjust
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                      No items in this lane
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Levels</CardTitle>
          <CardDescription>Stock status and reorder information for the full catalogue.</CardDescription>
        </CardHeader>
        <CardContent>
          {visibleVariants.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Reorder Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead>Total Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleVariants.map((variant) => {
                    const model = store.models.find(m => m.id === variant.modelId);
                    const status = getStatus(variant);

                    return (
                      <TableRow
                        key={variant.id}
                        className={
                          status === 'out'
                            ? 'bg-red-50 dark:bg-red-950/20'
                            : status === 'low'
                            ? 'bg-amber-50 dark:bg-amber-950/20'
                            : ''
                        }
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">{variant.variantName}</p>
                            <p className="text-sm text-muted-foreground">{model?.name}</p>
                          </div>
                        </TableCell>
                        <TableCell>{variant.brand}</TableCell>
                        <TableCell>
                          <span
                            className={`font-semibold ${
                              status === 'out'
                                ? 'text-red-600'
                                : status === 'low'
                                ? 'text-amber-600'
                                : 'text-green-600'
                            }`}
                          >
                            {variant.currentStock}
                          </span>
                        </TableCell>
                        <TableCell>{variant.reorderLevel}</TableCell>
                        <TableCell>
                          <span
                            className={`rounded px-2 py-1 text-xs font-medium ${
                              status === 'out'
                                ? 'bg-red-100 text-red-700'
                                : status === 'low'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {status === 'out' ? 'Out' : status === 'low' ? 'Low' : 'Healthy'}
                          </span>
                        </TableCell>
                        <TableCell>LKR {variant.costPrice.toLocaleString()}</TableCell>
                        <TableCell className="font-medium">
                          LKR {(variant.currentStock * variant.costPrice).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No products match the selected filter</p>
            </div>
          )}
        </CardContent>
      </Card>

      {store.inventoryAdjustments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Adjustments</CardTitle>
            <CardDescription>Latest inventory changes and correction history.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {store.inventoryAdjustments.slice(-10).reverse().map(adj => {
                const variant = store.brandVariants.find(v => v.id === adj.brandVariantId);
                return (
                  <div key={adj.id} className="flex items-center justify-between rounded-md border p-3">
                    <div className="flex-1">
                      <p className="font-medium">{variant?.brand} {variant?.variantName}</p>
                      <p className="text-sm text-muted-foreground">
                        {adj.reason.replace('_', ' ')} - {new Date(adj.adjustedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-semibold ${adj.quantityChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {adj.quantityChange > 0 ? '+' : ''}{adj.quantityChange}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
