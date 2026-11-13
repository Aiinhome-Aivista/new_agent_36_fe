import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Send, 
  Code2, 
  Loader2, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Info,
  Sparkles
} from 'lucide-react';
import MessageBubble from '../MessageBubble/MessageBubble';
import { api } from '../../services/api';

const PROGRAMMING_LANGUAGES = [
  { id: 'all', label: 'All Languages' },
  { id: 'c#', label: 'C#' },
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'go', label: 'Go' },
  { id: 'sql', label: 'SQL' },
  { id: 'c++', label: 'C++' },
  { id: 'php', label: 'PHP' },
];

export default function ChatInterface({ sessionId, onSessionChange }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [attachedCode, setAttachedCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  // Check URL search parameters (when navigated from Landing Page starter cards)
  useEffect(() => {
    const q = searchParams.get('q');
    const lang = searchParams.get('lang');
    if (q) {
      setInputQuery(q);
      if (lang) setSelectedLanguage(lang);
      // Clean query from URL
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  // Load conversation on sessionId change
  useEffect(() => {
    if (sessionId) {
      loadConversation(sessionId);
    }
  }, [sessionId]);

  const loadConversation = async (sid) => {
    try {
      const data = await api.getConversation(sid);
      if (data.success && data.messages) {
        setMessages(data.messages);
      }
    } catch (e) {
      setMessages([]);
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    const query = inputQuery.trim();
    if (!query || isLoading) return;

    const userMessage = {
      role: 'user',
      message: query,
      attached_code: attachedCode.trim() || null,
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setAttachedCode('');
    setShowCodeInput(false);
    setIsLoading(true);

    let activeAssistantMsg = {
      role: 'assistant',
      message: '',
      user_query: query,
      answer_source: 'none',
      similarity_score: 0.0,
      retrieved_functions: [],
      query_intent: null
    };

    setStreamingMessage(activeAssistantMsg);

    await api.sendChatStream({
      query: query,
      sessionId: sessionId,
      selectedLanguage: selectedLanguage,
      attachedCode: userMessage.attached_code,
      onMetadata: (metadata) => {
        activeAssistantMsg = {
          ...activeAssistantMsg,
          answer_source: metadata.source,
          similarity_score: metadata.similarity_score,
          retrieved_functions: metadata.retrieved_functions || [],
          query_intent: metadata.intent
        };
        setStreamingMessage({ ...activeAssistantMsg });
      },
      onToken: (token) => {
        activeAssistantMsg.message += token;
        setStreamingMessage({ ...activeAssistantMsg });
      },
      onDone: (doneData) => {
        setIsLoading(false);
        setMessages((prev) => [...prev, activeAssistantMsg]);
        setStreamingMessage(null);
      },
      onError: (err) => {
        setIsLoading(false);
        activeAssistantMsg.message += `\n\n*[Error: ${err.message || 'Connection lost'}]*`;
        setMessages((prev) => [...prev, activeAssistantMsg]);
        setStreamingMessage(null);
      }
    });
  };

  const handleClearChat = async () => {
    if (sessionId) {
      await api.deleteConversation(sessionId).catch(() => {});
    }
    setMessages([]);
    setStreamingMessage(null);
  };

  return (
    <div className="flex flex-col h-full bg-bg-base relative transition-colors duration-250">
      {/* Top Filter and Controls Bar */}
      <div className="px-6 py-2.5 border-b border-border-subtle bg-bg-panel flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            Scope:
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="text-xs py-1 px-2.5 rounded-lg border border-border-subtle bg-bg-input text-text-primary font-medium focus:outline-none focus:border-brand-primary"
          >
            {PROGRAMMING_LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
              title="Clear Conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto divide-y divide-border-subtle/50 custom-scrollbar">
        {messages.length === 0 && !streamingMessage && (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-brand-primary flex items-center justify-center mb-4">
              <Code2 className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-text-primary mb-1 font-display">
              Developer Knowledge Assistant
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed mb-6">
              Ask natural language questions to discover existing organizational functions, understand implementation behavior, or request performance optimizations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left w-full text-xs">
              {[
                "Find functions that validate parts or breakers",
                "Explain the IsRealBreakerPart method",
                "Can you improve this function's performance?",
                "Convert this C# rule to Python"
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setInputQuery(suggestion)}
                  className="p-2.5 rounded-xl border border-border-subtle bg-bg-card hover:bg-bg-hover hover:border-brand-orangeBorder text-text-primary transition-all text-left"
                >
                  "{suggestion}"
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <MessageBubble key={index} message={msg} />
        ))}

        {streamingMessage && (
          <MessageBubble message={streamingMessage} />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Area */}
      <div className="p-4 border-t border-border-subtle bg-bg-panel">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto space-y-2">
          {/* Collapsible Attached Code Snippet Box */}
          {showCodeInput && (
            <div className="rounded-xl border border-brand-orangeBorder bg-bg-input p-3 space-y-1 text-xs">
              <div className="flex items-center justify-between text-[11px] text-text-secondary font-medium">
                <span className="flex items-center space-x-1">
                  <Code2 className="w-3.5 h-3.5 text-brand-primary" />
                  <span>Attach Code Snippet (Query Context)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowCodeInput(false)}
                  className="text-text-muted hover:text-text-primary"
                >
                  Hide
                </button>
              </div>
              <textarea
                rows={4}
                value={attachedCode}
                onChange={(e) => setAttachedCode(e.target.value)}
                placeholder="Paste original or proposed code here..."
                className="w-full p-2.5 bg-bg-card rounded-lg border border-border-subtle font-mono text-[11px] text-text-primary focus:outline-none focus:border-brand-primary resize-y"
              />
            </div>
          )}

          {/* Main Input Row */}
          <div className="flex items-end space-x-2 bg-bg-input border border-border-subtle rounded-2xl p-2 focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary transition-all">
            <button
              type="button"
              onClick={() => setShowCodeInput(!showCodeInput)}
              className={`p-2 rounded-xl text-xs flex items-center space-x-1 transition-colors ${
                showCodeInput || attachedCode
                  ? 'bg-brand-primary text-white'
                  : 'text-text-muted hover:text-brand-primary hover:bg-bg-hover'
              }`}
              title="Attach Code"
            >
              <Code2 className="w-4 h-4" />
            </button>

            <textarea
              rows={1}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask code query or search existing functions... (Enter to send)"
              className="flex-1 bg-transparent text-xs text-text-primary placeholder-text-placeholder focus:outline-none resize-none py-1.5 max-h-32 leading-relaxed"
            />

            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="p-2 rounded-xl bg-brand-button hover:bg-brand-hover text-white disabled:opacity-40 transition-colors shadow-xs"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
