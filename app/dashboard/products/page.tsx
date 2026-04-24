'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import { ProductTree } from '@/components/product-tree'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { cn, formatCurrency, getStockStatus } from '@/lib/utils'
import { Boxes, Layers3, Package2, PencilLine, Plus, Search, Trash2 } from 'lucide-react'

type FormState = {
  name: string
  description: string
  categoryId: string
  subcategoryId: string
  productTypeId: string
  modelId: string
  brand: string
  variantName: string
  costPrice: string
  sellingPrice: string
  reorderLevel: string
  barcode: string
}

const emptyForm: FormState = {
  name: '',
  description: '',
  categoryId: '',
  subcategoryId: '',
  productTypeId: '',
  modelId: '',
  brand: '',
  variantName: '',
  costPrice: '',
  sellingPrice: '',
  reorderLevel: '',
  barcode: '',
}

export default function ProductsPage() {
  const store = useStore()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const [catalogCategoryId, setCatalogCategoryId] = useState('all')
  const [catalogSubcategoryId, setCatalogSubcategoryId] = useState('all')
  const [catalogProductTypeId, setCatalogProductTypeId] = useState('all')
  const [catalogModelId, setCatalogModelId] = useState('all')
  const [categoryDialog, setCategoryDialog] = useState(false)
  const [subcategoryDialog, setSubcategoryDialog] = useState(false)
  const [productTypeDialog, setProductTypeDialog] = useState(false)
  const [modelDialog, setModelDialog] = useState(false)
  const [variantDialog, setVariantDialog] = useState(false)
  const [editing, setEditing] = useState<{ type: 'category' | 'subcategory' | 'productType' | 'model' | 'variant'; id: string } | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)

  useEffect(() => {
    setQuery(searchParams.get('q') || '')
  }, [searchParams])

  useEffect(() => {
    setCatalogSubcategoryId('all')
    setCatalogProductTypeId('all')
    setCatalogModelId('all')
  }, [catalogCategoryId])

  useEffect(() => {
    setCatalogProductTypeId('all')
    setCatalogModelId('all')
  }, [catalogSubcategoryId])

  useEffect(() => {
    setCatalogModelId('all')
  }, [catalogProductTypeId])

  const resetForm = () => {
    setForm(emptyForm)
    setEditing(null)
  }

  const openCategoryDialog = (id?: string) => {
    if (id) {
      const category = store.categories.find(item => item.id === id)
      if (category) {
        setForm({ ...emptyForm, name: category.name, description: category.description || '' })
        setEditing({ type: 'category', id })
      }
    } else {
      resetForm()
    }
    setCategoryDialog(true)
  }

  const openSubcategoryDialog = (id?: string) => {
    if (id) {
      const subcategory = store.subcategories.find(item => item.id === id)
      if (subcategory) {
        setForm({ ...emptyForm, name: subcategory.name, description: subcategory.description || '', categoryId: subcategory.categoryId })
        setEditing({ type: 'subcategory', id })
      }
    } else {
      resetForm()
      setForm(current => ({ ...current, categoryId: store.categories[0]?.id || '' }))
    }
    setSubcategoryDialog(true)
  }

  const openProductTypeDialog = (id?: string) => {
    if (id) {
      const productType = store.productTypes.find(item => item.id === id)
      if (productType) {
        setForm({ ...emptyForm, name: productType.name, description: productType.description || '', subcategoryId: productType.subcategoryId })
        setEditing({ type: 'productType', id })
      }
    } else {
      resetForm()
      setForm(current => ({ ...current, subcategoryId: store.subcategories[0]?.id || '' }))
    }
    setProductTypeDialog(true)
  }

  const openModelDialog = (id?: string) => {
    if (id) {
      const model = store.models.find(item => item.id === id)
      if (model) {
        setForm({ ...emptyForm, name: model.name, description: model.description || '', productTypeId: model.productTypeId, costPrice: String(model.costPrice) })
        setEditing({ type: 'model', id })
      }
    } else {
      resetForm()
      setForm(current => ({ ...current, productTypeId: store.productTypes[0]?.id || '' }))
    }
    setModelDialog(true)
  }

  const openVariantDialog = (id?: string) => {
    if (id) {
      const variant = store.brandVariants.find(item => item.id === id)
      if (variant) {
        setForm({
          ...emptyForm,
          modelId: variant.modelId,
          brand: variant.brand,
          variantName: variant.variantName,
          costPrice: String(variant.costPrice),
          sellingPrice: String(variant.sellingPrice),
          reorderLevel: String(variant.reorderLevel),
          barcode: variant.barcode || '',
        })
        setEditing({ type: 'variant', id })
      }
    } else {
      resetForm()
      setForm(current => ({ ...current, modelId: store.models[0]?.id || '' }))
    }
    setVariantDialog(true)
  }

  const submitCategory = () => {
    if (!form.name.trim()) return
    if (editing?.type === 'category') {
      store.updateCategory(editing.id, form.name.trim(), form.description.trim() || undefined)
    } else {
      store.addCategory(form.name.trim(), form.description.trim() || undefined)
    }
    setCategoryDialog(false)
    resetForm()
  }

  const submitSubcategory = () => {
    if (!form.categoryId || !form.name.trim()) return
    if (editing?.type === 'subcategory') {
      store.updateSubcategory(editing.id, form.categoryId, form.name.trim(), form.description.trim() || undefined)
    } else {
      store.addSubcategory(form.categoryId, form.name.trim(), form.description.trim() || undefined)
    }
    setSubcategoryDialog(false)
    resetForm()
  }

  const submitProductType = () => {
    if (!form.subcategoryId || !form.name.trim()) return
    if (editing?.type === 'productType') {
      store.updateProductType(editing.id, form.subcategoryId, form.name.trim(), form.description.trim() || undefined)
    } else {
      store.addProductType(form.subcategoryId, form.name.trim(), form.description.trim() || undefined)
    }
    setProductTypeDialog(false)
    resetForm()
  }

  const submitModel = () => {
    if (!form.productTypeId || !form.name.trim() || !form.costPrice) return
    const cost = Number(form.costPrice)
    if (editing?.type === 'model') {
      store.updateModel(editing.id, form.productTypeId, form.name.trim(), cost, form.description.trim() || undefined)
    } else {
      store.addModel(form.productTypeId, form.name.trim(), cost, form.description.trim() || undefined)
    }
    setModelDialog(false)
    resetForm()
  }

  const submitVariant = () => {
    if (!form.modelId || !form.brand.trim() || !form.variantName.trim() || !form.sellingPrice || !form.reorderLevel) return
    const cost = Number(form.costPrice || 0)
    const price = Number(form.sellingPrice)
    const reorder = Number(form.reorderLevel)
    if (editing?.type === 'variant') {
      store.updateBrandVariant(editing.id, form.brand.trim(), form.variantName.trim(), cost, price, reorder, form.barcode.trim() || undefined)
    } else {
      store.addBrandVariant(form.modelId, form.brand.trim(), form.variantName.trim(), cost, price, reorder, form.barcode.trim() || undefined)
    }
    setVariantDialog(false)
    resetForm()
  }

  const searchResults = useMemo(() => {
    const base = query.trim() ? store.searchProducts(query.trim()) : store.brandVariants
    return base
      .map(variant => {
        const model = store.models.find(item => item.id === variant.modelId)
        const productType = store.productTypes.find(item => item.id === model?.productTypeId)
        const subcategory = store.subcategories.find(item => item.id === productType?.subcategoryId)
        const category = store.categories.find(item => item.id === subcategory?.categoryId)
        return { variant, model, productType, subcategory, category }
      })
      .sort((a, b) => a.variant.brand.localeCompare(b.variant.brand))
  }, [query, store])

  const catalogCategories = useMemo(() => {
    return store.categories.filter(category => catalogCategoryId === 'all' || category.id === catalogCategoryId)
  }, [catalogCategoryId, store.categories])

  const catalogSubcategories = useMemo(() => {
    return store.subcategories.filter(subcategory => {
      const matchesCategory = catalogCategoryId === 'all' || subcategory.categoryId === catalogCategoryId
      const matchesSubcategory = catalogSubcategoryId === 'all' || subcategory.id === catalogSubcategoryId
      return matchesCategory && matchesSubcategory
    })
  }, [catalogCategoryId, catalogSubcategoryId, store.subcategories])

  const catalogProductTypes = useMemo(() => {
    return store.productTypes.filter(productType => {
      const subcategory = store.subcategories.find(item => item.id === productType.subcategoryId)
      const matchesCategory = catalogCategoryId === 'all' || subcategory?.categoryId === catalogCategoryId
      const matchesSubcategory = catalogSubcategoryId === 'all' || productType.subcategoryId === catalogSubcategoryId
      const matchesProductType = catalogProductTypeId === 'all' || productType.id === catalogProductTypeId
      return matchesCategory && matchesSubcategory && matchesProductType
    })
  }, [catalogCategoryId, catalogProductTypeId, catalogSubcategoryId, store.productTypes, store.subcategories])

  const catalogModels = useMemo(() => {
    return store.models.filter(model => {
      const productType = store.productTypes.find(item => item.id === model.productTypeId)
      const subcategory = store.subcategories.find(item => item.id === productType?.subcategoryId)
      const matchesCategory = catalogCategoryId === 'all' || subcategory?.categoryId === catalogCategoryId
      const matchesSubcategory = catalogSubcategoryId === 'all' || productType?.subcategoryId === catalogSubcategoryId
      const matchesProductType = catalogProductTypeId === 'all' || model.productTypeId === catalogProductTypeId
      const matchesModel = catalogModelId === 'all' || model.id === catalogModelId
      return matchesCategory && matchesSubcategory && matchesProductType && matchesModel
    })
  }, [catalogCategoryId, catalogModelId, catalogProductTypeId, catalogSubcategoryId, store.models, store.productTypes, store.subcategories])

  const catalogVariants = useMemo(() => {
    return store.brandVariants.filter(variant => {
      const model = store.models.find(item => item.id === variant.modelId)
      const productType = store.productTypes.find(item => item.id === model?.productTypeId)
      const subcategory = store.subcategories.find(item => item.id === productType?.subcategoryId)
      const matchesCategory = catalogCategoryId === 'all' || subcategory?.categoryId === catalogCategoryId
      const matchesSubcategory = catalogSubcategoryId === 'all' || productType?.subcategoryId === catalogSubcategoryId
      const matchesProductType = catalogProductTypeId === 'all' || model?.productTypeId === catalogProductTypeId
      const matchesModel = catalogModelId === 'all' || model?.id === catalogModelId
      return matchesCategory && matchesSubcategory && matchesProductType && matchesModel
    })
  }, [catalogCategoryId, catalogModelId, catalogProductTypeId, catalogSubcategoryId, store.brandVariants, store.models, store.productTypes, store.subcategories])

  const selectCategory = (categoryId: string) => {
    setCatalogCategoryId(current => (current === categoryId ? 'all' : categoryId))
    setCatalogSubcategoryId('all')
    setCatalogProductTypeId('all')
    setCatalogModelId('all')
  }

  const selectSubcategory = (subcategoryId: string) => {
    const subcategory = store.subcategories.find(item => item.id === subcategoryId)
    if (!subcategory) return

    setCatalogCategoryId(subcategory.categoryId)
    setCatalogSubcategoryId(current => (current === subcategoryId ? 'all' : subcategoryId))
    setCatalogProductTypeId('all')
    setCatalogModelId('all')
  }

  const selectProductType = (productTypeId: string) => {
    const productType = store.productTypes.find(item => item.id === productTypeId)
    if (!productType) return

    const subcategory = store.subcategories.find(item => item.id === productType.subcategoryId)
    if (!subcategory) return

    setCatalogCategoryId(subcategory.categoryId)
    setCatalogSubcategoryId(subcategory.id)
    setCatalogProductTypeId(current => (current === productTypeId ? 'all' : productTypeId))
    setCatalogModelId('all')
  }

  const selectModel = (modelId: string) => {
    const model = store.models.find(item => item.id === modelId)
    if (!model) return

    const productType = store.productTypes.find(item => item.id === model.productTypeId)
    if (!productType) return

    const subcategory = store.subcategories.find(item => item.id === productType.subcategoryId)
    if (!subcategory) return

    setCatalogCategoryId(subcategory.categoryId)
    setCatalogSubcategoryId(subcategory.id)
    setCatalogProductTypeId(productType.id)
    setCatalogModelId(current => (current === modelId ? 'all' : modelId))
  }

  const productStats = [
    { label: 'Categories', value: store.categories.length, hint: 'Main groups', icon: Layers3 },
    { label: 'Subcategories', value: store.subcategories.length, hint: 'Second level', icon: Boxes },
    { label: 'Product types', value: store.productTypes.length, hint: 'Type layer', icon: Package2 },
    { label: 'Models', value: store.models.length, hint: 'Specification layer', icon: Package2 },
    { label: 'SKUs', value: store.brandVariants.length, hint: 'Brand variants', icon: Package2 },
  ] as const

  return (
    <div className="space-y-4">
      <Card className="border-border/60 shadow-sm">
        <CardContent className="space-y-2">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {productStats.map(stat => {
              const Icon = stat.icon
              return (
                <Card key={stat.label} className="border-border/60 shadow-none">
                  <CardContent className="flex items-center gap-3">
                    <div className="rounded-xl bg-muted p-3">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-xl font-semibold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.hint}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tree" className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-3 gap-1 rounded-2xl border bg-muted/40 p-1 shadow-sm">
          <TabsTrigger
            value="tree"
            className="h-11 rounded-xl border border-transparent text-sm font-semibold text-muted-foreground data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-border"
          >
            Hierarchy
          </TabsTrigger>
          <TabsTrigger
            value="catalog"
            className="h-11 rounded-xl border border-transparent text-sm font-semibold text-muted-foreground data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-border"
          >
            Catalog
          </TabsTrigger>
          <TabsTrigger
            value="search"
            className="h-11 rounded-xl border border-transparent text-sm font-semibold text-muted-foreground data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-border"
          >
            Search
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tree" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20">
                <div>
                  <CardTitle>Hierarchy tree</CardTitle>
                  <CardDescription>Browse from category down to variant</CardDescription>
                </div>
                <Badge variant="secondary">Live CRUD</Badge>
              </CardHeader>
              <CardContent className="p-6">
                <ProductTree />
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm">
              <CardHeader className="border-b bg-muted/20">
                <CardTitle>Quick actions</CardTitle>
                <CardDescription>Fast create buttons for each level</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 p-6 sm:grid-cols-2">
                <Button
                  className="justify-start gap-2 bg-gradient-to-r from-sky-700 via-sky-700 to-cyan-600 text-white shadow-sm hover:from-sky-600 hover:via-sky-600 hover:to-cyan-500 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
                  onClick={() => openCategoryDialog()}
                >
                  <Plus className="h-4 w-4" />
                  Add Category
                </Button>
                <Button
                  className="justify-start gap-2 border-sky-200 bg-white text-slate-900 shadow-sm hover:bg-sky-50 hover:text-slate-950 dark:border-input dark:bg-input/30 dark:text-sidebar-foreground dark:hover:bg-input/50"
                  variant="outline"
                  onClick={() => openSubcategoryDialog()}
                >
                  <Layers3 className="h-4 w-4" />
                  Add Subcategory
                </Button>
                <Button
                  className="justify-start gap-2 border-sky-200 bg-white text-slate-900 shadow-sm hover:bg-sky-50 hover:text-slate-950 dark:border-input dark:bg-input/30 dark:text-sidebar-foreground dark:hover:bg-input/50"
                  variant="outline"
                  onClick={() => openProductTypeDialog()}
                >
                  <Boxes className="h-4 w-4" />
                  Add Product Type
                </Button>
                <Button
                  className="justify-start gap-2 border-sky-200 bg-white text-slate-900 shadow-sm hover:bg-sky-50 hover:text-slate-950 dark:border-input dark:bg-input/30 dark:text-sidebar-foreground dark:hover:bg-input/50"
                  variant="outline"
                  onClick={() => openModelDialog()}
                >
                  <Package2 className="h-4 w-4" />
                  Add Model
                </Button>
                <Button
                  className="justify-start gap-2 sm:col-span-2 border-sky-200 bg-white text-slate-900 shadow-sm hover:bg-sky-50 hover:text-slate-950 dark:border-input dark:bg-input/30 dark:text-sidebar-foreground dark:hover:bg-input/50"
                  variant="outline"
                  onClick={() => openVariantDialog()}
                >
                  <Plus className="h-4 w-4" />
                  Add Brand Variant
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="catalog" className="space-y-6">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="flex flex-col gap-4 border-b bg-muted/20">
              <div className="grid w-full gap-3 xl:grid-cols-5">
                <div className="w-full space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Category</Label>
                  <Select value={catalogCategoryId} onValueChange={setCatalogCategoryId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {store.categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Subcategory</Label>
                  <Select value={catalogSubcategoryId} onValueChange={setCatalogSubcategoryId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All subcategories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All subcategories</SelectItem>
                      {store.subcategories
                        .filter(subcategory => catalogCategoryId === 'all' || subcategory.categoryId === catalogCategoryId)
                        .map(subcategory => (
                          <SelectItem key={subcategory.id} value={subcategory.id}>
                            {subcategory.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Product type</Label>
                  <Select value={catalogProductTypeId} onValueChange={setCatalogProductTypeId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All product types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All product types</SelectItem>
                      {store.productTypes
                        .filter(productType => {
                          const subcategory = store.subcategories.find(item => item.id === productType.subcategoryId)
                          return catalogCategoryId === 'all' || subcategory?.categoryId === catalogCategoryId
                        })
                        .filter(productType => catalogSubcategoryId === 'all' || productType.subcategoryId === catalogSubcategoryId)
                        .map(productType => (
                          <SelectItem key={productType.id} value={productType.id}>
                            {productType.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Model</Label>
                  <Select value={catalogModelId} onValueChange={setCatalogModelId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All models" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All models</SelectItem>
                      {store.models
                        .filter(model => {
                          const productType = store.productTypes.find(item => item.id === model.productTypeId)
                          const subcategory = store.subcategories.find(item => item.id === productType?.subcategoryId)
                          return (
                            (catalogCategoryId === 'all' || subcategory?.categoryId === catalogCategoryId) &&
                            (catalogSubcategoryId === 'all' || productType?.subcategoryId === catalogSubcategoryId) &&
                            (catalogProductTypeId === 'all' || model.productTypeId === catalogProductTypeId)
                          )
                        })
                        .map(model => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex w-full items-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setCatalogCategoryId('all')
                      setCatalogSubcategoryId('all')
                      setCatalogProductTypeId('all')
                      setCatalogModelId('all')
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[42rem] overflow-hidden p-0">
              <div className="h-full overflow-x-auto">
                <div className="grid h-full min-w-[88rem] gap-4 p-4 xl:grid-cols-5">
                  <section className="flex h-full min-h-0 flex-col rounded-2xl border bg-background p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Categories</h3>
                        <p className="text-xs text-muted-foreground">{catalogCategories.length} main groups</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => openCategoryDialog()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add
                      </Button>
                    </div>
                    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                      {catalogCategories.map(category => {
                        const isActive = catalogCategoryId === category.id
                        return (
                          <Card
                            key={category.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => selectCategory(category.id)}
                            onKeyDown={event => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault()
                                selectCategory(category.id)
                              }
                            }}
                            className={cn(
                              'border-border/60 shadow-none transition',
                              isActive
                                ? 'border-cyan-400 bg-cyan-50 ring-1 ring-cyan-400 dark:border-cyan-400 dark:bg-cyan-400/10 dark:ring-cyan-400'
                                : 'hover:border-cyan-300 hover:bg-muted/30 dark:hover:border-cyan-400/60 dark:hover:bg-white/5'
                            )}
                          >
                          <CardContent className="space-y-2 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-medium">{category.name}</p>
                                <p className="text-xs text-muted-foreground">{category.description || 'No description'}</p>
                              </div>
                              <div className="flex gap-1">
                                <Button size="icon" variant="ghost" onClick={event => { event.stopPropagation(); openCategoryDialog(category.id) }}>
                                  <PencilLine className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={event => { event.stopPropagation(); store.deleteCategory(category.id) }}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <Badge variant="secondary">{store.subcategories.filter(item => item.categoryId === category.id).length} subcategories</Badge>
                          </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </section>

                  <section className="flex h-full min-h-0 flex-col rounded-2xl border bg-background p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Subcategories</h3>
                        <p className="text-xs text-muted-foreground">{catalogSubcategories.length} branches</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => openSubcategoryDialog()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add
                      </Button>
                    </div>
                    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                      {catalogSubcategories.map(subcategory => {
                        const category = store.categories.find(item => item.id === subcategory.categoryId)
                        const isActive = catalogSubcategoryId === subcategory.id
                        return (
                          <Card
                            key={subcategory.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => selectSubcategory(subcategory.id)}
                            onKeyDown={event => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault()
                                selectSubcategory(subcategory.id)
                              }
                            }}
                            className={cn(
                              'border-border/60 shadow-none transition',
                              isActive
                                ? 'border-cyan-400 bg-cyan-50 ring-1 ring-cyan-400 dark:border-cyan-400 dark:bg-cyan-400/10 dark:ring-cyan-400'
                                : 'hover:border-cyan-300 hover:bg-muted/30 dark:hover:border-cyan-400/60 dark:hover:bg-white/5'
                            )}
                          >
                            <CardContent className="space-y-2 p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-medium">{subcategory.name}</p>
                                  <p className="text-xs text-muted-foreground">{category?.name || 'Unassigned'}</p>
                                  <p className="mt-1 text-xs text-muted-foreground">{subcategory.description || 'No description'}</p>
                                </div>
                                <div className="flex gap-1">
                                  <Button size="icon" variant="ghost" onClick={event => { event.stopPropagation(); openSubcategoryDialog(subcategory.id) }}>
                                    <PencilLine className="h-4 w-4" />
                                  </Button>
                                  <Button size="icon" variant="ghost" onClick={event => { event.stopPropagation(); store.deleteSubcategory(subcategory.id) }}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </section>

                  <section className="flex h-full min-h-0 flex-col rounded-2xl border bg-background p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Product types</h3>
                        <p className="text-xs text-muted-foreground">{catalogProductTypes.length} groupings</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => openProductTypeDialog()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add
                      </Button>
                    </div>
                    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                      {catalogProductTypes.map(productType => {
                        const subcategory = store.subcategories.find(item => item.id === productType.subcategoryId)
                        const isActive = catalogProductTypeId === productType.id
                        return (
                          <Card
                            key={productType.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => selectProductType(productType.id)}
                            onKeyDown={event => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault()
                                selectProductType(productType.id)
                              }
                            }}
                            className={cn(
                              'border-border/60 shadow-none transition',
                              isActive
                                ? 'border-cyan-400 bg-cyan-50 ring-1 ring-cyan-400 dark:border-cyan-400 dark:bg-cyan-400/10 dark:ring-cyan-400'
                                : 'hover:border-cyan-300 hover:bg-muted/30 dark:hover:border-cyan-400/60 dark:hover:bg-white/5'
                            )}
                          >
                            <CardContent className="space-y-2 p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-medium">{productType.name}</p>
                                  <p className="text-xs text-muted-foreground">{subcategory?.name || 'Unassigned'}</p>
                                  <p className="mt-1 text-xs text-muted-foreground">{productType.description || 'No description'}</p>
                                </div>
                                <div className="flex gap-1">
                                  <Button size="icon" variant="ghost" onClick={event => { event.stopPropagation(); openProductTypeDialog(productType.id) }}>
                                    <PencilLine className="h-4 w-4" />
                                  </Button>
                                  <Button size="icon" variant="ghost" onClick={event => { event.stopPropagation(); store.deleteProductType(productType.id) }}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </section>

                  <section className="flex h-full min-h-0 flex-col rounded-2xl border bg-background p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Models</h3>
                        <p className="text-xs text-muted-foreground">{catalogModels.length} spec rows</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => openModelDialog()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add
                      </Button>
                    </div>
                    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                      {catalogModels.map(model => {
                        const productType = store.productTypes.find(item => item.id === model.productTypeId)
                        const isActive = catalogModelId === model.id
                        return (
                          <Card
                            key={model.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => selectModel(model.id)}
                            onKeyDown={event => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault()
                                selectModel(model.id)
                              }
                            }}
                            className={cn(
                              'border-border/60 shadow-none transition',
                              isActive
                                ? 'border-cyan-400 bg-cyan-50 ring-1 ring-cyan-400 dark:border-cyan-400 dark:bg-cyan-400/10 dark:ring-cyan-400'
                                : 'hover:border-cyan-300 hover:bg-muted/30 dark:hover:border-cyan-400/60 dark:hover:bg-white/5'
                            )}
                          >
                            <CardContent className="space-y-2 p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-medium">{model.name}</p>
                                  <p className="text-xs text-muted-foreground">{productType?.name || 'Unassigned'}</p>
                                  <p className="mt-1 text-xs text-muted-foreground">{formatCurrency(model.costPrice)} base cost</p>
                                </div>
                                <div className="flex gap-1">
                                  <Button size="icon" variant="ghost" onClick={event => { event.stopPropagation(); openModelDialog(model.id) }}>
                                    <PencilLine className="h-4 w-4" />
                                  </Button>
                                  <Button size="icon" variant="ghost" onClick={event => { event.stopPropagation(); store.deleteModel(model.id) }}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </section>

                  <section className="flex h-full min-h-0 flex-col rounded-2xl border bg-background p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Brand variants</h3>
                        <p className="text-xs text-muted-foreground">{catalogVariants.length} SKUs</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => openVariantDialog()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add
                      </Button>
                    </div>
                    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                      {catalogVariants.map(variant => {
                        const model = store.models.find(item => item.id === variant.modelId)
                        const status = getStockStatus(variant.currentStock, variant.reorderLevel)
                        return (
                          <Card key={variant.id} className={`shadow-none ${status !== 'ok' ? 'border-amber-300' : 'border-border/60'}`}>
                            <CardContent className="space-y-2 p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-medium">{variant.brand}</p>
                                  <p className="text-sm text-muted-foreground">{variant.variantName}</p>
                                  <p className="mt-1 text-xs text-muted-foreground">{model?.name || 'Unassigned'} · {variant.barcode || 'No barcode'}</p>
                                </div>
                                <div className="flex gap-1">
                                  <Button size="icon" variant="ghost" onClick={() => openVariantDialog(variant.id)}>
                                    <PencilLine className="h-4 w-4" />
                                  </Button>
                                  <Button size="icon" variant="ghost" onClick={() => store.deleteBrandVariant(variant.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2 text-sm">
                                <Badge variant="secondary">{formatCurrency(variant.sellingPrice)}</Badge>
                                <Badge variant={status === 'out' ? 'destructive' : 'outline'}>{variant.currentStock} stock</Badge>
                                <Badge variant="outline">Reorder {variant.reorderLevel}</Badge>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </section>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle>Global product search</CardTitle>
              <CardDescription>Search brand, model, barcode, or category path.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search the catalog" className="pl-9" />
                </div>
                <div className="flex items-center justify-center rounded-xl border bg-muted/30 px-4 text-sm text-muted-foreground">
                  {searchResults.length} matching SKUs
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {searchResults.map(({ variant, model, productType, subcategory, category }) => (
                  <div key={variant.id} className="rounded-2xl border bg-background p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div>
                          <p className="font-medium">{variant.brand} {variant.variantName}</p>
                          <p className="text-sm text-muted-foreground">{category?.name} / {subcategory?.name}</p>
                          <p className="text-sm text-muted-foreground">{productType?.name} / {model?.name}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{variant.barcode || 'No barcode available'}</Badge>
                          <Badge variant="outline">{variant.currentStock} stock</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(variant.sellingPrice)}</p>
                        <p className="text-xs text-muted-foreground">Selling price</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing?.type === 'category' ? 'Edit category' : 'Add category'}</DialogTitle>
              <DialogDescription>Top-level product grouping for the shop hierarchy.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={event => setForm(current => ({ ...current, description: event.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCategoryDialog(false)}>Cancel</Button>
              <Button onClick={submitCategory}>{editing?.type === 'category' ? 'Save changes' : 'Create category'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={subcategoryDialog} onOpenChange={setSubcategoryDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing?.type === 'subcategory' ? 'Edit subcategory' : 'Add subcategory'}</DialogTitle>
              <DialogDescription>Choose the parent category before saving.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Parent category</Label>
                <Select value={form.categoryId} onValueChange={value => setForm(current => ({ ...current, categoryId: value }))}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {store.categories.map(category => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={event => setForm(current => ({ ...current, description: event.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSubcategoryDialog(false)}>Cancel</Button>
              <Button onClick={submitSubcategory}>{editing?.type === 'subcategory' ? 'Save changes' : 'Create subcategory'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={productTypeDialog} onOpenChange={setProductTypeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing?.type === 'productType' ? 'Edit product type' : 'Add product type'}</DialogTitle>
              <DialogDescription>Attach the product type to a subcategory.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Parent subcategory</Label>
                <Select value={form.subcategoryId} onValueChange={value => setForm(current => ({ ...current, subcategoryId: value }))}>
                  <SelectTrigger><SelectValue placeholder="Select subcategory" /></SelectTrigger>
                  <SelectContent>
                    {store.subcategories.map(subcategory => <SelectItem key={subcategory.id} value={subcategory.id}>{subcategory.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={event => setForm(current => ({ ...current, description: event.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setProductTypeDialog(false)}>Cancel</Button>
              <Button onClick={submitProductType}>{editing?.type === 'productType' ? 'Save changes' : 'Create product type'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={modelDialog} onOpenChange={setModelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing?.type === 'model' ? 'Edit model' : 'Add model'}</DialogTitle>
              <DialogDescription>Models define the specification layer for variants.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Parent product type</Label>
                <Select value={form.productTypeId} onValueChange={value => setForm(current => ({ ...current, productTypeId: value }))}>
                  <SelectTrigger><SelectValue placeholder="Select product type" /></SelectTrigger>
                  <SelectContent>
                    {store.productTypes.map(productType => <SelectItem key={productType.id} value={productType.id}>{productType.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Model name</Label>
                <Input value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} placeholder="e.g. 12W or AC1200" />
              </div>
              <div className="space-y-2">
                <Label>Base cost price</Label>
                <Input type="number" value={form.costPrice} onChange={event => setForm(current => ({ ...current, costPrice: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={event => setForm(current => ({ ...current, description: event.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModelDialog(false)}>Cancel</Button>
              <Button onClick={submitModel}>{editing?.type === 'model' ? 'Save changes' : 'Create model'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={variantDialog} onOpenChange={setVariantDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editing?.type === 'variant' ? 'Edit brand variant' : 'Add brand variant'}</DialogTitle>
              <DialogDescription>This is the SKU level used in purchasing, sales, and inventory.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Parent model</Label>
                <Select value={form.modelId} onValueChange={value => setForm(current => ({ ...current, modelId: value }))}>
                  <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
                  <SelectContent>
                    {store.models.map(model => <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Brand name</Label>
                <Input value={form.brand} onChange={event => setForm(current => ({ ...current, brand: event.target.value }))} placeholder="Philips" />
              </div>
              <div className="space-y-2">
                <Label>Variant name</Label>
                <Input value={form.variantName} onChange={event => setForm(current => ({ ...current, variantName: event.target.value }))} placeholder="12W LED Bulb" />
              </div>
              <div className="space-y-2">
                <Label>Cost price</Label>
                <Input type="number" value={form.costPrice} onChange={event => setForm(current => ({ ...current, costPrice: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Selling price</Label>
                <Input type="number" value={form.sellingPrice} onChange={event => setForm(current => ({ ...current, sellingPrice: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Reorder level</Label>
                <Input type="number" value={form.reorderLevel} onChange={event => setForm(current => ({ ...current, reorderLevel: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Barcode</Label>
                <Input value={form.barcode} onChange={event => setForm(current => ({ ...current, barcode: event.target.value }))} placeholder="Optional" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setVariantDialog(false)}>Cancel</Button>
              <Button onClick={submitVariant}>{editing?.type === 'variant' ? 'Save changes' : 'Create brand variant'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Tabs>
    </div>
  )
}
