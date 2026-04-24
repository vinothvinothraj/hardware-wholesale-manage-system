'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart3, Box, CreditCard, LayoutDashboard, Lock, Mail, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'
import { useStore } from '@/lib/store'

const ADMIN_EMAIL = 'admin@electrowholesale.com'
const ADMIN_PASSWORD = 'admin123'

export default function LoginPage() {
  const router = useRouter()
  const { currentUser, setCurrentUser } = useStore()
  const [email, setEmail] = useState(ADMIN_EMAIL)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      router.push('/dashboard')
      return
    }

    if (currentUser) {
      setCurrentUser(null)
    }
  }, [currentUser, router, setCurrentUser])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      if (email.trim().toLowerCase() !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        setError('Invalid admin email or password.')
        return
      }

      setCurrentUser({
        id: 'admin-session',
        name: 'Administrator',
        email: ADMIN_EMAIL,
        role: 'admin',
        createdAt: new Date(),
      })

      router.push('/dashboard')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_30%),linear-gradient(135deg,_#06111f_0%,_#0f172a_45%,_#111827_100%)] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="fixed right-4 top-4 z-50 sm:right-6 sm:top-6">
        <ThemeToggle compact className="border-white/15 bg-slate-950/70 text-white shadow-lg backdrop-blur hover:bg-white/10" />
      </div>
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-[96rem] items-center gap-10 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="space-y-8 lg:max-w-4xl">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              <LayoutDashboard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-200">Hardware Shop</p>
              <p className="text-sm text-slate-300">Paints, construction materials, wood, tools, and more</p>
            </div>
          </div>

          <div className="max-w-3xl space-y-5">
            <Badge className="border border-white/15 bg-white/10 px-3 py-1 text-white hover:bg-white/15">
              Wholesale hardware operations platform
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-7xl">
              Fast control for the whole product hierarchy.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Manage paints, cement, wood, plumbing, electrical stock, sales, ledgers, and reports from one responsive dashboard built for hardware work.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Product hierarchy', value: '5 levels', icon: Box },
              { label: 'Accounting', value: 'Credit ready', icon: CreditCard },
              { label: 'Dashboard', value: 'Live KPIs', icon: BarChart3 },
            ].map(item => {
              const Icon = item.icon
              return (
                <Card key={item.label} className="border-white/10 bg-white/5 text-white shadow-2xl backdrop-blur">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="rounded-xl bg-white/10 p-3">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-300">{item.label}</p>
                      <p className="text-lg font-semibold">{item.value}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        <section className="flex justify-center">
          <Card className="w-full overflow-hidden border-white/10 bg-slate-950/70 text-white shadow-2xl backdrop-blur-xl lg:max-w-xl">
            <div className="h-1 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500" />
            <CardHeader className="space-y-3 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/15">
              <ShieldCheck className="h-7 w-7 text-cyan-200" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl">Admin Login</CardTitle>
              <CardDescription className="text-slate-300">
                Sign in with your admin email and password to open the dashboard.
              </CardDescription>
            </div>
            </CardHeader>

            <CardContent className="space-y-5">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-200">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={event => setEmail(event.target.value)}
                      placeholder={ADMIN_EMAIL}
                      className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-slate-400 focus-visible:ring-cyan-400"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-200">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={event => setPassword(event.target.value)}
                      placeholder="Enter admin password"
                      className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-slate-400 focus-visible:ring-cyan-400"
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </div>

                {error ? (
                  <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                    {error}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 w-full bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                >
                  {isSubmitting ? 'Signing in...' : 'Login'}
                </Button>
              </form>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                <p className="font-medium text-white">Demo access</p>
                <p className="mt-1">Email: {ADMIN_EMAIL}</p>
                <p>Password: {ADMIN_PASSWORD}</p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
