"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WifiOff } from "lucide-react";

/**
 * サインアップフォームコンポーネント
 * 
 * 新規ユーザーがアカウント登録するためのフォームを提供します。
 * メールアドレス/パスワードによる登録とGoogleアカウントによる登録の2種類に対応しています。
 */
export function SignupForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isOffline, setIsOffline] = useState(false);
    const router = useRouter();
    const { signup, loginWithGoogle } = useAuth();

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
     * 新規アカウント登録処理を行う関数
     * メールアドレスとパスワードを使用してアカウントを作成します
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

        // パスワードの一致チェック
        if (password !== passwordConfirm) {
            return setError('パスワードが一致しません');
        }

        try {
            setError('');
            setLoading(true);

            // signup関数が存在する場合のみ実行
            if (signup) {
                await signup(email, password);
                setSuccess(true);

                // 2秒後にトップページへリダイレクト
                setTimeout(() => {
                    router.push('/');
                }, 2000);
            } else {
                throw new Error('認証機能が初期化されていません');
            }
        } catch (err: any) {
            // メールアドレス重複エラーの場合
            if (err.code === 'auth/email-already-in-use') {
                setError('このメールアドレスは既に使用されています。');
            }
            // ネットワークエラーの場合
            else if (err.code === 'auth/network-request-failed') {
                setError('ネットワークエラーが発生しました。インターネット接続を確認して再試行してください。');
            }
            // その他のエラーの場合
            else {
                setError('アカウント作成に失敗しました。再度お試しください。');
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    /**
     * Googleアカウントでのサインアップ/ログイン処理
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
                setError('ネットワークエラーが発生しました。インターネット接続を確認して再試行してください。');
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
                <CardTitle>新規アカウント登録</CardTitle>
                <CardDescription>アカウントを作成して書類管理システムを利用開始しましょう</CardDescription>
            </CardHeader>
            <CardContent>
                {isOffline && (
                    <Alert variant="destructive" className="mb-4">
                        <WifiOff className="h-4 w-4 mr-2" />
                        <AlertDescription>
                            インターネット接続がありません。接続を復旧してから再試行してください。
                        </AlertDescription>
                    </Alert>
                )}

                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert className="mb-4 bg-green-50 border-green-200">
                        <AlertDescription className="text-green-800">
                            アカウントが正常に作成されました！トップページにリダイレクトします...
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">メールアドレス</label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading || success}
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium">パスワード</label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading || success}
                        />
                        <p className="text-xs text-muted-foreground">6文字以上で入力してください</p>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="passwordConfirm" className="text-sm font-medium">パスワード（確認用）</label>
                        <Input
                            id="passwordConfirm"
                            type="password"
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            required
                            disabled={loading || success}
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading || success || isOffline}
                    >
                        {loading ? "登録中..." : "アカウント登録"}
                    </Button>
                </form>

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">または</span>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleLogin}
                    disabled={loading || success || isOffline}
                >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                            fill="currentColor"
                            d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                        />
                    </svg>
                    Googleアカウントで登録
                </Button>
            </CardContent>
            <CardFooter className="flex justify-center">
                <div className="text-sm text-gray-500">
                    既にアカウントをお持ちですか？{" "}
                    <Link href="/login" className="text-blue-600 hover:text-blue-800">
                        ログイン
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}
