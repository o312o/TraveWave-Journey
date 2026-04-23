import { Trade, AccountStats } from './types';

export const mockTrades: Trade[] = [
  {
    id: '1',
    timestamp: '2023-10-27T14:32:00',
    asset: 'ESZ3',
    type: 'LONG',
    entryPrice: 4420.50,
    stopLoss: 4410.00,
    takeProfit: 4450.00,
    pnl: 1250.00,
    status: 'CLOSED',
    bias: 'LONG',
    conviction: 80
  },
  {
    id: '2',
    timestamp: '2023-10-27T11:15:00',
    asset: 'NQZ3',
    type: 'SHORT',
    entryPrice: 15200.00,
    stopLoss: 15250.00,
    takeProfit: 15100.00,
    pnl: -450.00,
    status: 'CLOSED',
    bias: 'SHORT',
    conviction: 60
  },
  {
    id: '3',
    timestamp: '2023-10-26T09:45:00',
    asset: 'GCZ3',
    type: 'LONG',
    entryPrice: 1980.50,
    stopLoss: 1970.00,
    takeProfit: 2000.00,
    pnl: 820.00,
    status: 'CLOSED',
    bias: 'LONG',
    conviction: 75
  },
  {
    id: '4',
    timestamp: '2023-10-26T08:30:00',
    asset: 'CLZ3',
    type: 'SHORT',
    entryPrice: 85.20,
    stopLoss: 86.50,
    takeProfit: 82.00,
    pnl: -1100.00,
    status: 'CLOSED',
    bias: 'SHORT',
    conviction: 90
  },
  {
    id: '5',
    timestamp: '2023-10-25T15:00:00',
    asset: 'ESZ3',
    type: 'LONG',
    entryPrice: 4380.00,
    stopLoss: 4360.00,
    takeProfit: 4420.00,
    pnl: 2400.00,
    status: 'CLOSED',
    bias: 'LONG',
    conviction: 85
  },
  {
    id: '6',
    timestamp: '2023-10-25T10:20:00',
    asset: 'RTYZ3',
    type: 'LONG',
    entryPrice: 1850.00,
    stopLoss: 1840.00,
    takeProfit: 1870.00,
    pnl: 350.00,
    status: 'CLOSED',
    bias: 'LONG',
    conviction: 70
  },
  {
    id: '7',
    timestamp: '2023-10-24T13:10:00',
    asset: 'NQZ3',
    type: 'SHORT',
    entryPrice: 15150.00,
    stopLoss: 15200.00,
    takeProfit: 15000.00,
    pnl: -200.00,
    status: 'CLOSED',
    bias: 'SHORT',
    conviction: 65
  }
];

export const mockStats: AccountStats = {
  initialCapital: 100000,
  currentBalance: 105420.50,
  peakEquity: 108100,
  totalTrades: 1482,
  winRate: 68.4,
  netProfit: 124500,
  profitFactor: 2.4
};
