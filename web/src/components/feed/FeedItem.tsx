import React, { useState } from 'react';
import { FeedItem as FeedItemType } from '@/shared/types';
import { SocialService } from '../../services/socialService';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  ShoppingCart,
  Eye
} from 'lucide-react';
import { log } from 'shared/utils/logger';

interface FeedItemProps {
  item: FeedItemType;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onSave?: () => void;
  onViewProduct?: () => void;
}

export const FeedItem: React.FC<FeedItemProps> = ({
  item,
  onLike,
  onComment,
  onShare,
  onSave,
  onViewProduct
}) => {
  const [isLiking, setIsLiking] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const { product, socialStats } = item;

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);
    try {
      if (socialStats.isLiked) {
        // Unlike - we would need the like ID, but for now just call the service
        // This is a simplified implementation
        log.info('Unlike product', { productId: product.id });
      } else {
        await SocialService.likeProduct(product.id);
        log.info('Liked product', { productId: product.id });
      }

      // Update local state (in a real app, this would come from props update)
      socialStats.isLiked = !socialStats.isLiked;
      socialStats.likes += socialStats.isLiked ? 1 : -1;

      onLike?.();
    } catch (error) {
      log.error('Failed to like product', { productId: product.id, error });
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    if (isSharing) return;

    setIsSharing(true);
    try {
      await SocialService.shareProduct(product.id, 'copy_link');
      log.info('Shared product', { productId: product.id });

      // Update share count
      socialStats.shares += 1;

      onShare?.();
    } catch (error) {
      log.error('Failed to share product', { productId: product.id, error });
    } finally {
      setIsSharing(false);
    }
  };

  const handleSave = () => {
    // Toggle saved state
    socialStats.isSaved = !socialStats.isSaved;
    log.info('Toggled save product', { productId: product.id, saved: socialStats.isSaved });
    onSave?.();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={onViewProduct}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ShoppingCart className="h-12 w-12" />
          </div>
        )}

        {/* Stock status badge */}
        {product.stock === 0 && (
          <Badge variant="destructive" className="absolute top-2 left-2">
            Out of Stock
          </Badge>
        )}

        {/* Save button */}
        <Button
          variant="ghost"
          size="sm"
          className={`absolute top-2 right-2 p-2 ${
            socialStats.isSaved ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={handleSave}
        >
          <Bookmark className={`h-5 w-5 ${socialStats.isSaved ? 'fill-current' : ''}`} />
        </Button>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Title and Price */}
        <div className="flex justify-between items-start mb-2">
          <h3
            className="font-semibold text-lg text-gray-900 cursor-pointer hover:text-blue-600 line-clamp-2 flex-1 mr-2"
            onClick={onViewProduct}
          >
            {product.name}
          </h3>
          <span className="font-bold text-lg text-green-600 whitespace-nowrap">
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Description */}
        {product.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Social Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <Heart className={`h-4 w-4 ${socialStats.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{formatNumber(socialStats.likes)}</span>
            </span>
            <span className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>{formatNumber(socialStats.comments)}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{formatNumber(socialStats.shares)}</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant={socialStats.isLiked ? "default" : "outline"}
              size="sm"
              onClick={handleLike}
              disabled={isLiking}
              className={socialStats.isLiked ? "bg-red-500 hover:bg-red-600 text-white" : ""}
            >
              <Heart className={`h-4 w-4 mr-1 ${socialStats.isLiked ? 'fill-current' : ''}`} />
              {socialStats.isLiked ? 'Liked' : 'Like'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onComment}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Comment
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              disabled={isSharing}
            >
              <Share className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={onViewProduct}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            View
          </Button>
        </div>
      </div>
    </Card>
  );
};