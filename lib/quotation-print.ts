import { formatCurrency, formatDate } from '@/lib/utils'

export type QuotationPrintLine = {
  itemName: string
  description: string
  quantity: number
  rate: number
  discount: number
  discountType: 'fixed' | 'percent'
  total: number
  matched: string
}

export type QuotationPrintPayload = {
  quoteNumber: string
  quoteDate: string
  validUntil: string
  customerName: string
  customerContact: string
  customerPhone: string
  customerEmail: string
  customerAddress: string
  notes: string
  subtotal: number
  discountTotal: number
  grandTotal: number
  lines: QuotationPrintLine[]
}

export type SavedQuotationPrintSource = {
  quoteNumber: string
  quoteDate: string
  validUntil: string
  customerName: string
  customerContact: string
  customerPhone: string
  customerEmail: string
  customerAddress: string
  notes: string
  subtotal: number
  discountTotal: number
  grandTotal: number
  lines: Array<{
    itemName: string
    description: string
    quantity: string | number
    rate: string | number
    discount: string | number
    discountType: 'fixed' | 'percent'
  }>
}

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const formatPlainNumber = (value: number) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)

export const loadImageDataUrl = async (src: string) => {
  try {
    const response = await fetch(src)
    if (!response.ok) return null
    const blob = await response.blob()

    return await new Promise<string | null>(resolve => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

export const waitForWindowImages = async (win: Window, timeoutMs = 2000) => {
  const images = Array.from(win.document.images)
  if (images.length === 0) return

  await Promise.race([
    Promise.all(
      images.map(
        image =>
          new Promise<void>(resolve => {
            if (image.complete) {
              resolve()
              return
            }

            image.addEventListener('load', () => resolve(), { once: true })
            image.addEventListener('error', () => resolve(), { once: true })
          }),
      ),
    ),
    new Promise<void>(resolve => {
      win.setTimeout(resolve, timeoutMs)
    }),
  ])
}

export const mapSavedQuotationToPrintPayload = (record: SavedQuotationPrintSource): QuotationPrintPayload => {
  const lines = record.lines.map(line => {
    const quantity = Number(line.quantity || 0)
    const rate = Number(line.rate || 0)
    const discount = Number(line.discount || 0)
    const base = quantity * rate
    const total = Math.max(0, base - discount)

    return {
      itemName: line.itemName,
      description: line.description,
      quantity,
      rate,
      discount,
      discountType: line.discountType,
      total,
      matched: 'Saved quotation',
    }
  })

  return {
    quoteNumber: record.quoteNumber,
    quoteDate: formatDate(record.quoteDate),
    validUntil: record.validUntil ? formatDate(record.validUntil) : '-',
    customerName: record.customerName,
    customerContact: record.customerContact,
    customerPhone: record.customerPhone,
    customerEmail: record.customerEmail,
    customerAddress: record.customerAddress,
    notes: record.notes,
    subtotal: Number(record.subtotal || 0),
    discountTotal: Number(record.discountTotal || 0),
    grandTotal: Number(record.grandTotal || 0),
    lines,
  }
}

export const buildQuotationDocument = (payload: QuotationPrintPayload, logoDataUrl?: string | null) => {
  const rows = payload.lines
    .map(
      (line, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${line.quantity}</td>
          <td>${escapeHtml(line.description || line.itemName)}</td>
          <td class="money">${formatPlainNumber(line.rate)}</td>
          <td class="money">${formatPlainNumber(line.total)}</td>
        </tr>`,
    )
    .join('')

  const logoMarkup = logoDataUrl
    ? `<img src="${logoDataUrl}" alt="DTC" class="brand-logo" />`
    : `<div class="logo-fallback">DTC</div>`

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(payload.quoteNumber)}</title>
        <style>
          @page { size: A4; margin: 12mm; }
          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #111827;
            margin: 0;
            background: #fff;
          }
          .page {
            border: 2px solid #6b7280;
            padding: 10px;
          }
          .header {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
          }
          .header td {
            vertical-align: middle;
            padding: 0;
          }
          .logo-cell {
            width: 72px;
            padding-right: 8px;
          }
          .copy-cell {
            text-align: center;
            line-height: 1.25;
          }
          .brand-logo {
            width: 64px;
            height: 64px;
            object-fit: contain;
            display: block;
          }
          .logo-fallback {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 64px;
            height: 64px;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.08em;
            color: #7f1d1d;
            border: 1px solid #d1d5db;
          }
          .company-name {
            margin: 0;
            font-size: 22px;
            font-weight: 700;
            color: #7f1d1d;
          }
          .company-line {
            margin: 2px 0 0;
            font-size: 11px;
            color: #0f172a;
          }
          .title {
            margin: 8px 0 12px;
            padding: 4px 0;
            text-align: center;
            font-size: 16px;
            font-weight: 700;
            letter-spacing: 0.14em;
            border-top: 1px solid #6b7280;
            border-bottom: 1px solid #6b7280;
          }
          .details {
            width: 100%;
            table-layout: fixed;
            border-collapse: collapse;
            margin-bottom: 12px;
          }
          .details td {
            border: 1px solid #6b7280;
            padding: 6px 8px;
            font-size: 12px;
            vertical-align: top;
          }
          .details .nowrap {
            white-space: nowrap;
            word-break: keep-all;
            overflow-wrap: normal;
          }
          .details .value-cell {
            width: 120px;
          }
          .details .label {
            width: 120px;
            background: #f3f4f6;
            font-weight: 700;
          }
          .items {
            width: 100%;
            border-collapse: collapse;
          }
          .items th,
          .items td {
            border: 1px solid #6b7280;
            padding: 6px 8px;
            font-size: 12px;
          }
          .items th {
            background: #f3f4f6;
            text-align: center;
            font-size: 11px;
          }
          .items .money {
            text-align: left;
            white-space: nowrap;
          }
          .items td:nth-child(1),
          .items td:nth-child(2) {
            text-align: center;
            white-space: nowrap;
          }
          .items td.money {
            text-align: left;
            white-space: nowrap;
          }
          .summary {
            width: 280px;
            margin-left: auto;
            margin-top: 12px;
            border: 1px solid #6b7280;
          }
          .summary div {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #6b7280;
            padding: 6px 8px;
            font-size: 12px;
          }
          .summary div:last-child {
            border-bottom: 0;
            font-weight: 700;
            font-size: 13px;
          }
          .footer-note {
            margin-top: 12px;
            font-size: 12px;
            color: #475569;
          }
          .signature-section {
            margin-top: 36px;
            page-break-inside: avoid;
          }
          .signature-title {
            margin: 0 0 14px;
            font-size: 16px;
            font-weight: 700;
            color: #7f1d1d;
            letter-spacing: 0.02em;
          }
          .signature-box {
            width: 560px;
            height: 120px;
            border: 1.5px solid #c98a68;
            border-radius: 10px;
            background: #fff;
          }
        </style>
      </head>
      <body>
        <div class="page">
          <table class="header">
            <tr>
              <td class="logo-cell">${logoMarkup}</td>
              <td class="copy-cell">
              <p class="company-name">Danis Trade Centre</p>
              <p class="company-line">No: 29. Sangamitha Mawatha, Colombo 13.</p>
              <p class="company-line">Tel: 0112 339 464 / 0112 339 465 Hotline: 0713 212 409 / 0766 750 479</p>
              <p class="company-line">E-mail: dantatradecentre09@gmail.com</p>
              </td>
            </tr>
          </table>
          <div class="title">QUOTATION</div>

          <table class="details">
            <tr>
              <td class="label">Customer</td>
              <td colspan="3">${escapeHtml(payload.customerName || 'Walk-in customer')}</td>
              <td class="label">Date</td>
              <td class="nowrap value-cell">${escapeHtml(payload.quoteDate)}</td>
            </tr>
            <tr>
              <td class="label">Kind Attention</td>
              <td colspan="3">${escapeHtml(payload.customerContact || '')}</td>
              <td class="label">Quote No</td>
              <td class="nowrap value-cell">${escapeHtml(payload.quoteNumber)}</td>
            </tr>
            <tr>
              <td class="label">Address</td>
              <td colspan="5">${escapeHtml(payload.customerAddress || '')}</td>
            </tr>
          </table>

          <table class="items">
            <thead>
              <tr>
                <th style="width: 42px;">No</th>
                <th style="width: 72px;">Qty</th>
                <th>Description</th>
                <th style="width: 100px;">Unit Price (LKR)</th>
                <th style="width: 110px;">Amount (LKR)</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>

          <div class="summary">
            <div><span>TOTAL AMOUNT</span><span>${formatCurrency(payload.grandTotal)}</span></div>
          </div>

          <div class="footer-note">${escapeHtml(payload.notes || 'Quotation valid for 7 days unless otherwise stated.')}</div>

          <div class="signature-section">
            <div class="signature-title">AUTHORIZED SIGNATURE</div>
            <div class="signature-box"></div>
          </div>
        </div>
      </body>
    </html>
  `
}
