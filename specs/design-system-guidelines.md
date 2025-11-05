# Ogni Design System: Shadcn/UI + Custom Components Guidelines

## 🎯 Overview

This document establishes the design system guidelines for the Ogni e-commerce platform, combining shadcn/ui components with custom Ogni-specific components. The guidelines ensure consistency, maintainability, and brand alignment across all features.

## 🎨 Brand Identity Integration

### Color Palette
The design system integrates Ogni's brand colors with shadcn/ui's theme system:

#### Primary Colors
- **Brand Primary**: `hsl(var(--ogni-primary-500))` - Core brand color
- **Brand Secondary**: `hsl(var(--ogni-secondary-500))` - Supporting brand color
- **Success**: `hsl(var(--ogni-accent-success))` - 120° hue for positive actions
- **Warning**: `hsl(var(--ogni-accent-warning))` - 45° hue for warnings
- **Error**: `hsl(var(--ogni-accent-error))` - 0° hue for errors
- **Info**: `hsl(var(--ogni-accent-info))` - 200° hue for information

#### Neutral Colors
- **Background**: `hsl(var(--background))` - Page backgrounds
- **Foreground**: `hsl(var(--foreground))` - Text and icons
- **Card**: `hsl(var(--card))` - Card backgrounds
- **Border**: `hsl(var(--border))` - Border colors
- **Muted**: `hsl(var(--muted))` - Secondary content

### Typography System
- **Primary Font**: System font stack (as defined in existing CSS)
- **Headings**: Use shadcn/ui's typography components with custom sizing
- **Body**: Standard system font with appropriate line heights
- **Monospace**: For code and technical content

## 🧩 Component Architecture

### Component Hierarchy
```
shadcn/ui Base Components
├── Button
├── Card
├── Input
├── Dialog
└── etc.

Ogni Custom Components
├── ProductCard (extends Card)
├── CartSummary (uses multiple shadcn/ui components)
├── CheckoutFlow (composed of shadcn/ui components)
└── SocialFeed (custom component using shadcn/ui primitives)

Feature-Specific Components
├── Core E-commerce Components
├── Social Commerce Components
├── AI Automation Components
└── etc.
```

### Component Composition Patterns

#### 1. Extension Pattern
Extend shadcn/ui components with Ogni-specific functionality:

```tsx
// Example: Custom Product Card extending shadcn/ui Card
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ProductCardProps {
  product: Product
  onAddToCart: (productId: string) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
        <h3 className="font-semibold text-lg mt-2">{product.name}</h3>
        <p className="text-primary font-medium">{product.price}</p>
      </CardContent>
      <CardFooter className="p-4">
        <Button 
          onClick={() => onAddToCart(product.id)}
          className="w-full"
        >
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
}
```

#### 2. Composition Pattern
Combine multiple shadcn/ui components for complex UI:

```tsx
// Example: Checkout Flow using multiple shadcn/ui components
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export function CheckoutForm() {
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" />
        </div>
        <Separator />
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" />
        </div>
        <Button className="w-full">Complete Order</Button>
      </CardContent>
    </Card>
  )
}
```

## 🎯 Usage Guidelines

### When to Use Shadcn/UI Components

#### Use Shadcn/UI When:
- **Standard UI Patterns**: Buttons, inputs, cards, dialogs, tables
- **Accessibility Requirements**: Components with built-in accessibility
- **Rapid Development**: Standard components that meet requirements
- **Consistency**: When standard patterns are sufficient
- **Maintenance**: Components with good community support

#### Examples:
- `Button` for all primary/secondary actions
- `Card` for content containers
- `Input`/`Textarea` for form fields
- `Dialog` for modal interactions
- `Table` for data display

### When to Create Custom Components

#### Create Custom Components When:
- **Brand Requirements**: Custom styling beyond shadcn/ui capabilities
- **Complex Interactions**: Multiple standard components combined
- **Feature-Specific Logic**: Business logic tied to UI
- **Reusability**: Component used across multiple features
- **Custom Behavior**: Unique functionality not covered by shadcn/ui

#### Examples:
- `ProductCard` - Combines Card, image handling, and product logic
- `SocialFeedItem` - Complex social interaction components
- `AIRecommendationCard` - AI-specific display components
- `CheckoutFlow` - Multi-step process components

## 🎨 Styling Guidelines

### CSS Classes and Customization

#### Base Styling
- Use shadcn/ui's built-in class combinations
- Extend with custom classes when needed
- Maintain consistency with Tailwind utility classes

#### Custom Styling
```tsx
// Good: Using cn utility for class merging
import { cn } from "@/lib/utils"

function CustomButton({ className, ...props }: ButtonProps) {
  return (
    <button 
      className={cn(
        "bg-primary text-primary-foreground",
        "hover:bg-primary/90",
        "rounded-md px-4 py-2",
        className // Allows custom overrides
      )}
      {...props}
    />
  )
}
```

#### Theme Variables
- Use CSS variables for theming (as defined in setup)
- Maintain consistent variable naming
- Document custom variables in theme files

### Responsive Design
- Use shadcn/ui's responsive utilities
- Apply Tailwind's responsive prefixes where needed
- Test components at all breakpoints
- Consider mobile-first approach

## 🧪 Component Standards

### Props Interface Guidelines
```tsx
// Standard pattern for component interfaces
interface ComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  // Required props
  requiredProp: string
 // Optional props with defaults
  optionalProp?: boolean
  // Callbacks
  onAction?: () => void
  // Children
  children?: React.ReactNode
}
```

### Accessibility Standards
- All components must follow WCAG 2.1 AA guidelines
- Use semantic HTML elements
- Include proper ARIA attributes
- Ensure keyboard navigation support
- Test with screen readers

### Performance Considerations
- Minimize re-renders with React.memo where appropriate
- Use proper keys for lists
- Optimize images and assets
- Consider lazy loading for non-critical components

## 📐 Layout System

### Grid and Spacing
- Use Tailwind's spacing scale consistently
- Apply shadcn/ui's container patterns
- Maintain consistent gutters and margins
- Use responsive grid systems

### Container Patterns
```tsx
// Standard container for content
<div className="container mx-auto px-4 py-8 max-w-6xl">
  {/* Content */}
</div>

// Card-based layouts
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards */}
</div>
```

## 🎯 Feature-Specific Guidelines

### Core E-commerce (001)
- Product display components
- Shopping cart functionality
- Checkout flows
- Payment interfaces

### Social Commerce (002)
- Feed components
- Social interaction elements
- User profile displays
- Content sharing features

### AI Automation (003)
- Dashboard components
- Data visualization
- AI interaction interfaces
- Automation controls

### Marketing Tools (004)
- Campaign management UI
- Analytics dashboards
- Coupon systems
- Promotion interfaces

## 🔧 Component Documentation Standards

### Component File Structure
```
src/components/
├── ui/                 # Shadcn/UI components
├── shared/             # Cross-feature custom components
│   ├── product/
│   │   ├── product-card.tsx
│   │   ├── product-grid.tsx
│   │   └── product.types.ts
│   ├── cart/
│   │   ├── cart-summary.tsx
│   │   └── cart.types.ts
│   └── common/
│       ├── layout/
│       └── navigation/
├── features/
│   ├── core-ecommerce/
│   ├── social-commerce/
│   └── etc.
```

### Documentation Requirements
Each component should include:
- JSDoc comments for props
- Example usage in comments
- Accessibility notes
- Performance considerations
- Related components

## 🧪 Quality Assurance

### Testing Guidelines
- Unit tests for all custom components
- Integration tests for complex compositions
- Accessibility testing
- Cross-browser compatibility
- Responsive design testing

### Code Review Checklist
- [ ] Follows design system guidelines
- [ ] Uses appropriate shadcn/ui components
- [ ] Maintains accessibility standards
- [ ] Includes proper TypeScript types
- [ ] Follows naming conventions
- [ ] Includes necessary documentation

## 🔄 Maintenance and Evolution

### Version Control
- Component breaking changes require major version updates
- Document migration paths for breaking changes
- Maintain backward compatibility when possible
- Use feature flags for experimental components

### Component Lifecycle
- Regular review of component usage
- Deprecation process for outdated components
- Performance monitoring
- User feedback integration

## 📚 Reference Components

### Essential Shadcn/UI Components
- `Button` - All interactive elements
- `Card` - Content containers
- `Input` - Form inputs
- `Label` - Form labels
- `Dialog` - Modal interactions
- `Separator` - Visual dividers
- `Skeleton` - Loading states
- `Badge` - Status indicators

### Essential Custom Components
- `ProductCard` - Product display
- `CartSummary` - Cart functionality
- `CheckoutFlow` - Purchase process
- `SocialFeedItem` - Social content
- `DashboardCard` - Analytics displays

## 🚨 Common Pitfalls to Avoid

### Styling Issues
- Avoid inline styles (use Tailwind classes)
- Don't override shadcn/ui base styles globally
- Don't create duplicate components
- Don't hardcode values instead of using theme variables

### Performance Issues
- Don't over-nest components
- Don't forget React.memo for expensive components
- Don't use unnecessary state in simple components
- Don't ignore bundle size considerations

### Accessibility Issues
- Don't forget ARIA labels
- Don't remove focus indicators
- Don't ignore keyboard navigation
- Don't use color as the only indicator

This design system ensures consistent, accessible, and maintainable UI components across all Ogni features while leveraging the power of shadcn/ui and maintaining brand identity.