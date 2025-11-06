# Ogni Design System: Shadcn/UI + Custom Components Guidelines

## 🎯 Overview

This document establishes the design system guidelines for the Ogni e-commerce platform, combining shadcn/ui components with custom Ogni-specific components. The guidelines ensure consistência, maintainability, and a premium brand expression aligned with Ogni’s semi-jóias positioning.

## 🎨 Brand Identity Integration

### Color Palette
The design system now anchors on Ogni's jewelry palette taken from the physical packaging reference (olive carriers, metallic studs, warm ivory logotype, fabric background). These values drive both the shadcn/ui tokens and any custom Tailwind utilities.

#### Brand Core Palette
| Element               | Name          | Hex      | HSL                | CSS variable           | Primary usage                                     |
|-----------------------|---------------|----------|--------------------|------------------------|---------------------------------------------------|
| Fundo (cartela)       | Ogni Olive    | `#4A4E3E` | `hsl(75, 11%, 27%)` | `--ogni-brand-olive`   | Primary surfaces (cards, badges, emphasis blocks) |
| Logo (tipografia)     | Ogni Ivory    | `#E8E3D9` | `hsl(40, 25%, 88%)` | `--ogni-brand-ivory`   | Logotype, primary text over olive backgrounds     |
| Brinco                | Ogni Gold     | `#D4AF37` | `hsl(46, 65%, 52%)` | `--ogni-brand-gold`    | Highlights, CTAs, icon accents                    |
| Fundo (tecido)        | Ogni Frost    | `#F4F1EB` | `hsl(40, 29%, 94%)` | `--ogni-brand-frost`   | Page background, neutral sections, modals         |

#### Implementation Notes
- Declare the palette as HSL triplets in `:root` so tokens can be consumed via `hsl(var(--ogni-brand-olive))` without conversion at runtime.
- Provide paired variables for light/dark if needed (e.g., `--ogni-brand-olive-foreground: var(--ogni-brand-ivory)`).
- Keep the existing semantic accent tokens (`--ogni-accent-success`, `--ogni-accent-warning`, etc.) and map them to derivatives of the core palette when appropriate.

```css
:root {
  --ogni-brand-olive: 75 11% 27%;  /* #4A4E3E */
  --ogni-brand-ivory: 40 25% 88%;  /* #E8E3D9 */
  --ogni-brand-gold: 46 65% 52%;   /* #D4AF37 */
  --ogni-brand-frost: 40 29% 94%;  /* #F4F1EB */
  --ogni-brand-olive-foreground: var(--ogni-brand-ivory);
  --ogni-brand-frost-foreground: 240 5% 15%; /* keep text readable on light fabric background */
}
```

#### Usage Guidance
- Leverage `Ogni Olive` as the primary brand color for hero sections, product cards, and other premium surfaces; it should pair with `Ogni Ivory` for highest contrast typography.
- Use `Ogni Frost` as the default application background in light mode and as a base layer for forms or content groupings.
- Apply `Ogni Gold` sparingly to drive focus (CTA buttons, price highlights, accent icons); outline-only versions remain acceptable for subtle interactions.
- Reserve `Ogni Ivory` for logotypes, secondary backgrounds inside olive blocks, and supporting text on darker elements.
- Validate contrast (WCAG AA+) for each combination, especially `Ogni Gold` on `Ogni Olive`; when contrast is insufficient, fall back to `Ogni Ivory`.

### Supporting Neutrals
- **Soft Charcoal**: `hsl(120, 4%, 20%)` – subtle text accent over light surfaces; variable suggestion `--ogni-neutral-charcoal`.
- **Misty Taupe**: `hsl(35, 18%, 75%)` – separators, outlines, muted text on dark sections; variable suggestion `--ogni-neutral-taupe`.
- **Deep Moss**: `hsl(70, 14%, 18%)` – dark mode surface for hero/footer; variable suggestion `--ogni-neutral-moss`.

### Typography System
- **Headings**: `Playfair Display` (500–700) para reforçar sofisticação; fallback `Georgia, serif`.
- **Body**: `Inter` (300–600) mantém legibilidade em e-commerce; fallback `system-ui`.
- **UI Details**: `Inter` uppercase/letter-spacing 0.22em para labels e badges finas.
- **Line Heights**: Títulos 1.15 (tight luxury), corpo 1.6, legendas 1.4.
- **Pairings**:
  - H1/H2 serif + copy em Inter leve define contraste clássico.
  - Botões usam Inter semi-bold com tracking reduzido para impacto premium.
- **Implementation**: importar via CSS (`@import` Google Fonts) e expor tokens `--font-sans`, `--font-serif` para Tailwind/shadcn.

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

### Imagery & Art Direction
- Fotografia macro com foco no brilho do banho dourado; fundo em tecido leve (`Ogni Frost`) ou cenas lifestyle minimalistas.
- Utilizar recortes 4:5 em cards e 16:9/3:2 em banners para consistência visual.
- Overlays de texto sempre com gradiente suave (`Ogni Olive` → transparente) para garantir contraste.
- Aplicar vinhetas leves (shadow interna) em hero para destacar produto.

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
- Padrão homepage: hero full-bleed (col-start 1 / col-span 12) seguido de módulos 3-4 cards com `gap-10` em desktop e `gap-6` mobile.
- Conteúdo editorial (histórias de coleção) usa grid assimétrico: 2 colunas com imagens altas + CTA lateral, inspirado em vitrines físicas.

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
- [ ] Novos tokens de estilo referenciados em `index.css` e `tailwind.config.ts`
- [ ] Componentes demonstram estados hover/focus consistentes (especialmente CTAs dourados)

## 🪞 Semi-Jóias Experience Playbook

### Homepage Flow
- **Hero Editorial**: Fotografia 4k com produto em destaque, headline serifada e CTA “Ver Coleção”. Utilizar `Ogni Olive` como fundo ou overlay translúcido.
- **Faixa de Benefícios**: Marquee discreto listando garantia, banho antialérgico, frete; texto em Inter uppercase, `Ogni Gold`.
- **Coleções Curadas**: Módulo 3-up com imagens altas (dois cards) + bloco editorial apresentando inspiração (cores, ocasião).
- **Prova Social**: Widget Trustvox/avalições logo após primeiro carrossel de produtos.
- **Newsletter Luxo**: Fundo `Ogni Olive`, título serif, copy curta e botão outline dourado.

### Produto & Merchandising
- Cards exibem: foto principal + hover alternativo, label “Banho em Ouro 18k”, preço parcelado, selo “Hipoalergênico”.
- Badges (`Badge` component) usam `Ogni Gold` outline + texto `Ogni Olive` para versões claras; invertidos quando sobre fundo escuro.
- Variações de tamanho/diâmetro acessíveis via `ToggleGroup` horizontal; estados focus visíveis.
- “Comprar em Conjunto” apresenta combinações curadas, preço total, economia e CTA `ghost` com ícone minimalista.

### Microinterações
- Hover em CTA sólido: elevação + mudança para tom metálico (#dcb84a) com `transition-colors 200ms`.
- `ProductCard` aplica `hover:-translate-y-1` + sombra suave (0 20px 48px -20px rgba(74,78,62,0.45)).
- Animar marquee com `animate-[marquee_15s_linear_infinite]` e texto com tracking 0.3em.

### Copywriting Notas
- Foco em exclusividade, artesania e facilidade (“Peças banhadas a ouro 18k, produzidas no Brasil”).
- Evitar jargões técnicos; preferir frases curtas, em português, que reforcem benefícios (garantia, antialérgico, entrega expressa).

### A11y & Inclusão
- Contraste mínimo AA garantido: `Ogni Gold` sobre `Ogni Olive` para ícones, mas usar `Ogni Ivory` para texto.
- Tamanhos de fonte: 16px base, CTAs 18px, labels 12px uppercase.
- Estados focus: outline 2px em `Ogni Gold` sobre superfícies escuras e `Ogni Olive` sobre claras.

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
