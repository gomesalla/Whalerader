import React from "react";
import { TrendingUp, TrendingDown, Award, Sparkles, DollarSign, Activity } from "lucide-react";
import { LiveStats } from "../types";

interface StatsGridProps {
  stats: LiveStats;
}

export default function StatsGrid({ stats }: StatsGridProps) {
  const formatUsd = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val.toFixed(0)}`;
  };

  const lsRatioColor =
    stats.longShortRatio >= 1.5
      ? "text-brand-accent"
      : stats.longShortRatio >= 1.0
      ? "text-brand-accent/85"
      : "text-brand-accent-red";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 px-6 py-4">
      {/* 1. Long/Short Bias */}
      <div className="bg-brand-container border border-brand-border rounded p-4 flex flex-col justify-between hover:bg-brand-hover transition">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-brand-text-secondary uppercase tracking-wider">
            24H Whale L/S Volume Bias
          </span>
          <Activity className="w-4 h-4 text-brand-accent" />
        </div>
        <div className="mt-2.5">
          <div className="flex items-baseline gap-1.5">
            <span className={`font-display text-2xl font-bold ${lsRatioColor}`}>
              {stats.longShortRatio}
            </span>
            <span className="text-[10px] text-brand-text-secondary font-mono">LONG/SHORT</span>
          </div>
          <div className="w-full bg-brand-border-secondary h-1 rounded mt-2.5 flex overflow-hidden">
            <div
              className="bg-brand-accent h-full"
              style={{
                width: `${Math.min(
                  90,
                  Math.max(10, (stats.totalWhaleLongsUsd / (stats.totalWhaleLongsUsd + stats.totalWhaleShortsUsd)) * 100)
                )}%`,
              }}
            />
            <div
              className="bg-brand-accent-red h-full"
              style={{
                width: `${Math.min(
                  90,
                  Math.max(10, (stats.totalWhaleShortsUsd / (stats.totalWhaleLongsUsd + stats.totalWhaleShortsUsd)) * 100)
                )}%`,
              }}
            />
          </div>
        </div>
        <div className="flex justify-between text-[10px] font-mono text-brand-text-secondary mt-2">
          <span className="text-brand-accent">L: {formatUsd(stats.totalWhaleLongsUsd)}</span>
          <span className="text-brand-accent-red">S: {formatUsd(stats.totalWhaleShortsUsd)}</span>
        </div>
      </div>

      {/* 2. Mega Positions */}
      <div className="bg-brand-container border border-brand-border rounded p-4 flex flex-col justify-between hover:bg-brand-hover transition">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-brand-text-secondary uppercase tracking-wider">
            Largest 24h Leveraged Bets
          </span>
          <DollarSign className="w-4 h-4 text-brand-accent" />
        </div>
        <div className="mt-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-brand-text-secondary">LONG:</span>
            <span className="text-brand-accent font-bold flex items-center gap-1">
              {stats.largestLongCoin} {formatUsd(stats.largestLongUsd)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-brand-text-secondary">SHORT:</span>
            <span className="text-brand-accent-red font-bold flex items-center gap-1">
              {stats.largestShortCoin} {formatUsd(stats.largestShortUsd)}
            </span>
          </div>
        </div>
        <div className="text-[10px] font-mono text-brand-text-secondary mt-2.5 pt-1.5 border-t border-brand-border/60 text-center">
          Durable institutional size
        </div>
      </div>

      {/* 3. Most Active Market */}
      <div className="bg-brand-container border border-brand-border rounded p-4 flex flex-col justify-between hover:bg-brand-hover transition">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-brand-text-secondary uppercase tracking-wider">
            Hot Coin (Whale Volume)
          </span>
          <TrendingUp className="w-4 h-4 text-brand-accent" />
        </div>
        <div className="mt-2.5">
          <span className="font-display text-2xl font-bold text-white block">
            {stats.mostActiveCoin}
          </span>
          <p className="text-[10px] font-mono text-brand-text-secondary mt-1">
            Top market by aggregate whale size in last 24h
          </p>
        </div>
        <div className="text-[10px] font-mono text-brand-accent mt-2.5 pt-1.5 border-t border-brand-border/60">
          🔥 Accumulation Zone Active
        </div>
      </div>

      {/* 4. Highest OI Increase */}
      <div className="bg-brand-container border border-brand-border rounded p-4 flex flex-col justify-between hover:bg-brand-hover transition">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-brand-text-secondary uppercase tracking-wider">
            Highest OI Increase
          </span>
          <Award className="w-4 h-4 text-brand-accent" />
        </div>
        <div className="mt-2.5">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-2xl font-bold text-white">
              {stats.highestOIIncreaseCoin}
            </span>
            <span className="text-brand-accent text-xs font-mono font-bold">
              +{stats.highestOIIncreasePercent}%
            </span>
          </div>
          <p className="text-[10px] font-mono text-brand-text-secondary mt-1">
            Heavy buildup of leveraged open positions
          </p>
        </div>
        <div className="text-[10px] font-mono text-brand-text-secondary mt-2.5 pt-1.5 border-t border-brand-border/60">
          Vol: +{stats.highestVolumeIncreasePercent}%
        </div>
      </div>

      {/* 5. Alpha Coin Signals */}
      <div className="bg-brand-container border border-brand-border rounded p-4 flex flex-col justify-between hover:bg-brand-hover transition sm:col-span-2 lg:col-span-4 xl:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-brand-text-secondary uppercase tracking-wider">
            Smart Money Sentiment
          </span>
          <Sparkles className="w-4 h-4 text-brand-accent" />
        </div>
        <div className="mt-2.5 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-brand-text-secondary">MOST BULLISH:</span>
            <span className="text-brand-accent font-bold">{stats.mostBullishCoin}</span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-brand-text-secondary">MOST BEARISH:</span>
            <span className="text-brand-accent-red font-bold">{stats.mostBearishCoin}</span>
          </div>
        </div>
        <div className="text-[10px] font-mono text-brand-text-secondary mt-2.5 pt-1.5 border-t border-brand-border/60 text-center bg-brand-hover/40 rounded py-0.5">
          AI Smart Score Core Signals
        </div>
      </div>
    </div>
  );
}
