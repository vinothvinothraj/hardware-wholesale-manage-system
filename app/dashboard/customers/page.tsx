'use client';

import { useState } from 'react';
import type { ComponentType } from 'react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BadgeDollarSign,
  CheckCircle2,
  CreditCard,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  Edit2,
  Phone,
  Users,
} from 'lucide-react';

export default function CustomersPage() {
  const { customers, addCustomer, updateCustomer, deleteCustomer, sales } = useStore();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    creditLimit: '',
  });

  const handleOpenDialog = (customer?: any) => {
    if (customer) {
      setEditingId(customer.id);
      setFormData({
        companyName: customer.companyName,
        contactPerson: customer.contactPerson,
        phone: customer.phone,
        email: customer.email || '',
        address: customer.address,
        creditLimit: customer.creditLimit.toString(),
      });
    } else {
      setEditingId(null);
      setFormData({
        companyName: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        creditLimit: '',
      });
    }
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.contactPerson || !formData.phone || !formData.creditLimit) {
      return;
    }

    if (editingId) {
      updateCustomer(
        editingId,
        formData.companyName,
        formData.contactPerson,
        formData.phone,
        formData.address,
        parseFloat(formData.creditLimit),
        formData.email || undefined
      );
    } else {
      addCustomer(
        formData.companyName,
        formData.contactPerson,
        formData.phone,
        formData.address,
        parseFloat(formData.creditLimit),
        formData.email || undefined
      );
    }

    setOpen(false);
  };

  const getTotalSales = (customerId: string) => {
    return sales
      .filter(s => s.customerId === customerId)
      .reduce((sum, s) => sum + s.totalAmount, 0);
  };

  const filteredCustomers = customers.filter(customer => {
    if (!searchQuery.trim()) return true;
    const lower = searchQuery.toLowerCase();
    const totalSales = getTotalSales(customer.id).toString();
    return (
      customer.companyName.toLowerCase().includes(lower) ||
      customer.contactPerson.toLowerCase().includes(lower) ||
      customer.phone.toLowerCase().includes(lower) ||
      customer.email?.toLowerCase().includes(lower) ||
      customer.address.toLowerCase().includes(lower) ||
      totalSales.includes(lower)
    );
  });

  const totalSalesValue = customers.reduce((sum, customer) => sum + getTotalSales(customer.id), 0);
  const totalOutstanding = customers.reduce((sum, customer) => sum + customer.outstandingBalance, 0);
  const creditRiskCount = customers.filter(customer => customer.outstandingBalance > customer.creditLimit).length;
  const settledCustomers = customers.filter(customer => customer.outstandingBalance === 0).length;

  type CustomerStat = {
    label: string;
    value: number | string;
    icon: ComponentType<{ className?: string }>;
    tone: string;
  };

  const stats: CustomerStat[] = [
    {
      label: 'Customers',
      value: customers.length,
      icon: Users,
      tone: 'bg-primary/10 text-primary',
    },
    {
      label: 'Total Sales',
      value: `LKR ${totalSalesValue.toLocaleString()}`,
      icon: BadgeDollarSign,
      tone: 'bg-sky-500/10 text-sky-600',
    },
    {
      label: 'Outstanding',
      value: `LKR ${totalOutstanding.toLocaleString()}`,
      icon: CreditCard,
      tone: 'bg-amber-500/10 text-amber-600',
    },
    {
      label: 'Settled',
      value: settledCustomers,
      icon: CheckCircle2,
      tone: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      label: 'Credit Risk',
      value: creditRiskCount,
      icon: ShieldAlert,
      tone: 'bg-red-500/10 text-red-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex min-w-0 items-center gap-3 rounded-xl border bg-muted/30 px-4 py-3"
              >
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

      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Customer List</CardTitle>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-[22rem]">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search customers, contact, phone, or address..."
                  className="pl-9"
                />
              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="h-11 gap-2 px-5" onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4" />
                    Add Customer
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{editingId ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
                    <DialogDescription>
                      {editingId ? 'Update customer information' : 'Add a new customer'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name *</Label>
                      <Input
                        id="company"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="e.g., Tech Store Inc"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact">Contact Person *</Label>
                      <Input
                        id="contact"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        placeholder="Name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Phone number"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Email address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Full address"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="credit">Credit Limit (LKR) *</Label>
                      <Input
                        id="credit"
                        type="number"
                        value={formData.creditLimit}
                        onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                        placeholder="0"
                        required
                      />
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">{editingId ? 'Update' : 'Add'}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length > 0 ? (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Total Sales</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map(customer => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{customer.companyName}</p>
                          <p className="text-sm text-muted-foreground">{customer.address}</p>
                        </div>
                      </TableCell>
                      <TableCell>{customer.contactPerson}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          {customer.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">LKR {getTotalSales(customer.id).toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <span className={customer.outstandingBalance > 0 ? 'text-amber-600 font-medium' : 'text-muted-foreground'}>
                          LKR {customer.outstandingBalance.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(customer)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteCustomer(customer.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No customers yet. Create one to get started.</p>
              <Button className="mt-4 gap-2" onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4" />
                Add First Customer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
