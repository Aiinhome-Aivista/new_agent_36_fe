import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileCode, CheckCircle2, Sparkles, Tag } from 'lucide-react';
import CodeViewer from '../CodeViewer/CodeViewer';

export default function FunctionCard({ func, isExpandedDefault = false }) {
  const [expanded, setExpanded] = useState(isExpandedDefault);

  if (!func) return null;

  const isLLM = func.knowledge_source === 'llm_generated';

  return (
    <div className="border border-border-subtle rounded-xl bg-bg-card overflow-hidden my-2.5 transition-all shadow-xs hover:border-brand-orangeBorder">
      {/* Header Bar */}
      <div 
        onClick={() => setExpanded(!expanded)}
        className="p-3 bg-bg-hover flex items-center justify-between cursor-pointer select-none border-b border-border-subtle hover:bg-bg-input transition-colors"
      >
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className={`p-1.5 rounded-lg ${isLLM ? 'bg-blue-500/10 text-blue-500' : 'bg-orange-500/10 text-brand-primary'}`}>
            {isLLM ? <Sparkles className="w-4 h-4" /> : <FileCode className="w-4 h-4" />}
          </div>
          <div className="truncate">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-xs text-text-primary font-mono">
                {func.function_name}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-input text-text-secondary border border-border-subtle uppercase font-medium">
                {func.programming_language}
              </span>
              {func.framework && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  {func.framework}
                </span>
              )}
              <span className="text-[10px] text-text-muted">v{func.version || '1.0.0'}</span>
            </div>
            {func.rule_version_name && (
              <p className="text-[11px] text-text-muted truncate mt-0.5">
                Module: <span className="font-medium text-text-primary">{func.rule_version_name}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {func.similarity !== undefined && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              {Math.round(func.similarity * 100)}% Match
            </span>
          )}
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
            isLLM 
              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30' 
              : 'bg-orange-500/10 text-brand-primary border border-brand-orangeBorder/30'
          }`}>
            {isLLM ? 'AI Learned' : 'Excel Runbook'}
          </span>
          <button className="text-text-muted hover:text-text-primary p-1">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Content: Verified implementation */}
      {expanded && (
        <div className="p-3.5 space-y-3 bg-bg-card text-xs">
          {func.description && (
            <div>
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block mb-1">
                Description
              </span>
              <p className="text-text-secondary leading-relaxed bg-bg-input p-2.5 rounded-lg border border-border-subtle">
                {func.description}
              </p>
            </div>
          )}

          <div>
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block mb-1">
              Function Header / Signature
            </span>
            <div className="p-2 rounded-lg bg-bg-input border border-border-subtle font-mono text-[11px] text-text-primary">
              {func.function_header}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block mb-1">
              Exact Stored Implementation (Source of Truth)
            </span>
            <CodeViewer
              code={func.function_body}
              language={func.programming_language}
              title={`${func.function_name} implementation`}
            />
          </div>

          {(func.class_name || func.namespace) && (
            <div className="flex flex-wrap gap-2 text-[11px] pt-1 text-text-muted">
              {func.class_name && (
                <span><strong>Class:</strong> {func.class_name}</span>
              )}
              {func.namespace && (
                <span><strong>Namespace:</strong> {func.namespace}</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
