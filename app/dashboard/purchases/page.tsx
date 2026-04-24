'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { ProductPicker } from '@/components/product-picker';
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
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2, Eye, Printer, PencilLine, ShoppingCart, Landmark, BadgeDollarSign, Clock3 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function PurchasesPage() {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now()}`);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [viewingPurchase, setViewingPurchase] = useState<any>(null);
  const [initialPaidAmount, setInitialPaidAmount] = useState('0');
  const [editingPurchase, setEditingPurchase] = useState<any>(null);
  const [editInvoiceNumber, setEditInvoiceNumber] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editPaidAmount, setEditPaidAmount] = useState('0');
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [newSupplierCompanyName, setNewSupplierCompanyName] = useState('');
  const [newSupplierContactPerson, setNewSupplierContactPerson] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');
  const [newSupplierAddress, setNewSupplierAddress] = useState('');
  const [newSupplierCreditLimit, setNewSupplierCreditLimit] = useState('');
  const [newSupplierEmail, setNewSupplierEmail] = useState('');

  const handleAddLineItem = () => {
    if (!selectedBrand || !quantity || !unitCost) return;

    const variant = store.brandVariants.find(b => b.id === selectedBrand);
    if (!variant) return;

    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      brandVariantId: selectedBrand,
      quantity: parseInt(quantity),
      unitCost: parseFloat(unitCost),
      totalAmount: parseInt(quantity) * parseFloat(unitCost),
      variantInfo: variant,
    };

    setLineItems([...lineItems, newItem]);
    setSelectedBrand('');
    setQuantity('');
    setUnitCost('');
  };

  const handleCreatePurchase = () => {
    if (!selectedSupplier || lineItems.length === 0) return;

    const totalAmount = lineItems.reduce((sum, item) => sum + item.totalAmount, 0);

    store.addPurchase(
      selectedSupplier,
      lineItems.map(item => ({
        brandVariantId: item.brandVariantId,
        quantity: item.quantity,
        unitCost: item.unitCost,
        totalAmount: item.totalAmount,
      })),
      totalAmount,
      invoiceNumber,
      dueDate ? new Date(dueDate) : undefined,
      notes || undefined,
      Number(initialPaidAmount || 0)
    );

    // Reset form
    setSelectedSupplier('');
    setLineItems([]);
    setInvoiceNumber(`INV-${Date.now()}`);
    setDueDate('');
    setNotes('');
    setInitialPaidAmount('0');
    setShowSupplierForm(false);
    setNewSupplierCompanyName('');
    setNewSupplierContactPerson('');
    setNewSupplierPhone('');
    setNewSupplierAddress('');
    setNewSupplierCreditLimit('');
    setNewSupplierEmail('');
    setOpen(false);
  };

  const handleCreateInlineSupplier = () => {
    if (
      !newSupplierCompanyName.trim() ||
      !newSupplierContactPerson.trim() ||
      !newSupplierPhone.trim() ||
      !newSupplierAddress.trim() ||
      !newSupplierCreditLimit
    ) {
      return;
    }

    const supplierId = store.addSupplier(
      newSupplierCompanyName.trim(),
      newSupplierContactPerson.trim(),
      newSupplierPhone.trim(),
      newSupplierAddress.trim(),
      Number(newSupplierCreditLimit || 0),
      newSupplierEmail.trim() || undefined
    );

    setSelectedSupplier(supplierId);
    setShowSupplierForm(false);
    setNewSupplierCompanyName('');
    setNewSupplierContactPerson('');
    setNewSupplierPhone('');
    setNewSupplierAddress('');
    setNewSupplierCreditLimit('');
    setNewSupplierEmail('');
  };

  const openEditPurchase = (purchase: any) => {
    setEditingPurchase(purchase);
    setEditInvoiceNumber(purchase.invoiceNumber || '');
    setEditDueDate(purchase.dueDate ? new Date(purchase.dueDate).toISOString().slice(0, 10) : '');
    setEditNotes(purchase.notes || '');
    setEditPaidAmount(String(purchase.paidAmount ?? 0));
  };

  const handleSavePurchaseEdit = () => {
    if (!editingPurchase) return;

    const paidAmount = Math.max(0, Number(editPaidAmount || 0));
    const dueAmount = Math.max(0, editingPurchase.totalAmount - paidAmount);

    store.updatePurchase(editingPurchase.id, {
      invoiceNumber: editInvoiceNumber.trim() || editingPurchase.invoiceNumber,
      dueDate: editDueDate ? new Date(editDueDate) : undefined,
      notes: editNotes.trim() || undefined,
      paidAmount,
      dueAmount,
      status: dueAmount === 0 ? 'paid' : 'completed',
    });

    setEditingPurchase(null);
  };

  const totalAmount = lineItems.reduce((sum, item) => sum + item.totalAmount, 0);
  const purchaseCount = store.purchases.length;
  const purchaseTotal = store.purchases.reduce((sum, item) => sum + item.totalAmount, 0);
  const purchasePaid = store.purchases.reduce((sum, item) => sum + item.paidAmount, 0);
  const purchaseDue = store.purchases.reduce((sum, item) => sum + item.dueAmount, 0);
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="grid w-full gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <ShoppingCart className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Purchases</p>
              <p className="text-xl font-semibold leading-tight">{purchaseCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600">
              <Landmark className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Total Value</p>
              <p className="text-xl font-semibold leading-tight">{formatCurrency(purchaseTotal)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-sky-500/10 text-sky-600">
              <BadgeDollarSign className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Paid</p>
              <p className="text-xl font-semibold leading-tight">{formatCurrency(purchasePaid)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-500/10 text-amber-600">
              <Clock3 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Due</p>
              <p className="text-xl font-semibold leading-tight">{formatCurrency(purchaseDue)}</p>
            </div>
          </div>
        </div>
      </div>

        <Dialog open={!!editingPurchase} onOpenChange={(open) => !open && setEditingPurchase(null)}>
          <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Purchase Order</DialogTitle>
              <DialogDescription>Update invoice details, notes, and payment information</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Invoice Number</Label>
                <Input value={editInvoiceNumber} onChange={(e) => setEditInvoiceNumber(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Paid Amount</Label>
                <Input
                  type="number"
                  value={editPaidAmount}
                  onChange={(e) => setEditPaidAmount(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingPurchase(null)}>
                Cancel
              </Button>
              <Button onClick={handleSavePurchaseEdit}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      {/* Purchases Table */}
      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle>Purchase Orders</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="h-11 gap-2 px-5">
                <Plus className="w-4 h-4" />
                Create Purchase Order
              </Button>
            </DialogTrigger>
            <DialogContent className="!w-[95vw] !max-w-7xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Purchase Order</DialogTitle>
                <DialogDescription>Add items and create a new purchase order</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Supplier *</Label>
                  <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {store.suppliers.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.companyName}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                </div>

                <div className="flex justify-start">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-8 px-0 text-sm"
                    onClick={() => setShowSupplierForm(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add new supplier
                  </Button>
                </div>

                <Dialog open={showSupplierForm} onOpenChange={setShowSupplierForm}>
                  <DialogContent className="w-[95vw] max-w-[560px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Supplier</DialogTitle>
                      <DialogDescription>Create a supplier and use it immediately in this purchase order.</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Company Name *</Label>
                        <Input
                          value={newSupplierCompanyName}
                          onChange={(e) => setNewSupplierCompanyName(e.target.value)}
                          placeholder="Supplier company"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Contact Person *</Label>
                        <Input
                          value={newSupplierContactPerson}
                          onChange={(e) => setNewSupplierContactPerson(e.target.value)}
                          placeholder="Contact person"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone *</Label>
                        <Input
                          value={newSupplierPhone}
                          onChange={(e) => setNewSupplierPhone(e.target.value)}
                          placeholder="Phone number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Credit Limit *</Label>
                        <Input
                          type="number"
                          value={newSupplierCreditLimit}
                          onChange={(e) => setNewSupplierCreditLimit(e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Address *</Label>
                        <Input
                          value={newSupplierAddress}
                          onChange={(e) => setNewSupplierAddress(e.target.value)}
                          placeholder="Supplier address"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={newSupplierEmail}
                          onChange={(e) => setNewSupplierEmail(e.target.value)}
                          placeholder="supplier@example.com"
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowSupplierForm(false)}>
                        Cancel
                      </Button>
                      <Button type="button" onClick={handleCreateInlineSupplier}>
                        Save Supplier
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {selectedSupplier && (
                  <>
                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-3">Add Line Items</h3>
                      <div className="space-y-3">
                        <ProductPicker
                          categories={store.categories}
                          subcategories={store.subcategories}
                          productTypes={store.productTypes}
                          models={store.models}
                          brandVariants={store.brandVariants}
                          value={selectedBrand}
                          onValueChange={setSelectedBrand}
                        />

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Quantity *</Label>
                            <Input
                              type="number"
                              value={quantity}
                              onChange={(e) => setQuantity(e.target.value)}
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Unit Cost *</Label>
                            <Input
                              type="number"
                              value={unitCost}
                              onChange={(e) => setUnitCost(e.target.value)}
                              placeholder="0"
                            />
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={handleAddLineItem}
                        >
                          Add Item
                        </Button>
                      </div>
                    </div>

                    {lineItems.length > 0 && (
                      <div className="border-t pt-4">
                        <h3 className="font-semibold mb-3">Order Items</h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {lineItems.map((item, idx) => (
                            <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                              <div>
                                <p className="font-medium text-sm">{item.variantInfo.brand} - {item.variantInfo.variantName}</p>
                                <p className="text-xs text-muted-foreground">{item.quantity} × LKR {item.unitCost}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">LKR {item.totalAmount.toLocaleString()}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setLineItems(lineItems.filter((_, i) => i !== idx))}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-3 pt-3 border-t flex justify-between items-center">
                          <span className="font-semibold">Total:</span>
                          <span className="text-lg font-bold">LKR {totalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    <div className="border-t pt-4 space-y-3">
                      <div className="space-y-2">
                        <Label>Invoice Number</Label>
                        <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Due Date</Label>
                        <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Notes</Label>
                        <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Paid now</Label>
                        <Input
                          type="number"
                          value={initialPaidAmount}
                          onChange={(e) => setInitialPaidAmount(e.target.value)}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleCreatePurchase} disabled={!selectedSupplier || lineItems.length === 0}>
                  Create Purchase
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {store.purchases.length > 0 ? (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {store.purchases.map(purchase => {
                    const supplier = store.suppliers.find(s => s.id === purchase.supplierId);
                    return (
                      <TableRow key={purchase.id}>
                        <TableCell className="font-medium">{purchase.invoiceNumber}</TableCell>
                        <TableCell>{supplier?.companyName || 'Unknown'}</TableCell>
                        <TableCell>{new Date(purchase.purchaseDate).toLocaleDateString()}</TableCell>
                        <TableCell>{purchase.lineItems.length}</TableCell>
                        <TableCell>LKR {purchase.totalAmount.toLocaleString()}</TableCell>
                        <TableCell>LKR {purchase.paidAmount.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            purchase.status === 'paid' ? 'bg-green-100 text-green-700' :
                            purchase.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditPurchase(purchase)}
                            >
                              <PencilLine className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setViewingPurchase(purchase)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.print()}
                            >
                              <Printer className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No purchases yet. Create one to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

