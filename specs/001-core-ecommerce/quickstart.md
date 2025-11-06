# Quickstart Guide: Core E-commerce

**Date**: November 4, 2025
**Last Updated**: November 6, 2025
**Feature**: 001-core-ecommerce
**Status**: ✅ **IMPLEMENTED & DEPLOYED**

## 🚀 **Sistema Já Está Funcional!**

O sistema Ogni e-commerce está **100% implementado** e **pronto para uso**. Esta é uma **versão funcional** que você pode acessar imediatamente.

### 🌐 **Acesso ao Sistema**

**URL de Produção**: [ogni-41040.web.app](https://ogni-41040.web.app)  
**Status**: ✅ **ATIVO** (deploy automático via GitHub Actions)

### 👥 **Contas de Teste Disponíveis**

#### **Cliente (Compras)**
- **Email**: cliente@ogni.com.br
- **Senha**: Desert@1
- **Funcionalidades**: Catálogo, carrinho, checkout, pedidos

#### **Admin (Gestão)**
- **Email**: admin@ogni.com.br
- **Senha**: Desert@1
- **Funcionalidades**: CRUD produtos, analytics, pedidos

### 🎯 **Funcionalidades Disponíveis**

#### **Para Clientes** 🛒
- ✅ **Catálogo completo** com filtros e busca
- ✅ **Carrinho de compras** com sincronização
- ✅ **Checkout seguro** com Mercado Pago
- ✅ **Histórico de pedidos**
- ✅ **Feed social** com recomendações
- ✅ **Perfil e conta** com Google login

#### **Para Admins** 👨‍💼
- ✅ **Dashboard administrativo** completo
- ✅ **CRUD de produtos** e categorias
- ✅ **Gestão de pedidos** e analytics
- ✅ **Relatórios** e métricas

### 📊 **Dados de Exemplo**

O sistema já vem populado com **dados reais**:
- **50+ produtos** em diversas categorias
- **Pedidos de exemplo** no histórico
- **Reviews e comentários** nos produtos
- **Analytics configurados** (GA4 + Meta)

### 🔧 **Para Desenvolvedores (Setup Local)**

## Prerequisites

- Node.js 18+
- npm or yarn
- Firebase CLI

## Setup

### 1. Clone and Install

```bash
git clone <repo>
cd ogni
npm install
```

### 2. Firebase Setup

```bash
firebase login
firebase init
# Select Firestore, Functions, Hosting, Storage
```

Configure Firebase project with:
- Firestore database
- Authentication (Email/Password)
- Storage bucket
- Hosting site
- Cloud Messaging (for push notifications)
- Analytics (for user engagement tracking)

### 3. PWA Configuration

Create `web/public/manifest.json`:

```json
{
  "name": "Ogni E-commerce",
  "short_name": "Ogni",
  "description": "Plataforma de e-commerce Ogni",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

Create service worker `web/src/sw.js` for offline functionality.

### 3. Environment Variables

Create `.env.local`:

```
FIREBASE_API_KEY=your_key
FIREBASE_AUTH_DOMAIN=your_domain
FIREBASE_PROJECT_ID=ogni-project
MERCADO_PAGO_ACCESS_TOKEN=your_token
MELHOR_ENVIO_API_KEY=your_key
REACT_APP_GA_MEASUREMENT_ID=your_ga_id
REACT_APP_META_PIXEL_ID=your_pixel_id
REACT_APP_EMAIL_API_KEY=your_email_key
```

### 4. Run Locally

#### Web PWA
```bash
cd web
npm install
npm start
```

#### Firebase Functions (if any)
```bash
cd firebase/functions
npm install
firebase serve
```

### 5. Testing

```bash
npm test
```

### 6. Deployment

```bash
firebase deploy
```

## Key Files

- `web/src/`: React components and pages
- `web/public/manifest.json`: PWA manifest for app installation
- `web/src/sw.js`: Service worker for offline functionality and push notifications
- `web/src/hooks/useAppInstalled.js`: Hook for detecting mobile app installation
- `web/src/analytics/`: Analytics tracking utilities and event handlers
- `web/src/analytics/external/`: External analytics services (GA4, Meta Pixel, CAPI)
- `web/src/hooks/useAnalytics.js`: Hook for user engagement tracking
- `web/src/components/Feed/`: Feed components with infinite scroll
- `web/src/components/reviews/`: Review system components (ReviewList, ReviewForm)
- `web/src/components/gdpr/`: GDPR compliance components (consent banner, data rights)
- `web/src/hooks/useFeed.js`: Hook for feed data and interactions
- `web/src/algorithms/feedAlgorithm.js`: Feed personalization algorithm
- `shared/`: Common types and utilities
- `shared/services/reviewService.ts`: Review management service
- `shared/services/emailService.ts`: Email notification service
- `shared/utils/security.ts`: Security utilities and GDPR compliance
- `shared/models/review.ts`: Review data models
- `firebase/`: Backend functions and rules
- `web/tests/unit/test-review-service.test.ts`: Unit tests for review service

## Development Workflow

1. Create feature branch from main
2. Develop PWA with TDD
3. Test on multiple browsers and devices
4. Deploy to staging
5. Merge after review
6. Add React Native mobile apps in future phases