import React, { useEffect, useState } from 'react';
import { ShieldAlert, UserCheck, Clock, FileText, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { FraudAlert } from '../types';
import { AlertModal } from '../components/AlertModal';
import { StatusBadge } from '../components/StatusBadge';

export const FraudAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (severityFilter) params.severity = severityFilter;

      const res = await api.get('/fraud/alerts', { params });
      setAlerts(res.data.alerts);
    } catch (err) {
      console.error('Failed to fetch alerts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [statusFilter, severityFilter]);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Fraud Alert Queue</h1>
          <p className="text-sm text-gray-400">Investigate, assign analyst, and resolve flagged risk alerts</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4 rounded-2xl border border-gray-800 flex flex-wrap items-center gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="OPEN">OPEN (Pending)</option>
          <option value="UNDER_INVESTIGATION">UNDER INVESTIGATION</option>
          <option value="RESOLVED">RESOLVED (Confirmed Fraud)</option>
          <option value="FALSE_POSITIVE">FALSE POSITIVE</option>
        </select>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">All Severities</option>
          <option value="CRITICAL">CRITICAL</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-500">
            Loading alert queue...
          </div>
        ) : alerts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">
            No active alerts matching criteria.
          </div>
        ) : (
          alerts.map((alert) => {
            let severityBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
            if (alert.severity === 'CRITICAL') severityBadge = 'bg-purple-500/15 text-purple-400 border-purple-500/30 animate-pulse';
            else if (alert.severity === 'HIGH') severityBadge = 'bg-red-500/15 text-red-400 border-red-500/30';

            return (
              <div key={alert.id} className="glass-panel p-5 rounded-2xl border border-gray-800 flex flex-col justify-between space-y-4 hover:border-gray-700 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${severityBadge}`}>
                      {alert.severity} SEVERITY
                    </span>
                    <span className="text-xs font-mono text-gray-400">{alert.status}</span>
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-base">
                      {alert.transaction?.merchant || 'Transaction Alert'}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Amount: <strong className="text-white font-mono">${alert.transaction?.amount?.toFixed(2)}</strong> • {alert.transaction?.city}, {alert.transaction?.country}
                    </p>
                  </div>

                  {alert.notes && (
                    <div className="p-3 rounded-xl bg-gray-950/80 border border-gray-800 text-xs text-gray-300">
                      <p className="font-semibold text-gray-400 text-[11px] mb-1">Notes / ML Triggers:</p>
                      <p className="line-clamp-2">{alert.notes}</p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>{alert.assignedTo || 'Unassigned'}</span>
                  </div>

                  <button
                    onClick={() => setSelectedAlert(alert)}
                    className="px-3 py-1.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-semibold hover:bg-blue-600/30"
                  >
                    Investigate
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <AlertModal
        alert={selectedAlert}
        isOpen={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onSuccess={fetchAlerts}
      />
    </div>
  );
};
