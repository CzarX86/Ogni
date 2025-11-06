import React from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { Package } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  onAddToCart?: (productId: string) => void;
  onViewDetails?: (productId: string) => void;
  emptyMessage?: string;
  processingProductId?: string | null;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading = false,
  onAddToCart,
  onViewDetails,
  emptyMessage = 'Nenhum produto encontrado.',
  processingProductId = null,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
            <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded-lg w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded-lg w-full"></div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="h-6 bg-gray-200 rounded-lg w-24"></div>
                <div className="h-5 bg-gray-200 rounded-lg w-16"></div>
              </div>
              <div className="h-11 bg-gray-200 rounded-xl w-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="relative w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center shadow-lg">
            <Package className="w-12 h-12 text-gray-400" strokeWidth={1.5} />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          Nenhum produto encontrado
        </h3>
        <p className="text-gray-600 text-center max-w-md text-lg">
          {emptyMessage}
        </p>
        <p className="text-gray-500 text-center max-w-sm text-sm mt-4">
          Tente ajustar os filtros ou fazer uma nova busca para encontrar o que você procura.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onViewDetails={onViewDetails}
          isProcessing={processingProductId === product.id}
        />
      ))}
    </div>
  );
};