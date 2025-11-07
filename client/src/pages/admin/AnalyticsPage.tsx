import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Clock,
  Download,
  Calendar,
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import AdminSidebar from '@/components/admin/AdminSidebar';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface DailyStats {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

interface PopularItem {
  name: string;
  quantity: number;
  revenue: number;
}

interface HourlyStats {
  hour: string;
  orders: number;
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<'7days' | '30days' | 'today'>('7days');

  // Fetch analytics data
  const { data: analytics, isLoading } = useQuery<{
    dailyStats: DailyStats[];
    popularItems: PopularItem[];
    hourlyStats: HourlyStats[];
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
  }>({
    queryKey: ['/api/analytics', dateRange],
    queryFn: async () => {
      // For now, return mock data
      // TODO: Replace with actual API call when backend endpoint is ready
      return {
        dailyStats: Array.from({ length: 7 }, (_, i) => ({
          date: format(subDays(new Date(), 6 - i), 'MMM dd'),
          totalOrders: Math.floor(Math.random() * 50) + 20,
          totalRevenue: Math.random() * 1000 + 500,
          averageOrderValue: Math.random() * 30 + 20,
        })),
        popularItems: [
          { name: 'Chicken Shawarma', quantity: 45, revenue: 450 },
          { name: 'Arabic Coffee', quantity: 38, revenue: 114 },
          { name: 'Falafel Wrap', quantity: 32, revenue: 256 },
          { name: 'Hummus Bowl', quantity: 28, revenue: 224 },
          { name: 'Baklava', quantity: 25, revenue: 125 },
        ],
        hourlyStats: [
          { hour: '8 AM', orders: 5 },
          { hour: '9 AM', orders: 12 },
          { hour: '10 AM', orders: 18 },
          { hour: '11 AM', orders: 25 },
          { hour: '12 PM', orders: 45 },
          { hour: '1 PM', orders: 52 },
          { hour: '2 PM', orders: 38 },
          { hour: '3 PM', orders: 22 },
          { hour: '4 PM', orders: 15 },
          { hour: '5 PM', orders: 8 },
        ],
        totalRevenue: 5420.50,
        totalOrders: 245,
        averageOrderValue: 22.12,
      };
    },
  });

  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((row) => Object.values(row).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics...</p>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
              <p className="text-muted-foreground">
                Track performance and gain insights
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
                <SelectTrigger className="w-40" data-testid="select-date-range">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="metric-total-revenue">
                  {formatCurrency(analytics?.totalRevenue || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12.5% from last period
                  </Badge>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="metric-total-orders">
                  {analytics?.totalOrders || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +8.2% from last period
                  </Badge>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="metric-avg-order">
                  {formatCurrency(analytics?.averageOrderValue || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +4.1% from last period
                  </Badge>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Chart */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Revenue Over Time</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Daily revenue trends
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToCSV(analytics?.dailyStats || [], 'daily_revenue')}
                data-testid="button-export-revenue"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics?.dailyStats || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="font-medium">{payload[0].payload.date}</p>
                            <p className="text-sm text-muted-foreground">
                              Revenue: {formatCurrency(payload[0].value as number)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalRevenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Revenue (AED)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Popular Items */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Popular Items</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Top selling menu items
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToCSV(analytics?.popularItems || [], 'popular_items')}
                  data-testid="button-export-popular"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.popularItems.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} orders
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(item.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Peak Hours */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Peak Hours</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Order volume by hour
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToCSV(analytics?.hourlyStats || [], 'peak_hours')}
                  data-testid="button-export-hours"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics?.hourlyStats || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-background border rounded-lg p-3 shadow-lg">
                              <p className="font-medium">{payload[0].payload.hour}</p>
                              <p className="text-sm text-muted-foreground">
                                Orders: {payload[0].value}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="orders" fill="hsl(var(--primary))" name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Order Trends */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Order Trends</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Daily order volume
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToCSV(analytics?.dailyStats || [], 'order_trends')}
                data-testid="button-export-trends"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics?.dailyStats || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="font-medium">{payload[0].payload.date}</p>
                            <p className="text-sm text-muted-foreground">
                              Orders: {payload[0].value}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="totalOrders"
                    fill="hsl(var(--primary))"
                    name="Total Orders"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
