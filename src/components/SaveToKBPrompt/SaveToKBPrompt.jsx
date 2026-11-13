import React, { useState } from 'react';
import { Sparkles, Save, Check, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

export default function SaveToKBPrompt({ query, responseText, similarityScore, onSaved }) {
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  // Form fields
  const [funcName, setFuncName] = useState('');
  const [language, setLanguage] = useState('c#');
  const [framework, setFramework] = useState('');
  const [description, setDescription] = useState(query);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await api.saveLLMAnswer({
        query: query,
        llm_answer: responseText,
        function_name: funcName.trim() || undefined,
        programming_language: language,
        framework: framework.trim(),
        description: description.trim(),
        similarity_score: similarityScore || 0.0
      });

      if (res.success) {
        setSaved(true);
        if (onSaved) onSaved(res);
      } else {
        setError(res.error || 'Failed to save to knowledge base');
      }
    } catch (err) {
      setError(err.message || 'Error communicating with server');
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <div className="mt-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center space-x-2">
        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>
          <strong>Knowledge Base Updated!</strong> This solution has been verified and saved to the organization's knowledge base for all future queries.
        </span>
      </div>
    );
  }

  return (
    <div className="mt-3 border border-blue-500/30 rounded-xl bg-blue-500/5 p-3.5 text-xs transition-colors">
      {!isOpen ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-text-primary">
            <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
            <span>
              This response was generated using LLM knowledge. Would you like to save it to the organization's Knowledge Base?
            </span>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition-colors shrink-0 ml-2"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save to KB</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-3 pt-1">
          <div className="flex items-center justify-between border-b border-border-subtle pb-2">
            <span className="font-semibold text-text-primary flex items-center space-x-1.5">
              <Save className="w-3.5 h-3.5 text-blue-500" />
              <span>Index Solution into Knowledge Base</span>
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-text-muted hover:text-text-primary text-[11px]"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <div>
              <label className="text-[10px] font-semibold text-text-muted block mb-0.5">Function Name</label>
              <input
                type="text"
                placeholder="e.g. ValidateEmailFormat"
                value={funcName}
                onChange={(e) => setFuncName(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-border-subtle text-xs bg-bg-card text-text-primary focus:outline-none focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-text-muted block mb-0.5">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-border-subtle text-xs bg-bg-card text-text-primary focus:outline-none focus:border-brand-primary uppercase"
              >
                {['c#', 'python', 'java', 'javascript', 'typescript', 'go', 'sql', 'c++', 'php'].map(l => (
                  <option key={l} value={l}>{l.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-text-muted block mb-0.5">Framework (Optional)</label>
              <input
                type="text"
                placeholder="e.g. .NET Core, Django"
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-border-subtle text-xs bg-bg-card text-text-primary focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-text-muted block mb-0.5">Description / Search Context</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-border-subtle text-xs bg-bg-card text-text-primary focus:outline-none focus:border-brand-primary"
            />
          </div>

          {error && (
            <div className="text-[11px] text-red-500 flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-1">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 rounded-lg border border-border-subtle text-text-secondary hover:bg-bg-hover text-[11px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-1 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-[11px] disabled:opacity-50"
            >
              {saving ? <span>Indexing...</span> : <span>Confirm & Index in KB</span>}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
