import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  ShieldAlert,
  Users,
  TrendingUp,
  Activity,
  PlusCircle,
  Radio,
  UserCheck,
  AlertTriangle,
  ExternalLink,
  Clock,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import api from '../services/api';
import { KpiCard } from '../components/KpiCard';
import { RiskBadge } from '../components/RiskBadge';
import { StatusBadge } from '../components/StatusBadge';
import { HeatmapChart } from '../components/HeatmapChart';
import { TransactionModal } from '../components/TransactionModal';
import { useSocket } from '../context/SocketContext';
import { Customer } from '../types';

const PIE_COLORS = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { liveEvents } = useSocket();

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/fraud/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-full min-h-[600px]">
        <div className="flex items-center gap-3 text-blue-400 font-semibold animate-pulse">
          <Activity className="w-6 h-6 animate-spin" />
          <span>Loading FalconShield Executive Analytics & Risk Matrix...</span>
        </div>
      </div>
    );
  }

  const kpis = analytics?.kpis || {};
  const charts = analytics?.charts || {};
  const recentlyAddedCustomers: Customer[] = analytics?.recentlyAddedCustomers || [];
  const topRiskCustomers: Customer[] = analytics?.topRiskCustomers || [];
  const latestPredictions: any[] = analytics?.latestPredictions || [];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Executive Risk Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">FICO Falcon Style Enterprise Credit Card Fraud Detection System</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Simulate & Score Transaction</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <KpiCard
          title="Total Transactions"
          value={kpis.totalTransactions || 0}
          change="+12.4%"
          icon={CreditCard}
          color="blue"
        />
        <KpiCard
          title="Total Customers"
          value={kpis.totalCustomers || 0}
          icon={Users}
          color="blue"
        />
        <KpiCard
          title="Fraudulent Detected"
          value={kpis.fraudulentTransactions || 0}
          change="+2.1%"
          isNegative
          icon={ShieldAlert}
          color="red"
        />
        <KpiCard
          title="System Fraud Rate"
          value={`${kpis.fraudRatePercent || 0}%`}
          change="-0.4%"
          icon={TrendingUp}
          color="amber"
        />
        <KpiCard
          title="High Risk Customers"
          value={kpis.highRiskCustomersCount || 0}
          icon={AlertTriangle}
          color="purple"
        />
      </div>

      {/* Main Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Trend Area Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Live Transaction Volume & Risk Velocity</h3>
              <p className="text-xs text-gray-400">Streamed transaction evaluations per minute</p>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.recentStream || []}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="city" stroke="#6B7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6B7280" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', color: '#FFF' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Level Distribution Pie Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Risk Category Segmentation</h3>
            <p className="text-xs text-gray-400 mb-4">ML model anomaly classification</p>
          </div>
          <div className="h-[220px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.riskDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {(charts.riskDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-800 text-xs">
            {(charts.riskDistribution || []).map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></span>
                <span className="text-gray-300 font-medium">{item.name}: <strong className="text-white">{item.count}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Risk & Recent Predictions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Risk Customers List */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>Top Risk Cardholders</span>
            </div>
            <button
              onClick={() => navigate('/customers')}
              className="text-xs text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {topRiskCustomers.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">No customer records available.</p>
            ) : (
              topRiskCustomers.map((c) => (
                <div
                  key={c.id}
                  onClick={() => navigate(`/customers/${c.id}`)}
                  className="p-3 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-between hover:bg-gray-900 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-600/20 text-red-400 font-bold flex items-center justify-center text-xs">
                      {c.customerName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{c.customerName}</p>
                      <p className="text-[10px] text-gray-400">{c.location || 'USA'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-mono font-bold ${c.riskScore >= 50 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {c.riskScore}/100
                    </p>
                    <p className="text-[10px] text-gray-500">Risk Score</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recently Added Customers */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <UserCheck className="w-4 h-4 text-blue-400" />
              <span>Recently Onboarded Customers</span>
            </div>
            <button
              onClick={() => navigate('/customers')}
              className="text-xs text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Manage</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {recentlyAddedCustomers.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">No recent customer onboarding.</p>
            ) : (
              recentlyAddedCustomers.map((c) => (
                <div
                  key={c.id}
                  onClick={() => navigate(`/customers/${c.id}`)}
                  className="p-3 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-between hover:bg-gray-900 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-xs">
                      {c.customerName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{c.customerName}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{c.cardNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono font-bold text-white">${(c.averageSpend || 0).toLocaleString()}</p>
                    <p className="text-[10px] text-gray-500">Avg Spend</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Latest Fraud Predictions */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Latest AI Fraud Evaluations</span>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {latestPredictions.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">No fraud prediction history.</p>
            ) : (
              latestPredictions.map((tx) => (
                <div key={tx.id} className="p-3 rounded-xl bg-gray-950 border border-gray-800 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{tx.merchant}</span>
                    <RiskBadge risk={tx.riskCategory} />
                  </div>
                  <div className="flex justify-between text-gray-400 text-[11px]">
                    <span>${tx.amount.toFixed(2)} • {tx.city}</span>
                    <span className="font-mono text-blue-400">Score: {(tx.fraudScore * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Heatmap & Live Stream Ticker Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap */}
        <div className="lg:col-span-2">
          <HeatmapChart data={charts.countryBreakdown || []} />
        </div>

        {/* Real-time Ticker Feed */}
        <div className="glass-panel p-5 rounded-2xl border border-gray-800 flex flex-col h-[320px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live WebSocket Feed</h3>
            </div>
            <span className="text-[10px] text-gray-500 font-mono">AUTOSCAN</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {liveEvents.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-10">
                Waiting for incoming transaction stream events...
              </p>
            ) : (
              liveEvents.map((evt, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-gray-950/80 border border-gray-800 text-xs space-y-1 animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white">{evt.payload?.merchant || 'Transaction'}</span>
                    <StatusBadge status={evt.payload?.status || 'APPROVED'} />
                  </div>
                  <div className="flex justify-between text-gray-400 text-[11px]">
                    <span>${evt.payload?.amount}</span>
                    <span>ML Risk: {(evt.payload?.fraudScore * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Manual Simulation Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
};
