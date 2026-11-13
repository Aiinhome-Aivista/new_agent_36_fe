import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BotMessageSquare, 
  Database, 
  LayoutDashboard, 
  Sparkles, 
  ArrowRight, 
  FileCode2, 
  ShieldCheck, 
  RefreshCw,
  Terminal,
  Cpu,
  Layers,
  ChevronRight,
  Sun,
  Moon,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';

export default function LandingPage({ theme, toggleTheme }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.getStats().then((data) => {
      if (data.success) setStats(data);
    }).catch(() => {});
  }, []);

  const handleStartChatWithPrompt = (promptText, lang = 'all') => {
    navigate(`/chat?q=${encodeURIComponent(promptText)}&lang=${lang}`);
  };

  const starterPrompts = [
    {
      title: "Find Circuit Breaker Validation",
      desc: "Searches organizational C# rules for real & provisional breaker part checks.",
      query: "Find functions that check if a part is a real breaker",
      lang: "c#",
      tag: "C# .NET"
    },
    {
      title: "Explain IsRealBreakerPart",
      desc: "Walks through implementation logic, attributes (DAconfigPartID), and edge cases.",
      query: "Explain how IsRealBreakerPart works and what attributes it checks",
      lang: "c#",
      tag: "Code Review"
    },
    {
      title: "Convert C# Rule to Python",
      desc: "Ports electrical part attribute validation logic into an idiomatic Python method.",
      query: "Convert the IsRealBreakerPart function from C# into clean Python",
      lang: "python",
      tag: "Conversion"
    },
    {
      title: "Data Backup Routines",
      desc: "Discovers automated backup scripts and database snapshot routines.",
      query: "Find functions that perform data backups or export tables",
      lang: "python",
      tag: "DevOps"
    },
    {
      title: "Email Format Validator",
      desc: "Finds RFC-compliant regex email validation helper functions.",
      query: "Find a function that validates an email address",
      lang: "python",
      tag: "Utility"
    },
    {
      title: "Optimize Code Performance",
      desc: "Analyzes existing loops, dictionary lookups, and memory footprints.",
      query: "Can you review and improve the performance of our terminal block merge method?",
      lang: "c#",
      tag: "Optimization"
    }
  ];

  return (
    <div className="min-h-screen w-full bg-bg-base text-text-primary transition-colors duration-250 flex flex-col selection:bg-brand-primary/20">
      {/* ── Minimalist Top Navigation Bar ── */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-bg-base/85 border-b border-border-subtle transition-colors duration-250">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div 
            onClick={() => navigate('/')} 
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-sm font-bold group-hover:scale-105 transition-transform duration-200">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight font-display text-text-primary">
                Dev<span className="text-brand-primary">Know</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-bg-input text-text-secondary border border-border-subtle">
                RAG Studio
              </span>
            </div>
          </div>

          {/* Center Navigation Shortcuts */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-text-secondary">
            <a href="#starters" className="hover:text-brand-primary transition-colors">Prompt Starters</a>
            <a href="#architecture" className="hover:text-brand-primary transition-colors">Architecture</a>
            <a href="#stats" className="hover:text-brand-primary transition-colors">Metrics</a>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3">
            {/* Dark / Light Mode Switcher */}
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl border border-border-subtle hover:border-brand-orangeBorder bg-bg-card hover:bg-bg-hover text-text-secondary hover:text-brand-primary transition-all duration-200"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-gray-600" />
                )}
              </button>
            )}

            {/* Enter Dashboard Button */}
            <button
              onClick={() => navigate('/dashboard')}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-bg-card hover:bg-bg-hover text-text-primary border border-border-subtle hover:border-brand-orangeBorder font-semibold text-xs transition-all duration-150"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-text-muted" />
              <span>Dashboard</span>
            </button>

            {/* Launch Assistant CTA */}
            <button
              onClick={() => navigate('/chat')}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-button hover:bg-brand-hover text-white font-bold text-xs shadow-sm transition-all duration-150 active:scale-[0.98]"
            >
              <BotMessageSquare className="w-3.5 h-3.5" />
              <span>Enter Assistant</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Landing Content (Minimalist & Focused) ── */}
      <main className="flex-1 overflow-y-auto">
        {/* Hero Section */}
        <section className="relative px-6 pt-16 pb-16 max-w-5xl mx-auto text-center">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-80 h-80 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* Minimal Pill Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-bg-hover border border-border-orange/40 text-brand-primary text-xs font-semibold mb-6 shadow-xs animate-fade-in-up">
            <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
            <span>Enterprise Multi-Language Code RAG Assistant</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-text-primary font-display max-w-4xl mx-auto leading-tight mb-5">
            Organizational Code Intelligence, <br className="hidden sm:inline" />
            <span className="text-brand-primary">
              Grounded in Absolute Truth
            </span>
          </h1>

          {/* Concise Subtitle */}
          <p className="text-sm sm:text-base text-text-secondary max-w-2xl mx-auto leading-relaxed mb-9">
            Discover, explain, and optimize functions across your organizational codebase. 
            Zero hallucinations, exact code retrieval from verified runbooks, and an autonomous self-growing knowledge base.
          </p>

          {/* Minimalist Action Button Group */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mb-14">
            <button
              onClick={() => navigate('/chat')}
              className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-brand-button hover:bg-brand-hover text-white font-bold text-sm shadow-md transition-all duration-150 active:scale-[0.98]"
            >
              <BotMessageSquare className="w-4 h-4" />
              <span>Launch Developer Assistant</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 px-5 py-3.5 rounded-xl bg-bg-card hover:bg-bg-hover text-text-primary border border-border-subtle hover:border-brand-orangeBorder font-semibold text-sm transition-all duration-150"
            >
              <LayoutDashboard className="w-4 h-4 text-brand-primary" />
              <span>Enter Dashboard</span>
            </button>

            <button
              onClick={() => navigate('/knowledge-base')}
              className="flex items-center space-x-2 px-4 py-3.5 rounded-xl bg-bg-card hover:bg-bg-hover text-text-secondary border border-border-subtle hover:text-text-primary font-medium text-sm transition-all duration-150"
            >
              <Database className="w-4 h-4 text-text-muted" />
              <span>Browse Runbooks</span>
            </button>
          </div>

          {/* Real-Time Metrics Strip */}
          <div id="stats" className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-6 border-t border-border-subtle">
            <div className="p-3.5 rounded-xl bg-bg-card border border-border-subtle text-left">
              <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted block">Indexed Functions</span>
              <span className="text-2xl font-black text-brand-primary">{stats?.total_functions ?? 9}+</span>
            </div>
            <div className="p-3.5 rounded-xl bg-bg-card border border-border-subtle text-left">
              <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted block">Code Accuracy</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">100%</span>
            </div>
            <div className="p-3.5 rounded-xl bg-bg-card border border-border-subtle text-left">
              <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted block">Knowledge Grounding</span>
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400">Verified</span>
            </div>
            <div className="p-3.5 rounded-xl bg-bg-card border border-border-subtle text-left">
              <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted block">Self-Growing Memory</span>
              <span className="text-2xl font-black text-orange-500">Active</span>
            </div>
          </div>
        </section>

        {/* ── Starter Prompts (Click to directly enter chat) ── */}
        <section id="starters" className="px-6 py-12 max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-text-primary flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-brand-primary" />
                <span>Instant Query Starters</span>
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Click any starter prompt below to jump directly into the assistant with that query pre-loaded.
              </p>
            </div>
            <button
              onClick={() => navigate('/chat')}
              className="text-xs font-semibold text-brand-primary hover:underline flex items-center space-x-1 shrink-0 ml-4"
            >
              <span>Blank Chat</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {starterPrompts.map((card, idx) => (
              <div
                key={idx}
                onClick={() => handleStartChatWithPrompt(card.query, card.lang)}
                className="p-4 rounded-xl bg-bg-card hover:bg-bg-hover border border-border-subtle hover:border-brand-orangeBorder cursor-pointer transition-all duration-150 group shadow-xs hover:shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-bg-input text-brand-primary border border-brand-orangeBorder/40 uppercase">
                      {card.tag}
                    </span>
                    <span className="text-xs text-text-muted group-hover:text-brand-primary transition-colors">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <h3 className="font-bold text-xs text-text-primary mb-1 group-hover:text-brand-primary transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-[11px] text-text-secondary leading-relaxed mb-3">
                    {card.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-border-subtle text-[10px] text-text-muted font-mono truncate">
                  "{card.query}"
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Architecture Highlights ── */}
        <section id="architecture" className="px-6 py-14 max-w-5xl mx-auto border-t border-border-subtle">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary font-display mb-2">
              Why DevKnow is Built for Enterprise Codebases
            </h2>
            <p className="text-xs text-text-secondary">
              Overcomes AI hallucination risk by anchoring every search directly to verified company runbooks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Pillar 1 */}
            <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-orange-500/10 text-brand-primary flex items-center justify-center font-bold">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-text-primary">Authoritative Source of Truth</h3>
              <p className="text-text-secondary leading-relaxed text-[11px]">
                When a match occurs, the exact original function header and body are retrieved verbatim from official company records, ensuring zero syntax or business logic corruption.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                <RefreshCw className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-text-primary">Self-Growing Knowledge Base</h3>
              <p className="text-text-secondary leading-relaxed text-[11px]">
                When organizational code doesn't exist, the assistant crafts an answer. Developers can save approved solutions with 1 click, instantly expanding company memory for future queries.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-text-primary">Anti-Hallucination Guardrails</h3>
              <p className="text-text-secondary leading-relaxed text-[11px]">
                Every response is clearly classified: 🟢 <strong>From Knowledge Base</strong> or 🔵 <strong>LLM Generated</strong>. The assistant never fabricates company functions.
              </p>
            </div>
          </div>
        </section>

        {/* ── Minimalist Call to Action ── */}
        <section className="px-6 py-12 max-w-4xl mx-auto text-center">
          <div className="p-8 rounded-2xl bg-bg-card border border-border-orange/40 shadow-xs space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-text-primary font-display">
              Ready to explore your organization's code intelligence?
            </h3>
            <p className="text-xs text-text-secondary max-w-md mx-auto">
              Interact with pre-indexed runbooks or upload new Excel spreadsheets to expand your codebase memory.
            </p>
            <div className="pt-2 flex items-center justify-center space-x-3">
              <button
                onClick={() => navigate('/chat')}
                className="px-5 py-2.5 rounded-xl bg-brand-button hover:bg-brand-hover text-white font-bold text-xs shadow-sm transition-all"
              >
                Launch Developer Assistant
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2.5 rounded-xl bg-bg-panel hover:bg-bg-hover text-text-primary border border-border-subtle font-semibold text-xs transition-all"
              >
                Open Dashboard
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ── Minimalist Footer ── */}
      <footer className="w-full border-t border-border-subtle py-5 px-6 bg-bg-panel transition-colors duration-250">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-text-primary font-display">DevKnow</span>
            <span>—</span>
            <span>Multi-Language Code Intelligence RAG</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Enterprise Knowledge Base Active</span>
            </span>
            <span>•</span>
            <span className="text-[11px]">v1.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
