"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wifi, WifiOff } from "lucide-react";

/**
 * ログインフォームコンポーネント
 * 
 * 既存ユーザーがログインするためのフォームを提供します。
 * メールアドレス/パスワードによるログインとGoogleアカウントによるログインの2種類に対応しています。
 */
export function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOffline, setIsOffline] = useState(false);
    const router = useRouter();
    const { login, loginWithGoogle } = useAuth();

    // オンライン状態の監視
    useEffect(() => {
        // 初期状態の設定
        setIsOffline(!navigator.onLine);

        // オンライン/オフライン状態の変化を監視
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    /**
     * ログイン処理を行う関数
     * メールアドレスとパスワードを使用してログインを行います
     * 
     * @param {React.FormEvent} e - フォーム送信イベント
     */
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        // オフライン状態のチェック
        if (isOffline) {
            setError('インターネット接続がありません。接続を確認してから再試行してください。');
            return;
        }

        try {
            setError('');
            setLoading(true);

            // login関数が存在する場合のみ実行
            if (login) {
                await login(email, password);
                router.push('/'); // 成功時はトップページへリダイレクト
            } else {
                throw new Error('認証機能が初期化されていません');
            }
        } catch (err: any) {
            if (err.code === 'auth/invalid-credential') {
                setError('メールアドレスまたはパスワードが正しくありません。');
            } else if (err.code === 'auth/user-not-found') {
                setError('このメールアドレスのアカウントが見つかりません。');
            } else if (err.code === 'auth/wrong-password') {
                setError('パスワードが正しくありません。');
            } else if (err.code === 'auth/too-many-requests') {
                setError('ログイン試行回数が多すぎます。しばらくしてから再度お試しください。');
            } else if (err.code === 'auth/network-request-failed') {
                if (process.env.NODE_ENV === 'development') {
                    setError('ネットワークエラーが発生しました。Firebase エミュレーターが起動しているか確認してください。');
                } else {
                    setError('ネットワークエラーが発生しました。インターネット接続を確認して再試行してください。');
                }
            } else if (err.message && err.message.includes('fetch')) {
                // フェッチエラーの特別処理（エミュレーター関連）
                if (process.env.NODE_ENV === 'development') {
                    setError('Firebase エミュレーターに接続できません。`firebase emulators:start` を実行しているか確認してください。');
                    console.error('エミュレーター接続エラー:', err);
                } else {
                    setError('サーバーに接続できません。インターネット接続を確認して再試行してください。');
                }
            } else {
                setError('ログインに失敗しました。再度お試しください。');
                console.error('ログインエラー:', err);
            }
        } finally {
            setLoading(false);
        }
    }

    /**
     * Googleアカウントでのログイン処理
     * Googleの認証ポップアップを表示し、認証を行います
     */
    async function handleGoogleLogin() {
        // オフライン状態のチェック
        if (isOffline) {
            setError('インターネット接続がありません。接続を確認してから再試行してください。');
            return;
        }

        try {
            setError('');
            setLoading(true);
            if (loginWithGoogle) {
                await loginWithGoogle();
                router.push('/');
            }
        } catch (err: any) {
            if (err.code === 'auth/popup-closed-by-user') {
                setError('ログインポップアップが閉じられました。再度お試しください。');
            } else if (err.code === 'auth/network-request-failed') {
                if (process.env.NODE_ENV === 'development') {
                    setError('ネットワークエラーが発生しました。Firebase エミュレーターが起動しているか確認してください。');
                } else {
                    setError('ネットワークエラーが発生しました。インターネット接続を確認して再試行してください。');
                }
            } else if (err.message && err.message.includes('fetch')) {
                // フェッチエラーの特別処理（エミュレーター関連）
                if (process.env.NODE_ENV === 'development') {
                    setError('Firebase エミュレーターに接続できません。`firebase emulators:start` を実行しているか確認してください。');
                } else {
                    setError('サーバーに接続できません。インターネット接続を確認して再試行してください。');
                }
            } else {
                setError('Googleログインに失敗しました。再度お試しください。');
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>ログイン</CardTitle>
                <CardDescription>アカウント情報を入力してログインしてください</CardDescription>
            </CardHeader>
            <CardContent>
                {isOffline && (
                    <Alert variant="destructive" className="mb-4">
                        <WifiOff className="h-4 w-4 mr-2" />
                        <AlertDescription>
                            インターネット接続がありません。再接続すると自動的に更新されます。
                        </AlertDescription>
                    </Alert>
                )}

                {/* ここにフォームの内容を記述 */}
                <form onSubmit={handleSubmit}>
                    {/* フォーム要素 */}
                </form>
            </CardContent>
            <CardFooter>
                <p className="text-sm text-muted-foreground">
                    アカウントをお持ちでない場合は <Link href="/signup" className="text-primary hover:underline">新規登録</Link> してください。
                </p>
            </CardFooter>
        </Card>
    );
}
