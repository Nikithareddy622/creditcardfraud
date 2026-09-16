import React from 'react';
import { Sun, Moon, LogOut, Radio, FileCode2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isConnected } = useSocket();

  return (
    <header className="h-16 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/80 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Live Stream Status Indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-900 border border-gray-800 text-xs font-mono">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
          <span className="text-gray-300 font-medium">
            {isConnected ? 'LIVE MONITORING ACTIVE' : 'STREAM RECONNECTING'}
          </span>
          <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
        </div>

        <a
          href="http://localhost:5000/api-docs"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 text-xs font-semibold transition-all"
        >
          <FileCode2 className="w-3.5 h-3.5" />
          <span>Swagger Docs</span>
        </a>
      </div>

      {/* Control Actions */}
      <div className="flex items-center gap-4">
        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
        </button>

        {/* User Info & Logout */}
        <div className="flex items-center gap-3 pl-3 border-l border-gray-800">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-gray-200">{user?.name}</p>
            <p className="text-[10px] text-gray-400 font-mono">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-1.5 text-xs font-medium"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
