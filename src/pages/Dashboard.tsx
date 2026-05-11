import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  IndianRupee,
  Package,
  FileText,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Bot,
  Lightbulb,
  Target,
  ShoppingCart,
  RefreshCw,
  BarChart3,
  ChevronRight
} from 'lucide-react';
import { getDashboardStats, getInsights } from '@/services/api';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

interface TopProduct {
  _id: string;
  quantity: number;
  revenue: number;
}

interface LowStockItem {
  _id: string;
  name: string;
  quantity: number;
  price: number;
}

interface DashboardStats {
  todaySales: number;
  monthSales: number;
  invoiceCount: number;
  inventoryValue: number;
  lowStockCount: number;
  lowStockItems: LowStockItem[];
  topProducts: TopProduct[];
}

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [statsData, insightsData] = await Promise.all([
        getDashboardStats(),
        getInsights()
      ]);
      setStats(statsData);
      setInsights(insightsData);
      setLastUpdated(new Date());
      toast.success('Dashboard updated');
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const lineChartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Revenue',
        data: [25000, 42000, 38000, 65000],
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#8b5cf6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
    ],
  };

  const doughnutData = {
    labels: ['Electronics', 'Clothing', 'Groceries', 'Others'],
    datasets: [
      {
        data: [45, 25, 20, 10],
        backgroundColor: ['#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#9ca3af', font: { size: 11 } },
        position: 'bottom' as const,
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#fff',
        bodyColor: '#9ca3af',
      },
    },
    scales: {
      y: {
        grid: { color: 'rgba(75, 85, 99, 0.2)' },
        ticks: { color: '#9ca3af', font: { size: 11 } },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#9ca3af', font: { size: 11 } },
      },
    },
  };

  const statCards = [
    {
      title: "Today's Revenue",
      value: `₹${(stats?.todaySales || 0).toLocaleString()}`,
      icon: IndianRupee,
      change: "+12.5%",
      trend: "up" as const,
      color: "from-purple-500 to-pink-500",
      description: "vs yesterday"
    },
    {
      title: "Monthly Revenue",
      value: `₹${(stats?.monthSales || 0).toLocaleString()}`,
      icon: TrendingUp,
      change: "+23.1%",
      trend: "up" as const,
      color: "from-blue-500 to-cyan-500",
      description: "vs last month"
    },
    {
      title: "Inventory Value",
      value: `₹${(stats?.inventoryValue || 0).toLocaleString()}`,
      icon: Package,
      change: "-5.2%",
      trend: "down" as const,
      color: "from-green-500 to-emerald-500",
      description: "Current value"
    },
    {
      title: "Invoices",
      value: (stats?.invoiceCount || 0).toString(),
      icon: FileText,
      change: "+18.3%",
      trend: "up" as const,
      color: "from-orange-500 to-red-500",
      description: "This month"
    },
  ];

  const quickActions = [
    { label: "New Invoice", icon: FileText, color: "bg-purple-500", action: "/invoices" },
    { label: "Add Product", icon: Package, color: "bg-blue-500", action: "/inventory" },
    { label: "Analytics", icon: BarChart3, color: "bg-green-500", action: "/analytics" },
    { label: "AI Report", icon: Sparkles, color: "bg-pink-500", action: "#" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Main Content - Responsive padding */}
      <div className="lg:pl-64 xl:pl-72">
        <div className="p-4 sm:p-6 md:p-8">
          {/* Header - Responsive */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
              <p className="text-sm sm:text-base text-gray-400 mt-1">
                AI-powered insights for your business
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={loadDashboard}
                className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all text-sm sm:text-base"
              >
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Refresh</span>
              </button>
              <div className="px-2 py-2 sm:px-3 bg-gray-800 rounded-lg">
                <span className="text-xs sm:text-sm text-gray-400">
                  {lastUpdated.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="loading-spinner mx-auto mb-4"></div>
                <p className="text-gray-400">Loading...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Grid - Responsive 1-2-4 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                {statCards.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-gray-700 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10`}>
                        <stat.icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="flex items-center gap-1">
                        {stat.trend === "up" ? (
                          <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                        )}
                        <span className={`text-xs sm:text-sm ${stat.trend === "up" ? 'text-green-400' : 'text-red-400'}`}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-white mb-1">{stat.value}</p>
                    <p className="text-xs sm:text-sm text-gray-400">{stat.title}</p>
                    <p className="text-xs text-gray-500 mt-1 sm:mt-2">{stat.description}</p>
                  </motion.div>
                ))}
              </div>

              {/* Low Stock Alert - Responsive */}
              {stats?.lowStockCount && stats.lowStockCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-6 md:mb-8"
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-400 text-sm sm:text-base">Low Stock Alert</p>
                      <p className="text-xs sm:text-sm text-gray-400">
                        {stats.lowStockCount} product(s) need restocking
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Quick Actions - Responsive grid */}
              <div className="mb-6 md:mb-8">
                <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {quickActions.map((action, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-gray-900/50 border border-gray-800 rounded-xl p-3 sm:p-4 text-center hover:border-gray-700 transition-all"
                    >
                      <div className={`${action.color} w-8 h-8 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3`}>
                        <action.icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <p className="text-white text-xs sm:text-sm font-medium">{action.label}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Charts Section - Responsive */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gray-900/50 border border-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
                    <h3 className="text-white font-semibold text-sm sm:text-base">Revenue Overview</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Last 30 days</span>
                    </div>
                  </div>
                  <div className="h-48 sm:h-64">
                    <Line data={lineChartData} options={chartOptions} />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                      <h3 className="text-white font-semibold text-sm sm:text-base">AI Assistant</h3>
                    </div>
                    <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4">
                      Analyzing your business data for insights
                    </p>
                    <div className="space-y-2 sm:space-y-3">
                      {insights.slice(0, 3).map((insight, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 sm:p-3 bg-white/5 rounded-lg">
                          <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <p className="text-xs sm:text-sm text-gray-300">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Bottom Section - Responsive */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {stats?.topProducts && stats.topProducts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gray-900/50 border border-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6"
                  >
                    <div className="flex items-center gap-2 mb-4 sm:mb-6">
                      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                      <h3 className="text-white font-semibold text-sm sm:text-base">Top Products</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      {stats.topProducts.map((product, index) => (
                        <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-white/5 rounded-lg">
                          <div>
                            <p className="text-white font-medium text-sm sm:text-base">{product._id}</p>
                            <p className="text-xs text-gray-400">{product.quantity} units sold</p>
                          </div>
                          <p className="text-purple-400 font-semibold text-sm sm:text-base">₹{product.revenue.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gray-900/50 border border-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6"
                >
                  <div className="flex items-center gap-2 mb-4 sm:mb-6">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                    <h3 className="text-white font-semibold text-sm sm:text-base">Sales by Category</h3>
                  </div>
                  <div className="h-48 sm:h-64">
                    <Doughnut data={doughnutData} options={chartOptions} />
                  </div>
                </motion.div>
              </div>

              {/* Business Health - Responsive */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 md:mt-8 bg-gray-900/50 border border-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6"
              >
                <div className="flex items-center gap-2 mb-4 sm:mb-6">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                  <h3 className="text-white font-semibold text-sm sm:text-base">Business Health</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div>
                    <div className="flex justify-between text-xs sm:text-sm mb-2">
                      <span className="text-gray-400">GST Compliance</span>
                      <span className="text-green-400">98%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full w-[98%] bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs sm:text-sm mb-2">
                      <span className="text-gray-400">Inventory Accuracy</span>
                      <span className="text-blue-400">95%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full w-[95%] bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs sm:text-sm mb-2">
                      <span className="text-gray-400">Collection Rate</span>
                      <span className="text-purple-400">92%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full w-[92%] bg-purple-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(139, 92, 246, 0.2);
          border-radius: 50%;
          border-top-color: #8b5cf6;
          animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @media (min-width: 640px) {
          .loading-spinner {
            width: 48px;
            height: 48px;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;