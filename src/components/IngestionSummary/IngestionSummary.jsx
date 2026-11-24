import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, FileSpreadsheet, Layers, Hash } from 'lucide-react';

export default function IngestionSummary({ summary, onReset }) {
  if (!summary) return null;

  const isSuccess = summary.success;

  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-card p-6 shadow-xs space-y-4 text-xs transition-colors duration-250">
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center space-x-2.5">
          {isSuccess ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
          <div>
            <h3 className="font-bold text-sm text-text-primary font-display">
              {isSuccess ? 'Ingestion Completed Successfully' : 'Ingestion Failed'}
            </h3>
            <p className="text-[11px] text-text-muted font-mono">{summary.file_name}</p>
          </div>
        </div>
        {onReset && (
          <button
            onClick={onReset}
            className="text-xs text-brand-primary hover:underline font-semibold"
          >
            Upload Another File
          </button>
        )}
      </div>

      {summary.error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{summary.error}</span>
        </div>
      )}

      {isSuccess && (
        <>
          {summary.staged_functions ? (
            /* Code / Doc Staging Summary View */
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-bg-input border border-border-subtle">
                  <span className="text-[10px] uppercase text-text-muted font-semibold block">Total Extracted via AST</span>
                  <span className="text-lg font-bold text-text-primary">{summary.total_extracted}</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <span className="text-[10px] uppercase text-amber-600 dark:text-amber-400 font-semibold block">Conflicts Detected</span>
                  <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{summary.conflicts_count}</span>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30">
                  <span className="text-[10px] uppercase text-blue-500 font-semibold block">Status</span>
                  <span className="text-xs font-bold text-blue-500 block mt-1">Pending Human Review</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs flex items-start space-x-2">
                <Layers className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Zero-Direct-Ingestion Active:</strong> Extracted functions and architectural rules have been staged in the <strong>Verification Queue</strong> with automatic version increments. They are isolated and will not be retrieved in developer chats until reviewed and approved.
                </span>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                {summary.staged_functions.map((fn) => (
                  <div key={fn.id} className="p-2.5 rounded-xl border border-border-subtle bg-bg-input/60 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-semibold text-text-primary">{fn.function_name}</span>
                      <span className="px-1.5 py-0.5 rounded bg-bg-card text-[10px] uppercase font-mono">{fn.language}</span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[10px] font-mono font-bold">v{fn.version}</span>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      fn.conflict_status === 'conflict_detected'
                        ? 'bg-amber-500/15 text-amber-500'
                        : 'bg-emerald-500/15 text-emerald-500'
                    }`}>
                      {fn.conflict_status === 'conflict_detected' ? '⚠️ Version Conflict' : '✨ New Function'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Standard Excel Ingestion Summary */
            <>
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-bg-input border border-border-subtle">
                  <span className="text-[10px] uppercase text-text-muted font-semibold block">Total Records</span>
                  <span className="text-lg font-bold text-text-primary">{summary.total_records}</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-[10px] uppercase text-emerald-600 dark:text-emerald-400 font-semibold block">Indexed</span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{summary.successful_records}</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <span className="text-[10px] uppercase text-amber-600 dark:text-amber-400 font-semibold block">Skipped</span>
                  <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{summary.skipped_records}</span>
                </div>
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                  <span className="text-[10px] uppercase text-red-500 font-semibold block">Failed</span>
                  <span className="text-lg font-bold text-red-500">{summary.failed_records}</span>
                </div>
              </div>

              {/* Languages Detected */}
              <div>
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block mb-1.5">
                  Detected Programming Languages ({summary.languages_detected?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {summary.languages_detected?.map((lang) => (
                    <span
                      key={lang}
                      className="px-2.5 py-1 rounded-lg bg-bg-input text-brand-primary border border-brand-orangeBorder/40 font-mono text-[11px] font-semibold uppercase"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
