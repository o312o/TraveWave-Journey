import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { Download, MoreVertical, Receipt, PieChart as PieChartIcon, CreditCard, TrendingUp as TrendingUpIcon, Activity as ActivityIcon } from 'lucide-react';
import Layout from '../components/Layout';
import { useFirebase } from '../contexts/FirebaseContext';
import { useEffect, useState, useMemo } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import * as XLSX from 'xlsx';
import { toJSDate, cn } from '../lib/utils';

export default function Analytics() {
  const { trades, user } = useFirebase();
  const [stats, setStats] = useState({ initialCapital: 100000, currentBalance: 112450 });

  const exportToExcel = () => {
    if (trades.length === 0) return;
    
    // Sort trades by date for chronological export
    const sortedTrades = [...trades].sort((a, b) => {
      const dateA = toJSDate(a.timestamp)?.getTime() || 0;
      const dateB = toJSDate(b.timestamp)?.getTime() || 0;
      return dateA - dateB;
    });

    const data = sortedTrades.map(t => {
      const date = toJSDate(t.timestamp);
      return {
        'Execution Date': date ? date.toLocaleString() : 'N/A',
        'Asset Group': t.asset,
        'Type': t.type,
        'Structure Bias': t.bias,
        'Entry Identifier': t.entryPrice,
        'Exit Identifier': t.exitPrice || 'PENDING',
        'Net Yield ($)': t.pnl || 0,
        'Operational Status': t.status,
        'Technical Notes': t.notes || 'No data recorded'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Technical Archive');
    XLSX.writeFile(workbook, `Vanguard_Performance_Audit_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setStats({
          initialCapital: data.initialCapital || 100000,
          currentBalance: data.currentBalance || 112450,
        });
      }
    }
    fetchStats();
  }, [user]);

  const netProfit = stats.currentBalance - stats.initialCapital;

  // Calculate Equity Curve Data
  const equityData = useMemo(() => {
    const sorted = [...trades].sort((a, b) => {
      const dateA = toJSDate(a.timestamp)?.getTime() || 0;
      const dateB = toJSDate(b.timestamp)?.getTime() || 0;
      return dateA - dateB;
    });

    let currentEquity = stats.initialCapital;
    return [
      { name: 'Initial', value: stats.initialCapital },
      ...sorted.map((t, index) => {
        currentEquity += (t.pnl || 0);
        return {
          name: `T-${index + 1}`,
          value: currentEquity
        };
      })
    ];
  }, [trades, stats.initialCapital]);

  // Calculate Distribution for Recharts by Weight (Conviction)
  const weightDistribution = useMemo(() => {
    const weights = {
      'S-Tier (90%+)': { name: 'S-Tier', value: 0, color: '#c29961' },
      'A-Tier (70-89%)': { name: 'A-Tier', value: 0, color: '#10b981' },
      'B-Tier (50-69%)': { name: 'B-Tier', value: 0, color: '#4edea3' },
      'C-Tier (<50%)': { name: 'C-Tier', value: 0, color: '#3b82f6' }
    };

    trades.forEach(t => {
      const conv = t.conviction || 0;
      if (conv >= 90) weights['S-Tier (90%+)'].value++;
      else if (conv >= 70) weights['A-Tier (70-89%)'].value++;
      else if (conv >= 50) weights['B-Tier (50-69%)'].value++;
      else weights['C-Tier (<50%)'].value++;
    });

    return Object.values(weights).filter(w => w.value > 0);
  }, [trades]);

  const winRate = useMemo(() => {
    const closedTrades = trades.filter(t => t.status === 'CLOSED');
    if (closedTrades.length === 0) return '0.0';
    const wins = closedTrades.filter(t => (t.pnl || 0) > 0).length;
    return ((wins / closedTrades.length) * 100).toFixed(1);
  }, [trades]);

  return (
    <Layout pageTitle="Analytics Studio">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex justify-between items-end border-b border-outline pb-6">
          <div>
            <h2 className="text-3xl font-light tracking-tighter text-on-surface mb-1 italic">Performance Analytics</h2>
            <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-bold">Institutional Intelligence</p>
          </div>
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 px-6 py-2.5 border border-primary/30 rounded-lg bg-surface hover:bg-primary hover:text-on-primary text-[10px] font-black uppercase tracking-widest text-primary transition-all shadow-xl shadow-primary/5"
          >
            <Download className="w-3 h-3" /> Export Technical Report (.XLSX)
          </button>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            label="Historical Volume" 
            value={trades.length.toLocaleString()} 
            trend="Total Executions" 
            trendUp={true} 
          />
          <StatCard 
            label="Session Win Rate" 
            value={`${winRate}%`} 
            trend="Net Precision" 
            trendUp={parseFloat(winRate) > 50} 
            primary 
          />
          <StatCard 
            label="Net Capital Appreciation" 
            value={`${netProfit >= 0 ? '+' : ''}$${netProfit.toLocaleString()}`} 
            trend="Alpha Generated" 
            trendUp={netProfit >= 0} 
            primary 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Equity Chart */}
          <div className="bg-surface-container border border-outline rounded-2xl p-8 flex flex-col h-[500px] shadow-2xl shadow-black/20">
             <div className="flex justify-between items-center border-b border-outline pb-6 mb-8">
                <div className="flex items-center gap-3">
                  <TrendingUpIcon className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">Equity Growth Terminal</h3>
                </div>
                <span className="text-[10px] font-bold text-primary italic uppercase tracking-tighter">Real-time Progression</span>
             </div>
             
             <div className="flex-1 w-full italic">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={equityData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#c29961" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#c29961" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f1f1f" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#555', fontSize: 10, fontWeight: 700 }} 
                    />
                    <YAxis 
                      domain={['auto', 'auto']}
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#555', fontSize: 10, fontWeight: 700 }} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#050505', border: '1px solid #1f1f1f', borderRadius: '12px', padding: '12px' }}
                      itemStyle={{ color: '#c29961', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}
                      labelStyle={{ color: '#555', fontSize: '10px', marginBottom: '4px' }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Equity']}
                    />
                    <Area type="monotone" dataKey="value" stroke="#c29961" fillOpacity={1} fill="url(#colorEquity)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Execution Density Chart */}
          <div className="bg-surface-container border border-outline rounded-2xl p-8 flex flex-col h-[500px] shadow-2xl shadow-black/20">
             <div className="flex justify-between items-center border-b border-outline pb-6 mb-8">
                <div className="flex items-center gap-3">
                  <ActivityIcon className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">Risk Distribution Entropy</h3>
                </div>
                <MoreVertical className="w-4 h-4 text-on-surface-variant/20 cursor-pointer" />
             </div>
             
              <div className="flex-1 w-full italic">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weightDistribution} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f1f1f" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#555', fontSize: 10, fontWeight: 700 }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#555', fontSize: 10, fontWeight: 700 }} 
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(194, 153, 97, 0.05)' }}
                      contentStyle={{ backgroundColor: '#050505', border: '1px solid #1f1f1f', borderRadius: '12px', padding: '12px' }}
                      itemStyle={{ color: '#c29961', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}
                    />
                    <Bar dataKey="value" radius={[2, 2, 0, 0]} barSize={40}>
                      {weightDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>

        {/* Expanded History Table */}
        <div className="bg-surface-container border border-outline rounded-2xl flex flex-col shadow-2xl shadow-black/20 overflow-hidden">
          <div className="px-8 py-6 border-b border-outline flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">Full Execution Archive</h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Deep Intelligence Sync</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40 border-b border-outline bg-surface">
                    <th className="px-8 py-4 whitespace-nowrap">Timestamp</th>
                    <th className="px-8 py-4">Symbol</th>
                    <th className="px-8 py-4">Bias</th>
                    <th className="px-8 py-4">Entry</th>
                    <th className="px-8 py-4">Exit</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4">Technical Notes</th>
                    <th className="px-8 py-4 text-right">Net Yield</th>
                 </tr>
              </thead>
              <tbody className="text-xs italic">
                {trades.map(trade => (
                  <tr key={trade.id} className="border-b border-outline/30 hover:bg-surface-container-high transition-colors group">
                    <td className="px-8 py-5 text-on-surface-variant/60 font-light whitespace-nowrap">
                      {toJSDate(trade.timestamp)?.toLocaleString() || 'Pending'}
                    </td>
                    <td className="px-8 py-5 font-bold text-on-surface">{trade.asset}</td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter",
                        trade.bias === 'LONG' ? "bg-primary/10 text-primary border border-primary/20" : "bg-tertiary/10 text-tertiary border border-tertiary/20"
                      )}>
                        {trade.bias}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-on-surface-variant/60 font-light">${trade.entryPrice?.toLocaleString()}</td>
                    <td className="px-8 py-5 text-on-surface-variant/60 font-light">{trade.exitPrice ? `$${trade.exitPrice.toLocaleString()}` : '—'}</td>
                    <td className="px-8 py-5">
                       <span className={cn("text-[9px] font-bold uppercase tracking-widest", trade.status === 'CLOSED' ? "text-on-surface-variant/40" : "text-primary")}>
                         {trade.status}
                       </span>
                    </td>
                    <td className="px-8 py-5 text-on-surface-variant/60 max-w-md">
                      <div className="line-clamp-2 hover:line-clamp-none transition-all cursor-default">
                        {trade.notes || <span className="opacity-20 italic">No notes provisioned for this execution node.</span>}
                      </div>
                    </td>
                    <td className={`px-8 py-5 text-right font-light tracking-tighter ${trade.pnl && trade.pnl >= 0 ? 'text-primary' : 'text-tertiary'}`}>
                      {trade.pnl && trade.pnl >= 0 ? '+' : ''}${trade.pnl?.toLocaleString() || '0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {trades.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-on-surface-variant/20 italic text-sm py-24">
                Historical archive empty. Initiate primary execution.
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ label, value, trend, trendUp, primary }: any) {
  return (
    <div className="bg-surface-container border border-outline rounded-xl p-8 hover:bg-surface-container-high transition-all group">
      <div className="flex justify-between items-start mb-6">
        <span className="text-[10px] uppercase font-black tracking-widest text-on-surface-variant/40 group-hover:text-on-surface-variant transition-colors">{label}</span>
      </div>
      <div className={`text-4xl font-light tracking-tighter mb-4 italic ${primary ? 'text-primary' : 'text-on-surface'}`}>
        {value}
      </div>
      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest">
        <span className={trendUp ? 'text-primary' : 'text-tertiary'}>{trend}</span>
        <span className="text-on-surface-variant/20">/ Periodic Baseline</span>
      </div>
    </div>
  );
}

function formatDate(iso: string) {
  const date = new Date(iso);
  return `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}
