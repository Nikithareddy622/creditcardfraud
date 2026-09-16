import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2, UserCheck, MessageSquare } from 'lucide-react';
import { FraudAlert } from '../types';
import api from '../services/api';

interface AlertModalProps {
  alert: FraudAlert | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({ alert, isOpen, onClose, onSuccess }) => {
  const [status, setStatus] = useState<string>(alert?.status || 'OPEN');
  const [assignedTo, setAssignedTo] = useState<string>(alert?.assignedTo || 'Unassigned');
  const [notes, setNotes] = useState<string>(alert?.notes || '');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !alert) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put(`/fraud/alerts/${alert.id}`, { status, assignedTo, notes });
      onSuccess();
      onClose();
    } catch (err: any) {
      window.alert(err.response?.data?.error || 'Failed to update alert resolution');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-600/20 border border-red-500/30 text-red-400 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Fraud Alert Investigation Workflow</h3>
              <p className="text-xs text-gray-400">ID: {alert.id} • Severity: {alert.severity}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {alert.transaction && (
            <div className="glass-panel p-4 rounded-xl border border-gray-800 space-y-2 text-xs">
              <p className="font-semibold text-white text-sm">
                Transaction: ${alert.transaction.amount.toFixed(2)} @ {alert.transaction.merchant}
              </p>
              <p className="text-gray-400">
                Cardholder: {alert.transaction.customer?.customerName || alert.transaction.customerId}
              </p>
              <p className="text-gray-400">
                Location: {alert.transaction.city}, {alert.transaction.country}
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Investigation Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="OPEN">OPEN (Pending Review)</option>
              <option value="UNDER_INVESTIGATION">UNDER INVESTIGATION</option>
              <option value="RESOLVED">RESOLVED (Confirmed Fraud)</option>
              <option value="FALSE_POSITIVE">FALSE POSITIVE (Legitimate)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Assign Fraud Analyst
            </label>
            <input
              type="text"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              placeholder="Analyst Name"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Investigation Notes & Log
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              placeholder="Record forensic audit details or customer verification confirmation..."
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-gray-800">
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
              {loading ? 'Saving Update...' : 'Save Investigation Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
