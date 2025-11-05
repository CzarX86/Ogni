# Usage Criteria: Shadcn/UI vs Custom Components

## 🎯 Overview

This document establishes clear criteria for deciding when to use shadcn/ui components versus creating custom components in the Ogni e-commerce platform. The criteria ensure consistency, maintainability, and optimal development efficiency while preserving brand identity.

## 📋 Decision Framework

### Primary Decision Factors
When choosing between shadcn/ui and custom components, consider these factors in order of priority:

1. **Functionality Requirements** - Does the component meet the functional needs?
2. **Brand Consistency** - Can the component be styled to match brand identity?
3. **Accessibility Standards** - Does it meet accessibility requirements?
4. **Performance Impact** - What is the performance overhead?
5. **Development Efficiency** - Which option is faster to implement?
6. **Maintenance Overhead** - Which option is easier to maintain?

## 🚦 When to Use Shadcn/UI Components

### ✅ Standard UI Patterns
Use shadcn/ui for common UI elements that don't require heavy customization:

#### Basic Elements
- `Button` - For all standard button interactions
- `Input` - For text inputs, email, password fields
- `Textarea` - For multi-line text inputs
- `Label` - For form labels
- `Separator` - For visual dividers

#### Complex Components
- `Dialog` - For modal interactions
- `DropdownMenu` - For dropdown menus
- `Select` - For selection interfaces
- `Card` - For content containers
- `Table` - For data display

#### Navigation
- `Tabs` - For tabbed interfaces
- `Pagination` - For pagination controls
- `Breadcrumb` - For navigation breadcrumbs

### ✅ Rapid Prototyping
- During early feature development
- For proof-of-concept implementations
- When speed is prioritized over customization
- For internal/admin interfaces

### ✅ Standard Forms
- Login/registration forms
- Contact forms
- Settings interfaces
- Data entry forms

### ✅ Accessibility-Critical Components
- Components requiring complex keyboard navigation
- Screen reader compatibility
- ARIA attributes management
- Focus management

## 🚫 When NOT to Use Shadcn/UI Components

### ❌ Highly Branded UI Elements
Avoid shadcn/ui when heavy customization is needed:

#### Brand-Specific Components
- Logo and brand identity elements
- Custom animation requirements
- Unique interaction patterns
- Brand-specific visual treatments

#### Marketing Components
- Hero sections
- Landing page elements
- Promotional banners
- Special campaign interfaces

### ❌ Complex Business Logic
- Components with complex domain-specific logic
- Multi-step processes with custom flows
- Components requiring extensive state management
- Real-time data visualization

### ❌ Performance-Critical Components
- High-frequency rendering components
- Animation-heavy interfaces
- Components in critical rendering paths
- Mobile-optimized interfaces

## 🎨 Hybrid Approach Guidelines

### ✅ Extending Shadcn/UI Components
Use this approach when you need brand customization:

```tsx
// Good: Extending shadcn/ui with brand styles
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface OgniButtonProps extends React.ComponentProps<typeof Button> {
  variant?: 'primary' | 'secondary' | 'social' | 'add-to-cart'
}

const OgniButton = ({ variant = 'primary', className, ...props }: OgniButtonProps) => {
  const variantClasses = {
    primary: "bg-[hsl(var(--ogni-primary-500))] hover:bg-[hsl(var(--ogni-primary-60))]",
    secondary: "bg-[hsl(var(--ogni-secondary-500))] hover:bg-[hsl(var(--ogni-secondary-600))]",
    social: "bg-blue-500 hover:bg-blue-600",
    'add-to-cart': "bg-green-500 hover:bg-green-600"
  }

  return (
    <Button
      className={cn(
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
}
```

### ✅ Composing Multiple Components
Combine shadcn/ui components for complex UI:

```tsx
// Good: Composing shadcn/ui components
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <img src={product.image} className="w-full h-48 object-cover rounded" />
        <h3 className="font-semibold mt-2">{product.name}</h3>
        <p className="text-primary font-medium">{product.price}</p>
      </CardContent>
      <Separator />
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

## 🏷️ Component Classification Matrix

### A. Core UI Components (Use Shadcn/UI)
| Component | Use Shadcn/UI | Notes |
|-----------|---------------|-------|
| Button | ✅ | Extend with brand variants |
| Input | ✅ | Standard form inputs |
| Card | ✅ | Content containers |
| Dialog | ✅ | Modal interfaces |
| Table | ✅ | Data display |

### B. Brand-Specific Components (Custom)
| Component | Use Custom | Notes |
|-----------|------------|-------|
| Product Card | ✅ | Requires brand styling |
| Checkout Flow | ✅ | Complex business logic |
| Social Feed Item | ✅ | Custom interactions |
| Brand Header | ✅ | Heavy customization needed |
| Custom Animation | ✅ | Beyond shadcn/ui scope |

### C. Hybrid Components (Extend Shadcn/UI)
| Component | Hybrid Approach | Notes |
|-----------|----------------|-------|
| Navigation | ✅ | Extend with custom styles |
| Form Elements | ✅ | Add brand validation styles |
| Data Display | ✅ | Combine multiple components |
| Dashboard Widgets | ✅ | Compose with shadcn/ui |

## 📊 Decision Tree

### For Each Component, Ask:

**Q1: Is this a standard UI pattern?**
- Yes → Use shadcn/ui
- No → Go to Q2

**Q2: Does it require significant brand customization?**
- Yes → Create custom component
- No → Use shadcn/ui

**Q3: Does it have complex business logic?**
- Yes → Evaluate if shadcn/ui primitives can be used
- No → Use shadcn/ui

**Q4: Is accessibility critical?**
- Yes → Use shadcn/ui (has built-in accessibility)
- No → Consider both options

## 🎯 Feature-Specific Guidelines

### Core E-commerce (001)
- **Use Shadcn/UI**: Basic forms, buttons, cards, tables
- **Custom**: Product display, checkout flow, cart interface
- **Hybrid**: Product filters, category navigation

### Social Commerce (02)
- **Use Shadcn/UI**: Comments, likes, basic interactions
- **Custom**: Feed algorithm, social interactions
- **Hybrid**: Post creation, user profiles

### AI Automation (003)
- **Use Shadcn/UI**: Dashboard containers, settings
- **Custom**: AI interfaces, recommendation displays
- **Hybrid**: Analytics charts, automation controls

### Marketing Tools (04)
- **Use Shadcn/UI**: Campaign forms, analytics
- **Custom**: Coupon systems, promotion interfaces
- **Hybrid**: Marketing dashboards, reporting

## 🔧 Implementation Guidelines

### Styling Approach
```tsx
// Preferred: Using cn utility for class merging
import { cn } from "@/lib/utils"

// Good: Extending shadcn/ui with custom styles
const CustomComponent = ({ className, ...props }) => (
  <Button 
    className={cn(
      "bg-brand-primary hover:bg-brand-primary-dark",
      className
    )}
    {...props}
  />
)

// Avoid: Direct style overrides
const BadComponent = () => (
  <Button 
    style={{ backgroundColor: '#custom-color' }}
  />
)
```

### Prop Interface Consistency
```tsx
// Maintain consistency with shadcn/ui patterns
interface CustomComponentProps extends React.ComponentProps<'button'> {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}
```

## 🧪 Quality Checks

### Before Using Shadcn/UI
- [ ] Does it meet accessibility standards?
- [ ] Can it be styled to match brand guidelines?
- [ ] Does it support required functionality?
- [ ] Is it performant for the use case?

### Before Creating Custom
- [ ] Can shadcn/ui components be extended instead?
- [ ] Is the customization significant enough to justify custom?
- [ ] Will it be reused across features?
- [ ] Does it follow accessibility best practices?

### Before Hybrid Approach
- [ ] Are shadcn/ui components used as base?
- [ ] Is the extension approach maintainable?
- [ ] Does it maintain consistent API?
- [ ] Are performance impacts acceptable?

## 📈 Evaluation Metrics

### Success Indicators
- **Development Speed**: Faster implementation with shadcn/ui
- **Code Quality**: Consistent, maintainable codebase
- **Accessibility**: Meeting WCAG standards
- **Performance**: No negative impact on metrics
- **Brand Consistency**: Maintaining visual identity

### Monitoring Requirements
- Track component usage patterns
- Monitor bundle size impact
- Measure accessibility compliance
- Evaluate developer satisfaction
- Assess maintainability metrics

## 🔄 Review Process

### Component Review Checklist
- [ ] Follows usage criteria guidelines
- [ ] Maintains brand consistency
- [ ] Meets accessibility requirements
- [ ] Optimizes development efficiency
- [ ] Ensures maintainability

### Regular Review Schedule
- Monthly: Usage pattern analysis
- Quarterly: Criteria effectiveness review
- Bi-annually: Update guidelines based on learnings

These criteria provide a clear framework for making consistent decisions about component usage across all Ogni features while maintaining the balance between efficiency and customization.