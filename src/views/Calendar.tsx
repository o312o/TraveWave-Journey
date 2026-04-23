import { ChevronLeft, ChevronRight } from 'lucide-react';
import Layout from '../components/Layout';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { useFirebase } from '../contexts/FirebaseContext';
import { cn } from '../lib/utils';
import { useState } from 'react';

export default function Calendar() {
  const { trades } = useFirebase();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const getDayTrades = (day: Date) => {
    return trades.filter(t => t.timestamp && isSameDay(new Date(t.timestamp as any), day));
  };

  const getDayPnL = (day: Date) => {
    const dayTrades = getDayTrades(day);
    if (dayTrades.length === 0) return null;
    return dayTrades.reduce((acc, curr) => acc + (curr.pnl || 0), 0);
  };

  const greenDays = days.filter(d => isSameMonth(d, monthStart) && (getDayPnL(d) || 0) > 0).length;
  const redDays = days.filter(d => isSameMonth(d, monthStart) && (getDayPnL(d) || 0) < 0).length;

  return (
    <Layout pageTitle="Executive Calendar">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex justify-between items-end border-b border-outline pb-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-light tracking-tighter text-on-surface italic">{format(currentMonth, 'MMMM yyyy')}</h2>
              <div className="flex gap-1">
                <button 
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                  className="p-1 hover:text-primary transition-colors text-on-surface-variant"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                  className="p-1 hover:text-primary transition-colors text-on-surface-variant"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-bold">Monthly Distribution</p>
          </div>
          <div className="flex items-center gap-6">
             <div className="text-right">
                <p className="text-[9px] uppercase tracking-widest text-on-surface-variant opacity-40 font-bold">A-Tier Sessions</p>
                <p className="text-lg font-light text-on-surface italic">{greenDays}</p>
             </div>
             <div className="text-right">
                <p className="text-[9px] uppercase tracking-widest text-on-surface-variant opacity-40 font-bold">Risk Management</p>
                <p className="text-lg font-light text-on-surface italic">{redDays} Red Days</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-3 bg-surface-container border border-outline rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
            <div className="grid grid-cols-7 bg-surface border-b border-outline">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-4 text-center text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/40">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 auto-rows-fr">
              {days.map((day, idx) => {
                const dayPnL = getDayPnL(day);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const tradesCount = getDayTrades(day).length;
                
                return (
                  <div 
                    key={idx} 
                    className={cn(
                      "min-h-[140px] p-4 flex flex-col justify-between border-r border-b border-outline transition-all duration-300 group",
                      !isCurrentMonth ? "bg-surface-bright/5 opacity-10" : "hover:bg-surface-container-high cursor-default"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-light text-on-surface-variant/60 italic">{format(day, 'd')}</span>
                      {tradesCount > 0 && isCurrentMonth && (
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary/40 group-hover:text-primary transition-colors">
                          {tradesCount} Record
                        </span>
                      )}
                    </div>

                    {dayPnL !== null && isCurrentMonth && (
                      <div className="mt-auto">
                        <div className={cn(
                          "text-base font-light tracking-tighter italic",
                          dayPnL >= 0 ? "text-primary" : "text-tertiary"
                        )}>
                          {dayPnL >= 0 ? '+' : ''}${Math.abs(dayPnL).toLocaleString()}
                        </div>
                        <div className="flex gap-1 mt-2">
                          {getDayTrades(day).map(t => (
                            <div key={t.id} className={cn("w-1 h-3 rounded-full opacity-40 group-hover:opacity-100 transition-opacity", (t.pnl || 0) >= 0 ? "bg-primary" : "bg-tertiary")}></div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-surface-container border border-outline rounded-xl p-8 space-y-6">
              <h3 className="text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-6 border-b border-outline pb-4">Performance Tiers</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center group">
                  <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold opacity-60 group-hover:opacity-100 transition-opacity">Green Days</span>
                  <span className="text-xl font-light italic text-primary">{greenDays}</span>
                </div>
                <div className="flex justify-between items-center group">
                  <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold opacity-60 group-hover:opacity-100 transition-opacity">Red Days</span>
                  <span className="text-xl font-light italic text-tertiary">{redDays}</span>
                </div>
                <div className="flex justify-between items-center group">
                  <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold opacity-60 group-hover:opacity-100 transition-opacity">Profit/Loss Ratio</span>
                  <span className="text-xl font-light italic text-on-surface">{(greenDays/ (redDays || 1)).toFixed(1)}:1</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-bright border border-outline rounded-xl p-8 group hover:border-primary/30 transition-all">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-4 italic">Session Guidance</h3>
              <p className="text-sm font-light text-on-surface leading-normal italic opacity-80">
                Data reflects synchronized execution records from the active session. Focus on maintaining win rate targets for the current cycle.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
