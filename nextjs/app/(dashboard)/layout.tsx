'use client';

import { useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { bootStore } from '@/store/workspace-store';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => { bootStore(); }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F6F8]">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-hidden flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
