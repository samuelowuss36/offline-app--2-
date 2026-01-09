"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { getProducts, addProduct, updateProduct, deleteProduct } from "@/lib/db"
import type { Product } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Trash2, Edit2, AlertTriangle, Trash } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const MOTHERCARE_CATEGORIES = [
  "Baby Diapers",
  "Baby Food & Milk Formulas",
  "Baby Clothing",
  "Baby Gear & Accessories",
  "Baby Hygiene & Bath",
  "Maternity Care",
  "Toys & Development",
  "Feeding Bottles & Accessories",
  "Strollers & Car Seats",
  "Bedding & Sleep",
]

export default function InventoryPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [showClearAll, setShowClearAll] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    wholesalePrice: "",
    retailPrice: "",
    quantity: "",
    description: "",
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const data = await getProducts()
      setProducts(data)
      console.log("[v0] Loaded products from database:", data.length, "items")
    } finally {
      setLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    const wholesalePrice = Number.parseFloat(formData.wholesalePrice)
    const retailPrice = Number.parseFloat(formData.retailPrice)
    const quantity = Number.parseInt(formData.quantity)

    if (!formData.name.trim()) errors.name = "Product name is required"
    if (!formData.sku.trim()) errors.sku = "SKU is required"
    if (!formData.category) errors.category = "Category is required"
    if (!formData.wholesalePrice || wholesalePrice <= 0)
      errors.wholesalePrice = "Wholesale price must be greater than 0"
    if (!formData.retailPrice || retailPrice <= 0) errors.retailPrice = "Retail price must be greater than 0"
    if (retailPrice <= wholesalePrice) errors.retailPrice = "Retail price must be greater than wholesale price"
    if (!formData.quantity || quantity <= 0) errors.quantity = "Quantity must be greater than 0"

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      const wholesalePrice = Number.parseFloat(formData.wholesalePrice)
      const retailPrice = Number.parseFloat(formData.retailPrice)
      const profit = retailPrice - wholesalePrice

      if (editingId) {
        const product = products.find((p) => p.id === editingId)
        if (product) {
          await updateProduct({
            ...product,
            name: formData.name,
            sku: formData.sku,
            category: formData.category,
            wholesalePrice,
            profit,
            price: retailPrice,
            quantity: Number.parseInt(formData.quantity),
            description: formData.description,
          })
          toast({
            title: "Product Updated",
            description: `${formData.name} has been saved to the database`,
            variant: "default",
          })
          console.log("[v0] Product updated and saved to database:", formData.name)
        }
        setEditingId(null)
      } else {
        await addProduct({
          id: `product_${Date.now()}`,
          name: formData.name,
          sku: formData.sku,
          category: formData.category,
          wholesalePrice,
          profit,
          price: retailPrice,
          quantity: Number.parseInt(formData.quantity),
          description: formData.description,
        })
        toast({
          title: "Product Added",
          description: `${formData.name} has been saved to the database`,
          variant: "default",
        })
        console.log("[v0] New product added and saved to database:", formData.name)
      }

      setFormData({
        name: "",
        sku: "",
        category: "",
        wholesalePrice: "",
        retailPrice: "",
        quantity: "",
        description: "",
      })
      setEditingId(null)
      setIsAddingProduct(false)
      await loadProducts()
    } catch (error) {
      console.error("Error saving product:", error)
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id)
        await loadProducts()
      } catch (error) {
        console.error("Error deleting product:", error)
      }
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingId(product.id)
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      wholesalePrice: product.wholesalePrice.toString(),
      retailPrice: product.price.toString(),
      quantity: product.quantity.toString(),
      description: product.description || "",
    })
    setIsAddingProduct(true)
  }

  const handleClearAllProducts = async () => {
    try {
      for (const product of products) {
        await deleteProduct(product.id)
      }
      await loadProducts()
      setShowClearAll(false)
    } catch (error) {
      console.error("Error clearing products:", error)
    }
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return <div className="p-8 text-center">Loading inventory...</div>
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Manage products and stock levels</p>
        </div>
        <div className="flex gap-2">
          {products.length > 0 && (
            <AlertDialog open={showClearAll} onOpenChange={setShowClearAll}>
              <Button variant="destructive" className="gap-2" onClick={() => setShowClearAll(true)}>
                <Trash className="h-4 w-4" />
                Clear All Products
              </Button>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Clear All Products?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete all {products.length} products from your inventory. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex gap-3">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearAllProducts}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete All Products
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 gap-2">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Product" : "Add New Product"}</DialogTitle>
                <DialogDescription>
                  {editingId ? "Update product details" : "Add a new product to your inventory"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Baby Diaper Pack"
                    className={validationErrors.name ? "border-destructive" : ""}
                  />
                  {validationErrors.name && <p className="text-xs text-destructive mt-1">{validationErrors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g., DIAPER-001"
                    className={validationErrors.sku ? "border-destructive" : ""}
                  />
                  {validationErrors.sku && <p className="text-xs text-destructive mt-1">{validationErrors.sku}</p>}
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md bg-background ${validationErrors.category ? "border-destructive" : "border-input"}`}
                  >
                    <option value="">Select a category</option>
                    {MOTHERCARE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {validationErrors.category && (
                    <p className="text-xs text-destructive mt-1">{validationErrors.category}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="wholesalePrice">Wholesale Price (Cost) *</Label>
                    <Input
                      id="wholesalePrice"
                      type="number"
                      step="0.01"
                      value={formData.wholesalePrice}
                      onChange={(e) => setFormData({ ...formData, wholesalePrice: e.target.value })}
                      className={validationErrors.wholesalePrice ? "border-red-500" : ""}
                    />
                    {validationErrors.wholesalePrice && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.wholesalePrice}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="retailPrice">Retail Price (Wholesale + Profit)</Label>
                    <Input
                      id="retailPrice"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 45.99"
                      value={formData.retailPrice}
                      onChange={(e) => setFormData({ ...formData, retailPrice: e.target.value })}
                      className={validationErrors.retailPrice ? "border-red-500" : ""}
                    />
                    {validationErrors.retailPrice && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.retailPrice}</p>
                    )}
                  </div>
                </div>

                {formData.wholesalePrice && formData.retailPrice && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700">
                      <strong>Profit per unit:</strong> GHS{" "}
                      {(Number.parseFloat(formData.retailPrice) - Number.parseFloat(formData.wholesalePrice)).toFixed(
                        2,
                      )}
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className={validationErrors.quantity ? "border-destructive" : ""}
                  />
                  {validationErrors.quantity && (
                    <p className="text-xs text-destructive mt-1">{validationErrors.quantity}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Product description (optional)"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="bg-primary hover:bg-primary/90">
                    {editingId ? "Update" : "Add"} Product
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddingProduct(false)
                      setValidationErrors({})
                      setEditingId(null)
                      setFormData({
                        name: "",
                        sku: "",
                        category: "",
                        wholesalePrice: "",
                        retailPrice: "",
                        quantity: "",
                        description: "",
                      })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Products</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by name, SKU, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Products ({filteredProducts.length})</CardTitle>
          <CardDescription>Manage your inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Name</th>
                  <th className="text-left py-3 px-4 font-semibold">SKU</th>
                  <th className="text-left py-3 px-4 font-semibold">Category</th>
                  <th className="text-right py-3 px-4 font-semibold">Wholesale</th>
                  <th className="text-right py-3 px-4 font-semibold">Profit</th>
                  <th className="text-right py-3 px-4 font-semibold">Retail Price</th>
                  <th className="text-right py-3 px-4 font-semibold">Stock</th>
                  <th className="text-center py-3 px-4 font-semibold">Status</th>
                  <th className="text-center py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">{product.name}</td>
                    <td className="py-3 px-4 font-mono text-xs">{product.sku}</td>
                    <td className="py-3 px-4">{product.category}</td>
                    <td className="py-3 px-4 text-right font-medium">GHS {(product.wholesalePrice ?? 0).toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-medium">GHS {(product.profit ?? 0).toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-medium text-primary">
                      GHS {(product.price ?? 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">{product.quantity} units</td>
                    <td className="py-3 px-4 text-center">
                      {product.quantity < 20 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                          <AlertTriangle className="h-3 w-3" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100/20 text-green-700">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center flex items-center justify-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredProducts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No products found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
