import React, { useState, useEffect, useCallback } from 'react';
import { FeedService } from '../../services/feedService';
import { FeedItem as FeedItemType } from '@/shared/types';
import { VirtualizedFeed } from './VirtualizedFeed';
import { log } from 'shared/utils/logger';

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

  const ITEMS_PER_LOAD = 20;

  // Load initial feed
  const loadFeed = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
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
    }
  }, [offset, userId]);

  // Handle pull to refresh
  const handleRefresh = useCallback(async () => {
    await loadFeed(true);
  }, [loadFeed]);

  // Load more handler for virtualized feed
  const handleLoadMore = useCallback(async () => {
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

      log.info('Feed loaded more (virtualized)', {
        itemCount: feedData.items.length,
        hasMore: feedData.hasMore
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load more items';
      setError(errorMessage);
      log.error('Failed to load more feed items (virtualized)', { error: err, offset, userId });
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, offset, userId]);

  // Initial load
  useEffect(() => {
    loadFeed();
  }, [loadFeed]); // Include loadFeed dependency

  return (
    <div className={className}>
      <VirtualizedFeed
        items={items}
        loading={loading}
        loadingMore={loadingMore}
        error={error}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        onRefresh={handleRefresh}
        itemHeight={320} // Estimated height for feed items
        containerHeight={window.innerHeight - 200} // Adjust based on header/footer
        className="w-full"
      />
    </div>
  );
};