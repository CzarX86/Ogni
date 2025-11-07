import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { FeedItem as FeedItemType } from '@/shared/types';
import { FeedItem } from './FeedItem';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { log } from 'shared/utils/logger';
import { useFeedPerformance } from '../../hooks/useFeedPerformance';
import './VirtualizedFeed.css';

interface VirtualizedFeedProps {
  items: FeedItemType[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  onLoadMore: () => void;
  onRefresh: () => void;
  itemHeight?: number; // Estimated height of each item
  containerHeight?: number; // Height of the scrollable container
  overscan?: number; // Number of items to render outside visible area
  className?: string;
}

interface VirtualItem {
  item: FeedItemType;
  index: number;
  style: React.CSSProperties;
}

// Loading skeleton component
const LoadingSkeleton: React.FC<{ containerHeight: number; itemHeight: number }> = ({ containerHeight, itemHeight }) => (
  <div className="space-y-4">
    {Array.from({ length: Math.ceil(containerHeight / itemHeight) }).map((_, i) => (
      <Card key={i} className="p-4">
        <div className="flex space-x-4">
          <Skeleton className="h-48 w-48 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
            <div className="flex space-x-2 mt-4">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </div>
      </Card>
    ))}
  </div>
);

// Error state component
const ErrorState: React.FC<{ error: string | null; onRefresh: () => void }> = ({ error, onRefresh }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load feed</h3>
    <p className="text-gray-600 mb-4 text-center max-w-md">{error}</p>
    <Button onClick={onRefresh} variant="outline">
      <RefreshCw className="h-4 w-4 mr-2" />
      Try Again
    </Button>
  </div>
);

// Empty state component
const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="text-6xl mb-4">🛍️</div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
    <p className="text-gray-600 text-center max-w-md">
      We're working on adding more amazing products to your feed. Check back soon!
    </p>
  </div>
);

export const VirtualizedFeed: React.FC<VirtualizedFeedProps> = ({
  items,
  loading,
  loadingMore,
  error,
  hasMore,
  onLoadMore,
  onRefresh: _onRefresh,
  itemHeight = 300, // Estimated height for feed items
  containerHeight = 800,
  overscan = 5,
  className = ''
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Performance tracking
  const {
    metrics,
    startRenderTracking,
    endRenderTracking,
    startScrollTracking,
    endScrollTracking,
    startLoadTracking,
    endLoadTracking,
  } = useFeedPerformance({ enabled: process.env.NODE_ENV === 'development' });

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight),
      items.length
    );

    return {
      start: Math.max(0, start - overscan),
      end: Math.min(items.length, end + overscan)
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  // Get visible items
  const visibleItems = useMemo((): VirtualItem[] => {
    const result: VirtualItem[] = [];

    for (let i = visibleRange.start; i < visibleRange.end; i++) {
      const item = items[i];
      if (item) {
        result.push({
          item,
          index: i,
          style: {
            position: 'absolute',
            top: i * itemHeight,
            width: '100%',
            height: itemHeight,
          }
        });
      }
    }

    return result;
  }, [items, visibleRange, itemHeight]);

  // Handle scroll with performance tracking
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    startScrollTracking();
    const scrollTop = event.currentTarget.scrollTop;
    setScrollTop(scrollTop);

    // Check if we need to load more items
    const { scrollHeight, clientHeight } = event.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 1000 && hasMore && !loadingMore) {
      onLoadMore();
    }

    // End scroll tracking
    const scrollDepth = (scrollTop / (scrollHeight - clientHeight)) * 100;
    endScrollTracking(scrollDepth);
  }, [hasMore, loadingMore, onLoadMore, startScrollTracking, endScrollTracking]);

  // Track render performance
  useEffect(() => {
    startRenderTracking();
    return () => endRenderTracking();
  }, [visibleItems.length, startRenderTracking, endRenderTracking]);

  // Track initial load
  useEffect(() => {
    if (items.length > 0 && !loading) {
      endLoadTracking();
    } else if (loading) {
      startLoadTracking();
    }
  }, [items.length, loading, startLoadTracking, endLoadTracking]);

  // Calculate total height
  const totalHeight = items.length * itemHeight;

  if (loading && items.length === 0) {
    return (
      <div className={className}>
        <LoadingSkeleton containerHeight={containerHeight} itemHeight={itemHeight} />
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className={className}>
        <ErrorState error={error} onRefresh={_onRefresh} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={className}>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Virtualized scroll container */}
      <div
        ref={scrollElementRef}
        className="virtualized-feed-container overflow-auto"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        {/* Total height placeholder */}
        <div
          className="virtualized-feed-content relative"
          style={{ height: totalHeight }}
        >
          {/* Render only visible items */}
          {visibleItems.map(({ item, index, style }) => (
            <div
              key={`${item.product.id}-${index}`}
              className="virtualized-feed-item absolute w-full"
              style={{
                top: style.top,
                height: style.height,
              }}
            >
              <FeedItem
                item={item}
                onLike={() => {
                  // This will be handled by the parent component
                  log.info('Feed item liked (virtualized)', { productId: item.product.id, index });
                }}
                onComment={() => {
                  log.info('Feed item comment clicked (virtualized)', { productId: item.product.id, index });
                }}
                onShare={() => {
                  log.info('Feed item shared (virtualized)', { productId: item.product.id, index });
                }}
                onSave={() => {
                  log.info('Feed item saved (virtualized)', { productId: item.product.id, index });
                }}
              />
            </div>
          ))}
        </div>

        {/* Loading more indicator */}
        {loadingMore && (
          <div className="flex justify-center py-8">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5 animate-spin text-gray-500" />
              <span className="text-gray-600">Loading more products...</span>
            </div>
          </div>
        )}

        {/* End of feed indicator */}
        {!hasMore && items.length > 0 && (
          <div className="flex justify-center py-8">
            <div className="text-center">
              <div className="text-4xl mb-2">🎉</div>
              <p className="text-gray-600">You've seen all products!</p>
              <p className="text-sm text-gray-500 mt-1">Check back later for new recommendations</p>
            </div>
          </div>
        )}

        {/* Error state for loading more */}
        {error && items.length > 0 && (
          <div className="flex justify-center py-4">
            <div className="text-center">
              <p className="text-red-600 mb-2">{error}</p>
              <Button onClick={onLoadMore} variant="outline" size="sm">
                Try Loading More
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Performance info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
          <div>Virtualized Feed: {visibleItems.length} of {items.length} items rendered</div>
          <div>Range: {visibleRange.start}-{visibleRange.end}</div>
          <div>Performance: Render {metrics.renderTime.toFixed(1)}ms, Load {metrics.loadTime.toFixed(1)}ms</div>
          {metrics.memoryUsage && <div>Memory: {(metrics.memoryUsage * 100).toFixed(1)}%</div>}
        </div>
      )}
    </div>
  );
};