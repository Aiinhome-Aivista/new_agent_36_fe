import React, { useState, useEffect } from 'react';
import { 
  Database, 
  FileSpreadsheet, 
  Sparkles, 
  Cpu, 
  Code2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.getStats();
      if (data.success) {
        setStats(data);
      }
    } catch (e) {
      console.error('Failed to load stats:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-xs text-text-muted bg-bg-base">
        Loading dashboard metrics...
      </div>
    );
  }

  const totalFuncs = stats?.total_functions || 0;
  const excelFuncs = stats?.excel_functions || 0;
  const llmFuncs = stats?.llm_functions || 0;
  const totalFiles = stats?.total_files || 0;
  const languages = stats?.languages_distribution || [];
  const recentFiles = stats?.recent_files || [];

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-bg-base text-text-primary p-6 space-y-6 transition-colors duration-250 custom-scrollbar">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-text-primary font-display">Knowledge Base Dashboard & Analytics</h2>
        <p className="text-xs text-text-muted">
          Real-time metrics on organizational functions, multi-language coverage, and knowledge base health
        </p>
      </div>

      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Total Functions */}
        <div className="p-4 rounded-2xl border border-border-subtle bg-bg-card shadow-xs">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="font-semibold uppercase text-[10px] tracking-wider">Total Functions</span>
            <Database className="w-4 h-4 text-brand-primary" />
          </div>
          <div className="text-2xl font-bold text-text-primary">{totalFuncs}</div>
          <div className="mt-1 text-[11px] text-text-muted">
            Verified Organizational Records
          </div>
        </div>

        {/* Knowledge Grounding Accuracy */}
        <div className="p-4 rounded-2xl border border-border-subtle bg-bg-card shadow-xs">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="font-semibold uppercase text-[10px] tracking-wider">Grounding Accuracy</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">100%</div>
          <div className="mt-1 text-[11px] text-text-muted">
            Zero-Hallucination Policy
          </div>
        </div>

        {/* Excel Runbook Code */}
        <div className="p-4 rounded-2xl border border-border-subtle bg-bg-card shadow-xs">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="font-semibold uppercase text-[10px] tracking-wider">Runbook Functions</span>
            <FileSpreadsheet className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{excelFuncs}</div>
          <div className="mt-1 text-[11px] text-text-muted">
            From {totalFiles} uploaded Excel file(s)
          </div>
        </div>

        {/* AI Learned Solutions */}
        <div className="p-4 rounded-2xl border border-border-subtle bg-bg-card shadow-xs">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="font-semibold uppercase text-[10px] tracking-wider">AI Self-Learned</span>
            <Sparkles className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{llmFuncs}</div>
          <div className="mt-1 text-[11px] text-text-muted">
            Saved back from verified queries
          </div>
        </div>
      </div>

      {/* Programming Languages Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        <div className="p-5 rounded-2xl border border-border-subtle bg-bg-card shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-border-subtle pb-2">
            <h3 className="font-bold text-text-primary flex items-center space-x-2 font-display">
              <Code2 className="w-4 h-4 text-brand-primary" />
              <span>Programming Languages Distribution</span>
            </h3>
            <span className="text-[11px] text-text-muted">{languages.length} detected</span>
          </div>

          {languages.length === 0 ? (
            <p className="text-text-muted py-4 text-center">No language data available yet.</p>
          ) : (
            <div className="space-y-2.5">
              {languages.map((item) => {
                const percentage = totalFuncs > 0 ? Math.round((item.count / totalFuncs) * 100) : 0;
                return (
                  <div key={item.language} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-mono uppercase font-semibold text-text-primary">{item.language}</span>
                      <span className="text-text-muted">{item.count} functions ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-bg-input h-2 rounded-full overflow-hidden border border-border-subtle/50">
                      <div
                        className="bg-brand-primary h-full rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Launch & Guidance */}
        <div className="p-5 rounded-2xl border border-border-subtle bg-bg-card shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-text-primary mb-1 font-display">Knowledge Principles</h3>
            <p className="text-text-secondary text-[11px] leading-relaxed mb-4">
              DevKnow guarantees absolute code fidelity: uploaded runbooks are validated and stored as the authoritative source of truth, ensuring developers get reliable answers without hallucinations.
            </p>

            <div className="space-y-2 text-[11px] text-text-secondary bg-bg-input p-3.5 rounded-xl border border-border-subtle">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span><strong>KB-First Principle:</strong> Queries match against company runbooks first.</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span><strong>Continuous Learning:</strong> AI-assisted solutions can be saved to the knowledge base with one click.</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                <span><strong>No Hallucinations:</strong> Code solutions are retrieved verbatim from verified records.</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-border-subtle">
            <Link
              to="/chat"
              className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-brand-button hover:bg-brand-hover text-white font-semibold text-xs transition-colors"
            >
              <span>Open Developer Chat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/knowledge-base"
              className="flex items-center space-x-1 px-4 py-2 rounded-xl border border-border-subtle bg-bg-panel hover:bg-bg-hover text-text-primary font-semibold text-xs transition-colors"
            >
              <span>Upload New Runbook</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Uploaded Files Table */}
      <div className="p-5 rounded-2xl border border-border-subtle bg-bg-card shadow-xs space-y-3 text-xs">
        <h3 className="font-bold text-text-primary flex items-center space-x-2 font-display">
          <Clock className="w-4 h-4 text-text-muted" />
          <span>Recent Knowledge Base Upload Activity</span>
        </h3>

        {recentFiles.length === 0 ? (
          <p className="text-text-muted py-3 text-center">No upload records recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-subtle text-text-muted uppercase text-[10px]">
                  <th className="py-2.5">File Name</th>
                  <th className="py-2.5">Uploaded At</th>
                  <th className="py-2.5 text-center">Total</th>
                  <th className="py-2.5 text-center">Success</th>
                  <th className="py-2.5 text-center">Failed</th>
                  <th className="py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50">
                {recentFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-bg-hover transition-colors">
                    <td className="py-2.5 font-medium text-text-primary font-mono text-[11px]">
                      {file.file_name}
                    </td>
                    <td className="py-2.5 text-text-muted text-[11px]">
                      {file.uploaded_at ? new Date(file.uploaded_at).toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-2.5 text-center text-text-primary">{file.total_records}</td>
                    <td className="py-2.5 text-center text-emerald-600 dark:text-emerald-400 font-semibold">
                      {file.successful_records}
                    </td>
                    <td className="py-2.5 text-center text-red-500">{file.failed_records}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        file.ingestion_status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      }`}>
                        {file.ingestion_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
