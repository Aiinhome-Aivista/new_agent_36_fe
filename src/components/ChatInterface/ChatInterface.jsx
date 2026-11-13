import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Code2,
  Trash2,
  Sparkles,
  Plus,
  ArrowUp,
} from "lucide-react";
import MessageBubble from "../MessageBubble/MessageBubble";
import { api } from "../../services/api";

export default function ChatInterface({
  sessionId,
  onSessionChange,
  onConversationUpdated,
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState("");
  const [attachedCode, setAttachedCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [inputQuery]);

  // Check URL search parameters (when navigated from Landing Page starter cards)
  useEffect(() => {
    const q = searchParams.get("q");
    const lang = searchParams.get("lang");
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
      role: "user",
      message: query,
      attached_code: attachedCode.trim() || null,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery("");
    setAttachedCode("");
    setShowCodeInput(false);
    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    let activeAssistantMsg = {
      role: "assistant",
      message: "",
      user_query: query,
      answer_source: "none",
      similarity_score: 0.0,
      retrieved_functions: [],
      query_intent: null,
      thinking_steps: [],
      latency_ms: 0,
      is_streaming: true,
    };

    setStreamingMessage(activeAssistantMsg);
    let streamFinished = false;

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
          query_intent: metadata.intent,
          thinking_steps: metadata.thinking_steps || [],
          latency_ms: metadata.latency_ms || 0,
        };
        setStreamingMessage({ ...activeAssistantMsg });
      },
      onToken: (token) => {
        activeAssistantMsg.message += token;
        setStreamingMessage({ ...activeAssistantMsg });
      },
      onDone: (doneData) => {
        if (streamFinished) return;
        streamFinished = true;
        setIsLoading(false);
        const finalMsg = { ...activeAssistantMsg, is_streaming: false };
        setMessages((prev) => [...prev, finalMsg]);
        setStreamingMessage(null);
        onConversationUpdated?.();
      },
      onError: (err) => {
        if (streamFinished) return;
        streamFinished = true;
        setIsLoading(false);
        console.error("[DevKnow Stream Connection Error]:", err);
        const fallbackText =
          activeAssistantMsg.retrieved_functions?.length > 0
            ? activeAssistantMsg.message ||
              "I have retrieved the relevant organizational function(s) above. You can view their complete implementation details in the function cards."
            : activeAssistantMsg.message ||
              "Unable to reach the assistant service. Please check your connection and try again.";
        const finalMsg = {
          ...activeAssistantMsg,
          message: fallbackText,
          is_streaming: false,
          is_error: !activeAssistantMsg.message,
        };
        setMessages((prev) => [...prev, finalMsg]);
        setStreamingMessage(null);
        onConversationUpdated?.();
      },
    });
  };

  const handleClearChat = async () => {
    if (sessionId) {
      await api.deleteConversation(sessionId).catch(() => {});
      onConversationUpdated?.();
    }
    setMessages([]);
    setStreamingMessage(null);
  };

  return (
    <div className="flex flex-col h-full bg-bg-base relative transition-colors duration-250">
      {/* Top Subtle Header Bar with Clear Chat */}
      {messages.length > 0 && (
        <div className="px-6 py-2 flex items-center justify-end z-10 shrink-0 border-b border-border-subtle/40 bg-bg-base">
          <button
            onClick={handleClearChat}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
            title="Clear Conversation"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Chat</span>
          </button>
        </div>
      )}

      {/* ── Messages Scroll Area (Gemini-style spacious center column, NO divide-y) ── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 custom-scrollbar">
        <div className="max-w-3xl sm:max-w-4xl mx-auto space-y-6">
          {/* Empty Conversation Welcome Screen */}
          {messages.length === 0 && !streamingMessage && (
            <div className="h-full flex flex-col items-center justify-center py-16 text-center max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-4 shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2 font-display">
                Hello, Developer
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-8 max-w-md">
                Ask questions to search company runbooks, understand complex
                code implementations, or optimize logic with zero
                hallucinations.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left w-full text-xs">
                {[
                  "Find functions that validate parts or breakers",
                  "Explain the IsRealBreakerPart method",
                  "Can you improve this function's performance?",
                  "Convert this C# rule to Python",
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInputQuery(suggestion);
                      textareaRef.current?.focus();
                    }}
                    className="p-3 rounded-2xl border border-border-subtle bg-bg-card hover:bg-bg-hover hover:border-brand-orangeBorder text-text-primary transition-all text-left shadow-xs"
                  >
                    "{suggestion}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Render All Messages */}
          {messages.map((msg, index) => (
            <MessageBubble 
              key={msg.id || index} 
              message={msg} 
              onKBSaved={onConversationUpdated} 
            />
          ))}

          {/* Active Streaming Message */}
          {streamingMessage && (
            <MessageBubble 
              message={streamingMessage} 
              onKBSaved={onConversationUpdated} 
            />
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Gemini Floating Rounded Input Area ── */}
      <div className="w-full pb-4 px-4 bg-gradient-to-t from-bg-base via-bg-base to-transparent pt-2 shrink-0">
        <div className="max-w-3xl sm:max-w-4xl mx-auto">
          <form onSubmit={handleSend} className="space-y-2">
            {/* Collapsible Attached Code Snippet Box */}
            {showCodeInput && (
              <div className="rounded-2xl border border-brand-orangeBorder bg-bg-input p-3.5 space-y-1.5 text-xs shadow-md animate-fade-in-up">
                <div className="flex items-center justify-between text-[11px] text-text-secondary font-medium">
                  <span className="flex items-center space-x-1.5">
                    <Code2 className="w-4 h-4 text-brand-primary" />
                    <span>Attach Code Snippet (Query Context)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCodeInput(false)}
                    className="text-text-muted hover:text-text-primary px-2 py-0.5 rounded hover:bg-bg-hover"
                  >
                    Hide
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={attachedCode}
                  onChange={(e) => setAttachedCode(e.target.value)}
                  placeholder="Paste code here..."
                  className="w-full p-2.5 bg-bg-card rounded-xl border border-border-subtle font-mono text-[11px] text-text-primary focus:outline-none focus:border-brand-primary resize-y"
                />
              </div>
            )}

            {/* Gemini Floating Pill Container */}
            <div className="rounded-[28px] bg-bg-card border border-border-subtle focus-within:border-brand-primary p-3 shadow-lg transition-all duration-200">
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask DevKnow or search code..."
                className="w-full bg-transparent text-sm text-text-primary placeholder-text-placeholder focus:outline-none resize-none px-3 py-1.5 max-h-36 leading-relaxed"
              />

              {/* Bottom Controls Row inside Pill */}
              <div className="flex items-center justify-between pt-2 px-1">
                {/* Left: Attach Code (+) button */}
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowCodeInput(!showCodeInput)}
                    className={`p-2 rounded-full text-xs flex items-center justify-center transition-colors ${
                      showCodeInput || attachedCode
                        ? "bg-brand-primary text-white"
                        : "text-text-muted hover:text-text-primary hover:bg-bg-hover"
                    }`}
                    title="Attach Code Context"
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  {attachedCode && (
                    <span className="text-[11px] bg-brand-primary/10 text-brand-primary px-2.5 py-0.5 rounded-full font-mono font-medium flex items-center space-x-1">
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Code attached</span>
                    </span>
                  )}
                </div>

                {/* Right: Grounding Status + Send Button */}
                <div className="flex items-center space-x-2">
                  <span className="hidden sm:inline-flex items-center space-x-1.5 text-[11px] text-text-muted px-2.5 py-1 rounded-full bg-bg-input">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Grounded KB</span>
                  </span>

                  <button
                    type="submit"
                    disabled={isLoading || !inputQuery.trim()}
                    className="w-8 h-8 rounded-full bg-brand-button hover:bg-brand-hover text-white disabled:opacity-30 flex items-center justify-center transition-all shadow-xs active:scale-95"
                    title="Send message"
                  >
                    {isLoading ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ArrowUp className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Gemini-style Disclaimer */}
          <p className="text-[11px] text-text-muted text-center pt-2 select-none">
            DevKnow is an AI assistant and can make mistakes. Verify critical
            code and runbook logic.
          </p>
        </div>
      </div>
    </div>
  );
}
