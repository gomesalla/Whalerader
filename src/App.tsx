import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import StatsGrid from "./components/StatsGrid";
import WhaleHeatmap from "./components/WhaleHeatmap";
import Leaderboard from "./components/Leaderboard";
import TradesTable from "./components/TradesTable";
import WalletProfiler from "./components/WalletProfiler";
import ClusterList from "./components/ClusterList";
import AlertsManager from "./components/AlertsManager";
import AnalyticsCharts from "./components/AnalyticsCharts";
import AiInsightsPanel from "./components/AiInsightsPanel";
import AuditLogsPanel from "./components/AuditLogsPanel";
import {
  WhaleTrade,
  WalletProfile,
  ClusterAlert,
  MarketSentiment,
  LiveStats,
  RealTimeAlert,
  AuditLog,
  Direction,
} from "./types";

export default function App() {
  // Global Data States
  const [coins, setCoins] = useState<string[]>([]);
  const [trades, setTrades] = useState<WhaleTrade[]>([]);
  const [clusters, setClusters] = useState<ClusterAlert[]>([]);
  const [alerts, setAlerts] = useState<RealTimeAlert[]>([]);
  const [stats, setStats] = useState<LiveStats>({
    totalWhaleLongsUsd: 42500000,
    totalWhaleShortsUsd: 18500000,
    longShortRatio: 2.3,
    largestLongUsd: 3400000,
    largestLongCoin: "BTC",
    largestShortUsd: 1200000,
    largestShortCoin: "SOL",
    mostActiveCoin: "SOL",
    highestOIIncreaseCoin: "SUI",
    highestOIIncreasePercent: 24.5,
    highestVolumeIncreaseCoin: "HYPE",
    highestVolumeIncreasePercent: 32.8,
    mostBullishCoin: "BTC",
    mostBearishCoin: "PEPE",
  });
  const [sentiment, setSentiment] = useState<MarketSentiment[]>([]);
  const [wallets, setWallets] = useState<WalletProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Selection / Filter States
  const [selectedWalletAddress, setSelectedWalletAddress] = useState<string | null>(null);
  const [whaleThreshold, setWhaleThreshold] = useState(100000); // default $100k
  const [timeFilter, setTimeFilter] = useState("15m"); // default 15 minutes
  const [autoRefreshRate, setAutoRefreshRate] = useState(5000); // default 5 seconds (Live stream mode)
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");

  // Fetch complete initial snapshots on startup (Hydration)
  const hydrateSnapshot = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/init");
      if (response.ok) {
        const data = await response.json();
        setCoins(data.coins);
        setTrades(data.trades);
        setClusters(data.clusters);
        setAlerts(data.alerts);
        setStats(data.stats);
        setSentiment(data.sentiment);
        setWallets(data.wallets);
        setAuditLogs(data.auditLogs);
        setConnectionStatus("connected");
      } else {
        throw new Error("Failed to Hydrate Snapshots");
      }
    } catch (e) {
      console.error("Hydration fail:", e);
      setConnectionStatus("disconnected");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Setup EventSource subscription for real-time live events streaming
  useEffect(() => {
    hydrateSnapshot();

    const eventSource = new EventSource("/api/events");

    eventSource.onopen = () => {
      setConnectionStatus("connected");
    };

    eventSource.onerror = (err) => {
      console.warn("SSE connection error. Retrying fallback polling.", err);
      setConnectionStatus("connecting");
    };

    // Listeners for SSE events
    eventSource.addEventListener("handshake", (e: any) => {
      console.log("SSE handshaked:", JSON.parse(e.data));
    });

    eventSource.addEventListener("tick", (e: any) => {
      const updatedSentiment = JSON.parse(e.data) as MarketSentiment[];
      setSentiment(updatedSentiment);
    });

    eventSource.addEventListener("trade", (e: any) => {
      const newTrade = JSON.parse(e.data) as WhaleTrade;
      setTrades((prev) => {
        const updated = [newTrade, ...prev];
        return updated.slice(0, 500); // cap history
      });

      // Update wallets profile array with fresh win rates or trade counts
      setWallets((prev) =>
        prev.map((w) => {
          if (w.walletAddress.toLowerCase() === newTrade.walletAddress.toLowerCase()) {
            return {
              ...w,
              totalTrades: w.totalTrades + 1,
              totalVolume: w.totalVolume + newTrade.tradeSizeUsd,
              lastActivity: Date.now(),
              currentPositionsCount: w.currentPositionsCount + (newTrade.positionStatus === "New Position" ? 1 : 0),
            };
          }
          return w;
        })
      );

      // Log audit
      setAuditLogs((prev) => [
        {
          timestamp: Date.now(),
          action: "Ingested Trade Flow",
          details: `Detected Whale Trade: ${newTrade.walletLabel} opened $${(newTrade.tradeSizeUsd / 1000).toFixed(0)}k ${newTrade.direction} on ${newTrade.coin}`,
          category: "TRADE_DETECTOR",
        },
        ...prev,
      ]);
    });

    eventSource.addEventListener("alert", (e: any) => {
      const newAlert = JSON.parse(e.data) as RealTimeAlert;
      setAlerts((prev) => [newAlert, ...prev].slice(0, 100));
    });

    eventSource.addEventListener("stats", (e: any) => {
      const updatedStats = JSON.parse(e.data) as LiveStats;
      setStats(updatedStats);
    });

    return () => {
      eventSource.close();
    };
  }, []);

  // Update bookmarks and notes on database proxy
  const handleUpdateWallet = async (address: string, isBookmarked: boolean, notes: string) => {
    try {
      const response = await fetch(`/api/wallets/${address}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBookmarked, notes }),
      });

      if (response.ok) {
        const updatedWallet = await response.json();
        setWallets((prev) =>
          prev.map((w) => (w.walletAddress.toLowerCase() === address.toLowerCase() ? updatedWallet : w))
        );
      }
    } catch (e) {
      console.error("Failed to update wallet profile:", e);
    }
  };

  // User manual order injection callback
  const triggerManualTrade = async (coin: string, direction: Direction, size: number) => {
    try {
      const response = await fetch("/api/trades/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coin, direction, size }),
      });
      if (response.ok) {
        const trade = await response.json();
        setTrades((prev) => [trade, ...prev].slice(0, 500));
      }
    } catch (e) {
      console.error("Failed to inject trade:", e);
    }
  };

  const getSelectedWallet = (): WalletProfile | null => {
    if (!selectedWalletAddress) return null;
    return wallets.find((w) => w.walletAddress.toLowerCase() === selectedWalletAddress.toLowerCase()) || null;
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col selection:bg-emerald-500/30">
      {/* 1. Header */}
      <Header
        connectionStatus={connectionStatus}
        autoRefreshRate={autoRefreshRate}
        setAutoRefreshRate={setAutoRefreshRate}
        onRefresh={hydrateSnapshot}
        isRefreshing={isRefreshing}
      />

      {/* 2. Top Stats Grid Banner */}
      <StatsGrid stats={stats} />

      {/* 3. Main Bento Dashboard Arena */}
      <main className="flex-1 p-6 space-y-6 max-w-[1600px] w-full mx-auto">
        {/* Layout Grid 1: AI Insights and Analytics Chart */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-1">
            <AiInsightsPanel timeframe={timeFilter} />
          </div>
          <div className="xl:col-span-2">
            <AnalyticsCharts trades={trades} />
          </div>
        </div>

        {/* Layout Grid 2: Heatmap & Leaderboards */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <WhaleHeatmap trades={trades} coins={coins} />
          </div>
          <div className="xl:col-span-1">
            <Leaderboard sentiment={sentiment} trades={trades} />
          </div>
        </div>

        {/* Layout Grid 3: Main Whale Trade Feed Logger */}
        <div>
          <TradesTable
            trades={trades}
            onSelectWallet={setSelectedWalletAddress}
            whaleThreshold={whaleThreshold}
            setWhaleThreshold={setWhaleThreshold}
            timeFilter={timeFilter}
            setTimeFilter={setTimeFilter}
            triggerManualTrade={triggerManualTrade}
            coins={coins}
          />
        </div>

        {/* Layout Grid 4: Alert System Ingestion & Cluster Detection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <ClusterList clusters={clusters} />
          </div>
          <div>
            <AlertsManager alerts={alerts} />
          </div>
        </div>

        {/* Layout Grid 5: Wallet intelligence / Bookmarking Watchlist */}
        <div id="wallet-profiler-section" className="border-t border-slate-900 pt-6">
          <div className="mb-4">
            <h2 className="font-display font-semibold text-base text-slate-100 uppercase tracking-tight">
              WALLET PROFILER & CORRELATION HUB
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Analyze the historical execution strategies, win rates, and notes of tagged whales
            </p>
          </div>
          <WalletProfiler
            selectedWallet={getSelectedWallet()}
            onUpdateWallet={handleUpdateWallet}
            wallets={wallets}
            onSelectWallet={setSelectedWalletAddress}
          />
        </div>

        {/* Layout Grid 6: Terminal Audit Ingestion Logging */}
        <div>
          <AuditLogsPanel logs={auditLogs} />
        </div>
      </main>

      {/* Footer credits */}
      <footer className="border-t border-slate-900 py-6 px-6 bg-slate-950 text-center text-xs text-slate-500 font-mono">
        <p>HYPERLIQUID DEVIATIVE RESEARCH DECK — CONFIDENTIAL PROPRIETARY DISTRIBUTION</p>
        <p className="text-[10px] text-slate-600 mt-1">
          Synced with Hyperliquid v4 Public Node Engine. All estimated liquidation price triggers are simulated parameters based on standard isolated margins.
        </p>
      </footer>
    </div>
  );
}
