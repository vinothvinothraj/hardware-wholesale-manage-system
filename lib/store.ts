'use client';

import React, { createContext, ReactNode } from 'react';
import type {
  BrandVariant,
  Category,
  Customer,
  InventoryAdjustment,
  Model,
  Payment,
  ProductType,
  Purchase,
  Sale,
  Subcategory,
  Supplier,
  User,
  UserRole,
} from './types';
import { seedData } from './seed-data';

const STORAGE_KEYS = {
  currentUser: 'erp_current_user',
  seedVersion: 'erp_seed_version',
  users: 'erp_users',
  categories: 'erp_categories',
  subcategories: 'erp_subcategories',
  productTypes: 'erp_productTypes',
  models: 'erp_models',
  brandVariants: 'erp_brandVariants',
  suppliers: 'erp_suppliers',
  customers: 'erp_customers',
  purchases: 'erp_purchases',
  sales: 'erp_sales',
  payments: 'erp_payments',
  inventoryAdjustments: 'erp_inventory_adjustments',
};

const CURRENT_SEED_VERSION = '2026-04-24-hardware-catalog-v1';

export interface StoreContextType {
  // User
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  login: (name: string, role: UserRole) => void;
  logout: () => void;

  // Categories
  categories: Category[];
  addCategory: (name: string, description?: string) => void;
  updateCategory: (id: string, name: string, description?: string) => void;
  deleteCategory: (id: string) => void;

  // Subcategories
  subcategories: Subcategory[];
  addSubcategory: (categoryId: string, name: string, description?: string) => void;
  updateSubcategory: (id: string, categoryId: string, name: string, description?: string) => void;
  deleteSubcategory: (id: string) => void;

  // Product Types
  productTypes: ProductType[];
  addProductType: (subcategoryId: string, name: string, description?: string) => void;
  updateProductType: (id: string, subcategoryId: string, name: string, description?: string) => void;
  deleteProductType: (id: string) => void;

  // Models
  models: Model[];
  addModel: (productTypeId: string, name: string, costPrice: number, description?: string) => void;
  updateModel: (id: string, productTypeId: string, name: string, costPrice: number, description?: string) => void;
  deleteModel: (id: string) => void;

  // Brand Variants
  brandVariants: BrandVariant[];
  addBrandVariant: (modelId: string, brand: string, variantName: string, costPrice: number, sellingPrice: number, reorderLevel: number, barcode?: string) => void;
  updateBrandVariant: (id: string, brand: string, variantName: string, costPrice: number, sellingPrice: number, reorderLevel: number, barcode?: string) => void;
  deleteBrandVariant: (id: string) => void;
  updateBrandVariantStock: (id: string, quantity: number) => void;

  // Suppliers
  suppliers: Supplier[];
  addSupplier: (companyName: string, contactPerson: string, phone: string, address: string, creditLimit: number, email?: string) => string;
  updateSupplier: (id: string, companyName: string, contactPerson: string, phone: string, address: string, creditLimit: number, email?: string) => void;
  deleteSupplier: (id: string) => void;
  updateSupplierBalance: (id: string, amount: number) => void;

  // Customers
  customers: Customer[];
  addCustomer: (companyName: string, contactPerson: string, phone: string, address: string, creditLimit: number, email?: string) => string;
  updateCustomer: (id: string, companyName: string, contactPerson: string, phone: string, address: string, creditLimit: number, email?: string) => void;
  deleteCustomer: (id: string) => void;
  updateCustomerBalance: (id: string, amount: number) => void;

  // Purchases
  purchases: Purchase[];
  addPurchase: (supplierId: string, lineItems: any[], totalAmount: number, invoiceNumber: string, dueDate?: Date, notes?: string, paidAmount?: number) => void;
  updatePurchase: (id: string, purchase: Partial<Purchase>) => void;
  deletePurchase: (id: string) => void;
  recordPurchasePayment: (purchaseId: string, amount: number) => void;

  // Sales
  sales: Sale[];
  addSale: (customerId: string, lineItems: any[], subtotal: number, discountAmount: number, totalAmount: number, invoiceNumber: string, dueDate?: Date, notes?: string, paidAmount?: number) => void;
  updateSale: (id: string, sale: Partial<Sale>) => void;
  deleteSale: (id: string) => void;
  recordSalePayment: (saleId: string, amount: number) => void;

  // Payments
  payments: Payment[];

  // Inventory Adjustments
  inventoryAdjustments: InventoryAdjustment[];
  recordInventoryAdjustment: (brandVariantId: string, quantityChange: number, reason: string, notes?: string) => void;

  // Utility
  getProductHierarchy: (categoryId?: string) => any;
  searchProducts: (query: string) => BrandVariant[];
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  const [currentUser, setCurrentUserState] = React.useState<User | null>(null);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [subcategories, setSubcategories] = React.useState<Subcategory[]>([]);
  const [productTypes, setProductTypes] = React.useState<ProductType[]>([]);
  const [models, setModels] = React.useState<Model[]>([]);
  const [brandVariants, setBrandVariants] = React.useState<BrandVariant[]>([]);
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [purchases, setPurchases] = React.useState<Purchase[]>([]);
  const [sales, setSales] = React.useState<Sale[]>([]);
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [inventoryAdjustments, setInventoryAdjustments] = React.useState<InventoryAdjustment[]>([]);

  React.useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const savedSeedVersion = localStorage.getItem(STORAGE_KEYS.seedVersion);
      const shouldUseSeedData = savedSeedVersion !== CURRENT_SEED_VERSION;

      if (shouldUseSeedData) {
        setCategories(seedData.categories);
        setSubcategories(seedData.subcategories);
        setProductTypes(seedData.productTypes);
        setModels(seedData.models);
        setBrandVariants(seedData.brandVariants);
        setSuppliers(seedData.suppliers);
        setCustomers(seedData.customers);
        setPurchases(seedData.purchases);
        setSales(seedData.sales);
        setPayments(seedData.payments);
        setInventoryAdjustments(seedData.inventoryAdjustments);
        localStorage.setItem(STORAGE_KEYS.seedVersion, CURRENT_SEED_VERSION);
        return;
      }

      const savedUser = localStorage.getItem(STORAGE_KEYS.currentUser);
      if (savedUser) setCurrentUserState(JSON.parse(savedUser));

      const savedCategories = localStorage.getItem(STORAGE_KEYS.categories);
      if (savedCategories) setCategories(JSON.parse(savedCategories));

      const savedSubcategories = localStorage.getItem(STORAGE_KEYS.subcategories);
      if (savedSubcategories) setSubcategories(JSON.parse(savedSubcategories));

      const savedProductTypes = localStorage.getItem(STORAGE_KEYS.productTypes);
      if (savedProductTypes) setProductTypes(JSON.parse(savedProductTypes));

      const savedModels = localStorage.getItem(STORAGE_KEYS.models);
      if (savedModels) setModels(JSON.parse(savedModels));

      const savedBrandVariants = localStorage.getItem(STORAGE_KEYS.brandVariants);
      if (savedBrandVariants) setBrandVariants(JSON.parse(savedBrandVariants));

      const savedSuppliers = localStorage.getItem(STORAGE_KEYS.suppliers);
      if (savedSuppliers) setSuppliers(JSON.parse(savedSuppliers));

      const savedCustomers = localStorage.getItem(STORAGE_KEYS.customers);
      if (savedCustomers) setCustomers(JSON.parse(savedCustomers));

      const savedPurchases = localStorage.getItem(STORAGE_KEYS.purchases);
      if (savedPurchases) setPurchases(JSON.parse(savedPurchases));

      const savedSales = localStorage.getItem(STORAGE_KEYS.sales);
      if (savedSales) setSales(JSON.parse(savedSales));

      const savedPayments = localStorage.getItem(STORAGE_KEYS.payments);
      if (savedPayments) setPayments(JSON.parse(savedPayments));

      const savedAdjustments = localStorage.getItem(STORAGE_KEYS.inventoryAdjustments);
      if (savedAdjustments) setInventoryAdjustments(JSON.parse(savedAdjustments));
    }
  }, []);

  React.useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    const isEmpty =
      categories.length === 0 &&
      subcategories.length === 0 &&
      productTypes.length === 0 &&
      models.length === 0 &&
      brandVariants.length === 0 &&
      suppliers.length === 0 &&
      customers.length === 0 &&
      purchases.length === 0 &&
      sales.length === 0 &&
      payments.length === 0 &&
      inventoryAdjustments.length === 0;

    if (!isEmpty) return;

    setCategories(seedData.categories);
    setSubcategories(seedData.subcategories);
    setProductTypes(seedData.productTypes);
    setModels(seedData.models);
    setBrandVariants(seedData.brandVariants);
    setSuppliers(seedData.suppliers);
    setCustomers(seedData.customers);
    setPurchases(seedData.purchases);
    setSales(seedData.sales);
    setPayments(seedData.payments);
    setInventoryAdjustments(seedData.inventoryAdjustments);
  }, [brandVariants.length, categories.length, customers.length, inventoryAdjustments.length, mounted, models.length, payments.length, purchases.length, sales.length, subcategories.length, suppliers.length, productTypes.length]);

  // Persist to localStorage whenever state changes
  React.useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(currentUser));
    }
  }, [currentUser, mounted]);

  React.useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(categories));
    }
  }, [categories, mounted]);

  React.useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.subcategories, JSON.stringify(subcategories));
    }
  }, [subcategories, mounted]);

  React.useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.productTypes, JSON.stringify(productTypes));
    }
  }, [productTypes, mounted]);

  React.useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.models, JSON.stringify(models));
    }
  }, [models, mounted]);

  React.useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.brandVariants, JSON.stringify(brandVariants));
    }
  }, [brandVariants, mounted]);

  React.useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.suppliers, JSON.stringify(suppliers));
    }
  }, [suppliers, mounted]);

  React.useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(customers));
    }
  }, [customers, mounted]);

  React.useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.purchases, JSON.stringify(purchases));
    }
  }, [purchases, mounted]);

  React.useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.sales, JSON.stringify(sales));
    }
  }, [sales, mounted]);

  React.useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.payments, JSON.stringify(payments));
    }
  }, [payments, mounted]);

  React.useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.inventoryAdjustments, JSON.stringify(inventoryAdjustments));
    }
  }, [inventoryAdjustments, mounted]);

  React.useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.seedVersion, CURRENT_SEED_VERSION);
    }
  }, [mounted]);

  // User functions
  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
  };

  const login = (name: string, role: UserRole) => {
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email: `${name.toLowerCase().replace(' ', '.')}@electrowholesale.com`,
      role,
      createdAt: new Date(),
    };
    setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Category functions
  const addCategory = (name: string, description?: string) => {
    const category: Category = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      description,
      createdAt: new Date(),
    };
    setCategories([...categories, category]);
  };

  const updateCategory = (id: string, name: string, description?: string) => {
    setCategories(categories.map(c => (c.id === id ? { ...c, name, description } : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
    setSubcategories(subcategories.filter(s => s.categoryId !== id));
  };

  // Subcategory functions
  const addSubcategory = (categoryId: string, name: string, description?: string) => {
    const subcategory: Subcategory = {
      id: Math.random().toString(36).substr(2, 9),
      categoryId,
      name,
      description,
      createdAt: new Date(),
    };
    setSubcategories([...subcategories, subcategory]);
  };

  const updateSubcategory = (id: string, categoryId: string, name: string, description?: string) => {
    setSubcategories(subcategories.map(s => (s.id === id ? { ...s, categoryId, name, description } : s)));
  };

  const deleteSubcategory = (id: string) => {
    setSubcategories(subcategories.filter(s => s.id !== id));
    setProductTypes(productTypes.filter(p => p.subcategoryId !== id));
  };

  // ProductType functions
  const addProductType = (subcategoryId: string, name: string, description?: string) => {
    const productType: ProductType = {
      id: Math.random().toString(36).substr(2, 9),
      subcategoryId,
      name,
      description,
      createdAt: new Date(),
    };
    setProductTypes([...productTypes, productType]);
  };

  const updateProductType = (id: string, subcategoryId: string, name: string, description?: string) => {
    setProductTypes(productTypes.map(p => (p.id === id ? { ...p, subcategoryId, name, description } : p)));
  };

  const deleteProductType = (id: string) => {
    setProductTypes(productTypes.filter(p => p.id !== id));
    setModels(models.filter(m => m.productTypeId !== id));
  };

  // Model functions
  const addModel = (productTypeId: string, name: string, costPrice: number, description?: string) => {
    const model: Model = {
      id: Math.random().toString(36).substr(2, 9),
      productTypeId,
      name,
      costPrice,
      description,
      createdAt: new Date(),
    };
    setModels([...models, model]);
  };

  const updateModel = (id: string, productTypeId: string, name: string, costPrice: number, description?: string) => {
    setModels(models.map(m => (m.id === id ? { ...m, productTypeId, name, costPrice, description } : m)));
  };

  const deleteModel = (id: string) => {
    setModels(models.filter(m => m.id !== id));
    setBrandVariants(brandVariants.filter(b => b.modelId !== id));
  };

  // Brand Variant functions
  const addBrandVariant = (
    modelId: string,
    brand: string,
    variantName: string,
    costPrice: number,
    sellingPrice: number,
    reorderLevel: number,
    barcode?: string
  ) => {
    const variant: BrandVariant = {
      id: Math.random().toString(36).substr(2, 9),
      modelId,
      brand,
      variantName,
      costPrice,
      sellingPrice,
      barcode,
      currentStock: 0,
      reorderLevel,
      createdAt: new Date(),
    };
    setBrandVariants([...brandVariants, variant]);
  };

  const updateBrandVariant = (
    id: string,
    brand: string,
    variantName: string,
    costPrice: number,
    sellingPrice: number,
    reorderLevel: number,
    barcode?: string
  ) => {
    setBrandVariants(
      brandVariants.map(b =>
        b.id === id ? { ...b, brand, variantName, costPrice, sellingPrice, reorderLevel, barcode } : b
      )
    );
  };

  const deleteBrandVariant = (id: string) => {
    setBrandVariants(brandVariants.filter(b => b.id !== id));
  };

  const updateBrandVariantStock = (id: string, quantity: number) => {
    setBrandVariants(brandVariants.map(b => (b.id === id ? { ...b, currentStock: quantity } : b)));
  };

  // Supplier functions
  const addSupplier = (
    companyName: string,
    contactPerson: string,
    phone: string,
    address: string,
    creditLimit: number,
    email?: string
  ) => {
    const supplier: Supplier = {
      id: Math.random().toString(36).substr(2, 9),
      companyName,
      contactPerson,
      phone,
      email,
      address,
      creditLimit,
      outstandingBalance: 0,
      createdAt: new Date(),
    };
    setSuppliers([...suppliers, supplier]);
    return supplier.id;
  };

  const updateSupplier = (
    id: string,
    companyName: string,
    contactPerson: string,
    phone: string,
    address: string,
    creditLimit: number,
    email?: string
  ) => {
    setSuppliers(
      suppliers.map(s =>
        s.id === id ? { ...s, companyName, contactPerson, phone, address, creditLimit, email } : s
      )
    );
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(suppliers.filter(s => s.id !== id));
  };

  const updateSupplierBalance = (id: string, amount: number) => {
    setSuppliers(suppliers.map(s => (s.id === id ? { ...s, outstandingBalance: amount } : s)));
  };

  // Customer functions
  const addCustomer = (
    companyName: string,
    contactPerson: string,
    phone: string,
    address: string,
    creditLimit: number,
    email?: string
  ) => {
    const customer: Customer = {
      id: Math.random().toString(36).substr(2, 9),
      companyName,
      contactPerson,
      phone,
      email,
      address,
      creditLimit,
      outstandingBalance: 0,
      createdAt: new Date(),
    };
    setCustomers([...customers, customer]);
    return customer.id;
  };

  const updateCustomer = (
    id: string,
    companyName: string,
    contactPerson: string,
    phone: string,
    address: string,
    creditLimit: number,
    email?: string
  ) => {
    setCustomers(
      customers.map(c =>
        c.id === id ? { ...c, companyName, contactPerson, phone, address, creditLimit, email } : c
      )
    );
  };

  const deleteCustomer = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
  };

  const updateCustomerBalance = (id: string, amount: number) => {
    setCustomers(customers.map(c => (c.id === id ? { ...c, outstandingBalance: amount } : c)));
  };

  // Purchase functions
  const addPurchase = (
    supplierId: string,
    lineItems: any[],
    totalAmount: number,
    invoiceNumber: string,
    dueDate?: Date,
    notes?: string,
    paidAmount = 0
  ) => {
    const safePaidAmount = Math.min(Math.max(0, paidAmount), totalAmount);
    const dueAmount = Math.max(0, totalAmount - safePaidAmount);
    const purchase: Purchase = {
      id: Math.random().toString(36).substr(2, 9),
      supplierId,
      lineItems,
      totalAmount,
      paidAmount: safePaidAmount,
      dueAmount,
      status: dueAmount === 0 ? 'paid' : 'completed',
      invoiceNumber,
      purchaseDate: new Date(),
      dueDate,
      notes,
      createdAt: new Date(),
    };
    setPurchases([...purchases, purchase]);
    updateSupplierBalance(supplierId, (suppliers.find(s => s.id === supplierId)?.outstandingBalance || 0) + dueAmount);

    // Update inventory
    lineItems.forEach((item: any) => {
      const variant = brandVariants.find(b => b.id === item.brandVariantId);
      if (variant) {
        updateBrandVariantStock(item.brandVariantId, variant.currentStock + item.quantity);
      }
    });
  };

  const updatePurchase = (id: string, purchase: Partial<Purchase>) => {
    setPurchases(purchases.map(p => (p.id === id ? { ...p, ...purchase } : p)));
  };

  const deletePurchase = (id: string) => {
    const purchase = purchases.find(p => p.id === id);
    if (purchase) {
      setPurchases(purchases.filter(p => p.id !== id));
      updateSupplierBalance(purchase.supplierId, Math.max(0, (suppliers.find(s => s.id === purchase.supplierId)?.outstandingBalance || 0) - purchase.dueAmount));
      purchase.lineItems.forEach((item: any) => {
        const variant = brandVariants.find(b => b.id === item.brandVariantId);
        if (variant) {
          updateBrandVariantStock(item.brandVariantId, Math.max(0, variant.currentStock - item.quantity));
        }
      });
    }
  };

  const recordPurchasePayment = (purchaseId: string, amount: number) => {
    const purchase = purchases.find(p => p.id === purchaseId);
    if (purchase) {
      const newPaidAmount = purchase.paidAmount + amount;
      updatePurchase(purchaseId, {
        paidAmount: newPaidAmount,
        dueAmount: Math.max(0, purchase.totalAmount - newPaidAmount),
        status: newPaidAmount >= purchase.totalAmount ? 'paid' : 'completed',
      });
      const supplier = suppliers.find(s => s.id === purchase.supplierId);
      if (supplier) {
        updateSupplierBalance(purchase.supplierId, Math.max(0, supplier.outstandingBalance - amount));
      }
    }
  };

  // Sale functions
  const addSale = (
    customerId: string,
    lineItems: any[],
    subtotal: number,
    discountAmount: number,
    totalAmount: number,
    invoiceNumber: string,
    dueDate?: Date,
    notes?: string,
    paidAmount = 0
  ) => {
    const safePaidAmount = Math.min(Math.max(0, paidAmount), totalAmount);
    const dueAmount = Math.max(0, totalAmount - safePaidAmount);
    const sale: Sale = {
      id: Math.random().toString(36).substr(2, 9),
      customerId,
      lineItems,
      subtotal,
      discountAmount,
      totalAmount,
      paidAmount: safePaidAmount,
      dueAmount,
      status: dueAmount === 0 ? 'paid' : 'completed',
      invoiceNumber,
      saleDate: new Date(),
      dueDate,
      notes,
      createdAt: new Date(),
    };
    setSales([...sales, sale]);
    updateCustomerBalance(customerId, (customers.find(c => c.id === customerId)?.outstandingBalance || 0) + dueAmount);

    // Update inventory
    lineItems.forEach((item: any) => {
      const variant = brandVariants.find(b => b.id === item.brandVariantId);
      if (variant) {
        updateBrandVariantStock(item.brandVariantId, Math.max(0, variant.currentStock - item.quantity));
      }
    });
  };

  const updateSale = (id: string, sale: Partial<Sale>) => {
    setSales(sales.map(s => (s.id === id ? { ...s, ...sale } : s)));
  };

  const deleteSale = (id: string) => {
    const sale = sales.find(s => s.id === id);
    if (sale) {
      setSales(sales.filter(s => s.id !== id));
      updateCustomerBalance(sale.customerId, Math.max(0, (customers.find(c => c.id === sale.customerId)?.outstandingBalance || 0) - sale.dueAmount));
      sale.lineItems.forEach((item: any) => {
        const variant = brandVariants.find(b => b.id === item.brandVariantId);
        if (variant) {
          updateBrandVariantStock(item.brandVariantId, variant.currentStock + item.quantity);
        }
      });
    }
  };

  const recordSalePayment = (saleId: string, amount: number) => {
    const sale = sales.find(s => s.id === saleId);
    if (sale) {
      const newPaidAmount = sale.paidAmount + amount;
      updateSale(saleId, {
        paidAmount: newPaidAmount,
        dueAmount: Math.max(0, sale.totalAmount - newPaidAmount),
        status: newPaidAmount >= sale.totalAmount ? 'paid' : 'completed',
      });
      const customer = customers.find(c => c.id === sale.customerId);
      if (customer) {
        updateCustomerBalance(sale.customerId, Math.max(0, customer.outstandingBalance - amount));
      }
    }
  };

  // Inventory adjustment
  const recordInventoryAdjustment = (brandVariantId: string, quantityChange: number, reason: string, notes?: string) => {
    const adjustment: InventoryAdjustment = {
      id: Math.random().toString(36).substr(2, 9),
      brandVariantId,
      quantityChange,
      reason: reason as any,
      notes,
      adjustedAt: new Date(),
      createdAt: new Date(),
    };
    setInventoryAdjustments([...inventoryAdjustments, adjustment]);

    const variant = brandVariants.find(b => b.id === brandVariantId);
    if (variant) {
      updateBrandVariantStock(brandVariantId, Math.max(0, variant.currentStock + quantityChange));
    }
  };

  // Utility functions
  const getProductHierarchy = (categoryId?: string) => {
    if (!categoryId) {
      return categories.map(cat => ({
        ...cat,
        subcategories: subcategories
          .filter(s => s.categoryId === cat.id)
          .map(sub => ({
            ...sub,
            productTypes: productTypes
              .filter(p => p.subcategoryId === sub.id)
              .map(pt => ({
                ...pt,
                models: models
                  .filter(m => m.productTypeId === pt.id)
                  .map(mod => ({
                    ...mod,
                    variants: brandVariants.filter(b => b.modelId === mod.id),
                  })),
              })),
          })),
      }));
    }

    const cat = categories.find(c => c.id === categoryId);
    if (!cat) return null;

    return {
      ...cat,
      subcategories: subcategories
        .filter(s => s.categoryId === cat.id)
        .map(sub => ({
          ...sub,
          productTypes: productTypes
            .filter(p => p.subcategoryId === sub.id)
            .map(pt => ({
              ...pt,
              models: models
                .filter(m => m.productTypeId === pt.id)
                .map(mod => ({
                  ...mod,
                  variants: brandVariants.filter(b => b.modelId === mod.id),
                })),
            })),
        })),
    };
  };

  const searchProducts = (query: string): BrandVariant[] => {
    const lowerQuery = query.toLowerCase();
    return brandVariants.filter(b => {
      const model = models.find(m => m.id === b.modelId);
      const pt = productTypes.find(p => p.id === model?.productTypeId);
      const sub = subcategories.find(s => s.id === pt?.subcategoryId);
      const cat = categories.find(c => c.id === sub?.categoryId);

      return (
        b.brand.toLowerCase().includes(lowerQuery) ||
        b.variantName.toLowerCase().includes(lowerQuery) ||
        b.barcode?.toLowerCase().includes(lowerQuery) ||
        model?.name.toLowerCase().includes(lowerQuery) ||
        pt?.name.toLowerCase().includes(lowerQuery) ||
        sub?.name.toLowerCase().includes(lowerQuery) ||
        cat?.name.toLowerCase().includes(lowerQuery)
      );
    });
  };

  const value: StoreContextType = {
    currentUser,
    setCurrentUser,
    login,
    logout,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    subcategories,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
    productTypes,
    addProductType,
    updateProductType,
    deleteProductType,
    models,
    addModel,
    updateModel,
    deleteModel,
    brandVariants,
    addBrandVariant,
    updateBrandVariant,
    deleteBrandVariant,
    updateBrandVariantStock,
    suppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    updateSupplierBalance,
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    updateCustomerBalance,
    purchases,
    addPurchase,
    updatePurchase,
    deletePurchase,
    recordPurchasePayment,
    sales,
    addSale,
    updateSale,
    deleteSale,
    recordSalePayment,
    payments,
    inventoryAdjustments,
    recordInventoryAdjustment,
    getProductHierarchy,
    searchProducts,
  };

  return React.createElement(StoreContext.Provider, { value }, children);
}

export function useStore(): StoreContextType {
  const context = React.useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
