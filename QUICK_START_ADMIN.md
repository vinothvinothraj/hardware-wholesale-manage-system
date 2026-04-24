# Admin Quick Start Guide - 5 Minutes to Productivity

## 🔐 Login as Administrator

1. Open the app
2. Click **"Admin"** button
3. You now have full access to all 9 modules

---

## 📍 Admin Navigation (Left Sidebar)

```
┌─────────────────────────┐
│    ElectroERP (Admin)   │
├─────────────────────────┤
│ 📊 Dashboard            │ ← Home view with KPIs
│ 📦 Products             │ ← Build product catalog
│ 🚚 Suppliers            │ ← Add suppliers
│ 👥 Customers            │ ← Add customers
│ 🛒 Purchases            │ ← Create purchase orders
│ ⚡ Sales                │ ← Create sales invoices
│ 📦 Inventory            │ ← Track stock levels
│ 📋 Ledger               │ ← Financial records
│ 📊 Reports              │ ← Business analytics
├─────────────────────────┤
│ 🌙 Dark Mode Toggle     │
│ 🚪 Logout               │
└─────────────────────────┘
```

---

## 🚀 Getting Started (Step by Step)

### Step 1: Add Categories (2 min)
**Products → [Add Category Button]**
```
Example:
- Bulbs
- Wires
- Switches
- Fans
- Tubes
```

### Step 2: Add Subcategories (2 min)
**Products → Select Category → [Add Subcategory]**
```
Example (under Bulbs):
- LED Bulbs
- CFL Bulbs
- Incandescent
- Tube Lights
```

### Step 3: Add Suppliers (2 min)
**Suppliers → [Add Supplier]**
```
Fields to Fill:
✓ Company Name (e.g., "Philips Electronics")
✓ Contact Person
✓ Phone Number
✓ Email Address
✓ Address
✓ Credit Limit (e.g., 500000)
```

### Step 4: Add Customers (2 min)
**Customers → [Add Customer]**
```
Fields to Fill:
✓ Company Name (e.g., "ABC Hardware Store")
✓ Contact Person
✓ Phone Number
✓ Email Address
✓ Address
✓ Credit Limit (e.g., 100000)
```

### Step 5: Complete Product Hierarchy (3 min)
**Products → Tab Navigation**

```
Tab 1: Categories & Subcategories
- Click category
- Add Subcategory

Tab 2: Product Types
- Select Subcategory
- Add Product Type (e.g., "9W LED Bulb")

Tab 3: Models
- Select Product Type
- Add Model with Base Cost (e.g., 120 Rs)

Tab 4: Brand Variants
- Select Model
- Add Brand Variant with:
  ✓ Brand Name (e.g., "Philips")
  ✓ Cost Price (180 Rs - from supplier)
  ✓ Selling Price (220 Rs - to customer)
  ✓ Barcode (optional)
  ✓ Reorder Level (low stock alert)
```

### Step 6: Create Your First Purchase (3 min)
**Purchases → [Create New Purchase]**

```
Step A: Select Supplier
- Choose from dropdown
- Auto-fills company details

Step B: Add Items
- Click [Add Item]
- Select Brand Variant (e.g., "Philips 9W LED")
- Enter Quantity (e.g., 100)
- Enter Unit Cost (e.g., 180)
- Total = Quantity × Unit Cost
- Click [Add Item]
- Repeat for more items

Step C: Complete
- Set Due Date
- Add Notes (optional)
- Click [Save Purchase]
- ✅ Inventory updates automatically!
```

### Step 7: Create Your First Sale (3 min)
**Sales → [Create New Sale]**

```
Step A: Select Customer
- Choose from dropdown
- Auto-fills company details

Step B: Add Items
- Click [Add Item]
- Select Brand Variant (e.g., "Philips 9W LED")
- Enter Quantity (e.g., 50)
- Enter Unit Price (e.g., 220)
- Apply Discount (optional, % or fixed amount)
- Total = (Quantity × Price) - Discount
- Click [Add Item]
- Repeat for more items

Step C: Complete
- Set Due Date
- Add Notes (optional)
- Click [Save Invoice]
- ✅ Inventory decreases automatically!
```

### Step 8: Record Payment (1 min)
**Sales → [View Invoice] → [Record Payment]**

```
Dialog:
- Enter Amount Paid (e.g., 5000)
- Payment Date (auto-filled)
- Click [Record]
- Outstanding balance updates automatically
```

### Step 9: Check Inventory (1 min)
**Inventory**

```
View:
- All products with current stock
- Filter: All / Low Stock / Out of Stock
- Quick status: ✓ Green = OK, 🟡 Yellow = Low, 🔴 Red = Out

Adjust Stock:
- Click [Adjust Inventory]
- Select Product
- Enter Quantity Change
- Select Reason (Count Correction, Damage, etc.)
- Add Notes
- Click [Save]
```

### Step 10: View Ledgers (1 min)
**Ledger**

```
Customer Ledger Tab:
- All customers with outstanding balances
- Total due amounts
- Payment status
- Credit utilization

Supplier Ledger Tab:
- All suppliers with outstanding payables
- Total amount owed
- Payment obligations
- Credit utilization
```

### Step 11: Check Reports (1 min)
**Reports**

```
Key Metrics:
- Total Sales Revenue
- Total Profit
- Profit Margin %
- Outstanding Receivables
- Top 10 Products by Sales
- Sales vs Purchase Trends

Features:
- Date range filtering
- Charts and visualizations
- Product performance analysis
```

### Step 12: View Dashboard (1 min)
**Dashboard**

```
KPI Cards:
- Total Sales (amount & invoice count)
- Total Purchases (amount & invoice count)
- Profit (calculated from sales - cost)
- Customer Count

Alerts:
- Low Stock Products
- Out of Stock Products

Charts:
- Sales vs Purchase trends
- Weekly performance
```

---

## ⚡ Common Tasks (Quick Reference)

### Add New Category
```
Products → [Add Category] → Enter Name → Save
```

### Add New Supplier
```
Suppliers → [Add Supplier] → Fill Form → Save
```

### Add New Customer
```
Customers → [Add Customer] → Fill Form → Save
```

### Create Purchase Order
```
Purchases → [New Purchase] 
→ Select Supplier 
→ Add Items 
→ Set Due Date 
→ Save
→ Auto: Stock increases ✓
```

### Create Sales Invoice
```
Sales → [New Sales] 
→ Select Customer 
→ Add Items (with prices) 
→ Apply Discount (optional) 
→ Set Due Date 
→ Save
→ Auto: Stock decreases ✓
```

### Record Payment (Partial)
```
Sales/Purchases → Click Invoice → [Record Payment] 
→ Enter Amount → Save
→ Auto: Outstanding balance updates ✓
```

### Check Outstanding Balance
```
Ledger → Customer/Supplier Ledger 
→ View "Due Amount" column
```

### Adjust Inventory
```
Inventory → [Adjust Inventory] 
→ Select Product 
→ Enter Quantity Change 
→ Select Reason → Save
```

### View Top Products
```
Reports → Product Performance → Top 10 Products
```

### Calculate Profit
```
Reports → Financial Metrics → Shows Profit & Margin
```

---

## 💡 Important Concepts

### Stock Management
- **Purchases**: Stock ⬆️ (Automatic)
- **Sales**: Stock ⬇️ (Automatic)
- **Adjustments**: Manual changes (with reason tracking)

### Outstanding Balance
- **Customer**: Total Sale Amount - Total Paid
- **Supplier**: Total Purchase Amount - Total Paid
- View in: Ledger tab

### Product Pricing
- **Cost Price**: What you pay suppliers (used for profit calc)
- **Selling Price**: What you charge customers (per brand variant)
- **Profit**: Selling Price - Cost Price

### Discounts
- Can apply per item in invoice
- Support fixed amount OR percentage
- Auto-calculated in totals

### Invoice Numbering
- Auto-generated per transaction
- Format: SAL-{timestamp} or INV-{timestamp}
- Unique for each document

---

## 🎯 Key Admin Capabilities

✅ Manage entire product catalog (5 levels deep)  
✅ Create unlimited suppliers and customers  
✅ Create purchase orders with multiple items  
✅ Create sales invoices with multiple items  
✅ Track partial and full payments  
✅ Monitor inventory in real-time  
✅ View financial ledgers (customers & suppliers)  
✅ Generate comprehensive business reports  
✅ Filter data by date ranges  
✅ Apply discounts on sales  
✅ Record inventory adjustments  
✅ Print invoices  
✅ Access all historical data  

---

## 📊 Data Persistence

**All data is automatically saved to your browser:**
- No manual save needed
- Survives browser refresh
- Works completely offline
- Data stored locally on your device

---

## 🔍 Troubleshooting

### Data Not Appearing?
- Refresh page (browser cache)
- Check localStorage in browser DevTools

### Calculation Wrong?
- Verify cost price vs selling price
- Check discount application
- Ensure quantity is correct

### Can't Find Item?
- Use search/filter features
- Check if it's in correct category
- Verify spelling

### Payment Not Recorded?
- Check amount entered
- Verify invoice/purchase exists
- Look in outstanding balance

---

## 🌙 Dark Mode

**Toggle Theme:** Click theme icon in sidebar footer  
Light ↔️ Dark mode syncs across all pages

---

## 🚪 Logout

**Click Logout button** in sidebar footer  
Returns to role selection screen

---

## 📱 Mobile Use

System is fully responsive:
- Click ☰ menu icon on mobile
- Navigate same as desktop
- All functions available

---

## ⏱️ Time Saved

With this system, you can:
- ✅ Create purchase in 30 seconds
- ✅ Create sales in 30 seconds
- ✅ Record payment in 10 seconds
- ✅ Check balance in 5 seconds
- ✅ View reports in 10 seconds

**Total Time: From data to reports in minutes, not hours!**

---

## 🎓 Next Steps

1. **Set up your catalog** (Products)
2. **Add your suppliers** (Suppliers)
3. **Add your customers** (Customers)
4. **Start buying & selling** (Purchases & Sales)
5. **Monitor business** (Dashboard & Reports)

---

**You're all set! Start managing your wholesale business! 🚀**
