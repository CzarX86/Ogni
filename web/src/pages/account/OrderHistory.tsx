import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { UserService } from '../../services/userService';
import { Order } from '@/shared/types';
import { MainLayout } from '@/components/shared/MainLayout';
import { OrderHistoryList } from '../../components/account/OrderHistoryList';
import { ProfileAnalyticsService } from '../../analytics/profileEvents';

export const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 10;

  const loadOrders = useCallback(async (loadMore = false) => {
    try {
      setIsLoading(true);
      const currentOffset = loadMore ? offset : 0;
      const newOrders = await UserService.getUserOrders(limit, currentOffset);

      if (loadMore) {
        setOrders(prev => [...prev, ...newOrders]);
        setOffset(currentOffset + limit);
      } else {
        setOrders(newOrders);
        setOffset(limit);
      }

      setHasMore(newOrders.length === limit);

      // Track order history view with order count
      if (!loadMore && newOrders.length > 0) {
        ProfileAnalyticsService.trackOrderHistoryView(
          'user_' + Date.now(), // In a real app, get from context
          'session_' + Date.now(), // In a real app, get from context
          newOrders.length
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }, [offset, limit]);

  useEffect(() => {
    loadOrders();

    // Track order history page view
    ProfileAnalyticsService.trackProfilePageView(
      'user_' + Date.now(), // In a real app, get from context
      'session_' + Date.now(), // In a real app, get from context
      'order_history'
    );
  }, [loadOrders]);

  const loadMoreOrders = () => {
    loadOrders(true);
  };

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Order History</h1>
            <p className="text-muted-foreground mt-2">
              Track your orders and view purchase history
            </p>
          </div>

          <OrderHistoryList
            orders={orders}
            hasMore={hasMore}
            isLoading={isLoading}
            onLoadMore={loadMoreOrders}
          />
        </div>
      </div>
    </MainLayout>
  );
};