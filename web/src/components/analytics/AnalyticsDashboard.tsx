import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  RefreshCw,
  Download,
  Calendar
} from 'lucide-react';
import { AnalyticsService } from '@/shared/services/analytics';
import { log } from 'shared/utils/logger';

interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  totalOrders: number;
  conversionRate: number;
  averageOrderValue: number;
  pageViews: number;
  bounceRate: number;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
    views: number;
  }>;
  salesByCategory: Array<{
    category: string;
    sales: number;
    revenue: number;
  }>;
  userEngagement: Array<{
    date: string;
    users: number;
    sessions: number;
    pageViews: number;
  }>;
  feedInteractions: Array<{
    date: string;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  }>;
  realtimeMetrics: {
    activeUsers: number;
    currentOrders: number;
    todayRevenue: number;
    conversionRate: number;
  };
}

interface AnalyticsDashboardProps {
  className?: string;
  refreshInterval?: number; // in milliseconds
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  className = '',
  refreshInterval = 30000 // 30 seconds
}) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real implementation, this would call actual analytics APIs
      // For now, we'll simulate the data structure
      const mockData: DashboardMetrics = {
        totalUsers: 12543,
        activeUsers: 3241,
        totalRevenue: 456789.50,
        totalOrders: 1234,
        conversionRate: 3.2,
        averageOrderValue: 370.23,
        pageViews: 45678,
        bounceRate: 42.3,
        topProducts: [
          { id: '1', name: 'Wireless Headphones', sales: 234, revenue: 46800, views: 3456 },
          { id: '2', name: 'Smart Watch', sales: 189, revenue: 56700, views: 2890 },
          { id: '3', name: 'Bluetooth Speaker', sales: 156, revenue: 23400, views: 2341 },
          { id: '4', name: 'Gaming Mouse', sales: 134, revenue: 13400, views: 1987 },
          { id: '5', name: 'Mechanical Keyboard', sales: 98, revenue: 29400, views: 1654 }
        ],
        salesByCategory: [
          { category: 'Electronics', sales: 456, revenue: 136800 },
          { category: 'Accessories', sales: 323, revenue: 48450 },
          { category: 'Home & Garden', sales: 234, revenue: 35100 },
          { category: 'Sports', sales: 187, revenue: 28050 },
          { category: 'Books', sales: 34, revenue: 2380 }
        ],
        userEngagement: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          users: Math.floor(Math.random() * 500) + 200,
          sessions: Math.floor(Math.random() * 800) + 300,
          pageViews: Math.floor(Math.random() * 2000) + 1000
        })),
        feedInteractions: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          likes: Math.floor(Math.random() * 200) + 50,
          comments: Math.floor(Math.random() * 50) + 10,
          shares: Math.floor(Math.random() * 30) + 5,
          saves: Math.floor(Math.random() * 80) + 20
        })),
        realtimeMetrics: {
          activeUsers: Math.floor(Math.random() * 100) + 50,
          currentOrders: Math.floor(Math.random() * 10) + 2,
          todayRevenue: Math.floor(Math.random() * 5000) + 1000,
          conversionRate: Math.random() * 2 + 2
        }
      };

      setMetrics(mockData);
      setLastUpdated(new Date());

      // Track dashboard view
      AnalyticsService.trackCustomEvent('analytics_dashboard_view', {
        timeRange,
        timestamp: new Date().toISOString()
      });

    } catch (err) {
      log.error('Failed to load dashboard data', { error: err });
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  // Auto-refresh data
  useEffect(() => {
    loadDashboardData();

    const interval = setInterval(loadDashboardData, refreshInterval);
    return () => clearInterval(interval);
  }, [loadDashboardData, refreshInterval]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Format number
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading && !metrics) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Loading analytics data...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Monitor your business performance</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadDashboardData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your business performance • Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
              className="text-sm border rounded px-2 py-1"
              aria-label="Time range selection"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
          <Button variant="outline" size="sm" onClick={loadDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12.5%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.totalOrders)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8.2%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.activeUsers)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600 flex items-center">
                <TrendingDown className="h-3 w-3 mr-1" />
                -2.1%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(metrics.conversionRate)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +0.8%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Metrics</CardTitle>
          <CardDescription>Live data from the last 5 minutes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.realtimeMetrics.activeUsers}</div>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.realtimeMetrics.currentOrders}</div>
              <p className="text-sm text-muted-foreground">Current Orders</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{formatCurrency(metrics.realtimeMetrics.todayRevenue)}</div>
              <p className="text-sm text-muted-foreground">Today's Revenue</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{formatPercentage(metrics.realtimeMetrics.conversionRate)}</div>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
                <CardDescription>Daily active users and sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={metrics.userEngagement}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="users" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="sessions" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>Revenue distribution across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={metrics.salesByCategory}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {metrics.salesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>Best performing products by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={metrics.topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number, name: string) => [
                    name === 'revenue' ? formatCurrency(value) : value,
                    name === 'revenue' ? 'Revenue' : name === 'sales' ? 'Sales' : 'Views'
                  ]} />
                  <Bar dataKey="revenue" fill="#8884d8" />
                  <Bar dataKey="sales" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {metrics.topProducts.slice(0, 4).map((product, index) => (
              <Card key={product.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{product.name}</CardTitle>
                  <Badge variant="secondary">#{index + 1}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(product.revenue)}</div>
                  <p className="text-xs text-muted-foreground">
                    {product.sales} sales • {product.views} views
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Page Views & Engagement</CardTitle>
              <CardDescription>Website traffic and user engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatNumber(metrics.pageViews)}</div>
                  <p className="text-sm text-muted-foreground">Total Page Views</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatPercentage(metrics.bounceRate)}</div>
                  <p className="text-sm text-muted-foreground">Bounce Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatCurrency(metrics.averageOrderValue)}</div>
                  <p className="text-sm text-muted-foreground">Avg Order Value</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics.userEngagement}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="pageViews" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feed Interactions</CardTitle>
              <CardDescription>Social engagement on the product feed</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={metrics.feedInteractions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="likes" stackId="1" stroke="#ff7300" fill="#ff7300" />
                  <Area type="monotone" dataKey="comments" stackId="1" stroke="#00ff00" fill="#00ff00" />
                  <Area type="monotone" dataKey="shares" stackId="1" stroke="#0000ff" fill="#0000ff" />
                  <Area type="monotone" dataKey="saves" stackId="1" stroke="#ff00ff" fill="#ff00ff" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Likes</CardTitle>
                <Heart className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.feedInteractions.reduce((sum, day) => sum + day.likes, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Total interactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Comments</CardTitle>
                <MessageSquare className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.feedInteractions.reduce((sum, day) => sum + day.comments, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Total interactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Shares</CardTitle>
                <Share2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.feedInteractions.reduce((sum, day) => sum + day.shares, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Total interactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saves</CardTitle>
                <Eye className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.feedInteractions.reduce((sum, day) => sum + day.saves, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Total interactions</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};