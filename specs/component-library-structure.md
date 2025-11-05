# Component Library Structure and Shared UI Patterns

## 🎯 Overview

This document defines the structure and organization of the Ogni component library, combining shadcn/ui components with custom Ogni-specific components. It establishes patterns for shared UI elements across all features.

## 📁 Directory Structure

### Component Organization
```
src/
├── components/
│   ├── ui/                    # Shadcn/UI base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── ... (all shadcn/ui components)
│   ├── lib/
│   │   └── utils.ts          # Utility functions (cn, etc.)
│   ├── shared/               # Cross-feature custom components
│   │   ├── product/          # Product-related components
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   └── ProductFilters.tsx
│   │   ├── cart/             # Cart-related components
│   │   │   ├── CartSummary.tsx
│   │   │   └── CartItem.tsx
│   │   ├── checkout/         # Checkout components
│   │   │   ├── CheckoutForm.tsx
│   │   │   └── OrderSummary.tsx
│   │   ├── common/           # General-purpose components
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   ├── navigation/
│   │   │   │   ├── Navigation.tsx
│   │   │   │   └── Breadcrumb.tsx
│   │   │   └── forms/
│   │   │       ├── FormField.tsx
│   │   │       └── FormValidation.tsx
│   │   └── social/           # Social commerce components
│   │       ├── FeedItem.tsx
│   │       └── InteractionButtons.tsx
│   ├── features/             # Feature-specific components
│   │   ├── core-ecommerce/
│   │   ├── social-commerce/
│   │   ├── ai-automation/
│   │   ├── marketing-tools/
│   │   ├── advanced-analytics/
│   │   ├── marketplace-integration/
│   │   └── mobile-native/
│   └── hooks/                # Custom hooks
│       ├── useCart.ts
│       ├── useProduct.ts
│       └── useValidation.ts
```

## 🧩 Component Categories

### 1. Base Components (shadcn/ui)
These are the foundational shadcn/ui components that should not be modified:

#### Essential Components
- `Button` - All interactive elements
- `Card` - Content containers
- `Input` - Form inputs
- `Label` - Form labels
- `Dialog` - Modal interactions
- `Separator` - Visual dividers
- `Skeleton` - Loading states
- `Badge` - Status indicators

#### Layout Components
- `Tabs` - Tabbed interfaces
- `Accordion` - Expandable sections
- `Popover` - Hover/focus content
- `Tooltip` - Help text
- `DropdownMenu` - Menu interactions

#### Data Components
- `Table` - Data display
- `Pagination` - Page navigation
- `Select` - Selection controls
- `Checkbox` - Multi-select options
- `RadioGroup` - Single-select options

### 2. Enhanced Components (Custom)
These extend shadcn/ui components with Ogni-specific functionality:

#### Product Components
```tsx
// Enhanced Product Card
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: Product
  onAddToCart?: (productId: string) => void
 showQuickView?: boolean
}

export const ProductCard = ({ 
  product, 
  onAddToCart, 
  showQuickView = true 
}: ProductCardProps) => {
  return (
    <Card className={cn(
      "hover:shadow-lg transition-shadow duration-200",
      "group relative overflow-hidden"
    )}>
      <div className="relative">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.onSale && (
          <Badge className="absolute top-2 left-2">Sale</Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
        <div className="flex items-center justify-between">
          <span className="text-primary font-medium">{product.price}</span>
          {product.compareAtPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {product.compareAtPrice}
            </span>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4">
        <Button 
          onClick={() => onAddToCart?.(product.id)}
          className="w-full"
        >
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
}
```

#### Cart Components
```tsx
// Enhanced Cart Summary
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface CartSummaryProps {
  items: CartItem[]
  subtotal: number
  shipping: number
  total: number
  onCheckout: () => void
}

export const CartSummary = ({ 
  items, 
  subtotal, 
  shipping, 
 total, 
  onCheckout 
}: CartSummaryProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
        
        <div className="space-y-3 mb-4">
          {items.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.quantity}x {item.product.name}</span>
              <span>{item.total}</span>
            </div>
          ))}
        </div>
        
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free' : shipping}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg pt-2 border-t">
            <span>Total</span>
            <span>{total}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-6">
        <Button 
          onClick={onCheckout}
          className="w-full h-12 text-lg"
          disabled={items.length === 0}
        >
          Checkout
        </Button>
      </CardFooter>
    </Card>
  )
}
```

### 3. Composite Components
These combine multiple base components for complex UI patterns:

#### Checkout Flow
```tsx
// Multi-step checkout using composition
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddressForm } from "@/components/shared/checkout/AddressForm"
import { PaymentForm } from "@/components/shared/checkout/PaymentForm"
import { OrderReview } from "@/components/shared/checkout/OrderReview"

interface CheckoutFlowProps {
  currentStep: 'address' | 'payment' | 'review' | 'confirmation'
  onStepChange: (step: string) => void
  cart: Cart
}

export const CheckoutFlow = ({ currentStep, onStepChange, cart }: CheckoutFlowProps) => {
  return (
    <Tabs 
      value={currentStep} 
      onValueChange={onStepChange}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-4 mb-8">
        <TabsTrigger value="address">Address</TabsTrigger>
        <TabsTrigger value="payment">Payment</TabsTrigger>
        <TabsTrigger value="review">Review</TabsTrigger>
        <TabsTrigger value="confirmation">Confirm</TabsTrigger>
      </TabsList>
      
      <TabsContent value="address">
        <AddressForm />
      </TabsContent>
      
      <TabsContent value="payment">
        <PaymentForm />
      </TabsContent>
      
      <TabsContent value="review">
        <OrderReview cart={cart} />
      </TabsContent>
      
      <TabsContent value="confirmation">
        <OrderConfirmation />
      </TabsContent>
    </Tabs>
  )
}
```

## 🎨 Shared UI Patterns

### 1. Layout Patterns

#### Responsive Grid System
```tsx
// Standard product grid
const ProductGrid = ({ products }: { products: Product[] }) => {
 return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

#### Sidebar Layout
```tsx
// Main layout with sidebar
const LayoutWithSidebar = ({ children, sidebar }: { 
  children: React.ReactNode
  sidebar: React.ReactNode
}) => {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <aside className="lg:w-64 lg:block hidden h-full">
        {sidebar}
      </aside>
      <main className="flex-1 p-4 lg:p-8">
        {children}
      </main>
    </div>
  )
}
```

### 2. Form Patterns

#### Standard Form Layout
```tsx
// Consistent form pattern
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const StandardForm = () => {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="Enter your email" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="Enter your password" />
        </div>
        
        <Button className="w-full">Submit</Button>
      </CardContent>
    </Card>
  )
}
```

### 3. Loading and State Patterns

#### Loading States
```tsx
// Consistent loading pattern
import { Skeleton } from "@/components/ui/skeleton"

const LoadingProductCard = () => {
  return (
    <div className="space-y-3">
      <Skeleton className="h-48 w-full rounded" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}
```

#### Empty States
```tsx
// Consistent empty state
import { Card, CardContent } from "@/components/ui/card"

const EmptyState = ({ 
  title, 
  description, 
  action 
}: { 
  title: string
  description: string
 action?: React.ReactNode
}) => {
  return (
    <Card className="text-center py-12">
      <CardContent>
        <div className="text-muted-foreground mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-1.1-5.291-2.709C5.1 11.1 5.982 8 12 8c6.018 0 6.899 3.1 5.291 4.291z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4">{description}</p>
        {action}
      </CardContent>
    </Card>
  )
}
```

## 🔄 Component Composition Guidelines

### 1. Extension Pattern
Extend shadcn/ui components with additional functionality:

```tsx
// Good: Extending base component
interface CustomButtonProps extends React.ComponentProps<typeof Button> {
  variant?: 'primary' | 'secondary' | 'accent'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const CustomButton = ({ 
  variant = 'primary', 
  size = 'md', 
  loading, 
  children, 
  ...props 
}: CustomButtonProps) => {
  const variantClasses = {
    primary: "bg-primary hover:bg-primary/90 text-primary-foreground",
    secondary: "bg-secondary hover:bg-secondary/80 text-secondary-foreground",
    accent: "bg-accent hover:bg-accent/80 text-accent-foreground"
  }

  return (
    <Button
      className={cn(variantClasses[variant])}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Spinner className="mr-2" />}
      {children}
    </Button>
  )
}
```

### 2. Composition Pattern
Combine multiple components for complex UI:

```tsx
// Good: Composing components
const ProductCardWithActions = ({ product }: { product: Product }) => {
  return (
    <Card>
      <CardContent className="p-0">
        <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
        <div className="p-4">
          <h3 className="font-semibold">{product.name}</h3>
          <p className="text-primary font-medium">{product.price}</p>
        </div>
      </CardContent>
      <CardFooter className="p-4">
        <div className="flex space-x-2 w-full">
          <Button variant="outline" className="flex-1">Quick View</Button>
          <Button className="flex-1">Add to Cart</Button>
        </div>
      </CardFooter>
    </Card>
  )
}
```

## 🧪 Shared Hooks and Utilities

### 1. Common Hooks
```tsx
// Shared cart hook
export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([])
  
  const addToCart = (product: Product, quantity: number = 1) => {
    setItems(prev => {
      const existing = prev.find(item => item.productId === product.id)
      if (existing) {
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prev, { productId: product.id, quantity, product }]
    })
  }
  
  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(item => item.productId !== productId))
  }
  
  const clearCart = () => setItems([])
  
  return { items, addToCart, removeFromCart, clearCart }
}
```

### 2. Utility Functions
```tsx
// Shared utility functions
export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price)
}

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
```

## 📦 Export Strategy

### Barrel Exports
Create index files for easy imports:

```tsx
// components/shared/index.ts
export * from './product/ProductCard'
export * from './product/ProductGrid'
export * from './cart/CartSummary'
export * from './cart/CartItem'
export * from './checkout/CheckoutForm'
// ... other exports
```

### Component Groups
```tsx
// components/shared/product/index.ts
export { ProductCard } from './ProductCard'
export { ProductGrid } from './ProductGrid'
export { ProductFilters } from './ProductFilters'
```

## 🧪 Testing Patterns

### Component Testing
```tsx
// Test patterns for shared components
import { render, screen, fireEvent } from '@testing-library/react'
import { ProductCard } from '@/components/shared/product/ProductCard'

describe('ProductCard', () => {
 const mockProduct = {
    id: '1',
    name: 'Test Product',
    price: 99.99,
    image: 'test.jpg'
  }

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />)
    
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('$99.99')).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute('src', 'test.jpg')
  })

  it('calls onAddToCart when button is clicked', () => {
    const onAddToCart = jest.fn()
    render(<ProductCard product={mockProduct} onAddToCart={onAddToCart} />)
    
    fireEvent.click(screen.getByText('Add to Cart'))
    expect(onAddToCart).toHaveBeenCalledWith('1')
  })
})
```

This component library structure ensures consistency, reusability, and maintainability across all Ogni features while providing the flexibility needed for feature-specific requirements.