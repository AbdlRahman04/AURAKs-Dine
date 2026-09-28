import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  CheckCircle2,
  CircleAlert,
  CircleHelp,
  Clock3,
  RefreshCw,
  Timer,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import AdminSidebar from '@/components/admin/AdminSidebar';

type MonitoringData = {
  generatedAt: string;
  uptimeSeconds: number;
  windowMinutes: number;
  totals: {
    requests: number; errors: number; clientErrors: number; pageLoads: number;
    averageLatencyMs: number; p95LatencyMs: number; averagePageLoadMs: number;
  };
  traffic: { time: string; requests: number; errors: number; avgLatencyMs: number; pageLoads: number }[];
  endpoints: { endpoint: string; requests: number; errors: number; averageLatencyMs: number; p95LatencyMs: number }[];
  pages: { page: string; loads: number; averageLoadMs: number; p95LoadMs: number }[];
  incidents: { at: number; level: 'error' | 'warning'; source: 'api' | 'browser'; route: string; status?: number; message: string }[];
};

const PAGE_NAMES: Record<string, string> = {
  '/': 'Home', '/menu': 'Menu', '/login': 'Sign in', '/register': 'Create account',
  '/checkout': 'Checkout', '/orders': 'My orders', '/notifications': 'Notifications',
  '/favorites': 'Favorites', '/profile': 'Profile', '/feedback': 'Feedback',
  '/admin': 'Kitchen display', '/admin/menu': 'Menu management', '/admin/orders': 'Order management',
  '/admin/feedback': 'Feedback review', '/admin/users': 'User management',
  '/admin/analytics': 'Sales report', '/admin/monitoring': 'App health',
};

const AREA_NAMES: Record<string, string> = {
  health: 'App check', menu: 'Menu', orders: 'Orders', analytics: 'Sales report',
  auth: 'Sign in', profile: 'Profile', feedback: 'Feedback', favorites: 'Favorites',
  payments: 'Payments', 'payment-methods': 'Payments', users: 'User management',
};

function formatTime(value: string | number) {
  const options: Intl.DateTimeFormatOptions = typeof value === 'number'
    ? { dateStyle: 'medium', timeStyle: 'short' }
    : { hour: '2-digit', minute: '2-digit' };
  return new Intl.DateTimeFormat(undefined, options).format(new Date(value));
}

function formatDuration(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)} seconds`;
  return `${Math.round(value)} milliseconds`;
}

function getArea(endpoint: string) {
  const path = endpoint.replace(/^[A-Z]+\s+/, '').split('/').filter(Boolean);
  const parts = path[0] === 'api' ? path.slice(1) : path;
  if (parts[0] === 'admin' && parts[1]) return AREA_NAMES[parts[1]] ?? 'Admin tools';
  return AREA_NAMES[parts[0] ?? ''] ?? 'Other';
}

function getLocationName(location: string, source: 'api' | 'browser') {
  if (source === 'browser') return PAGE_NAMES[location] ?? 'App page';
  return getArea(location.replace(/^[A-Z]+\s+/, ''));
}

function Metric({ title, value, detail, icon: Icon, alert = false }: {
  title: string; value: string; detail: string; icon: typeof Activity; alert?: boolean;
}) {
  return (
    <Card className="admin-metric-card">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon aria-hidden="true" className={`h-4 w-4 ${alert ? 'text-destructive' : 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-semibold tabular-nums ${alert ? 'text-destructive' : ''}`}>{value}</div>
        <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

function Empty({ children }: { children: string }) {
  return <p className="py-8 text-center text-sm text-muted-foreground">{children}</p>;
}

export default function MonitoringPage() {
  const query = useQuery<MonitoringData>({
    queryKey: ['/api/observability'],
    queryFn: async () => {
      const response = await fetch('/api/observability', { credentials: 'include', cache: 'no-store' });
      if (!response.ok) throw new Error('We could not load app health. Please try again.');
      return response.json();
    },
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  const data = query.data;
  const now = Date.now();
  const hourAgo = now - (data?.windowMinutes ?? 60) * 60 * 1000;
  const dayAgo = now - 24 * 60 * 60 * 1000;
  const recentProblems = data?.incidents.filter((incident) => incident.at >= dayAgo) ?? [];
  const recentHourlyProblems = recentProblems.filter((incident) => incident.at >= hourAgo);
  const errorsFound = data ? data.totals.errors + data.totals.clientErrors : 0;
  const slowReplies = recentHourlyProblems.filter((incident) => incident.source === 'api' && incident.level === 'warning').length;
  const hasActivity = Boolean(data && (data.totals.requests > 0 || data.totals.pageLoads > 0));
  const status = !hasActivity
    ? { label: 'Waiting for activity', description: 'This page will fill in as people use the app.', kind: 'quiet' as const }
    : errorsFound > 0
      ? { label: 'Some problems need a look', description: `${errorsFound} problem${errorsFound === 1 ? '' : 's'} found in the past hour. See the list below for details.`, kind: 'error' as const }
      : slowReplies > 0
        ? { label: 'Some replies were slow', description: `${slowReplies} request${slowReplies === 1 ? '' : 's'} took more than one second in the past hour.`, kind: 'warning' as const }
        : { label: 'Looking good', description: 'No errors or slow replies found in the past hour.', kind: 'good' as const };

  const endpoints = [...(data?.endpoints ?? [])]
    .sort((a, b) => b.errors - a.errors || b.p95LatencyMs - a.p95LatencyMs)
    .slice(0, 10);

  return (
    <div className="admin-shell flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="admin-main min-w-0 flex-1 overflow-auto">
        <div className="admin-page-content space-y-6 p-4 sm:p-6">
          <header className="admin-page-header flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="admin-kicker">Operations</p>
              <h1 className="text-3xl font-semibold tracking-tight">App health</h1>
              <p className="mt-1 text-muted-foreground">A simple check on problems, speed, and the pages people use.</p>
            </div>
            <div className="flex items-center gap-3">
              {data && <span className="text-xs text-muted-foreground">Updated {formatTime(data.generatedAt)}</span>}
              <Button variant="outline" onClick={() => void query.refetch()} disabled={query.isFetching} aria-label="Update app health">
                <RefreshCw aria-hidden="true" className={`mr-2 h-4 w-4 ${query.isFetching ? 'animate-spin' : ''}`} />
                Update
              </Button>
            </div>
          </header>

          {query.isError && <div role="alert" className="flex flex-col gap-3 rounded-lg border border-destructive/40 p-4 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between"><span>{query.error instanceof Error ? query.error.message : 'App health is unavailable.'}</span><Button variant="outline" size="sm" onClick={() => void query.refetch()}>Try again</Button></div>}

          {query.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Loading app health">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-32 rounded-xl" />)}</div>
          ) : data && (
            <>
              <Card className={`admin-panel border-l-4 ${status.kind === 'error' ? 'border-l-destructive' : status.kind === 'warning' ? 'border-l-amber-500' : status.kind === 'good' ? 'border-l-emerald-600' : 'border-l-muted-foreground'}`} role="status" aria-live="polite">
                <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    {status.kind === 'error' ? <CircleAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-destructive" /> : status.kind === 'warning' ? <Clock3 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" /> : status.kind === 'good' ? <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" /> : <CircleHelp aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />}
                    <div><h2 className="font-semibold">{status.label}</h2><p className="mt-1 text-sm text-muted-foreground">{status.description}</p></div>
                  </div>
                  <Badge variant="secondary" className="w-fit">Past hour</Badge>
                </CardContent>
              </Card>

              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="App health summary">
                <Metric title="App activity" value={String(data.totals.requests)} detail="Times the app loaded or updated information in the past hour." icon={Activity} />
                <Metric title="Problems" value={String(errorsFound)} detail={`${data.totals.errors} failed app actions · ${data.totals.clientErrors} page errors`} icon={CircleAlert} alert={errorsFound > 0} />
                <Metric title="How fast it replies" value={data.totals.requests ? formatDuration(data.totals.averageLatencyMs) : 'No data yet'} detail={data.totals.requests ? `95 out of 100 replies finished within ${formatDuration(data.totals.p95LatencyMs)}.` : 'Shows after the app receives requests.'} icon={Timer} />
                <Metric title="Page load time" value={data.totals.pageLoads ? formatDuration(data.totals.averagePageLoadMs) : 'No data yet'} detail={`${data.totals.pageLoads} page visits seen in the past hour.`} icon={Clock3} />
              </section>

              <section className="grid gap-6 xl:grid-cols-2">
                <Card className="admin-panel min-w-0">
                  <CardHeader><CardTitle>App activity</CardTitle><CardDescription>How many requests came in every five minutes. Red marks failed requests.</CardDescription></CardHeader>
                  <CardContent className="h-[290px] px-2 sm:px-6">
                    {data.totals.requests ? <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.traffic} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" tickFormatter={(value: string) => formatTime(value)} minTickGap={24} />
                        <YAxis allowDecimals={false} />
                        <Tooltip labelFormatter={(value) => formatTime(String(value))} formatter={(value: number, name: string) => [value, name === 'Requests' ? 'Requests' : 'Failed requests']} />
                        <Area type="monotone" dataKey="requests" name="Requests" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.16)" />
                        <Area type="monotone" dataKey="errors" name="Failed requests" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive) / 0.12)" />
                      </AreaChart>
                    </ResponsiveContainer> : <Empty>There is no activity to chart yet. It will appear as people use the app.</Empty>}
                  </CardContent>
                </Card>

                <Card className="admin-panel min-w-0">
                  <CardHeader><CardTitle>Reply speed</CardTitle><CardDescription>Average time the app took to answer requests every five minutes.</CardDescription></CardHeader>
                  <CardContent className="h-[290px] px-2 sm:px-6">
                    {data.totals.requests ? <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.traffic} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" tickFormatter={(value: string) => formatTime(value)} minTickGap={24} />
                        <YAxis tickFormatter={(value: number) => value >= 1000 ? `${(value / 1000).toFixed(1)}s` : `${value}ms`} />
                        <Tooltip labelFormatter={(value) => formatTime(String(value))} formatter={(value: number) => [formatDuration(value), 'Average reply time']} />
                        <Area type="monotone" dataKey="avgLatencyMs" name="Average reply time" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.16)" />
                      </AreaChart>
                    </ResponsiveContainer> : <Empty>Reply speed will appear after the first request.</Empty>}
                  </CardContent>
                </Card>
              </section>

              <section className="grid gap-6 xl:grid-cols-2">
                <Card className="admin-panel min-w-0">
                  <CardHeader><CardTitle>Which parts need a look?</CardTitle><CardDescription>Areas with the most errors or the slowest replies are shown first.</CardDescription></CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto"><table className="w-full min-w-[500px] text-sm" aria-label="App areas and reply times">
                      <thead><tr className="border-b text-left text-muted-foreground"><th className="pb-3 pr-4 font-medium">Part of the app</th><th className="pb-3 pr-4 font-medium">Requests</th><th className="pb-3 pr-4 font-medium">Average reply</th><th className="pb-3 font-medium">Problems</th></tr></thead>
                      <tbody className="divide-y">{endpoints.map((row, index) => <tr key={`${row.endpoint}-${index}`}><td className="py-3 pr-4 font-medium">{getArea(row.endpoint)}</td><td className="py-3 pr-4 tabular-nums">{row.requests}</td><td className="py-3 pr-4 tabular-nums">{formatDuration(row.averageLatencyMs)}<span className="block text-xs text-muted-foreground">95% finished within {formatDuration(row.p95LatencyMs)}</span></td><td className="py-3 tabular-nums">{row.errors ? <Badge variant="destructive">{row.errors}</Badge> : '0'}</td></tr>)}{!endpoints.length && <tr><td colSpan={4}><Empty>Parts of the app will show here after they are used.</Empty></td></tr>}</tbody>
                    </table></div>
                  </CardContent>
                </Card>

                <Card className="admin-panel min-w-0">
                  <CardHeader><CardTitle>Page speed</CardTitle><CardDescription>Time to show pages, based on visits in the past hour.</CardDescription></CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto"><table className="w-full min-w-[480px] text-sm" aria-label="Page speed and visits">
                      <thead><tr className="border-b text-left text-muted-foreground"><th className="pb-3 pr-4 font-medium">Page</th><th className="pb-3 pr-4 font-medium">Visits</th><th className="pb-3 pr-4 font-medium">Average load</th><th className="pb-3 font-medium">Most loads finished within</th></tr></thead>
                      <tbody className="divide-y">{data.pages.map((row) => <tr key={row.page}><td className="py-3 pr-4 font-medium">{PAGE_NAMES[row.page] ?? 'App page'}</td><td className="py-3 pr-4 tabular-nums">{row.loads}</td><td className="py-3 pr-4 tabular-nums">{formatDuration(row.averageLoadMs)}</td><td className="py-3 tabular-nums">{formatDuration(row.p95LoadMs)}</td></tr>)}{!data.pages.length && <tr><td colSpan={4}><Empty>Page visits will show here as people browse.</Empty></td></tr>}</tbody>
                    </table></div>
                  </CardContent>
                </Card>
              </section>

              <Card className="admin-panel">
                <CardHeader><CardTitle className="flex items-center gap-2"><CircleAlert aria-hidden="true" className="h-4 w-4" />Recent problems</CardTitle><CardDescription>Errors and slow replies seen in the past 24 hours.</CardDescription></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto"><table className="w-full min-w-[600px] text-sm" aria-label="Recent app problems">
                    <thead><tr className="border-b text-left text-muted-foreground"><th className="pb-3 pr-4 font-medium">When</th><th className="pb-3 pr-4 font-medium">Type</th><th className="pb-3 pr-4 font-medium">Part of the app</th><th className="pb-3 font-medium">What happened</th></tr></thead>
                    <tbody className="divide-y">{recentProblems.map((row, index) => {
                      const isSlow = row.level === 'warning';
                      const type = row.source === 'browser' ? 'Page problem' : isSlow ? 'Slow reply' : 'Request failed';
                      const duration = row.message.match(/\((\d+) ms\)/)?.[1];
                      const description = row.source === 'browser'
                        ? 'A problem occurred while showing this page.'
                        : isSlow && duration
                          ? `The app took ${formatDuration(Number(duration))} to reply.`
                          : 'The app could not finish this request.';
                      return <tr key={`${row.at}-${index}`}><td className="whitespace-nowrap py-3 pr-4">{formatTime(row.at)}</td><td className="py-3 pr-4"><Badge variant={isSlow ? 'secondary' : 'destructive'}>{type}</Badge></td><td className="py-3 pr-4">{getLocationName(row.route, row.source)}</td><td className="py-3">{description}</td></tr>;
                    })}{!recentProblems.length && <tr><td colSpan={4}><Empty>No problems have been reported in the past 24 hours.</Empty></td></tr>}</tbody>
                  </table></div>
                </CardContent>
              </Card>

              <p className="flex items-start gap-2 text-xs text-muted-foreground"><CircleHelp aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />This page keeps information only while the app is running. It clears when the app restarts. Page visits are counted while people have the app open.</p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
