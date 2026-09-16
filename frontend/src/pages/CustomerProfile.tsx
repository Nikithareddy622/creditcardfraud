import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  ArrowLeft,
  ShieldAlert,
  CreditCard,
  MapPin,
  Smartphone,
  Activity,
  DollarSign,
  Briefcase,
  Calendar,
  AlertTriangle,
  PlusCircle,
  Clock,
  History,
  CheckCircle2,
  Mail,
  Phone
} from 'lucide-react';
import api from '../services/api';
import { Customer, Transaction, FraudAlert } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { StatusBadge } from '../components/StatusBadge';
import { TransactionModal } from '../components/TransactionModal';

export const CustomerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [knownLocations, setKnownLocations] = useState<string[]>([]);
  const [knownDevices, setKnownDevices] = useState<string[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/customers/${id}`);
      setCustomer(res.data.customer);
      setAlerts(res.data.alerts || []);
      setKnownLocations(res.data.knownLocations || []);
      setKnownDevices(res.data.knownDevices || []);
      setAnalytics(res.data.behavioralAnalytics || {});
    } catch (err) {
      console.error('Failed to fetch customer profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-full min-h-[600px]">
        <div className="flex items-center gap-3 text-blue-400 font-semibold animate-pulse">
          <Activity className="w-6 h-6 animate-spin" />
          <span>Loading Customer Behavioral Dossier...</span>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-gray-400">Customer record not found.</p>
        <button
          onClick={() => navigate('/customers')}
          className="px-4 py-2 bg-gray-800 text-white rounded-xl text-xs font-semibold"
        >
          Back to Customer List
        </button>
      </div>
    );
  }

  const getRiskScoreColor = (score: number) => {
    if (score >= 76) return 'text-red-400 border-red-500/40 bg-red-950/40';
    if (score >= 51) return 'text-orange-400 border-orange-500/40 bg-orange-950/40';
    if (score >= 26) return 'text-amber-400 border-amber-500/40 bg-amber-950/40';
    return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40';
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Back Button & Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/customers')}
            className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{customer.customerName}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getRiskScoreColor(customer.riskScore)}`}>
                Risk Score: {customer.riskScore}/100
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">ID: {customer.id} • Card: {customer.cardNumber}</p>
          </div>
        </div>

        <button
          onClick={() => setIsSimulateModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Simulate Transaction</span>
        </button>
      </div>

      {/* Grid Row 1: Profile Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Identity & Demographics */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
            <User className="w-4 h-4" />
            <span>Demographic Baseline</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-gray-800/80">
              <span className="text-gray-400 flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> Email</span>
              <span className="text-white font-medium">{customer.email || 'N/A'}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-gray-800/80">
              <span className="text-gray-400 flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> Phone</span>
              <span className="text-white font-medium">{customer.phone || 'N/A'}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-gray-800/80">
              <span className="text-gray-400 flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Age / Gender</span>
              <span className="text-white font-medium">{customer.age || 35} Yrs • {customer.gender || 'Unspecified'}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-gray-800/80">
              <span className="text-gray-400 flex items-center gap-2"><Briefcase className="w-3.5 h-3.5" /> Occupation</span>
              <span className="text-white font-medium">{customer.occupation || 'Professional'}</span>
            </div>

            <div className="flex justify-between py-1.5">
              <span className="text-gray-400 flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Primary City</span>
              <span className="text-white font-medium">{customer.city || customer.location}, {customer.country || ''}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Financial & Behavioral Summary */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
            <DollarSign className="w-4 h-4" />
            <span>Financial & Spend Profile</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-gray-950/70 rounded-xl border border-gray-800">
              <p className="text-[11px] text-gray-500">Monthly Income</p>
              <p className="text-base font-bold text-white mt-1">${(customer.monthlyIncome || 0).toLocaleString()}</p>
            </div>

            <div className="p-3 bg-gray-950/70 rounded-xl border border-gray-800">
              <p className="text-[11px] text-gray-500">Average Spend</p>
              <p className="text-base font-bold text-blue-400 mt-1">${(customer.averageSpend || 0).toLocaleString()}</p>
            </div>

            <div className="p-3 bg-gray-950/70 rounded-xl border border-gray-800">
              <p className="text-[11px] text-gray-500">Total Spent</p>
              <p className="text-base font-bold text-white mt-1">${(analytics.totalSpent || customer.totalSpent || 0).toLocaleString()}</p>
            </div>

            <div className="p-3 bg-gray-950/70 rounded-xl border border-gray-800">
              <p className="text-[11px] text-gray-500">Fraud Incident History</p>
              <p className={`text-base font-bold mt-1 ${customer.fraudHistoryCount || customer.fraudCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {customer.fraudHistoryCount || customer.fraudCount || 0} Incident(s)
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Devices & Locations Verification */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
            <Smartphone className="w-4 h-4" />
            <span>Known Devices & Geographies</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <p className="text-[11px] text-gray-400 uppercase font-semibold mb-1.5">Verified Devices</p>
              <div className="flex flex-wrap gap-1.5">
                {knownDevices.length > 0 ? (
                  knownDevices.map((dev, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-gray-950 border border-gray-800 rounded-lg text-gray-300 font-mono text-[11px]">
                      📱 {dev}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 italic">Registered: {customer.registeredDeviceType || 'Mobile App'}</span>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-gray-800">
              <p className="text-[11px] text-gray-400 uppercase font-semibold mb-1.5">Known Locations</p>
              <div className="flex flex-wrap gap-1.5">
                {knownLocations.length > 0 ? (
                  knownLocations.map((loc, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-gray-950 border border-gray-800 rounded-lg text-gray-300 text-[11px]">
                      📍 {loc}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 italic">{customer.location}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Row 2: Recent Transactions Timeline & Fraud Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions Timeline (2 cols) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <History className="w-4 h-4 text-blue-400" />
              <span>Cardholder Transaction History</span>
            </div>
            <span className="text-xs text-gray-400">{customer.transactions?.length || 0} Total Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-950 text-gray-400 uppercase font-semibold border-b border-gray-800">
                <tr>
                  <th className="p-3">Merchant</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">ML Prediction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {!customer.transactions || customer.transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-500">
                      No historical transactions found for this cardholder.
                    </td>
                  </tr>
                ) : (
                  customer.transactions.map((tx: Transaction) => (
                    <tr key={tx.id} className="hover:bg-gray-950/50 transition-colors">
                      <td className="p-3 font-semibold text-white">{tx.merchant}</td>
                      <td className="p-3 capitalize">{tx.merchantCategory}</td>
                      <td className="p-3 font-mono font-bold text-white">${tx.amount.toFixed(2)}</td>
                      <td className="p-3">{tx.city}, {tx.country}</td>
                      <td className="p-3"><StatusBadge status={tx.status} /></td>
                      <td className="p-3"><RiskBadge risk={tx.riskCategory} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Alerts Sidebar (1 col) */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Fraud Alert Investigation Log</span>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {alerts.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-10">
                  No active or historical fraud alerts filed for this customer.
                </p>
              ) : (
                alerts.map((alt) => (
                  <div key={alt.id} className="p-3 rounded-xl bg-gray-950 border border-gray-800 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">Alert #{alt.id.slice(0, 8)}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-red-500/20 text-red-400 border border-red-500/30">
                        {alt.severity}
                      </span>
                    </div>
                    <p className="text-gray-400 leading-normal">{alt.notes || alt.reason || 'Flagged for behavioral anomaly'}</p>
                    <div className="flex justify-between text-[10px] text-gray-500 pt-1">
                      <span>Status: {alt.status}</span>
                      <span>{new Date(alt.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Simulation Modal */}
      <TransactionModal
        isOpen={isSimulateModalOpen}
        onClose={() => setIsSimulateModalOpen(false)}
        onSuccess={fetchProfile}
        selectedCustomer={customer}
      />
    </div>
  );
};
