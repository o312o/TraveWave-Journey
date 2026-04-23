import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  BookOpen, 
  Calendar as CalendarIcon, 
  Settings, 
  HelpCircle, 
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: BookOpen, label: 'Trade Journal', path: '/journal' },
  { icon: CalendarIcon, label: 'Calendar', path: '/calendar' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Sidebar() {
  return (
    <nav id="sidebar-nav" className="fixed left-0 top-0 h-full w-64 border-r border-outline flex flex-col z-50 bg-surface select-none">
      <div id="sidebar-header" className="px-8 py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-gradient-to-tr from-primary to-secondary rounded-sm flex items-center justify-center">
            <span className="text-on-primary font-black text-xs">V</span>
          </div>
          <span className="text-lg font-semibold tracking-tight uppercase text-on-surface">Vanguard</span>
        </div>
      </div>

      <div className="flex-1 px-4 space-y-6">
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-bold px-4">Platform</p>
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-md transition-all duration-200 group text-sm font-medium",
                  isActive 
                    ? "bg-surface-container text-primary" 
                    : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                <item.icon className={cn("w-4 h-4 transition-colors", "group-hover:text-primary")} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      <div className="p-8 border-t border-outline flex items-center gap-3">
        <div className="w-10 h-10 rounded-full border border-outline overflow-hidden shrink-0">
          <img 
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100" 
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" 
            alt="User profile" 
          />
        </div>
        <div className="overflow-hidden">
          <p className="text-xs font-bold text-on-surface truncate">Alexander Voss</p>
          <p className="text-[10px] text-on-surface-variant truncate uppercase tracking-tighter">Creative Director</p>
        </div>
      </div>
    </nav>
  );
}
