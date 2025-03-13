"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardPage from '@/components/dashboard-page';

export default function Home() {
  const auth = useAuth();
  const currentUser = auth?.currentUser;
  const loading = auth?.loading ?? true;
  const router = useRouter();

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loading, router]);

  // ローディング中または未認証時は空の内容を表示
  if (loading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex space-x-2">
          <div className="h-3 w-3 bg-primary rounded-full"></div>
          <div className="h-3 w-3 bg-primary rounded-full"></div>
          <div className="h-3 w-3 bg-primary rounded-full"></div>
        </div>
      </div>
    );
  }

  // 認証済みの場合はダッシュボードを表示
  return <DashboardPage />;
}

