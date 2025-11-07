import React from 'react';
import { Package, Truck, CheckCircle, XCircle, Clock, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Order } from '@/shared/types';
import { formatPrice } from '@/shared/utils/format';

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
  },
  paid: {
    label: 'Paid',
    color: 'bg-blue-100 text-blue-800',
    icon: CheckCircle,
  },
  shipped: {
    label: 'Shipped',
    color: 'bg-purple-100 text-purple-800',
    icon: Truck,
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
  },
};

interface OrderHistoryListProps {
  orders: Order[];
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

export const OrderHistoryList: React.FC<OrderHistoryListProps> = ({
  orders,
  hasMore,
  isLoading,
  onLoadMore,
}) => {
  const getStatusInfo = (status: Order['status']) => {
    return statusConfig[status] || statusConfig.pending;
  };

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No orders yet</h3>
          <p className="text-muted-foreground text-center mb-4">
            When you place your first order, it will appear here.
          </p>
          <Button asChild>
            <a href="/">Start Shopping</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => {
        const statusInfo = getStatusInfo(order.status);
        const StatusIcon = statusInfo.icon;

        return (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Order #{order.id.slice(-8)}</span>
                  </div>
                  <Badge className={statusInfo.color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusInfo.label}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{formatPrice(order.total)}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Order Items */}
                <div>
                  <h4 className="font-medium mb-2">Items</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <div className="flex-1">
                          <p className="font-medium">Product #{item.productId.slice(-8)}</p>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Shipping & Payment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Shipping</h4>
                    <p className="text-sm text-muted-foreground">{order.shipping.address}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.shipping.method} • {formatPrice(order.shipping.cost)}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Payment</h4>
                    <p className="text-sm text-muted-foreground capitalize">
                      {order.payment.method}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Status: {order.payment.status}
                    </p>
                  </div>
                </div>

                {/* Order Actions */}
                <div className="flex justify-end pt-4">
                  <Button variant="outline" size="sm">
                    View Details
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <Button
            onClick={onLoadMore}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? 'Loading...' : 'Load More Orders'}
          </Button>
        </div>
      )}
    </div>
  );
};