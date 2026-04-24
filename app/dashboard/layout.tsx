'use client';

import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { currentUser } = useStore();

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      router.push('/');
    }
  }, [currentUser, router]);

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  return (
    <div className="flex h-screen bg-[#f6fbff] text-slate-900 dark:bg-background dark:text-foreground">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <div className="flex-1 overflow-y-auto bg-white p-6 dark:bg-background">
          {children}
        </div>
      </main>
    </div>
  );
}
