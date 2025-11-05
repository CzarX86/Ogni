import React from 'react';
import { Product } from '../../../types';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { ArrowLeft } from 'lucide-react';

interface ProductViewProps {
  product: Product;
  onEdit: () => void;
  onBack: () => void;
}

export const ProductView: React.FC<ProductViewProps> = ({
  product,
  onEdit,
  onBack,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
        <Button onClick={onEdit}>
          Edit Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{product.name}</CardTitle>
              <p className="text-gray-600 mt-2">{product.description}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">
                {formatPrice(product.price)}
              </div>
              <Badge variant={product.stock > 0 ? 'default' : 'secondary'} className="mt-2">
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Product Details</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">ID:</span> {product.id}
                </div>
                <div>
                  <span className="font-medium">Category ID:</span> {product.categoryId}
                </div>
                <div>
                  <span className="font-medium">Stock:</span> {product.stock}
                </div>
                {product.discount && (
                  <div>
                    <span className="font-medium">Discount:</span> {product.discount}%
                  </div>
                )}
                {product.rating && (
                  <div>
                    <span className="font-medium">Rating:</span> {product.rating}/5 ({product.reviewCount} reviews)
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Timestamps</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Created:</span> {formatDate(product.createdAt)}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span> {formatDate(product.updatedAt)}
                </div>
              </div>
            </div>
          </div>

          {product.images.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4">Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {product.images.map((image, index) => (
                  <div key={index} className="aspect-square">
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};