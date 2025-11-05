import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { ProductDetail as ProductDetailComponent } from '../../components/product/ProductDetail';
import { ProductService } from '../../services/productService';

interface ProductDetailPageProps {
  productId?: string;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productId }) => {
  // For now, get productId from props or URL search params
  const [currentProductId] = useState<string | null>(
    productId || new URLSearchParams(window.location.search).get('id')
  );
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      if (!currentProductId) {
        setError('ID do produto não fornecido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const productData = await ProductService.getProductById(currentProductId);

        if (!productData) {
          setError('Produto não encontrado');
        } else {
          setProduct(productData);
        }
      } catch (err) {
        console.error('Failed to load product:', err);
        setError('Erro ao carregar produto');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [currentProductId]);

  const handleAddToCart = (productId: string, quantity: number) => {
    // TODO: Implement cart functionality
    console.log('Add to cart:', productId, quantity);
  };

  const handleBack = () => {
    window.history.back(); // Go back to previous page
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
      <ProductDetailComponent
        product={product}
        onAddToCart={handleAddToCart}
        onBack={handleBack}
      />
    </div>
  );
};

export default ProductDetailPage;