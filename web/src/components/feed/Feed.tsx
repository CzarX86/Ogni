import React, { useState, useEffect, useCallback } from 'react';
import { FeedService } from '../../services/feedService';
import { FeedItem as FeedItemType } from '../../../../shared/types';
import { FeedItem } from './FeedItem';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { log } from '../../utils/logger';

interface FeedProps {
  userId?: string;
  className?: string;
}

export const Feed: React.FC<FeedProps> = ({ userId, className = '' }) => {
  const [items, setItems] = useState<FeedItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const ITEMS_PER_LOAD = 20;

  // Load initial feed
  const loadFeed = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
        setOffset(0);
      } else {
        setLoading(true);
      }
      setError(null);

      const feedData = await FeedService.getFeed({
        limit: ITEMS_PER_LOAD,
        offset: refresh ? 0 : offset,
        userId
      });

      if (refresh) {
        setItems(feedData.items);
      } else {
        setItems(prev => [...prev, ...feedData.items]);
      }

      setHasMore(feedData.hasMore);
      setOffset(prev => refresh ? feedData.items.length : prev + feedData.items.length);

      log.info('Feed loaded', {
        itemCount: feedData.items.length,
        hasMore: feedData.hasMore,
        algorithm: feedData.personalization.algorithm,
        refresh
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load feed';
      setError(errorMessage);
      log.error('Failed to load feed', { error: err, userId, refresh });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [offset, userId]);

  // Load more items for infinite scroll
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const feedData = await FeedService.getFeed({
        limit: ITEMS_PER_LOAD,
        offset,
        userId
      });

      setItems(prev => [...prev, ...feedData.items]);
      setHasMore(feedData.hasMore);
      setOffset(prev => prev + feedData.items.length);

      log.info('Feed loaded more', {
        itemCount: feedData.items.length,
        totalItems: items.length + feedData.items.length
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load more items';
      setError(errorMessage);
      log.error('Failed to load more feed items', { error: err, offset, userId });
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, offset, userId, items.length]);

  // Handle pull to refresh
  const handleRefresh = useCallback(async () => {
    await loadFeed(true);
  }, [loadFeed]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000 // Load more when 1000px from bottom
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  // Initial load
  useEffect(() => {
    loadFeed();
  }, []); // Only run once on mount

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
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
  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load feed</h3>
      <p className="text-gray-600 mb-4 text-center max-w-md">{error}</p>
      <Button onClick={() => loadFeed(true)} variant="outline">
        <RefreshCw className="h-4 w-4 mr-2" />
        Try Again
      </Button>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-6xl mb-4">🛍️</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
      <p className="text-gray-600 text-center max-w-md">
        We're working on adding more amazing products to your feed. Check back soon!
      </p>
    </div>
  );

  if (loading && items.length === 0) {
    return (
      <div className={className}>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className={className}>
        <ErrorState />
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
      {/* Refresh indicator */}
      {refreshing && (
        <div className="flex justify-center py-4">
          <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
        </div>
      )}

      {/* Feed items */}
      <div className="space-y-4">
        {items.map((item, index) => (
          <FeedItem
            key={`${item.product.id}-${index}`}
            item={item}
            onLike={() => {
              // This will be handled by the FeedItem component
              // We might want to refresh the item data here
            }}
            onComment={() => {
              // Handle comment action
            }}
            onShare={() => {
              // Handle share action
            }}
            onSave={() => {
              // Handle save to wishlist action
            }}
          />
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
            <Button onClick={loadMore} variant="outline" size="sm">
              Try Loading More
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};