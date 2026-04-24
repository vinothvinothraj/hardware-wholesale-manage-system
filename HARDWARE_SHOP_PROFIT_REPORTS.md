# Hardware Shop Profit and Loss Reports

This document explains how profit and loss reporting can work in the hardware shop system, which pages can include the feature, and what data is needed to make the reports useful.

## Goal

The app should help answer questions like:

- Which products make the highest profit?
- Which categories have low margin?
- Which suppliers are giving the best purchase rates?
- Which customers or invoice types are reducing margin?
- Which items are being sold below expected profit?
- Which product groups are best for bulk buying and bulk selling?

This is especially important for hardware shops because margin can vary widely between:

- Paints
- Cement and construction materials
- Wood items
- Plumbing items
- Electrical items
- Fasteners and tools

## Core Profit Formula

The basic profit formula is:

```text
Profit = Total Sales Revenue - Cost of Goods Sold - Direct Discounts - Direct Losses
```

Where:

- `Total Sales Revenue` is the amount billed to the customer
- `Cost of Goods Sold` is the purchase cost of the stock sold
- `Direct Discounts` are any invoice or line-level discounts
- `Direct Losses` are damaged, lost, or adjusted stock values that should affect true margin

## Useful Profit Views

### 1. Gross Profit

Shows the difference between sale price and purchase cost before overheads.

```text
Gross Profit = Sales - Purchase Cost
```

### 2. Net Profit

Shows the profit after discounts, losses, and other deductions.

```text
Net Profit = Gross Profit - Discounts - Losses - Adjustments
```

### 3. Margin %

Useful to compare products of different price ranges.

```text
Margin % = (Profit / Sales) * 100
```

### 4. Markup %

Useful for purchase-to-sell pricing review.

```text
Markup % = ((Selling Price - Cost Price) / Cost Price) * 100
```

## Pages That Can Include Profit Features

### Dashboard

The dashboard can show:

- Today profit
- This month profit
- Gross margin
- Low-margin alerts
- Top profit categories
- Profit trend chart

### Reports

The reports page is the best place for full profit and loss analysis.

Suggested tabs or sections:

- Sales Profit Report
- Product Profit Report
- Category Profit Report
- Monthly Profit Trend
- Loss and Adjustment Report
- Discount Impact Report

### Sales Page

The sales page can show:

- Profit per invoice
- Margin per line item
- Discount impact
- Expected margin warning

Useful for fast checking before saving or printing an invoice.

### Purchases Page

The purchases page can show:

- Cost price changes
- Supplier-wise purchase value
- Purchase rate comparison
- Items with rising cost

This helps buying decisions and reordering.

### Products Page

The products page can show:

- Cost price
- Selling price
- Profit per unit
- Margin %
- Fast-moving profitable items
- Slow-moving low-margin items

### Inventory Page

The inventory page can show:

- Stock value
- Estimated profit in stock
- Low-profit stock categories
- Damage and loss impact

### Ledger Page

The ledger page can support:

- Credit sales impact on profit
- Supplier due vs purchased cost
- Customer due vs realized income

## Report Types to Add

### Sales Profit Report

Shows invoice-level profit:

- Invoice number
- Customer
- Date
- Revenue
- Cost
- Discount
- Profit
- Margin %

### Product Profit Report

Shows profit per SKU or variant:

- Product name
- Brand
- Category
- Units sold
- Revenue
- Cost
- Profit
- Margin %

### Category Profit Report

Shows profit by business category:

- Paints
- Construction Materials
- Wood & Boards
- Plumbing & Fittings
- Electrical & Hardware

This report is useful for understanding which product families are strongest.

### Monthly Profit Trend

Shows how profit changes over time:

- Daily profit in a selected month
- Monthly profit for the year
- Yearly trend

### Discount Impact Report

Shows how discounts affect profit:

- Discounted sales count
- Total discounts given
- Margin after discount
- Most discounted products

### Loss and Adjustment Report

Shows impact from inventory issues:

- Damage
- Loss
- Count correction
- Returns

This matters in hardware shops because breakage, wastage, and site returns can affect true profit.

## Suggested Metrics

### Overall KPIs

- Total sales
- Total purchase cost
- Gross profit
- Net profit
- Profit margin %
- Average order value
- Average margin per order

### Product KPIs

- Units sold
- Revenue
- Cost
- Profit
- Margin %
- Stock on hand

### Category KPIs

- Category revenue
- Category cost
- Category profit
- Category margin

## How to Display Profit on UI

### Dashboard cards

Use small cards for:

- Today profit
- This month profit
- Low margin items
- Top category profit

### Tables

Use tables for:

- Invoice profit
- Product profit
- Category profit
- Monthly profit breakdown

### Charts

Use charts for:

- Profit trend by day
- Profit trend by month
- Profit by category
- Profit vs loss comparison

## What Data Is Needed

To calculate profit properly, the app should keep these values:

- Purchase cost price
- Selling price
- Quantity sold
- Quantity purchased
- Discount amount
- Damage/loss adjustment
- Return quantity
- Invoice date
- Category and product type

## Hardware Shop Specific Notes

Hardware shops do not always sell one-item-one-price products. Some goods are sold by:

- Bag
- Litre
- Sheet
- Piece
- Box
- Meter
- Load

So the profit logic should support unit-aware calculations.

Examples:

- Cement: profit per bag
- Paint: profit per litre or per tin
- Wood: profit per sheet or per length
- Screws and nails: profit per box or pack

## Recommended Implementation Order

1. Add profit calculation helpers in the store or utility layer.
2. Show invoice profit on the sales page.
3. Add product profit cards on the products page.
4. Add category profit charts on the reports page.
5. Add monthly profit trend and loss reports.
6. Add adjustment and discount impact analysis.
7. Add export/print support for profit reports.

## Suggested Page Placement

| Page | Profit Feature |
| --- | --- |
| Dashboard | Summary KPIs and trend cards |
| Sales | Invoice profit and margin check |
| Products | SKU profit and margin |
| Purchases | Cost monitoring and supplier analysis |
| Inventory | Stock value and loss impact |
| Reports | Full profit and loss analytics |
| Ledger | Credit impact and recovery tracking |

## Example Report Sections

### Sales Profit Summary

- Total invoices
- Total sales
- Total cost
- Total discounts
- Net profit
- Margin %

### Product Profit Summary

- Top 10 products by profit
- Bottom 10 products by margin
- Products with zero profit

### Category Profit Summary

- Paints
- Construction Materials
- Wood Items
- Plumbing
- Electrical
- Tools and Hardware

## Conclusion

For a hardware shop, profit reporting should not be limited to a single total number. It should show:

- invoice profit
- product profit
- category profit
- margin %
- losses and adjustments
- discount effects

That gives a much clearer picture of which items are actually making money in the business.
