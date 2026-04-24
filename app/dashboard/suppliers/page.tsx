'use client';

import { useState } from 'react';
import type { ComponentType } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Truck,
} from 'lucide-react';

export default function SuppliersPage() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useStore();
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

  const handleOpenDialog = (supplier?: any) => {
    if (supplier) {
      setEditingId(supplier.id);
      setFormData({
        companyName: supplier.companyName,
        contactPerson: supplier.contactPerson,
        phone: supplier.phone,
        email: supplier.email || '',
        address: supplier.address,
        creditLimit: supplier.creditLimit.toString(),
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

  const filteredSuppliers = suppliers.filter(supplier => {
    if (!searchQuery.trim()) return true;
    const lower = searchQuery.toLowerCase();
    return (
      supplier.companyName.toLowerCase().includes(lower) ||
      supplier.contactPerson.toLowerCase().includes(lower) ||
      supplier.phone.toLowerCase().includes(lower) ||
      supplier.email?.toLowerCase().includes(lower) ||
      supplier.address.toLowerCase().includes(lower) ||
      supplier.creditLimit.toString().includes(lower) ||
      supplier.outstandingBalance.toString().includes(lower)
    );
  });

  const totalCreditLimit = suppliers.reduce((sum, supplier) => sum + supplier.creditLimit, 0);
  const totalOutstanding = suppliers.reduce((sum, supplier) => sum + supplier.outstandingBalance, 0);
  const settledSuppliers = suppliers.filter(supplier => supplier.outstandingBalance === 0).length;
  const riskSuppliers = suppliers.filter(supplier => supplier.outstandingBalance > supplier.creditLimit).length;

  type SupplierStat = {
    label: string;
    value: number | string;
    icon: ComponentType<{ className?: string }>;
    tone: string;
  };

  const stats: SupplierStat[] = [
    {
      label: 'Suppliers',
      value: suppliers.length,
      icon: Truck,
      tone: 'bg-primary/10 text-primary',
    },
    {
      label: 'Credit Limit',
      value: `LKR ${totalCreditLimit.toLocaleString()}`,
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
      value: settledSuppliers,
      icon: CheckCircle2,
      tone: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      label: 'Credit Risk',
      value: riskSuppliers,
      icon: ShieldAlert,
      tone: 'bg-red-500/10 text-red-600',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.contactPerson || !formData.phone || !formData.creditLimit) {
      return;
    }

    if (editingId) {
      updateSupplier(
        editingId,
        formData.companyName,
        formData.contactPerson,
        formData.phone,
        formData.address,
        parseFloat(formData.creditLimit),
        formData.email || undefined
      );
    } else {
      addSupplier(
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

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
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

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Supplier List</CardTitle>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-[22rem]">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search suppliers, contact, phone, or address..."
                  className="pl-9"
                />
              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="h-11 gap-2 px-5" onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4" />
                    Add Supplier
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{editingId ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
                    <DialogDescription>
                      {editingId ? 'Update supplier information' : 'Add a new supplier to your network'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name *</Label>
                      <Input
                        id="company"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="e.g., Electronics Ltd"
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
          {filteredSuppliers.length > 0 ? (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Credit Limit</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map(supplier => (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{supplier.companyName}</p>
                          <p className="text-sm text-muted-foreground">{supplier.address}</p>
                        </div>
                      </TableCell>
                      <TableCell>{supplier.contactPerson}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          {supplier.phone}
                        </div>
                      </TableCell>
                      <TableCell>LKR {supplier.creditLimit.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={supplier.outstandingBalance > 0 ? 'text-amber-600 font-medium' : 'text-muted-foreground'}>
                          LKR {supplier.outstandingBalance.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(supplier)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteSupplier(supplier.id)}
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
              <p className="text-muted-foreground">No suppliers yet. Create one to get started.</p>
              <Button className="mt-4 gap-2" onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4" />
                Add First Supplier
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
