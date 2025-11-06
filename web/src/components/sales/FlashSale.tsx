import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Clock, Zap, ShoppingCart, Timer } from 'lucide-react';
import { Product } from '@/shared/models/product';

interface FlashSale {
  id: string;
  title: string;
  description: string;
  products: Product[];
  discountPercentage: number;
  originalPrice: number;
  salePrice: number;
  startTime: Date;
  endTime: Date;
  maxQuantity: number;
  soldQuantity: number;
  isActive: boolean;
  bannerImage?: string;
}

interface FlashSaleCountdownProps {
  endTime: Date;
  onExpire?: () => void;
  className?: string;
}

export const FlashSaleCountdown: React.FC<FlashSaleCountdownProps> = ({
  endTime,
  onExpire,
  className = ''
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = endTime.getTime();
      const difference = end - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
        setIsExpired(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
        onExpire?.();
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime, onExpire]);

  if (isExpired) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <Badge variant="destructive" className="text-lg px-4 py-2">
          <Timer className="h-4 w-4 mr-2" />
          Promoção Encerrada
        </Badge>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Clock className="h-5 w-5 text-red-500" />
      <div className="flex gap-1 text-lg font-bold">
        <div className="bg-red-500 text-white px-2 py-1 rounded text-sm">
          {timeLeft.days.toString().padStart(2, '0')}d
        </div>
        <div className="bg-red-500 text-white px-2 py-1 rounded text-sm">
          {timeLeft.hours.toString().padStart(2, '0')}h
        </div>
        <div className="bg-red-500 text-white px-2 py-1 rounded text-sm">
          {timeLeft.minutes.toString().padStart(2, '0')}m
        </div>
        <div className="bg-red-500 text-white px-2 py-1 rounded text-sm animate-pulse">
          {timeLeft.seconds.toString().padStart(2, '0')}s
        </div>
      </div>
    </div>
  );
};

interface FlashSaleCardProps {
  sale: FlashSale;
  onProductClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  className?: string;
}

export const FlashSaleCard: React.FC<FlashSaleCardProps> = ({
  sale,
  onProductClick,
  onAddToCart,
  className = ''
}) => {
  const [isExpired, setIsExpired] = useState(false);
  const progressPercentage = (sale.soldQuantity / sale.maxQuantity) * 100;

  const handleExpire = () => {
    setIsExpired(true);
  };

  return (
    <Card className={`relative overflow-hidden ${className} ${isExpired ? 'opacity-75' : ''}`}>
      {/* Background Banner */}
      {sale.bannerImage && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${sale.bannerImage})` }}
        />
      )}

      {/* Flash Sale Badge */}
      <div className="absolute top-4 left-4 z-10">
        <Badge className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-1">
          <Zap className="h-3 w-3" />
          OFERTA RELÂMPAGO
        </Badge>
      </div>

      {/* Discount Badge */}
      <div className="absolute top-4 right-4 z-10">
        <Badge variant="destructive" className="text-lg font-bold">
          -{sale.discountPercentage}%
        </Badge>
      </div>

      <CardHeader className="relative">
        <CardTitle className="text-xl font-bold text-center">
          {sale.title}
        </CardTitle>
        <p className="text-gray-600 dark:text-gray-300 text-center">
          {sale.description}
        </p>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* Countdown Timer */}
        <FlashSaleCountdown
          endTime={sale.endTime}
          onExpire={handleExpire}
          className="mb-4"
        />

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Vendido: {sale.soldQuantity}/{sale.maxQuantity}</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sale.products.slice(0, 4).map((product) => (
            <div
              key={product.id}
              className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onProductClick?.(product)}
            >
              {product.images?.[0] && (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-24 object-cover rounded mb-2"
                />
              )}
              <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                {product.name}
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-red-500 font-bold text-sm">
                  R$ {sale.salePrice.toFixed(2)}
                </span>
                <span className="text-gray-500 line-through text-xs">
                  R$ {sale.originalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            className="flex-1 bg-red-500 hover:bg-red-600"
            disabled={isExpired}
            onClick={() => onProductClick?.(sale.products[0])}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Comprar Agora
          </Button>
          <Button
            variant="outline"
            onClick={() => onAddToCart?.(sale.products[0])}
            disabled={isExpired}
          >
            Ver Todos
          </Button>
        </div>

        {/* Terms */}
        <p className="text-xs text-gray-500 text-center">
          Oferta válida enquanto durar o estoque. Preços sujeitos à alteração sem aviso prévio.
        </p>
      </CardContent>
    </Card>
  );
};

interface FlashSaleBannerProps {
  sale: FlashSale;
  onClick?: () => void;
  className?: string;
}

export const FlashSaleBanner: React.FC<FlashSaleBannerProps> = ({
  sale,
  onClick,
  className = ''
}) => {
  const [isExpired, setIsExpired] = useState(false);

  const handleExpire = () => {
    setIsExpired(true);
  };

  if (isExpired) {
    return null;
  }

  return (
    <div
      className={`bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg cursor-pointer hover:shadow-lg transition-shadow ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="h-8 w-8" />
          <div>
            <h3 className="font-bold text-lg">{sale.title}</h3>
            <p className="text-red-100">{sale.description}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-2xl font-bold">
                R$ {sale.salePrice.toFixed(2)}
              </span>
              <span className="line-through text-red-200">
                R$ {sale.originalPrice.toFixed(2)}
              </span>
              <Badge variant="secondary" className="bg-white text-red-600">
                -{sale.discountPercentage}%
              </Badge>
            </div>
          </div>
        </div>

        <div className="text-right">
          <FlashSaleCountdown
            endTime={sale.endTime}
            onExpire={handleExpire}
            className="mb-2"
          />
          <Button
            variant="secondary"
            className="bg-white text-red-600 hover:bg-red-50"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            Comprar Agora
          </Button>
        </div>
      </div>
    </div>
  );
};

// Mock data generator for development
export const generateMockFlashSales = (): FlashSale[] => {
  const now = new Date();
  const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now

  return [
    {
      id: 'flash_1',
      title: 'Oferta Relâmpago - Eletrônicos',
      description: 'Até 70% OFF em smartphones e acessórios!',
      products: [], // Would be populated with actual products
      discountPercentage: 70,
      originalPrice: 2999.99,
      salePrice: 899.99,
      startTime: now,
      endTime,
      maxQuantity: 50,
      soldQuantity: 23,
      isActive: true,
      bannerImage: '/flash-sale-electronics.jpg'
    },
    {
      id: 'flash_2',
      title: 'Moda com Desconto',
      description: 'Roupas e acessórios com até 50% OFF!',
      products: [], // Would be populated with actual products
      discountPercentage: 50,
      originalPrice: 199.99,
      salePrice: 99.99,
      startTime: now,
      endTime: new Date(now.getTime() + 4 * 60 * 60 * 1000), // 4 hours from now
      maxQuantity: 100,
      soldQuantity: 67,
      isActive: true,
      bannerImage: '/flash-sale-fashion.jpg'
    }
  ];
};