/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './views/Dashboard';
import Journal from './views/Journal';
import Calendar from './views/Calendar';
import Analytics from './views/Analytics';
import Settings from './views/Settings';
import { FirebaseProvider, useFirebase } from './contexts/FirebaseContext';
import { LogIn } from 'lucide-react';

function AppRoutes() {
  const { user, loading, login } = useFirebase();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-primary/40 shadow-2xl shadow-primary/20 mb-4">
            <span className="text-on-primary font-black text-2xl">V</span>
          </div>
          <h1 className="text-4xl font-light tracking-tighter text-on-surface italic">Vanguard Precision</h1>
          <p className="text-on-surface-variant/60 text-sm font-medium uppercase tracking-widest">Institutional Terminal Access</p>
          
          <button 
            onClick={login}
            className="w-full group relative flex items-center justify-center gap-3 bg-surface-container border border-outline px-8 py-4 rounded-xl text-on-surface hover:bg-surface-container-high transition-all active:scale-95 shadow-2xl shadow-black/40"
          >
            <LogIn className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-widest">Initialize with Google</span>
          </button>

          <div className="pt-12 text-[10px] text-on-surface-variant/40 font-bold uppercase tracking-widest italic leading-loose">
            Secure Node Alpha-745300406176<br />
            Encrypted Session Protocol v2.4.0
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/journal" element={<Journal />} />
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}

export default function App() {
  return (
    <FirebaseProvider>
      <Router>
        <AppRoutes />
      </Router>
    </FirebaseProvider>
  );
}
