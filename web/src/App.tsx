import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Catalog } from './pages/catalog';
import { ProductDetail } from './pages/product';
import { Cart } from './pages/cart';
import { Checkout } from './pages/checkout';
import { ProductList } from './pages/admin/ProductList';
import SeedPage from './pages/admin/seed';
import './App.css';

// Debug environment variables
console.log('Environment check:', {
  firebaseApiKey: !!process.env.REACT_APP_FIREBASE_API_KEY,
  firebaseProjectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  mercadoPagoToken: !!process.env.REACT_APP_MERCADO_PAGO_ACCESS_TOKEN,
  melhorEnvioToken: !!process.env.REACT_APP_MELHOR_ENVIO_TOKEN,
});

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/admin/products" element={<ProductList />} />
          <Route path="/admin/seed" element={<SeedPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;