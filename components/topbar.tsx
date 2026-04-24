'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import {
  Bell,
  BarChart3,
  Box,
  ChevronDown,
  CircleAlert,
  Grid2x2,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  Package2,
  Receipt,
  ShoppingCart,
  Truck,
  Users,
} from 'lucide-react'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/products': 'Products',
  '/dashboard/purchases': 'Purchases',
  '/dashboard/sales': 'Sales',
  '/dashboard/inventory': 'Inventory',
  '/dashboard/customers': 'Customers',
  '/dashboard/suppliers': 'Suppliers',
  '/dashboard/ledger': 'Ledger',
  '/dashboard/reports': 'Reports',
}

export function TopBar() {
  const pathname = usePathname()
  const router = useRouter()
  const { currentUser, logout, brandVariants, suppliers, customers } = useStore()

  const title = pageTitles[pathname] || 'Dashboard'
  const lowStockCount = brandVariants.filter(variant => variant.currentStock <= variant.reorderLevel).length
  const customerDueCount = customers.filter(customer => customer.outstandingBalance > 0).length
  const supplierDueCount = suppliers.filter(supplier => supplier.outstandingBalance > 0).length
  const notificationCount = lowStockCount + customerDueCount + supplierDueCount

  const quickLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Products', href: '/dashboard/products', icon: Box },
    { label: 'Purchases', href: '/dashboard/purchases', icon: ShoppingCart },
    { label: 'Sales', href: '/dashboard/sales', icon: Receipt },
    { label: 'Inventory', href: '/dashboard/inventory', icon: Package2 },
    { label: 'Customers', href: '/dashboard/customers', icon: Users },
    { label: 'Suppliers', href: '/dashboard/suppliers', icon: Truck },
    { label: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
  ]

  const alerts = [
    {
      title: 'Low stock items',
      description: `${lowStockCount} products need attention`,
      href: '/dashboard/inventory',
      icon: CircleAlert,
    },
    {
      title: 'Customer dues',
      description: `${customerDueCount} customers have pending balance`,
      href: '/dashboard/ledger',
      icon: Users,
    },
    {
      title: 'Supplier dues',
      description: `${supplierDueCount} suppliers have pending balance`,
      href: '/dashboard/ledger',
      icon: Truck,
    },
  ].filter(item => item.description !== '0 products need attention' && item.description !== '0 customers have pending balance' && item.description !== '0 suppliers have pending balance')

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-20 border-b border-sky-200/70 bg-[linear-gradient(90deg,#ffffff_0%,#f7fbff_52%,#edf6ff_100%)] text-slate-900 shadow-sm backdrop-blur dark:border-sidebar-border dark:[background-image:none] dark:bg-sidebar/95 dark:text-sidebar-foreground">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <h2 className="truncate text-lg font-semibold tracking-tight sm:text-xl">{title}</h2>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 border-sky-200/70 bg-white/90 text-slate-900 hover:bg-white dark:border-sidebar-border dark:bg-sidebar dark:text-sidebar-foreground dark:hover:bg-sidebar-accent dark:hover:text-sidebar-accent-foreground"
              >
                <Grid2x2 className="h-4 w-4" />
                <span className="sr-only">Open shortcuts</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Shortcuts</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {quickLinks.map(item => {
                const Icon = item.icon
                return (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="relative h-10 w-10 border-sky-200/70 bg-white/90 text-slate-900 hover:bg-white dark:border-sidebar-border dark:bg-sidebar dark:text-sidebar-foreground dark:hover:bg-sidebar-accent dark:hover:text-sidebar-accent-foreground"
              >
                <MessageSquareText className="h-4 w-4" />
                <span className="sr-only">Open chat</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold">Quick Chat</p>
                  <p className="text-xs text-muted-foreground">Fast links for daily work and team follow-up.</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  {[
                    { label: 'Ask about stock', href: '/dashboard/inventory' },
                    { label: 'Create sales order', href: '/dashboard/sales' },
                    { label: 'Review purchases', href: '/dashboard/purchases' },
                  ].map(item => (
                    <Button key={item.href} asChild variant="ghost" className="w-full justify-start">
                      <Link href={item.href}>{item.label}</Link>
                    </Button>
                  ))}
                </div>
                <div className="rounded-xl border bg-muted/40 p-3 text-sm">
                  <p className="font-medium">Team note</p>
                  <p className="text-muted-foreground">
                    Use this panel as a quick workspace hub for daily shop tasks. A full chat module can be connected later.
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="relative h-10 w-10 border-sky-200/70 bg-white/90 text-slate-900 hover:bg-white dark:border-sidebar-border dark:bg-sidebar dark:text-sidebar-foreground dark:hover:bg-sidebar-accent dark:hover:text-sidebar-accent-foreground"
              >
                <Bell className="h-4 w-4" />
                {notificationCount > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                    {notificationCount}
                  </span>
                ) : null}
                <span className="sr-only">Open notifications</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold">Notifications</p>
                  <p className="text-xs text-muted-foreground">Operational alerts from shop activity.</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  {alerts.length > 0 ? (
                    alerts.map(alert => {
                      const Icon = alert.icon
                      return (
                        <Link key={alert.title} href={alert.href} className="flex items-start gap-3 rounded-xl border p-3 transition hover:bg-muted">
                          <div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{alert.title}</p>
                            <p className="text-sm text-muted-foreground">{alert.description}</p>
                          </div>
                        </Link>
                      )
                    })
                  ) : (
                    <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                      No active alerts. Everything looks stable.
                    </div>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="flex h-10 items-center gap-3 border-sky-200/70 bg-white/90 px-3 text-slate-900 hover:bg-white dark:border-sidebar-border dark:bg-sidebar dark:text-sidebar-foreground dark:hover:bg-sidebar-accent dark:hover:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                    {currentUser?.name?.slice(0, 2).toUpperCase() || 'ER'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden min-w-0 text-left sm:block">
                  <p className="truncate text-sm font-medium leading-tight">
                    {currentUser?.name || 'Shop User'}
                  </p>
                  <p className="truncate text-xs text-sidebar-foreground/70">
                    {currentUser?.role?.replace('_', ' ') || 'admin'}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">{currentUser?.name || 'Shop User'}</p>
                  <p className="text-xs font-normal text-muted-foreground">{currentUser?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                Signed in as {currentUser?.role?.replace('_', ' ') || 'admin'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
