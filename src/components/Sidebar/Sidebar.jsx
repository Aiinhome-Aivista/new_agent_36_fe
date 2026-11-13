import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  BotMessageSquare, 
  Database, 
  LayoutDashboard, 
  FileCode2,
  Sun,
  Moon
} from 'lucide-react';

export default function Sidebar({ theme, toggleTheme, isCollapsed = false }) {
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/chat', label: 'Developer Assistant', icon: BotMessageSquare },
    { to: '/knowledge-base', label: 'Knowledge Base', icon: Database },
  ];

  return (
    <aside
      className={`bg-bg-panel border-r border-border-subtle flex flex-col h-screen select-none shrink-0 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* ── Brand Header ── */}
      <div className={`border-b border-border-subtle transition-all duration-300 ${
        isCollapsed ? 'p-3.5 flex justify-center' : 'p-4 flex items-center justify-between'
      }`}>
        <div 
          onClick={() => navigate('/')} 
          className="flex items-center space-x-2.5 cursor-pointer group"
          title="Return to Landing Page"
        >
          <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-sm font-bold group-hover:scale-105 transition-transform shrink-0">
            <FileCode2 className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden whitespace-nowrap">
              <h1 className="font-bold text-base leading-tight tracking-tight text-text-primary font-display">
                Dev<span className="text-brand-primary">Know</span>
              </h1>
              <p className="text-[10px] text-text-muted font-medium">Code Intelligence RAG</p>
            </div>
          )}
        </div>

        {/* Theme Toggle Button (When expanded) */}
        {!isCollapsed && (
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
        )}
      </div>

      {/* ── Main Navigation Links ── */}
      <nav className={`flex-1 py-4 space-y-1.5 ${isCollapsed ? 'px-2 flex flex-col items-center' : 'px-3'}`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                isCollapsed
                  ? `flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
                      isActive
                        ? 'bg-bg-hover text-brand-primary font-bold shadow-xs'
                        : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                    }`
                  : `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-bg-hover text-brand-primary font-bold border-l-4 border-brand-primary shadow-xs'
                        : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                    }`
              }
            >
              <Icon className={isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* ── Architecture Highlights Footer ── */}
      <div className={`border-t border-border-subtle bg-bg-card/40 shrink-0 transition-all duration-300 ${
        isCollapsed ? 'p-2.5 flex flex-col items-center space-y-2' : 'p-4'
      }`}>
        {isCollapsed ? (
          <>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-border-subtle hover:border-brand-orangeBorder bg-bg-card hover:bg-bg-hover text-text-secondary hover:text-brand-primary transition-all duration-200"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-gray-600" />
              )}
            </button>
            <div 
              className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse cursor-pointer"
              title="Knowledge Base Active"
            />
          </>
        ) : (
          <div className="text-[11px] text-text-secondary space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-text-primary">Knowledge Base</span>
              </span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">
                Active
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-text-muted">
              <span>Grounding:</span>
              <span className="font-semibold text-text-primary">Verified Runbooks</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
