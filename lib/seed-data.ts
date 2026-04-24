import type {
  BrandVariant,
  Category,
  Customer,
  InventoryAdjustment,
  Model,
  Payment,
  ProductType,
  Purchase,
  Sale,
  Subcategory,
  Supplier,
} from './types'

const baseDate = new Date('2026-04-22T09:00:00.000Z')
const daysAgo = (days: number) => new Date(baseDate.getTime() - days * 24 * 60 * 60 * 1000)
const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const makeId = (...parts: string[]) => parts.map(slugify).join('-')

type ModelTemplate = {
  label: string
  cost: number
  price: number
}

type ProductTypeBlueprint = {
  name: string
  description: string
}

type SubcategoryBlueprint = {
  name: string
  description: string
  productTypes: ProductTypeBlueprint[]
}

type CategoryBlueprint = {
  key: string
  name: string
  description: string
  brands: string[]
  modelTemplates: ModelTemplate[]
  subcategories: SubcategoryBlueprint[]
}

const catalogBlueprints: CategoryBlueprint[] = [
  {
    key: 'paints',
    name: 'Paints & Coatings',
    description: 'Interior paints, exterior finishes, primers, and decorative coatings.',
    brands: ['Nippon', 'Asian Paints', 'Dulux'],
    modelTemplates: [
      { label: '1L', cost: 650, price: 920 },
      { label: '5L', cost: 2850, price: 3920 },
      { label: '20L', cost: 10400, price: 13850 },
    ],
    subcategories: [
      {
        name: 'Interior Paints',
        description: 'Wall paints for homes, offices, and showrooms.',
        productTypes: [
          { name: 'Matt Finish', description: 'Low sheen paint for indoor walls.' },
          { name: 'Silk Finish', description: 'Soft sheen finish for premium interiors.' },
          { name: 'Washable Emulsion', description: 'Easy-clean emulsion for family spaces.' },
        ],
      },
      {
        name: 'Exterior Paints',
        description: 'Weather-resistant coatings for outside surfaces.',
        productTypes: [
          { name: 'Weather Shield', description: 'Paint for harsh outdoor conditions.' },
          { name: 'Acrylic Exterior', description: 'Durable acrylic coating for walls.' },
          { name: 'Textured Coat', description: 'Protective decorative exterior finish.' },
        ],
      },
      {
        name: 'Primers',
        description: 'Base coatings to prepare surfaces before painting.',
        productTypes: [
          { name: 'Wall Primer', description: 'Standard primer for masonry walls.' },
          { name: 'Wood Primer', description: 'Primer for wood and board surfaces.' },
          { name: 'Metal Primer', description: 'Primer for steel and metal fixtures.' },
        ],
      },
    ],
  },
  {
    key: 'construction',
    name: 'Construction Materials',
    description: 'Cement, sand, aggregate, blocks, and site materials.',
    brands: ['Tokyo Cement', 'Mahaweli Sand', 'Rathna Bricks'],
    modelTemplates: [
      { label: 'Bag', cost: 980, price: 1225 },
      { label: 'Load', cost: 9800, price: 12500 },
      { label: 'Bundle', cost: 1450, price: 1875 },
    ],
    subcategories: [
      {
        name: 'Cement',
        description: 'Bagged cement stock for construction sites.',
        productTypes: [
          { name: 'OPC Cement', description: 'Ordinary Portland cement bags.' },
          { name: 'PPC Cement', description: 'Portland Pozzolana cement bags.' },
          { name: 'Rapid Set Cement', description: 'Fast-setting cement for repair work.' },
        ],
      },
      {
        name: 'Sand and Aggregate',
        description: 'Construction fill materials and coarse aggregate.',
        productTypes: [
          { name: 'River Sand', description: 'Fine sand for plastering and masonry.' },
          { name: 'Metal Aggregate', description: 'Crushed stone for concrete works.' },
          { name: 'Crusher Dust', description: 'Fine crushed material for base work.' },
        ],
      },
      {
        name: 'Blocks and Bricks',
        description: 'Wall building materials for new construction.',
        productTypes: [
          { name: 'Clay Bricks', description: 'Standard clay brick stock.' },
          { name: 'Cement Blocks', description: 'Concrete blocks for walls and partitions.' },
          { name: 'Interlock Pavers', description: 'Paving blocks for outdoor flooring.' },
        ],
      },
    ],
  },
  {
    key: 'wood',
    name: 'Wood & Boards',
    description: 'Plywood, timber, board sheets, and joinery stock.',
    brands: ['Ceylon Ply', 'Swisstek', 'TimberMax'],
    modelTemplates: [
      { label: 'Sheet 8x4', cost: 3600, price: 4980 },
      { label: 'Piece', cost: 1750, price: 2360 },
      { label: 'Bundle', cost: 7200, price: 9450 },
    ],
    subcategories: [
      {
        name: 'Plywood',
        description: 'Plywood sheets for furniture and interiors.',
        productTypes: [
          { name: 'Commercial Ply', description: 'General purpose plywood sheets.' },
          { name: 'Marine Ply', description: 'Moisture-resistant plywood sheets.' },
          { name: 'Shuttering Ply', description: 'Heavy-duty plywood for formwork.' },
        ],
      },
      {
        name: 'Timber',
        description: 'Solid wood pieces for framing and carpentry.',
        productTypes: [
          { name: 'Hardwood Timber', description: 'Durable hardwood lengths.' },
          { name: 'Softwood Timber', description: 'Light timber for general work.' },
          { name: 'Planed Timber', description: 'Finished timber for joinery.' },
        ],
      },
      {
        name: 'Boards',
        description: 'Engineered board stock for cabinets and furniture.',
        productTypes: [
          { name: 'MDF Board', description: 'Medium-density fibre board sheets.' },
          { name: 'Particle Board', description: 'Budget board stock for furniture.' },
          { name: 'Laminate Board', description: 'Decorative laminated board sheets.' },
        ],
      },
    ],
  },
  {
    key: 'plumbing',
    name: 'Plumbing & Fittings',
    description: 'Pipes, valves, taps, connectors, and water line accessories.',
    brands: ['Astral', 'Lanka Pipes', 'Polytap'],
    modelTemplates: [
      { label: '1/2"', cost: 320, price: 460 },
      { label: '3/4"', cost: 480, price: 680 },
      { label: '1"', cost: 690, price: 960 },
    ],
    subcategories: [
      {
        name: 'Pipes',
        description: 'PVC and water delivery pipe stock.',
        productTypes: [
          { name: 'PVC Pipe', description: 'Standard PVC pipe lengths.' },
          { name: 'CPVC Pipe', description: 'Heat-resistant CPVC pipes.' },
          { name: 'GI Pipe', description: 'Galvanized iron pipe lengths.' },
        ],
      },
      {
        name: 'Fittings',
        description: 'Elbows, tees, unions, and connector accessories.',
        productTypes: [
          { name: 'Elbows', description: 'Pipe elbows and bends.' },
          { name: 'Tees', description: 'Three-way pipe connectors.' },
          { name: 'Unions', description: 'Threaded connector fittings.' },
        ],
      },
      {
        name: 'Fixtures',
        description: 'Valves, taps, and water control items.',
        productTypes: [
          { name: 'Ball Valves', description: 'Quarter-turn water valves.' },
          { name: 'Taps', description: 'Sink and utility taps.' },
          { name: 'Float Valves', description: 'Tank water control valves.' },
        ],
      },
    ],
  },
  {
    key: 'hardware',
    name: 'Electrical & Hardware',
    description: 'Wiring, switches, tools, fasteners, and general hardware items.',
    brands: ['Anchor', 'Finolex', 'Legrand'],
    modelTemplates: [
      { label: '1.5mm', cost: 420, price: 585 },
      { label: '2.5mm', cost: 650, price: 895 },
      { label: '4mm', cost: 920, price: 1240 },
    ],
    subcategories: [
      {
        name: 'Wiring',
        description: 'Electrical cable stock for domestic and commercial work.',
        productTypes: [
          { name: 'Single Core Wire', description: 'Basic wire for electrical runs.' },
          { name: 'Flexible Cable', description: 'Flexible cable for appliances and panels.' },
          { name: 'Armoured Cable', description: 'Protected cable for heavy-duty routes.' },
        ],
      },
      {
        name: 'Switches and Sockets',
        description: 'Switch plates, sockets, and modular fittings.',
        productTypes: [
          { name: 'Switch Modules', description: '1-way and 2-way switch modules.' },
          { name: 'Socket Modules', description: 'Universal socket modules.' },
          { name: 'Face Plates', description: 'Switch and socket plates.' },
        ],
      },
      {
        name: 'Tools and Fasteners',
        description: 'Hand tools, accessories, and fixing stock.',
        productTypes: [
          { name: 'Hand Tools', description: 'Screwdrivers, pliers, and cutters.' },
          { name: 'Screws and Bolts', description: 'Fastening items for work sites.' },
          { name: 'Drill Bits', description: 'Cutting and drilling accessories.' },
        ],
      },
    ],
  },
]

const categories: Category[] = []
const subcategories: Subcategory[] = []
const productTypes: ProductType[] = []
const models: Model[] = []
const brandVariants: BrandVariant[] = []

const featuredVariantsByCategory: Record<string, string> = {}
const variantByKey: Record<string, BrandVariant> = {}

let dayCursor = 80

for (const category of catalogBlueprints) {
  const categoryId = `cat-${category.key}`
  categories.push({
    id: categoryId,
    name: category.name,
    description: category.description,
    createdAt: daysAgo(dayCursor -= 1),
  })

  category.subcategories.forEach((subcategory, subcategoryIndex) => {
    const subcategoryId = makeId('sub', category.key, subcategory.name)
    subcategories.push({
      id: subcategoryId,
      categoryId,
      name: subcategory.name,
      description: subcategory.description,
      createdAt: daysAgo(dayCursor -= 1),
    })

    subcategory.productTypes.forEach((productType, productTypeIndex) => {
      const productTypeId = makeId('pt', category.key, subcategoryIndex.toString(), productType.name)
      productTypes.push({
        id: productTypeId,
        subcategoryId,
        name: productType.name,
        description: productType.description,
        createdAt: daysAgo(dayCursor -= 1),
      })

      category.modelTemplates.forEach((template, modelIndex) => {
        const modelId = makeId('mdl', category.key, subcategoryIndex.toString(), productTypeIndex.toString(), template.label)
        models.push({
          id: modelId,
          productTypeId,
          name: template.label,
          costPrice: template.cost,
          description: `${template.label} platform for ${productType.name.toLowerCase()}.`,
          createdAt: daysAgo(dayCursor -= 1),
        })

        category.brands.slice(0, 2).forEach((brand, brandIndex) => {
          const variantId = makeId('var', category.key, subcategoryIndex.toString(), productTypeIndex.toString(), modelIndex.toString(), brand)
          const sellingPrice = template.price + brandIndex * Math.round(template.price * 0.08)
          const costPrice = template.cost + brandIndex * Math.round(template.cost * 0.05)

          const variant: BrandVariant = {
            id: variantId,
            modelId,
            brand,
            variantName: `${template.label} ${productType.name}`,
            costPrice,
            sellingPrice,
            barcode: `${brand.slice(0, 3).toUpperCase()}-${slugify(category.key).slice(0, 4).toUpperCase()}-${template.label.replace(/[^a-z0-9]/gi, '')}-${brandIndex + 1}`,
            currentStock: 100 + category.modelTemplates.length * 12 - brandIndex * 10 - modelIndex * 4,
            reorderLevel: 18 + modelIndex * 3,
            createdAt: daysAgo(dayCursor -= 1),
          }

          brandVariants.push(variant)
          variantByKey[variantId] = variant

          if (!featuredVariantsByCategory[category.key]) {
            featuredVariantsByCategory[category.key] = variantId
          }
        })
      })
    })
  })
}

const categoryFeaturedVariants = catalogBlueprints.map(category => variantByKey[featuredVariantsByCategory[category.key]])

const purchaseTotals = [68500, 149800, 91200, 78400, 63000]
const salesTotals = [39200, 87100, 56400, 44950, 35800]

const purchases: Purchase[] = catalogBlueprints.map((category, index) => {
  const variant = categoryFeaturedVariants[index]
  const totalAmount = purchaseTotals[index]
  const paidAmount = Math.round(totalAmount * 0.72)
  return {
    id: `pur-${String(index + 1).padStart(3, '0')}`,
    supplierId: `sup-${category.key}`,
    lineItems: [
      {
        id: `pli-${String(index + 1).padStart(3, '0')}`,
        brandVariantId: variant.id,
        quantity: Math.max(20, Math.round(totalAmount / variant.costPrice)),
        unitCost: variant.costPrice,
        totalAmount,
      },
    ],
    totalAmount,
    paidAmount,
    dueAmount: totalAmount - paidAmount,
    status: 'completed',
    invoiceNumber: `PUR-2026-00${index + 1}`,
    purchaseDate: daysAgo(18 - index * 2),
    dueDate: daysAgo(8 - index),
    notes: `${category.name} stock replenishment for hardware orders`,
    createdAt: daysAgo(18 - index * 2),
  }
})

const sales: Sale[] = catalogBlueprints.map((category, index) => {
  const variant = categoryFeaturedVariants[index]
  const totalAmount = salesTotals[index]
  const paidAmount = index % 2 === 0 ? Math.round(totalAmount * 0.62) : totalAmount
  const discountAmount = index % 2 === 0 ? Math.round(totalAmount * 0.05) : 0
  const subtotal = totalAmount + discountAmount
  return {
    id: `sal-${String(index + 1).padStart(3, '0')}`,
    customerId: `cus-${category.key}`,
    lineItems: [
      {
        id: `sli-${String(index + 1).padStart(3, '0')}`,
        brandVariantId: variant.id,
        quantity: Math.max(4, Math.round(totalAmount / variant.sellingPrice)),
        unitPrice: variant.sellingPrice,
        discount: discountAmount,
        totalAmount,
      },
    ],
    subtotal,
    discountAmount,
    totalAmount,
    paidAmount,
    dueAmount: totalAmount - paidAmount,
    status: paidAmount >= totalAmount ? 'paid' : 'completed',
    invoiceNumber: `SAL-2026-00${index + 1}`,
    saleDate: daysAgo(16 - index * 2),
    dueDate: daysAgo(4 - index),
    notes: `${category.name} wholesale sale sample`,
    createdAt: daysAgo(16 - index * 2),
  }
})

const payments: Payment[] = [
  {
    id: 'pay-001',
    transactionId: purchases[0].id,
    transactionType: 'purchase',
    amount: purchases[0].paidAmount,
    paymentDate: daysAgo(17),
    paymentMethod: 'bank_transfer',
    reference: 'BT-APR-001',
    createdAt: daysAgo(17),
  },
  {
    id: 'pay-002',
    transactionId: sales[1].id,
    transactionType: 'sale',
    amount: sales[1].paidAmount,
    paymentDate: daysAgo(14),
    paymentMethod: 'cash',
    reference: 'CS-APR-002',
    createdAt: daysAgo(14),
  },
  {
    id: 'pay-003',
    transactionId: purchases[2].id,
    transactionType: 'purchase',
    amount: purchases[2].paidAmount,
    paymentDate: daysAgo(11),
    paymentMethod: 'bank_transfer',
    reference: 'BT-APR-003',
    createdAt: daysAgo(11),
  },
  {
    id: 'pay-004',
    transactionId: sales[3].id,
    transactionType: 'sale',
    amount: sales[3].paidAmount,
    paymentDate: daysAgo(8),
    paymentMethod: 'cheque',
    reference: 'CHQ-77821',
    createdAt: daysAgo(8),
  },
  {
    id: 'pay-005',
    transactionId: purchases[4].id,
    transactionType: 'purchase',
    amount: purchases[4].paidAmount,
    paymentDate: daysAgo(5),
    paymentMethod: 'bank_transfer',
    reference: 'BT-APR-005',
    createdAt: daysAgo(5),
  },
]

const supplierCredits = [1400000, 1700000, 1250000, 1300000, 900000]
const customerCredits = [850000, 1200000, 900000, 1000000, 650000]

const suppliers: Supplier[] = catalogBlueprints.map((category, index) => ({
  id: `sup-${category.key}`,
  companyName: [
    'Nippon Lanka Supplies',
    'Cement House Traders',
    'Ceylon Wood Mart',
    'PipeLine Distributors',
    'Prime Hardware Center',
  ][index],
  contactPerson: [
    'Nimal Perera',
    'Tharindu Jayasinghe',
    'Kavindi Rathnayake',
    'Priya Fernando',
    'Saman Jayalath',
  ][index],
  phone: [
    '+94 11 234 5678',
    '+94 11 555 0188',
    '+94 11 778 1100',
    '+94 11 778 4422',
    '+94 11 444 9900',
  ][index],
  email: [
    'orders@nipponlanka.example',
    'sales@cementhouse.example',
    'accounts@ceylonwood.example',
    'billing@pipeline.example',
    'sales@primehardware.example',
  ][index],
  address: [
    '45 Union Place, Colombo 02',
    '18 Kandy Road, Kadawatha',
    '12 Galle Road, Colombo 03',
    '88 Station Road, Colombo 05',
    '27 Export Zone, Katunayake',
  ][index],
  creditLimit: supplierCredits[index],
  outstandingBalance: purchases[index].dueAmount,
  createdAt: daysAgo(34 - index),
}))

const customers: Customer[] = catalogBlueprints.map((category, index) => ({
  id: `cus-${category.key}`,
  companyName: [
    'City Retailers',
    'BuildPro Traders',
    'WoodCraft Studio',
    'BlueLine Contractors',
    'Metro Hardware',
  ][index],
  contactPerson: [
    'Kasun Silva',
    'Sahan De Silva',
    'Anushka Jayawardena',
    'Dinesh Ranasinghe',
    'Thilini Fernando',
  ][index],
  phone: [
    '+94 76 111 2233',
    '+94 77 222 3344',
    '+94 71 333 4455',
    '+94 70 444 5566',
    '+94 11 555 6677',
  ][index],
  email: [
    'billing@cityretailers.example',
    'accounts@buildpro.example',
    'finance@woodcraft.example',
    'accounts@blueline.example',
    'procurement@metrohardware.example',
  ][index],
  address: [
    '14 Main Street, Kandy',
    '88 Station Road, Gampaha',
    '23 Business Park, Negombo',
    '102 Industrial Zone, Panadura',
    '9 University Avenue, Colombo 07',
  ][index],
  creditLimit: customerCredits[index],
  outstandingBalance: sales[index].dueAmount,
  createdAt: daysAgo(29 - index),
}))

const inventoryAdjustments: InventoryAdjustment[] = [
  {
    id: 'adj-001',
    brandVariantId: categoryFeaturedVariants[0].id,
    quantityChange: -6,
    reason: 'damage',
    notes: 'Paint tins damaged during unloading.',
    adjustedAt: daysAgo(9),
    createdAt: daysAgo(9),
  },
  {
    id: 'adj-002',
    brandVariantId: categoryFeaturedVariants[1].id,
    quantityChange: 4,
    reason: 'count_correction',
    notes: 'Cement bags matched after warehouse audit.',
    adjustedAt: daysAgo(6),
    createdAt: daysAgo(6),
  },
  {
    id: 'adj-003',
    brandVariantId: categoryFeaturedVariants[2].id,
    quantityChange: -2,
    reason: 'return',
    notes: 'Wood board sheets returned after size mismatch.',
    adjustedAt: daysAgo(5),
    createdAt: daysAgo(5),
  },
  {
    id: 'adj-004',
    brandVariantId: categoryFeaturedVariants[3].id,
    quantityChange: -1,
    reason: 'loss',
    notes: 'One pipe bundle misplaced during site delivery.',
    adjustedAt: daysAgo(2),
    createdAt: daysAgo(2),
  },
  {
    id: 'adj-005',
    brandVariantId: categoryFeaturedVariants[4].id,
    quantityChange: 2,
    reason: 'count_correction',
    notes: 'Extra hardware kits found after stock reconciliation.',
    adjustedAt: daysAgo(1),
    createdAt: daysAgo(1),
  },
]

export const seedData = {
  categories,
  subcategories,
  productTypes,
  models,
  brandVariants,
  suppliers,
  customers,
  purchases,
  sales,
  payments,
  inventoryAdjustments,
}
