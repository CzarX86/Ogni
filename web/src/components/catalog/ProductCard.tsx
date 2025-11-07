import React from 'react';
import { Product } from '../../types';
import { formatPrice } from '../../utils/format';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (_productId: string) => void;
  onViewDetails?: (_productId: string) => void;
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
  const hasDiscount = Boolean(product.discount && product.discount > 0);
  const discountedPrice = hasDiscount
    ? formatPrice(product.price * (1 - (product.discount ?? 0) / 100))
    : null;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-border/60 bg-white shadow-ogni transition-all duration-300 hover:-translate-y-1 hover:shadow-ogni-lg">
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-muted to-white">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-product.png';
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/60">
            <svg className="h-16 w-16" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        <div className="absolute left-4 top-4 flex flex-col gap-2">
          <Badge variant="outline" className="bg-white/80 text-secondary">
            Banho 18k
          </Badge>
          {hasDiscount && (
            <Badge variant="default" className="bg-primary text-primary-foreground">
              -{product.discount}%
            </Badge>
          )}
        </div>

        {isOutOfStock && (
          <div className="absolute right-4 top-4">
            <Badge variant="destructive">Esgotado</Badge>
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full bg-white/90 px-6 backdrop-blur-sm hover:bg-white"
            onClick={handleViewDetails}
          >
            Ver detalhes
          </Button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 p-6">
        <div className="space-y-2">
          <h3 className="font-serif text-xl font-semibold text-foreground transition-colors group-hover:text-secondary">
            {product.name}
          </h3>
          <p className="line-clamp-2 text-sm text-foreground/60">
            {product.description}
          </p>
        </div>

        {product.rating && product.rating > 0 && (
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-secondary/70">
            <div className="flex items-center gap-1 text-primary">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(product.rating || 0)
                      ? 'text-primary'
                      : 'text-muted-foreground/40'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span>{(product.reviewCount || 0).toString().padStart(2, '0')} reviews</span>
          </div>
        )}

        <div className="mt-auto space-y-4">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-foreground">
                {discountedPrice ?? formatPrice(product.price)}
              </span>
              <span className="text-[11px] uppercase tracking-[0.28em] text-foreground/50">
                até 6x sem juros
              </span>
            </div>
            {hasDiscount && (
              <span className="text-sm text-foreground/50 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={isAddDisabled}
            className="w-full rounded-full"
          >
            {isOutOfStock
              ? 'Indisponível'
              : isProcessing
                ? 'Adicionando...'
                : 'Adicionar à sacola'}
          </Button>
        </div>
      </div>
    </div>
  );
};
