import React, { useEffect, useState } from 'react';
import { Search, Filter, RefreshCw, PlusCircle, CreditCard, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { Transaction } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { StatusBadge } from '../components/StatusBadge';
import { TransactionModal } from '../components/TransactionModal';

export const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (riskFilter) params.riskCategory = riskFilter;

      const res = await api.get('/transactions', { params });
      setTransactions(res.data.transactions);
    } catch (err) {
      console.error('Failed to fetch transactions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter, riskFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTransactions();
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/transactions/${id}`, { status: newStatus });
      fetchTransactions();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Status update failed');
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Transaction Monitoring</h1>
          <p className="text-sm text-gray-400">Live stream evaluation table with real-time risk scores</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Transaction Payload</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-gray-800 flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search merchant, city, or customer..."
            className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="APPROVED">APPROVED</option>
            <option value="FLAGGED">FLAGGED</option>
            <option value="BLOCKED">BLOCKED</option>
          </select>

          {/* Risk Level Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Risk Levels</option>
            <option value="Low Risk">Low Risk</option>
            <option value="Medium Risk">Medium Risk</option>
            <option value="High Risk">High Risk</option>
            <option value="Critical Risk">Critical Risk</option>
          </select>

          <button
            onClick={fetchTransactions}
            className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
            title="Refresh Feed"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="glass-panel rounded-2xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-950 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-800">
              <tr>
                <th className="px-6 py-4">Transaction ID / Merchant</th>
                <th className="px-6 py-4">Cardholder</th>
                <th className="px-6 py-4">Amount ($)</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Fraud Score</th>
                <th className="px-6 py-4">Risk Level</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Analyst Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Loading transaction monitoring stream...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No transactions matching criteria.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-900/40 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-blue-400">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-white truncate max-w-[180px]">{tx.merchant}</p>
                          <p className="text-[10px] text-gray-500 font-mono">{tx.id} • {tx.merchantCategory}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      <p className="font-medium text-white">{tx.customer?.customerName || tx.customerId}</p>
                      <p className="text-[11px] text-gray-500 font-mono">{tx.customer?.cardNumber || 'Card masked'}</p>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-white">
                      ${tx.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {tx.city}, {tx.country}
                    </td>
                    <td className="px-6 py-4 font-mono">
                      <span className={`font-bold ${tx.fraudScore >= 0.7 ? 'text-red-400' : tx.fraudScore >= 0.3 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {(tx.fraudScore * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <RiskBadge risk={tx.riskCategory} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={tx.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {tx.status !== 'APPROVED' && (
                          <button
                            onClick={() => handleUpdateStatus(tx.id, 'APPROVED')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20"
                          >
                            Approve
                          </button>
                        )}
                        {tx.status !== 'BLOCKED' && (
                          <button
                            onClick={() => handleUpdateStatus(tx.id, 'BLOCKED')}
                            className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/20"
                          >
                            Block
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchTransactions}
      />
    </div>
  );
};
