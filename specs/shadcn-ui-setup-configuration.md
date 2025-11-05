# Shadcn/UI Setup and Configuration for Ogni React Project

## 🎯 Overview

This document provides detailed instructions for setting up shadcn/ui in the Ogni React project, including installation, configuration, and initial setup processes. The setup will be compatible with the existing React/TypeScript/CRACO configuration.

## 📋 Prerequisites

Before installing shadcn/ui, ensure the following prerequisites are met:

### Required Dependencies
- Node.js 16+ 
- npm, yarn, or pnpm package manager
- TypeScript 4.5+ (already installed in Ogni project)
- Tailwind CSS (will be installed if not present)

### Current Project Dependencies Analysis
Based on the existing `web/package.json`, the project currently uses:
- React 18+
- TypeScript 4.9.4
- CRACO for configuration (not Create React App default)

## 🚀 Installation Process

### Step 1: Install Required Dependencies

First, install Tailwind CSS and its dependencies if not already present:

```bash
cd web
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 2: Configure Tailwind CSS

Update `web/tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### Step 3: Update CSS Files

Update `web/src/index.css` to include shadcn/ui styles:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    --card: 0 0% 10%;
    --card-foreground: 222.2 84% 4.9%;

    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;

    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;

    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;

    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;

    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;

    --radius: 0.5rem;
  }

  .dark {
    --background: 22.2 84% 4.9%;
    --foreground: 210 40% 98%;

    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;

    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;

    --primary: 210 40% 98%;
    --primary-foreground: 22.2 47.4% 11.2%;

    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;

    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;

    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;

    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### Step 4: Install Shadcn/UI CLI

```bash
npm install -g @shadcn/ui
# or
npx @shadcn/ui@latest init
```

### Step 5: Initialize Shadcn/UI

Run the initialization command in the web directory:

```bash
cd web
npx @shadcn/ui@latest init
```

### Step 6: Configure Shadcn/UI

During initialization, configure as follows:
- Style: Default (or choose based on brand preferences)
- Tailwind CSS: Yes
- TypeScript: Yes
- Base CSS: Yes
- CSS Variables: Yes
- Strict Mode: Yes (if preferred)

### Step 7: Install Initial Components

Install commonly used components for the e-commerce platform:

```bash
cd web
npx @shadcn/ui@latest add button card input label textarea select checkbox radio-group dropdown-menu
npx @shadcn/ui@latest add dialog alert alert-dialog tooltip popover
npx @shadcn/ui@latest add table pagination data-table
npx @shadcn/ui@latest add avatar badge
npx @shadcn/ui@latest add skeleton
npx @shadcn/ui@latest add separator
npx @shadcn/ui@latest add scroll-area
npx @shadcn/ui@latest add tabs
npx @shadcn/ui@latest add toggle
npx @shadcn/ui@latest add tooltip
```

## ⚙️ Configuration Files

### CRACO Configuration Update

Update `web/craco.config.js` to ensure compatibility:

```js
module.exports = {
  style: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  typescript: {
    enableTypeChecking: true
  }
};
```

### TypeScript Configuration

Ensure `web/tsconfig.json` includes proper path aliases:

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": [
      "dom",
      "dom.iterable",
      "es6"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": "src",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/ui/*": ["./src/components/ui/*"]
    }
 },
  "include": [
    "src"
  ]
}
```

## 🎨 Brand Customization

### Ogni Brand Theme Configuration

Create `web/src/styles/theme.css` for brand-specific customizations:

```css
/* Ogni Brand Colors */
:root {
  /* Primary Brand Colors */
  --ogni-primary-50: 240 100% 98%;   /* Lightest primary */
  --ogni-primary-100: 230 100% 95%;
  --ogni-primary-200: 220 100% 90%;
  --ogni-primary-300: 210 100% 80%;
  --ogni-primary-400: 200 100% 65%;
  --ogni-primary-500: 195 100% 50%;  /* Primary brand color */
  --ogni-primary-600: 190 100% 40%;  /* Darker primary */
  --ogni-primary-700: 185 100% 30%;
  --ogni-primary-800: 180 100% 20%;
  --ogni-primary-900: 175 100% 10%;  /* Darkest primary */

  /* Secondary Brand Colors */
  --ogni-secondary-50: 60 100% 98%;
  --ogni-secondary-100: 60 100% 95%;
  --ogni-secondary-200: 60 100% 90%;
  --ogni-secondary-300: 60 100% 80%;
  --ogni-secondary-400: 60 100% 65%;
  --ogni-secondary-500: 60 100% 50%; /* Secondary brand color */
  --ogni-secondary-600: 60 100% 40%;
  --ogni-secondary-700: 60 100% 30%;
  --ogni-secondary-800: 60 100% 20%;
  --ogni-secondary-900: 60 100% 10%;

  /* Accent Colors */
  --ogni-accent-success: 120 100% 50%;
  --ogni-accent-warning: 45 100% 50%;
  --ogni-accent-error: 0 10% 50%;
  --ogni-accent-info: 200 100% 50%;
}

/* Apply brand colors to shadcn/ui components */
:root {
  --primary: var(--ogni-primary-500);
  --primary-foreground: var(--ogni-primary-50);
  --secondary: var(--ogni-secondary-500);
  --secondary-foreground: var(--ogni-secondary-50);
}

/* Custom brand components */
.ogni-button-primary {
  @apply bg-[hsl(var(--ogni-primary-500))] hover:bg-[hsl(var(--ogni-primary-60))];
}

.ogni-button-secondary {
  @apply bg-[hsl(var(--ogni-secondary-500))] hover:bg-[hsl(var(--ogni-secondary-60))];
}
```

## 📁 Project Structure Integration

### Component Directory Structure

After installation, the following structure will be created:

```
src/
├── components/
│   ├── ui/                 # Shadcn/UI base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ... (other components)
│   ├── lib/
│   │   └── utils.ts        # Utility functions
│   ├── shared/             # Ogni-specific shared components
│   │   ├── product-card.tsx
│   │   ├── cart-summary.tsx
│   │   └── ...
│   └── features/           # Feature-specific components
│       ├── core-ecommerce/
│       ├── social-commerce/
│       └── ...
```

### Utility Functions

Create `web/src/components/lib/utils.ts`:

```ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## 🔧 Component Customization

### Custom Button Variants

Create `web/src/components/ui/button-custom.tsx` for Ogni-specific button variants:

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const ogniButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[hsl(var(--ogni-primary-500))] text-primary-foreground hover:bg-[hsl(var(--ogni-primary-600))]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        "primary-gradient": "bg-gradient-to-r from-[hsl(var(--ogni-primary-500))] to-[hsl(var(--ogni-secondary-500))] text-white",
        "social-share": "bg-blue-50 hover:bg-blue-600 text-white",
        "add-to-cart": "bg-green-500 hover:bg-green-600 text-white",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface OgniButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof ogniButtonVariants> {
  asChild?: boolean
}

const OgniButton = React.forwardRef<HTMLButtonElement, OgniButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(ogniButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
OgniButton.displayName = "OgniButton"

export { OgniButton, ogniButtonVariants }
```

## 🧪 Testing Setup

### Component Testing Configuration

Update `web/package.json` to include testing utilities:

```json
{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/user-event": "^14.4.3",
    "jest": "^27.5.1",
    "@types/jest": "^27.5.2"
  }
}
```

## 🚀 Development Workflow

### Component Development Process

1. **New Component Creation**:
   ```bash
   # Use shadcn/ui CLI to add new components
   npx @shadcn/ui@latest add [component-name]
   
   # Or create custom Ogni components
   # Place in src/components/shared/ or feature-specific directories
   ```

2. **Component Usage**:
   ```tsx
   // Import shadcn/ui components
   import { Button, Card, Input } from "@/components/ui/button"
   
   // Import custom Ogni components
   import { OgniButton } from "@/components/ui/button-custom"
   import { ProductCard } from "@/components/shared/product-card"
   ```

3. **Component Documentation**:
   - Document all custom components with props interface
   - Include usage examples in component files
   - Update feature-specific documentation

## 🔒 Accessibility Considerations

### ARIA Compliance

All shadcn/ui components include proper ARIA attributes:
- Semantic HTML structure
- Proper focus management
- Screen reader compatibility
- Keyboard navigation support

### Accessibility Testing

- Use axe-core for accessibility testing
- Test with keyboard navigation
- Verify screen reader compatibility
- Follow WCAG 2.1 AA guidelines

## 📱 Responsive Design

### Breakpoint Strategy

The setup includes responsive design capabilities:
- Mobile-first approach
- Responsive utility classes
- Component-level responsive behavior
- Touch-friendly interactions

## 🔄 Update and Maintenance

### Version Management

- Regular dependency updates
- Breaking change monitoring
- Migration path documentation
- Component library versioning

### Component Library Evolution

- New component additions
- Existing component improvements
- Performance optimizations
- Accessibility enhancements

## 🚨 Troubleshooting

### Common Issues

1. **Tailwind CSS not working**:
   - Verify tailwind.config.js is properly configured
   - Check that CSS files are imported correctly
   - Ensure CRACO is processing Tailwind properly

2. **Component import errors**:
   - Verify paths in tsconfig.json
   - Check that components are properly exported
   - Ensure TypeScript paths are resolved

3. **Styling conflicts**:
   - Use CSS variables for theme customization
   - Avoid global style overrides
   - Maintain component encapsulation

This setup provides a solid foundation for implementing shadcn/ui components across all Ogni features while maintaining brand consistency and development best practices.