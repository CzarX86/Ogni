import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Catalog } from './pages/catalog';
import { ProductDetail } from './pages/product';
import { Cart } from './pages/cart';
import { Checkout } from './pages/checkout';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;