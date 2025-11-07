import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Product } from '../../types';
import { ProductDetail as ProductDetailComponent } from '../../components/product/ProductDetail';
import { ProductService } from '../../services/productService';
import { CartService } from '../../services/cartService';
import { logger } from '../../shared/utils/logger';

interface ProductDetailPageProps {
  productId?: string;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productId }) => {
  const navigate = useNavigate();
  const { id: routeProductId } = useParams<{ id: string }>();
  const resolvedProductId = productId || routeProductId || new URLSearchParams(window.location.search).get('id');
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);

  const userId = 'demo-user';

  useEffect(() => {
    const loadProduct = async () => {
      if (!resolvedProductId) {
        setError('ID do produto não fornecido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const productData = await ProductService.getProductById(resolvedProductId);

        if (!productData) {
          setError('Produto não encontrado');
        } else {
          setProduct(productData);
        }
      } catch (err) {
        logger.error('Failed to load product', { error: err, productId: resolvedProductId });
        setError('Erro ao carregar produto');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [resolvedProductId]);

  const handleAddToCart = async (productIdToAdd: string, quantity: number) => {
    try {
      setAddingToCart(true);
      await CartService.addItem(userId, productIdToAdd, quantity);
      setFeedback({
        type: 'success',
        message: 'Produto adicionado ao carrinho com sucesso.',
      });
    } catch (err) {
      logger.error('Failed to add product to cart', { error: err, productId: productIdToAdd, quantity });
      const errorMessage = err instanceof Error ? err.message : 'Não foi possível adicionar o produto ao carrinho.';
      setFeedback({ type: 'error', message: errorMessage });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleCloseFeedback = () => setFeedback(null);

  const handleGoToCart = () => {
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando produto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
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
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-.98-5.5-2.5m.5-4C6.5 9 9 5.5 9 5.5S10.5 7 12 7s3-1.5 3-1.5-1.5-3.5-3-3.5z"
            />
          </svg>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {error || 'Produto não encontrado'}
          </h2>
          <p className="text-gray-600 mb-6">
            O produto que você está procurando pode não existir ou pode ter sido removido.
          </p>
          <button
            onClick={handleBack}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {feedback && (
        <div
          className={`max-w-4xl mx-auto px-4 pt-8 ${
            feedback.type === 'success'
              ? 'text-green-700'
              : 'text-red-700'
          }`}
        >
          <div
            className={`rounded-lg border px-4 py-3 flex items-start justify-between ${
              feedback.type === 'success'
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
            }`}
          >
            <div>
              <p className="font-medium">{feedback.type === 'success' ? 'Produto adicionado ao carrinho' : 'Não foi possível adicionar o produto'}</p>
              <p className="text-sm mt-1">{feedback.message}</p>
              {feedback.type === 'success' && (
                <button
                  onClick={handleGoToCart}
                  className="mt-3 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Ver carrinho
                </button>
              )}
            </div>
            <button onClick={handleCloseFeedback} className="ml-4 text-sm font-medium underline">
              Fechar
            </button>
          </div>
        </div>
      )}

      <ProductDetailComponent
        product={product}
        onAddToCart={handleAddToCart}
        onBack={handleBack}
        isAddingToCart={addingToCart}
      />
    </div>
  );
};

export default ProductDetailPage;