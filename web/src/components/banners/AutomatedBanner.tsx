import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  X,
  TrendingUp,
  Clock,
  Users,
  ShoppingBag,
  Zap,
  Star,
  Gift,
  Percent,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { log } from '../../utils/logger';

export interface BannerData {
  id: string;
  type: 'promotion' | 'announcement' | 'social_proof' | 'urgency' | 'seasonal' | 'personalized';
  title: string;
  message: string;
  ctaText: string;
  ctaUrl: string;
  backgroundColor: string;
  textColor: string;
  icon?: string;
  priority: number; // 1-10, higher = more important
  targetAudience?: {
    userSegments?: string[];
    deviceTypes?: ('mobile' | 'desktop' | 'tablet')[];
    locations?: string[];
  };
  schedule?: {
    startDate?: Date;
    endDate?: Date;
    daysOfWeek?: number[]; // 0-6, Sunday = 0
    timeRanges?: Array<{ start: string; end: string }>; // HH:MM format
  };
  performance?: {
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    conversionRate: number;
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    tags: string[];
  };
}

export interface BannerDisplayOptions {
  position: 'top' | 'bottom' | 'sidebar' | 'modal' | 'inline';
  size: 'small' | 'medium' | 'large' | 'full-width';
  animation: 'fade' | 'slide' | 'bounce' | 'none';
  autoRotate?: boolean;
  rotationInterval?: number; // in milliseconds
  maxBanners?: number;
  dismissible: boolean;
  showProgress?: boolean;
}

interface AutomatedBannerProps {
  banners: BannerData[];
  options: BannerDisplayOptions;
  userContext?: {
    userId?: string;
    segment?: string;
    deviceType?: 'mobile' | 'desktop' | 'tablet';
    location?: string;
    sessionTime?: number;
    cartValue?: number;
  };
  onBannerClick?: (banner: BannerData) => void;
  onBannerDismiss?: (banner: BannerData) => void;
  onBannerView?: (banner: BannerData) => void;
  className?: string;
}

/**
 * Automated Banner Component
 * Displays dynamic, personalized banners using NanoBanana-like logic
 */
export const AutomatedBanner: React.FC<AutomatedBannerProps> = ({
  banners,
  options,
  userContext,
  onBannerClick,
  onBannerDismiss,
  onBannerView,
  className = ''
}) => {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [visibleBanners, setVisibleBanners] = useState<BannerData[]>([]);
  const [dismissedBanners, setDismissedBanners] = useState<Set<string>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);

  // Filter and prioritize banners based on user context and schedule
  useEffect(() => {
    const filtered = banners
      .filter(banner => !dismissedBanners.has(banner.id))
      .filter(banner => isBannerEligible(banner, userContext))
      .sort((a, b) => b.priority - a.priority)
      .slice(0, options.maxBanners || 5);

    setVisibleBanners(filtered);
    setCurrentBannerIndex(0);
  }, [banners, userContext, dismissedBanners, options.maxBanners]);

  // Auto-rotate banners
  useEffect(() => {
    if (!options.autoRotate || visibleBanners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentBannerIndex(prev =>
        prev === visibleBanners.length - 1 ? 0 : prev + 1
      );
    }, options.rotationInterval || 5000);

    return () => clearInterval(interval);
  }, [options.autoRotate, options.rotationInterval, visibleBanners.length]);

  // Track banner views
  useEffect(() => {
    if (visibleBanners.length > 0 && onBannerView) {
      onBannerView(visibleBanners[currentBannerIndex]);
    }
  }, [currentBannerIndex, visibleBanners, onBannerView]);

  const isBannerEligible = (banner: BannerData, context?: typeof userContext): boolean => {
    if (!context || !banner.targetAudience) return true;

    // Check user segments
    if (banner.targetAudience.userSegments?.length &&
        !banner.targetAudience.userSegments.includes(context.segment || '')) {
      return false;
    }

    // Check device types
    if (banner.targetAudience.deviceTypes?.length &&
        !banner.targetAudience.deviceTypes.includes(context.deviceType || 'desktop')) {
      return false;
    }

    // Check locations
    if (banner.targetAudience.locations?.length &&
        !banner.targetAudience.locations.includes(context.location || '')) {
      return false;
    }

    // Check schedule
    if (banner.schedule) {
      const now = new Date();
      const currentDay = now.getDay();
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM

      // Check date range
      if (banner.schedule.startDate && now < banner.schedule.startDate) return false;
      if (banner.schedule.endDate && now > banner.schedule.endDate) return false;

      // Check days of week
      if (banner.schedule.daysOfWeek && !banner.schedule.daysOfWeek.includes(currentDay)) {
        return false;
      }

      // Check time ranges
      if (banner.schedule.timeRanges) {
        const inTimeRange = banner.schedule.timeRanges.some(range =>
          currentTime >= range.start && currentTime <= range.end
        );
        if (!inTimeRange) return false;
      }
    }

    return true;
  };

  const handleBannerClick = (banner: BannerData) => {
    log.info('Banner clicked', { bannerId: banner.id, type: banner.type });
    onBannerClick?.(banner);

    // Track click in banner performance
    banner.performance = banner.performance || { impressions: 0, clicks: 0, conversions: 0, ctr: 0, conversionRate: 0 };
    banner.performance.clicks++;
    banner.performance.ctr = (banner.performance.clicks / banner.performance.impressions) * 100;
  };

  const handleBannerDismiss = (banner: BannerData) => {
    log.info('Banner dismissed', { bannerId: banner.id });
    setDismissedBanners(prev => new Set(Array.from(prev).concat(banner.id)));
    onBannerDismiss?.(banner);
  };

  const nextBanner = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentBannerIndex(prev =>
      prev === visibleBanners.length - 1 ? 0 : prev + 1
    );
    setTimeout(() => setIsAnimating(false), 300);
  };

  const prevBanner = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentBannerIndex(prev =>
      prev === 0 ? visibleBanners.length - 1 : prev - 1
    );
    setTimeout(() => setIsAnimating(false), 300);
  };

  const getBannerIcon = (banner: BannerData) => {
    switch (banner.type) {
      case 'promotion':
        return <Percent className="h-5 w-5" />;
      case 'announcement':
        return <Zap className="h-5 w-5" />;
      case 'social_proof':
        return <Users className="h-5 w-5" />;
      case 'urgency':
        return <Clock className="h-5 w-5" />;
      case 'seasonal':
        return <Gift className="h-5 w-5" />;
      case 'personalized':
        return <Star className="h-5 w-5" />;
      default:
        return <TrendingUp className="h-5 w-5" />;
    }
  };

  const getSizeClasses = () => {
    switch (options.size) {
      case 'small':
        return 'p-3 text-sm';
      case 'large':
        return 'p-6 text-lg';
      case 'full-width':
        return 'p-4 w-full';
      default: // medium
        return 'p-4';
    }
  };

  const getPositionClasses = () => {
    switch (options.position) {
      case 'top':
        return 'fixed top-0 left-0 right-0 z-50';
      case 'bottom':
        return 'fixed bottom-0 left-0 right-0 z-50';
      case 'sidebar':
        return 'fixed right-4 top-1/2 transform -translate-y-1/2 z-40';
      case 'modal':
        return 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
      default: // inline
        return 'relative';
    }
  };

  const getAnimationClasses = () => {
    if (!isAnimating) return '';

    switch (options.animation) {
      case 'fade':
        return 'animate-fade-in';
      case 'slide':
        return 'animate-slide-in';
      case 'bounce':
        return 'animate-bounce-in';
      default:
        return '';
    }
  };

  if (visibleBanners.length === 0) {
    return null;
  }

  const currentBanner = visibleBanners[currentBannerIndex];

  return (
    <div className={`${getPositionClasses()} ${className}`}>
      <Card
        className={`${getSizeClasses()} ${getAnimationClasses()} shadow-lg border-0`}
        // eslint-disable-next-line react/forbid-component-props
        style={{
          backgroundColor: currentBanner.backgroundColor,
          color: currentBanner.textColor
        }}
      >
        <CardContent className="relative p-0">
          {/* Dismiss button */}
          {options.dismissible && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-black hover:bg-opacity-10"
              onClick={() => handleBannerDismiss(currentBanner)}
              // eslint-disable-next-line react/forbid-component-props
              style={{ color: currentBanner.textColor }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          <div className="flex items-center space-x-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              {getBannerIcon(currentBanner)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-sm truncate">
                  {currentBanner.title}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {currentBanner.type}
                </Badge>
              </div>
              <p className="text-sm opacity-90 mb-2 line-clamp-2">
                {currentBanner.message}
              </p>
              <Button
                size="sm"
                className="text-xs"
                onClick={() => handleBannerClick(currentBanner)}
                style={{
                  backgroundColor: currentBanner.textColor,
                  color: currentBanner.backgroundColor
                }}
              >
                {currentBanner.ctaText}
              </Button>
            </div>

            {/* Navigation for multiple banners */}
            {visibleBanners.length > 1 && (
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={prevBanner}
                  disabled={isAnimating}
                  style={{ color: currentBanner.textColor }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Progress indicators */}
                {options.showProgress && (
                  <div className="flex space-x-1">
                    {visibleBanners.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === currentBannerIndex
                            ? 'bg-current'
                            : 'bg-current opacity-30'
                        }`}
                        // eslint-disable-next-line react/forbid-component-props
                        style={{ color: currentBanner.textColor }}
                      />
                    ))}
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={nextBanner}
                  disabled={isAnimating}
                  // eslint-disable-next-line react/forbid-component-props
                  style={{ color: currentBanner.textColor }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Performance info (development only) */}
          {process.env.NODE_ENV === 'development' && currentBanner.performance && (
            <div className="mt-2 text-xs opacity-60">
              Views: {currentBanner.performance.impressions} |
              Clicks: {currentBanner.performance.clicks} |
              CTR: {currentBanner.performance.ctr.toFixed(1)}%
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Predefined banner templates
export const BANNER_TEMPLATES = {
  flashSale: (productName: string, discount: number, timeLeft: string): Omit<BannerData, 'id' | 'metadata'> => ({
    type: 'urgency',
    title: '⚡ Oferta Relâmpago!',
    message: `${discount}% OFF em ${productName}! Oferta termina em ${timeLeft}.`,
    ctaText: 'Comprar Agora',
    ctaUrl: `/product/${productName.toLowerCase().replace(/\s+/g, '-')}`,
    backgroundColor: '#ef4444',
    textColor: '#ffffff',
    priority: 9,
    schedule: {
      timeRanges: [{ start: '09:00', end: '21:00' }]
    }
  }),

  abandonedCart: (userName: string, items: number): Omit<BannerData, 'id' | 'metadata'> => ({
    type: 'personalized',
    title: `Oi ${userName}!`,
    message: `Você deixou ${items} item(s) no carrinho. Volte e finalize sua compra!`,
    ctaText: 'Continuar Comprando',
    ctaUrl: '/cart',
    backgroundColor: '#f59e0b',
    textColor: '#000000',
    priority: 8,
    targetAudience: {
      userSegments: ['abandoned_cart']
    }
  }),

  newArrival: (category: string): Omit<BannerData, 'id' | 'metadata'> => ({
    type: 'announcement',
    title: '✨ Novidades Chegaram!',
    message: `Confira nossa nova coleção de ${category}. Produtos exclusivos com até 30% OFF!`,
    ctaText: 'Ver Novidades',
    ctaUrl: `/category/${category.toLowerCase()}`,
    backgroundColor: '#10b981',
    textColor: '#ffffff',
    priority: 7,
    schedule: {
      daysOfWeek: [1, 2, 3, 4, 5] // Monday to Friday
    }
  }),

  socialProof: (productName: string, rating: number, reviews: number): Omit<BannerData, 'id' | 'metadata'> => ({
    type: 'social_proof',
    title: '⭐ Avaliação dos Clientes',
    message: `"${productName}" tem ${rating} estrelas de ${reviews} avaliações. Mais de 1000 pessoas já compraram!`,
    ctaText: 'Ver Avaliações',
    ctaUrl: `/product/${productName.toLowerCase().replace(/\s+/g, '-')}`,
    backgroundColor: '#6366f1',
    textColor: '#ffffff',
    priority: 6
  }),

  freeShipping: (minValue: number): Omit<BannerData, 'id' | 'metadata'> => ({
    type: 'promotion',
    title: '🚚 Frete Grátis!',
    message: `Compre R$ ${minValue.toFixed(2)} ou mais e ganhe frete grátis para todo o Brasil.`,
    ctaText: 'Ver Produtos',
    ctaUrl: '/products',
    backgroundColor: '#06b6d4',
    textColor: '#ffffff',
    priority: 5
  })
};