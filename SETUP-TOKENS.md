# 🔑 API Tokens Setup Guide

## Mercado Pago Setup

### 1. Access Mercado Pago Developer Panel
- Go to: https://www.mercadopago.com.br/developers/panel
- Log in with your Mercado Pago account

### 2. Create/Access Application
- Go to "Your applications" section
- Create a new application or select existing one
- Application type: **Online payments**

### 3. Get Credentials
- In your application, go to "Credentials" section
- **Production credentials** (for live payments):
  - `Access token`: Copy the **Access Token** (starts with `APP_USR-`)
  - `Public key`: Copy the **Public Key** (starts with `APP_USR-`)

### 4. Update .env.local
```bash
REACT_APP_MERCADO_PAGO_ACCESS_TOKEN=APP_USR-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
REACT_APP_MERCADO_PAGO_PUBLIC_KEY=APP_USR-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## Melhor Envio Setup

### 1. Access Melhor Envio Panel
- Go to: https://melhorenvio.com.br/painel/configuracoes/api
- Log in with your Melhor Envio account

### 2. Generate API Token
- In the API section, click "Generate Token"
- Copy the generated token

### 3. Update .env.local
```bash
REACT_APP_MELHOR_ENVIO_TOKEN=your_generated_token_here
```

---

## Firebase Setup

### 1. Access Firebase Console
- Go to: https://console.firebase.google.com/project/ogni-41040/settings/general/web
- Select your project: **ogni-41040**

### 2. Get Web App Configuration
- In "Your apps" section, click the web app icon (</>) to add a web app
- Register your app with name "Ogni Web"
- Copy the configuration object

### 3. Update .env.local
```bash
REACT_APP_FIREBASE_API_KEY=AIzaXXXXXXXXXXXXXXXXXXXXXXX
REACT_APP_FIREBASE_AUTH_DOMAIN=ogni-41040.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=ogni-41040
REACT_APP_FIREBASE_STORAGE_BUCKET=ogni-41040.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=XXXXXXXXXXXX
REACT_APP_FIREBASE_APP_ID=1:XXXXXXXXXXXX:web:XXXXXXXXXXXXXXXXXXXX
```

---

## Testing Configuration

After adding all tokens:

```bash
cd web
npm start
```

Check browser console for any Firebase/Mercado Pago errors. If everything loads without errors, your configuration is correct!

---

## Production Deployment

For production, these tokens should be added to GitHub Secrets:
- `MERCADO_PAGO_ACCESS_TOKEN`
- `MELHOR_ENVIO_TOKEN`
- `FIREBASE_SERVICE_ACCOUNT` (for Firebase Admin SDK)

The Firebase project ID and other config will be automatically handled by the CI/CD pipeline.</content>
<parameter name="filePath">/Users/juliocezar/Dev/personal/Ogni/SETUP-TOKENS.md