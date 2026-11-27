import React, { useState, useRef, useCallback } from 'react';
import {
  UploadCloud, FolderArchive, Loader2, CheckCircle2,
  AlertCircle, FileCode2, ChevronDown, ChevronUp,
  RefreshCw, XCircle, Archive, FolderOpen, ShieldAlert,
  ShieldCheck, HelpCircle, Filter, Database, Layers,
  FileText, Code, Download, Eye, X, Copy
} from 'lucide-react';
import { api, formatApiError } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function CodebaseUpload({ onComplete }) {
  const toast = useToast();
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const pollTimerRef = useRef(null);

  // Ingestion Mode: 'folder' | 'zip'
  const [ingestionMode, setIngestionMode] = useState('folder');

  // Form Inputs
  const [localFolderPath, setLocalFolderPath] = useState('');
  const [userInstructions, setUserInstructions] = useState('');
  const [selectedFolderFiles, setSelectedFolderFiles] = useState(null);
  const [selectedFolderName, setSelectedFolderName] = useState('');
  const [folderFilterStats, setFolderFilterStats] = useState(null);
  const [isPickingFolder, setIsPickingFolder] = useState(false);

  // Execution Lifecycle: idle | uploading | polling | completed | failed
  const [phase, setPhase] = useState('idle');
  const [dragOver, setDragOver] = useState(false);
  const [selectedZipFile, setSelectedZipFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [jobData, setJobData] = useState(null);
  const [showFileDetails, setShowFileDetails] = useState(false);
  const [selectedLogModal, setSelectedLogModal] = useState(null);

  const handleViewLog = async (logType, title) => {
    if (!jobData?.job_id) return;
    setSelectedLogModal({ title, filename: '', content: '', loading: true });
    try {
      const res = await api.getCodebaseJobLog(jobData.job_id, logType);
      const textContent = logType === 'json' ? JSON.stringify(res.manifest, null, 2) : res.content;
      setSelectedLogModal({
        title,
        filename: res.filename,
        content: textContent,
        loading: false,
      });
    } catch (err) {
      toast.error('Failed to load log file: ' + formatApiError(err));
      setSelectedLogModal(null);
    }
  };

  const handleDownloadLog = () => {
    if (!selectedLogModal?.content) return;
    const blob = new Blob([selectedLogModal.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedLogModal.filename || 'ingestion.log';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Polling Loop ───────────────────────────────────────────────────────

  const startPolling = useCallback((jobId) => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);

    pollTimerRef.current = setInterval(async () => {
      try {
        const status = await api.getCodebaseJobStatus(jobId);
        setJobData(status);

        if (status.status === 'completed') {
          clearInterval(pollTimerRef.current);
          setPhase('completed');
          toast.success(
            `Codebase ingested! ${status.total_functions_staged} function(s) processed into Knowledge Base.`
          );
          if (onComplete) onComplete(status);
        } else if (status.status === 'failed') {
          clearInterval(pollTimerRef.current);
          setPhase('failed');
          setUploadError(status.error_message || 'Processing failed.');
          toast.error(status.error_message || 'Codebase ingestion failed.');
        }
      } catch (err) {
        console.warn('Status poll retry notice:', err.message);
      }
    }, 2000);
  }, [toast, onComplete]);

  // ── Submit Local Folder (Direct Path Scan) ──────────────────────────────

  const handleStartLocalScan = async (e) => {
    e?.preventDefault();

    // If browser folder files were selected via webkitdirectory picker:
    if (selectedFolderFiles && selectedFolderFiles.length > 0) {
      setPhase('uploading');
      setUploadError(null);
      setJobData(null);

      try {
        const result = await api.uploadFolderFiles(
          selectedFolderFiles,
          userInstructions,
          selectedFolderName || 'Selected_Folder'
        );

        if (!result.success && !result.job_id) {
          setUploadError(result.message || result.error || 'Folder upload failed.');
          setPhase('failed');
          return;
        }

        setJobData(result);
        setPhase('polling');
        startPolling(result.job_id);
        toast.info(`Processing ${result.estimated_files || selectedFolderFiles.length} files in background`);
      } catch (err) {
        setUploadError(formatApiError(err, 'Failed to scan selected folder.'));
        setPhase('failed');
      }
      return;
    }

    // Direct path mode
    if (!localFolderPath.trim()) {
      setUploadError('Please specify a local folder path or click "Browse Local Folder".');
      return;
    }

    setPhase('uploading');
    setUploadError(null);
    setJobData(null);

    try {
      const result = await api.scanLocalCodebase(localFolderPath.trim(), userInstructions.trim());

      if (!result.success && !result.job_id) {
        setUploadError(result.message || result.error || 'Failed to start folder scan.');
        setPhase('failed');
        return;
      }

      setJobData(result);
      setPhase('polling');
      startPolling(result.job_id);
      toast.info(`Scanning local folder: ${result.estimated_files} files queued for ingestion.`);
    } catch (err) {
      setUploadError(formatApiError(err, 'Failed to scan local folder path.'));
      setPhase('failed');
    }
  };

  // ── Handle Native Folder Selection ─────────────────────────────────────

  const handleFolderPicked = (e) => {
    const rawFiles = e.target.files;
    if (rawFiles && rawFiles.length > 0) {
      const CLIENT_BLACKLIST = new Set([
        'node_modules', 'venv', '.venv', 'env', '__pycache__', '.git',
        'bin', 'obj', 'dist', 'build', '.idea', '.vscode', '.tox', 'coverage'
      ]);
      const SUPPORTED_EXTS = new Set([
        '.py', '.cs', '.ts', '.js', '.jsx', '.tsx',
        '.java', '.go', '.cpp', '.c', '.h', '.hpp', '.md', '.txt'
      ]);

      const filtered = [];
      for (let i = 0; i < rawFiles.length; i++) {
        const f = rawFiles[i];
        const pathParts = (f.webkitRelativePath || f.name).split('/');
        const isBlacklisted = pathParts.some((part) => CLIENT_BLACKLIST.has(part.toLowerCase()));
        if (isBlacklisted) continue;

        const dotIdx = f.name.lastIndexOf('.');
        const ext = dotIdx !== -1 ? f.name.substring(dotIdx).toLowerCase() : '';
        if (SUPPORTED_EXTS.has(ext)) {
          filtered.push(f);
        }
      }

      const firstPath = rawFiles[0].webkitRelativePath || '';
      const topDir = firstPath.split('/')[0] || 'Selected_Folder';
      setSelectedFolderName(topDir);
      setLocalFolderPath(topDir);
      setSelectedFolderFiles(filtered);
      setFolderFilterStats({ total: rawFiles.length, kept: filtered.length });

      toast.success(
        `Selected "${topDir}": filtered ${rawFiles.length.toLocaleString()} files down to ${filtered.length} source files (excluded venv/node_modules).`
      );
    }
  };

  const handleBrowseFolderClick = async () => {
    setIsPickingFolder(true);
    try {
      const res = await api.pickLocalFolder();
      if (res?.folder_path) {
        setLocalFolderPath(res.folder_path);
        setSelectedFolderFiles(null);
        setFolderFilterStats(null);
        toast.success(`Selected folder: ${res.folder_path}`);
        return;
      }
      if (res?.canceled) {
        return;
      }
    } catch (err) {
      // Fallback to HTML folder picker if native picker is unavailable
      folderInputRef.current?.click();
    } finally {
      setIsPickingFolder(false);
    }
  };

  // ── Zip Upload ─────────────────────────────────────────────────────────

  const handleZipUpload = useCallback(async (file) => {
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'zip') {
      setUploadError('Only .zip archives are supported in archive mode.');
      return;
    }

    setPhase('uploading');
    setUploadError(null);
    setJobData(null);

    try {
      const result = await api.uploadCodebase(file);

      if (!result.success && !result.job_id) {
        setUploadError(result.message || result.error || 'Upload failed.');
        setPhase('failed');
        return;
      }

      setJobData(result);
      setPhase('polling');
      startPolling(result.job_id);
      toast.info(`Processing ${result.estimated_files} file(s) in background.`);
    } catch (err) {
      setUploadError(formatApiError(err, 'Failed to upload codebase archive.'));
      setPhase('failed');
    }
  }, [toast, startPolling]);

  const resetAll = () => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    setPhase('idle');
    setLocalFolderPath('');
    setUserInstructions('');
    setSelectedFolderFiles(null);
    setSelectedFolderName('');
    setSelectedZipFile(null);
    setUploadError(null);
    setJobData(null);
    setShowFileDetails(false);
  };

  const progressPct = jobData?.progress_percent ?? 0;

  return (
    <div className="space-y-5">
      {/* Mode Switcher Tabs */}
      {phase === 'idle' && (
        <div className="flex items-center space-x-2 p-1 rounded-xl bg-bg-input border border-border-subtle w-fit text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setIngestionMode('folder'); setUploadError(null); }}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${
              ingestionMode === 'folder'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Local Folder Scan (Direct)</span>
          </button>
          <button
            type="button"
            onClick={() => { setIngestionMode('zip'); setUploadError(null); }}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${
              ingestionMode === 'zip'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Zip Archive Upload</span>
          </button>
        </div>
      )}

      {/* Mode 1: Local Folder Ingestion */}
      {phase === 'idle' && ingestionMode === 'folder' && (
        <form onSubmit={handleStartLocalScan} className="p-5 rounded-2xl bg-bg-card border border-border-subtle space-y-4">
          <div>
            <div className="flex items-center space-x-2 text-text-primary font-bold text-sm mb-1">
              <FolderOpen className="w-4 h-4 text-brand-primary" />
              <span>Direct Local Codebase Ingestion</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Point DevKnow directly to a local project directory on your machine. Clean code is automatically 
              verified and indexed into the Knowledge Base with versioning. Only corrupt code or security risks are quarantined.
            </p>
          </div>

          {/* Folder Path / Picker Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-primary flex items-center justify-between">
              <span>Local Folder Path or Selection</span>
              {selectedFolderFiles && (
                <span className="text-[11px] font-normal text-emerald-600 dark:text-emerald-400">
                  ✓ {selectedFolderFiles.length} source files selected
                  {folderFilterStats && folderFilterStats.total > selectedFolderFiles.length && (
                    <span className="text-text-muted ml-1 font-normal">
                      (filtered out {(folderFilterStats.total - selectedFolderFiles.length).toLocaleString()} venv/library files)
                    </span>
                  )}
                </span>
              )}
            </label>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="e.g. C:\Users\ADMIN\Desktop\MyBackend or /home/user/project"
                value={localFolderPath}
                onChange={(e) => {
                  setLocalFolderPath(e.target.value);
                  setSelectedFolderFiles(null);
                  setFolderFilterStats(null);
                }}
                className="flex-1 px-3.5 py-2 rounded-xl border border-border-subtle bg-bg-input text-xs text-text-primary placeholder-text-placeholder focus:outline-none focus:border-brand-primary"
              />

              {/* Native OS Folder Picker Button */}
              <input
                ref={folderInputRef}
                type="file"
                webkitdirectory="true"
                directory="true"
                multiple
                className="hidden"
                onChange={handleFolderPicked}
              />
              <button
                type="button"
                onClick={handleBrowseFolderClick}
                disabled={isPickingFolder}
                className="px-3 py-2 rounded-xl border border-border-subtle bg-bg-panel hover:bg-bg-hover text-text-primary text-xs font-semibold transition-colors flex items-center space-x-1.5 shrink-0 disabled:opacity-50"
                title="Select folder from Windows Explorer"
              >
                {isPickingFolder ? (
                  <Loader2 className="w-3.5 h-3.5 text-brand-primary animate-spin" />
                ) : (
                  <FolderOpen className="w-3.5 h-3.5 text-brand-primary" />
                )}
                <span>{isPickingFolder ? 'Selecting...' : 'Browse Folder'}</span>
              </button>
            </div>

            {/* Folder Selection Guidance Tip */}
            <div className="flex items-start space-x-2 text-[11px] text-text-muted bg-bg-input p-2.5 rounded-xl border border-border-subtle">
              <HelpCircle className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-text-secondary leading-relaxed">
                  <strong>Automatic Path Fill:</strong> Clicking <strong className="text-text-primary">"Browse Folder"</strong> opens your native Windows folder picker dialog. When you select any project folder, its <strong>full disk path is automatically filled</strong> into the input box above with <strong>zero browser upload warnings</strong>! You can also paste any path manually.
                </p>
              </div>
            </div>
          </div>

          {/* Optional Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-primary flex items-center space-x-1.5">
              <Filter className="w-3.5 h-3.5 text-brand-primary" />
              <span>Optional Filter Instructions (Natural Language)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 'only read python files' or 'only services and controllers' (leave empty to scan all)"
              value={userInstructions}
              onChange={(e) => setUserInstructions(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-border-subtle bg-bg-input text-xs text-text-primary placeholder-text-placeholder focus:outline-none focus:border-brand-primary"
            />
          </div>

          {/* Safety Guarantee Callout */}
          <div className="p-3 rounded-xl bg-bg-input border border-border-subtle text-[11px] text-text-muted space-y-1">
            <div className="flex items-center space-x-1.5 font-semibold text-text-secondary">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Immutable Safety Blacklist (Always Enforced)</span>
            </div>
            <p>
              Build & dependency folders (<code className="px-1 rounded bg-bg-panel">node_modules</code>, <code className="px-1 rounded bg-bg-panel">.git</code>, <code className="px-1 rounded bg-bg-panel">.venv</code>, <code className="px-1 rounded bg-bg-panel">__pycache__</code>, <code className="px-1 rounded bg-bg-panel">bin</code>, <code className="px-1 rounded bg-bg-panel">dist</code>, binaries, package-locks) are <strong>permanently excluded</strong> and will never enter your Knowledge Base.
            </p>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold shadow-md transition-colors flex items-center justify-center space-x-2"
          >
            <FolderArchive className="w-4 h-4" />
            <span>Scan & Ingest to Knowledge Base</span>
          </button>
        </form>
      )}

      {/* Mode 2: Zip Drag & Drop */}
      {phase === 'idle' && ingestionMode === 'zip' && (
        <div
          onDragEnter={() => setDragOver(true)}
          onDragLeave={() => setDragOver(false)}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleZipUpload(file);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`
            cursor-pointer border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center
            transition-colors duration-200 text-center
            ${dragOver
              ? 'border-brand-primary bg-brand-primary/5'
              : 'border-border-subtle hover:border-brand-primary/50 hover:bg-bg-hover bg-bg-card'
            }
          `}
        >
          <FolderArchive className="w-12 h-12 text-brand-primary/70 mb-3" />
          <p className="text-sm font-semibold text-text-primary mb-1">
            Drop your codebase .zip here
          </p>
          <p className="text-xs text-text-muted">or click to browse from local disk</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleZipUpload(file);
            }}
          />
        </div>
      )}

      {/* Error Message */}
      {uploadError && phase !== 'polling' && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/8 border border-red-500/30 text-xs text-red-500">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold mb-0.5">Ingestion Notice</p>
            <p className="text-red-400">{uploadError}</p>
          </div>
          <button
            onClick={resetAll}
            className="p-1 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Progress & Live Results Card */}
      {(phase === 'uploading' || phase === 'polling' || phase === 'completed' || phase === 'failed') && jobData !== null && (
        <div className={`rounded-2xl border bg-bg-card p-5 space-y-4 ${
          phase === 'completed' ? 'border-emerald-500/40' :
          phase === 'failed' ? 'border-red-500/40' : 'border-brand-primary/30'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {phase === 'completed' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
              ) : phase === 'failed' ? (
                <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
              ) : (
                <Loader2 className="w-6 h-6 text-amber-500 animate-spin shrink-0" />
              )}
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  {phase === 'uploading' && 'Initializing codebase scan...'}
                  {phase === 'polling' && 'Ingesting & vectorizing codebase...'}
                  {phase === 'completed' && 'Knowledge Ingestion Completed!'}
                  {phase === 'failed' && 'Ingestion Halted'}
                </p>
                <p className="text-[11px] text-text-muted">
                  {jobData.archive_name || 'Codebase'} &nbsp;•&nbsp; Job {jobData.job_id || '—'}
                </p>
              </div>
            </div>
            <button
              onClick={resetAll}
              className="p-1.5 hover:bg-bg-hover rounded-xl transition-colors text-text-muted hover:text-text-primary"
              title="Start another scan"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-[11px] text-text-muted mb-1.5">
              <span>
                {jobData.processed_files ?? 0} / {jobData.total_files ?? jobData.estimated_files ?? '?'} files scanned
              </span>
              <span className="font-semibold text-text-primary">{progressPct.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-bg-input rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  phase === 'completed'
                    ? 'bg-emerald-500'
                    : phase === 'failed'
                    ? 'bg-red-500'
                    : 'bg-brand-primary'
                }`}
                style={{ width: `${Math.max(progressPct, phase === 'uploading' ? 2 : 0)}%` }}
              />
            </div>
          </div>

          {/* Smart Ingestion Metrics */}
          <div className="grid grid-cols-3 gap-3 text-[11px]">
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold mb-0.5">Auto-Indexed in KB</p>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                {jobData.total_functions_staged ?? 0}
              </p>
            </div>
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-center">
              <p className="text-amber-600 dark:text-amber-400 font-semibold mb-0.5">Version Updates</p>
              <p className="text-base font-bold text-amber-600 dark:text-amber-400">
                {jobData.total_conflicts ?? 0}
              </p>
            </div>
            <div className="rounded-xl bg-bg-input p-3 text-center">
              <p className="text-text-muted mb-0.5">Blacklisted/Skipped</p>
              <p className="text-base font-bold text-text-primary">{jobData.skipped_files ?? 0}</p>
            </div>
          </div>

          {/* Completion Callout */}
          {phase === 'completed' && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300 flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
              <span>
                <strong>Success!</strong> All clean functions have been directly ingested and vectorized into the Knowledge Base. 
                They are immediately searchable by the DevKnow chat assistant. Any anomalous/quarantined items are waiting in the <strong>Verification Queue</strong>.
              </span>
            </div>
          )}

          {/* Database Persistence Audit Logs (Dedicated Logs for MySQL and VectorDB) */}
          {jobData.audit_logs && (
            <div className="p-3.5 rounded-xl bg-bg-card border border-border-subtle space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-text-primary">
                <div className="flex items-center space-x-1.5">
                  <Database className="w-3.5 h-3.5 text-brand-primary" />
                  <span>Database Ingestion Audit Logs</span>
                </div>
                <span className="text-[10px] font-normal text-text-muted">data/logs/ingestion/</span>
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                Dedicated audit log files were generated to track exactly what was saved in MySQL and ChromaDB without polluting the terminal:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => handleViewLog('mysql', 'MySQL Relational Store Audit')}
                  className="px-2.5 py-2 rounded-xl bg-bg-input hover:bg-bg-hover border border-border-subtle text-left transition-colors flex items-center space-x-2 text-[11px] group"
                >
                  <Database className="w-4 h-4 text-blue-500 shrink-0 group-hover:scale-105 transition-transform" />
                  <div className="min-w-0">
                    <p className="font-semibold text-text-primary truncate">MySQL Log</p>
                    <p className="text-[10px] text-text-muted truncate">Tables & IDs</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleViewLog('vectordb', 'ChromaDB Vector Store Audit')}
                  className="px-2.5 py-2 rounded-xl bg-bg-input hover:bg-bg-hover border border-border-subtle text-left transition-colors flex items-center space-x-2 text-[11px] group"
                >
                  <Layers className="w-4 h-4 text-purple-500 shrink-0 group-hover:scale-105 transition-transform" />
                  <div className="min-w-0">
                    <p className="font-semibold text-text-primary truncate">VectorDB Log</p>
                    <p className="text-[10px] text-text-muted truncate">Chroma Vectors</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleViewLog('summary', 'Ingestion Executive Summary')}
                  className="px-2.5 py-2 rounded-xl bg-bg-input hover:bg-bg-hover border border-border-subtle text-left transition-colors flex items-center space-x-2 text-[11px] group"
                >
                  <FileText className="w-4 h-4 text-emerald-500 shrink-0 group-hover:scale-105 transition-transform" />
                  <div className="min-w-0">
                    <p className="font-semibold text-text-primary truncate">Summary Log</p>
                    <p className="text-[10px] text-text-muted truncate">Overall Audit</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleViewLog('json', 'Structured JSON Manifest')}
                  className="px-2.5 py-2 rounded-xl bg-bg-input hover:bg-bg-hover border border-border-subtle text-left transition-colors flex items-center space-x-2 text-[11px] group"
                >
                  <Code className="w-4 h-4 text-amber-500 shrink-0 group-hover:scale-105 transition-transform" />
                  <div className="min-w-0">
                    <p className="font-semibold text-text-primary truncate">JSON Manifest</p>
                    <p className="text-[10px] text-text-muted truncate">Full Metrics</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* File Results Accordion */}
          {jobData.file_results && jobData.file_results.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setShowFileDetails(!showFileDetails)}
                className="flex items-center space-x-1.5 text-[11px] font-medium text-text-muted hover:text-text-primary transition-colors"
              >
                {showFileDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                <span>{showFileDetails ? 'Hide' : 'Show'} file scan breakdown ({jobData.file_results.length} files)</span>
              </button>

              {showFileDetails && (
                <div className="mt-3 space-y-1.5 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                  {jobData.file_results.map((f, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-[11px] border ${
                        f.status === 'processed'
                          ? 'bg-emerald-500/5 border-emerald-500/20'
                          : f.status === 'error'
                          ? 'bg-red-500/5 border-red-500/20'
                          : 'bg-bg-input border-border-subtle'
                      }`}
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <FileCode2 className={`w-3.5 h-3.5 shrink-0 ${
                          f.status === 'processed' ? 'text-emerald-500' : 'text-text-muted'
                        }`} />
                        <span className="truncate text-text-primary font-mono">{f.file}</span>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        {f.status === 'processed' && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            {f.functions_staged} fn
                          </span>
                        )}
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          f.status === 'processed' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                          f.status === 'error' ? 'bg-red-500/15 text-red-500' :
                          'bg-bg-hover text-text-muted'
                        }`}>
                          {f.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Log Viewer Modal Dialog */}
      {selectedLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-4xl max-h-[85vh] rounded-2xl bg-bg-card border border-border-subtle shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle bg-bg-panel shrink-0">
              <div className="flex items-center space-x-2.5 min-w-0">
                <FileText className="w-4 h-4 text-brand-primary shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-text-primary truncate">{selectedLogModal.title}</h3>
                  <p className="text-[11px] text-text-muted font-mono truncate">{selectedLogModal.filename || 'Loading log...'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                {selectedLogModal.content && (
                  <button
                    type="button"
                    onClick={handleDownloadLog}
                    className="px-2.5 py-1.5 rounded-lg border border-border-subtle bg-bg-card hover:bg-bg-hover text-text-primary text-xs font-medium transition-colors flex items-center space-x-1.5"
                    title="Download log file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedLogModal(null)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-4 bg-slate-950 font-mono text-xs text-slate-200 select-text custom-scrollbar">
              {selectedLogModal.loading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-3 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
                  <p>Loading database audit log from server...</p>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap leading-relaxed">{selectedLogModal.content}</pre>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-border-subtle bg-bg-panel flex items-center justify-between text-xs text-text-muted shrink-0">
              <span>Saved on server at: <code className="text-brand-primary font-mono">data/logs/ingestion/{selectedLogModal.filename}</code></span>
              <button
                type="button"
                onClick={() => setSelectedLogModal(null)}
                className="px-3 py-1.5 rounded-lg bg-bg-card hover:bg-bg-hover border border-border-subtle text-text-primary font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
