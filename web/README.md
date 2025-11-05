# Ogni E-commerce - Web Application

## Environment Setup

### 1. Environment Variables

Copy the example environment file and configure your local development:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual API keys and tokens:

#### Required Variables:

- **Mercado Pago**:
  - `REACT_APP_MERCADO_PAGO_ACCESS_TOKEN`: Your Mercado Pago access token
  - `REACT_APP_MERCADO_PAGO_PUBLIC_KEY`: Your Mercado Pago public key

- **Melhor Envio**:
  - `REACT_APP_MELHOR_ENVIO_TOKEN`: Your Melhor Envio API token

- **Firebase** (if using Firebase services):
  - `REACT_APP_FIREBASE_API_KEY`
  - `REACT_APP_FIREBASE_AUTH_DOMAIN`
  - `REACT_APP_FIREBASE_PROJECT_ID`

#### Optional Variables:

- **Analytics**:
  - `REACT_APP_GA_TRACKING_ID`: Google Analytics tracking ID
  - `REACT_APP_FB_PIXEL_ID`: Facebook Pixel ID

### 2. Production Deployment

For production deployment on Firebase Hosting, configure these secrets in your GitHub repository:

- `FIREBASE_TOKEN`: Firebase CI token
- `FIREBASE_SERVICE_ACCOUNT`: Firebase service account JSON
- `FIREBASE_PROJECT_ID`: Your Firebase project ID
- `MERCADO_PAGO_ACCESS_TOKEN`: Production Mercado Pago access token
- `MELHOR_ENVIO_TOKEN`: Production Melhor Envio token

### 3. Development

```bash
npm install
npm start
```

### 4. Testing

```bash
npm test
npm run lint
```

## Features

- 🛒 Complete e-commerce flow (catalog → cart → checkout → payment)
- 💳 Mercado Pago integration (Checkout API v2)
- 🚚 Melhor Envio shipping calculations
- 📊 Analytics integration (GA4 + Facebook Pixel)
- 🔄 Offline functionality with service worker
- 📱 PWA optimized for mobile
- 🧪 Comprehensive testing suite</content>
<parameter name="filePath">/Users/juliocezar/Dev/personal/Ogni/web/README.md