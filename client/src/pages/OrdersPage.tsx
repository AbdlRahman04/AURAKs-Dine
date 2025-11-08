import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import type { OrderWithItems } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDateTime, getOrderStatusColor, getOrderStatusLabel } from '@/lib/utils';
import StudentHeader from '@/components/student/StudentHeader';
import Footer from '@/components/Footer';

export default function OrdersPage() {
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());

  const { data: orders, isLoading } = useQuery<OrderWithItems[]>({
    queryKey: ['/api/orders'],
  });

  const toggleOrderExpand = (orderId: number) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StudentHeader />
      <div className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Orders</h1>
          <p className="text-muted-foreground">
            Track your current and past orders
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => {
              const isExpanded = expandedOrders.has(order.id);

              return (
                <Card key={order.id} data-testid={`card-order-${order.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 mb-2">
                          <span className="font-mono">{order.orderNumber}</span>
                          <Badge className={getOrderStatusColor(order.status)}>
                            {getOrderStatusLabel(order.status)}
                          </Badge>
                        </CardTitle>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDateTime(order.pickupTime)}
                          </span>
                          <span>
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{formatCurrency(order.total)}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleOrderExpand(order.id)}
                          data-testid={`button-expand-${order.id}`}
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-1" />
                              Less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-1" />
                              More
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="border-t pt-4">
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>
                              <span className="font-medium">{item.quantity}x</span> {item.menuItemName}
                              {item.customizations && (
                                <span className="text-muted-foreground block text-xs ml-6">
                                  Note: {item.customizations}
                                </span>
                              )}
                            </span>
                            <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                          </div>
                        ))}
                      </div>

                      {order.specialInstructions && (
                        <div className="mt-4 p-3 bg-muted/50 rounded-md">
                          <p className="text-sm text-muted-foreground">
                            <strong>Special Instructions:</strong> {order.specialInstructions}
                          </p>
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span>{formatCurrency(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tax</span>
                          <span>{formatCurrency(order.tax)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Total</span>
                          <span>{formatCurrency(order.total)}</span>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-16">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6">
              Start ordering from the menu to see your orders here
            </p>
            <Button onClick={() => window.location.href = '/menu'} data-testid="button-browse-menu">
              Browse Menu
            </Button>
          </Card>
        )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
