'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  BrandVariant,
  Category,
  Model,
  ProductType,
  Subcategory,
} from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

type ProductPickerProps = {
  categories: Category[]
  subcategories: Subcategory[]
  productTypes: ProductType[]
  models: Model[]
  brandVariants: BrandVariant[]
  value: string
  onValueChange: (value: string) => void
  onTrailChange?: (trail: {
    categoryId?: string
    subcategoryId?: string
    productTypeId?: string
    modelId?: string
  }) => void
}

export function ProductPicker({
  categories,
  subcategories,
  productTypes,
  models,
  brandVariants,
  value,
  onValueChange,
  onTrailChange,
}: ProductPickerProps) {
  const [categoryId, setCategoryId] = useState('')
  const [subcategoryId, setSubcategoryId] = useState('')
  const [productTypeId, setProductTypeId] = useState('')
  const [modelId, setModelId] = useState('')

  const selectedVariant = useMemo(
    () => brandVariants.find(variant => variant.id === value),
    [brandVariants, value]
  )

  useEffect(() => {
    if (!value) {
      setCategoryId('')
      setSubcategoryId('')
      setProductTypeId('')
      setModelId('')
      return
    }

    if (!selectedVariant) return

    const nextModel = models.find(model => model.id === selectedVariant.modelId)
    const nextProductType = productTypes.find(productType => productType.id === nextModel?.productTypeId)
    const nextSubcategory = subcategories.find(subcategory => subcategory.id === nextProductType?.subcategoryId)
    const nextCategory = categories.find(category => category.id === nextSubcategory?.categoryId)

    setModelId(nextModel?.id || '')
    setProductTypeId(nextProductType?.id || '')
    setSubcategoryId(nextSubcategory?.id || '')
    setCategoryId(nextCategory?.id || '')
  }, [categories, models, productTypes, selectedVariant, subcategories])

  const selectedCategory = useMemo(() => categories.find(category => category.id === categoryId), [categories, categoryId])
  const selectedSubcategory = useMemo(() => subcategories.find(subcategory => subcategory.id === subcategoryId), [subcategories, subcategoryId])
  const selectedProductType = useMemo(() => productTypes.find(productType => productType.id === productTypeId), [productTypes, productTypeId])
  const selectedModel = useMemo(() => models.find(model => model.id === modelId), [models, modelId])

  const emitTrail = (trail: {
    categoryId?: string
    subcategoryId?: string
    productTypeId?: string
    modelId?: string
  }) => {
    onTrailChange?.(trail)
  }

  const handleCategoryChange = (categoryId: string) => {
    setCategoryId(categoryId)
    setSubcategoryId('')
    setProductTypeId('')
    setModelId('')
    emitTrail({ categoryId })
    onValueChange('')
  }

  const handleSubcategoryChange = (subcategoryId: string) => {
    setSubcategoryId(subcategoryId)
    setProductTypeId('')
    setModelId('')
    emitTrail({ categoryId, subcategoryId })
    onValueChange('')
  }

  const handleProductTypeChange = (productTypeId: string) => {
    setProductTypeId(productTypeId)
    setModelId('')
    emitTrail({
      categoryId,
      subcategoryId,
      productTypeId,
    })
    onValueChange('')
  }

  const handleModelChange = (modelId: string) => {
    setModelId(modelId)
    emitTrail({
      categoryId,
      subcategoryId,
      productTypeId,
      modelId,
    })
    onValueChange('')
  }

  const categoryOptions = categories
  const subcategoryOptions = categoryId
    ? subcategories.filter(subcategory => subcategory.categoryId === categoryId)
    : []
  const productTypeOptions = subcategoryId
    ? productTypes.filter(productType => productType.subcategoryId === subcategoryId)
    : []
  const modelOptions = productTypeId
    ? models.filter(model => model.productTypeId === productTypeId)
    : []
  const variantOptions = modelId
    ? brandVariants.filter(variant => variant.modelId === modelId)
    : []

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <div className="min-w-0 space-y-2">
        <Label>Category</Label>
        <Select value={selectedCategory?.id || ''} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-0 space-y-2">
        <Label>Subcategory</Label>
        <Select value={selectedSubcategory?.id || ''} onValueChange={handleSubcategoryChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select subcategory" />
          </SelectTrigger>
          <SelectContent>
            {subcategoryOptions.map(subcategory => (
              <SelectItem key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-0 space-y-2">
        <Label>Product Type</Label>
        <Select value={selectedProductType?.id || ''} onValueChange={handleProductTypeChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {productTypeOptions.map(productType => (
              <SelectItem key={productType.id} value={productType.id}>
                {productType.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-0 space-y-2">
        <Label>Model</Label>
        <Select value={selectedModel?.id || ''} onValueChange={handleModelChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            {modelOptions.map(model => (
              <SelectItem key={model.id} value={model.id}>
                {model.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-0 space-y-2">
        <Label>Brand Variant</Label>
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select SKU" />
          </SelectTrigger>
          <SelectContent>
            {variantOptions.map(variant => (
              <SelectItem key={variant.id} value={variant.id}>
                {variant.brand} - {variant.variantName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedVariant && (
        <Card className="lg:col-span-5 border-dashed">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
            <div>
              <p className="font-semibold">
                {selectedCategory?.name} / {selectedSubcategory?.name} / {selectedProductType?.name} / {selectedModel?.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedVariant.brand} {selectedVariant.variantName}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{selectedVariant.currentStock} in stock</Badge>
              <Badge variant="outline">{formatCurrency(selectedVariant.sellingPrice)}</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
