import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CodeViewer({ code, language = 'text', title = null }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-brand-border bg-[#1E1E1E] text-gray-100 overflow-hidden text-xs my-2 shadow-sm">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#252526] border-b border-gray-700/60">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
          <span className="text-[11px] font-mono text-gray-400 pl-2 font-medium uppercase">
            {language || 'code'}
          </span>
          {title && <span className="text-[11px] text-gray-400">| {title}</span>}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 px-2 py-0.5 rounded bg-gray-700/60 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors text-[10px]"
          title="Copy code"
        >
          {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Code Content */}
      <div className="p-3 overflow-x-auto font-mono text-[12px] leading-relaxed select-text">
        <pre className="m-0 whitespace-pre">{code}</pre>
      </div>
    </div>
  );
}

