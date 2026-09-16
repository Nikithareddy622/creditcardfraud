import React, { useState, useEffect } from 'react';
import { X, Cpu, Sparkles } from 'lucide-react';
import api from '../services/api';
import { Customer, FraudPredictionResult } from '../types';
import { PredictionResultCard } from './PredictionResultCard';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedCustomer?: Customer | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  selectedCustomer
}) => {
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    amount: '8500',
    merchant: 'Electronics Superstore',
    merchantCategory: 'electronics',
    city: 'New York',
    country: 'USA',
    deviceType: 'mobile_app',
    transactionTime: '02:15 AM',
    paymentMethod: 'Credit Card'
  });

  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState<FraudPredictionResult | null>(null);

  useEffect(() => {
    if (selectedCustomer) {
      setFormData(prev => ({
        ...prev,
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.customerName,
        city: selectedCustomer.city || selectedCustomer.location?.split(',')[0] || 'New York',
        country: selectedCustomer.country || selectedCustomer.location?.split(',')[1]?.trim() || 'USA',
        deviceType: selectedCustomer.registeredDeviceType || 'mobile_app'
      }));
    } else {
      setFormData({
        customerId: 'c-101',
        customerName: 'Jonathan Wick',
        amount: '8500',
        merchant: 'Electronics Superstore',
        merchantCategory: 'electronics',
        city: 'New York',
        country: 'USA',
        deviceType: 'mobile_app',
        transactionTime: '02:15 AM',
        paymentMethod: 'Credit Card'
      });
    }
    setPredictionResult(null);
  }, [selectedCustomer, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPredictionResult(null);

    try {
      // 1. Fetch AI Fraud Prediction
      const predRes = await api.post('/fraud/predict', formData);
      setPredictionResult(predRes.data);

      // 2. Also register transaction in DB pipeline
      await api.post('/transactions', {
        customerId: formData.customerId,
        amount: parseFloat(formData.amount),
        merchant: formData.merchant,
        merchantCategory: formData.merchantCategory,
        city: formData.city,
        country: formData.country,
        deviceType: formData.deviceType
      });

      onSuccess();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Transaction simulation failed');
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
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Simulate & Score Real-Time Transaction</h3>
              <p className="text-xs text-gray-400">
                {selectedCustomer
                  ? `Testing transaction scoring for ${selectedCustomer.customerName}`
                  : 'Real-time AI behavioral fraud scoring & rules engine'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!predictionResult ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Transaction Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Merchant Name</label>
                  <input
                    type="text"
                    value={formData.merchant}
                    onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Merchant Category</label>
                  <select
                    value={formData.merchantCategory}
                    onChange={(e) => setFormData({ ...formData, merchantCategory: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="electronics">Electronics</option>
                    <option value="jewelry">Jewelry</option>
                    <option value="travel">Travel & Aviation</option>
                    <option value="grocery">Grocery</option>
                    <option value="digital_goods">Digital Goods</option>
                    <option value="gas">Gas & Fuel</option>
                    <option value="restaurants">Restaurants</option>
                    <option value="clothing">Clothing & Fashion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Transaction City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Transaction Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Device Channel</label>
                  <select
                    value={formData.deviceType}
                    onChange={(e) => setFormData({ ...formData, deviceType: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="mobile_app">Mobile App (iPhone / Android)</option>
                    <option value="web_browser">Web Browser</option>
                    <option value="pos_terminal">POS Terminal</option>
                    <option value="unknown_device">Unknown Device (Unregistered)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Transaction Time</label>
                  <input
                    type="text"
                    value={formData.transactionTime}
                    onChange={(e) => setFormData({ ...formData, transactionTime: e.target.value })}
                    placeholder="02:15 AM"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
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
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 flex items-center gap-2 shadow-lg shadow-blue-600/30"
                >
                  <Sparkles className="w-4 h-4" />
                  {loading ? 'Evaluating AI Model...' : 'Predict Fraud Risk'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <PredictionResultCard result={predictionResult} />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setPredictionResult(null)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-800 text-gray-300 hover:text-white"
                >
                  Score Another Transaction
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/30"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
