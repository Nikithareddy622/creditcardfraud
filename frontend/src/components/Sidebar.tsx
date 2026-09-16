import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CreditCard,
  ShieldAlert,
  Users,
  BarChart3,
  Settings,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: CreditCard },
    { name: 'Fraud Alerts', path: '/alerts', icon: ShieldAlert },
    { name: 'Customer Profiles', path: '/customers', icon: Users },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    ...(user?.role === 'ADMIN'
      ? [{ name: 'Admin & Rules', path: '/admin', icon: Settings }]
      : [])
  ];

  return (
    <aside className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col justify-between hidden md:flex min-h-screen">
      <div>
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3 border-b border-gray-800/60">
          <div className="p-2.5 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-tight leading-none">FalconShield <span className="text-blue-500 text-xs px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">AI</span></h1>
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-medium">Enterprise Fraud Manager</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/60'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Active User Badge & Session Status */}
      <div className="p-4 m-4 glass-panel rounded-2xl border border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white text-sm shadow-md">
            {user?.name.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-[11px] text-blue-400 font-mono tracking-wide uppercase">{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
