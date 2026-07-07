import React, { useState, useEffect } from "react";
import { Sparkles, BrainCircuit, AlertCircle, Terminal, HelpCircle } from "lucide-react";

interface AiInsightsPanelProps {
  timeframe: string;
}

export default function AiInsightsPanel({ timeframe }: AiInsightsPanelProps) {
  const [insights, setInsights] = useState("");
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAiInsights = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/gemini/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeframe }),
      });

      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights || "No insights returned.");
        setSource(data.source || "Simulation Engine");
      } else {
        throw new Error("Server returned error response.");
      }
    } catch (e: any) {
      console.error("Failed to load AI Insights:", e);
      setError("Failed to compile AI insights. Check system API logs.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial insights on mount and when timeframe changes
  useEffect(() => {
    fetchAiInsights();
  }, [timeframe]);

  // Format response helper: replace bold patterns like **BOLD_TEXT** with clean span styling
  const renderFormattedText = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Check if line is empty
      if (!line.trim()) return <div key={idx} className="h-2.5" />;

      // Match bold titles like **TITLE**
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(
          <strong key={match.index} className="text-brand-accent font-display font-semibold uppercase tracking-wide">
            {match[1]}
          </strong>
        );
        lastIndex = boldRegex.lastIndex;
      }

      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      const isBullet = line.trim().startsWith("-") || line.trim().startsWith("*");
      if (isBullet) {
        return (
          <li key={idx} className="text-xs text-brand-text-primary font-sans list-none pl-4 relative py-1">
            <span className="absolute left-0 top-2.5 w-1.5 h-1.5 rounded-full bg-brand-accent" />
            {parts}
          </li>
        );
      }

      return (
        <p key={idx} className="text-xs text-brand-text-primary font-sans leading-relaxed mb-3">
          {parts}
        </p>
      );
    });
  };

  return (
    <div className="bg-brand-container border border-brand-border rounded p-5 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-brand-border">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-brand-accent animate-pulse" />
            <h2 className="font-display font-black text-sm text-white uppercase tracking-wide">
              AI WHALE INTEL REPORT
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="bg-brand-accent/10 border border-brand-accent/30 text-brand-accent text-[10px] font-mono px-1.5 py-0.5 rounded-sm font-bold uppercase">
              {source}
            </span>
            <button
              onClick={fetchAiInsights}
              disabled={loading}
              className="text-[10px] font-mono text-brand-accent hover:opacity-80 underline disabled:text-brand-text-secondary cursor-pointer"
            >
              REFRESH INTEL
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="relative mb-4">
              <Sparkles className="w-8 h-8 text-brand-accent animate-spin" />
              <BrainCircuit className="w-5 h-5 text-purple-400 absolute top-1.5 left-1.5" />
            </div>
            <p className="text-xs font-mono text-brand-text-secondary animate-pulse uppercase tracking-widest">
              SCANNING ORDER BOOKS & SNAPSHOTS
            </p>
            <p className="text-[10px] font-mono text-brand-text-secondary mt-2">
              Gemini is digesting raw volume flows, OI growth metrics, and clusters...
            </p>
          </div>
        ) : error ? (
          <div className="py-10 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-brand-accent-red mx-auto" />
            <p className="text-xs font-mono text-brand-accent-red">{error}</p>
            <button
              onClick={fetchAiInsights}
              className="bg-brand-accent-red/10 border border-brand-accent-red/20 text-brand-accent-red text-xs font-mono px-3 py-1 rounded-sm"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1">
            {renderFormattedText(insights)}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-brand-border flex items-center justify-between text-[9px] font-mono text-brand-text-secondary">
        <span className="flex items-center gap-1">
          <Terminal className="w-3.5 h-3.5 text-brand-text-secondary" /> Model: gemini-3.5-flash
        </span>
        <span>Hedge-Fund Grade Intelligence</span>
      </div>
    </div>
  );
}
