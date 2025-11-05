# Theming and Customization: Ogni Brand Identity with Shadcn/UI

## 🎯 Overview

This document outlines the approach for implementing Ogni's brand identity through shadcn/ui components while maintaining the flexibility and accessibility features of the component library. The approach balances brand consistency with component functionality.

## 🎨 Brand Identity Elements

### Primary Brand Colors
The Ogni brand uses a carefully selected color palette that must be preserved across all UI components:

#### Core Brand Colors
```css
/* Primary Brand Colors */
--ogni-primary-50: 240 10% 98%;   /* Lightest primary */
--ogni-primary-100: 230 100% 95%;
--ogni-primary-200: 220 100% 90%;
--ogni-primary-300: 210 100% 80%;
--ogni-primary-400: 200 100% 65%;
--ogni-primary-500: 195 100% 50%;  /* Primary brand color - blue/green */
--ogni-primary-600: 190 100% 40%;  /* Darker primary */
--ogni-primary-700: 185 100% 30%;
--ogni-primary-800: 180 100% 20%;
--ogni-primary-900: 175 100% 10%;  /* Darkest primary */

/* Secondary Brand Colors */
--ogni-secondary-50: 60 100% 98%;  /* Light yellow */
--ogni-secondary-100: 60 100% 95%;
--ogni-secondary-200: 60 100% 90%;
--ogni-secondary-300: 60 100% 80%;
--ogni-secondary-400: 60 100% 65%;
--ogni-secondary-500: 60 100% 50%; /* Secondary brand color - warm yellow */
--ogni-secondary-600: 60 100% 40%;
--ogni-secondary-700: 60 100% 30%;
--ogni-secondary-800: 60 100% 20%;
--ogni-secondary-900: 60 100% 10%;

/* Accent Colors */
--ogni-accent-success: 120 100% 50%;  /* Green for success states */
--ogni-accent-warning: 45 100% 50%;   /* Orange for warnings */
--ogni-accent-error: 0 100% 50%;      /* Red for errors */
--ogni-accent-info: 200 100% 50%;     /* Blue for information */
```

### Typography System
- **Primary Font**: System font stack (as used in current Ogni implementation)
- **Heading Scale**: Responsive typography hierarchy
- **Body Text**: Readable, accessible font sizes
- **Monospace**: For code and technical content

### Spacing and Layout
- **Base Unit**: 4px grid system
- **Spacing Scale**: 0, 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px
- **Border Radius**: Consistent rounded corners (2px, 4px, 6px, 8px)
- **Shadows**: Subtle elevation effects for depth

## 🎨 Shadcn/UI Theme Integration

### CSS Variable Mapping
Map Ogni brand colors to shadcn/ui theme variables:

```css
:root {
  /* Primary Colors */
  --primary: var(--ogni-primary-500);
  --primary-foreground: var(--ogni-primary-50);
  
  /* Secondary Colors */
  --secondary: var(--ogni-secondary-500);
  --secondary-foreground: var(--ogni-secondary-50);
  
  /* Other Semantic Colors */
  --accent: var(--ogni-secondary-200);
  --accent-foreground: var(--ogni-secondary-800);
  --destructive: var(--ogni-accent-error);
  --destructive-foreground: var(--ogni-primary-50);
  
  /* Background and Foreground */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  
  /* Border and Input */
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: var(--ogni-primary-500);
  
  /* Card and Popover */
  --card: 0 0% 100%;
  --card-foreground: var(--foreground);
  --popover: 0 0% 100%;
  --popover-foreground: var(--foreground);
  
  /* Muted Colors */
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
}
```

### Dark Mode Considerations
```css
.dark {
  /* Primary Colors */
  --primary: var(--ogni-primary-400);
  --primary-foreground: var(--ogni-primary-900);
  
  /* Secondary Colors */
  --secondary: var(--ogni-secondary-400);
  --secondary-foreground: var(--ogni-secondary-900);
  
  /* Background and Foreground */
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  
  /* Other colors adjusted for dark mode */
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: var(--ogni-primary-400);
}
```

## 🧩 Component Customization Strategy

### 1. Base Component Extension
Extend shadcn/ui components with brand-specific variants:

```tsx
// Enhanced Button with Ogni variants
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface OgniButtonProps extends React.ComponentProps<typeof Button> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline' | 'social' | 'add-to-cart'
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const OgniButton = ({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  ...props 
}: OgniButtonProps) => {
  const variantClasses = {
    primary: "bg-[hsl(var(--ogni-primary-500))] hover:bg-[hsl(var(--ogni-primary-60))] text-primary-foreground",
    secondary: "bg-[hsl(var(--ogni-secondary-500))] hover:bg-[hsl(var(--ogni-secondary-600))] text-secondary-foreground",
    accent: "bg-[hsl(var(--ogni-accent-info))] hover:bg-[hsl(var(--ogni-accent-info))] text-white",
    social: "bg-blue-500 hover:bg-blue-600 text-white",
    'add-to-cart': "bg-green-500 hover:bg-green-600 text-white",
    ghost: "hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--muted-foreground))]",
    outline: "border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] text-foreground"
  }

  const sizeClasses = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 py-2",
    lg: "h-11 px-8 text-lg",
    xl: "h-12 px-10 text-xl"
  }

  return (
    <Button
      className={cn(
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
}
```

### 2. Brand-Specific Components
Create custom components that combine multiple shadcn/ui elements:

```tsx
// Product Card with Ogni branding
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ProductCardProps {
  product: Product
  onAddToCart: (productId: string) => void
  showQuickView?: boolean
}

const ProductCard = ({ product, onAddToCart, showQuickView = true }: ProductCardProps) => {
  return (
    <Card className={cn(
      "hover:shadow-lg transition-shadow duration-300",
      "group overflow-hidden border-[hsl(var(--border))]"
    )}>
      <div className="relative">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.onSale && (
          <Badge className="absolute top-2 left-2 bg-[hsl(var(--ogni-accent-warning))] text-white">
            Sale
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1 text-[hsl(var(--foreground))]">{product.name}</h3>
        <div className="flex items-center justify-between">
          <span className="text-[hsl(var(--ogni-primary-500))] font-medium">
            {product.price}
          </span>
          {product.compareAtPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {product.compareAtPrice}
            </span>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4">
        <div className="flex space-x-2 w-full">
          {showQuickView && (
            <Button variant="outline" className="flex-1 border-[hsl(var(--border))]">
              Quick View
            </Button>
          )}
          <Button 
            className="flex-1 bg-[hsl(var(--ogni-primary-500))] hover:bg-[hsl(var(--ogni-primary-60))] text-white"
            onClick={() => onAddToCart(product.id)}
          >
            Add to Cart
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
```

## 🎨 Visual Customization Guidelines

### 1. Brand Consistency Rules
- **Colors**: Always use CSS variables mapped to brand colors
- **Typography**: Maintain consistent font hierarchy
- **Spacing**: Use Tailwind's spacing scale consistently
- **Borders**: Apply consistent border radius and width

### 2. Component-Specific Customizations

#### Buttons
- Primary: Use `--ogni-primary-500` as background
- Secondary: Use `--ogni-secondary-500` as background
- Hover states: Darken by 10% for primary, lighten by 10% for secondary
- Disabled: Use muted color scheme

#### Cards
- Border: `--border` variable for consistent borders
- Hover: Subtle shadow with `--primary` as accent
- Background: `--card` variable for consistency

#### Forms
- Input borders: `--input` variable
- Focus states: `--ring` variable for focus rings
- Error states: `--destructive` variable

#### Navigation
- Active states: `--primary` variable
- Hover states: `--accent` variable
- Background: `--background` variable

## 🧪 Accessibility and Performance

### Accessibility Standards
- Maintain WCAG 2.1 AA compliance
- Ensure sufficient color contrast ratios
- Preserve keyboard navigation
- Maintain ARIA attributes
- Support screen readers

### Performance Considerations
- Minimize CSS variable overrides
- Use efficient class merging with `cn` utility
- Optimize image loading in custom components
- Implement proper loading states

## 🎯 Feature-Specific Theming

### Core E-commerce (001)
- **Focus**: Conversion-optimized color schemes
- **Primary**: Use `--ogni-primary-500` for CTAs
- **Success**: `--ogni-accent-success` for purchase confirmations

### Social Commerce (02)
- **Focus**: Engagement-focused interactions
- **Social colors**: Blue for social actions
- **Like indicators**: Red for likes, blue for comments

### AI Automation (003)
- **Focus**: Data visualization and insights
- **Analytics colors**: Professional color scheme
- **Status indicators**: Clear success/error states

### Marketing Tools (004)
- **Focus**: Campaign management interfaces
- **Promotion colors**: Bright, attention-grabbing colors
- **Status tracking**: Clear progress indicators

## 🔧 Implementation Approach

### 1. Theme Configuration File
Create a centralized theme configuration:

```tsx
// web/src/styles/theme.ts
export const brandColors = {
  primary: {
    50: 'hsl(var(--ogni-primary-50))',
    100: 'hsl(var(--ogni-primary-100))',
    200: 'hsl(var(--ogni-primary-200))',
    300: 'hsl(var(--ogni-primary-300))',
    400: 'hsl(var(--ogni-primary-40))',
    500: 'hsl(var(--ogni-primary-500))',
    600: 'hsl(var(--ogni-primary-600))',
    700: 'hsl(var(--ogni-primary-700))',
    800: 'hsl(var(--ogni-primary-800))',
    90: 'hsl(var(--ogni-primary-90))',
  },
  secondary: {
    // ... similar structure
  }
}

export const themeVariables = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  accent: 'hsl(var(--accent))',
  destructive: 'hsl(var(--destructive))',
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
}
```

### 2. Theme Provider Component
Implement a theme provider for consistent theming:

```tsx
// web/src/components/providers/ThemeProvider.tsx
import { createContext, useContext, useEffect } from 'react'

interface ThemeContextType {
  theme: string
  setTheme: (theme: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ 
  children, 
  defaultTheme = "system",
  storageKey = "ogni-theme"
}: {
  children: React.ReactNode
  defaultTheme?: string
 storageKey?: string
}) {
  const [theme, setTheme] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(storageKey) || defaultTheme
    }
    return defaultTheme
 })

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: string) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    }
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
```

## 🧪 Quality Assurance

### Testing Requirements
- **Visual Regression**: Compare components before/after theming
- **Accessibility**: Verify color contrast and keyboard navigation
- **Cross-browser**: Test in all supported browsers
- **Responsive**: Verify on all device sizes
- **Performance**: Monitor bundle size impact

### Brand Compliance Checklist
- [ ] All primary buttons use `--ogni-primary-500`
- [ ] Secondary buttons use `--ogni-secondary-500`
- [ ] Error states use `--ogni-accent-error`
- [ ] Success states use `--ogni-accent-success`
- [ ] All components maintain accessibility standards
- [ ] Dark mode works correctly
- [ ] Hover/focus states are consistent

## 🔄 Maintenance and Evolution

### Theme Updates
- Centralized color variable management
- Version-controlled theme changes
- Gradual rollout for major theme updates
- Backward compatibility for existing components

### Component Evolution
- Regular accessibility audits
- Performance monitoring
- User feedback integration
- Brand evolution considerations

This theming and customization approach ensures that Ogni's brand identity is consistently applied across all shadcn/ui components while maintaining the component library's functionality and accessibility features.