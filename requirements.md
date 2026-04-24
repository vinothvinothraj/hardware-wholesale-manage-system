SYSTEM NAME

ElectroWholesale ERP – Inventory, Sales & Purchase Management System

🎯 PURPOSE

Build a modern web frontend application for a wholesale electronics business that manages:

Product hierarchy (Category → Subcategory → Product Type → Model → Brand Variant)
Supplier purchases
Customer wholesale sales
Inventory tracking
Payments & credit
Reports dashboard

This system is used by:

Admin
Sales staff
Store manager
🧱 TECHNOLOGY ASSUMPTIONS
Frontend: React (or Next.js preferred)
UI: Modern responsive dashboard (Tailwind or Material UI style)
Mobile friendly
Role-based UI
REST API ready (backend not included)
🧩 CORE MODULES (SCREENS REQUIRED)
1. 📊 Dashboard (Home Screen)

Show summary cards:

Total Sales (Today / Month)
Total Purchases
Total Profit
Total Customers
Total Suppliers
Low Stock Alerts
Charts:
Sales vs Purchase graph
Top selling products
Stock level overview
2. 📦 Product Management Module
A. Category Management

Fields:

Category Name
Parent Category (optional for hierarchy)

Example:

Electrical
Electronics
Hardware
B. Subcategory

Linked to Category

Example:

Electrical → Lighting
Electrical → Wiring
C. Product Type

Linked to Subcategory

Example:

LED Bulbs
Copper Wire
Switches
D. Product Model (Important Level)

Defines specifications:

Fields:

Product Type
Model Name (e.g., 9W, 1.5mm)
Description
Attributes (optional JSON)
E. Brand Variant (SKU Level)

This is the actual inventory item

Fields:

Model
Brand Name
Cost Price
Selling Price
Stock Quantity
Reorder Level
Barcode (optional)
UI Requirement:
Tree view selector (Category → Brand SKU)
Search bar (global product search)
Filter by brand, category, stock status
3. 🚚 Supplier Module (Purchase System)
Supplier List Page

Fields:

Name
Contact
Company
Credit Limit
Purchase Entry Screen

Flow:

Select Supplier
Add Products:
Category → Model → Brand
Quantity
Buying price
Auto calculate total

Features:

Add multiple items
Auto stock update preview
Purchase invoice generation
4. 🏬 Customer Module

Fields:

Company Name
Contact Person
Phone
Address
Credit Limit
Payment Terms
5. 💰 Sales Module (Very Important)
Sales Screen Flow:
Select Customer
Add Products:
Category → Model → Brand
Quantity
Auto price suggestion
Discount (optional)
Total calculation
Features:
Multiple item invoice
Partial payment support
Credit sales tracking
Print invoice button
6. 📦 Inventory Module
Stock View Page:
Product tree view
Search by SKU
Filter:
Low stock
Out of stock
High stock
Stock Movement Log:
Purchase in
Sales out
Returns
Adjustments
7. 💳 Payment & Credit Module
Customer Ledger:
Total purchases
Paid amount
Balance due
Supplier Ledger:
Amount owed to supplier
Payments made
8. 📈 Reports Module

Pages:

Sales Report
Daily / Monthly filter
Profit calculation
Purchase Report
Stock Report
Customer Due Report
Supplier Due Report
9. 🔐 User Roles System
Admin
Full access
Sales User
Sales module only
Store Manager
Inventory + Purchase
10. ⚙️ UI/UX REQUIREMENTS
Clean dashboard layout
Sidebar navigation:
Dashboard
Products
Purchases
Sales
Inventory
Customers
Suppliers
Reports
Dark/light mode optional
Mobile responsive design
Fast search everywhere (global search bar)
🧠 CORE BUSINESS LOGIC (VERY IMPORTANT)
Product Selection Flow:

Category → Subcategory → Product Type → Model → Brand Variant

Inventory Rule:
Purchase = Stock IN
Sales = Stock OUT
Returns = Adjustment
Pricing Rule:

Each Brand Variant has:

Cost Price
Selling Price
Profit Margin
Sales Rule:
Can sell partial payment
Remaining balance stored as credit
📦 SAMPLE UI FLOW (REAL WORLD)
Customer asks:

“I need 100 LED bulbs”

System UI:

Select Category → Electrical
Subcategory → Lighting
Product Type → LED Bulb
Model → 9W
Show Brands:
Philips (high quality)
Orange (cheap)
Choose:
Philips 9W × 100
System calculates:
Total
Profit
Stock update
🎨 DESIGN STYLE
Admin dashboard style
Cards + tables + filters
Data tables with sorting
Modal forms for add/edit
Tree-based product navigation
⚡ OUTPUT EXPECTATION

Generate a complete frontend system including:

All pages
Navigation sidebar
Dashboard UI
Forms for CRUD operations
Product hierarchy selector UI
Sales & purchase screens
Responsive layout
🧾 FINAL LINE (IMPORTANT)

This is a real-world wholesale ERP system for electronics distribution, not a simple inventory app. It must support:

Multi-brand products
Hierarchical product structure
Credit-based sales
Inventory accuracy
Business reporting