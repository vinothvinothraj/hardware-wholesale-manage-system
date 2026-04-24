'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function LedgerPage() {
  const store = useStore();
  const [activeTab, setActiveTab] = useState('customers');

  // Customer Ledger Calculations
  const customerLedger = store.customers.map(customer => {
    const customerSales = store.sales.filter(s => s.customerId === customer.id);
    const totalAmount = customerSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const paidAmount = customerSales.reduce((sum, s) => sum + s.paidAmount, 0);
    const dueAmount = totalAmount - paidAmount;

    return {
      id: customer.id,
      name: customer.companyName,
      contact: customer.contactPerson,
      totalAmount,
      paidAmount,
      dueAmount,
      creditLimit: customer.creditLimit,
      status: dueAmount > 0 ? 'pending' : dueAmount === 0 && totalAmount > 0 ? 'paid' : 'inactive',
      transactions: customerSales.length,
    };
  });

  // Supplier Ledger Calculations
  const supplierLedger = store.suppliers.map(supplier => {
    const supplierPurchases = store.purchases.filter(p => p.supplierId === supplier.id);
    const totalAmount = supplierPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
    const paidAmount = supplierPurchases.reduce((sum, p) => sum + p.paidAmount, 0);
    const dueAmount = totalAmount - paidAmount;

    return {
      id: supplier.id,
      name: supplier.companyName,
      contact: supplier.contactPerson,
      totalAmount,
      paidAmount,
      dueAmount,
      creditLimit: supplier.creditLimit,
      status: dueAmount > 0 ? 'pending' : dueAmount === 0 && totalAmount > 0 ? 'paid' : 'inactive',
      transactions: supplierPurchases.length,
    };
  });

  const customerStats = {
    totalDue: customerLedger.reduce((sum, c) => sum + c.dueAmount, 0),
    totalAmount: customerLedger.reduce((sum, c) => sum + c.totalAmount, 0),
    pendingCount: customerLedger.filter(c => c.status === 'pending').length,
  };

  const supplierStats = {
    totalDue: supplierLedger.reduce((sum, s) => sum + s.dueAmount, 0),
    totalAmount: supplierLedger.reduce((sum, s) => sum + s.totalAmount, 0),
    pendingCount: supplierLedger.filter(s => s.status === 'pending').length,
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="customers">Customer Ledger</TabsTrigger>
          <TabsTrigger value="suppliers">Supplier Ledger</TabsTrigger>
        </TabsList>

        {/* Customer Ledger Tab */}
        <TabsContent value="customers" className="space-y-6">
          {/* Customer Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">LKR {(customerStats.totalAmount / 100000).toFixed(1)}L</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {customerLedger.filter(c => c.totalAmount > 0).length} customers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Amount Received</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">LKR {(customerLedger.reduce((sum, c) => sum + c.paidAmount, 0) / 100000).toFixed(1)}L</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Paid invoices
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Amount Due</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">LKR {(customerStats.totalDue / 100000).toFixed(1)}L</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {customerStats.pendingCount} pending
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Customer Ledger Table */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Accounts</CardTitle>
              <CardDescription>Payment status and outstanding balances</CardDescription>
            </CardHeader>
            <CardContent>
              {customerLedger.length > 0 ? (
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Transactions</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Paid Amount</TableHead>
                        <TableHead>Due Amount</TableHead>
                        <TableHead>Credit Limit</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerLedger
                        .sort((a, b) => b.dueAmount - a.dueAmount)
                        .map(customer => (
                          <TableRow
                            key={customer.id}
                            className={customer.dueAmount > 0 ? 'bg-amber-50 dark:bg-amber-950/20' : ''}
                          >
                            <TableCell className="font-medium">{customer.name}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{customer.contact}</TableCell>
                            <TableCell>{customer.transactions}</TableCell>
                            <TableCell>LKR {customer.totalAmount.toLocaleString()}</TableCell>
                            <TableCell className="text-green-600 font-medium">LKR {customer.paidAmount.toLocaleString()}</TableCell>
                            <TableCell className={customer.dueAmount > 0 ? 'text-amber-600 font-medium' : 'text-green-600'}>
                              LKR {customer.dueAmount.toLocaleString()}
                            </TableCell>
                            <TableCell>LKR {customer.creditLimit.toLocaleString()}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                customer.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                customer.status === 'paid' ? 'bg-green-100 text-green-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No customers yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Supplier Ledger Tab */}
        <TabsContent value="suppliers" className="space-y-6">
          {/* Supplier Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">LKR {(supplierStats.totalAmount / 100000).toFixed(1)}L</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {supplierLedger.filter(s => s.totalAmount > 0).length} suppliers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">LKR {(supplierLedger.reduce((sum, s) => sum + s.paidAmount, 0) / 100000).toFixed(1)}L</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Settled invoices
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Amount Due</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">LKR {(supplierStats.totalDue / 100000).toFixed(1)}L</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {supplierStats.pendingCount} pending
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Supplier Ledger Table */}
          <Card>
            <CardHeader>
              <CardTitle>Supplier Accounts</CardTitle>
              <CardDescription>Payment obligations and outstanding amounts</CardDescription>
            </CardHeader>
            <CardContent>
              {supplierLedger.length > 0 ? (
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Transactions</TableHead>
                        <TableHead>Total Purchases</TableHead>
                        <TableHead>Amount Paid</TableHead>
                        <TableHead>Amount Due</TableHead>
                        <TableHead>Credit Limit</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {supplierLedger
                        .sort((a, b) => b.dueAmount - a.dueAmount)
                        .map(supplier => (
                          <TableRow
                            key={supplier.id}
                            className={supplier.dueAmount > 0 ? 'bg-amber-50 dark:bg-amber-950/20' : ''}
                          >
                            <TableCell className="font-medium">{supplier.name}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{supplier.contact}</TableCell>
                            <TableCell>{supplier.transactions}</TableCell>
                            <TableCell>LKR {supplier.totalAmount.toLocaleString()}</TableCell>
                            <TableCell className="text-green-600 font-medium">LKR {supplier.paidAmount.toLocaleString()}</TableCell>
                            <TableCell className={supplier.dueAmount > 0 ? 'text-amber-600 font-medium' : 'text-green-600'}>
                              LKR {supplier.dueAmount.toLocaleString()}
                            </TableCell>
                            <TableCell>LKR {supplier.creditLimit.toLocaleString()}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                supplier.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                supplier.status === 'paid' ? 'bg-green-100 text-green-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No suppliers yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
