import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowDownRight,
  ArrowUpRight,
  Clock3,
  Download,
  MessageSquareText,
  PackageCheck,
  ShoppingBag,
  Wallet,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { apiUrl } from '@/lib/queryClient';

type Summary = {
  sales: number;
  orderCount: number;
  averageOrderValue: number;
  cancelledOrders: number;
  cancellationRate: number;
  grossContribution: number | null;
  contributionMargin: number | null;
  costCoveragePercent: number | null;
  averageTurnaroundMinutes: number | null;
  completedOrders: number;
  unresolvedFeedback: number;
  averageFeedbackRating: number | null;
  paymentStatusBreakdown: { method: string; status: string; orders: number; sales: number }[];
  statusBreakdown: { status: string; count: number }[];
};

type AnalyticsReport = {
  period: { startDate: string; endDate: string; timeZone: string };
  comparisonPeriod: { startDate: string; endDate: string };
  summary: Summary;
  comparison: Record<string, { previous: number | null; changePercent: number | null }>;
  dailyStats: { date: string; orders: number; cancelledOrders: number; sales: number }[];
  hourlyStats: { hour: number; orders: number }[];
  itemPerformance: {
    itemName: string; quantity: number; sales: number; grossContribution: number | null;
    contributionMargin: number | null; costCoveragePercent: number | null;
  }[];
  orders: {
    orderNumber: string; createdAt: string | null; pickupTime: string; status: string;
    subtotal: number; tax: number; total: number; paymentMethod: string; paymentStatus: string;
  }[];
  orderItems: {
    orderNumber: string; orderDate: string | null; orderStatus: string; itemName: string;
    quantity: number; unitPrice: number; lineSales: number; unitCost: number | null;
    grossContribution: number | null; selectedSize: string | null;
  }[];
  paymentStatus: { method: string; status: string; orders: number; sales: number }[];
  turnaround: { orderNumber: string; createdAt: string; readyAt: string; minutes: number }[];
  feedback: { feedbackId: number; orderId: number | null; category: string; rating: number | null; status: string; createdAt: string | null }[];
};

const REPORTING_TIME_ZONE = 'Asia/Dubai';

function dubaiToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: REPORTING_TIME_ZONE }).format(new Date());
}

function shiftDate(date: string, amount: number) {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + amount);
  return next.toISOString().slice(0, 10);
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-AE', {
    timeZone: REPORTING_TIME_ZONE,
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function Change({ value }: { value: number | null | undefined }) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return <span className="text-xs text-muted-foreground">No prior baseline</span>;
  }
  const up = value >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      <span>{up ? 'Increased' : 'Decreased'} {Math.abs(value).toFixed(1)}% vs previous period</span>
    </span>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string;
  detail: React.ReactNode;
  icon: typeof Wallet;
  accent?: boolean;
}) {
  return (
    <Card className={`admin-metric-card ${accent ? 'admin-metric-card-accent' : ''}`}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
        <div className="mt-2 min-h-5">{detail}</div>
      </CardContent>
    </Card>
  );
}

function Table({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm" aria-label={label}>
        {children}
      </table>
    </div>
  );
}

function EmptyRow({ columns, message }: { columns: number; message: string }) {
  return <tr><td colSpan={columns} className="py-8 text-center text-muted-foreground">{message}</td></tr>;
}

export default function AnalyticsPage() {
  const today = useMemo(dubaiToday, []);
  const [endDate, setEndDate] = useState(today);
  const [startDate, setStartDate] = useState(shiftDate(today, -6));
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const rangeIsValid = startDate <= endDate;
  const queryKey = ['/api/analytics', startDate, endDate];
  const { data, isLoading, isError, error, refetch } = useQuery<AnalyticsReport>({
    queryKey,
    enabled: rangeIsValid,
    queryFn: async () => {
      const params = new URLSearchParams({ startDate, endDate });
      const response = await fetch(apiUrl(`/api/analytics?${params}`), { credentials: 'include' });
      if (!response.ok) throw new Error('Could not load analytics for the selected dates.');
      return response.json();
    },
  });

  const exportReport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({ startDate, endDate });
      const response = await fetch(apiUrl(`/api/analytics/export?${params}`), { credentials: 'include' });
      if (!response.ok) throw new Error('The report could not be exported. Please try again.');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `quickdine-analytics-${startDate}-to-${endDate}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast({ title: 'Report downloaded', description: 'The workbook includes the filtered summary and all matching detail rows.' });
    } catch (downloadError) {
      toast({
        title: 'Export failed',
        description: downloadError instanceof Error ? downloadError.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const setPreset = (days: number) => {
    const latest = dubaiToday();
    setEndDate(latest);
    setStartDate(shiftDate(latest, -(days - 1)));
  };

  const changeFor = (key: string) => data?.comparison[key]?.changePercent ?? null;

  return (
    <div className="admin-shell flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="admin-main min-w-0 flex-1 overflow-auto">
        <div className="admin-page-content space-y-6 p-4 sm:p-6">
          <header className="admin-page-header flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="admin-kicker">Sales & operations</p>
              <h1 className="text-3xl font-semibold tracking-tight">Analytics dashboard</h1>
              <p className="mt-1 text-muted-foreground">A practical view of demand, menu performance, service, and customer feedback.</p>
            </div>
            <div className="admin-page-actions flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex flex-wrap gap-2" aria-label="Common date ranges">
                <Button type="button" variant="outline" size="sm" onClick={() => setPreset(1)}>Today</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setPreset(7)}>7 days</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setPreset(30)}>30 days</Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="space-y-1 text-xs font-medium text-muted-foreground">
                  From
                  <Input aria-label="Report start date" type="date" value={startDate} max={endDate} onChange={(event) => setStartDate(event.target.value)} className="h-10" />
                </label>
                <label className="space-y-1 text-xs font-medium text-muted-foreground">
                  To
                  <Input aria-label="Report end date" type="date" value={endDate} min={startDate} max={today} onChange={(event) => setEndDate(event.target.value)} className="h-10" />
                </label>
              </div>
              <Button type="button" onClick={exportReport} disabled={!rangeIsValid || exporting} className="h-10">
                <Download aria-hidden="true" className="mr-2 h-4 w-4" />
                {exporting ? 'Preparing workbook…' : 'Export full report'}
              </Button>
            </div>
          </header>

          {!rangeIsValid && <p role="alert" className="text-sm text-destructive">Start date must be on or before end date.</p>}
          {isError && <div role="alert" className="flex flex-col gap-3 rounded-lg border border-destructive/40 p-4 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between"><span>{error instanceof Error ? error.message : 'Analytics could not be loaded.'}</span><Button type="button" variant="outline" size="sm" onClick={() => refetch()}>Retry</Button></div>}

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Loading analytics">
              {Array.from({ length: 8 }, (_, index) => <Skeleton key={index} className="h-32 rounded-xl" />)}
            </div>
          ) : data && (
            <>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">{data.period.startDate} – {data.period.endDate}</Badge>
                <span>Compared with {data.comparisonPeriod.startDate} – {data.comparisonPeriod.endDate}</span>
                <span>· {data.period.timeZone}</span>
              </div>

              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Key performance indicators">
                <MetricCard label="Sales" value={formatCurrency(data.summary.sales)} detail={<Change value={changeFor('sales')} />} icon={Wallet} accent />
                <MetricCard label="Orders" value={String(data.summary.orderCount)} detail={<Change value={changeFor('orderCount')} />} icon={ShoppingBag} />
                <MetricCard label="Average order value" value={formatCurrency(data.summary.averageOrderValue)} detail={<Change value={changeFor('averageOrderValue')} />} icon={Wallet} />
                <MetricCard label="Cancellations" value={`${data.summary.cancelledOrders} · ${data.summary.cancellationRate.toFixed(1)}%`} detail={<Change value={changeFor('cancelledOrders')} />} icon={PackageCheck} />
                <MetricCard label="Gross contribution" value={data.summary.grossContribution === null ? '—' : formatCurrency(data.summary.grossContribution)} detail={<div className="space-y-1"><Change value={changeFor('grossContribution')} /><p className="text-xs text-muted-foreground">{data.summary.contributionMargin === null ? 'Cost coverage incomplete' : `${data.summary.contributionMargin.toFixed(1)}% margin`} · {data.summary.costCoveragePercent?.toFixed(0) ?? '0'}% cost coverage</p></div>} icon={Wallet} />
                <MetricCard label="Avg. time to ready" value={data.summary.averageTurnaroundMinutes === null ? '—' : `${data.summary.averageTurnaroundMinutes.toFixed(0)} min`} detail={<div className="space-y-1"><Change value={changeFor('averageTurnaroundMinutes')} /><p className="text-xs text-muted-foreground">Based on recorded ready status changes</p></div>} icon={Clock3} />
                <MetricCard label="Feedback rating" value={data.summary.averageFeedbackRating === null ? '—' : `${data.summary.averageFeedbackRating.toFixed(1)} / 5`} detail={<div className="space-y-1"><Change value={changeFor('averageFeedbackRating')} /><p className="text-xs text-muted-foreground">{data.summary.unresolvedFeedback} unresolved feedback items</p></div>} icon={MessageSquareText} />
                <MetricCard label="Completed orders" value={String(data.summary.completedOrders)} detail={<div className="space-y-1"><Change value={changeFor('completedOrders')} /><p className="text-xs text-muted-foreground">Payment status is reported separately</p></div>} icon={PackageCheck} />
              </section>

              <section className="grid gap-6 xl:grid-cols-2">
                <Card className="admin-panel min-w-0">
                  <CardHeader>
                    <CardTitle>Sales by day</CardTitle>
                    <CardDescription>Cancelled orders are excluded from sales and shown separately above.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px] px-2 sm:px-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.dailyStats} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(date: string) => date.slice(5)} minTickGap={20} />
                        <YAxis />
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          labelFormatter={(date) => date}
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--card-border))', borderRadius: '0.75rem', boxShadow: '0 14px 32px hsl(0 0% 0% / 0.28)', padding: '0.7rem 0.85rem' }}
                          labelStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem', marginBottom: '0.3rem' }}
                          itemStyle={{ color: 'hsl(var(--foreground))', fontSize: '0.875rem', fontWeight: 600 }}
                          cursor={{ stroke: 'hsl(var(--primary) / 0.55)', strokeDasharray: '4 4' }}
                        />
                        <Line type="monotone" dataKey="sales" name="Sales (AED)" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--card))', strokeWidth: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="admin-panel min-w-0">
                  <CardHeader>
                    <CardTitle>Demand by hour</CardTitle>
                    <CardDescription>All 24 hours are shown to reveal quiet periods as well as peaks.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px] px-2 sm:px-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.hourlyStats} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" tickFormatter={(hour: number) => `${hour}:00`} interval={2} />
                        <YAxis allowDecimals={false} />
                        <Tooltip
                          labelFormatter={(hour) => `${hour}:00`}
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--card-border))', borderRadius: '0.75rem', boxShadow: '0 14px 32px hsl(0 0% 0% / 0.28)', padding: '0.7rem 0.85rem' }}
                          labelStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem', marginBottom: '0.3rem' }}
                          itemStyle={{ color: 'hsl(var(--foreground))', fontSize: '0.875rem', fontWeight: 600 }}
                          cursor={{ fill: 'hsl(var(--primary) / 0.08)' }}
                        />
                        <Bar dataKey="orders" name="Orders" fill="hsl(var(--primary))" activeBar={{ fill: 'hsl(20 92% 68%)' }} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </section>

              <section className="grid gap-6 xl:grid-cols-2">
                <Card className="admin-panel min-w-0">
                  <CardHeader>
                    <CardTitle>Menu item performance</CardTitle>
                    <CardDescription>All non-cancelled sales in the selected period; contribution is blank when cost data is incomplete.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table label="Menu item performance">
                      <thead><tr className="border-b text-left text-muted-foreground"><th className="pb-3 pr-4 font-medium">Item</th><th className="pb-3 pr-4 font-medium">Qty</th><th className="pb-3 pr-4 font-medium">Sales</th><th className="pb-3 pr-4 font-medium">Contribution</th><th className="pb-3 font-medium">Margin</th></tr></thead>
                      <tbody className="divide-y">
                        {data.itemPerformance.map((item) => <tr key={item.itemName}><td className="py-3 pr-4 font-medium">{item.itemName}</td><td className="py-3 pr-4 tabular-nums">{item.quantity}</td><td className="py-3 pr-4 tabular-nums">{formatCurrency(item.sales)}</td><td className="py-3 pr-4 tabular-nums">{item.grossContribution === null ? '—' : formatCurrency(item.grossContribution)}</td><td className="py-3 tabular-nums">{item.contributionMargin === null ? '—' : `${item.contributionMargin.toFixed(1)}%`}</td></tr>)}
                        {!data.itemPerformance.length && <EmptyRow columns={5} message="No item sales in this period." />}
                      </tbody>
                    </Table>
                  </CardContent>
                </Card>

                <Card className="admin-panel min-w-0">
                  <CardHeader>
                    <CardTitle>Payments and order status</CardTitle>
                    <CardDescription>Sales reflect order subtotal. Payment state comes from the stored payment status.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <h3 className="mb-3 text-sm font-medium">Payment method · status</h3>
                      <Table label="Payment method and status breakdown">
                        <thead><tr className="border-b text-left text-muted-foreground"><th className="pb-2 pr-3 font-medium">Method</th><th className="pb-2 pr-3 font-medium">Status</th><th className="pb-2 font-medium">Orders</th></tr></thead>
                        <tbody className="divide-y">{data.paymentStatus.map((row) => <tr key={`${row.method}-${row.status}`}><td className="py-2 pr-3 capitalize">{row.method}</td><td className="py-2 pr-3 capitalize">{row.status}</td><td className="py-2 tabular-nums">{row.orders}</td></tr>)}{!data.paymentStatus.length && <EmptyRow columns={3} message="No payment records." />}</tbody>
                      </Table>
                    </div>
                    <div>
                      <h3 className="mb-3 text-sm font-medium">Order status</h3>
                      <div className="space-y-2">{data.summary.statusBreakdown.map((row) => <div key={row.status} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm"><span className="capitalize">{row.status}</span><Badge variant="secondary">{row.count}</Badge></div>)}{!data.summary.statusBreakdown.length && <p className="py-4 text-sm text-muted-foreground">No orders in this period.</p>}</div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section className="grid gap-6 xl:grid-cols-2">
                <Card className="admin-panel min-w-0">
                  <CardHeader>
                    <CardTitle>Recent turnaround records</CardTitle>
                    <CardDescription>Time from order creation to first recorded ready or completed status.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table label="Order turnaround records">
                      <thead><tr className="border-b text-left text-muted-foreground"><th className="pb-3 pr-4 font-medium">Order</th><th className="pb-3 pr-4 font-medium">Created</th><th className="pb-3 pr-4 font-medium">Ready</th><th className="pb-3 font-medium">Minutes</th></tr></thead>
                      <tbody className="divide-y">{data.turnaround.slice(0, 10).map((row) => <tr key={row.orderNumber}><td className="py-3 pr-4 font-medium">{row.orderNumber}</td><td className="py-3 pr-4">{formatDateTime(row.createdAt)}</td><td className="py-3 pr-4">{formatDateTime(row.readyAt)}</td><td className="py-3 tabular-nums">{row.minutes.toFixed(0)}</td></tr>)}{!data.turnaround.length && <EmptyRow columns={4} message="No completed timing records for this period." />}</tbody>
                    </Table>
                  </CardContent>
                </Card>

                <Card className="admin-panel min-w-0">
                  <CardHeader>
                    <CardTitle>Feedback signals</CardTitle>
                    <CardDescription>Recent ratings and categories; written comments remain in feedback management.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table label="Feedback category and rating records">
                      <thead><tr className="border-b text-left text-muted-foreground"><th className="pb-3 pr-4 font-medium">Date</th><th className="pb-3 pr-4 font-medium">Category</th><th className="pb-3 pr-4 font-medium">Rating</th><th className="pb-3 font-medium">Status</th></tr></thead>
                      <tbody className="divide-y">{data.feedback.slice(0, 10).map((row) => <tr key={row.feedbackId}><td className="py-3 pr-4">{formatDateTime(row.createdAt)}</td><td className="py-3 pr-4">{row.category.replaceAll('_', ' ')}</td><td className="py-3 pr-4 tabular-nums">{row.rating === null ? '—' : `${row.rating} / 5`}</td><td className="py-3 capitalize">{row.status}</td></tr>)}{!data.feedback.length && <EmptyRow columns={4} message="No feedback records in this period." />}</tbody>
                    </Table>
                  </CardContent>
                </Card>
              </section>
              <p className="text-xs text-muted-foreground">Gross contribution excludes labor, overhead, and payment fees. The workbook contains all filtered records, including rows beyond the dashboard preview.</p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
