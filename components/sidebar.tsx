'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { useStore } from '@/lib/store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  BarChart3,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  Package2,
  Receipt,
  ShoppingCart,
  Truck,
  Users,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type NavItem = {
  label: string
  href: string
  icon: ReactNode
  roles: string[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" />, roles: ['admin', 'sales', 'store_manager'] },
  { label: 'Products', href: '/dashboard/products', icon: <FolderTree className="h-4 w-4" />, roles: ['admin', 'store_manager'] },
  { label: 'Customers', href: '/dashboard/customers', icon: <Users className="h-4 w-4" />, roles: ['admin', 'sales'] },
  { label: 'Suppliers', href: '/dashboard/suppliers', icon: <Truck className="h-4 w-4" />, roles: ['admin', 'store_manager'] },
  { label: 'Purchases', href: '/dashboard/purchases', icon: <ShoppingCart className="h-4 w-4" />, roles: ['admin', 'store_manager'] },
  { label: 'Sales', href: '/dashboard/sales', icon: <Receipt className="h-4 w-4" />, roles: ['admin', 'sales'] },
  { label: 'Inventory', href: '/dashboard/inventory', icon: <Package2 className="h-4 w-4" />, roles: ['admin', 'store_manager'] },
  { label: 'Ledger', href: '/dashboard/ledger', icon: <Receipt className="h-4 w-4" />, roles: ['admin'] },
  { label: 'Reports', href: '/dashboard/reports', icon: <BarChart3 className="h-4 w-4" />, roles: ['admin'] },
]

export function Sidebar() {
  const pathname = usePathname()
  const { currentUser, logout, sales, purchases, brandVariants } = useStore()
  const [isOpen, setIsOpen] = useState(false)

  if (!currentUser) return null

  const visibleItems = navItems.filter(item => item.roles.includes(currentUser.role))
  const lowStockCount = brandVariants.filter(variant => variant.currentStock <= variant.reorderLevel).length

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  return (
    <>
      <div className="fixed left-4 top-4 z-40 lg:hidden">
        <Button variant="outline" size="icon" onClick={() => setIsOpen(value => !value)} className="border-sky-200/70 bg-white/90 text-slate-900 hover:bg-white dark:border-sidebar-border dark:bg-sidebar dark:text-sidebar-foreground dark:hover:bg-sidebar-accent dark:hover:text-sidebar-accent-foreground">
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {isOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setIsOpen(false)} />}

      <aside
        className={cn(
          'fixed left-0 top-0 z-30 flex h-screen w-72 flex-col border-r border-sky-200/70 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_50%,#edf6ff_100%)] text-slate-900 shadow-[0_20px_80px_rgba(59,130,246,0.08)] backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 dark:border-sidebar-border dark:[background-image:none] dark:bg-sidebar/95 dark:text-sidebar-foreground dark:shadow-none',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="border-b border-sky-200/70 p-6 dark:border-sidebar-border">
          <p className="text-xs uppercase tracking-[0.35em] text-sidebar-foreground/75">Hardware Shop</p>
          <h1 className="mt-2 text-2xl font-semibold">Hardware Shop Control Center</h1>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="default" className="capitalize">
              {currentUser.role.replace('_', ' ')}
            </Badge>
            <Badge variant="outline" className="border-sky-200/70 bg-white/80 text-slate-900 dark:border-sidebar-border dark:bg-sidebar-accent/20 dark:text-sidebar-foreground">
              {sales.length} sales
            </Badge>
            <Badge variant="outline" className="border-sky-200/70 bg-white/80 text-slate-900 dark:border-sidebar-border dark:bg-sidebar-accent/20 dark:text-sidebar-foreground">
              {purchases.length} purchases
            </Badge>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {visibleItems.map(item => {
            const isActive = item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href)

            return (
              <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                <div
                  className={cn(
                    'flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition',
                    isActive
                      ? 'border-sky-300 bg-sky-50 text-sky-950 shadow-sm dark:border-transparent dark:bg-primary dark:text-primary-foreground'
                      : 'border-transparent text-slate-700 hover:border-sky-200 hover:bg-white/80 hover:text-slate-950 dark:text-sidebar-foreground dark:hover:border-transparent dark:hover:bg-sidebar-accent dark:hover:text-sidebar-accent-foreground'
                  )}
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                  {item.label === 'Inventory' && lowStockCount > 0 && (
                    <Badge variant="default" className="ml-auto">
                      {lowStockCount}
                    </Badge>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="space-y-3 border-t border-sky-200/70 p-4 dark:border-sidebar-border">
          <ThemeToggle className="border-sky-200/70 bg-white/80 text-slate-900 hover:bg-white dark:border-sidebar-border dark:bg-sidebar dark:text-sidebar-foreground dark:hover:bg-sidebar-accent dark:hover:text-sidebar-accent-foreground" />
          <Button
            variant="outline"
            className="w-full justify-start gap-2 border-sky-200/70 bg-white/80 text-slate-900 hover:bg-white dark:border-sidebar-border dark:bg-sidebar dark:text-sidebar-foreground dark:hover:bg-sidebar-accent dark:hover:text-sidebar-accent-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      <div className="hidden w-72 lg:block" />
    </>
  )
}
