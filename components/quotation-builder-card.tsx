'use client'

import { useMemo, useState } from 'react'
import { jsPDF } from 'jspdf/dist/jspdf.es.min.js'
import autoTable from 'jspdf-autotable'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useStore } from '@/lib/store'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { buildQuotationDocument, loadImageDataUrl, waitForWindowImages } from '@/lib/quotation-print'
import type { BrandVariant, Customer } from '@/lib/types'
import { FileDown, FileSpreadsheet, FileText, Minus, Plus, Printer, Trash2, UserPlus } from 'lucide-react'

type DiscountType = 'fixed' | 'percent'

type QuotationLine = {
  id: string
  productId: string
  itemName: string
  description: string
  quantity: string
  rate: string
  discount: string
  discountType: DiscountType
}

type LineFieldError = {
  itemName?: string
  quantity?: string
  rate?: string
  total?: string
}

type ValidationState = Record<string, LineFieldError>

type CustomerFormState = {
  companyName: string
  contactPerson: string
  phone: string
  email: string
  address: string
  creditLimit: string
}

const createBlankLine = (): QuotationLine => ({
  id: Math.random().toString(36).slice(2, 9),
  productId: '',
  itemName: '',
  description: '',
  quantity: '1',
  rate: '',
  discount: '0',
  discountType: 'fixed',
})

const createBlankCustomer = (): CustomerFormState => ({
  companyName: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
  creditLimit: '0',
})

const csvEscape = (value: string | number) => {
  const text = String(value ?? '')
  return `"${text.replaceAll('"', '""')}"`
}

const formatPlainNumber = (value: number) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)

const getVariantLabel = (variant: BrandVariant) => `${variant.brand} - ${variant.variantName}`

const lineGridTemplate =
  '44px minmax(0,1.5fr) minmax(0,1.5fr) minmax(0,1.5fr) minmax(0,0.9fr) minmax(0,0.9fr) minmax(0,0.9fr) minmax(0,0.9fr) 92px minmax(0,0.95fr) minmax(0,0.95fr) minmax(0,1fr) minmax(0,1fr) 72px'

type StepperFieldProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
  min?: number
  step: number
  readOnly?: boolean
  className?: string
  onFocus?: () => void
  error?: string
}

const StepperField = ({
  value,
  onChange,
  placeholder,
  min = 0,
  step,
  readOnly = false,
  className,
  onFocus,
  error,
}: StepperFieldProps) => {
  const adjustValue = (delta: number) => {
    const current = Number(value)
    const base = Number.isFinite(current) ? current : min
    const next = Math.max(min, base + delta)
    onChange(String(next))
  }

  return (
    <div className="space-y-1">
      <div
        className={cn(
          'flex h-8 overflow-hidden rounded-md border border-input bg-background shadow-xs',
          error && 'border-red-500',
        )}
      >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="h-full rounded-none border-0 px-0 text-muted-foreground hover:bg-muted"
        onClick={() => adjustValue(-step)}
        disabled={readOnly}
        aria-label={`Decrease ${placeholder}`}
      >
        <Minus className="h-3.5 w-3.5" />
      </Button>
      <Input
        type="number"
        inputMode="numeric"
        min={min}
        step={step}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        onFocus={onFocus}
        className={cn(
          'h-8 flex-1 border-0 bg-transparent px-2 text-right text-sm shadow-none focus-visible:ring-0',
          error && 'border-red-500 focus-visible:ring-red-500',
          className,
        )}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="h-full rounded-none border-0 px-0 text-muted-foreground hover:bg-muted"
        onClick={() => adjustValue(step)}
        disabled={readOnly}
        aria-label={`Increase ${placeholder}`}
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
      </div>
      {error ? <p className="text-[11px] leading-none text-red-500">{error}</p> : null}
    </div>
  )
}

const buildQuotationCsv = (payload: {
  quoteNumber: string
  quoteDate: string
  customerName: string
  customerContact: string
  customerAddress: string
  lines: Array<{
    itemName: string
    description: string
    quantity: number
    rate: number
    total: number
  }>
  grandTotal: number
}) => {
  const rows = [
    [csvEscape('Danis Trade Centre')],
    [csvEscape('No: 29. Sangamitha Mawatha, Colombo 13.')],
    [csvEscape('Tel: 0112 339 464 / 0112 339 465  Hotline: 0713 212 409 / 0766 750 479')],
    [csvEscape('E-mail: dantatradecentre09@gmail.com')],
    [''],
    [csvEscape('QUOTATION')],
    [csvEscape('Customer'), csvEscape(payload.customerName || 'Walk-in customer'), csvEscape('Date'), csvEscape(payload.quoteDate)],
    [csvEscape('Kind Attention'), csvEscape(payload.customerContact || ''), csvEscape('Quote No'), csvEscape(payload.quoteNumber)],
    [csvEscape('Address'), csvEscape(payload.customerAddress || '')],
    [''],
    [csvEscape('No'), csvEscape('Qty'), csvEscape('Description'), csvEscape('Unit Price (LKR)'), csvEscape('Amount (LKR)')],
    ...payload.lines.map((line, index) => [
      csvEscape(index + 1),
      csvEscape(line.quantity),
      csvEscape(line.description || line.itemName),
      csvEscape(formatPlainNumber(line.rate)),
      csvEscape(formatPlainNumber(line.total)),
    ]),
    ['', '', '', csvEscape('TOTAL AMOUNT'), csvEscape(formatCurrency(payload.grandTotal))],
  ]

  return ['\ufeff' + rows.map(row => row.join(',')).join('\r\n')].join('')
}

type QuotationBuilderCardProps = {
  onSaved?: () => void
}

export function QuotationBuilderCard({ onSaved }: QuotationBuilderCardProps) {
  const store = useStore()
  const [quoteNumber, setQuoteNumber] = useState(`QT-${Date.now()}`)
  const [quoteDate, setQuoteDate] = useState(new Date().toISOString().slice(0, 10))
  const [validUntil, setValidUntil] = useState(new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10))
  const [notes, setNotes] = useState('The Quotation Will be valid for Two days only')
  const [lines, setLines] = useState<QuotationLine[]>([createBlankLine()])
  const [lineErrors, setLineErrors] = useState<ValidationState>({})

  const [customerName, setCustomerName] = useState('')
  const [customerContact, setCustomerContact] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [showCustomerCreate, setShowCustomerCreate] = useState(false)
  const [newCustomer, setNewCustomer] = useState<CustomerFormState>(createBlankCustomer())
  const [customerFocused, setCustomerFocused] = useState(false)
  const [activeItemId, setActiveItemId] = useState<string | null>(null)

  const subtotal = useMemo(
    () => lines.reduce((sum, line) => sum + Number(line.quantity || 0) * Number(line.rate || 0), 0),
    [lines],
  )

  const discountTotal = useMemo(
    () =>
      lines.reduce((sum, line) => {
        const quantity = Number(line.quantity || 0)
        const rate = Number(line.rate || 0)
        const base = quantity * rate
        const discountValue = Number(line.discount || 0)
        const discount = line.discountType === 'percent' ? (base * discountValue) / 100 : discountValue
        return sum + Math.min(Math.max(discount, 0), base)
      }, 0),
    [lines],
  )

  const grandTotal = Math.max(0, subtotal - discountTotal)

  const customerMatches = useMemo(() => {
    const query = customerName.trim().toLowerCase()
    if (!query) return []
    return store.customers.filter(customer => {
      const haystack = [customer.companyName, customer.contactPerson, customer.phone, customer.email, customer.address]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(query)
    })
  }, [customerName, store.customers])

  const quotePayload = useMemo(() => {
    const normalizedLines = lines
      .filter(line => line.itemName.trim() && Number(line.quantity || 0) > 0)
      .map(line => {
        const quantity = Number(line.quantity || 0)
        const rate = Number(line.rate || 0)
        const base = quantity * rate
        const discountValue = Number(line.discount || 0)
        const discount = line.discountType === 'percent' ? (base * discountValue) / 100 : discountValue
        const total = Math.max(0, base - Math.min(Math.max(discount, 0), base))
        const variant = line.productId ? store.brandVariants.find(entry => entry.id === line.productId) : undefined

        return {
          itemName: line.itemName,
          description: line.description,
          quantity,
          rate,
          discount: Math.min(Math.max(discount, 0), base),
          discountType: line.discountType,
          total,
          matched: variant ? getVariantLabel(variant) : 'Custom item',
        }
      })

    return {
      quoteNumber,
      quoteDate: formatDate(quoteDate),
      validUntil: validUntil ? formatDate(validUntil) : '-',
      customerName: customerName.trim(),
      customerContact: customerContact.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      customerAddress: customerAddress.trim(),
      notes: notes.trim(),
      subtotal,
      discountTotal,
      grandTotal,
      lines: normalizedLines,
    }
  }, [customerAddress, customerContact, customerEmail, customerName, customerPhone, discountTotal, grandTotal, lines, notes, quoteDate, quoteNumber, store.brandVariants, subtotal, validUntil])

  const updateLine = (id: string, patch: Partial<QuotationLine>) => {
    setLines(current => current.map(line => (line.id === id ? { ...line, ...patch } : line)))
  }

  const clearLineError = (lineId: string, field: keyof LineFieldError) => {
    setLineErrors(current => {
      const next = { ...current }
      const lineError = next[lineId]
      if (!lineError) return current
      const updated = { ...lineError }
      delete updated[field]
      if (Object.keys(updated).length === 0) {
        delete next[lineId]
      } else {
        next[lineId] = updated
      }
      return next
    })
  }

  const validateForExport = () => {
    const nextErrors: ValidationState = {}

    lines.forEach(line => {
      const quantity = Number(line.quantity || 0)
      const rate = Number(line.rate || 0)
      const base = quantity * rate
      const discountValue = Number(line.discount || 0)
      const discount = line.discountType === 'percent' ? (base * discountValue) / 100 : discountValue
      const total = Math.max(0, base - Math.min(Math.max(discount, 0), base))
      const fieldErrors: LineFieldError = {}

      if (!line.itemName.trim()) fieldErrors.itemName = 'Item is required'
      if (!quantity || quantity <= 0) fieldErrors.quantity = 'Qty is required'
      if (!rate || rate <= 0) fieldErrors.rate = 'Rate is required'
      if (!total || total <= 0) fieldErrors.total = 'Total is required'

      if (Object.keys(fieldErrors).length > 0) {
        nextErrors[line.id] = fieldErrors
      }
    })

    setLineErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const applyProduct = (lineId: string, variant: BrandVariant) => {
    updateLine(lineId, {
      productId: variant.id,
      itemName: getVariantLabel(variant),
      description: variant.variantName,
      rate: String(variant.sellingPrice),
    })
    clearLineError(lineId, 'itemName')
    clearLineError(lineId, 'rate')
  }

  const addLine = () => {
    setLines(current => [...current, createBlankLine()])
  }

  const deleteLine = (id: string) => {
    setLines(current => (current.length === 1 ? [createBlankLine()] : current.filter(line => line.id !== id)))
    setLineErrors(current => {
      const next = { ...current }
      delete next[id]
      return next
    })
  }

  const resetBuilder = () => {
    setQuoteNumber(`QT-${Date.now()}`)
    setQuoteDate(new Date().toISOString().slice(0, 10))
    setValidUntil(new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10))
    setNotes('The Quotation Will be valid for Two days only')
    setLines([createBlankLine()])
    setLineErrors({})
    setCustomerName('')
    setCustomerContact('')
    setCustomerPhone('')
    setCustomerEmail('')
    setCustomerAddress('')
    setSelectedCustomerId('')
    setCustomerFocused(false)
    setActiveItemId(null)
  }

  const selectCustomer = (customer: Customer) => {
    setCustomerName(customer.companyName)
    setCustomerContact(customer.contactPerson)
    setCustomerPhone(customer.phone)
    setCustomerEmail(customer.email || '')
    setCustomerAddress(customer.address)
    setSelectedCustomerId(customer.id)
  }

  const handleCreateCustomer = () => {
    if (!newCustomer.companyName.trim() || !newCustomer.contactPerson.trim() || !newCustomer.phone.trim() || !newCustomer.address.trim()) return

    const id = store.addCustomer(
      newCustomer.companyName.trim(),
      newCustomer.contactPerson.trim(),
      newCustomer.phone.trim(),
      newCustomer.address.trim(),
      Number(newCustomer.creditLimit || 0),
      newCustomer.email.trim() || undefined,
    )

    setCustomerName(newCustomer.companyName.trim())
    setCustomerContact(newCustomer.contactPerson.trim())
    setCustomerPhone(newCustomer.phone.trim())
    setCustomerEmail(newCustomer.email.trim())
    setCustomerAddress(newCustomer.address.trim())
    setSelectedCustomerId(id)
    setNewCustomer(createBlankCustomer())
    setShowCustomerCreate(false)
    setCustomerFocused(false)
  }

  const buildExportName = (extension: string) => `${quoteNumber || 'quotation'}.${extension}`

  const downloadBlob = (content: BlobPart, mimeType: string, fileName: string) => {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const exportPdf = async () => {
    if (!validateForExport()) return
    if (quotePayload.lines.length === 0) return

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const logoDataUrl = await loadImageDataUrl('/dtc-logo.jpeg')

    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'JPEG', 12, 6, 38, 38)
    } else {
      doc.setFontSize(11)
      doc.setTextColor(127, 29, 29)
      doc.text('DTC', 26, 22, { align: 'center' })
    }

    doc.setDrawColor(107, 114, 128)
    doc.setLineWidth(0.4)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(26)
    doc.setTextColor(127, 29, 29)
    doc.text('Danis Trade Centre', 148.5, 15, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(15, 23, 42)
    doc.text('No: 29. Sangamitha Mawatha, Colombo 13.', 148.5, 22, { align: 'center' })
    doc.text('Tel: 0112 339 464 / 0112 339 465  Hotline: 0713 212 409 / 0766 750 479', 148.5, 27, {
      align: 'center',
    })
    doc.text('E-mail: dantatradecentre09@gmail.com', 148.5, 32, { align: 'center' })
    doc.line(12, 38, 285, 38)
    doc.setFontSize(16)
    doc.setTextColor(17, 24, 39)
    doc.text('QUOTATION', 148.5, 46, { align: 'center' })
    doc.line(12, 50, 285, 50)

    autoTable(doc, {
      startY: 54,
      tableWidth: 273,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 2, lineColor: [107, 114, 128], lineWidth: 0.3 },
      body: [
        [
          { content: 'Customer', styles: { fontStyle: 'bold', fillColor: [243, 244, 246] } },
          { content: quotePayload.customerName || 'Walk-in customer', colSpan: 2 },
          { content: 'Date', styles: { fontStyle: 'bold', fillColor: [243, 244, 246] } },
          { content: quotePayload.quoteDate },
        ],
        [
          { content: 'Kind Attention', styles: { fontStyle: 'bold', fillColor: [243, 244, 246] } },
          { content: quotePayload.customerContact || '', colSpan: 2 },
          { content: 'Quote No', styles: { fontStyle: 'bold', fillColor: [243, 244, 246] } },
          { content: quotePayload.quoteNumber },
        ],
        [
          { content: 'Address', styles: { fontStyle: 'bold', fillColor: [243, 244, 246] } },
          { content: quotePayload.customerAddress || '', colSpan: 5 },
        ],
      ],
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 88 },
        2: { cellWidth: 32 },
        3: { cellWidth: 44 },
        4: { cellWidth: 72 },
        5: { cellWidth: 9 },
      },
      didParseCell: data => {
        const value = String(data.cell.raw ?? '')
        if (value === quotePayload.quoteDate || value === quotePayload.quoteNumber) {
          data.cell.styles.cellWidth = 72
          data.cell.styles.overflow = 'linebreak'
          data.cell.styles.halign = 'left'
        }
      },
    })

    autoTable(doc, {
      startY: ((doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY || 80) + 6,
      head: [['No', 'Qty', 'Description', 'Unit Price (LKR)', 'Amount (LKR)']],
      body: [
        ...quotePayload.lines.map((line, index) => [
          String(index + 1),
          String(line.quantity),
          line.description || line.itemName,
          formatPlainNumber(line.rate),
          formatPlainNumber(line.total),
        ]),
        [{ content: '', colSpan: 3 }, { content: 'TOTAL AMOUNT', styles: { halign: 'center' } }, formatCurrency(quotePayload.grandTotal)],
      ],
      styles: { fontSize: 10, cellPadding: 2, lineColor: [107, 114, 128], lineWidth: 0.3, halign: 'left' },
      headStyles: { fillColor: [243, 244, 246], textColor: [31, 41, 55], halign: 'center' },
      columnStyles: {
        0: { cellWidth: 14, halign: 'center' },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 185, halign: 'left' },
        3: { cellWidth: 28, halign: 'left' },
        4: { cellWidth: 26, halign: 'left' },
      },
      didParseCell: data => {
        if (data.row.index === quotePayload.lines.length && data.section === 'body') {
          data.cell.styles.fontStyle = 'bold'
          data.cell.styles.textColor = [17, 24, 39]
          if (data.column.index === 1) {
            data.cell.styles.halign = 'center'
          }
          if (data.column.index === 2) {
            data.cell.styles.halign = 'left'
          }
          if (data.column.index === 3) {
            data.cell.styles.halign = 'center'
          }
          if (data.column.index === 4) {
            data.cell.styles.halign = 'right'
          }
        }
      },
    })

    const tableEndY = ((doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY || 110) + 12
    const signatureX = 14
    const signatureW = 120
    const signatureLabelH = 8
    const signatureBodyH = 26

    doc.setTextColor(127, 29, 29)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('AUTHORIZED SIGNATURE', signatureX, tableEndY + 5.5)
    doc.setDrawColor(180, 128, 104)
    doc.setLineWidth(0.3)
    doc.roundedRect(signatureX, tableEndY + signatureLabelH + 2, signatureW, signatureBodyH, 2, 2)

    doc.save(buildExportName('pdf'))
  }

  const exportWord = async () => {
    if (!validateForExport()) return
    if (quotePayload.lines.length === 0) return
    const logoDataUrl = await loadImageDataUrl('/dtc-logo.jpeg')
    downloadBlob(buildQuotationDocument(quotePayload, logoDataUrl), 'application/msword', buildExportName('doc'))
  }

  const exportExcel = async () => {
    if (!validateForExport()) return
    if (quotePayload.lines.length === 0) return
    downloadBlob(buildQuotationCsv(quotePayload), 'text/csv', buildExportName('csv'))
  }

  const printQuotation = async () => {
    if (!validateForExport()) return
    if (quotePayload.lines.length === 0) return
    const logoDataUrl = await loadImageDataUrl('/dtc-logo.jpeg')
    const html = buildQuotationDocument(quotePayload, logoDataUrl)
    const win = window.open('', '_blank', 'width=1200,height=900')
    if (!win) return
    win.document.open()
    win.document.write(html)
    win.document.close()
    win.focus()
    await waitForWindowImages(win)
    win.print()
  }

  const saveQuotation = () => {
    if (typeof window === 'undefined') return

    const storageKey = 'quotation_builder_saves'
    const savedRecord = {
      id: `${quoteNumber || 'quotation'}-${Date.now()}`,
      savedAt: new Date().toISOString(),
      quoteNumber,
      quoteDate,
      validUntil,
      customerName,
      customerContact,
      customerPhone,
      customerEmail,
      customerAddress,
      notes,
      lines,
      grandTotal,
      subtotal,
      discountTotal,
    }

    try {
      const existing = JSON.parse(window.localStorage.getItem(storageKey) || '[]') as unknown[]
      const next = [savedRecord, ...existing].slice(0, 50)
      window.localStorage.setItem(storageKey, JSON.stringify(next))
    } catch {
      window.localStorage.setItem(storageKey, JSON.stringify([savedRecord]))
    }

    onSaved?.()
  }

  const customerSuggestionsVisible = customerFocused && customerName.trim().length > 0 && customerMatches.length > 0

  return (
    <Card className="w-full overflow-hidden border-sky-100/80 bg-gradient-to-br from-white via-sky-50/35 to-emerald-50/25 shadow-xl shadow-sky-100/50">
      <CardContent className="space-y-6 p-5 md:p-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4 rounded-2xl border border-sky-100 bg-white/85 p-4 shadow-sm">
            <div className="space-y-2">
              <Label>Customer</Label>
              <div className="relative">
                <Input
                  value={customerName}
                  onFocus={() => setCustomerFocused(true)}
                  onBlur={() => setTimeout(() => setCustomerFocused(false), 120)}
                  onChange={e => {
                    setCustomerName(e.target.value)
                    setSelectedCustomerId('')
                    setCustomerFocused(true)
                  }}
                  placeholder="Search customer or type a new one"
                  className="h-8 text-sm"
                />
                {customerSuggestionsVisible && (
                  <div className="absolute z-[200] mt-2 max-h-56 w-full overflow-auto rounded-xl border border-sky-100 bg-white p-1 shadow-lg">
                    {customerMatches.slice(0, 8).map(customer => (
                      <button
                        key={customer.id}
                        type="button"
                        className="flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2 text-left text-xs hover:bg-sky-50"
                        onMouseDown={e => {
                          e.preventDefault()
                          selectCustomer(customer)
                          setCustomerFocused(false)
                        }}
                      >
                        <span>
                          <span className="block font-medium">{customer.companyName}</span>
                          <span className="block text-xs text-muted-foreground">
                            {customer.contactPerson} | {customer.phone}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  {selectedCustomerId ? 'Linked customer selected' : 'Manual customer name allowed'}
                </p>
                <Button type="button" variant="ghost" size="sm" className="gap-2" onClick={() => setShowCustomerCreate(true)}>
                  <UserPlus className="h-4 w-4" />
                  Add customer
                </Button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Contact</Label>
                <Input value={customerContact} onChange={e => setCustomerContact(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Quote no</Label>
                <Input value={quoteNumber} onChange={e => setQuoteNumber(e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Address</Label>
                <Textarea value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="min-h-20" />
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-sky-100 bg-white/85 p-4 shadow-sm">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Quote date</Label>
                <Input type="date" value={quoteDate} onChange={e => setQuoteDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Valid until</Label>
                <Input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} className="min-h-28" />
            </div>
          </div>
        </div>

        <div className="overflow-visible rounded-2xl border border-sky-100 bg-white/90 shadow-sm">
          <div className="flex items-center justify-end gap-3 border-b border-sky-100 bg-sky-50/70 px-4 py-3">
            <Button onClick={addLine} size="sm" className="gap-2 border-sky-200 bg-sky-100 text-sky-900 hover:bg-sky-200">
              <Plus className="h-3.5 w-3.5" />
              Add line
            </Button>
          </div>

          <div
            className="grid gap-2 border-b border-sky-100 bg-sky-50/60 px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-600"
            style={{ gridTemplateColumns: lineGridTemplate }}
          >
            <div className="text-left">No</div>
            <div className="col-span-3 text-left">Description</div>
            <div className="col-span-2 text-left">Qty</div>
            <div className="col-span-2 text-left">Unit Price</div>
            <div className="col-span-3 text-left">Discount</div>
            <div className="col-span-2 text-left">Amount</div>
            <div className="text-left">Del</div>
          </div>

          <div className="divide-y">
            {lines.map((line, index) => {
              const quantity = Number(line.quantity || 0)
              const rate = Number(line.rate || 0)
              const base = quantity * rate
              const discountValue = Number(line.discount || 0)
              const discount = line.discountType === 'percent' ? (base * discountValue) / 100 : discountValue
              const total = Math.max(0, base - Math.min(Math.max(discount, 0), base))
              const matches = line.itemName.trim() ? store.searchProducts(line.itemName.trim()).slice(0, 8) : []
              const lineError = lineErrors[line.id] || {}

              return (
                <div
                  key={line.id}
                  className="grid gap-2 px-4 py-3 text-slate-800"
                  style={{ gridTemplateColumns: lineGridTemplate }}
                >
                  <div className="flex items-center justify-start text-sm font-medium text-slate-500">
                    {index + 1}
                  </div>
                  <div className="relative isolate z-50 col-span-3 overflow-visible">
                    <Input
                      value={line.itemName}
                      onFocus={() => {
                        setActiveItemId(line.id)
                        clearLineError(line.id, 'itemName')
                      }}
                      onChange={e => {
                        updateLine(line.id, { itemName: e.target.value, productId: '' })
                        setActiveItemId(line.id)
                        clearLineError(line.id, 'itemName')
                        clearLineError(line.id, 'total')
                      }}
                      placeholder="Item"
                      className={cn('h-8 text-sm', lineError.itemName && 'border-red-500 focus-visible:ring-red-500')}
                    />
                    {activeItemId === line.id && line.itemName.trim() && matches.length > 0 && (
                      <div className="absolute z-[1000] mt-2 max-h-60 w-full overflow-auto rounded-xl border border-sky-100 bg-white p-1 shadow-lg">
                        {matches.map(variant => (
                          <button
                            key={variant.id}
                            type="button"
                            className="flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2 text-left text-xs hover:bg-sky-50"
                            onMouseDown={e => {
                              e.preventDefault()
                              applyProduct(line.id, variant)
                              setActiveItemId(null)
                            }}
                          >
                            <span>
                              <span className="block font-medium">
                                {variant.brand} - {variant.variantName}
                              </span>
                              <span className="block text-[11px] text-muted-foreground">
                                {variant.currentStock} in stock
                              </span>
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {formatCurrency(variant.sellingPrice)}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                    {lineError.itemName ? <p className="mt-1 text-[11px] leading-none text-red-500">{lineError.itemName}</p> : null}
                  </div>
                  <div className="col-span-2">
                    <StepperField
                      value={line.quantity}
                      onChange={quantity => {
                        updateLine(line.id, { quantity })
                        clearLineError(line.id, 'quantity')
                        clearLineError(line.id, 'total')
                      }}
                      placeholder="Qty"
                      min={1}
                      step={1}
                      onFocus={() => {
                        clearLineError(line.id, 'quantity')
                        clearLineError(line.id, 'total')
                      }}
                      error={lineError.quantity}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="0"
                      value={line.rate}
                      onFocus={() => {
                        clearLineError(line.id, 'rate')
                        clearLineError(line.id, 'total')
                      }}
                      onChange={e => {
                        updateLine(line.id, { rate: e.target.value })
                        clearLineError(line.id, 'rate')
                        clearLineError(line.id, 'total')
                      }}
                      placeholder="Rate"
                      className={cn(
                        'h-8 text-right text-sm',
                        lineError.rate && 'border-red-500 focus-visible:ring-red-500',
                      )}
                    />
                    {lineError.rate ? <p className="mt-1 text-[11px] leading-none text-red-500">{lineError.rate}</p> : null}
                  </div>
                  <div className="col-span-1">
                    <Select
                      value={line.discountType}
                      onValueChange={value => {
                        updateLine(line.id, { discountType: value as DiscountType })
                        clearLineError(line.id, 'total')
                      }}
                    >
                      <SelectTrigger className="h-8 w-full border-sky-100 bg-white text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">%</SelectItem>
                        <SelectItem value="fixed">Fixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="0"
                      value={line.discount}
                      onFocus={() => clearLineError(line.id, 'total')}
                      onChange={e => {
                        updateLine(line.id, { discount: e.target.value })
                        clearLineError(line.id, 'total')
                      }}
                      placeholder="Value"
                      className="h-8 text-right text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      value={String(Number(total.toFixed(2)))}
                      readOnly
                      className={cn(
                        'h-8 text-right text-sm',
                        lineError.total && 'border-red-500 focus-visible:ring-red-500',
                      )}
                    />
                    {lineError.total ? <p className="mt-1 text-[11px] leading-none text-red-500">{lineError.total}</p> : null}
                  </div>
                  <div className="flex justify-start">
                    <Button type="button" variant="ghost" size="icon" onClick={() => deleteLine(line.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-4 text-slate-800 shadow-sm dark:border-border dark:bg-muted/20 dark:text-foreground">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportPdf} className="gap-2 border-sky-200 bg-white text-sky-900 hover:bg-sky-50">
              <FileDown className="h-3.5 w-3.5" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={exportWord} className="gap-2 border-indigo-200 bg-white text-indigo-900 hover:bg-indigo-50">
              <FileText className="h-3.5 w-3.5" />
              Word
            </Button>
            <Button variant="outline" size="sm" onClick={exportExcel} className="gap-2 border-emerald-200 bg-white text-emerald-900 hover:bg-emerald-50">
              <FileSpreadsheet className="h-3.5 w-3.5" />
              Excel
            </Button>
            <Button variant="outline" size="sm" onClick={printQuotation} className="gap-2 border-amber-200 bg-white text-amber-900 hover:bg-amber-50">
              <Printer className="h-3.5 w-3.5" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={saveQuotation} className="gap-2 border-cyan-200 bg-white text-cyan-900 hover:bg-cyan-50">
              Save
            </Button>
            <Button variant="ghost" size="sm" onClick={resetBuilder} className="text-slate-700 hover:bg-white hover:text-slate-900">
              Clear
            </Button>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Grand total</p>
            <p className="text-xl font-semibold text-primary">{formatCurrency(grandTotal)}</p>
          </div>
        </div>
      </CardContent>

      <Dialog open={showCustomerCreate} onOpenChange={setShowCustomerCreate}>
        <DialogContent className="max-h-[90vh] w-[95vw] max-w-[640px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
            <DialogDescription>Create a new customer and use it right away.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Company name</Label>
              <Input value={newCustomer.companyName} onChange={e => setNewCustomer(current => ({ ...current, companyName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Contact person</Label>
              <Input value={newCustomer.contactPerson} onChange={e => setNewCustomer(current => ({ ...current, contactPerson: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={newCustomer.phone} onChange={e => setNewCustomer(current => ({ ...current, phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={newCustomer.email} onChange={e => setNewCustomer(current => ({ ...current, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Credit limit</Label>
              <Input type="number" value={newCustomer.creditLimit} onChange={e => setNewCustomer(current => ({ ...current, creditLimit: e.target.value }))} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Address</Label>
              <Textarea value={newCustomer.address} onChange={e => setNewCustomer(current => ({ ...current, address: e.target.value }))} className="min-h-24" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomerCreate(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCustomer}>Save customer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
