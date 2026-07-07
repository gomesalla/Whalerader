import React from "react";
import { WhaleTrade } from "../types";

interface WhaleHeatmapProps {
  trades: WhaleTrade[];
  coins: string[];
}

export default function WhaleHeatmap({ trades, coins }: WhaleHeatmapProps) {
  // Let's divide the last 15 minutes into 5 intervals of 3 minutes each,
  // or last 1 hour into 5 intervals of 12 minutes each. Let's do 5 intervals of 3 mins!
  const INTERVAL_MINS = 3;
  const numIntervals = 5;
  const now = Date.now();

  const getIntervalLabel = (idx: number) => {
    const minsAgo = (numIntervals - idx - 1) * INTERVAL_MINS;
    if (minsAgo === 0) return "Now";
    return `-${minsAgo}m`;
  };

  // We want to calculate the Net Whale Volume for each coin in each interval
  // row: coin, col: intervalIndex
  const heatmapData = coins.slice(0, 10).map((coin) => {
    const intervals = Array(numIntervals).fill(0);

    // Filter trades for this coin
    const coinTrades = trades.filter((t) => t.coin === coin);

    coinTrades.forEach((t) => {
      const msAgo = now - t.timestamp;
      const minsAgo = msAgo / (60 * 1000);
      const intervalIdx = numIntervals - 1 - Math.floor(minsAgo / INTERVAL_MINS);

      if (intervalIdx >= 0 && intervalIdx < numIntervals) {
        const factor = t.direction === "LONG" ? 1 : -1;
        intervals[intervalIdx] += t.tradeSizeUsd * factor;
      }
    });

    return {
      coin,
      intervals,
    };
  });

  // Calculate maximum absolute volume to scale coloring nicely
  let maxAbsVol = 100000; // minimum scale threshold of 100k
  heatmapData.forEach((row) => {
    row.intervals.forEach((val) => {
      if (Math.abs(val) > maxAbsVol) maxAbsVol = Math.abs(val);
    });
  });

  // Color mapper based on net dollar size
  const getColorClass = (val: number) => {
    if (val === 0) return "bg-[#161921] border-brand-border text-brand-text-secondary";
    
    const intensity = Math.min(1, Math.abs(val) / maxAbsVol);
    const isLong = val > 0;

    if (isLong) {
      if (intensity > 0.75) return "bg-brand-accent/35 border-brand-accent text-brand-accent font-black shadow-[0_0_8px_rgba(0,255,163,0.15)]";
      if (intensity > 0.4) return "bg-brand-accent/20 border-brand-accent/60 text-brand-accent";
      return "bg-brand-accent/10 border-brand-accent/30 text-brand-accent/80";
    } else {
      if (intensity > 0.75) return "bg-brand-accent-red/35 border-brand-accent-red text-brand-accent-red font-black shadow-[0_0_8px_rgba(255,59,105,0.15)]";
      if (intensity > 0.4) return "bg-brand-accent-red/20 border-brand-accent-red/60 text-brand-accent-red";
      return "bg-brand-accent-red/10 border-brand-accent-red/30 text-brand-accent-red/80";
    }
  };

  const formatShortUsd = (val: number) => {
    if (val === 0) return "—";
    const abs = Math.abs(val);
    const sign = val > 0 ? "+" : "-";
    if (abs >= 1000000) return `${sign}$${(abs / 1000000).toFixed(1)}M`;
    if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(0)}k`;
    return `${sign}$${abs.toFixed(0)}`;
  };

  return (
    <div className="bg-brand-container border border-brand-border rounded p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display font-black text-sm text-white flex items-center gap-2 uppercase tracking-wide">
            <span>WHALE CAPITAL FLOW HEATMAP</span>
            <span className="bg-brand-accent/10 border border-brand-accent/30 text-brand-accent text-[10px] font-mono px-1.5 py-0.5 rounded-sm">
              15m Window
            </span>
          </h2>
          <p className="text-xs text-brand-text-secondary mt-1">
            Real-time aggregate net institutional volume (Greens = Net Long, Reds = Net Short)
          </p>
        </div>

        <div className="flex gap-2 text-[10px] font-mono">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-brand-accent-red" /> Bearish</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-brand-border-secondary" /> Flat</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-brand-accent" /> Bullish</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left py-2 px-3 text-xs font-mono text-brand-text-secondary border-b border-brand-border w-20">
                COIN
              </th>
              {Array(numIntervals)
                .fill(0)
                .map((_, idx) => (
                  <th
                    key={idx}
                    className="py-2 px-2 text-center text-xs font-mono text-brand-text-secondary border-b border-brand-border min-w-28"
                  >
                    {getIntervalLabel(idx)}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {heatmapData.map((row) => (
              <tr key={row.coin} className="hover:bg-brand-hover/30">
                <td className="py-2 px-3 text-xs font-mono font-bold text-white border-r border-brand-border">
                  {row.coin}
                </td>
                {row.intervals.map((val, idx) => (
                  <td key={idx} className="p-1">
                    <div
                      className={`h-9 border rounded-sm flex flex-col items-center justify-center transition ${getColorClass(
                        val
                      )}`}
                    >
                      <span className="text-[10px] font-mono tracking-tight">
                        {formatShortUsd(val)}
                      </span>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex justify-between items-center text-[10px] font-mono text-brand-text-secondary">
        <span>Rows: Major listed markets</span>
        <span>Cols: Chronological 3m intervals</span>
      </div>
    </div>
  );
}
