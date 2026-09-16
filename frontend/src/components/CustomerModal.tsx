import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, ShieldAlert, CreditCard } from 'lucide-react';
import { Customer } from '../types';
import api from '../services/api';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customerToEdit?: Customer | null;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  customerToEdit
}) => {
  const isEdit = !!customerToEdit;

  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    cardNumber: '',
    age: '35',
    gender: 'Male',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    occupation: 'Professional',
    monthlyIncome: '8500',
    averageSpend: '1200',
    registeredDeviceType: 'mobile_app',
    riskScore: '15',
    fraudHistoryCount: '0'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (customerToEdit) {
      setFormData({
        customerName: customerToEdit.customerName || '',
        email: customerToEdit.email || '',
        phone: customerToEdit.phone || '',
        cardNumber: customerToEdit.cardNumber || '',
        age: String(customerToEdit.age || 35),
        gender: customerToEdit.gender || 'Male',
        city: customerToEdit.city || customerToEdit.location?.split(',')[0] || 'New York',
        state: customerToEdit.state || '',
        country: customerToEdit.country || customerToEdit.location?.split(',')[1]?.trim() || 'USA',
        occupation: customerToEdit.occupation || 'Professional',
        monthlyIncome: String(customerToEdit.monthlyIncome || 8500),
        averageSpend: String(customerToEdit.averageSpend || 1200),
        registeredDeviceType: customerToEdit.registeredDeviceType || 'mobile_app',
        riskScore: String(customerToEdit.riskScore || 15),
        fraudHistoryCount: String(customerToEdit.fraudHistoryCount || customerToEdit.fraudCount || 0)
      });
    } else {
      setFormData({
        customerName: '',
        email: '',
        phone: '',
        cardNumber: '',
        age: '35',
        gender: 'Male',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        occupation: 'Professional',
        monthlyIncome: '8500',
        averageSpend: '1200',
        registeredDeviceType: 'mobile_app',
        riskScore: '15',
        fraudHistoryCount: '0'
      });
    }
    setError(null);
  }, [customerToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEdit && customerToEdit) {
        await api.put(`/customers/${customerToEdit.id}`, formData);
      } else {
        await api.post('/customers', formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save customer record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="bg-gray-900 border border-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-xl">
              {isEdit ? <Save className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {isEdit ? 'Edit Customer Profile' : 'Onboard New Customer'}
              </h3>
              <p className="text-xs text-gray-400">
                {isEdit ? 'Update behavioral baseline and identity record' : 'Register new cardholder into FalconShield AI system'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-900/30 border border-red-500/50 text-red-400 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Personal Information */}
          <div>
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">Identity & Contact</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Customer Name *</label>
                <input
                  type="text"
                  name="customerName"
                  required
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="e.g. Jonathan Wick"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="j.wick@example.com"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 019-2834"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Card Number (Masked in UI) *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="cardNumber"
                    required
                    value={formData.cardNumber}
                    onChange={handleChange}
                    placeholder="4532-8899-7711-8812"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                  <CreditCard className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Unspecified">Unspecified</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location & Occupation */}
          <div>
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">Demographics & Location</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="New York"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="NY"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="USA"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Financial & Risk Profile */}
          <div>
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">Financial Profile & Risk Baseline</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Monthly Income ($)</label>
                <input
                  type="number"
                  name="monthlyIncome"
                  value={formData.monthlyIncome}
                  onChange={handleChange}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Average Spend ($)</label>
                <input
                  type="number"
                  name="averageSpend"
                  value={formData.averageSpend}
                  onChange={handleChange}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Device Type</label>
                <select
                  name="registeredDeviceType"
                  value={formData.registeredDeviceType}
                  onChange={handleChange}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="mobile_app">Mobile App (iOS/Android)</option>
                  <option value="web_browser">Web Browser</option>
                  <option value="pos_terminal">POS Terminal</option>
                  <option value="unknown_device">Unknown Device</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Initial Risk Score (0-100)</label>
                <input
                  type="number"
                  name="riskScore"
                  min="0"
                  max="100"
                  value={formData.riskScore}
                  onChange={handleChange}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Fraud History Count</label>
                <input
                  type="number"
                  name="fraudHistoryCount"
                  min="0"
                  value={formData.fraudHistoryCount}
                  onChange={handleChange}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Occupation</label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  placeholder="Professional"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-400 hover:text-white bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30"
            >
              {loading ? 'Processing...' : isEdit ? 'Update Customer' : 'Save & Onboard Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
