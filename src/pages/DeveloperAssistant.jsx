import React from 'react';
import ChatInterface from '../components/ChatInterface/ChatInterface';

export default function DeveloperAssistant({ sessionId, onSessionChange }) {
  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-bg-base">
      {/* Top Header */}
      <header className="px-6 py-3.5 border-b border-border-subtle bg-bg-panel flex items-center justify-between shrink-0 transition-colors duration-250">
        <div>
          <h2 className="text-sm font-bold text-text-primary font-display">Developer Knowledge Assistant</h2>
          <p className="text-[11px] text-text-muted">
            RAG-powered organizational code intelligence & multi-language assistance
          </p>
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-text-muted">
          <span className="font-mono bg-bg-input px-2.5 py-1 rounded-lg border border-border-subtle text-text-primary text-[10px]">
            Session: {sessionId?.slice(0, 8)}...
          </span>
        </div>
      </header>

      {/* Main Chat Interface */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface sessionId={sessionId} onSessionChange={onSessionChange} />
      </div>
    </div>
  );
}
