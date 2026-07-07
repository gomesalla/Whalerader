import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { TrendingUp, BarChart2, DollarSign } from "lucide-react";
import { WhaleTrade } from "../types";

interface AnalyticsChartsProps {
  trades: WhaleTrade[];
}

type ChartTab = "long_short" | "cvd" | "oi_funding";

export default function AnalyticsCharts({ trades }: AnalyticsChartsProps) {
  const [activeTab, setActiveTab] = useState<ChartTab>("long_short");

  // Format data for chart consumption (grouped by minutes in the last 15 mins)
  const formatChartData = () => {
    const intervals: Record<
      string,
      { time: string; longVol: number; shortVol: number; netFlow: number; cvd: number; oi: number; funding: number }
    > = {};

    const now = Date.now();
    let currentCvd = 0;

    // Pre-populate last 15 minute slots
    for (let i = 14; i >= 0; i--) {
      const timeStr = new Date(now - i * 60 * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      intervals[timeStr] = {
        time: timeStr,
        longVol: 0,
        shortVol: 0,
        netFlow: 0,
        cvd: 0,
        oi: 45000000 + i * 250000, // steady baseline
        funding: 0.00015,
      };
    }

    // Sort trades chronologically to build Cumulative Volume Delta (CVD) correctly
    const chronoTrades = [...trades].sort((a, b) => a.timestamp - b.timestamp);

    chronoTrades.forEach((t) => {
      const timeStr = new Date(t.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      if (intervals[timeStr]) {
        if (t.direction === "LONG") {
          intervals[timeStr].longVol += t.tradeSizeUsd;
          currentCvd += t.tradeSizeUsd;
        } else {
          intervals[timeStr].shortVol += t.tradeSizeUsd;
          currentCvd -= t.tradeSizeUsd;
        }
        intervals[timeStr].netFlow = intervals[timeStr].longVol - intervals[timeStr].shortVol;
        intervals[timeStr].cvd = currentCvd;
        intervals[timeStr].oi = t.openInterest || intervals[timeStr].oi;
        intervals[timeStr].funding = t.fundingRate || intervals[timeStr].funding;
      }
    });

    // Backfill CVD values for intervals with no trades to maintain line continuity
    let tempCvd = 0;
    Object.keys(intervals).forEach((key) => {
      if (intervals[key].cvd === 0) {
        intervals[key].cvd = tempCvd;
      } else {
        tempCvd = intervals[key].cvd;
      }
    });

    return Object.values(intervals);
  };

  const chartData = formatChartData();

  const formatYAxisUsd = (value: number) => {
    if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value.toString();
  };

  const formatPercent = (value: number) => `${(value * 100).toFixed(4)}%`;

  return (
    <div className="bg-brand-container border border-brand-border rounded p-5 h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 border-b border-brand-border pb-3">
        <div>
          <h2 className="font-display font-black text-sm text-white flex items-center gap-2 uppercase tracking-wide">
            <BarChart2 className="w-4 h-4 text-brand-accent" />
            <span>ADVANCED ANALYTICS STAGE</span>
          </h2>
          <p className="text-xs text-brand-text-secondary mt-0.5">
            Real-time visualizers of CVD, open interest buildups, and capital flows
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-brand-hover p-0.5 border border-brand-border-secondary rounded-sm text-xs font-mono">
          <button
            onClick={() => setActiveTab("long_short")}
            className={`px-3 py-1.5 rounded-sm cursor-pointer transition ${
              activeTab === "long_short" ? "bg-brand-border-secondary text-brand-accent font-bold" : "text-brand-text-secondary hover:text-brand-text-primary"
            }`}
          >
            L/S VOLUME
          </button>
          <button
            onClick={() => setActiveTab("cvd")}
            className={`px-3 py-1.5 rounded-sm cursor-pointer transition ${
              activeTab === "cvd" ? "bg-brand-border-secondary text-amber-400 font-bold" : "text-brand-text-secondary hover:text-brand-text-primary"
            }`}
          >
            CVD FLOW
          </button>
          <button
            onClick={() => setActiveTab("oi_funding")}
            className={`px-3 py-1.5 rounded-sm cursor-pointer transition ${
              activeTab === "oi_funding" ? "bg-brand-border-secondary text-purple-400 font-bold" : "text-brand-text-secondary hover:text-brand-text-primary"
            }`}
          >
            OI & FUNDING
          </button>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === "long_short" ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1C1F26" opacity={0.5} />
              <XAxis dataKey="time" stroke="#8E939E" fontSize={10} fontStyle="italic" />
              <YAxis tickFormatter={formatYAxisUsd} stroke="#8E939E" fontSize={10} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0A0C10", borderColor: "#1C1F26" }}
                labelStyle={{ color: "#8E939E", fontFamily: "monospace" }}
                itemStyle={{ color: "#E0E2E7", fontFamily: "monospace", fontSize: "11px" }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="longVol" name="Whale Longs ($)" fill="#00FFA3" radius={[2, 2, 0, 0]} opacity={0.8} />
              <Bar dataKey="shortVol" name="Whale Shorts ($)" fill="#FF3B69" radius={[2, 2, 0, 0]} opacity={0.8} />
            </BarChart>
          ) : activeTab === "cvd" ? (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorCvd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1C1F26" opacity={0.5} />
              <XAxis dataKey="time" stroke="#8E939E" fontSize={10} />
              <YAxis tickFormatter={formatYAxisUsd} stroke="#8E939E" fontSize={10} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0A0C10", borderColor: "#1C1F26" }}
                labelStyle={{ color: "#8E939E", fontFamily: "monospace" }}
                itemStyle={{ color: "#E0E2E7", fontFamily: "monospace" }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "11px" }} />
              <Area
                type="monotone"
                dataKey="cvd"
                name="Cumulative Volume Delta ($)"
                stroke="#f59e0b"
                fillOpacity={1}
                fill="url(#colorCvd)"
                strokeWidth={2}
              />
            </AreaChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1C1F26" opacity={0.5} />
              <XAxis dataKey="time" stroke="#8E939E" fontSize={10} />
              <YAxis yAxisId="left" tickFormatter={formatYAxisUsd} stroke="#8E939E" fontSize={10} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={formatPercent} stroke="#a855f7" fontSize={10} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0A0C10", borderColor: "#1C1F26" }}
                labelStyle={{ color: "#8E939E", fontFamily: "monospace" }}
                itemStyle={{ color: "#E0E2E7", fontFamily: "monospace" }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "11px" }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="oi"
                name="Aggregated Open Interest ($)"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="funding"
                name="Funding Rate (%)"
                stroke="#a855f7"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-brand-text-secondary">
        <span className="flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5 text-brand-accent" />
          Sub-second websocket updates mapped sequentially
        </span>
        <span>CVD = Cumulative Volume Delta</span>
      </div>
    </div>
  );
}
