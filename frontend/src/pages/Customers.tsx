import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  UserPlus,
  Edit2,
  Trash2,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  CreditCard
} from 'lucide-react';
import api from '../services/api';
import { Customer } from '../types';
import { CustomerModal } from '../components/CustomerModal';

export const Customers: React.FC = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [highRiskOnly, setHighRiskOnly] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // Modals state
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (highRiskOnly) params.highRiskOnly = 'true';

      const res = await api.get('/customers', { params });
      setCustomers(res.data.customers);
      if (res.data.customers.length > 0 && !selectedCustomer) {
        handleSelectCustomer(res.data.customers[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch customers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [highRiskOnly]);

  const handleSelectCustomer = async (id: string) => {
    try {
      const res = await api.get(`/customers/${id}`);
      setSelectedCustomer(res.data);
    } catch (err) {
      console.error('Failed to load customer profile detail', err);
    }
  };

  const handleOpenAddModal = () => {
    setCustomerToEdit(null);
    setIsCustomerModalOpen(true);
  };

  const handleOpenEditModal = (c: Customer) => {
    setCustomerToEdit(c);
    setIsCustomerModalOpen(true);
  };

  const handleDeleteCustomer = async (c: Customer) => {
    if (window.confirm(`Are you sure you want to delete customer record for "${c.customerName}"?`)) {
      try {
        await api.delete(`/customers/${c.id}`);
        setSelectedCustomer(null);
        fetchCustomers();
      } catch (err: any) {
        window.alert(err.response?.data?.error || 'Failed to delete customer');
      }
    }
  };

  const getRiskColorClass = (score: number) => {
    if (score >= 76) return 'text-red-400 font-bold';
    if (score >= 51) return 'text-orange-400 font-bold';
    if (score >= 26) return 'text-amber-400 font-bold';
    return 'text-emerald-400 font-bold';
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Customer Management & Profiling</h1>
          <p className="text-sm text-gray-400">Cardholder behavioral baselines, demographic dossiers, and fraud history</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-gray-800 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchCustomers()}
            placeholder="Search name, email, phone, location, card..."
            className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-300">
          <input
            type="checkbox"
            checked={highRiskOnly}
            onChange={(e) => setHighRiskOnly(e.target.checked)}
            className="rounded bg-gray-950 border-gray-800 text-blue-600 focus:ring-0"
          />
          <span>Show High-Risk Cardholders Only (&ge; 50 Score)</span>
        </label>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Directory List */}
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-800 bg-gray-950 flex justify-between items-center">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Cardholder Directory</h3>
            <span className="text-xs text-gray-400 font-mono">{customers.length} Accounts Found</span>
          </div>

          <div className="divide-y divide-gray-800">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading customer profiles...</div>
            ) : customers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No customers found matching search criteria.</div>
            ) : (
              customers.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleSelectCustomer(c.id)}
                  className={`p-4 flex items-center justify-between hover:bg-gray-900/60 cursor-pointer transition-colors ${
                    selectedCustomer?.customer?.id === c.id ? 'bg-gray-900 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shrink-0">
                      {c.customerName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm flex items-center gap-2">
                        {c.customerName}
                        {c.email && <span className="text-[11px] font-normal text-gray-400">({c.email})</span>}
                      </h4>
                      <p className="text-xs text-gray-400 font-mono">
                        {c.cardNumber} • {c.location || `${c.city || ''}, ${c.country || ''}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-gray-400 uppercase font-semibold">Avg Spend</p>
                      <p className="text-xs font-mono font-bold text-white">${(c.averageSpend || 0).toLocaleString()}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 uppercase font-semibold">Risk Score</p>
                      <p className={`text-sm font-mono ${getRiskColorClass(c.riskScore)}`}>
                        {c.riskScore}/100
                      </p>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenEditModal(c)}
                        title="Edit Customer"
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteCustomer(c)}
                        title="Delete Customer"
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => navigate(`/customers/${c.id}`)}
                        title="View Customer Profile"
                        className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-600/20 rounded-lg"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Customer Quick Dossier Card */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-6">
          {!selectedCustomer ? (
            <div className="text-center py-16 text-gray-500 text-sm">
              Select a cardholder from the directory to inspect behavioral profile details.
            </div>
          ) : (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 text-lg">
                    {selectedCustomer.customer.customerName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{selectedCustomer.customer.customerName}</h3>
                    <p className="text-xs text-gray-400 font-mono">{selectedCustomer.customer.cardNumber}</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/customers/${selectedCustomer.customer.id}`)}
                  className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all border border-blue-500/30"
                >
                  <span>Full Profile</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Demographics */}
              <div className="space-y-2 text-xs border-t border-b border-gray-800 py-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white font-medium">{selectedCustomer.customer.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Phone:</span>
                  <span className="text-white font-medium">{selectedCustomer.customer.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Location:</span>
                  <span className="text-white font-medium">{selectedCustomer.customer.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Device:</span>
                  <span className="text-white font-medium capitalize">{selectedCustomer.customer.registeredDeviceType || 'Mobile App'}</span>
                </div>
              </div>

              {/* KPI metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-gray-950 border border-gray-800">
                  <p className="text-[11px] text-gray-500">Risk Score</p>
                  <p className={`text-lg font-mono ${getRiskColorClass(selectedCustomer.customer.riskScore)}`}>
                    {selectedCustomer.customer.riskScore}/100
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gray-950 border border-gray-800">
                  <p className="text-[11px] text-gray-500">Fraud Incidents</p>
                  <p className="text-lg font-mono font-bold text-amber-400">
                    {selectedCustomer.customer.fraudHistoryCount || selectedCustomer.customer.fraudCount || 0}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gray-950 border border-gray-800">
                  <p className="text-[11px] text-gray-500">Avg Monthly Spend</p>
                  <p className="text-sm font-mono font-bold text-white">
                    ${(selectedCustomer.customer.averageSpend || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gray-950 border border-gray-800">
                  <p className="text-[11px] text-gray-500">Monthly Income</p>
                  <p className="text-sm font-mono font-bold text-emerald-400">
                    ${(selectedCustomer.customer.monthlyIncome || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleOpenEditModal(selectedCustomer.customer)}
                  className="flex-1 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={() => handleDeleteCustomer(selectedCustomer.customer)}
                  className="py-2 px-3 rounded-xl bg-red-900/20 hover:bg-red-900/40 text-red-400 text-xs font-semibold flex items-center justify-center gap-1.5 border border-red-500/30"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Onboard / Edit Customer Modal */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSuccess={fetchCustomers}
        customerToEdit={customerToEdit}
      />
    </div>
  );
};
