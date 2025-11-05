import React, { useState, useEffect } from 'react';
import { Cart as CartType, Product } from '../../types';
import { Cart as CartComponent } from '../../components/cart';
import { CartService } from '../../services/cartService';

const CartPage: React.FC = () => {
  const [cart, setCart] = useState<CartType | null>(null);
  const [products, setProducts] = useState<{ [productId: string]: { name: string; price: number; images: string[] } }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // For demo purposes, use a fixed user ID
  const userId = 'demo-user';

  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get cart with products
        const cartWithProducts = await CartService.getCartWithProducts(userId);

        if (cartWithProducts) {
          setCart(cartWithProducts.cart);

          // Convert products array to object for easier lookup
          const productsObj: { [productId: string]: { name: string; price: number; images: string[] } } = {};
          cartWithProducts.products.forEach((product: Product) => {
            productsObj[product.id] = {
              name: product.name,
              price: product.price,
              images: product.images,
            };
          });
          setProducts(productsObj);
        } else {
          // Create empty cart if none exists
          setCart({
            id: undefined,
            userId,
            items: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          setProducts({});
        }
      } catch (err) {
        console.error('Failed to load cart:', err);
        setError('Erro ao carregar carrinho');
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [userId]);

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    if (!cart) return;

    try {
      setLoading(true);
      if (quantity <= 0) {
        await CartService.removeItem(userId, productId);
      } else {
        await CartService.updateItemQuantity(userId, productId, quantity);
      }

      // Reload cart
      const cartWithProducts = await CartService.getCartWithProducts(userId);
      if (cartWithProducts) {
        setCart(cartWithProducts.cart);
      }
    } catch (err) {
      console.error('Failed to update cart:', err);
      setError('Erro ao atualizar carrinho');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    if (!cart) return;

    try {
      setLoading(true);
      await CartService.removeItem(userId, productId);

      // Reload cart
      const cartWithProducts = await CartService.getCartWithProducts(userId);
      if (cartWithProducts) {
        setCart(cartWithProducts.cart);
      } else {
        // Reset to empty cart
        setCart({
          id: undefined,
          userId,
          items: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    } catch (err) {
      console.error('Failed to remove item:', err);
      setError('Erro ao remover item');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    // TODO: Navigate to checkout page
    console.log('Navigate to checkout');
  };

  const handleContinueShopping = () => {
    // TODO: Navigate to catalog page
    console.log('Navigate to catalog');
  };

  if (loading && !cart) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando carrinho...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <svg
            className="w-16 h-16 text-red-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Erro ao carregar carrinho
          </h2>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!cart) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Carrinho não encontrado
          </h2>
          <p className="text-gray-600 mb-6">
            Não foi possível carregar seu carrinho.
          </p>
          <button
            onClick={handleContinueShopping}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Continuar Comprando
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CartComponent
        cart={cart}
        products={products}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
        onContinueShopping={handleContinueShopping}
        loading={loading}
      />
    </div>
  );
};

export default CartPage;