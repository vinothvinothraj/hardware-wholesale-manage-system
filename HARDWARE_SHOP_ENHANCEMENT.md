# Hardware Shop Enhancement Plan

This document describes how to evolve the current system into a full hardware-shop management system, not limited to electronic products.

## Goal

Support a broad retail and wholesale hardware business that handles:

- Paints
- Construction materials
- Site supplies
- Wood items
- Electrical and plumbing goods
- Fasteners, tools, and accessories

The app should manage products, stock, purchases, sales, credit, ledgers, and reports across all these categories.

## Business Scope

The system should be able to handle:

- Product catalog management
- Multi-category inventory
- Unit-based and pack-based stock
- Purchase entry from suppliers
- Sales invoice generation
- Credit sales and supplier dues
- Inventory adjustments
- Stock alerts and reorder rules
- Profit and due reports

## Recommended Product Structure

Instead of only using an electronics-focused hierarchy, the product tree should support a flexible hardware structure.

### Example hierarchy

- Category
  - Paints
    - Interior Paint
    - Exterior Paint
    - Primer
  - Construction Materials
    - Cement
    - Sand
    - Bricks
    - Aggregate
  - Wood Items
    - Plywood
    - Timber
    - MDF Board
  - Plumbing
    - Pipes
    - Valves
    - Fittings
  - Electrical
    - Cables
    - Switches
    - Lamps
  - Tools
    - Hand Tools
    - Power Tools
  - Fasteners
    - Nails
    - Screws
    - Bolts

## Inventory Design

Hardware shops need more flexible inventory than standard retail.

### Important fields

- Product name
- Category / subcategory / type
- Brand
- Variant
- Unit of measure
- Pack size
- Cost price
- Selling price
- Wholesale price
- Retail price
- Current stock
- Reorder level
- Minimum order quantity
- Barcode or SKU
- Supplier reference
- Location / rack / bin

### Unit handling

Some products are sold in:

- Pieces
- Packs
- Boxes
- Bags
- Kilograms
- Liters
- Meters
- Cubic units

Examples:

- Cement: bag
- Sand: cubic feet or truck load
- Paint: liter or gallon
- Wood sheets: piece
- Nails and screws: box or pack

The app should allow the same product to have both purchase and sales units when needed.

## Purchase Flow

Purchases should support:

- Supplier selection
- Multiple line items
- Unit price per purchase unit
- Bulk quantities
- Taxes or delivery charges if needed
- Paid amount and due amount
- Purchase invoice number
- Return or damage adjustments

Useful examples:

- Buying 100 bags of cement
- Buying 20 drums of paint
- Buying 500 wood screws in packs

## Sales Flow

Sales should support:

- Retail and wholesale billing
- Customer selection
- Partial payment
- Credit sales
- Discount per line item or bill
- Multiple units
- Invoice printing

Useful examples:

- Selling 2 bags of cement
- Selling 5 liters of paint
- Selling 1 plywood sheet
- Selling 1 box of screws

## Ledger and Credit

The ledger should track:

- Customer due amounts
- Supplier due amounts
- Payment history
- Overdue balances
- Invoice-level settlement status

This is important for hardware businesses because credit sales are common for contractors, builders, and regular trade customers.

## Reports Needed

The reports section should support:

- Daily sales
- Monthly sales
- Yearly sales
- Custom date range
- Category-wise stock value
- Low stock report
- Profit report
- Supplier due report
- Customer due report
- Fast-moving products
- Slow-moving products

## UI Improvements

The interface should be adapted for hardware-shop operations.

### Suggested pages or sections

- Dashboard
- Products
- Customers
- Suppliers
- Purchases
- Sales
- Inventory
- Ledger
- Reports

### Helpful UI features

- Category filters
- Search by SKU, brand, or product name
- Quick add product
- Quick stock adjustment
- Low-stock badges
- Due amount alerts
- Print-ready invoices
- Mobile-friendly data entry

## Data Model Changes

If the app is being expanded properly, the current product model should be upgraded.

### Suggested additions

- Product category hierarchy
- Product unit type
- Pack quantity
- Sale unit
- Purchase unit
- Bulk pricing
- Retail pricing
- Tax field
- Warehouse or rack location
- Supplier-product mapping

### Optional advanced fields

- Expiry date for consumables
- Batch number
- Color shade for paint
- Size and thickness for wood and sheets
- Weight for cement or sand-based items

## Example Hardware Product Records

### Paint

- Category: Paints
- Brand: Nippon / Asian / Dulux
- Variant: Interior Emulsion
- Unit: Liter
- Cost Price: per liter
- Selling Price: per liter or gallon

### Cement

- Category: Construction Materials
- Variant: OPC 50kg
- Unit: Bag
- Reorder rule: based on bag count

### Sand

- Category: Construction Materials
- Variant: River Sand
- Unit: Cubic foot or load
- Stock may be tracked as estimated quantity

### Wood item

- Category: Wood Items
- Variant: Plywood 8x4
- Unit: Sheet
- Stock based on sheet count

### Nails and screws

- Category: Fasteners
- Variant: Steel Screws 1 inch
- Unit: Box / pack

## Suggested Development Priority

1. Convert product structure into a hardware-friendly hierarchy.
2. Add unit-of-measure support.
3. Add bulk purchase and bulk sale handling.
4. Improve inventory adjustment and stock tracking.
5. Add hardware-specific reports.
6. Add print and mobile-friendly workflows.
7. Add optional advanced features like batch, expiry, and location tracking.

## Summary

The app should be positioned as a complete hardware-shop system that can manage:

- Electronic products
- Paints
- Construction materials
- Wood items
- General hardware stock
- Purchases
- Sales
- Inventory
- Credit
- Reports

This makes the system suitable for a real hardware shop instead of only an electronics store.
