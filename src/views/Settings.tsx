import { Shield, Calculator, Info, LogOut } from 'lucide-react';
import Layout from '../components/Layout';
import { useFirebase } from '../contexts/FirebaseContext';
import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';

export default function Settings() {
  const { user, logout } = useFirebase();
  const [initialCapital, setInitialCapital] = useState('100000');
  const [currentBalance, setCurrentBalance] = useState('112450');
  const [peakEquity, setPeakEquity] = useState('115000');
  const [riskPerTrade, setRiskPerTrade] = useState('1.5');
  const [dailyLossLimit, setDailyLossLimit] = useState('2500');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setInitialCapital(data.initialCapital?.toString() || '100000');
          setCurrentBalance(data.currentBalance?.toString() || '112450');
          setPeakEquity(data.peakEquity?.toString() || '115000');
        }
        
        const settingsDoc = await getDoc(doc(db, 'users', user.uid, 'settings', 'risk'));
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          setRiskPerTrade(data.defaultRiskPerTrade?.toString() || '1.5');
          setDailyLossLimit(data.dailyLossLimit?.toString() || '2500');
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        initialCapital: parseFloat(initialCapital),
        currentBalance: parseFloat(currentBalance),
        peakEquity: parseFloat(peakEquity),
        updatedAt: serverTimestamp()
      }, { merge: true });

      await setDoc(doc(db, 'users', user.uid, 'settings', 'risk'), {
        defaultRiskPerTrade: parseFloat(riskPerTrade),
        dailyLossLimit: parseFloat(dailyLossLimit),
        updatedAt: serverTimestamp()
      });

      alert('Structural parameters updated.');
    } catch (error) {
      handleFirestoreError(error, 'update', `users/${user.uid}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout pageTitle="Loading Parameters">
        <div className="flex h-full items-center justify-center">
           <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Structural Parameters">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-light tracking-tighter text-on-surface mb-1 italic">Structural Parameters</h2>
            <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-bold">Risk Management & Architecture</p>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 px-6 py-2 border border-outline rounded-lg text-[10px] font-bold uppercase tracking-widest text-tertiary hover:bg-tertiary hover:text-on-tertiary transition-all"
          >
            <LogOut className="w-3 h-3" /> Terminate Session
          </button>
        </div>

        {/* Top metrics summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AccountMetric label="Initial Capital" value={`$${parseFloat(initialCapital).toLocaleString()}`} />
          <AccountMetric label="Current Net Worth" value={`$${parseFloat(currentBalance).toLocaleString()}`} highlight />
          <AccountMetric label="Peak System Equity" value={`$${parseFloat(peakEquity).toLocaleString()}`} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Risk Settings Form */}
          <div className="xl:col-span-2 bg-surface-container border border-outline rounded-2xl p-10 space-y-10 shadow-2xl shadow-black/20">
            <div className="flex items-center gap-3 border-b border-outline pb-6">
              <Shield className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Global Risk Directives</h3>
            </div>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <SettingInput label="Initial Capital (USD)" value={initialCapital} onChange={(e: any) => setInitialCapital(e.target.value)} prefix="$" />
              <SettingInput label="Current Net Worth (USD)" value={currentBalance} onChange={(e: any) => setCurrentBalance(e.target.value)} prefix="$" />
              <SettingInput label="Peak System Equity (USD)" value={peakEquity} onChange={(e: any) => setPeakEquity(e.target.value)} prefix="$" />
              <div className="border-t border-outline/30 md:col-span-2 my-2"></div>
              <SettingInput label="System Risk per Session (%)" value={riskPerTrade} onChange={(e: any) => setRiskPerTrade(e.target.value)} suffix="%" />
              <SettingInput label="Daily Invalidation Limit" value={dailyLossLimit} onChange={(e: any) => setDailyLossLimit(e.target.value)} prefix="$" />

              <div className="md:col-span-2 pt-10 flex justify-end">
                <button 
                  type="button" 
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-primary text-on-primary px-12 py-4 rounded-lg text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all active:scale-95 shadow-xl shadow-primary/10 disabled:opacity-50"
                >
                  {saving ? 'Synchronizing...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>

          {/* Position Sizer Tool */}
          <div className="bg-surface-container border border-outline rounded-2xl p-8 space-y-6 flex flex-col shadow-2xl shadow-black/20">
            <div className="flex items-center gap-3 border-b border-outline pb-6">
              <Calculator className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Session Calculator</h3>
            </div>

            <div className="space-y-6">
              <SettingsField label="Target Entry" placeholder="0.00" prefix="$" />
              <SettingsField label="Invalidation" placeholder="0.00" prefix="$" />
            </div>

            <div className="mt-4 flex-1 bg-surface border border-outline rounded-xl p-8 flex flex-col items-center justify-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">Allocated Units</span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-light text-primary italic tracking-tight italic">--</span>
                <span className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest">Cap</span>
              </div>
              <div className="w-full mt-8 pt-6 border-t border-outline/30 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                <span className="text-on-surface-variant/60">Risk Delta</span>
                <span className="text-on-surface italic">$1,581.30</span>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
               <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
               <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed italic">Allocation is automatically throttled by global exposure directives defined in core settings.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function AccountMetric({ label, value, highlight }: any) {
  return (
    <div className="bg-surface-container border border-outline rounded-xl p-8 hover:bg-surface-container-high transition-all group">
      <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-6 block group-hover:text-on-surface-variant transition-colors">{label}</span>
      <div className={`text-3xl font-light italic tracking-tighter ${highlight ? 'text-primary' : 'text-on-surface'}`}>
        {value}
      </div>
    </div>
  );
}

function SettingInput({ label, value, type = "text", prefix, suffix }: any) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">{label}</label>
      <div className="relative group">
        {prefix && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/20 text-sm font-light italic">{prefix}</span>}
        <input 
          type={type} 
          defaultValue={value}
          className={`w-full bg-surface border border-outline rounded-lg py-3 text-sm text-on-surface font-light italic focus:outline-none focus:border-primary/50 transition-all ${prefix ? 'pl-8' : 'pl-6'} ${suffix ? 'pr-8' : 'pr-6'}`} 
        />
        {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/20 text-sm font-light italic">{suffix}</span>}
      </div>
    </div>
  );
}

function SettingsField({ label, placeholder, prefix }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">
        <span>{label}</span>
        {prefix && <span className="opacity-30">{prefix}</span>}
      </div>
      <input 
        type="text" 
        placeholder={placeholder}
        className="w-full bg-surface border border-outline rounded-lg px-6 py-3 text-sm text-on-surface font-light italic text-right focus:outline-none focus:border-primary/50 transition-all"
      />
    </div>
  );
}
