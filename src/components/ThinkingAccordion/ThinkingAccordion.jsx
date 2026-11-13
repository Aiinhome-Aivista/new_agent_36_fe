import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronDown, ChevronRight, Brain, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

export default function ThinkingAccordion({ thinkingSteps = [], isStreaming = false, latencyMs = 0 }) {
  // During active streaming, open by default so user sees real-time reasoning.
  // When completed, collapse by default like Claude / Gemini 2.0.
  const [isOpen, setIsOpen] = useState(isStreaming);

  useEffect(() => {
    if (isStreaming) {
      setIsOpen(true);
    }
  }, [isStreaming]);

  if (!thinkingSteps || thinkingSteps.length === 0) {
    if (isStreaming) {
      return (
        <div className="my-2.5 px-3.5 py-2.5 rounded-xl border border-brand-orangeBorder/40 bg-bg-hover text-xs flex items-center space-x-2.5 animate-pulse">
          <Brain className="w-4 h-4 text-brand-primary animate-spin" style={{ animationDuration: '3s' }} />
          <span className="font-semibold text-text-primary text-[11px]">
            DevKnow is thinking & searching organizational runbooks...
          </span>
        </div>
      );
    }
    return null;
  }

  const durationSec = latencyMs > 0 ? (latencyMs / 1000).toFixed(1) : (thinkingSteps.length * 0.2).toFixed(1);

  return (
    <div className="my-2.5 rounded-xl border border-border-subtle bg-bg-panel/70 overflow-hidden transition-all duration-200">
      {/* Header bar / Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-bg-hover transition-colors select-none group"
      >
        <div className="flex items-center space-x-2 text-xs">
          <div className="w-5 h-5 rounded-md bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
            {isStreaming ? (
              <Brain className="w-3.5 h-3.5 animate-pulse text-brand-primary" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
            )}
          </div>
          <span className="font-semibold text-text-secondary group-hover:text-text-primary text-[11px]">
            {isStreaming ? 'Thinking process...' : `Thought process (${durationSec}s)`}
          </span>
          {isStreaming && (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-primary animate-ping" />
          )}
        </div>

        <div className="flex items-center space-x-1 text-text-muted text-[11px]">
          <span className="text-[10px] uppercase font-mono tracking-wider opacity-60">
            {isOpen ? 'Hide' : `${thinkingSteps.length} steps`}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Expanded Reasoning Steps */}
      {isOpen && (
        <div className="px-3.5 pb-3 pt-1 border-t border-border-subtle/60 space-y-2 text-xs">
          {thinkingSteps.map((step, idx) => (
            <div key={idx} className="flex items-start space-x-2.5 text-[11px] leading-relaxed">
              <div className="mt-0.5 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/80" />
              </div>
              <div className="flex-1">
                <span className="font-semibold text-text-primary mr-1.5">
                  {step.title}:
                </span>
                <span className="text-text-secondary">
                  {step.detail}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
