// User & Auth Types
export type UserRole = 'admin' | 'sales' | 'store_manager';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

// Product Hierarchy Types (5-level structure)
export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface ProductType {
  id: string;
  subcategoryId: string;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface Model {
  id: string;
  productTypeId: string;
  name: string;
  costPrice: number; // Base cost for this model
  description?: string;
  createdAt: Date;
}

export interface BrandVariant {
  id: string;
  modelId: string;
  brand: string;
  variantName: string;
  costPrice: number; // Can override model cost
  sellingPrice: number;
  barcode?: string;
  currentStock: number;
  reorderLevel: number;
  createdAt: Date;
}

// Supplier & Customer Types
export interface Supplier {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address: string;
  creditLimit: number;
  outstandingBalance: number;
  createdAt: Date;
}

export interface Customer {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address: string;
  creditLimit: number;
  outstandingBalance: number;
  createdAt: Date;
}

// Transaction Types
export interface PurchaseLineItem {
  id: string;
  brandVariantId: string;
  quantity: number;
  unitCost: number;
  totalAmount: number;
}

export interface Purchase {
  id: string;
  supplierId: string;
  lineItems: PurchaseLineItem[];
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: 'draft' | 'completed' | 'paid';
  invoiceNumber: string;
  purchaseDate: Date;
  dueDate?: Date;
  notes?: string;
  createdAt: Date;
}

export interface SalesLineItem {
  id: string;
  brandVariantId: string;
  quantity: number;
  unitPrice: number;
  discount: number; // Amount or percentage
  totalAmount: number;
}

export interface Sale {
  id: string;
  customerId: string;
  lineItems: SalesLineItem[];
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: 'draft' | 'completed' | 'paid';
  invoiceNumber: string;
  saleDate: Date;
  dueDate?: Date;
  notes?: string;
  createdAt: Date;
}

// Payment Types
export interface Payment {
  id: string;
  transactionId: string; // Reference to Purchase or Sale
  transactionType: 'purchase' | 'sale';
  amount: number;
  paymentDate: Date;
  paymentMethod: 'cash' | 'cheque' | 'bank_transfer' | 'credit_card';
  reference?: string;
  createdAt: Date;
}

// Inventory Adjustment
export interface InventoryAdjustment {
  id: string;
  brandVariantId: string;
  quantityChange: number; // Positive or negative
  reason: 'damage' | 'loss' | 'count_correction' | 'return' | 'other';
  notes?: string;
  adjustedAt: Date;
  createdAt: Date;
}

// Ledger Entry (for reporting)
export interface LedgerEntry {
  id: string;
  entityId: string; // Supplier or Customer ID
  entityType: 'supplier' | 'customer';
  transactionId: string;
  transactionType: 'purchase' | 'sale' | 'payment';
  amount: number;
  balance: number;
  date: Date;
}

// Report Types
export interface DailySales {
  date: Date;
  totalSales: number;
  totalCost: number;
  profit: number;
  invoiceCount: number;
}

export interface ProductSaleStats {
  brandVariantId: string;
  quantity: number;
  revenue: number;
  profit: number;
}
