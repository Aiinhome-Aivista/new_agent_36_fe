import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Loader2, 
  PanelLeftClose, 
  PanelLeftOpen,
  Clock
} from 'lucide-react';
import { api } from '../../services/api';

export default function ChatHistorySidebar({ 
  isOpen, 
  onToggle, 
  activeSessionId, 
  onSelectSession, 
  onNewChat, 
  refreshTrigger 
}) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadConversations();
  }, [refreshTrigger, activeSessionId]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const res = await api.getConversations();
      if (res.success && res.conversations) {
        setConversations(res.conversations);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async (e, sessionId) => {
    e.stopPropagation();
    try {
      await api.deleteConversation(sessionId);
      setConversations((prev) => prev.filter((c) => c.session_id !== sessionId));
      if (activeSessionId === sessionId) {
        onNewChat();
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  return (
    <aside
      className={`transition-all duration-300 ease-in-out border-r border-border-subtle bg-bg-panel flex flex-col h-full shrink-0 select-none ${
        isOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 pointer-events-none border-r-0'
      } overflow-hidden`}
    >
      <div className="w-64 flex flex-col h-full">
        {/* Top Controls: "+ New chat" and Collapse Toggle */}
        <div className="p-3 border-b border-border-subtle/70 flex items-center justify-between gap-2">
          <button
            onClick={onNewChat}
            className="flex-1 flex items-center space-x-2 py-2 px-3.5 rounded-full bg-bg-card hover:bg-bg-hover text-text-primary border border-border-subtle hover:border-brand-orangeBorder text-xs font-semibold shadow-xs transition-all duration-150 active:scale-[0.98]"
            title="Start a new chat session"
          >
            <Plus className="w-4 h-4 text-brand-primary" />
            <span>New chat</span>
          </button>

          <button
            onClick={onToggle}
            className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors shrink-0"
            title="Collapse history sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Recent Chats Section Header */}
        <div className="px-4 pt-3.5 pb-1.5 flex items-center justify-between text-[11px] font-semibold text-text-muted">
          <span>Recent</span>
          {loading && <Loader2 className="w-3 h-3 animate-spin text-brand-primary" />}
        </div>

        {/* Scrollable Conversation Sessions List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
          {conversations.length === 0 ? (
            <div className="px-3 py-8 text-center text-[11px] text-text-muted">
              No recent chats yet
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = activeSessionId === conv.session_id;
              return (
                <div
                  key={conv.session_id}
                  onClick={() => onSelectSession(conv.session_id)}
                  className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-all duration-150 ${
                    isActive
                      ? 'bg-bg-hover text-brand-primary font-semibold shadow-xs'
                      : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                  }`}
                  title={conv.title}
                >
                  <div className="flex items-center space-x-2.5 truncate mr-2 min-w-0">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    <span className="truncate text-[12px]">{conv.title || 'Untitled chat'}</span>
                  </div>

                  <button
                    onClick={(e) => handleDeleteConversation(e, conv.session_id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-red-500 rounded transition-opacity shrink-0"
                    title="Delete chat session"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}
