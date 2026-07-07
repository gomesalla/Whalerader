import React, { useState } from "react";
import { Award, Zap, Percent, Target, Flame } from "lucide-react";
import { MarketSentiment, WhaleTrade } from "../types";

interface LeaderboardProps {
  sentiment: MarketSentiment[];
  trades: WhaleTrade[];
}

type TabType = "volume" | "net_flow" | "oi_growth" | "score";

export default function Leaderboard({ sentiment, trades }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("score");

  const formatUsd = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val.toFixed(0)}`;
  };

  // Rank coins by Smart Money Score
  const rankByScore = [...sentiment].sort((a, b) => b.smartMoneyScore - a.smartMoneyScore).slice(0, 5);

  // Rank coins by OI Growth
  const rankByOi = [...sentiment].sort((a, b) => b.oiChange24h - a.oiChange24h).slice(0, 5);

  // Rank coins by Net Flow (Long volume minus Short volume in recent trades)
  const calculateNetFlows = () => {
    const flows: Record<string, number> = {};
    sentiment.forEach((s) => {
      flows[s.coin] = 0;
    });

    trades.forEach((t) => {
      if (flows[t.coin] !== undefined) {
        const sign = t.direction === "LONG" ? 1 : -1;
        flows[t.coin] += t.tradeSizeUsd * sign;
      }
    });

    return Object.keys(flows)
      .map((coin) => ({ coin, netFlow: flows[coin] }))
      .sort((a, b) => b.netFlow - a.netFlow);
  };

  const rankByNetFlow = calculateNetFlows().slice(0, 5);

  // Rank coins by aggregate Whale Volume
  const calculateTotalVols = () => {
    const vols: Record<string, number> = {};
    sentiment.forEach((s) => {
      vols[s.coin] = 0;
    });

    trades.forEach((t) => {
      if (vols[t.coin] !== undefined) {
        vols[t.coin] += t.tradeSizeUsd;
      }
    });

    return Object.keys(vols)
      .map((coin) => ({ coin, volume: vols[coin] }))
      .sort((a, b) => b.volume - a.volume);
  };

  const rankByVolume = calculateTotalVols().slice(0, 5);

  return (
    <div className="bg-brand-container border border-brand-border rounded p-5 h-full">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display font-black text-sm text-white flex items-center gap-2 uppercase tracking-wide">
            <Award className="w-4 h-4 text-brand-accent" />
            <span>ALPHAVIEW LEADERBOARDS</span>
          </h2>
          <p className="text-xs text-brand-text-secondary mt-0.5">
            Real-time ranked metrics of Hyperliquid derivatives markets
          </p>
        </div>

        {/* Tab Controllers */}
        <div className="flex bg-brand-hover p-0.5 border border-brand-border-secondary rounded text-[10px] sm:text-xs font-mono">
          <button
            onClick={() => setActiveTab("score")}
            className={`px-3 py-1 rounded-sm cursor-pointer transition uppercase ${
              activeTab === "score" ? "bg-brand-border-secondary text-brand-accent font-bold" : "text-brand-text-secondary hover:text-brand-text-primary"
            }`}
          >
            SMART SCORE
          </button>
          <button
            onClick={() => setActiveTab("net_flow")}
            className={`px-3 py-1 rounded-sm cursor-pointer transition uppercase ${
              activeTab === "net_flow" ? "bg-brand-border-secondary text-brand-accent font-bold" : "text-brand-text-secondary hover:text-brand-text-primary"
            }`}
          >
            NET LONG FLOW
          </button>
          <button
            onClick={() => setActiveTab("oi_growth")}
            className={`px-3 py-1 rounded-sm cursor-pointer transition uppercase ${
              activeTab === "oi_growth" ? "bg-brand-border-secondary text-brand-accent font-bold" : "text-brand-text-secondary hover:text-brand-text-primary"
            }`}
          >
            OI GROWTH
          </button>
          <button
            onClick={() => setActiveTab("volume")}
            className={`px-3 py-1 rounded-sm cursor-pointer transition uppercase ${
              activeTab === "volume" ? "bg-brand-border-secondary text-brand-accent font-bold" : "text-brand-text-secondary hover:text-brand-text-primary"
            }`}
          >
            WHALE VOL
          </button>
        </div>
      </div>

      <div className="space-y-2.5">
        {/* Render ACTIVE Tab */}
        {activeTab === "score" &&
          rankByScore.map((item, idx) => (
            <div
              key={item.coin}
              className="flex items-center justify-between p-3 rounded-sm bg-brand-hover/40 border border-brand-border hover:border-brand-border-secondary transition"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-brand-text-secondary w-5">#0{idx + 1}</span>
                <div>
                  <span className="font-display font-bold text-sm text-white block">{item.coin}</span>
                  <span className="text-[10px] font-mono text-brand-text-secondary uppercase">
                    Signal: <span className="text-brand-accent font-bold">{item.signal}</span>
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-brand-text-secondary block">SCORE:</span>
                <span className="font-mono font-bold text-sm text-brand-accent flex items-center gap-1 justify-end">
                  <Flame className="w-3.5 h-3.5 fill-brand-accent/20" />
                  {item.smartMoneyScore}/100
                </span>
              </div>
            </div>
          ))}

        {activeTab === "oi_growth" &&
          rankByOi.map((item, idx) => (
            <div
              key={item.coin}
              className="flex items-center justify-between p-3 rounded-sm bg-brand-hover/40 border border-brand-border hover:border-brand-border-secondary transition"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-brand-text-secondary w-5">#0{idx + 1}</span>
                <div>
                  <span className="font-display font-bold text-sm text-white block">{item.coin}</span>
                  <span className="text-[10px] font-mono text-brand-text-secondary">
                    OI Value: {formatUsd(item.openInterest)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-brand-text-secondary block">OI CHANGE:</span>
                <span className="font-mono font-bold text-sm text-brand-accent flex items-center gap-1 justify-end">
                  <Percent className="w-3.5 h-3.5" />
                  +{item.oiChange24h}%
                </span>
              </div>
            </div>
          ))}

        {activeTab === "net_flow" &&
          rankByNetFlow.map((item, idx) => (
            <div
              key={item.coin}
              className="flex items-center justify-between p-3 rounded-sm bg-brand-hover/40 border border-brand-border hover:border-brand-border-secondary transition"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-brand-text-secondary w-5">#0{idx + 1}</span>
                <div>
                  <span className="font-display font-bold text-sm text-white block">{item.coin}</span>
                  <span className="text-[10px] font-mono text-brand-text-secondary">
                    Directional Long Buildup
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-brand-text-secondary block">NET VOLUME:</span>
                <span className="font-mono font-bold text-sm text-brand-accent flex items-center gap-1 justify-end">
                  <Target className="w-3.5 h-3.5" />
                  {formatUsd(item.netFlow)}
                </span>
              </div>
            </div>
          ))}

        {activeTab === "volume" &&
          rankByVolume.map((item, idx) => (
            <div
              key={item.coin}
              className="flex items-center justify-between p-3 rounded-sm bg-brand-hover/40 border border-brand-border hover:border-brand-border-secondary transition"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-brand-text-secondary w-5">#0{idx + 1}</span>
                <div>
                  <span className="font-display font-bold text-sm text-white block">{item.coin}</span>
                  <span className="text-[10px] font-mono text-brand-text-secondary">
                    Aggregate size tracked
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-brand-text-secondary block">SUM VOLUME:</span>
                <span className="font-mono font-bold text-sm text-brand-accent flex items-center gap-1 justify-end">
                  <Zap className="w-3.5 h-3.5" />
                  {formatUsd(item.volume)}
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
