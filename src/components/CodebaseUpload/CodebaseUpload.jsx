import React, { useState, useRef, useCallback } from 'react';
import {
  UploadCloud, FolderArchive, Loader2, CheckCircle2,
  AlertCircle, FileCode2, ChevronDown, ChevronUp,
  RefreshCw, XCircle, Archive
} from 'lucide-react';
import { api, formatApiError } from '../../services/api';
import { useToast } from '../../context/ToastContext';

/**
 * CodebaseUpload Component
 *
 * Provides a drag-and-drop upload interface for a whole codebase .zip archive.
 * After upload, it polls GET /api/codebase/status/{job_id} every 2 seconds and
 * renders a real-time progress bar, per-file result list, and final summary.
 *
 * Key states:
 *   idle      → User has not yet selected a file
 *   uploading → File is being posted to /api/codebase/upload
 *   polling   → Background job is running; frontend polls for progress
 *   completed → Job finished; shows staged function count
 *   failed    → Job or upload failed; shows error message
 */
export default function CodebaseUpload({ onComplete }) {
  const toast = useToast();
  const fileInputRef = useRef(null);
  const pollTimerRef = useRef(null);

  const [phase, setPhase] = useState('idle');     // idle | uploading | polling | completed | failed
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [jobData, setJobData] = useState(null);
  const [showFileDetails, setShowFileDetails] = useState(false);

  // ── Upload ─────────────────────────────────────────────────────────────

  const handleUpload = useCallback(async (file) => {
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'zip') {
      setUploadError('Only .zip archives are supported. Please compress your codebase into a .zip file.');
      return;
    }

    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > 200) {
      setUploadError(`Archive is too large (${sizeMb.toFixed(1)} MB). Maximum: 200 MB.`);
      return;
    }

    setPhase('uploading');
    setUploadError(null);
    setJobData(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await api.uploadCodebase(file);

      if (!result.success && !result.job_id) {
        setUploadError(result.message || result.error || 'Upload failed.');
        setPhase('failed');
        return;
      }

      // Job accepted — start polling
      setJobData(result);
      setPhase('polling');
      startPolling(result.job_id);
      toast.info(`Processing ${result.estimated_files} file(s) in background — job ${result.job_id}`);

    } catch (err) {
      const msg = formatApiError(err, 'Failed to upload codebase archive.');
      setUploadError(msg);
      setPhase('failed');
    }
  }, [toast]);

  // ── Polling ────────────────────────────────────────────────────────────

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
            `Codebase ingested! ${status.total_functions_staged} function(s) staged for review.`
          );
          if (onComplete) onComplete(status);
        } else if (status.status === 'failed') {
          clearInterval(pollTimerRef.current);
          setPhase('failed');
          setUploadError(status.error_message || 'Processing failed.');
          toast.error(status.error_message || 'Codebase ingestion failed.');
        }
      } catch (err) {
        // Don't stop polling on transient network errors; just log
        console.warn('Status poll error (retrying):', err.message);
      }
    }, 2000);
  }, [toast, onComplete]);

  const stopPollingAndReset = () => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    setPhase('idle');
    setSelectedFile(null);
    setUploadError(null);
    setJobData(null);
    setShowFileDetails(false);
  };

  // ── Drag & Drop ────────────────────────────────────────────────────────

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      handleUpload(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      handleUpload(file);
    }
  };

  // ── Render Helpers ─────────────────────────────────────────────────────

  const progressPct = jobData?.progress_percent ?? 0;
  const isActive = phase === 'uploading' || phase === 'polling';

  const statusColor = {
    idle: 'border-brand-primary/30',
    uploading: 'border-blue-500/40',
    polling: 'border-amber-500/40',
    completed: 'border-emerald-500/40',
    failed: 'border-red-500/40',
  }[phase];

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Info Banner */}
      <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle text-xs text-text-secondary space-y-1.5">
        <div className="flex items-center space-x-2 text-text-primary font-semibold text-sm">
          <Archive className="w-4 h-4 text-brand-primary shrink-0" />
          <span>Whole Codebase Upload</span>
        </div>
        <p>
          Compress your entire project into a <code className="bg-bg-input px-1 rounded">.zip</code> archive and upload it here.
          DevKnow will walk every source file, run Tree-sitter AST extraction on each function,
          generate semantic descriptions, and stage them for your review.
        </p>
        <ul className="list-disc list-inside text-[11px] text-text-muted space-y-0.5 pl-1">
          <li>Supported: <code>.py .cs .ts .js .jsx .tsx .java .go .cpp .c</code></li>
          <li>Auto-skipped: <code>__pycache__, node_modules, .git, test files, minified bundles</code></li>
          <li>Dedup: Files with identical content (SHA-256) are skipped automatically</li>
          <li>Max archive size: <strong>200 MB</strong></li>
        </ul>
      </div>

      {/* Drop Zone */}
      {phase === 'idle' && (
        <div
          onDragEnter={() => setDragOver(true)}
          onDragLeave={() => setDragOver(false)}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDrop={handleDrop}
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
          <p className="text-xs text-text-muted">or click to browse</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* Upload Error */}
      {uploadError && phase !== 'polling' && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/8 border border-red-500/30 text-xs text-red-500">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold mb-0.5">Upload Failed</p>
            <p className="text-red-400">{uploadError}</p>
          </div>
          <button
            onClick={stopPollingAndReset}
            className="p-1 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Progress Card */}
      {(phase === 'uploading' || phase === 'polling' || phase === 'completed' || phase === 'failed') && jobData !== null && (
        <div className={`rounded-2xl border bg-bg-card p-5 space-y-4 ${statusColor}`}>
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
                  {phase === 'uploading' && 'Uploading archive...'}
                  {phase === 'polling' && 'Processing codebase...'}
                  {phase === 'completed' && 'Ingestion Complete!'}
                  {phase === 'failed' && 'Ingestion Failed'}
                </p>
                <p className="text-[11px] text-text-muted">
                  {jobData.archive_name || selectedFile?.name || 'Archive'} &nbsp;•&nbsp; Job {jobData.job_id || '—'}
                </p>
              </div>
            </div>
            <button
              onClick={stopPollingAndReset}
              className="p-1.5 hover:bg-bg-hover rounded-xl transition-colors text-text-muted hover:text-text-primary"
              title="Start over"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-[11px] text-text-muted mb-1.5">
              <span>
                {jobData.processed_files ?? 0} / {jobData.total_files ?? jobData.estimated_files ?? '?'} files
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

          {/* Summary Metrics */}
          <div className="grid grid-cols-3 gap-3 text-[11px]">
            <div className="rounded-xl bg-bg-input p-3 text-center">
              <p className="text-text-muted mb-0.5">Files Skipped</p>
              <p className="text-base font-bold text-text-primary">{jobData.skipped_files ?? 0}</p>
            </div>
            <div className="rounded-xl bg-brand-primary/8 border border-brand-primary/20 p-3 text-center">
              <p className="text-text-muted mb-0.5">Functions Staged</p>
              <p className="text-base font-bold text-brand-primary">{jobData.total_functions_staged ?? 0}</p>
            </div>
            <div className="rounded-xl bg-amber-500/8 border border-amber-500/20 p-3 text-center">
              <p className="text-text-muted mb-0.5">Conflicts</p>
              <p className="text-base font-bold text-amber-500">{jobData.total_conflicts ?? 0}</p>
            </div>
          </div>

          {/* Completed CTA */}
          {phase === 'completed' && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300 flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
              <span>
                <strong>{jobData.total_functions_staged} function(s)</strong> have been staged for human verification.
                Go to the <strong>Verification Queue</strong> tab to review and approve them before they enter the Knowledge Base.
              </span>
            </div>
          )}

          {/* Per-File Results Toggle */}
          {jobData.file_results && jobData.file_results.length > 0 && (
            <div>
              <button
                onClick={() => setShowFileDetails(!showFileDetails)}
                className="flex items-center space-x-1.5 text-[11px] font-medium text-text-muted hover:text-text-primary transition-colors"
              >
                {showFileDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                <span>{showFileDetails ? 'Hide' : 'Show'} per-file breakdown ({jobData.file_results.length} files)</span>
              </button>

              {showFileDetails && (
                <div className="mt-3 space-y-1.5 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
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
                          f.status === 'processed' ? 'text-emerald-500' :
                          f.status === 'error' ? 'text-red-500' : 'text-text-muted'
                        }`} />
                        <span className="truncate text-text-primary font-mono">{f.file}</span>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        {f.status === 'processed' && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            {f.functions_staged} fn
                          </span>
                        )}
                        {f.skip_reason && (
                          <span className="text-text-muted truncate max-w-[180px]" title={f.skip_reason}>
                            {f.skip_reason}
                          </span>
                        )}
                        <span className={`px-1.5 py-0.5 rounded-full font-semibold ${
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

      {/* Upload phase (before job_id exists) */}
      {phase === 'uploading' && !jobData?.job_id && (
        <div className={`rounded-2xl border border-blue-500/40 bg-bg-card p-5 flex items-center space-x-4`}>
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin shrink-0" />
          <div>
            <p className="text-sm font-semibold text-text-primary">Uploading archive...</p>
            <p className="text-[11px] text-text-muted">{selectedFile?.name} — {((selectedFile?.size || 0) / (1024 * 1024)).toFixed(1)} MB</p>
          </div>
        </div>
      )}
    </div>
  );
}
