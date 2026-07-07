import React, { useState } from "react";
import { Star, FileText, TrendingUp, TrendingDown, Clock, ShieldAlert, Check, Coins, Flame, Zap } from "lucide-react";
import { WalletProfile, WhaleTrade } from "../types";

interface WalletProfilerProps {
  selectedWallet: WalletProfile | null;
  onUpdateWallet: (address: string, isBookmarked: boolean, notes: string) => void;
  wallets: WalletProfile[];
  onSelectWallet: (address: string) => void;
  trades: WhaleTrade[];
}

export default function WalletProfiler({
  selectedWallet,
  onUpdateWallet,
  wallets,
  onSelectWallet,
  trades = [],
}: WalletProfilerProps) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState("");
  const [sidebarTab, setSidebarTab] = useState<"watchlist" | "smart" | "all">("watchlist");
  const [searchQuery, setSearchQuery] = useState("");

  const bookmarkedWallets = wallets.filter((w) => w.isBookmarked);

  const formatUsd = (val: number) => {
    const abs = Math.abs(val);
    const sign = val >= 0 ? "" : "-";
    if (abs >= 1000000) return `${sign}$${(abs / 1000000).toFixed(2)}M`;
    if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(0)}k`;
    return `${sign}$${abs.toFixed(0)}`;
  };

  // Helper to calculate 24h stats for a wallet
  const getWallet24hStats = (address: string) => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const walletTrades = trades.filter(
      (t) =>
        t.walletAddress.toLowerCase() === address.toLowerCase() &&
        t.timestamp >= oneDayAgo
    );

    if (walletTrades.length === 0) {
      return {
        tradesCount: 0,
        winRate: null,
        pnl: 0,
        isSmart: false,
      };
    }

    const winningTrades = walletTrades.filter((t) => t.pnlUsd > 0).length;
    const winRate = (winningTrades / walletTrades.length) * 100;
    const pnl = walletTrades.reduce((sum, t) => sum + t.pnlUsd, 0);

    return {
      tradesCount: walletTrades.length,
      winRate: parseFloat(winRate.toFixed(1)),
      pnl,
      isSmart: winRate >= 70,
    };
  };

  // Compile smart wallets based on the last 24 hours (win rate >= 70%)
  const smartWalletsWithStats = wallets
    .map((w) => {
      const stats24h = getWallet24hStats(w.walletAddress);
      return {
        wallet: w,
        stats24h,
      };
    })
    .filter((item) => item.stats24h.isSmart);

  // Sort smart wallets by win rate descending
  smartWalletsWithStats.sort((a, b) => {
    const wrA = a.stats24h.winRate ?? 0;
    const wrB = b.stats24h.winRate ?? 0;
    if (wrB !== wrA) return wrB - wrA;
    return b.stats24h.tradesCount - a.stats24h.tradesCount;
  });

  const selectedStats24h = selectedWallet ? getWallet24hStats(selectedWallet.walletAddress) : null;

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

        {/* Tab Selection */}
        <div className="flex bg-brand-hover p-0.5 border border-brand-border-secondary rounded-sm text-xs font-mono mb-4">
          <button
            onClick={() => setSidebarTab("watchlist")}
            className={`flex-1 py-1.5 rounded-sm text-center cursor-pointer transition font-bold uppercase tracking-wider ${
              sidebarTab === "watchlist"
                ? "bg-brand-border-secondary text-brand-accent"
                : "text-brand-text-secondary hover:text-brand-text-primary"
            }`}
          >
            Watchlist
          </button>
          <button
            onClick={() => setSidebarTab("smart")}
            className={`flex-1 py-1.5 rounded-sm text-center cursor-pointer transition font-bold uppercase tracking-wider relative ${
              sidebarTab === "smart"
                ? "bg-brand-border-secondary text-brand-accent"
                : "text-brand-text-secondary hover:text-brand-text-primary"
            }`}
          >
            Smart 24h
            {smartWalletsWithStats.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-accent"></span>
              </span>
            )}
          </button>
          <button
            onClick={() => setSidebarTab("all")}
            className={`flex-1 py-1.5 rounded-sm text-center cursor-pointer transition font-bold uppercase tracking-wider ${
              sidebarTab === "all"
                ? "bg-brand-border-secondary text-brand-accent"
                : "text-brand-text-secondary hover:text-brand-text-primary"
            }`}
          >
            All ({wallets.length})
          </button>
        </div>

        {/* Search input for ALL tab */}
        {sidebarTab === "all" && (
          <div className="mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search wallet label or address..."
              className="w-full bg-brand-bg border border-brand-border-secondary text-brand-text-primary text-xs font-sans rounded-sm p-2 focus:outline-none focus:border-brand-accent/50 placeholder:text-brand-text-secondary"
            />
          </div>
        )}

        {/* Watchlist Tab View */}
        {sidebarTab === "watchlist" && (
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {bookmarkedWallets.length === 0 ? (
              <div className="text-center py-8 bg-brand-hover/50 border border-brand-border-secondary rounded-sm border-dashed text-brand-text-secondary text-xs font-mono px-3">
                No wallets bookmarked yet. Click the star icon on any profile to begin tracking!
              </div>
            ) : (
              bookmarkedWallets.map((w) => {
                const stats24h = getWallet24hStats(w.walletAddress);
                return (
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
                      <span className="font-sans font-semibold text-xs text-white block flex items-center gap-1.5">
                        {w.walletLabel}
                        {stats24h.isSmart && (
                          <span className="inline-flex items-center gap-0.5 bg-brand-accent/10 border border-brand-accent/30 text-brand-accent text-[8px] px-1 rounded-sm uppercase font-bold animate-pulse">
                            <Flame className="w-2.5 h-2.5 fill-brand-accent" /> SMART
                          </span>
                        )}
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
                );
              })
            )}
          </div>
        )}

        {/* Smart 24h Tab View */}
        {sidebarTab === "smart" && (
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {smartWalletsWithStats.length === 0 ? (
              <div className="text-center py-10 bg-brand-hover/50 border border-brand-border-secondary rounded-sm border-dashed text-brand-text-secondary text-xs font-mono px-4">
                <ShieldAlert className="w-8 h-8 mx-auto text-brand-text-secondary mb-2 opacity-60" />
                No active smart wallets currently flagged. <br/>
                <span className="text-[10px] text-brand-text-secondary block mt-1.5">
                  Looking for active traders with a 70%+ win rate in the last 24 hours...
                </span>
              </div>
            ) : (
              smartWalletsWithStats.map(({ wallet: w, stats24h }) => (
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
                    <span className="font-sans font-semibold text-xs text-white block flex items-center gap-1.5">
                      {w.walletLabel}
                      <span className="inline-flex items-center gap-0.5 bg-brand-accent/15 border border-brand-accent/40 text-brand-accent text-[9px] px-1.5 py-0.5 rounded-sm uppercase font-bold">
                        <Flame className="w-2.5 h-2.5 fill-brand-accent text-brand-accent" /> {stats24h.winRate}% WR
                      </span>
                    </span>
                    <Star className={`w-3.5 h-3.5 ${w.isBookmarked ? "text-brand-accent fill-brand-accent" : "text-brand-text-secondary"}`} />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[10px] font-mono">
                    <span className="text-brand-text-secondary">
                      {stats24h.tradesCount} trades (24h)
                    </span>
                    <span className={stats24h.pnl >= 0 ? "text-brand-accent" : "text-brand-accent-red"}>
                      PnL: {formatUsd(stats24h.pnl)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* All Profiles Tab View */}
        {sidebarTab === "all" && (
          <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
            {wallets
              .filter(
                (w) =>
                  w.walletLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  w.walletAddress.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((w) => {
                const stats24h = getWallet24hStats(w.walletAddress);
                return (
                  <button
                    key={w.walletAddress}
                    onClick={() => onSelectWallet(w.walletAddress)}
                    className={`w-full text-left p-2 rounded-sm text-xs font-mono flex items-center justify-between transition ${
                      selectedWallet?.walletAddress === w.walletAddress
                        ? "bg-brand-border-secondary text-white font-bold"
                        : "text-brand-text-secondary hover:bg-brand-hover hover:text-brand-text-primary animate-fade"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span className="truncate">{w.walletLabel}</span>
                      {stats24h.isSmart && (
                        <Flame className="w-3.5 h-3.5 text-brand-accent fill-brand-accent flex-shrink-0 animate-pulse" />
                      )}
                    </span>
                    <span className="text-[10px] text-brand-accent font-bold ml-2">
                      {w.winRate}% WR
                    </span>
                  </button>
                );
              })}
          </div>
        )}
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

              {/* Dynamic 24h Smart Watchlist Alert Flag Banner */}
              {selectedStats24h?.isSmart && (
                <div className="mt-4 p-3.5 bg-brand-accent/10 border border-brand-accent/30 rounded-sm flex items-start gap-3">
                  <div className="p-1.5 bg-brand-accent/25 rounded-sm text-brand-accent animate-pulse mt-0.5">
                    <Flame className="w-5 h-5 fill-brand-accent" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      SMART WATCHLIST TRADER DETECTED
                    </h4>
                    <p className="text-[11px] text-brand-text-secondary font-mono mt-1 leading-relaxed">
                      This wallet is automatically flagged on our Smart Watchlist with a stellar{" "}
                      <span className="text-brand-accent font-bold">{selectedStats24h.winRate}% win rate</span>{" "}
                      across <span className="text-brand-accent font-bold">{selectedStats24h.tradesCount} positions</span>{" "}
                      and <span className="text-brand-accent font-bold">{formatUsd(selectedStats24h.pnl)} realized profit</span>{" "}
                      over the last 24 hours!
                    </p>
                  </div>
                </div>
              )}

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

