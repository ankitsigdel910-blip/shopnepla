import {
  useEffect,
  useState,
} from 'react';

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
} from 'recharts';

import {
  Users,
  Package,
  ShoppingBag,
  DollarSign,
  Clock,
  CheckCircle,
} from 'lucide-react';

import api, {
  getErrorMessage,
} from '../services/api';

// ============================================================
// TYPES
// ============================================================

interface MonthlyRevenue {
  label: string;
  revenue: number;
}

interface MonthlyOrders {
  label: string;
  orders: number;
}

interface Stats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;

  monthlyRevenue: MonthlyRevenue[];
  monthlyOrders: MonthlyOrders[];
}

// ============================================================
// STAT CARD
// ============================================================

const StatCard = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: any;
}) => {
  return (
    <div className="card p-4 flex items-center gap-3">

      <div className="bg-brand-50 text-brand-600 p-3 rounded-lg">
        <Icon size={20} />
      </div>

      <div>
        <p className="text-xs text-gray-500">
          {label}
        </p>

        <p className="text-xl font-bold">
          {value}
        </p>
      </div>

    </div>
  );
};

// ============================================================
// DASHBOARD
// ============================================================

const Dashboard = () => {
  const [stats, setStats] =
    useState<Stats | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  // ==========================================================
  // LOAD DASHBOARD
  // ==========================================================

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const response =
          await api.get(
            '/admin/dashboard'
          );

        setStats(response.data.data);
      } catch (err) {
        setError(
          getErrorMessage(err)
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div>

      <h1 className="text-2xl font-bold mb-6">
        Dashboard
      </h1>

      {/* =====================================================
          STAT CARDS
      ====================================================== */}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">

        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          icon={Users}
        />

        <StatCard
          label="Total Products"
          value={stats.totalProducts}
          icon={Package}
        />

        <StatCard
          label="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingBag}
        />

        <StatCard
          label="Total Revenue"
          value={`Rs. ${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
        />

        <StatCard
          label="Pending Orders"
          value={stats.pendingOrders}
          icon={Clock}
        />

        <StatCard
          label="Completed Orders"
          value={stats.completedOrders}
          icon={CheckCircle}
        />

      </div>

      {/* =====================================================
          CHARTS
      ====================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ===================================================
            MONTHLY REVENUE
        ==================================================== */}

        <div className="card p-4">

          <h2 className="font-semibold mb-4">
            Monthly Revenue
          </h2>

          {stats.monthlyRevenue.length === 0 ? (

            <div className="h-[280px] flex items-center justify-center text-gray-400">
              No paid orders yet
            </div>

          ) : (

            <ResponsiveContainer
              width="100%"
              height={280}
            >
              <BarChart
                data={
                  stats.monthlyRevenue
                }
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="label"
                  fontSize={12}
                />

                <YAxis
                  fontSize={12}
                />

                <Tooltip
                  formatter={(value) => [
                    `Rs. ${Number(
                      value
                    ).toLocaleString()}`,
                    'Revenue',
                  ]}
                />

                <Bar
                  dataKey="revenue"
                  fill="#2563eb"
                  radius={[
                    4,
                    4,
                    0,
                    0,
                  ]}
                />

              </BarChart>
            </ResponsiveContainer>

          )}

        </div>

        {/* ===================================================
            MONTHLY ORDERS
        ==================================================== */}

        <div className="card p-4">

          <h2 className="font-semibold mb-4">
            Monthly Orders
          </h2>

          {stats.monthlyOrders.length === 0 ? (

            <div className="h-[280px] flex items-center justify-center text-gray-400">
              No orders yet
            </div>

          ) : (

            <ResponsiveContainer
              width="100%"
              height={280}
            >
              <LineChart
                data={
                  stats.monthlyOrders
                }
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="label"
                  fontSize={12}
                />

                <YAxis
                  fontSize={12}
                  allowDecimals={false}
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#1d4ed8"
                  strokeWidth={3}
                  dot={{
                    r: 5,
                    fill: '#1d4ed8',
                  }}
                  activeDot={{
                    r: 7,
                  }}
                />

              </LineChart>
            </ResponsiveContainer>

          )}

        </div>

      </div>

    </div>
  );
};

export default Dashboard;