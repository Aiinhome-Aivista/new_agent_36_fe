import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  BotMessageSquare, 
  Database, 
  LayoutDashboard, 
  PlusCircle, 
  FileCode2,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';

export default function Sidebar({ onNewChat, activeSessionId, theme, toggleTheme }) {
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/chat', label: 'Developer Assistant', icon: BotMessageSquare },
    { to: '/knowledge-base', label: 'Knowledge Base', icon: Database },
  ];

  const handleNewChatClick = () => {
    onNewChat();
    navigate('/chat');
  };

  return (
    <aside className="w-64 bg-bg-panel border-r border-border-subtle flex flex-col h-screen select-none shrink-0 transition-colors duration-250">
      {/* Brand Header */}
      <div className="p-4 border-b border-border-subtle flex items-center justify-between">
        <div 
          onClick={() => navigate('/')} 
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-lg bg-brand-primary flex items-center justify-center text-white shadow-sm font-bold group-hover:scale-105 transition-transform">
            <FileCode2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight tracking-tight text-text-primary font-display">
              Dev<span className="text-brand-primary">Know</span>
            </h1>
            <p className="text-[11px] text-text-muted font-medium">Code Intelligence RAG</p>
          </div>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg border border-border-subtle hover:border-brand-orangeBorder bg-bg-card hover:bg-bg-hover text-text-secondary hover:text-brand-primary transition-all duration-200"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* New Conversation Button */}
      <div className="p-3">
        <button
          onClick={handleNewChatClick}
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-brand-button hover:bg-brand-hover text-white text-xs font-semibold shadow-sm transition-all duration-150 active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Chat Session</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-bg-hover text-brand-primary font-bold border-l-4 border-brand-primary shadow-xs'
                    : 'text-text-secondary hover:bg-bg-hover hover:text-brand-primary'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Architecture Highlights Footer */}
      <div className="p-4 border-t border-border-subtle bg-bg-card/50">
        <div className="text-[11px] text-text-secondary space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-text-primary">Global KB</span>
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">
              Active
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-text-muted pt-1">
            <span>Theme:</span>
            <span className="font-semibold text-text-primary capitalize">{theme} Mode</span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-text-muted">
            <span>Grounding:</span>
            <span className="font-semibold text-text-primary">Verified Runbooks</span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-text-muted">
            <span>Self-Growing:</span>
            <span className="font-semibold text-blue-500">Enabled</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
