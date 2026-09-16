import React, { useEffect, useState } from 'react';
import { Settings, Users, Shield, Plus, ToggleLeft, ToggleRight, FileText, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { User, FraudRule, AuditLog } from '../types';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rules' | 'users' | 'audit'>('rules');
  const [rules, setRules] = useState<FraudRule[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // New Rule Form State
  const [newRule, setNewRule] = useState({
    ruleName: '',
    conditionType: 'MAX_AMOUNT',
    threshold: '',
    action: 'BLOCK' as 'BLOCK' | 'FLAG' | 'ALERT'
  });

  // New User Form State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'FRAUD_ANALYST'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'rules') {
        const res = await api.get('/admin/rules');
        setRules(res.data);
      } else if (activeTab === 'users') {
        const res = await api.get('/admin/users');
        setUsers(res.data);
      } else if (activeTab === 'audit') {
        const res = await api.get('/admin/audit-logs');
        setAuditLogs(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleToggleRule = async (rule: FraudRule) => {
    try {
      await api.put(`/admin/rules/${rule.id}`, { isEnabled: !rule.isEnabled });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Rule toggle failed');
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/rules', newRule);
      setNewRule({ ruleName: '', conditionType: 'MAX_AMOUNT', threshold: '', action: 'BLOCK' });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Create rule failed');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', newUser);
      setNewUser({ name: '', email: '', password: '', role: 'FRAUD_ANALYST' });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Create user failed');
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Admin & Fraud Configuration</h1>
        <p className="text-sm text-gray-400">Configure automated risk engines, user roles, and inspect audit trails</p>
      </div>

      {/* Tabs Header */}
      <div className="flex gap-2 border-b border-gray-800 pb-2">
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'rules' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-gray-400 hover:text-white bg-gray-900'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Automated Fraud Rules</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-gray-400 hover:text-white bg-gray-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Management</span>
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'audit' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-gray-400 hover:text-white bg-gray-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>System Audit Logs</span>
        </button>
      </div>

      {/* Tab 1: Rules Engine Configuration */}
      {activeTab === 'rules' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rule List */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
            <h3 className="text-base font-bold text-white mb-4">Active Rule Set</h3>

            {loading ? (
              <p className="text-sm text-gray-500">Loading rules...</p>
            ) : (
              <div className="space-y-3">
                {rules.map((rule) => (
                  <div key={rule.id} className="p-4 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">{rule.ruleName}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                          {rule.action}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Type: <strong className="text-gray-200">{rule.conditionType}</strong> • Threshold: <strong className="text-gray-200">{rule.threshold}</strong>
                      </p>
                    </div>

                    <button
                      onClick={() => handleToggleRule(rule)}
                      className={`p-2 rounded-xl transition-all ${rule.isEnabled ? 'text-emerald-400 bg-emerald-500/10' : 'text-gray-500 bg-gray-900'}`}
                      title="Toggle Rule State"
                    >
                      {rule.isEnabled ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Rule Form */}
          <div className="glass-panel p-6 rounded-2xl border border-gray-800">
            <h3 className="text-base font-bold text-white mb-4">Add Automated Rule</h3>
            <form onSubmit={handleCreateRule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Rule Name</label>
                <input
                  type="text"
                  value={newRule.ruleName}
                  onChange={(e) => setNewRule({ ...newRule, ruleName: e.target.value })}
                  placeholder="e.g. Foreign Micro-Charge Limit"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Condition Type</label>
                <select
                  value={newRule.conditionType}
                  onChange={(e) => setNewRule({ ...newRule, conditionType: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="MAX_AMOUNT">MAX_AMOUNT ($ Limit)</option>
                  <option value="VELOCITY_LIMIT">VELOCITY_LIMIT (Frequency)</option>
                  <option value="HIGH_RISK_COUNTRY">HIGH_RISK_COUNTRY (Countries)</option>
                  <option value="NIGHT_TRANSACTION">NIGHT_TRANSACTION (Off-hours)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Threshold Value</label>
                <input
                  type="text"
                  value={newRule.threshold}
                  onChange={(e) => setNewRule({ ...newRule, threshold: e.target.value })}
                  placeholder="e.g. 5000.00 or Russia, Nigeria"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Enforcement Action</label>
                <select
                  value={newRule.action}
                  onChange={(e) => setNewRule({ ...newRule, action: e.target.value as any })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="BLOCK">BLOCK (Reject Transaction)</option>
                  <option value="FLAG">FLAG (Require Review)</option>
                  <option value="ALERT">ALERT (Notify Analyst)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/30"
              >
                Create Security Rule
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: User Management */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-gray-800">
            <h3 className="text-base font-bold text-white mb-4">Staff Directory</h3>
            <div className="space-y-3">
              {users.map((u) => (
                <div key={u.id} className="p-4 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{u.name}</h4>
                    <p className="text-xs text-gray-400 font-mono">{u.email}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-gray-800">
            <h3 className="text-base font-bold text-white mb-4">Add Staff Account</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Staff Name"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Work Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="staff@falconshield.ai"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Access Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="FRAUD_ANALYST">Fraud Analyst</option>
                  <option value="ADMIN">System Admin</option>
                  <option value="CUSTOMER_SUPPORT">Customer Support</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/30"
              >
                Provision Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 3: System Audit Logs */}
      {activeTab === 'audit' && (
        <div className="glass-panel rounded-2xl border border-gray-800 overflow-hidden">
          <div className="p-4 bg-gray-950 border-b border-gray-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Security & Audit Activity Trail</h3>
          </div>
          <div className="divide-y divide-gray-800">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 flex items-center justify-between text-xs hover:bg-gray-900/40">
                <div>
                  <p className="font-bold text-white text-sm">{log.action}</p>
                  <p className="text-gray-400 mt-0.5">{log.details}</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-400 font-semibold">{log.userName}</p>
                  <p className="text-gray-500 font-mono">{new Date(log.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
