import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Download, MoreVertical, Receipt, PieChart as PieChartIcon, CreditCard } from 'lucide-react';
import Layout from '../components/Layout';
import { useFirebase } from '../contexts/FirebaseContext';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Analytics() {
  const { trades, user } = useFirebase();
  const [stats, setStats] = useState({ initialCapital: 100000, currentBalance: 112450 });

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
  const winRate = trades.length > 0 ? (trades.filter(t => t.pnl && t.pnl > 0).length / trades.length * 100).toFixed(1) : '0.0';

  const chartData = [
    { name: 'Low Risk', value: trades.filter(t => t.conviction && t.conviction < 50).length, color: '#4edea3' },
    { name: 'Mid Risk', value: trades.filter(t => t.conviction && t.conviction >= 50 && t.conviction < 80).length, color: '#10b981' },
    { name: 'High Risk', value: trades.filter(t => t.conviction && t.conviction >= 80).length, color: '#c29961' },
  ];

  return (
    <Layout pageTitle="Analytics Studio">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex justify-between items-end border-b border-outline pb-6">
          <div>
            <h2 className="text-3xl font-light tracking-tighter text-on-surface mb-1 italic">Performance Analytics</h2>
            <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-bold">Institutional Intelligence</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-2.5 border border-primary/30 rounded-lg bg-surface hover:bg-primary hover:text-on-primary text-[10px] font-black uppercase tracking-widest text-primary transition-all shadow-xl shadow-primary/5">
            <Download className="w-3 h-3" /> Export Technical Report
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
          {/* Main Chart */}
          <div className="bg-surface-container border border-outline rounded-2xl p-8 flex flex-col h-[500px] shadow-2xl shadow-black/20">
             <div className="flex justify-between items-center border-b border-outline pb-6 mb-8">
                <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">Execution Density by Conviction</h3>
                <MoreVertical className="w-4 h-4 text-on-surface-variant/20 cursor-pointer" />
             </div>
             
             <div className="flex-1 w-full italic">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
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
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* History Table */}
          <div className="bg-surface-container border border-outline rounded-2xl flex flex-col h-[500px] overflow-hidden shadow-2xl shadow-black/20">
            <div className="px-8 py-6 border-b border-outline flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">Execution Archive</h3>
              <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline italic">Deep Scan</button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface sticky top-0 z-10">
                   <tr className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40 border-b border-outline">
                      <th className="px-8 py-4">Session Timestamp</th>
                      <th className="px-8 py-4">Symbol</th>
                      <th className="px-8 py-4 text-right">Yield</th>
                   </tr>
                </thead>
                <tbody className="text-xs italic">
                  {trades.map(trade => (
                    <tr key={trade.id} className="border-b border-outline/30 hover:bg-surface-container-high transition-colors group">
                      <td className="px-8 py-5 text-on-surface-variant/60 font-light">{trade.timestamp ? formatDate(new Date(trade.timestamp as any).toISOString()) : 'Pending'}</td>
                      <td className="px-8 py-5 font-bold text-on-surface">{trade.asset}</td>
                      <td className={`px-8 py-5 text-right font-light tracking-tighter ${trade.pnl && trade.pnl >= 0 ? 'text-primary' : 'text-tertiary'}`}>
                        {trade.pnl && trade.pnl >= 0 ? '+' : ''}${trade.pnl?.toLocaleString() || '0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {trades.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-on-surface-variant/20 italic text-sm py-20">
                  Historical archive empty. Initiate primary execution.
                </div>
              )}
            </div>
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
