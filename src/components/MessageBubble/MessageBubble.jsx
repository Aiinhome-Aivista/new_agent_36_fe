import React, { useState } from 'react';
import { User, Bot, Sparkles, CheckCircle, Database, Code, ChevronRight, Layers } from 'lucide-react';
import FunctionCard from '../FunctionCard/FunctionCard';
import SaveToKBPrompt from '../SaveToKBPrompt/SaveToKBPrompt';
import CodeViewer from '../CodeViewer/CodeViewer';

export default function MessageBubble({ message, onKBSaved }) {
  const isUser = message.role === 'user';
  const isKBHit = message.answer_source === 'kb_hit';
  const isLLMFallback = message.answer_source === 'llm_fallback';
  const [showAttachedCode, setShowAttachedCode] = useState(false);

  // Helper to render markdown-like text with clean code blocks
  const renderFormattedContent = (text) => {
    if (!text) return null;

    const regex = /```([a-zA-Z0-9_#+]*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, match.index)
        });
      }
      parts.push({
        type: 'code',
        language: match[1] || 'code',
        content: match[2]
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex)
      });
    }

    return (
      <div className="space-y-2">
        {parts.map((p, idx) => {
          if (p.type === 'code') {
            return (
              <CodeViewer
                key={idx}
                code={p.content.trim()}
                language={p.language}
              />
            );
          }
          return (
            <div key={idx} className="whitespace-pre-wrap leading-relaxed text-xs text-text-primary">
              {p.content}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`py-4 px-4 sm:px-6 flex space-x-3.5 transition-colors duration-200 ${
      isUser ? 'bg-bg-input/60' : 'bg-bg-card'
    }`}>
      {/* Role Avatar */}
      <div className="shrink-0 pt-0.5">
        {isUser ? (
          <div className="w-7 h-7 rounded-full bg-bg-hover border border-border-subtle text-text-secondary flex items-center justify-center font-semibold text-xs shadow-xs">
            <User className="w-4 h-4" />
          </div>
        ) : (
          <div className="w-7 h-7 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-xs shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Header line with role & badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-text-primary">
              {isUser ? 'Developer' : 'DevKnow Assistant'}
            </span>

            {/* Answer Source Badge */}
            {!isUser && isKBHit && (
              <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <Database className="w-3 h-3 text-emerald-500" />
                <span>From Knowledge Base</span>
                {message.similarity_score !== undefined && (
                  <span className="ml-1 opacity-75">({Math.round(message.similarity_score * 100)}% match)</span>
                )}
              </span>
            )}

            {!isUser && isLLMFallback && (
              <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                <Sparkles className="w-3 h-3 text-blue-500" />
                <span>LLM Generated</span>
              </span>
            )}

            {/* Intent Badge */}
            {message.query_intent && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-input text-text-muted font-mono border border-border-subtle">
                {message.query_intent.replace('_', ' ')}
              </span>
            )}
          </div>
        </div>

        {/* User Attached Code snippet if present */}
        {isUser && message.attached_code && (
          <div className="my-1.5">
            <button
              onClick={() => setShowAttachedCode(!showAttachedCode)}
              className="text-[11px] text-brand-primary hover:underline flex items-center space-x-1 font-medium mb-1"
            >
              <Code className="w-3.5 h-3.5" />
              <span>{showAttachedCode ? 'Hide attached code snippet' : 'View attached code snippet'}</span>
            </button>
            {showAttachedCode && (
              <CodeViewer code={message.attached_code} language="code" title="User Attached Code" />
            )}
          </div>
        )}

        {/* Retrieved Functions Cards */}
        {!isUser && message.retrieved_functions && message.retrieved_functions.length > 0 && (
          <div className="my-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-text-primary pb-1 border-b border-border-subtle">
              <span className="flex items-center space-x-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-500" />
                <span>Retrieved Verified Runbook Functions ({message.retrieved_functions.length})</span>
              </span>
            </div>
            {message.retrieved_functions.map((fn) => (
              <FunctionCard key={fn.id} func={fn} isExpandedDefault={message.retrieved_functions.length === 1} />
            ))}
          </div>
        )}

        {/* Text Content */}
        <div className="text-text-primary text-xs">
          {renderFormattedContent(message.message)}
        </div>

        {/* Save to KB Prompt if response was an LLM fallback */}
        {!isUser && isLLMFallback && message.message && (
          <SaveToKBPrompt
            query={message.user_query || 'Developer query'}
            responseText={message.message}
            similarityScore={message.similarity_score}
            onSaved={onKBSaved}
          />
        )}
      </div>
    </div>
  );
}
