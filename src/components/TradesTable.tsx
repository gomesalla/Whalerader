import React, { useState } from "react";
import { Search, SlidersHorizontal, ArrowDownToLine, Wallet, ArrowUpRight, ArrowDownRight, Eye, RefreshCw } from "lucide-react";
import { WhaleTrade, Direction, PositionStatus } from "../types";

interface TradesTableProps {
  trades: WhaleTrade[];
  onSelectWallet: (address: string) => void;
  whaleThreshold: number;
  setWhaleThreshold: (threshold: number) => void;
  timeFilter: string;
  setTimeFilter: (filter: string) => void;
  triggerManualTrade: (coin: string, direction: Direction, size: number) => void;
  coins: string[];
}

export default function TradesTable({
  trades,
  onSelectWallet,
  whaleThreshold,
  setWhaleThreshold,
  timeFilter,
  setTimeFilter,
  triggerManualTrade,
  coins,
}: TradesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCoin, setSelectedCoin] = useState("ALL");
  const [directionFilter, setDirectionFilter] = useState<"ALL" | "LONG" | "SHORT">("ALL");
  const [positionTypeFilter, setPositionTypeFilter] = useState<"ALL" | "NEW" | "INCREASE" | "CLOSE">("ALL");
  const [showManualOrder, setShowManualOrder] = useState(false);

  // Manual trade order form states
  const [manualCoin, setManualCoin] = useState("SOL");
  const [manualDirection, setManualDirection] = useState<Direction>("LONG");
  const [manualSize, setManualSize] = useState(500000);

  const thresholds = [25000, 50000, 100000, 250000, 500000, 1000000, 2000000, 5000000];

  const formatUsd = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val.toFixed(2)}`;
  };

  const formatContractPrice = (price: number) => {
    if (price < 0.001) return price.toFixed(8);
    if (price < 1) return price.toFixed(5);
    if (price < 10) return price.toFixed(3);
    return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Time calculations
  const now = Date.now();
  const filterByTime = (timestamp: number) => {
    const diffMs = now - timestamp;
    const diffMins = diffMs / (60 * 1000);
    const diffHrs = diffMins / 60;

    switch (timeFilter) {
      case "5m":
        return diffMins <= 5;
      case "15m":
        return diffMins <= 15;
      case "30m":
        return diffMins <= 30;
      case "1h":
        return diffHrs <= 1;
      case "4h":
        return diffHrs <= 4;
      case "12h":
        return diffHrs <= 12;
      case "24h":
        return diffHrs <= 24;
      case "7d":
        return diffHrs <= 24 * 7;
      default:
        return true;
    }
  };

  // Process filters
  const filteredTrades = trades.filter((t) => {
    // 1. Threshold
    if (t.tradeSizeUsd < whaleThreshold) return false;

    // 2. Time Window
    if (!filterByTime(t.timestamp)) return false;

    // 3. Search Term (Wallet label, address, coin)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchLabel = t.walletLabel.toLowerCase().includes(term);
      const matchAddress = t.walletAddress.toLowerCase().includes(term);
      const matchCoin = t.coin.toLowerCase().includes(term);
      if (!matchLabel && !matchAddress && !matchCoin) return false;
    }

    // 4. Coin Dropdown
    if (selectedCoin !== "ALL" && t.coin !== selectedCoin) return false;

    // 5. Direction Toggle
    if (directionFilter !== "ALL" && t.direction !== directionFilter) return false;

    // 6. Position Type
    if (positionTypeFilter === "NEW" && t.positionStatus !== "New Position") return false;
    if (positionTypeFilter === "INCREASE" && t.positionStatus !== "Increase Position") return false;
    if (positionTypeFilter === "CLOSE" && t.positionStatus !== "Close Position") return false;

    return true;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "Timestamp",
      "Wallet Label",
      "Wallet Address",
      "Coin",
      "Direction",
      "Position Status",
      "Size USD",
      "Contracts",
      "Entry Price",
      "Leverage",
      "Est. Liquidation Price",
    ];

    const escapeCSVCell = (val: any) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      const escaped = str.replace(/"/g, '""');
      if (escaped.includes('"') || escaped.includes(',') || escaped.includes('\n') || escaped.includes('\r')) {
        return `"${escaped}"`;
      }
      return escaped;
    };

    const rows = filteredTrades.map((t) => [
      new Date(t.timestamp).toISOString(),
      t.walletLabel,
      t.walletAddress,
      t.coin,
      t.direction,
      t.positionStatus,
      t.tradeSizeUsd,
      t.contracts,
      t.entryPrice,
      t.leverage,
      t.estimatedLiquidationPrice,
    ]);

    const csvContent = [
      headers.map(escapeCSVCell).join(","),
      ...rows.map((row) => row.map(escapeCSVCell).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `hyperliquid_whales_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredTrades, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `hyperliquid_whales_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-brand-container border border-brand-border rounded p-5 h-full">
      {/* Filters Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-5 border-b border-brand-border pb-5">
        <div className="flex flex-wrap items-center gap-3">
          {/* Preset Whale Size Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-brand-text-secondary">WHALE THRESHOLD:</label>
            <div className="flex bg-brand-hover border border-brand-border-secondary rounded-sm p-0.5 text-xs font-mono">
              {thresholds.slice(0, 5).map((val) => (
                <button
                  key={val}
                  onClick={() => setWhaleThreshold(val)}
                  className={`px-2.5 py-1 rounded-sm cursor-pointer transition ${
                    whaleThreshold === val ? "bg-brand-accent text-black font-bold" : "text-brand-text-secondary hover:text-brand-text-primary"
                  }`}
                >
                  ${val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}k`}
                </button>
              ))}
              {/* Custom Input Trigger */}
              <input
                type="number"
                value={whaleThreshold}
                onChange={(e) => setWhaleThreshold(Number(e.target.value))}
                placeholder="Custom"
                className="w-16 bg-transparent border-none text-brand-text-primary text-xs text-center focus:outline-none font-bold placeholder-brand-text-secondary"
              />
            </div>
          </div>

          {/* Time Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-brand-text-secondary">TIME WINDOW:</label>
            <div className="flex bg-brand-hover border border-brand-border-secondary rounded-sm p-0.5 text-xs font-mono">
              {["5m", "15m", "30m", "1h", "4h", "24h", "7d"].map((window) => (
                <button
                  key={window}
                  onClick={() => setTimeFilter(window)}
                  className={`px-2 py-1.5 rounded-sm cursor-pointer transition ${
                    timeFilter === window ? "bg-brand-accent text-black font-bold" : "text-brand-text-secondary hover:text-brand-text-primary"
                  }`}
                >
                  {window}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowManualOrder(!showManualOrder)}
            className="bg-brand-accent/10 border border-brand-accent/30 hover:bg-brand-accent/20 text-brand-accent font-mono text-xs px-3.5 py-1.5 rounded-sm flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            INJECT TRADE
          </button>
          <button
            onClick={handleExportCSV}
            className="bg-brand-hover hover:bg-brand-border-secondary border border-brand-border-secondary text-brand-text-primary font-mono text-xs px-3.5 py-1.5 rounded-sm flex items-center gap-1.5 transition cursor-pointer"
          >
            <ArrowDownToLine className="w-3.5 h-3.5" />
            CSV
          </button>
          <button
            onClick={handleExportJSON}
            className="bg-brand-hover hover:bg-brand-border-secondary border border-brand-border-secondary text-brand-text-primary font-mono text-xs px-3.5 py-1.5 rounded-sm flex items-center gap-1.5 transition cursor-pointer"
          >
            JSON
          </button>
        </div>
      </div>

      {/* Manual Inject Form */}
      {showManualOrder && (
        <div className="bg-brand-hover border border-brand-accent/20 rounded p-4 mb-5 flex flex-col sm:flex-row items-end gap-3.5">
          <div className="flex-1 space-y-1.5">
            <label className="text-[10px] font-mono text-brand-text-secondary block">ASSET</label>
            <select
              value={manualCoin}
              onChange={(e) => setManualCoin(e.target.value)}
              className="w-full bg-brand-bg border border-brand-border-secondary text-brand-text-primary text-xs font-mono rounded px-3 py-1.5 focus:outline-none focus:border-brand-accent/50"
            >
              {coins.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="w-28 space-y-1.5">
            <label className="text-[10px] font-mono text-brand-text-secondary block">DIRECTION</label>
            <select
              value={manualDirection}
              onChange={(e) => setManualDirection(e.target.value as Direction)}
              className="w-full bg-brand-bg border border-brand-border-secondary text-brand-text-primary text-xs font-mono rounded-sm px-3 py-1.5 focus:outline-none focus:border-brand-accent/50"
            >
              <option value="LONG">LONG</option>
              <option value="SHORT">SHORT</option>
            </select>
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="text-[10px] font-mono text-brand-text-secondary block">SIZE USD ($)</label>
            <input
              type="number"
              value={manualSize}
              onChange={(e) => setManualSize(Number(e.target.value))}
              className="w-full bg-brand-bg border border-brand-border-secondary text-brand-text-primary text-xs font-mono rounded px-3 py-1.5 focus:outline-none focus:border-brand-accent/50"
            />
          </div>
          <button
            onClick={() => {
              triggerManualTrade(manualCoin, manualDirection, manualSize);
              setShowManualOrder(false);
            }}
            className="bg-brand-accent hover:opacity-90 text-black font-bold px-4 py-1.5 rounded-sm text-xs h-9 cursor-pointer transition"
          >
            INJECT ORDER
          </button>
        </div>
      )}

      {/* Advanced Filter Row */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3 mb-4 bg-brand-hover/40 border border-brand-border rounded px-4 py-3">
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-brand-text-secondary absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Wallet, Coin, Address..."
            className="w-full bg-brand-bg border border-brand-border-secondary pl-9 pr-4 py-2 text-brand-text-primary text-xs rounded-sm focus:outline-none focus:border-brand-accent/50 placeholder-brand-text-secondary"
          />
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto">
          <SlidersHorizontal className="w-4 h-4 text-brand-text-secondary flex-shrink-0" />
          
          <select
            value={selectedCoin}
            onChange={(e) => setSelectedCoin(e.target.value)}
            className="bg-brand-bg border border-brand-border-secondary text-brand-text-primary text-xs font-mono rounded px-3 py-1.5 focus:outline-none focus:border-brand-accent/50"
          >
            <option value="ALL">All Markets</option>
            {coins.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={directionFilter}
            onChange={(e) => setDirectionFilter(e.target.value as any)}
            className="bg-brand-bg border border-brand-border-secondary text-brand-text-primary text-xs font-mono rounded px-3 py-1.5 focus:outline-none focus:border-brand-accent/50"
          >
            <option value="ALL">All Directions</option>
            <option value="LONG">Longs Only</option>
            <option value="SHORT">Shorts Only</option>
          </select>

          <select
            value={positionTypeFilter}
            onChange={(e) => setPositionTypeFilter(e.target.value as any)}
            className="bg-brand-bg border border-brand-border-secondary text-brand-text-primary text-xs font-mono rounded px-3 py-1.5 focus:outline-none focus:border-brand-accent/50"
          >
            <option value="ALL">All Types</option>
            <option value="NEW">New Positions Only</option>
            <option value="INCREASE">Position Increases</option>
            <option value="CLOSE">Position Closes</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto border border-brand-border rounded bg-brand-bg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-brand-hover border-b border-brand-border font-mono text-[10px] text-brand-text-secondary uppercase tracking-wider">
              <th className="py-3.5 px-4">Time</th>
              <th className="py-3.5 px-3">Entity Profile</th>
              <th className="py-3.5 px-3">Asset</th>
              <th className="py-3.5 px-3">Direction</th>
              <th className="py-3.5 px-3">Position State</th>
              <th className="py-3.5 px-3 text-right">Size USD</th>
              <th className="py-3.5 px-3 text-right">Contracts / Leverage</th>
              <th className="py-3.5 px-3 text-right">Estimated Liquidation</th>
              <th className="py-3.5 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrades.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-brand-text-secondary text-xs font-mono">
                  No whale events matching current filters in time window.
                </td>
              </tr>
            ) : (
              filteredTrades.map((t) => {
                const isNew = t.positionStatus === "New Position" || t.positionStatus.includes("Flip");
                const isClose = t.positionStatus === "Close Position";
                const isLong = t.direction === "LONG";

                const highlightRowClass = isNew
                  ? "bg-brand-accent/5 hover:bg-brand-accent/10 border-l-2 border-l-brand-accent border-b border-brand-border transition"
                  : isClose
                  ? "bg-brand-hover/10 opacity-70 border-b border-brand-border transition"
                  : "hover:bg-brand-hover/30 border-b border-brand-border transition";

                return (
                  <tr key={t.id} className={highlightRowClass}>
                    {/* Timestamp */}
                    <td className="py-3 px-4 font-mono text-xs text-brand-text-secondary">
                      {new Date(t.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>

                    {/* Entity Profile */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-3.5 h-3.5 text-brand-text-secondary" />
                        <div>
                          <span
                            onClick={() => onSelectWallet(t.walletAddress)}
                            className="font-sans font-semibold text-xs text-brand-text-primary hover:text-brand-accent cursor-pointer block"
                          >
                            {t.walletLabel}
                          </span>
                          <span className="font-mono text-[9px] text-brand-text-secondary">
                            {t.walletAddress.substring(0, 6)}...{t.walletAddress.slice(-4)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Coin */}
                    <td className="py-3 px-3">
                      <span className="font-display font-bold text-xs text-white">{t.coin}</span>
                    </td>

                    {/* Direction */}
                    <td className="py-3 px-3">
                      {isLong ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-brand-accent bg-brand-accent/5 border border-brand-accent/10 px-1.5 py-0.5 rounded-sm">
                          <ArrowUpRight className="w-3 h-3" />
                          LONG
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-brand-accent-red bg-brand-accent-red/5 border border-brand-accent-red/10 px-1.5 py-0.5 rounded-sm">
                          <ArrowDownRight className="w-3 h-3" />
                          SHORT
                        </span>
                      )}
                    </td>

                    {/* Position Status */}
                    <td className="py-3 px-3">
                      {isNew ? (
                        <span className="inline-flex items-center text-[10px] font-mono font-bold text-brand-accent bg-brand-accent/10 border border-brand-accent/30 px-2 py-0.5 rounded-sm">
                          {t.positionStatus}
                        </span>
                      ) : (
                        <span className={`inline-flex items-center text-[10px] font-mono px-2 py-0.5 rounded-sm border ${
                          t.positionStatus === "Increase Position"
                            ? "text-brand-accent/80 bg-brand-accent/5 border-brand-accent/10"
                            : t.positionStatus === "Reduce Position"
                            ? "text-brand-text-secondary bg-brand-hover/50 border-brand-border"
                            : "text-brand-accent-red bg-brand-accent-red/10 border-brand-accent-red/20 font-bold"
                        }`}>
                          {t.positionStatus}
                        </span>
                      )}
                    </td>

                    {/* Size USD */}
                    <td className="py-3 px-3 text-right font-mono text-xs text-white font-bold">
                      {formatUsd(t.tradeSizeUsd)}
                    </td>

                    {/* Contracts & Leverage */}
                    <td className="py-3 px-3 text-right">
                      <span className="font-mono text-xs text-brand-text-primary block">
                        {t.contracts.toLocaleString()} contracts
                      </span>
                      <span className="font-mono text-[10px] text-brand-text-secondary">
                        {t.leverage}x leverage
                      </span>
                    </td>

                    {/* Liquidation Estimate */}
                    <td className="py-3 px-3 text-right">
                      {isClose ? (
                        <span className="text-xs font-mono text-brand-text-secondary">—</span>
                      ) : (
                        <div>
                          <span className="font-mono text-xs text-brand-text-primary font-bold block">
                            ${formatContractPrice(t.estimatedLiquidationPrice)}
                          </span>
                          <span className="font-mono text-[9px] text-brand-accent-red font-bold">
                            Dist: {t.liquidationDistancePercent.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onSelectWallet(t.walletAddress)}
                        className="bg-brand-hover hover:bg-brand-border-secondary border border-brand-border-secondary text-brand-text-secondary hover:text-brand-accent p-1.5 rounded-sm cursor-pointer transition"
                        title="Analyze Wallet Profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex justify-between items-center text-[10px] font-mono text-brand-text-secondary">
        <span>Rows: Detected Whale Derivatives Positions</span>
        <span>Filtered {filteredTrades.length} of {trades.length} elements</span>
      </div>
    </div>
  );
}
