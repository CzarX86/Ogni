import React from 'react';
import { Product } from '../../types';
import { formatPrice } from '../../utils/format';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
  onViewDetails?: (productId: string) => void;
  isProcessing?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onViewDetails,
  isProcessing = false,
}) => {
  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product.id);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(product.id);
    }
  };

  const isOutOfStock = product.stock <= 0;
  const isAddDisabled = isOutOfStock || isProcessing;

  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-ogni overflow-hidden transition-all duration-300 hover:-translate-y-2 border-0">
      {/* Product Image */}
      <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-product.png';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        {/* Stock Status Badge */}
        {isOutOfStock && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
            Fora de Estoque
          </div>
        )}

        {/* Discount Badge */}
        {product.discount && product.discount > 0 && (
          <div className="absolute top-3 left-3 bg-gradient-ogni text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
            -{product.discount}%
          </div>
        )}

        {/* Hover overlay with quick actions */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={handleViewDetails}
            className="bg-white text-gray-900 px-4 py-2 rounded-full font-medium hover:bg-gray-50 transition-colors shadow-lg"
          >
            Ver Detalhes
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {product.description}
        </p>

        {/* Price */}
        <div className="flex items-center mb-4">
          {product.discount && product.discount > 0 ? (
            <>
              <span className="text-2xl font-bold text-primary mr-3">
                {formatPrice(product.price * (1 - product.discount / 100))}
              </span>
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="text-2xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating!)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-2">
              ({product.reviewCount || 0})
            </span>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleAddToCart}
          disabled={isAddDisabled}
          className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 transform hover:scale-105 ${
            isAddDisabled
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-ogni text-white hover:shadow-lg hover:opacity-90'
          }`}
        >
          {isOutOfStock ? 'Indisponível' : isProcessing ? 'Adicionando...' : 'Adicionar ao Carrinho'}
        </button>
      </div>
    </div>
  );
};