import React, { useState } from "react";
import { Star, FileText, TrendingUp, TrendingDown, Clock, ShieldAlert, Check, Coins } from "lucide-react";
import { WalletProfile } from "../types";

interface WalletProfilerProps {
  selectedWallet: WalletProfile | null;
  onUpdateWallet: (address: string, isBookmarked: boolean, notes: string) => void;
  wallets: WalletProfile[];
  onSelectWallet: (address: string) => void;
}

export default function WalletProfiler({
  selectedWallet,
  onUpdateWallet,
  wallets,
  onSelectWallet,
}: WalletProfilerProps) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState("");

  const bookmarkedWallets = wallets.filter((w) => w.isBookmarked);

  const formatUsd = (val: number) => {
    const abs = Math.abs(val);
    const sign = val >= 0 ? "" : "-";
    if (abs >= 1000000) return `${sign}$${(abs / 1000000).toFixed(2)}M`;
    if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(0)}k`;
    return `${sign}$${abs.toFixed(0)}`;
  };

  const handleNotesSave = () => {
    if (selectedWallet) {
      onUpdateWallet(selectedWallet.walletAddress, selectedWallet.isBookmarked, tempNotes);
      setIsEditingNotes(false);
    }
  };

  const handleBookmarkToggle = () => {
    if (selectedWallet) {
      onUpdateWallet(selectedWallet.walletAddress, !selectedWallet.isBookmarked, selectedWallet.notes || "");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* 1. Watchlist and Profiles list */}
      <div className="bg-brand-container border border-brand-border rounded p-5 lg:col-span-1">
        <h2 className="font-display font-black text-sm text-white flex items-center gap-2 mb-3 uppercase tracking-wide">
          <Star className="w-4 h-4 text-brand-accent fill-brand-accent/10" />
          <span>FOLLOW SMART MONEY</span>
        </h2>
        <p className="text-xs text-brand-text-secondary mb-4">
          Bookmarked institutional wallets and active watchlists
        </p>

        {bookmarkedWallets.length === 0 ? (
          <div className="text-center py-8 bg-brand-hover/50 border border-brand-border-secondary rounded-sm border-dashed text-brand-text-secondary text-xs font-mono">
            No wallets bookmarked yet. Click the star icon on any profile to begin tracking!
          </div>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {bookmarkedWallets.map((w) => (
              <div
                key={w.walletAddress}
                onClick={() => onSelectWallet(w.walletAddress)}
                className={`p-3 rounded-sm border text-left cursor-pointer transition ${
                  selectedWallet?.walletAddress === w.walletAddress
                    ? "bg-brand-accent/5 border-brand-accent/30"
                    : "bg-brand-hover/30 border-brand-border hover:border-brand-border-secondary"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-sans font-semibold text-xs text-white block">
                    {w.walletLabel}
                  </span>
                  <Star className="w-3.5 h-3.5 text-brand-accent fill-brand-accent" />
                </div>
                <div className="flex items-center justify-between mt-1 text-[10px] font-mono">
                  <span className="text-brand-text-secondary">
                    {w.walletAddress.substring(0, 6)}...{w.walletAddress.slice(-4)}
                  </span>
                  <span className={w.realizedPnl >= 0 ? "text-brand-accent" : "text-brand-accent-red"}>
                    PnL: {formatUsd(w.realizedPnl)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-brand-border">
          <label className="text-[10px] font-mono text-brand-text-secondary uppercase tracking-widest block mb-2">
            ALL DISCOVERED ENTITIES ({wallets.length})
          </label>
          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {wallets.slice(0, 15).map((w) => (
              <button
                key={w.walletAddress}
                onClick={() => onSelectWallet(w.walletAddress)}
                className={`w-full text-left p-2 rounded-sm text-xs font-mono flex items-center justify-between transition ${
                  selectedWallet?.walletAddress === w.walletAddress
                    ? "bg-brand-border-secondary text-white font-bold"
                    : "text-brand-text-secondary hover:bg-brand-hover hover:text-brand-text-primary"
                }`}
              >
                <span>{w.walletLabel}</span>
                <span className="text-[10px] text-brand-accent font-bold">
                  {w.winRate}% WR
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Detailed Profiler analysis */}
      <div className="bg-brand-container border border-brand-border rounded p-5 lg:col-span-2">
        {!selectedWallet ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-20">
            <Coins className="w-12 h-12 text-brand-text-secondary animate-pulse mb-3" />
            <p className="text-brand-text-primary text-sm font-sans font-semibold">
              Select any wallet label or address from the transaction logs to analyze profiles
            </p>
            <p className="text-xs text-brand-text-secondary font-mono mt-1">
              Provides real-time Win Rate, leverage structures, realized PnL, and assets notes
            </p>
          </div>
        ) : (
          <div className="space-y-5 h-full flex flex-col justify-between">
            {/* Wallet header */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-border">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-black text-base text-white">
                      {selectedWallet.walletLabel}
                    </h3>
                    <button
                      onClick={handleBookmarkToggle}
                      className="text-brand-accent hover:opacity-85 p-1 rounded transition cursor-pointer"
                    >
                      <Star
                        className={`w-4 h-4 ${selectedWallet.isBookmarked ? "fill-brand-accent text-brand-accent" : "text-brand-text-secondary"}`}
                      />
                    </button>
                  </div>
                  <span className="font-mono text-xs text-brand-text-secondary select-all block mt-0.5">
                    {selectedWallet.walletAddress}
                  </span>
                </div>

                <div className="bg-brand-hover border border-brand-border px-3.5 py-1 rounded-sm text-[11px] font-mono text-brand-text-secondary">
                  <span>FIRST SEEN: </span>
                  <span className="text-brand-text-primary">
                    {new Date(selectedWallet.firstSeen).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Stats bento grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-5">
                <div className="bg-brand-hover/40 border border-brand-border rounded-sm p-3 text-center">
                  <span className="text-[10px] font-mono text-brand-text-secondary uppercase tracking-wider block">
                    WIN RATE
                  </span>
                  <span className="font-display text-xl font-bold text-white block mt-1">
                    {selectedWallet.winRate}%
                  </span>
                </div>
                <div className="bg-brand-hover/40 border border-brand-border rounded-sm p-3 text-center">
                  <span className="text-[10px] font-mono text-brand-text-secondary uppercase tracking-wider block">
                    TOTAL TRADES
                  </span>
                  <span className="font-display text-xl font-bold text-white block mt-1">
                    {selectedWallet.totalTrades}
                  </span>
                </div>
                <div className="bg-brand-hover/40 border border-brand-border rounded-sm p-3 text-center">
                  <span className="text-[10px] font-mono text-brand-text-secondary uppercase tracking-wider block">
                    AVG LEVERAGE
                  </span>
                  <span className="font-display text-xl font-bold text-brand-accent block mt-1">
                    {selectedWallet.averageLeverage}x
                  </span>
                </div>
                <div className="bg-brand-hover/40 border border-brand-border rounded-sm p-3 text-center">
                  <span className="text-[10px] font-mono text-brand-text-secondary uppercase tracking-wider block">
                    REALIZED PnL
                  </span>
                  <span
                    className={`font-display text-xl font-bold block mt-1 ${
                      selectedWallet.realizedPnl >= 0 ? "text-brand-accent" : "text-brand-accent-red"
                    }`}
                  >
                    {formatUsd(selectedWallet.realizedPnl)}
                  </span>
                </div>
              </div>

              {/* Secondary stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2 bg-brand-hover/20 border border-brand-border rounded-sm p-3 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-brand-text-secondary">Total volume traded:</span>
                    <span className="text-brand-text-primary">{formatUsd(selectedWallet.totalVolume)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-text-secondary">Avg position size:</span>
                    <span className="text-brand-text-primary">
                      {formatUsd(selectedWallet.averagePositionSize)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-text-secondary">Unrealized PnL:</span>
                    <span
                      className={
                        selectedWallet.unrealizedPnl >= 0 ? "text-brand-accent" : "text-brand-accent-red"
                      }
                    >
                      {formatUsd(selectedWallet.unrealizedPnl)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 bg-brand-hover/20 border border-brand-border rounded-sm p-3 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-brand-text-secondary">Active open size:</span>
                    <span className="text-brand-text-primary">
                      {selectedWallet.currentPositionsCount} markets
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-brand-text-secondary">Favorite Markets:</span>
                    <span className="flex gap-1.5">
                      {selectedWallet.favoriteCoins.map((fc) => (
                        <span
                          key={fc}
                          className="bg-brand-bg border border-brand-border-secondary text-brand-text-primary text-[10px] px-1.5 py-0.5 rounded-sm font-mono font-bold"
                        >
                          {fc}
                        </span>
                      ))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-text-secondary">Last seen activity:</span>
                    <span className="text-brand-text-primary">
                      {new Date(selectedWallet.lastActivity).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes / Profiler Annotation block */}
            <div className="bg-brand-hover/40 border border-brand-border rounded-sm p-4 mt-4 flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-brand-text-secondary uppercase tracking-widest flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-brand-text-secondary" />
                  Whale Desk Annotation
                </span>
                {!isEditingNotes ? (
                  <button
                    onClick={() => {
                      setTempNotes(selectedWallet.notes || "");
                      setIsEditingNotes(true);
                    }}
                    className="text-[10px] font-mono text-brand-accent hover:opacity-80 underline cursor-pointer"
                  >
                    Edit Note
                  </button>
                ) : (
                  <button
                    onClick={handleNotesSave}
                    className="text-[10px] font-mono text-brand-accent hover:opacity-80 flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3 h-3" /> Save Note
                  </button>
                )}
              </div>

              {!isEditingNotes ? (
                <p className="text-xs text-brand-text-primary font-sans italic">
                  {selectedWallet.notes ||
                    "No custom note added. Utilize notes to save specific whale strategies, correlation metrics, or expected leverage flips."}
                </p>
              ) : (
                <textarea
                  value={tempNotes}
                  onChange={(e) => setTempNotes(e.target.value)}
                  className="w-full h-16 bg-brand-bg border border-brand-border-secondary text-brand-text-primary text-xs font-sans rounded-sm p-2 focus:outline-none focus:border-brand-accent/50"
                  placeholder="Write your institutional notes on this wallet's strategy..."
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
