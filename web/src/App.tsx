import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/shared/MainLayout';
import { Catalog } from './pages/catalog';
import { ProductDetail } from './pages/product';
import { Cart } from './pages/cart';
import { Checkout } from './pages/checkout';
import { Auth } from './pages/auth/Auth';
import { Profile } from './pages/account/Profile';
import { OrderHistory } from './pages/account/OrderHistory';
import FeedPage from './pages/feed/Feed';
import { ProductList } from './pages/admin/ProductList';
import SeedPage from './pages/admin/seed';
import { initializeAnalytics } from './analytics/external';
import { log } from 'shared/utils/logger';
import { AuthProvider } from './hooks/useAuth';
import './App.css';

// Debug environment variables
log.debug('Environment check:', {
  firebaseApiKey: !!process.env.REACT_APP_FIREBASE_API_KEY,
  firebaseProjectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  mercadoPagoToken: !!process.env.REACT_APP_MERCADO_PAGO_ACCESS_TOKEN,
  melhorEnvioToken: !!process.env.REACT_APP_MELHOR_ENVIO_TOKEN,
});

function App() {
  useEffect(() => {
    // Initialize analytics on app start
    initializeAnalytics().then((analyticsManager) => {
      if (analyticsManager) {
        log.info('Analytics initialized successfully');
      } else {
        log.warn('Analytics initialization failed');
      }
    });
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth pages without layout */}
          <Route path="/auth" element={<Auth />} />
          
          {/* All other pages with layout */}
          <Route path="/*" element={
            <MainLayout>
              <Routes>
                <Route path="/" element={<Catalog />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/feed" element={<FeedPage />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/orders" element={<OrderHistory />} />
                <Route path="/admin/products" element={<ProductList />} />
                <Route path="/admin/seed" element={<SeedPage />} />
              </Routes>
            </MainLayout>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;