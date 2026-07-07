import React from "react";
import { Layers, HelpCircle, Activity, ShieldAlert } from "lucide-react";
import { ClusterAlert } from "../types";

interface ClusterListProps {
  clusters: ClusterAlert[];
}

export default function ClusterList({ clusters }: ClusterListProps) {
  const formatUsd = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val.toFixed(0)}`;
  };

  const getConfidenceColor = (conf: ClusterAlert["confidence"]) => {
    switch (conf) {
      case "High":
        return "text-brand-accent bg-brand-accent/10 border-brand-accent/20";
      case "Medium":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      default:
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    }
  };

  return (
    <div className="bg-brand-container border border-brand-border rounded p-5 h-full">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-brand-border">
        <div>
          <h2 className="font-display font-black text-sm text-white flex items-center gap-2 uppercase tracking-wide">
            <Layers className="w-4 h-4 text-brand-accent" />
            <span>SMART MONEY CLUSTER DETECTOR</span>
          </h2>
          <p className="text-xs text-brand-text-secondary mt-0.5">
            Real-time algorithmic discovery of correlated institutional entries
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-brand-text-secondary bg-brand-hover rounded-sm px-2 py-0.5 border border-brand-border-secondary">
          <HelpCircle className="w-3 h-3" />
          <span>WINDOW: 10m</span>
        </div>
      </div>

      <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
        {clusters.length === 0 ? (
          <div className="text-center py-16 text-brand-text-secondary text-xs font-mono">
            No active institutional clusters detected in the last 10 minutes. Monitoring order flow...
          </div>
        ) : (
          clusters.map((c) => (
            <div
              key={c.id}
              className="bg-brand-hover/40 border border-brand-border rounded-sm p-4 relative overflow-hidden hover:border-brand-border-secondary transition"
            >
              {/* Vertical side indicator */}
              <div
                className={`absolute top-0 left-0 w-1 h-full ${
                  c.direction === "LONG" ? "bg-brand-accent" : "bg-brand-accent-red"
                }`}
              />

              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <span className="font-display font-bold text-sm text-white">{c.coin}</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm border ${
                      c.direction === "LONG"
                        ? "text-brand-accent bg-brand-accent/5 border-brand-accent/15"
                        : "text-brand-accent-red bg-brand-accent-red/5 border-brand-accent-red/15"
                    }`}
                  >
                    {c.direction} CLUSTER
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className={`px-2 py-0.5 rounded-sm text-[10px] border font-bold ${getConfidenceColor(c.confidence)}`}>
                    CONFIDENCE: {c.confidence.toUpperCase()}
                  </span>
                </div>
              </div>

              <p className="text-xs text-brand-text-primary font-sans mt-2">{c.description}</p>

              <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-brand-border">
                <div>
                  <span className="text-[10px] font-mono text-brand-text-secondary block">TOTAL SIZE:</span>
                  <span className="text-xs font-mono font-bold text-white">
                    {formatUsd(c.totalVolumeUsd)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-brand-text-secondary block">WALLETS:</span>
                  <span className="text-xs font-mono font-bold text-white">
                    {c.walletsCount} institutional desks
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-brand-text-secondary block">STRENGTH:</span>
                  <span className="text-xs font-mono font-bold text-brand-accent flex items-center gap-1 justify-end">
                    <Activity className="w-3 h-3 text-brand-accent animate-pulse" />
                    {c.strengthScore}%
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="mt-3 text-[10px] font-mono text-brand-text-secondary text-center">
        Identifies cooperative buy-walls or sell-walls on the perpetual book.
      </div>
    </div>
  );
}
