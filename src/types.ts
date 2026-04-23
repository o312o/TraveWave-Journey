export type TradeType = 'LONG' | 'SHORT';
export type TradeStatus = 'OPEN' | 'CLOSED';
export type AssetClass = 'EQUITIES' | 'FUTURES' | 'FOREX' | 'CRYPTO';

export interface Trade {
  id: string;
  timestamp: string;
  asset: string;
  type: TradeType;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  exitPrice?: number;
  pnl?: number;
  pnlPercentage?: number;
  status: TradeStatus;
  notes?: string;
  screenshotUrl?: string;
  bias: 'LONG' | 'SHORT' | 'NEUTRAL';
  conviction: number; // 0-100
}

export interface AccountStats {
  initialCapital: number;
  currentBalance: number;
  peakEquity: number;
  totalTrades: number;
  winRate: number;
  netProfit: number;
  profitFactor: number;
}

export interface RiskSettings {
  defaultRiskPerTrade: number; // percentage
  dailyLossLimit: number; // absolute value
  maxOpenPositions: number;
  maxDrawdownLimit: number; // percentage
}
