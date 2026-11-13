import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import IngestionSummary from '../IngestionSummary/IngestionSummary';

export default function FileUpload({ onUploadComplete }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    setError(null);
    const validExtensions = ['.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      setError('Please select a valid Excel file (.xlsx or .xls)');
      setSelectedFile(null);
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('File size exceeds maximum limit of 50 MB');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setSummary(null);
  };

  const handleUpload = async () => {
    if (!selectedFile || uploading) return;
    setUploading(true);
    setError(null);

    try {
      const res = await api.uploadKnowledgeBase(selectedFile);
      setSummary(res);
      if (onUploadComplete) onUploadComplete(res);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {summary ? (
        <IngestionSummary
          summary={summary}
          onReset={() => {
            setSummary(null);
            setSelectedFile(null);
          }}
        />
      ) : (
        <div className="rounded-2xl border border-border-subtle bg-bg-card p-6 shadow-xs text-xs">
          <h3 className="font-bold text-sm text-text-primary mb-1 font-display">
            Upload Knowledge Base Runbook / Rulebook
          </h3>
          <p className="text-text-secondary mb-5 leading-relaxed">
            Upload organizational function Excel spreadsheets (.xlsx, .xls). Functions will be verified, stored, and indexed into the company knowledge base.
          </p>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-brand-primary bg-bg-hover'
                : 'border-border-subtle bg-bg-input/60 hover:bg-bg-hover hover:border-brand-orangeBorder'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-brand-primary flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="font-semibold text-text-primary mb-1">
              {selectedFile ? selectedFile.name : 'Click to browse or drag & drop Excel file'}
            </p>
            <p className="text-text-muted text-[11px]">
              Supports .xlsx, .xls (Up to 50MB)
            </p>
          </div>

          {error && (
            <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {selectedFile && (
            <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-bg-input border border-border-subtle">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                <span className="font-medium text-text-primary">{selectedFile.name}</span>
                <span className="text-text-muted text-[11px]">
                  ({(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-button hover:bg-brand-hover text-white font-semibold text-xs shadow-xs transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Ingestion...</span>
                  </>
                ) : (
                  <span>Start Ingestion</span>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
