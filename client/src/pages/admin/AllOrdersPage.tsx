import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Package, AlertCircle, Download, Eye, MapPin, UserRound } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency, formatTime } from '@/lib/utils';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { flattenOrderPages, useOrders } from '@/hooks/useOrders';
import { useOrderRealtime } from '@/hooks/useOrderRealtime';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { AdminPageSkeleton } from '@/components/admin/AdminPageSkeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { OrderWithItems } from '@shared/schema';

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]!);
}

function downloadReceipt(order: OrderWithItems) {
  const customerName = [order.customer?.firstName, order.customer?.lastName]
    .filter(Boolean)
    .join(' ') || 'Not provided';
  const pickupLocation = order.customer?.preferredPickupLocation || 'Not provided';
  const itemRows = order.items.map((item) => `
    <tr><td>${item.quantity} × ${escapeHtml(item.menuItemName)}</td><td>${escapeHtml(formatCurrency(item.subtotal))}</td></tr>
  `).join('');
  const receipt = `<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>Receipt ${escapeHtml(order.orderNumber)}</title>
<style>body{font:16px/1.5 Arial,sans-serif;color:#18212f;max-width:680px;margin:40px auto;padding:0 24px}h1{margin-bottom:4px}p{margin:4px 0;color:#485466}.meta{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:28px 0;padding:16px;background:#f4f6f8}table{width:100%;border-collapse:collapse}td{padding:12px 0;border-bottom:1px solid #dce1e7}td:last-child{text-align:right}.total{font-size:20px;font-weight:700;margin-top:18px;text-align:right}.note{margin-top:24px}@media print{body{margin:0 auto}}</style>
<h1>QuickDineFlow receipt</h1><p>Order ${escapeHtml(order.orderNumber)}</p>
<div class="meta"><div><strong>Customer</strong><p>${escapeHtml(customerName)}</p></div><div><strong>Pickup location</strong><p>${escapeHtml(pickupLocation)}</p></div><div><strong>Pickup time</strong><p>${escapeHtml(format(new Date(order.pickupTime), 'MMM dd, yyyy HH:mm'))}</p></div><div><strong>Status</strong><p>${escapeHtml(statusLabels[order.status as keyof typeof statusLabels] ?? order.status)}</p></div></div>
<table><tbody>${itemRows}</tbody></table>
<p class="note">Subtotal: ${escapeHtml(formatCurrency(order.subtotal))}<br>Tax: ${escapeHtml(formatCurrency(order.tax))}</p>
<p class="total">Total: ${escapeHtml(formatCurrency(order.total))}</p>
${order.specialInstructions ? `<p class="note"><strong>Special instructions:</strong> ${escapeHtml(order.specialInstructions)}</p>` : ''}
</html>`;
  const url = URL.createObjectURL(new Blob([receipt], { type: 'text/html;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `receipt-${order.orderNumber}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

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

export default function AllOrdersPage() {
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const { isConnected } = useOrderRealtime();

  // Fetch all orders (including completed and cancelled)
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useOrders({
    refetchInterval: isConnected ? false : 30_000,
  });
  const orders = flattenOrderPages(data);

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

  // Filter orders - ALL orders page shows everything including completed/cancelled
  const filteredOrders = orders.filter((order) => {
    if (selectedStatus === 'all') return true; // Show all orders
    return order.status === selectedStatus;
  });

  // Sort by pickup time (or created time if no pickup time)
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const timeA = new Date(a.pickupTime || a.createdAt || 0).getTime();
    const timeB = new Date(b.pickupTime || b.createdAt || 0).getTime();
    return timeB - timeA; // Most recent first
  });

  const handleStatusUpdate = (orderId: number, newStatus: string) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="admin-shell flex min-h-screen">
        <AdminSidebar />
        <div className="admin-main min-w-0 flex-1">
          <AdminPageSkeleton label="all orders" />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell flex min-h-screen bg-background">
      <AdminSidebar />
      
      <div className="admin-main flex-1 min-w-0 overflow-auto">
        <div className="admin-page-content p-6 space-y-6">
          {/* Header */}
          <div className="admin-page-header">
            <p className="admin-kicker">Order history</p>
            <h1 className="text-3xl font-bold">All Orders</h1>
            <p className="text-muted-foreground">Complete order history and management</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 border-b pb-2 flex-wrap">
            <Button
              variant={selectedStatus === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedStatus('all')}
              data-testid="filter-all"
            >
              All Orders
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
            <Button
              variant={selectedStatus === 'completed' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedStatus('completed')}
              data-testid="filter-completed"
            >
              Completed
            </Button>
            <Button
              variant={selectedStatus === 'cancelled' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedStatus('cancelled')}
              data-testid="filter-cancelled"
            >
              Cancelled
            </Button>
          </div>

          {/* Orders Grid */}
          {sortedOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">No orders found</p>
                <p className="text-sm text-muted-foreground">
                  {selectedStatus === 'all' 
                    ? 'No orders have been placed yet'
                    : `No orders with status "${statusLabels[selectedStatus as keyof typeof statusLabels]}"`}
                </p>
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
                        <p className="text-xs text-muted-foreground mt-1">
                          Created: {order.createdAt ? format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm') : '—'}
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

                    <Button variant="outline" size="sm" className="w-full" onClick={() => setSelectedOrder(order)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Order details
                    </Button>

                    {/* Status Actions - Only show for active orders */}
                    {order.status !== 'completed' && order.status !== 'cancelled' && (
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
                    )}

                    {/* Status info for completed/cancelled orders */}
                    {(order.status === 'completed' || order.status === 'cancelled') && (
                      <div className="text-xs text-muted-foreground pt-2 border-t">
                        {order.status === 'completed' 
                          ? 'This order has been completed'
                          : 'This order has been cancelled'}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {hasNextPage && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? 'Loading...' : 'Load older orders'}
            </Button>
          )}
        </div>
      </div>
      <Dialog open={selectedOrder !== null} onOpenChange={(open) => { if (!open) setSelectedOrder(null); }}>
        {selectedOrder && (
          <DialogContent className="admin-dialog admin-dialog-details admin-order-dialog max-w-2xl">
            <DialogHeader className="admin-dialog-header">
              <p className="admin-dialog-kicker">Order handoff</p>
              <DialogTitle className="admin-dialog-title">Order details</DialogTitle>
              <DialogDescription>Customer and pickup information for the delivery handoff.</DialogDescription>
            </DialogHeader>
            <div className="admin-order-reference">
              <span>Order number</span>
              <strong>{selectedOrder.orderNumber}</strong>
            </div>
            <section className="admin-order-meta" aria-label="Order handoff information">
              <div className="admin-order-meta-item">
                <UserRound aria-hidden="true" />
                <div><p>Customer</p><strong>{[selectedOrder.customer?.firstName, selectedOrder.customer?.lastName].filter(Boolean).join(' ') || 'Not provided'}</strong></div>
              </div>
              <div className="admin-order-meta-item">
                <MapPin aria-hidden="true" />
                <div><p>Pickup location</p><strong>{selectedOrder.customer?.preferredPickupLocation || 'Not provided'}</strong></div>
              </div>
              <div className="admin-order-meta-item">
                <Clock aria-hidden="true" />
                <div><p>Pickup time</p><strong>{format(new Date(selectedOrder.pickupTime), 'MMM dd, yyyy HH:mm')}</strong></div>
              </div>
              <div className="admin-order-meta-item">
                <Package aria-hidden="true" />
                <div><p>Status</p><strong className={`admin-order-status admin-order-status-${selectedOrder.status}`}>{statusLabels[selectedOrder.status as keyof typeof statusLabels] ?? selectedOrder.status}</strong></div>
              </div>
            </section>
            <section className="admin-order-items" aria-labelledby="admin-order-items-heading">
              <div className="admin-order-section-heading">
                <h3 id="admin-order-items-heading">Items</h3>
                <span>{selectedOrder.items.length} {selectedOrder.items.length === 1 ? 'item' : 'items'}</span>
              </div>
              {selectedOrder.items.map((item) => (
                <div key={item.id} className="admin-order-line">
                  <span><strong>{item.quantity} ×</strong> {item.menuItemName}</span><strong>{formatCurrency(item.subtotal)}</strong>
                </div>
              ))}
              <div className="admin-order-total"><span>Total</span><strong>{formatCurrency(selectedOrder.total)}</strong></div>
            </section>
            {selectedOrder.specialInstructions && <div className="admin-order-instructions"><span>Special instructions</span><p>{selectedOrder.specialInstructions}</p></div>}
            <Button className="admin-order-receipt" onClick={() => downloadReceipt(selectedOrder)}>
              <Download aria-hidden="true" className="mr-2 h-4 w-4" />
              Download receipt
            </Button>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
