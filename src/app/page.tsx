"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardPage from '@/components/dashboard-page';

export default function Home() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [forceRender, setForceRender] = useState(false); // 強制再レンダリング用

  // 注意: フックは常にトップレベルで呼び出す
  const auth = useAuth();
  const currentUser = auth?.currentUser;
  // ローディング状態を取得　初期値はtrue　
  const loading = auth?.loading ?? true;
  const initError = auth?.initError;

  // クライアントサイドでのみレンダリングされるようにする
  useEffect(() => {
    setIsClient(true);
  }, []);

  // デバッグ用：認証状態変化のログ
  useEffect(() => {
    if (isClient) {
      console.log('Home: 認証状態変化検知', {
        loading,
        currentUser: currentUser?.uid,
        initError
      });
    }
  }, [isClient, loading, currentUser, initError]);

  // 認証状態の監視
  useEffect(() => {
    if (isClient && !loading && !currentUser) {
      console.log('Home: 認証されていないため、ログインページへリダイレクトします');
      router.push('/login');
    }
  }, [isClient, loading, currentUser, router]);

  // 認証完了後も画面が更新されない場合のための強制再レンダリング
  useEffect(() => {
    if (isClient && !loading && currentUser) {
      console.log('認証完了後の強制再レンダリングを試みます');
      const timer = setTimeout(() => {
        setForceRender(prev => !prev);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isClient, loading, currentUser]);

  // 認証コンテキストがまだ提供されていない場合（エラー状態）
  if (!auth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-red-500">認証コンテキストが利用できません</div>
        <button
          onClick={() => router.push('/login')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          ログインページへ
        </button>
      </div>
    );
  }

  // まだクライアントサイドでない場合（サーバーサイドレンダリング時）
  if (!isClient) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-pulse flex space-x-2 mb-4">
          <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
          <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
          <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
        </div>
        <p className="text-sm text-gray-500">初期化中...</p>
      </div>
    );
  }

  // 認証処理中の場合
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-pulse flex space-x-2 mb-4">
          <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
          <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
          <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
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
        <p className="text-sm mt-2 max-w-md text-center">{initError}</p>
        <button
          onClick={() => router.push('/login')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
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
  console.log('ダッシュボードを表示します', { forceRender });
  return <DashboardPage key={forceRender ? "force-render" : "normal"} />;
}

