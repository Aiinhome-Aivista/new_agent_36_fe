import React, { useState } from 'react';
import { 
  Sparkles, 
  Database, 
  Code, 
  Copy, 
  Check, 
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  ThumbsUp
} from 'lucide-react';
import FunctionCard from '../FunctionCard/FunctionCard';
import SaveToKBPrompt from '../SaveToKBPrompt/SaveToKBPrompt';
import CodeViewer from '../CodeViewer/CodeViewer';
import ThinkingAccordion from '../ThinkingAccordion/ThinkingAccordion';

export default function MessageBubble({ message, onKBSaved }) {
  const isUser = message.role === 'user';
  const isKBHit = message.answer_source === 'kb_hit';
  const isLLMFallback = message.answer_source === 'llm_fallback';
  const isGuardrailBlocked = message.answer_source === 'guardrail_blocked' || message.query_intent === 'out_of_scope';
  const isSecurityBlocked = message.answer_source === 'security_blocked' || message.query_intent === 'prompt_injection';
  const isStreaming = Boolean(message.is_streaming);
  const [showAttachedCode, setShowAttachedCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyMessage = () => {
    if (!message.message) return;
    navigator.clipboard.writeText(message.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to parse markdown-like bold, code spans, lists, and code blocks
  const renderFormattedContent = (text) => {
    if (!text) return null;

    // Split text by code fence blocks ```lang\ncode\n```
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

    // Secondary line-by-line renderer for text segments
    const renderTextSegment = (textContent, isLastSegment) => {
      const lines = textContent.split('\n');
      return (
        <div className="space-y-2 leading-relaxed text-sm text-text-primary">
          {lines.map((line, lIdx) => {
            const trimmed = line.trim();
            if (!trimmed) {
              return <div key={lIdx} className="h-1.5" />;
            }

            // Headings (### or ##)
            if (trimmed.startsWith('### ')) {
              return (
                <h4 key={lIdx} className="font-bold text-sm sm:text-base text-text-primary pt-2 pb-0.5 font-display">
                  {parseInlineMarkdown(trimmed.replace(/^###\s+/, ''))}
                </h4>
              );
            }
            if (trimmed.startsWith('## ')) {
              return (
                <h3 key={lIdx} className="font-extrabold text-base sm:text-lg text-text-primary pt-3 pb-1 font-display">
                  {parseInlineMarkdown(trimmed.replace(/^##\s+/, ''))}
                </h3>
              );
            }

            // Gemini-style bullet points with hollow circle bullets (○)
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
              const bulletText = trimmed.replace(/^[-*]\s+/, '');
              return (
                <div key={lIdx} className="flex items-start space-x-3 pl-2 my-1">
                  <span className="text-text-muted text-base leading-none select-none mt-0.5">○</span>
                  <span className="flex-1 text-sm text-text-primary leading-relaxed">
                    {parseInlineMarkdown(bulletText)}
                  </span>
                </div>
              );
            }

            // Numbered lists
            const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
            if (numMatch) {
              return (
                <div key={lIdx} className="flex items-start space-x-3 pl-2 my-1">
                  <span className="text-brand-primary font-mono text-xs font-bold select-none mt-0.5">{numMatch[1]}.</span>
                  <span className="flex-1 text-sm text-text-primary leading-relaxed">
                    {parseInlineMarkdown(numMatch[2])}
                  </span>
                </div>
              );
            }

            // Blockquotes
            if (trimmed.startsWith('> ')) {
              return (
                <blockquote key={lIdx} className="border-l-2 border-brand-orangeBorder pl-3 py-1.5 text-text-secondary italic bg-bg-input/40 rounded-r-xl my-1.5">
                  {parseInlineMarkdown(trimmed.replace(/^>\s+/, ''))}
                </blockquote>
              );
            }

            // Standard line with inline markdown support
            return (
              <p key={lIdx} className="leading-relaxed">
                {parseInlineMarkdown(line)}
                {isStreaming && isLastSegment && lIdx === lines.length - 1 && (
                  <span className="inline-block w-2 h-4 ml-1 bg-brand-primary align-middle animate-pulse" />
                )}
              </p>
            );
          })}
        </div>
      );
    };

    // Helper for bold and inline code spans
    const parseInlineMarkdown = (lineStr) => {
      const spanRegex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
      const spans = [];
      let curIdx = 0;
      let spanMatch;

      while ((spanMatch = spanRegex.exec(lineStr)) !== null) {
        if (spanMatch.index > curIdx) {
          spans.push(lineStr.substring(curIdx, spanMatch.index));
        }
        const token = spanMatch[0];
        if (token.startsWith('**') && token.endsWith('**')) {
          spans.push(
            <strong key={spanMatch.index} className="font-semibold text-text-primary">
              {token.slice(2, -2)}
            </strong>
          );
        } else if (token.startsWith('`') && token.endsWith('`')) {
          spans.push(
            <code key={spanMatch.index} className="font-mono text-xs px-1.5 py-0.5 rounded-md bg-bg-input text-brand-primary border border-border-subtle">
              {token.slice(1, -1)}
            </code>
          );
        }
        curIdx = spanMatch.index + token.length;
      }

      if (curIdx < lineStr.length) {
        spans.push(lineStr.substring(curIdx));
      }

      return spans.length > 0 ? spans : lineStr;
    };

    return (
      <div className="space-y-3">
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
            <React.Fragment key={idx}>
              {renderTextSegment(p.content, idx === parts.length - 1)}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const shouldShowSaveToKB = !isUser && 
    isLLMFallback && 
    !isGuardrailBlocked &&
    !isSecurityBlocked &&
    !isStreaming && 
    message.message && 
    message.query_intent !== 'greeting' &&
    message.query_intent !== 'out_of_scope' &&
    message.query_intent !== 'prompt_injection' &&
    message.answer_source !== 'guardrail_blocked' &&
    message.answer_source !== 'security_blocked' &&
    (message.message.includes('```') || message.message.length > 180);

  // ── Gemini-Style User Message (Right-aligned sleek rounded bubble) ──
  if (isUser) {
    return (
      <div className="flex justify-end w-full animate-fade-in-up py-1.5">
        <div className="max-w-[85%] sm:max-w-[75%] rounded-[24px] rounded-br-md px-5 py-3.5 bg-bg-card border border-border-subtle/80 text-text-primary text-sm shadow-xs leading-relaxed space-y-2">
          <div className="whitespace-pre-wrap">{message.message}</div>

          {message.attached_code && (
            <div className="pt-2 border-t border-border-subtle/60 text-xs">
              <button
                onClick={() => setShowAttachedCode(!showAttachedCode)}
                className="text-brand-primary hover:underline flex items-center space-x-1 font-mono text-[11px]"
              >
                <Code className="w-3.5 h-3.5" />
                <span>{showAttachedCode ? 'Hide Attached Code' : 'View Attached Code'}</span>
              </button>
              {showAttachedCode && (
                <div className="mt-2">
                  <CodeViewer code={message.attached_code} language="code" title="Attached Code Context" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Gemini-Style Assistant Message (Left-aligned clean canvas) ──
  return (
    <div className="flex items-start space-x-3.5 sm:space-x-4 w-full animate-fade-in-up py-2">
      {/* DevKnow Spark Icon (Like Gemini Spark) */}
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand-primary/10 border border-brand-orangeBorder/30 text-brand-primary flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
        <Sparkles className="w-4 h-4 text-brand-primary" />
      </div>

      {/* Message Column */}
      <div className="flex-1 min-w-0 space-y-2.5">
        {/* Top Badges (Discreet & Minimal) */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-xs text-text-primary font-display">
              DevKnow
            </span>

            {isKBHit && (
              <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>From Runbook</span>
                {message.similarity_score !== undefined && (
                  <span className="ml-1 opacity-75 font-mono">({Math.round(message.similarity_score * 100)}%)</span>
                )}
              </span>
            )}

            {isSecurityBlocked ? (
              <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/30">
                <ShieldAlert className="w-3 h-3 text-rose-500" />
                <span>Security Alert</span>
              </span>
            ) : isGuardrailBlocked ? (
              <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/30">
                <ShieldAlert className="w-3 h-3 text-amber-500" />
                <span>Domain Guardrail</span>
              </span>
            ) : isLLMFallback && (
              <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-bg-input text-text-muted border border-border-subtle">
                <span>General AI</span>
              </span>
            )}
          </div>
        </div>

        {/* Collapsible Thinking / Reasoning Process (Claude / Gemini 2.0 style) */}
        {(message.thinking_steps || isStreaming) && (
          <ThinkingAccordion
            thinkingSteps={message.thinking_steps}
            isStreaming={isStreaming && !message.message}
            latencyMs={message.latency_ms}
          />
        )}

        {/* Retrieved Functions Cards */}
        {message.retrieved_functions && message.retrieved_functions.length > 0 && (
          <div className="my-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-text-primary pb-1 border-b border-border-subtle">
              <span className="flex items-center space-x-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-500" />
                <span>Retrieved Runbook Functions ({message.retrieved_functions.length})</span>
              </span>
            </div>
            {message.retrieved_functions.map((fn) => (
              <FunctionCard key={fn.id} func={fn} isExpandedDefault={message.retrieved_functions.length === 1} />
            ))}
          </div>
        )}

        {/* Text Content */}
        <div className="text-text-primary text-sm leading-relaxed">
          {message.message ? (
            renderFormattedContent(message.message)
          ) : isStreaming ? (
            <div className="flex items-center space-x-2 text-xs text-text-muted py-1">
              <span className="inline-block w-2 h-3.5 bg-brand-primary animate-pulse" />
              <span>DevKnow is drafting response...</span>
            </div>
          ) : null}
        </div>

        {/* Bottom Actions Row (Copy, Thumbs, etc.) */}
        {!isStreaming && message.message && (
          <div className="flex items-center space-x-3 pt-2 text-text-muted">
            <button
              onClick={handleCopyMessage}
              className="flex items-center space-x-1 text-xs hover:text-text-primary px-2 py-1 rounded-lg hover:bg-bg-card transition-colors"
              title="Copy message"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500 text-[11px] font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Copy</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Save to KB Prompt if response was an LLM fallback and has technical content */}
        {shouldShowSaveToKB && (
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
