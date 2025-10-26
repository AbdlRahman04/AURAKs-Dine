import { useQuery, useMutation } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Package, User, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency, formatTime } from '@/lib/utils';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Order, OrderItem } from '@shared/schema';
import AdminSidebar from '@/components/admin/AdminSidebar';

type OrderWithItems = Order & {
  items: OrderItem[];
};

const statusColors = {
  received: 'bg-blue-500',
  preparing: 'bg-yellow-500',
  ready: 'bg-green-500',
  completed: 'bg-gray-500',
  cancelled: 'bg-red-500',
};

const statusLabels = {
  received: 'Order Received',
  preparing: 'Preparing',
  ready: 'Ready for Pickup',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function KitchenDisplayPage() {
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Fetch all orders (admin users get all orders, students get their own)
  const { data: orders = [], isLoading } = useQuery<OrderWithItems[]>({
    queryKey: ['/api/orders'],
    refetchInterval: 5000, // Poll every 5 seconds for now (will be replaced with WebSocket)
  });

  // Setup WebSocket for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'ORDER_STATUS_UPDATE') {
          queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
          toast({
            title: 'Order Updated',
            description: `Order status changed`,
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    return () => ws.close();
  }, [toast]);

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const response = await apiRequest('PATCH', `/api/orders/${orderId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: 'Status Updated',
        description: 'Order status has been updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    },
  });

  const filteredOrders = orders.filter((order) => {
    if (selectedStatus === 'all') return order.status !== 'completed' && order.status !== 'cancelled';
    return order.status === selectedStatus;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    return new Date(a.pickupTime).getTime() - new Date(b.pickupTime).getTime();
  });

  const handleStatusUpdate = (orderId: number, newStatus: string) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Kitchen Display</h1>
            <p className="text-muted-foreground">Real-time order management</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 border-b pb-2">
            <Button
              variant={selectedStatus === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedStatus('all')}
              data-testid="filter-active"
            >
              Active Orders
            </Button>
            <Button
              variant={selectedStatus === 'received' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedStatus('received')}
              data-testid="filter-received"
            >
              Received
            </Button>
            <Button
              variant={selectedStatus === 'preparing' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedStatus('preparing')}
              data-testid="filter-preparing"
            >
              Preparing
            </Button>
            <Button
              variant={selectedStatus === 'ready' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedStatus('ready')}
              data-testid="filter-ready"
            >
              Ready
            </Button>
          </div>

          {/* Orders Grid */}
          {sortedOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">No active orders</p>
                <p className="text-sm text-muted-foreground">Orders will appear here in real-time</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedOrders.map((order) => (
                <Card key={order.id} className="overflow-hidden" data-testid={`order-card-${order.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          Pickup: {formatTime(new Date(order.pickupTime))}
                        </p>
                      </div>
                      <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                        {statusLabels[order.status as keyof typeof statusLabels]}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Order Items */}
                    <div className="space-y-2">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>
                            {item.quantity}x {item.menuItemName}
                          </span>
                          <span className="text-muted-foreground">{formatCurrency(parseFloat(item.subtotal))}</span>
                        </div>
                      ))}
                    </div>

                    {/* Special Instructions */}
                    {order.specialInstructions && (
                      <div className="flex gap-2 p-2 bg-muted rounded-md">
                        <AlertCircle className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <p className="text-sm">{order.specialInstructions}</p>
                      </div>
                    )}

                    {/* Total */}
                    <div className="flex justify-between pt-2 border-t font-medium">
                      <span>Total</span>
                      <span>{formatCurrency(parseFloat(order.total))}</span>
                    </div>

                    {/* Status Actions */}
                    <div className="flex gap-2">
                      {order.status === 'received' && (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleStatusUpdate(order.id, 'preparing')}
                          disabled={updateStatusMutation.isPending}
                          data-testid={`button-start-preparing-${order.id}`}
                        >
                          Start Preparing
                        </Button>
                      )}
                      {order.status === 'preparing' && (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleStatusUpdate(order.id, 'ready')}
                          disabled={updateStatusMutation.isPending}
                          data-testid={`button-mark-ready-${order.id}`}
                        >
                          Mark Ready
                        </Button>
                      )}
                      {order.status === 'ready' && (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleStatusUpdate(order.id, 'completed')}
                          disabled={updateStatusMutation.isPending}
                          data-testid={`button-complete-${order.id}`}
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
