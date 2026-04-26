'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { ProductPicker } from '@/components/product-picker';
import { QuotationBuilderCard } from '@/components/quotation-builder-card';
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
import { Plus, Trash2, Eye, Printer, AlertCircle, PencilLine, ShoppingCart, Landmark, BadgeDollarSign, Clock3 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { buildQuotationDocument, loadImageDataUrl, mapSavedQuotationToPrintPayload, waitForWindowImages } from '@/lib/quotation-print';

type QuotationRecord = {
  id: string;
  savedAt: string;
  quoteNumber: string;
  quoteDate: string;
  validUntil: string;
  customerName: string;
  customerContact: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  notes: string;
  lines: Array<{
    id: string;
    productId: string;
    itemName: string;
    description: string;
    quantity: string;
    rate: string;
    discount: string;
    discountType: 'fixed' | 'percent';
  }>;
  subtotal: number;
  discountTotal: number;
  grandTotal: number;
};

const QUOTATION_STORAGE_KEY = 'quotation_builder_saves';

export default function SalesPage() {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [quotationOpen, setQuotationOpen] = useState(false);
  const [quotationRecords, setQuotationRecords] = useState<QuotationRecord[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [newCustomerCompanyName, setNewCustomerCompanyName] = useState('');
  const [newCustomerContactPerson, setNewCustomerContactPerson] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerAddress, setNewCustomerAddress] = useState('');
  const [newCustomerCreditLimit, setNewCustomerCreditLimit] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [discount, setDiscount] = useState('0');
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('percent');
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState(`SAL-${Date.now()}`);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [selectedPaymentSale, setSelectedPaymentSale] = useState<string | null>(null);
  const [initialPaidAmount, setInitialPaidAmount] = useState('0');
  const [editingSale, setEditingSale] = useState<any>(null);
  const [editSelectedCustomer, setEditSelectedCustomer] = useState('');
  const [editSelectedBrand, setEditSelectedBrand] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editUnitPrice, setEditUnitPrice] = useState('');
  const [editDiscount, setEditDiscount] = useState('0');
  const [editDiscountType, setEditDiscountType] = useState<'fixed' | 'percent'>('percent');
  const [editLineItems, setEditLineItems] = useState<any[]>([]);
  const [editInvoiceNumber, setEditInvoiceNumber] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editPaidAmount, setEditPaidAmount] = useState('0');

  const loadQuotationRecords = () => {
    if (typeof window === 'undefined') return;

    try {
      const raw = window.localStorage.getItem(QUOTATION_STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as QuotationRecord[]) : [];
      setQuotationRecords(Array.isArray(parsed) ? parsed : []);
    } catch {
      setQuotationRecords([]);
    }
  };

  useEffect(() => {
    loadQuotationRecords();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === QUOTATION_STORAGE_KEY) {
        loadQuotationRecords();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleAddLineItem = () => {
    if (!selectedBrand || !quantity || !unitPrice) return;

    const variant = store.brandVariants.find(b => b.id === selectedBrand);
    if (!variant) return;

    // Check stock
    if (parseInt(quantity) > variant.currentStock) {
      alert(`Insufficient stock! Available: ${variant.currentStock}`);
      return;
    }

    const itemTotal = parseInt(quantity) * parseFloat(unitPrice);
    const discountAmount = discountType === 'percent'
      ? (itemTotal * parseFloat(discount)) / 100
      : parseFloat(discount);

    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      brandVariantId: selectedBrand,
      quantity: parseInt(quantity),
      unitPrice: parseFloat(unitPrice),
      discount: discountAmount,
      totalAmount: itemTotal - discountAmount,
      variantInfo: variant,
    };

    setLineItems([...lineItems, newItem]);
    setSelectedBrand('');
    setQuantity('');
    setUnitPrice('');
    setDiscount('0');
  };

  const handleCreateSale = () => {
    if (!selectedCustomer || lineItems.length === 0) return;

    const subtotal = lineItems.reduce((sum, item) => sum + (parseInt(item.quantity) * item.unitPrice), 0);
    const totalDiscount = lineItems.reduce((sum, item) => sum + item.discount, 0);
    const totalAmount = lineItems.reduce((sum, item) => sum + item.totalAmount, 0);

    store.addSale(
      selectedCustomer,
      lineItems.map(item => ({
        brandVariantId: item.brandVariantId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        totalAmount: item.totalAmount,
      })),
      subtotal,
      totalDiscount,
      totalAmount,
      invoiceNumber,
      dueDate ? new Date(dueDate) : undefined,
      notes || undefined,
      Number(initialPaidAmount || 0)
    );

    // Reset form
    setSelectedCustomer('');
    setLineItems([]);
    setInvoiceNumber(`SAL-${Date.now()}`);
    setDueDate('');
    setNotes('');
    setInitialPaidAmount('0');
    setOpen(false);
    setShowCustomerForm(false);
    setNewCustomerCompanyName('');
    setNewCustomerContactPerson('');
    setNewCustomerPhone('');
    setNewCustomerAddress('');
    setNewCustomerCreditLimit('');
    setNewCustomerEmail('');
  };

  const handleCreateInlineCustomer = () => {
    if (
      !newCustomerCompanyName.trim() ||
      !newCustomerContactPerson.trim() ||
      !newCustomerPhone.trim() ||
      !newCustomerAddress.trim() ||
      !newCustomerCreditLimit
    ) {
      return;
    }

    const customerId = store.addCustomer(
      newCustomerCompanyName.trim(),
      newCustomerContactPerson.trim(),
      newCustomerPhone.trim(),
      newCustomerAddress.trim(),
      Number(newCustomerCreditLimit || 0),
      newCustomerEmail.trim() || undefined
    );

    setSelectedCustomer(customerId);
    setShowCustomerForm(false);
    setNewCustomerCompanyName('');
    setNewCustomerContactPerson('');
    setNewCustomerPhone('');
    setNewCustomerAddress('');
    setNewCustomerCreditLimit('');
    setNewCustomerEmail('');
  };

  const handleRecordPayment = () => {
    if (!selectedPaymentSale || !paymentAmount || parseFloat(paymentAmount) <= 0) return;

    store.recordSalePayment(selectedPaymentSale, parseFloat(paymentAmount));
    setPaymentAmount('');
    setSelectedPaymentSale(null);
  };

  const handleDeleteQuotation = (id: string) => {
    if (typeof window === 'undefined') return;

    try {
      const current = JSON.parse(window.localStorage.getItem(QUOTATION_STORAGE_KEY) || '[]') as QuotationRecord[];
      const next = current.filter(record => record.id !== id);
      window.localStorage.setItem(QUOTATION_STORAGE_KEY, JSON.stringify(next));
      setQuotationRecords(next);
    } catch {
      setQuotationRecords([]);
    }
  };

  const printQuotationRecord = async (record: QuotationRecord) => {
    const quotePayload = mapSavedQuotationToPrintPayload(record);
    const logoDataUrl = await loadImageDataUrl('/dtc-logo.jpeg');
    const html = buildQuotationDocument(quotePayload, logoDataUrl);
    const win = window.open('', '_blank', 'width=1200,height=900');
    if (!win) return;

    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    await waitForWindowImages(win);
    win.print();
  };

  const handleEditAddLineItem = () => {
    if (!editSelectedBrand || !editQuantity || !editUnitPrice) return;

    const variant = store.brandVariants.find(b => b.id === editSelectedBrand);
    if (!variant) return;

    if (parseInt(editQuantity) > variant.currentStock) {
      alert(`Insufficient stock! Available: ${variant.currentStock}`);
      return;
    }

    const itemTotal = parseInt(editQuantity) * parseFloat(editUnitPrice);
    const discountAmount = editDiscountType === 'percent'
      ? (itemTotal * parseFloat(editDiscount)) / 100
      : parseFloat(editDiscount);

    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      brandVariantId: editSelectedBrand,
      quantity: parseInt(editQuantity),
      unitPrice: parseFloat(editUnitPrice),
      discount: discountAmount,
      totalAmount: itemTotal - discountAmount,
      variantInfo: variant,
    };

    setEditLineItems([...editLineItems, newItem]);
    setEditSelectedBrand('');
    setEditQuantity('');
    setEditUnitPrice('');
    setEditDiscount('0');
  };

  const openEditSale = (sale: any) => {
    setEditingSale(sale);
    setEditSelectedCustomer(sale.customerId || '');
    setEditLineItems(
      sale.lineItems.map((item: any) => ({
        ...item,
        variantInfo: store.brandVariants.find(v => v.id === item.brandVariantId),
      }))
    );
    setEditInvoiceNumber(sale.invoiceNumber || '');
    setEditDueDate(sale.dueDate ? new Date(sale.dueDate).toISOString().slice(0, 10) : '');
    setEditNotes(sale.notes || '');
    setEditPaidAmount(String(sale.paidAmount ?? 0));
  };

  const handleSaveSaleEdit = () => {
    if (!editingSale) return;

    const paidAmount = Math.max(0, Number(editPaidAmount || 0));
    const subtotal = editLineItems.reduce((sum, item) => sum + (parseInt(item.quantity) * item.unitPrice), 0);
    const discountAmount = editLineItems.reduce((sum, item) => sum + item.discount, 0);
    const totalAmount = editLineItems.reduce((sum, item) => sum + item.totalAmount, 0);
    const dueAmount = Math.max(0, totalAmount - paidAmount);

    store.updateSale(editingSale.id, {
      customerId: editSelectedCustomer || editingSale.customerId,
      lineItems: editLineItems.map(item => ({
        id: item.id,
        brandVariantId: item.brandVariantId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        totalAmount: item.totalAmount,
      })),
      subtotal,
      discountAmount,
      totalAmount,
      invoiceNumber: editInvoiceNumber.trim() || editingSale.invoiceNumber,
      dueDate: editDueDate ? new Date(editDueDate) : undefined,
      notes: editNotes.trim() || undefined,
      paidAmount,
      dueAmount,
      status: dueAmount === 0 ? 'paid' : 'completed',
    });

    setEditingSale(null);
  };

  const subtotal = lineItems.reduce((sum, item) => sum + (parseInt(item.quantity) * item.unitPrice), 0);
  const totalDiscount = lineItems.reduce((sum, item) => sum + item.discount, 0);
  const totalAmount = lineItems.reduce((sum, item) => sum + item.totalAmount, 0);
  const saleCount = store.sales.length;
  const totalRevenue = store.sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalPaid = store.sales.reduce((sum, sale) => sum + sale.paidAmount, 0);
  const totalDue = store.sales.reduce((sum, sale) => sum + sale.dueAmount, 0);
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="grid w-full gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <ShoppingCart className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Sales</p>
              <p className="text-xl font-semibold leading-tight">{saleCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600">
              <Landmark className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Revenue</p>
              <p className="text-xl font-semibold leading-tight">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-sky-500/10 text-sky-600">
              <BadgeDollarSign className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Paid</p>
              <p className="text-xl font-semibold leading-tight">{formatCurrency(totalPaid)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-500/10 text-amber-600">
              <Clock3 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Due</p>
              <p className="text-xl font-semibold leading-tight">{formatCurrency(totalDue)}</p>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={quotationOpen} onOpenChange={setQuotationOpen}>
        <DialogContent className="!top-4 !left-4 !right-4 !bottom-4 !translate-x-0 !translate-y-0 !w-auto !max-w-none !max-h-none p-4 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Create Quotation</DialogTitle>
            <DialogDescription>Build and export a quotation inside the popup modal.</DialogDescription>
          </DialogHeader>
          <div className="h-full overflow-y-auto">
            <QuotationBuilderCard onSaved={() => { loadQuotationRecords(); setQuotationOpen(false); }} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="!w-[95vw] !max-w-[90rem] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Sales Order</DialogTitle>
            <DialogDescription>Add items and create a new sales invoice</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Customer Selection */}
            <div className="space-y-2">
              <Label>Customer *</Label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {store.customers.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.companyName}
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
                onClick={() => setShowCustomerForm(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add new customer
              </Button>
            </div>

            <Dialog open={showCustomerForm} onOpenChange={setShowCustomerForm}>
              <DialogContent className="w-[95vw] max-w-[560px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Customer</DialogTitle>
                  <DialogDescription>Create a customer and use it immediately in this sales order.</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Company Name *</Label>
                    <Input
                      value={newCustomerCompanyName}
                      onChange={(e) => setNewCustomerCompanyName(e.target.value)}
                      placeholder="Customer company"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Person *</Label>
                    <Input
                      value={newCustomerContactPerson}
                      onChange={(e) => setNewCustomerContactPerson(e.target.value)}
                      placeholder="Contact person"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone *</Label>
                    <Input
                      value={newCustomerPhone}
                      onChange={(e) => setNewCustomerPhone(e.target.value)}
                      placeholder="Phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Credit Limit *</Label>
                    <Input
                      type="number"
                      value={newCustomerCreditLimit}
                      onChange={(e) => setNewCustomerCreditLimit(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Address *</Label>
                    <Input
                      value={newCustomerAddress}
                      onChange={(e) => setNewCustomerAddress(e.target.value)}
                      placeholder="Customer address"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={newCustomerEmail}
                      onChange={(e) => setNewCustomerEmail(e.target.value)}
                      placeholder="customer@example.com"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCustomerForm(false)}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleCreateInlineCustomer}>
                    Save Customer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

              {/* Line Items Section */}
              {selectedCustomer && (
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

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <div className="min-w-0 space-y-2">
                          <Label>Quantity *</Label>
                          <Input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="0"
                          />
                        </div>
                        <div className="min-w-0 space-y-2">
                          <Label>Unit Price *</Label>
                          <Input
                            type="number"
                            value={unitPrice}
                            onChange={(e) => setUnitPrice(e.target.value)}
                            placeholder="0"
                          />
                        </div>
                        <div className="min-w-0 space-y-2">
                          <Label>Discount</Label>
                          <Input
                            type="number"
                            value={discount}
                            onChange={(e) => setDiscount(e.target.value)}
                            placeholder="0"
                          />
                        </div>
                        <div className="min-w-0 space-y-2">
                          <Label>Type</Label>
                          <Select value={discountType} onValueChange={(v: any) => setDiscountType(v)}>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percent">%</SelectItem>
                              <SelectItem value="fixed">Fixed</SelectItem>
                            </SelectContent>
                          </Select>
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

                  {/* Line Items List */}
                  {lineItems.length > 0 && (
                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-3">Order Items ({lineItems.length})</h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {lineItems.map((item, idx) => (
                          <div key={`${item.brandVariantId}-${idx}`} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.variantInfo.brand} - {item.variantInfo.variantName}</p>
                              <p className="text-xs text-muted-foreground">{item.quantity} × LKR {item.unitPrice}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                {item.discount > 0 && (
                                  <p className="text-xs text-amber-600">-LKR {item.discount.toFixed(0)}</p>
                                )}
                                <span className="font-semibold">LKR {item.totalAmount.toLocaleString()}</span>
                              </div>
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

                      {/* Totals */}
                      <div className="mt-4 space-y-1 pt-3 border-t">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal:</span>
                          <span>LKR {subtotal.toLocaleString()}</span>
                        </div>
                        {totalDiscount > 0 && (
                          <div className="flex justify-between text-sm text-amber-600">
                            <span>Discount:</span>
                            <span>-LKR {totalDiscount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold pt-1 border-t">
                          <span>Total:</span>
                          <span>LKR {totalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Additional Details */}
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
            <Button onClick={handleCreateSale} disabled={!selectedCustomer || lineItems.length === 0}>
              Create Sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

        <Dialog open={!!editingSale} onOpenChange={open => !open && setEditingSale(null)}>
          <DialogContent className="w-[96vw] sm:max-w-4xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Sales Order</DialogTitle>
              <DialogDescription>Update customer, products, invoice details, and payment information.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Customer *</Label>
                <Select value={editSelectedCustomer} onValueChange={setEditSelectedCustomer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {store.customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {editSelectedCustomer && (
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
                        value={editSelectedBrand}
                        onValueChange={setEditSelectedBrand}
                      />

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <div className="min-w-0 space-y-2">
                          <Label>Quantity *</Label>
                          <Input
                            type="number"
                            value={editQuantity}
                            onChange={(e) => setEditQuantity(e.target.value)}
                            placeholder="0"
                          />
                        </div>
                        <div className="min-w-0 space-y-2">
                          <Label>Unit Price *</Label>
                          <Input
                            type="number"
                            value={editUnitPrice}
                            onChange={(e) => setEditUnitPrice(e.target.value)}
                            placeholder="0"
                          />
                        </div>
                        <div className="min-w-0 space-y-2">
                          <Label>Discount</Label>
                          <Input
                            type="number"
                            value={editDiscount}
                            onChange={(e) => setEditDiscount(e.target.value)}
                            placeholder="0"
                          />
                        </div>
                        <div className="min-w-0 space-y-2">
                          <Label>Type</Label>
                          <Select value={editDiscountType} onValueChange={(v: any) => setEditDiscountType(v)}>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percent">%</SelectItem>
                              <SelectItem value="fixed">Fixed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={handleEditAddLineItem}
                      >
                        Add Item
                      </Button>
                    </div>
                  </div>

                  {editLineItems.length > 0 && (
                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-3">Order Items ({editLineItems.length})</h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {editLineItems.map((item, idx) => (
                          <div key={`${item.brandVariantId}-${idx}`} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.variantInfo?.brand || 'Unknown'} - {item.variantInfo?.variantName || 'Variant'}</p>
                              <p className="text-xs text-muted-foreground">{item.quantity} Ã— LKR {item.unitPrice}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                {item.discount > 0 && (
                                  <p className="text-xs text-amber-600">-LKR {item.discount.toFixed(0)}</p>
                                )}
                                <span className="font-semibold">LKR {item.totalAmount.toLocaleString()}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditLineItems(editLineItems.filter((_, i) => i !== idx))}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4 space-y-3">
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
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingSale(null)}>Cancel</Button>
              <Button onClick={handleSaveSaleEdit} disabled={!editSelectedCustomer || editLineItems.length === 0}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      {/* Sales Table */}
      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle>Saved Quotations</CardTitle>
          <Button className="h-11 gap-2 px-5" onClick={() => setQuotationOpen(true)}>
            <Plus className="w-4 h-4" />
            Create Quotation
          </Button>
        </CardHeader>
        <CardContent>
          {quotationRecords.length > 0 ? (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quotation</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotationRecords.map(record => {
                    return (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.quoteNumber}</TableCell>
                        <TableCell>{record.customerName || 'Walk-in customer'}</TableCell>
                        <TableCell>{new Date(record.quoteDate).toLocaleDateString()}</TableCell>
                        <TableCell>{record.lines.length}</TableCell>
                        <TableCell>{formatCurrency(record.grandTotal)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => printQuotationRecord(record)}>
                              <Printer className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteQuotation(record.id)}>
                              <Trash2 className="w-4 h-4" />
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
              <p className="text-muted-foreground">No saved quotations yet. Create one to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
