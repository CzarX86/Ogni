# Shadcn/UI Installation and Setup Guide

## 🎯 Overview

This document provides step-by-step instructions for installing and setting up shadcn/ui in the Ogni e-commerce platform. The setup includes Tailwind CSS configuration, component installation, and brand customization.

## 📋 Prerequisites

Before installing shadcn/ui, ensure your development environment meets these requirements:

### System Requirements
- Node.js 16+ 
- npm, yarn, or pnpm package manager
- Git for version control

### Project Dependencies
The following should already be present in your Ogni project:
- React 18+
- TypeScript 4.5+
- CRACO (already configured in the project)

## 🚀 Installation Steps

### Step 1: Install Tailwind CSS

First, install Tailwind CSS and its dependencies if not already present:

```bash
cd web
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 2: Configure Tailwind CSS

Update `web/tailwind.config.js` with the following configuration:

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

Replace the content of `web/src/index.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;

    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;

    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;

    --secondary: 210 40% 96.1%;
    --secondary-foreground: 22.2 47.4% 11.2%;

    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;

    --accent: 210 40% 96.1%;
    --accent-foreground: 22.2 47.4% 11.2%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;

    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
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

Install the shadcn/ui CLI tool globally:

```bash
npm install -g @shadcn/ui
```

Or use npx for one-time setup:

```bash
npx @shadcn/ui@latest init
```

### Step 5: Initialize Shadcn/UI

Run the initialization command in the web directory:

```bash
cd web
npx @shadcn/ui@latest init
```

During initialization, use these settings:
- Style: `default` (or choose based on preference)
- Tailwind CSS: `Yes`
- TypeScript: `Yes`
- Base CSS: `Yes`
- CSS Variables: `Yes`
- Strict Mode: `Yes` (recommended)

### Step 6: Install Required Dependencies

The CLI will install the following dependencies:
- `@radix-ui/react-*` components
- `class-variance-authority` for variant management
- `clsx` for class concatenation
- `tailwind-merge` for class merging
- `lucide-react` for icons (optional)

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

## ⚙️ Configuration Updates

### CRACO Configuration

Ensure `web/craco.config.js` is properly configured for Tailwind:

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

Update `web/tsconfig.json` to include proper path aliases:

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

## 🎨 Brand Customization Setup

### Create Utility Functions

Create `web/src/components/lib/utils.ts`:

```ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Ogni Brand Theme Configuration

Create `web/src/styles/brand-theme.css` for brand-specific customizations:

```css
/* Ogni Brand Colors */
:root {
  /* Primary Brand Colors */
  --ogni-primary-50: 240 10% 98%;
  --ogni-primary-100: 230 100% 95%;
  --ogni-primary-200: 220 100% 90%;
  --ogni-primary-300: 210 100% 80%;
  --ogni-primary-400: 200 100% 65%;
  --ogni-primary-500: 195 100% 50%;  /* Primary brand color */
  --ogni-primary-60: 190 100% 40%;
  --ogni-primary-700: 185 100% 30%;
  --ogni-primary-800: 180 100% 20%;
  --ogni-primary-900: 175 100% 10%;

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
  --ogni-accent-error: 0 100% 50%;
  --ogni-accent-info: 200 100% 50%;
}

/* Apply brand colors to shadcn/ui components */
:root {
  --primary: var(--ogni-primary-500);
  --primary-foreground: var(--ogni-primary-50);
  --secondary: var(--ogni-secondary-500);
  --secondary-foreground: var(--ogni-secondary-50);
}
```

Import this CSS file in your main `index.tsx`:

```tsx
import './styles/brand-theme.css'
```

## 📁 Component Directory Structure

After installation, your component structure should look like:

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
│   └── features/           # Feature-specific components
```

## 🧪 Testing Setup

### Install Testing Dependencies

```bash
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### Component Testing Example

Create a simple test to verify installation:

```tsx
// web/src/components/ui/button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
 it('renders correctly', () => {
    render(<Button>Test Button</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
```

## 🔧 Post-Installation Verification

### Verify Installation

1. **Check package.json** - Ensure shadcn/ui dependencies are installed
2. **Verify component files** - Check that UI components exist in `src/components/ui/`
3. **Test a component** - Try importing and using a component:

```tsx
// Test in a component file
import { Button } from "@/components/ui/button"

const TestComponent = () => {
  return <Button>Test Button</Button>
}
```

### Common Issues and Solutions

#### Issue: Tailwind classes not working
- **Solution**: Ensure CRACO is properly configured and Tailwind is set up correctly
- **Check**: Verify tailwind.config.js and index.css

#### Issue: Component import errors
- **Solution**: Verify TypeScript paths in tsconfig.json
- **Check**: Ensure correct import paths like `@/components/ui/button`

#### Issue: CSS variables not applied
- **Solution**: Verify CSS variables are properly defined in index.css
- **Check**: Ensure the CSS file is imported in index.tsx

## 🚀 Next Steps

1. **Customize Components**: Create Ogni-specific component variants
2. **Build Shared Components**: Create components in the shared directory
3. **Implement Brand Styling**: Apply brand colors and styling
4. **Create Feature Components**: Build feature-specific components using shadcn/ui base

## 📚 Additional Resources

- [Shadcn/UI Documentation](https://ui.shadcn.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs)

This installation setup provides the foundation for using shadcn/ui components across all Ogni features while maintaining brand consistency and development best practices.