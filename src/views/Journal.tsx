import { useState } from 'react';
import { Target, TrendingUp, TrendingDown, Minus, Upload, ShieldCheck, Save, X } from 'lucide-react';
import Layout from '../components/Layout';
import { cn } from '../lib/utils';
import { db, handleFirestoreError } from '../lib/firebase';
import { useFirebase } from '../contexts/FirebaseContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function Journal() {
  const { user } = useFirebase();
  const navigate = useNavigate();
  const [asset, setAsset] = useState('');
  const [bias, setBias] = useState<'LONG' | 'SHORT' | 'NEUTRAL'>('NEUTRAL');
  const [conviction, setConviction] = useState(80);
  const [entryPrice, setEntryPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !asset || !entryPrice) return;

    setIsSubmitting(true);
    try {
      const tradesRef = collection(db, 'users', user.uid, 'trades');
      await addDoc(tradesRef, {
        asset,
        type: bias === 'NEUTRAL' ? 'LONG' : bias, // Fallback for simple model
        bias,
        conviction,
        entryPrice: parseFloat(entryPrice),
        stopLoss: parseFloat(stopLoss) || 0,
        takeProfit: parseFloat(takeProfit) || 0,
        status: 'OPEN',
        userId: user.uid,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
      navigate('/');
    } catch (error) {
      handleFirestoreError(error, 'create', `users/${user.uid}/trades`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout pageTitle="Entry Journal">
      <div className="max-w-5xl mx-auto space-y-10">
        <div>
          <h2 className="text-3xl font-light tracking-tighter text-on-surface mb-1 italic">Trade Entry Studio</h2>
          <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-bold">Execution Parameters</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Market Context */}
          <div className="bg-surface-container border border-outline rounded-xl p-8 space-y-8">
            <div className="flex items-center justify-between border-b border-outline pb-4">
              <h3 className="font-bold text-xs uppercase tracking-widest text-on-surface-variant">Market Context</h3>
              <Target className="w-4 h-4 text-primary" />
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant/40 font-bold mb-2">Asset / Ticker Identifier</label>
                <input 
                  type="text" 
                  value={asset}
                  onChange={(e) => setAsset(e.target.value)}
                  placeholder="e.g. BTCUSD, AAPL" 
                  required
                  className="w-full bg-surface border border-outline rounded-lg py-3 px-4 text-sm text-on-surface placeholder:text-on-surface-variant/20 focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant/40 font-bold mb-2">Structure Bias</label>
                <div className="grid grid-cols-3 gap-3">
                  <BiasButton 
                    active={bias === 'LONG'} 
                    onClick={() => setBias('LONG')} 
                    icon={TrendingUp} 
                    label="Long" 
                    color="primary" 
                  />
                  <BiasButton 
                    active={bias === 'SHORT'} 
                    onClick={() => setBias('SHORT')} 
                    icon={TrendingDown} 
                    label="Short" 
                    color="tertiary" 
                  />
                  <BiasButton 
                    active={bias === 'NEUTRAL'} 
                    onClick={() => setBias('NEUTRAL')} 
                    icon={Minus} 
                    label="Neutral" 
                    color="secondary" 
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] uppercase tracking-widest text-on-surface-variant/40 font-bold">Conviction Level</label>
                  <span className="text-[10px] font-bold text-primary italic uppercase tracking-tighter">
                    {conviction >= 80 ? 'A-Tier Velocity' : conviction >= 50 ? 'B-Tier Stability' : 'C-Tier Spec'} ({conviction}%)
                  </span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={conviction}
                  onChange={(e) => setConviction(parseInt(e.target.value))}
                  className="w-full h-1 bg-surface-bright rounded-full appearance-none cursor-pointer accent-primary" 
                />
              </div>
            </div>
          </div>

          {/* Execution Pricing */}
          <div className="bg-surface-container border border-outline rounded-xl p-8 space-y-8">
            <div className="flex items-center justify-between border-b border-outline pb-4">
              <h3 className="font-bold text-xs uppercase tracking-widest text-on-surface-variant">Execution Pricing</h3>
              <Target className="w-4 h-4 text-primary" />
            </div>

            <div className="space-y-6">
              <PriceInput label="Target Entry" placeholder="0.00" value={entryPrice} onChange={(e: any) => setEntryPrice(e.target.value)} required />
              <PriceInput label="Invalidation Point (SL)" placeholder="0.00" value={stopLoss} onChange={(e: any) => setStopLoss(e.target.value)} />
              <PriceInput label="Expansion Target (TP)" placeholder="0.00" value={takeProfit} onChange={(e: any) => setTakeProfit(e.target.value)} subColor="text-primary" />
              
              <div className="bg-surface border border-outline rounded-lg p-4 flex justify-between items-center">
                <span className="text-[9px] uppercase tracking-widest text-on-surface-variant/60 font-bold">Risk Management Ratio</span>
                <span className="text-sm font-bold text-primary italic">Calculated at entry</span>
              </div>
            </div>
          </div>

          {/* Screenshot Upload UI Placeholder */}
          <div className="md:col-span-2 bg-surface-container border border-outline rounded-xl p-10 space-y-6">
            <div className="flex items-center justify-between border-b border-outline pb-4">
              <h3 className="font-bold text-xs uppercase tracking-widest text-on-surface-variant">Technical Documentation</h3>
              <Upload className="w-4 h-4 text-primary" />
            </div>
            
            <div className="border-2 border-dashed border-outline-variant rounded-2xl py-16 flex flex-col items-center justify-center text-center group hover:bg-surface-container-high hover:border-primary/30 transition-all cursor-pointer">
              <Upload className="w-8 h-8 text-on-surface-variant/20 mb-4 group-hover:text-primary transition-colors" />
              <p className="text-xs font-bold text-on-surface uppercase tracking-widest mb-1">Upload Technical Analysis</p>
              <p className="text-[10px] text-on-surface-variant/40 font-medium">PNG, JPG, TIFF (MAX 5MB)</p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="md:col-span-2 pt-10 flex justify-end gap-6 items-center">
            <button 
              type="button" 
              onClick={() => navigate('/')}
              className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-all"
            >
              Discard Changes
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-primary text-on-primary px-10 py-4 rounded-lg text-xs font-bold uppercase tracking-widest shadow-xl shadow-primary/10 hover:brightness-110 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Recording Execution...' : 'Confirm Execution Record'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

function BiasButton({ active, onClick, icon: Icon, label, color }: any) {
  const colorStyles = {
    primary: "peer-checked:border-primary/50 peer-checked:bg-primary/5 peer-checked:text-primary",
    tertiary: "peer-checked:border-tertiary/50 peer-checked:bg-tertiary/5 peer-checked:text-tertiary",
    secondary: "peer-checked:border-secondary/50 peer-checked:bg-secondary/5 peer-checked:text-secondary",
  };

  return (
    <label onClick={onClick} className="cursor-pointer">
      <input type="radio" className="peer sr-only" checked={active} onChange={() => {}} />
      <div className={cn(
        "flex flex-col items-center gap-2 py-4 rounded-lg border border-outline bg-surface text-on-surface-variant/40 transition-all hover:bg-surface-container-high",
        colorStyles[color as keyof typeof colorStyles]
      )}>
        <Icon className="w-4 h-4" />
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      </div>
    </label>
  );
}

function PriceInput({ label, placeholder, subColor }: any) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant/40 font-bold mb-2">{label}</label>
      <div className="relative group">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/20 text-sm font-light pointer-events-none transition-colors group-focus-within:text-primary">$</span>
        <input 
          type="number" 
          placeholder={placeholder} 
          className={cn(
            "w-full bg-surface border border-outline rounded-lg py-3 pl-10 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/10 focus:outline-none focus:border-primary/50 transition-all",
            subColor
          )}
        />
      </div>
    </div>
  );
}

