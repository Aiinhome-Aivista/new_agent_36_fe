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
    </div>
  );
}
