"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardPage from '@/components/dashboard-page';

export default function Home() {
  const auth = useAuth();
  const currentUser = auth?.currentUser;
  const loading = auth?.loading ?? true;
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // 認証状態が確定したときの処理
    if (!loading) {
      if (!currentUser) {
        console.log('ユーザーが認証されていません。ログインページへリダイレクトします。');
        router.push('/login');
      } else {
        console.log('認証済みユーザー:', currentUser.email);
        setAuthChecked(true);
      }
    }
  }, [currentUser, loading, router]);

  // ローディング中または未認証時は読み込み中の表示
  if (loading || (!currentUser && !authChecked)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-pulse flex space-x-2 mb-4">
          <div className="h-3 w-3 bg-primary rounded-full"></div>
          <div className="h-3 w-3 bg-primary rounded-full"></div>
          <div className="h-3 w-3 bg-primary rounded-full"></div>
        </div>
        <p className="text-sm text-gray-500">認証情報を確認中...</p>
      </div>
    );
  }

  // 認証済みの場合はダッシュボードを表示
  return <DashboardPage />;
}

