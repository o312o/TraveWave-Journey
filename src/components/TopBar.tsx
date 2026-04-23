import { Search, Bell, Wallet, RefreshCw } from 'lucide-react';

export default function TopBar() {
  return (
    <header id="top-bar" className="fixed top-0 right-0 left-64 h-20 bg-surface border-b border-outline flex items-center justify-between px-10 z-40">
      <div id="search-container" className="flex items-center space-x-2">
        <span className="text-on-surface-variant/60 text-sm uppercase tracking-widest">Workspace /</span>
        <span className="text-sm font-medium text-on-surface">Precision Terminal</span>
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 border border-outline-variant rounded-full group-focus-within:border-primary transition-colors"></div>
          <input 
            type="text" 
            placeholder="Search projects..." 
            className="bg-surface-container border border-outline rounded-full py-2 pl-9 pr-4 text-xs w-64 focus:outline-none focus:border-primary text-on-surface transition-all placeholder:text-on-surface-variant/40"
          />
        </div>
        <div className="w-8 h-8 rounded-full border border-outline flex items-center justify-center relative cursor-pointer hover:bg-surface-container transition-all">
          <div className="w-1.5 h-1.5 bg-primary rounded-full absolute top-0 right-0 border border-surface"></div>
          <Bell className="w-4 h-4 text-on-surface-variant" />
        </div>
      </div>
    </header>
  );
}
