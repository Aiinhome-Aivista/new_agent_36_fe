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
  Loader2
} from 'lucide-react';
import { api } from '../services/api';
import FileUpload from '../components/FileUpload/FileUpload';
import FunctionCard from '../components/FunctionCard/FunctionCard';

export default function KnowledgeBase() {
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'upload' | 'ai_learned'
  const [functions, setFunctions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isReindexing, setIsReindexing] = useState(false);
  const [reindexSuccess, setReindexSuccess] = useState(null);

  useEffect(() => {
    if (activeTab === 'browse' || activeTab === 'ai_learned') {
      fetchFunctions();
    }
  }, [activeTab, selectedLanguage, selectedSource]);

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
        setTimeout(() => setReindexSuccess(null), 4000);
      }
    } catch (err) {
      alert(`Re-indexing failed: ${err.message}`);
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
      }
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
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
          onClick={() => setActiveTab('upload')}
          className={`pb-2.5 flex items-center space-x-1.5 border-b-2 transition-colors ${
            activeTab === 'upload'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload & Ingest Excel</span>
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
        {activeTab === 'upload' ? (
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
