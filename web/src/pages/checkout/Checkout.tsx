import React, { useState, useEffect } from 'react';
import { Cart as CartType } from '../../types';
import { Checkout as CheckoutComponent } from '../../components/checkout';
import { CartService } from '../../services/cartService';
import { OrderService } from '../../services/orderService';

const CheckoutPage: React.FC = () => {
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

        if (!cartWithProducts) {
          setError('Seu carrinho está vazio');
          return;
        }

        // Validate cart
        const validation = await CartService.validateCart(userId);
        if (!validation.isValid) {
          setError(`Carrinho inválido: ${validation.errors.join(', ')}`);
          return;
        }

        setCart(cartWithProducts.cart);

        // Convert products array to object for easier lookup
        const productsObj: { [productId: string]: { name: string; price: number; images: string[] } } = {};
        cartWithProducts.products.forEach((product) => {
          productsObj[product.id] = {
            name: product.name,
            price: product.price,
            images: product.images,
          };
        });
        setProducts(productsObj);
      } catch (err) {
        console.error('Failed to load cart for checkout:', err);
        setError('Erro ao carregar carrinho para checkout');
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [userId]);

  const handleSubmitOrder = async (checkoutData: { shippingAddress: any; paymentMethod: 'pix' | 'card' }) => {
    if (!cart) return;

    try {
      setLoading(true);
      setError(null);

      // Create order from cart
      const order = await OrderService.createOrderFromCart(
        userId,
        `${checkoutData.shippingAddress.street}, ${checkoutData.shippingAddress.city} - ${checkoutData.shippingAddress.zip}`,
        checkoutData.paymentMethod
      );

      console.log('Order created successfully:', order);

      // Redirect to success page or show success message
      // For now, just log success
      alert('Pedido realizado com sucesso!');

    } catch (err) {
      console.error('Failed to create order:', err);
      setError('Erro ao finalizar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    // TODO: Navigate back to cart
    window.history.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Preparando checkout...</p>
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
            Erro no Checkout
          </h2>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <button
            onClick={handleBack}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Voltar ao Carrinho
          </button>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13l-1.1 5M7 13h10m0 0v8a2 2 0 01-2 2H9a2 2 0 01-2-2v-8z"
            />
          </svg>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Carrinho Vazio
          </h2>
          <p className="text-gray-600 mb-6">
            Adicione produtos ao seu carrinho antes de fazer checkout.
          </p>
          <button
            onClick={handleBack}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Voltar ao Catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CheckoutComponent
        cart={cart}
        products={products}
        onSubmitOrder={handleSubmitOrder}
        onBack={handleBack}
        loading={loading}
      />
    </div>
  );
};

export default CheckoutPage;