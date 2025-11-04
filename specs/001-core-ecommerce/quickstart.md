# Quickstart Guide: Core E-commerce

**Date**: November 4, 2025
**Feature**: 001-core-ecommerce

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
- `web/src/hooks/useAnalytics.js`: Hook for user engagement tracking
- `web/src/components/Feed/`: Feed components with infinite scroll
- `web/src/hooks/useFeed.js`: Hook for feed data and interactions
- `web/src/algorithms/feedAlgorithm.js`: Feed personalization algorithm
- `shared/`: Common types and utilities
- `firebase/`: Backend functions and rules

## Development Workflow

1. Create feature branch from main
2. Develop PWA with TDD
3. Test on multiple browsers and devices
4. Deploy to staging
5. Merge after review
6. Add React Native mobile apps in future phases