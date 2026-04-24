'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowDown, ArrowRight, BarChart3, FolderTree, Package2, Receipt, ShoppingCart } from 'lucide-react'

const flows = [
  {
    title: 'Product setup',
    icon: FolderTree,
    summary: 'We create the hardware stock structure first.',
    steps: ['Category', 'Subcategory', 'Product Type', 'Model', 'Brand Variant', 'Stock and price'],
  },
  {
    title: 'Purchase flow',
    icon: ShoppingCart,
    summary: 'We buy stock from a supplier and add it to inventory.',
    steps: ['Supplier', 'Purchase Order', 'Items', 'Paid or Due', 'Supplier Balance', 'Stock Increase'],
  },
  {
    title: 'Sales flow',
    icon: Receipt,
    summary: 'We sell products to customers and reduce stock.',
    steps: ['Customer', 'Sales Invoice', 'Items and Discount', 'Paid or Due', 'Customer Balance', 'Stock Decrease'],
  },
  {
    title: 'Reports flow',
    icon: BarChart3,
    summary: 'We check profit and download PDF reports.',
    steps: ['Date Filter', 'Profit Analysis', 'Tables and Charts', 'Low Margin Check', 'PDF Download'],
  },
] as const

function FlowCard({ title, icon: Icon, summary, steps }: (typeof flows)[number]) {
  return (
    <Card className="flow-card border-border/60 shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{summary}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flow-stack">
          {steps.map((step, index) => (
            <div key={step} className="flow-node-wrap" style={{ animationDelay: `${index * 110}ms` }}>
              <div className="flow-node">
                <span className="flow-badge">{index + 1}</span>
                <span className="flow-label">{step}</span>
              </div>
              {index < steps.length - 1 ? (
                <div className="flow-connector">
                  <ArrowDown className="flow-arrow h-4 w-4" />
                </div>
              ) : null}
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-dashed bg-muted/20 p-3 text-xs text-muted-foreground">
          {steps.map((step, index) => (
            <span key={step} className="flex items-center gap-2">
              <span>{step}</span>
              {index < steps.length - 1 ? <ArrowRight className="h-3 w-3" /> : null}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function DemoPage() {
  return (
    <div className="space-y-6">
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl">Simple demo flow</CardTitle>
          <CardDescription>
            This page is for explaining the current app to a client in easy English.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="rounded-xl border bg-muted/20 p-4">1. Products define the hardware stock structure.</div>
          <div className="rounded-xl border bg-muted/20 p-4">2. Purchases add stock and update supplier dues.</div>
          <div className="rounded-xl border bg-muted/20 p-4">3. Sales reduce stock and update customer dues.</div>
          <div className="rounded-xl border bg-muted/20 p-4">4. Reports show profit, charts, and PDF download.</div>
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-2">
        {flows.map(flow => (
          <FlowCard key={flow.title} {...flow} />
        ))}
      </section>

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>How to explain the app</CardTitle>
          <CardDescription>Use this simple order when you show the client the app.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          {[
            'Open Dashboard',
            'Show Products',
            'Show Purchases and Sales',
            'Finish with Reports and PDF',
          ].map((item, index) => (
            <div key={item} className="rounded-2xl border bg-muted/20 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Step {index + 1}</p>
              <p className="mt-2 text-sm font-medium">{item}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Mobile view</CardTitle>
          <CardDescription>Same flow works well on phone and tablet screens.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {[
            'Sidebar opens as a drawer',
            'Cards stack vertically',
            'Flow cards remain easy to scroll',
          ].map(item => (
            <div key={item} className="rounded-2xl border bg-muted/20 p-4 text-sm text-muted-foreground">
              {item}
            </div>
          ))}
        </CardContent>
      </Card>

      <style jsx global>{`
        .flow-stack {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .flow-node-wrap {
          animation: fadeUp 0.5s ease both;
        }

        .flow-node {
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid hsl(var(--border));
          background: linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%);
          border-radius: 16px;
          padding: 12px 14px;
        }

        .flow-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 999px;
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          font-size: 12px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .flow-label {
          font-size: 14px;
          font-weight: 600;
          color: hsl(var(--foreground));
        }

        .flow-connector {
          display: flex;
          justify-content: center;
          padding: 6px 0;
          color: hsl(var(--muted-foreground));
          animation: pulseArrow 1.6s ease-in-out infinite;
        }

        .flow-arrow {
          opacity: 0.7;
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulseArrow {
          0%, 100% {
            opacity: 0.55;
            transform: translateY(0);
          }
          50% {
            opacity: 1;
            transform: translateY(2px);
          }
        }
      `}</style>
    </div>
  )
}
