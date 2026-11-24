import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  RefreshCw, 
  Filter, 
  Upload, 
  Sparkles, 
  FileCode,
  Trash2,
  CheckCircle,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Check,
  X,
  Code2
} from 'lucide-react';
import { api, formatApiError } from '../services/api';
import { useToast } from '../context/ToastContext';
import FileUpload from '../components/FileUpload/FileUpload';
import FunctionCard from '../components/FunctionCard/FunctionCard';

export default function KnowledgeBase() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'staging' | 'upload' | 'ai_learned'
  const [functions, setFunctions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isReindexing, setIsReindexing] = useState(false);
  const [reindexSuccess, setReindexSuccess] = useState(null);

  // ── Staging / Verification Queue State ──
  const [stagingItems, setStagingItems] = useState([]);
  const [stagingCount, setStagingCount] = useState(0);
  const [isLoadingStaging, setIsLoadingStaging] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(null);

  useEffect(() => {
    fetchStagingQueue();
  }, []);

  useEffect(() => {
    if (activeTab === 'browse' || activeTab === 'ai_learned') {
      fetchFunctions();
    } else if (activeTab === 'staging') {
      fetchStagingQueue();
    }
  }, [activeTab, selectedLanguage, selectedSource]);

  const fetchStagingQueue = async () => {
    setIsLoadingStaging(true);
    try {
      const res = await api.getStagingQueue('pending_review');
      if (res.success) {
        setStagingItems(res.items || []);
        setStagingCount(res.count || 0);
      }
    } catch (err) {
      console.error('Failed to fetch staging queue:', err);
    } finally {
      setIsLoadingStaging(false);
    }
  };

  const handleApproveStaged = async (funcId) => {
    setActionInProgress(funcId);
    try {
      const res = await api.approveStagedFunction(funcId);
      if (res.success) {
        setStagingItems((prev) => prev.filter((item) => item.id !== funcId));
        setStagingCount((prev) => Math.max(0, prev - 1));
        fetchFunctions();
        toast.success(res.message || 'Function approved and added to knowledge base');
      } else {
        toast.error(res.message || res.error || 'Failed to approve function');
      }
    } catch (err) {
      toast.error(formatApiError(err, 'Failed to approve function'));
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRejectStaged = async (funcId) => {
    if (!window.confirm('Reject this function? It will be permanently excluded from the Knowledge Base.')) return;
    setActionInProgress(funcId);
    try {
      const res = await api.rejectStagedFunction(funcId);
      if (res.success) {
        setStagingItems((prev) => prev.filter((item) => item.id !== funcId));
        setStagingCount((prev) => Math.max(0, prev - 1));
        toast.success(res.message || 'Function rejected from staging queue');
      } else {
        toast.error(res.message || res.error || 'Failed to reject function');
      }
    } catch (err) {
      toast.error(formatApiError(err, 'Failed to reject function'));
    } finally {
      setActionInProgress(null);
    }
  };

  const fetchFunctions = async () => {
    setIsLoading(true);
    try {
      const sourceFilter = activeTab === 'ai_learned' ? 'llm_generated' : selectedSource;
      const data = await api.getFunctions({
        q: searchQuery,
        language: selectedLanguage,
        source: sourceFilter,
        limit: 50
      });
      if (data.success) {
        setFunctions(data.functions);
        setTotalCount(data.total);
      }
    } catch (err) {
      console.error('Failed to fetch functions:', err);
      toast.error(formatApiError(err, 'Failed to load functions'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFunctions();
  };

  const handleReindex = async () => {
    if (!window.confirm('Synchronize and update knowledge base search indexes?')) return;
    setIsReindexing(true);
    setReindexSuccess(null);
    try {
      const res = await api.reindex();
      if (res.success) {
        setReindexSuccess(res.message);
        toast.success(res.message || 'Search indexes synchronized successfully');
        setTimeout(() => setReindexSuccess(null), 4000);
      } else {
        toast.error(res.message || res.error || 'Re-indexing failed');
      }
    } catch (err) {
      toast.error(formatApiError(err, 'Re-indexing failed'));
    } finally {
      setIsReindexing(false);
    }
  };

  const handleDeleteAILearned = async (funcId) => {
    if (!window.confirm('Delete this AI-learned knowledge record from the knowledge base?')) return;
    try {
      const res = await api.deleteLLMGenerated(funcId);
      if (res.success) {
        setFunctions((prev) => prev.filter((f) => f.id !== funcId));
        setTotalCount((prev) => Math.max(0, prev - 1));
        toast.success(res.message || 'Record deleted from knowledge base');
      } else {
        toast.error(res.message || res.error || 'Failed to delete record');
      }
    } catch (err) {
      toast.error(formatApiError(err, 'Delete failed'));
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-bg-base text-text-primary transition-colors duration-250">
      {/* Page Header */}
      <header className="px-6 py-4 border-b border-border-subtle bg-bg-panel flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-sm font-bold text-text-primary flex items-center space-x-2 font-display">
            <Database className="w-4 h-4 text-brand-primary" />
            <span>Knowledge Base Management</span>
          </h2>
          <p className="text-[11px] text-text-muted">
            Global repository of organizational functions, runbooks, and self-learned solutions
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {reindexSuccess && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center space-x-1 font-medium bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/30">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{reindexSuccess}</span>
            </span>
          )}
          <button
            onClick={handleReindex}
            disabled={isReindexing}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-border-subtle bg-bg-card hover:bg-bg-hover text-text-primary text-xs font-medium transition-colors disabled:opacity-50"
            title="Synchronize search indexes"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReindexing ? 'animate-spin text-brand-primary' : ''}`} />
            <span>{isReindexing ? 'Syncing...' : 'Sync Search Index'}</span>
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-6 pt-3 bg-bg-panel border-b border-border-subtle flex space-x-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('browse')}
          className={`pb-2.5 flex items-center space-x-1.5 border-b-2 transition-colors ${
            activeTab === 'browse'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Browse Functions ({activeTab === 'browse' ? totalCount : '...'})</span>
        </button>

        <button
          onClick={() => setActiveTab('staging')}
          className={`pb-2.5 flex items-center space-x-1.5 border-b-2 transition-colors ${
            activeTab === 'staging'
              ? 'border-amber-500 text-amber-500 font-bold'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          <span>Verification Queue</span>
          {stagingCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-500 font-bold">
              {stagingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('upload')}
          className={`pb-2.5 flex items-center space-x-1.5 border-b-2 transition-colors ${
            activeTab === 'upload'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload & Ingest</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_learned')}
          className={`pb-2.5 flex items-center space-x-1.5 border-b-2 transition-colors ${
            activeTab === 'ai_learned'
              ? 'border-blue-500 text-blue-500 font-bold'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span>AI Self-Learned Knowledge</span>
        </button>
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {activeTab === 'staging' ? (
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs">
              <div className="flex items-center space-x-2.5">
                <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Human-in-the-Loop Verification Queue ({stagingCount})</h4>
                  <p className="text-[11px] text-text-secondary dark:text-amber-200/80">
                    Functions extracted from code files, documentation, or chat learning. Review diffs and verify before committing to the production Knowledge Base.
                  </p>
                </div>
              </div>
              <button
                onClick={fetchStagingQueue}
                className="px-3 py-1.5 rounded-xl border border-amber-500/40 hover:bg-amber-500/20 text-xs font-semibold transition-colors"
              >
                Refresh Queue
              </button>
            </div>

            {isLoadingStaging ? (
              <div className="p-12 text-center text-xs text-text-muted flex flex-col items-center">
                <Loader2 className="w-6 h-6 animate-spin text-brand-primary mb-2" />
                <span>Loading staging queue...</span>
              </div>
            ) : stagingItems.length === 0 ? (
              <div className="p-12 text-center text-xs text-text-muted rounded-2xl border border-dashed border-border-subtle bg-bg-card">
                <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="font-semibold text-text-primary mb-1">Queue is Clear</p>
                <p className="text-text-muted">
                  All functions have been verified. No pending items require review.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {stagingItems.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-border-subtle bg-bg-card p-5 space-y-3.5 shadow-xs">
                    {/* Header */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center space-x-2.5">
                        <span className="font-bold font-mono text-sm text-text-primary">{item.function_name}</span>
                        <span className="px-2 py-0.5 rounded-lg bg-bg-input text-brand-primary font-mono text-[11px] uppercase font-semibold">
                          {item.programming_language}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-500 font-mono text-[11px] font-bold">
                          v{item.version}
                        </span>
                        <span className="text-[11px] text-text-muted font-medium">
                          Source: {item.knowledge_source}
                        </span>
                      </div>

                      {/* Conflict Badge */}
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl flex items-center space-x-1 ${
                        item.conflict_status === 'conflict_detected'
                          ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                      }`}>
                        {item.conflict_status === 'conflict_detected' ? (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Version Conflict Detected</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Clean New Entry</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Conflict Explanation if present */}
                    {item.conflicting_parent && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] space-y-1">
                        <p className="font-semibold text-amber-600 dark:text-amber-400">
                          ⚠️ Existing version found in Knowledge Base: <strong>v{item.conflicting_parent.version}</strong> (ID #{item.conflicting_parent.id})
                        </p>
                        <p className="text-text-secondary">
                          Approving this function will increment its version to <strong>v{item.version}</strong> and link to the previous implementation as an audit trail.
                        </p>
                      </div>
                    )}

                    {/* Description & AST Metadata */}
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {item.description}
                    </p>
                    {item.additional_metadata && (
                      <div className="text-[11px] font-mono text-text-muted bg-bg-input p-2 rounded-xl">
                        {item.additional_metadata}
                      </div>
                    )}

                    {/* Code Preview */}
                    <div className="rounded-xl overflow-hidden border border-border-subtle bg-bg-input">
                      <div className="px-3 py-1.5 border-b border-border-subtle/60 text-[10px] font-mono text-text-muted flex items-center justify-between">
                        <span>Code Implementation</span>
                        <span className="uppercase">{item.programming_language}</span>
                      </div>
                      <pre className="p-3 text-[11px] font-mono text-text-primary overflow-x-auto max-h-48 custom-scrollbar">
                        <code>{item.function_body}</code>
                      </pre>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-border-subtle/50">
                      <button
                        onClick={() => handleRejectStaged(item.id)}
                        disabled={actionInProgress === item.id}
                        className="px-3.5 py-1.5 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApproveStaged(item.id)}
                        disabled={actionInProgress === item.id}
                        className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                      >
                        {actionInProgress === item.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Indexing...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve & Ingest to KB</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'upload' ? (
          <div className="max-w-2xl mx-auto">
            <FileUpload
              onUploadComplete={() => {
                fetchFunctions();
              }}
            />
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-4">
            {/* Search and Filters Bar */}
            <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2">
              <div className="flex-1 min-w-[240px] relative">
                <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by function name, module, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-border-subtle bg-bg-card text-xs text-text-primary placeholder-text-placeholder focus:outline-none focus:border-brand-primary"
                />
              </div>

              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="text-xs py-1.5 px-3 rounded-xl border border-border-subtle bg-bg-card text-text-primary focus:outline-none focus:border-brand-primary"
              >
                <option value="all">All Languages</option>
                {['c#', 'python', 'java', 'javascript', 'typescript', 'go', 'sql', 'c++', 'php'].map((l) => (
                  <option key={l} value={l}>{l.toUpperCase()}</option>
                ))}
              </select>

              {activeTab !== 'ai_learned' && (
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="text-xs py-1.5 px-3 rounded-xl border border-border-subtle bg-bg-card text-text-primary focus:outline-none focus:border-brand-primary"
                >
                  <option value="all">All Sources</option>
                  <option value="excel">Excel Runbooks</option>
                  <option value="llm_generated">AI Learned</option>
                </select>
              )}

              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-brand-button hover:bg-brand-hover text-white text-xs font-semibold shadow-xs"
              >
                Search
              </button>
            </form>

            {/* Function List */}
            {isLoading ? (
              <div className="p-12 text-center text-xs text-text-muted flex flex-col items-center">
                <Loader2 className="w-6 h-6 animate-spin text-brand-primary mb-2" />
                <span>Loading function records...</span>
              </div>
            ) : functions.length === 0 ? (
              <div className="p-12 text-center text-xs text-text-muted rounded-2xl border border-dashed border-border-subtle bg-bg-card">
                <Database className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-50" />
                <p className="font-semibold text-text-primary mb-1">No function records found</p>
                <p className="text-text-muted">
                  {searchQuery || selectedLanguage !== 'all'
                    ? 'Try adjusting your search query or language filter.'
                    : 'Upload an Excel runbook in the "Upload & Ingest Excel" tab to populate the knowledge base.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {functions.map((func) => (
                  <div key={func.id} className="relative group">
                    <FunctionCard func={func} />
                    {func.knowledge_source === 'llm_generated' && (
                      <button
                        onClick={() => handleDeleteAILearned(func.id)}
                        className="absolute right-12 top-3 text-text-muted hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete this AI-learned record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
