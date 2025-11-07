import React, { useEffect, useState } from 'react';
import { Cart as CartType, CheckoutForm, Order } from '../../types';
import { formatPrice } from '../../utils/format';
import { log } from 'shared/utils/logger';

interface CheckoutProps {
  cart: CartType;
  products: { [productId: string]: { name: string; price: number; images: string[] } };
  onSubmitOrder?: (checkoutData: CheckoutForm) => Promise<Order | void> | Order | void;
  onBack?: () => void;
  loading?: boolean;
  order?: Order | null;
}

type CheckoutStep = 'shipping' | 'payment' | 'review' | 'confirmation';

export const Checkout: React.FC<CheckoutProps> = ({
  cart,
  products,
  onSubmitOrder,
  onBack,
  loading = false,
  order,
}) => {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [checkoutData, setCheckoutData] = useState<Partial<CheckoutForm>>({
    shippingAddress: {
      street: '',
      city: '',
      zip: '',
    },
    paymentMethod: 'pix',
  });

  const cartItems = cart.items.map(item => ({
    ...item,
    product: products[item.productId],
  })).filter(item => item.product);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + shipping;

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (order) {
      setConfirmedOrder(order);
    }
  }, [order]);

  const validateShippingData = (data: CheckoutForm['shippingAddress']): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!data.street.trim()) {
      newErrors.street = 'Endereço é obrigatório';
    }

    if (!data.city.trim()) {
      newErrors.city = 'Cidade é obrigatória';
    }

    if (!data.zip.trim()) {
      newErrors.zip = 'CEP é obrigatório';
    } else if (!/^\d{5}-?\d{3}$/.test(data.zip.replace(/\D/g, ''))) {
      newErrors.zip = 'CEP inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCart = (): boolean => {
    if (!cart || !cart.items || cart.items.length === 0) {
      setErrors({ cart: 'Carrinho está vazio' });
      return false;
    }

    // Check if all products are available
    const unavailableProducts = cart.items.filter(item => {
      const product = products[item.productId];
      return !product || item.quantity <= 0;
    });

    if (unavailableProducts.length > 0) {
      setErrors({ cart: 'Alguns produtos não estão disponíveis' });
      return false;
    }

    return true;
  };

  const handleShippingSubmit = (shippingData: CheckoutForm['shippingAddress']) => {
    if (validateShippingData(shippingData)) {
      setCheckoutData(prev => ({ ...prev, shippingAddress: shippingData }));
      setErrors({});
      setCurrentStep('payment');
    }
  };

  const handlePaymentSubmit = (paymentMethod: 'pix' | 'card') => {
    if (!paymentMethod) {
      setErrors({ payment: 'Selecione um método de pagamento' });
      return;
    }

    setCheckoutData(prev => ({ ...prev, paymentMethod }));
    setErrors({});
    setCurrentStep('review');
  };

  const handleOrderSubmit = async () => {
    if (!checkoutData.shippingAddress || !checkoutData.paymentMethod) {
      setErrors({ general: 'Dados de checkout incompletos' });
      return;
    }

    if (!validateCart()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      if (onSubmitOrder) {
        await onSubmitOrder({
          shippingAddress: checkoutData.shippingAddress,
          paymentMethod: checkoutData.paymentMethod,
        });
      }
      setCurrentStep('confirmation');
    } catch (error) {
      log.error('Error submitting order:', { error });
      setErrors({
        general: error instanceof Error
          ? error.message
          : 'Erro ao processar pedido. Tente novamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 'shipping', name: 'Endereço', completed: !!checkoutData.shippingAddress?.street },
    { id: 'payment', name: 'Pagamento', completed: !!checkoutData.paymentMethod },
    { id: 'review', name: 'Revisão', completed: false },
    { id: 'confirmation', name: 'Confirmação', completed: false },
  ];

  if (currentStep === 'confirmation') {
    return (
      <CheckoutConfirmation
        cart={cart}
        products={products}
        checkoutData={checkoutData as CheckoutForm}
        onBack={onBack}
        order={confirmedOrder}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Finalizar Compra
        </h1>

        {/* Progress Steps */}
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.id === currentStep
                      ? 'bg-blue-600 text-white'
                      : step.completed
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {step.completed ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step.id === currentStep ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 ${
                  step.completed ? 'bg-green-600' : 'bg-gray-300'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {currentStep === 'shipping' && (
            <ShippingStep
              initialData={checkoutData.shippingAddress}
              onSubmit={handleShippingSubmit}
              onBack={onBack}
            />
          )}

          {currentStep === 'payment' && (
            <PaymentStep
              selectedMethod={checkoutData.paymentMethod}
              onSubmit={handlePaymentSubmit}
              onBack={() => setCurrentStep('shipping')}
            />
          )}

          {currentStep === 'review' && (
            <ReviewStep
              cart={cart}
              products={products}
              checkoutData={checkoutData as CheckoutForm}
              onSubmit={handleOrderSubmit}
              onBack={() => setCurrentStep('payment')}
              loading={loading || isSubmitting}
              errors={errors}
            />
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Resumo do Pedido
            </h3>

            {/* Cart Items */}
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {item.product.images && item.product.images.length > 0 ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        IMG
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.quantity}x {formatPrice(item.product.price)}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Frete</span>
                <span className="text-gray-900">
                  {shipping === 0 ? 'Grátis' : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Shipping Step Component
interface ShippingStepProps {
  initialData?: CheckoutForm['shippingAddress'];
  onSubmit: (data: CheckoutForm['shippingAddress']) => void;
  onBack?: () => void;
}

const ShippingStep: React.FC<ShippingStepProps> = ({ initialData, onSubmit, onBack }) => {
  const [formData, setFormData] = useState(initialData || {
    street: '',
    city: '',
    zip: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.street && formData.city && formData.zip) {
      onSubmit(formData);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Endereço de Entrega
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
            Endereço Completo
          </label>
          <input
            id="street"
            type="text"
            value={formData.street}
            onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Rua, número, complemento"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              Cidade
            </label>
            <input
              id="city"
              type="text"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">
              CEP
            </label>
            <input
              id="zip"
              type="text"
              value={formData.zip}
              onChange={(e) => setFormData(prev => ({ ...prev, zip: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="00000-000"
              required
            />
          </div>
        </div>

        <div className="flex justify-between pt-4">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="bg-gray-100 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Voltar
            </button>
          )}
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 ml-auto"
          >
            Continuar para Pagamento
          </button>
        </div>
      </form>
    </div>
  );
};

// Payment Step Component
interface PaymentStepProps {
  selectedMethod?: 'pix' | 'card';
  onSubmit: (method: 'pix' | 'card') => void;
  onBack: () => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({ selectedMethod = 'pix', onSubmit, onBack }) => {
  const [method, setMethod] = useState<'pix' | 'card'>(selectedMethod);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(method);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Método de Pagamento
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="paymentMethod"
              value="pix"
              checked={method === 'pix'}
              onChange={(e) => setMethod(e.target.value as 'pix')}
              className="text-blue-600 focus:ring-blue-500"
            />
            <div className="ml-3 flex items-center">
              <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center mr-3">
                <span className="text-white font-bold text-xs">P</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">PIX</p>
                <p className="text-sm text-gray-600">Pagamento instantâneo</p>
              </div>
            </div>
          </label>

          <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 opacity-50 cursor-not-allowed">
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={method === 'card'}
              onChange={(e) => setMethod(e.target.value as 'card')}
              disabled
              className="text-blue-600 focus:ring-blue-500"
            />
            <div className="ml-3 flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Cartão de Crédito</p>
                <p className="text-sm text-gray-600">Em breve</p>
              </div>
            </div>
          </label>
        </div>

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            className="bg-gray-100 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Voltar
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Revisar Pedido
          </button>
        </div>
      </form>
    </div>
  );
};

// Review Step Component
interface ReviewStepProps {
  cart: CartType;
  products: { [productId: string]: { name: string; price: number; images: string[] } };
  checkoutData: CheckoutForm;
  onSubmit: () => void;
  onBack: () => void;
  loading?: boolean;
  errors?: { [key: string]: string };
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  cart,
  products,
  checkoutData,
  onSubmit,
  onBack,
  loading,
  errors = {},
}) => {
  const cartItems = cart.items.map(item => ({
    ...item,
    product: products[item.productId],
  })).filter(item => item.product);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + shipping;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Revisar Pedido
      </h2>

      <div className="space-y-6">
        {/* Error Messages */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Erro ao processar pedido
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc pl-5 space-y-1">
                    {Object.values(errors).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Shipping Address */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Endereço de Entrega
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-900">{checkoutData.shippingAddress.street}</p>
            <p className="text-gray-900">{checkoutData.shippingAddress.city}</p>
            <p className="text-gray-900">CEP: {checkoutData.shippingAddress.zip}</p>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Método de Pagamento
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-900 capitalize">{checkoutData.paymentMethod}</p>
          </div>
        </div>

        {/* Order Items */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Itens do Pedido
          </h3>
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item.productId} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                    {item.product.images && item.product.images.length > 0 ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        IMG
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.product.name}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity}x {formatPrice(item.product.price)}
                    </p>
                  </div>
                </div>
                <p className="font-medium text-gray-900">
                  {formatPrice(item.product.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Order Total */}
        <div className="border-t border-gray-200 pt-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Frete</span>
              <span className="text-gray-900">
                {shipping === 0 ? 'Grátis' : formatPrice(shipping)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="bg-gray-100 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors duration-200"
          >
            Voltar
          </button>
          <button
            onClick={onSubmit}
            disabled={loading}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
          >
            {loading ? 'Processando...' : 'Finalizar Pedido'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Confirmation Component
interface CheckoutConfirmationProps {
  cart: CartType;
  products: { [productId: string]: { name: string; price: number; images: string[] } };
  checkoutData: CheckoutForm;
  onBack?: () => void;
  order?: Order | null;
}

const CheckoutConfirmation: React.FC<CheckoutConfirmationProps> = ({
  cart,
  products,
  checkoutData,
  onBack,
  order,
}) => {
  const statusLabels: Record<Order['status'], string> = {
    pending: 'Pendente',
    paid: 'Pago',
    shipped: 'Enviado',
    delivered: 'Entregue',
    cancelled: 'Cancelado',
  };

  const paymentStatusLabels: Record<string, string> = {
    pending: 'Pendente',
    processing: 'Processando',
    completed: 'Concluído',
    failed: 'Falhou',
  };

  const itemsFromOrder = order
    ? order.items.map(item => ({
        ...item,
        product: products[item.productId],
      }))
    : cart.items.map(item => ({
        ...item,
        product: products[item.productId],
      })).filter(item => item.product);

  const subtotal = itemsFromOrder.reduce((sum, item) => {
    if (item.product) {
      return sum + item.product.price * item.quantity;
    }
    return 0; // Skip items without product data
  }, 0);

  const shipping = order ? order.shipping.cost : subtotal > 100 ? 0 : 10;
  const total = order ? order.total : subtotal + shipping;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Pedido Confirmado!
        </h1>
        <p className="text-gray-600">
          Obrigado pela sua compra. Você receberá um email com os detalhes do pedido.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Detalhes do Pedido
        </h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Endereço de Entrega</h3>
            <p className="text-gray-600">{checkoutData.shippingAddress.street}</p>
            <p className="text-gray-600">{checkoutData.shippingAddress.city}</p>
            <p className="text-gray-600">CEP: {checkoutData.shippingAddress.zip}</p>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">Método de Pagamento</h3>
            <p className="text-gray-600 capitalize">{checkoutData.paymentMethod}</p>
          </div>

          {order && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Número do Pedido</h3>
                <p className="text-gray-600">#{order.id}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Status do Pedido</h3>
                <p className="text-gray-600">{statusLabels[order.status]}</p>
                <p className="text-sm text-gray-500">Pagamento: {paymentStatusLabels[order.payment.status] || order.payment.status}</p>
              </div>
            </div>
          )}

          <div>
            <h3 className="font-medium text-gray-900 mb-2">Itens</h3>
            <div className="space-y-2">
              {itemsFromOrder.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.product?.name || item.productId} (x{item.quantity})
                  </span>
                  <span className="text-gray-900">
                    {formatPrice((item.product?.price ?? 0) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Frete</span>
              <span className="text-gray-900">{shipping === 0 ? 'Grátis' : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        {onBack && (
          <div className="mt-6 text-center">
            <button
              onClick={onBack}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Continuar Comprando
            </button>
          </div>
        )}
      </div>
    </div>
  );
};