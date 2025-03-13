"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardPage from '@/components/dashboard-page';

export default function Home() {
  const { currentUser, loading, initError } = useAuth();
  const router = useRouter();
  const [authAttempted, setAuthAttempted] = useState(false);

  useEffect(() => {
    console.log('Home: 認証状態', {
      loading,
      currentUser: currentUser ? `ID: ${currentUser.uid}` : 'なし',
      initError,
    });

    // 認証の試行が完了したことをマーク
    if (!loading && !authAttempted) {
      setAuthAttempted(true);

      // 認証エラーまたはユーザーがいない場合はログインページへ
      if (initError || !currentUser) {
        console.log('Home: 認証されていないため、ログインページへリダイレクトします');
        router.push('/login');
      }
    }
  }, [currentUser, loading, initError, router, authAttempted]);

  // 初期ローディング表示
  if (loading) {
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

  // エラー表示
  if (initError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-500">
        <p>認証エラーが発生しました</p>
        <button
          onClick={() => router.push('/login')}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
        >
          ログインページへ
        </button>
      </div>
    );
  }

  // 認証チェック完了後、currentUserがない場合もリダイレクト待ち表示
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-sm text-gray-500">ログインページへ移動しています...</p>
      </div>
    );
  }

  // 認証済みの場合はダッシュボードを表示
  return <DashboardPage />;
}

