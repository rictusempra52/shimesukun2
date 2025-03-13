import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';

export function SignupForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const { signup, loginWithGoogle } = useAuth();
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (password !== confirmPassword) {
            return setError('パスワードが一致しません。');
        }

        if (password.length < 6) {
            return setError('パスワードは6文字以上で入力してください。');
        }

        try {
            setError('');
            setLoading(true);
            await signup(email, password);
            setSuccessMessage('アカウントが作成されました！');
            setTimeout(() => {
                router.push('/');
            }, 2000);
        } catch (err: any) {
            if (err.code === 'auth/email-already-in-use') {
                setError('このメールアドレスは既に使用されています。');
            } else {
                setError('アカウントの作成に失敗しました。');
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleLogin() {
        try {
            setError('');
            setLoading(true);
            await loginWithGoogle();
            router.push('/');
        } catch (err) {
            setError('Googleログインに失敗しました。再度お試しください。');
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
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">メールアドレス</label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
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
                        />
                        <p className="text-xs text-muted-foreground">6文字以上で入力してください</p>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="confirm-password" className="text-sm font-medium">パスワード（確認）</label>
                        <Input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? '登録中...' : 'アカウント作成'}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <div className="relative w-full">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">または</span>
                    </div>
                </div>

                <Button
                    variant="outline"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full"
                >
                    <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2">
                        <path
                            d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.798-1.677-4.203-2.707-6.735-2.707-5.522 0-10 4.478-10 10s4.478 10 10 10c8.396 0 10.249-7.85 9.426-11.748l-9.426 0.087z"
                            fill="currentColor"
                        />
                    </svg>
                    Googleで登録
                </Button>

                <p className="text-center text-sm text-muted-foreground mt-2">
                    既にアカウントをお持ちですか？{" "}
                    <Link href="/login" className="text-primary hover:underline">
                        ログイン
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}
