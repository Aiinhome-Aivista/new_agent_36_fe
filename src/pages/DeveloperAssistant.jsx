import React from 'react';
import { PanelLeftOpen } from 'lucide-react';
import ChatInterface from '../components/ChatInterface/ChatInterface';
import ChatHistorySidebar from '../components/ChatHistorySidebar/ChatHistorySidebar';

export default function DeveloperAssistant({ 
  sessionId, 
  onSessionChange, 
  onNewChat,
  onConversationUpdated,
  refreshTrigger,
  isHistoryOpen,
  setIsHistoryOpen
}) {
  return (
    <div className="flex-1 flex h-screen overflow-hidden bg-bg-base">
      {/* ── Child Sidebar: Collapsible Chat Session History (Left-to-Right) ── */}
      <ChatHistorySidebar
        isOpen={isHistoryOpen}
        onToggle={() => setIsHistoryOpen(false)}
        activeSessionId={sessionId}
        onSelectSession={onSessionChange}
        onNewChat={onNewChat}
        refreshTrigger={refreshTrigger}
      />

      {/* ── Main Chat Area ── */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-bg-base">
        {/* Top Header with Child Sidebar Toggle */}
        <header className="px-5 py-3 border-b border-border-subtle bg-bg-panel flex items-center justify-between shrink-0 transition-colors duration-250">
          <div className="flex items-center space-x-3">
            {/* Toggle button visible when child sidebar is collapsed */}
            {!isHistoryOpen && (
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="p-1.5 rounded-xl border border-border-subtle hover:border-brand-orangeBorder bg-bg-card hover:bg-bg-hover text-text-secondary hover:text-brand-primary transition-all shadow-xs"
                title="Open Chat History Sidebar"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            )}

            <div>
              <h2 className="text-sm font-bold text-text-primary font-display flex items-center space-x-2">
                <span>Developer Knowledge Assistant</span>
              </h2>
              <p className="text-[11px] text-text-muted">
                RAG-powered organizational code intelligence & multi-language assistance
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 text-[11px] text-text-muted">
            <span className="font-mono bg-bg-input px-2.5 py-1 rounded-lg border border-border-subtle text-text-primary text-[10px]">
              Session: {sessionId?.slice(0, 8)}...
            </span>
          </div>
        </header>

        {/* Main Chat Interface */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface 
            sessionId={sessionId} 
            onSessionChange={onSessionChange} 
            onConversationUpdated={onConversationUpdated}
          />
        </div>
      </div>
    </div>
  );
}
