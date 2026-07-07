import React from "react";
import { Activity, ShieldAlert, Terminal, RefreshCw, Layers } from "lucide-react";

interface HeaderProps {
  connectionStatus: "connecting" | "connected" | "disconnected";
  autoRefreshRate: number;
  setAutoRefreshRate: (rate: number) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function Header({
  connectionStatus,
  autoRefreshRate,
  setAutoRefreshRate,
  onRefresh,
  isRefreshing,
}: HeaderProps) {
  return (
    <header className="border-b border-brand-border bg-brand-container/90 backdrop-blur px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-sm bg-brand-accent flex items-center justify-center text-black font-extrabold text-sm italic">
            HL
          </div>
          <span
            className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-brand-bg ${
              connectionStatus === "connected"
                ? "bg-brand-accent"
                : connectionStatus === "connecting"
                ? "bg-amber-500 animate-pulse"
                : "bg-brand-accent-red"
            }`}
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-black text-lg tracking-tight text-white uppercase">
              WHALERADAR <span className="text-brand-accent text-xs font-normal tracking-widest ml-1">INSTITUTIONAL</span>
            </h1>
            <span className="bg-brand-hover border border-brand-border-secondary text-brand-text-secondary text-[10px] font-mono px-1.5 py-0.5 rounded uppercase">
              TERMINAL v2.4
            </span>
          </div>
          <p className="text-xs text-brand-text-secondary font-sans mt-0.5">
            Real-time public transaction flow analyzer and Smart Money accumulator engine
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        {/* Status Indicators */}
        <div className="flex items-center gap-3 bg-brand-hover border border-brand-border-secondary rounded px-3 py-1.5 text-xs text-brand-text-primary font-mono">
          <span className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-brand-accent" />
            FEED:{" "}
            <span className="text-brand-accent font-bold">
              {connectionStatus === "connected" ? "LIVE STREAM" : "POLLING"}
            </span>
          </span>
          <span className="text-brand-border-secondary">|</span>
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-brand-accent" />
            ENGINE: <span className="text-brand-accent font-bold">HL ACTIVE</span>
          </span>
        </div>

        {/* Refresh controllers */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono text-brand-text-secondary">REFRESH:</label>
          <select
            value={autoRefreshRate}
            onChange={(e) => setAutoRefreshRate(Number(e.target.value))}
            className="bg-brand-hover border border-brand-border-secondary text-brand-text-primary text-xs font-mono rounded px-2.5 py-1.5 focus:outline-none focus:border-brand-accent/50"
          >
            <option value={5000}>5 Seconds (Live)</option>
            <option value={15000}>15 Seconds</option>
            <option value={30000}>30 Seconds</option>
            <option value={60000}>1 Minute</option>
            <option value={300000}>5 Minutes</option>
            <option value={900000}>15 Minutes</option>
          </select>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="bg-brand-accent hover:opacity-90 disabled:opacity-50 text-black font-bold px-3.5 py-1.5 rounded-sm text-xs flex items-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            SYNC NOW
          </button>
        </div>
      </div>
    </header>
  );
}
