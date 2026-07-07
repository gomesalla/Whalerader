export type Direction = "LONG" | "SHORT";

export type PositionStatus =
  | "New Position"
  | "Increase Position"
  | "Reduce Position"
  | "Close Position"
  | "Flip Short → Long"
  | "Flip Long → Short";

export interface WhaleTrade {
  id: string;
  timestamp: number;
  coin: string;
  direction: Direction;
  tradeSizeUsd: number;
  contracts: number;
  entryPrice: number;
  currentPrice: number;
  leverage: number;
  walletAddress: string;
  walletLabel: string;
  positionStatus: PositionStatus;
  pnlUsd: number;
  pnlPercent: number;
  fundingRate: number;
  openInterest: number;
  volume24h: number;
  oiChange24h: number;
  priceChange24h: number;
  liquidationDistancePercent: number;
  estimatedLiquidationPrice: number;
}

export interface WalletProfile {
  walletAddress: string;
  walletLabel: string;
  firstSeen: number;
  totalTrades: number;
  winRate: number; // 0 to 100
  averagePositionSize: number;
  favoriteCoins: string[];
  averageLeverage: number;
  totalVolume: number;
  currentPositionsCount: number;
  realizedPnl: number;
  unrealizedPnl: number;
  lastActivity: number;
  isBookmarked: boolean;
  notes?: string;
}

export interface ClusterAlert {
  id: string;
  timestamp: number;
  coin: string;
  direction: Direction;
  walletsCount: number;
  totalVolumeUsd: number;
  strengthScore: number; // 0 to 100
  confidence: "High" | "Medium" | "Low";
  description: string;
}

export interface MarketSentiment {
  coin: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  openInterest: number;
  oiChange24h: number;
  fundingRate: number;
  bullishPercent: number;
  bearishPercent: number;
  whaleConfidence: number; // 0 to 100
  retailConfidence: number; // 0 to 100
  momentumScore: number; // 0 to 100
  trendScore: number; // 0 to 100
  smartMoneyScore: number; // 0 to 100
  signal: "Strong Buy" | "Bullish" | "Neutral" | "Bearish" | "Heavy Shorting";
}

export interface LiveStats {
  totalWhaleLongsUsd: number;
  totalWhaleShortsUsd: number;
  longShortRatio: number;
  largestLongUsd: number;
  largestLongCoin: string;
  largestShortUsd: number;
  largestShortCoin: string;
  mostActiveCoin: string;
  highestOIIncreaseCoin: string;
  highestOIIncreasePercent: number;
  highestVolumeIncreaseCoin: string;
  highestVolumeIncreasePercent: number;
  mostBullishCoin: string;
  mostBearishCoin: string;
}

export interface RealTimeAlert {
  id: string;
  timestamp: number;
  type: "trade" | "cluster" | "liquidation" | "funding" | "oi" | "breakout";
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
  coin?: string;
  sound?: boolean;
}

export interface AuditLog {
  timestamp: number;
  action: string;
  details: string;
  category: "SYSTEM" | "TRADE_DETECTOR" | "CLUSTER" | "AI_ENGINE" | "ALERT";
}
