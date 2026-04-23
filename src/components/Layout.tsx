import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { motion } from 'motion/react';

interface LayoutProps {
  children: ReactNode;
  pageTitle: string;
}

export default function Layout({ children, pageTitle }: LayoutProps) {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <TopBar />
      <main className="pl-64 pt-14 min-h-screen">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
