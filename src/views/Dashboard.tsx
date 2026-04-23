import { ArrowUpRight, TrendingUp, Activity, Target } from 'lucide-react';
import Layout from '../components/Layout';
import { useFirebase } from '../contexts/FirebaseContext';
import { cn } from '../lib/utils';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const { trades, user } = useFirebase();
  const [stats, setStats] = useState({ initialCapital: 100000, currentBalance: 112450, peakEquity: 115000 });

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setStats({
          initialCapital: data.initialCapital || 100000,
          currentBalance: data.currentBalance || 112450,
          peakEquity: data.peakEquity || 115000,
        });
      }
    }
    fetchStats();
  }, [user]);

  const netProfit = stats.currentBalance - stats.initialCapital;
  const profitPercentage = ((netProfit / stats.initialCapital) * 100).toFixed(1);

  return (
    <Layout pageTitle="Executive Dashboard">
      <div className="max-w-7xl mx-auto space-y-10">
        <div>
          <h2 className="text-3xl font-light tracking-tighter text-on-surface mb-1 italic">Executive Dashboard</h2>
          <p className="text-on-surface-variant text-xs uppercase tracking-widest font-bold">Workspace Overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard 
            label="Equity Growth" 
            value={`$${stats.currentBalance.toLocaleString()}`} 
            trend={`+${profitPercentage}% All-Time`} 
            trendUp={netProfit >= 0}
          />
          <StatCard 
            label="Active Nodes" 
            value={trades.filter(t => t.status === 'OPEN').length.toString()} 
            trend="Real-time exposure" 
            trendUp={null}
          />
          <StatCard 
            label="Peak System Equity" 
            value={`$${stats.peakEquity.toLocaleString()}`} 
            trend="Historical High" 
            trendUp={true}
          />
          <StatCard 
            label="Portfolio Velocity" 
            value="84%" 
            progress={84}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main List */}
          <div className="lg:col-span-2 bg-surface-container border border-outline rounded-2xl overflow-hidden flex">
            <div className="w-2/5 hidden md:block">
              <img 
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600&h=800" 
                className="h-full w-full object-cover grayscale hover:grayscale-0 transition-all duration-700" 
                alt="Project preview" 
              />
            </div>
            <div className="flex-1 p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] px-2 py-1 rounded bg-surface-bright text-on-surface-variant font-bold uppercase tracking-wider">Active Strategy</span>
                  <span className="text-[10px] text-on-surface-variant/40 font-bold uppercase tracking-widest">v.2.4.0</span>
                </div>
                <h2 className="text-3xl font-light leading-tight mb-4 tracking-tighter italic text-on-surface">Vanguard Alpha Session</h2>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                  Standardizing high-fidelity execution components for next-generation algorithmic trading interfaces. Connecting your institutional workspace to real-time market data.
                </p>
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-surface bg-gray-600"></div>
                  <div className="w-8 h-8 rounded-full border-2 border-surface bg-gray-500"></div>
                  <div className="w-8 h-8 rounded-full border-2 border-surface bg-gray-400"></div>
                  <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-bright flex items-center justify-center text-[10px] font-bold text-on-surface-variant">+4</div>
                </div>
              </div>
              <button className="w-full mt-8 border border-primary/30 text-primary py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all">
                Open Strategy Studio
              </button>
            </div>
          </div>

          {/* Activity sidebar */}
          <div className="bg-surface-container border border-outline rounded-2xl p-6">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">Recent Activity</h4>
              <span className="text-[10px] text-primary cursor-pointer hover:underline uppercase font-bold tracking-tighter">View All</span>
            </div>
            <div className="space-y-6">
              {trades.length > 0 ? (
                trades.slice(0, 5).map(trade => (
                  <ActivityItem 
                    key={trade.id}
                    dotColor={trade.pnl && trade.pnl > 0 ? "bg-primary" : trade.pnl && trade.pnl < 0 ? "bg-tertiary" : "bg-on-surface-variant/40"} 
                    title={trade.asset} 
                    subtitle={`${trade.type} position record`} 
                    time={trade.timestamp ? formatDistanceToNow(new Date(trade.timestamp as any).getTime()) + " ago" : "just now"} 
                  />
                ))
              ) : (
                <div className="py-12 text-center space-y-3">
                  <Activity className="w-8 h-8 text-on-surface-variant/10 mx-auto" />
                  <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/40">No records registered</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ label, value, trend, trendUp, progress }: any) {
  return (
    <div className="bg-surface-container border border-outline p-6 rounded-xl hover:border-primary/20 transition-all group">
      <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest mb-1 font-bold">{label}</p>
      <h3 className="text-2xl font-light tracking-tight text-on-surface">{value}</h3>
      {trend && (
        <p className={cn(
          "text-[10px] font-bold mt-2 tracking-wide uppercase",
          trendUp ? "text-emerald-500 font-bold" : "text-on-surface-variant"
        )}>{trend}</p>
      )}
      {progress && (
        <div className="w-full bg-surface-bright h-1 rounded-full mt-4">
          <div 
            className="bg-primary h-1 rounded-full shadow-[0_0_8px_rgba(194,153,97,0.4)] transition-all duration-1000" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}

function ActivityItem({ dotColor, title, subtitle, time }: any) {
  return (
    <div className="flex items-start space-x-4">
      <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", dotColor)}></div>
      <div>
        <p className="text-xs font-medium text-on-surface"><span className="text-on-surface-variant">{title}</span> {subtitle}</p>
        <p className="text-[10px] text-on-surface-variant/40 mt-1 uppercase font-bold">{time}</p>
      </div>
    </div>
  );
}
