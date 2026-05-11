import { useState, useEffect } from 'react';
import { TrendingUp, IndianRupee, Trophy, Lightbulb, Package, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  getTodaySales,
  getThisMonthSales,
  getTopSellingProduct,
  getLowStockItems,
  generateInsights,
  getInvoices,
  getInventory,
} from '@/lib/store';

export const Analytics = () => {
  const [todaySales, setTodaySales] = useState(0);
  const [monthSales, setMonthSales] = useState(0);
  const [topProduct, setTopProduct] = useState<{ name: string; quantity: number } | null>(null);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [insights, setInsights] = useState<string[]>([]);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [inventoryValue, setInventoryValue] = useState(0);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = () => {
    setTodaySales(getTodaySales());
    setMonthSales(getThisMonthSales());
    setTopProduct(getTopSellingProduct());
    setLowStockCount(getLowStockItems().length);
    setInsights(generateInsights());
    setInvoiceCount(getInvoices().length);
    
    const inventory = getInventory();
    setInventoryValue(inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0));
  };

  const statCards = [
    {
      title: "Today's Sales",
      value: `₹${todaySales.toLocaleString()}`,
      icon: IndianRupee,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: "This Month",
      value: `₹${monthSales.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: "Top Product",
      value: topProduct ? topProduct.name : 'N/A',
      subtitle: topProduct ? `${topProduct.quantity} sold` : undefined,
      icon: Trophy,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: "Inventory Value",
      value: `₹${inventoryValue.toLocaleString()}`,
      icon: Package,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Business Overview</h2>
          <p className="text-sm text-muted-foreground">
            {invoiceCount} invoices • {lowStockCount > 0 ? `${lowStockCount} items low on stock` : 'All items stocked'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadAnalytics}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="shadow-card hover:shadow-card-hover transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1 text-foreground">{stat.value}</p>
                  {stat.subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Insights */}
      <Card className="shadow-card insight-gradient">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="p-4 bg-card rounded-lg border border-border/50 animate-slide-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <p className="text-foreground">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">{invoiceCount}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Invoices</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-success">{getInventory().length}</p>
              <p className="text-sm text-muted-foreground mt-1">Inventory Items</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className={`text-4xl font-bold ${lowStockCount > 0 ? 'text-warning' : 'text-success'}`}>
                {lowStockCount}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Low Stock Alerts</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
