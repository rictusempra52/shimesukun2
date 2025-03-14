"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { DataSourceProvider } from "@/contexts/data-source-context";
import { Toaster } from "sonner";
import { ErrorBoundary } from "react-error-boundary";

// エラーフォールバックコンポーネント
function ErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
            <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full">
                <h2 className="text-red-600 text-xl font-bold mb-4">エラーが発生しました</h2>
                <p className="mb-4 text-gray-700">{error.message}</p>
                <div className="bg-gray-100 p-2 rounded mb-4 text-sm overflow-x-auto">
                    <pre>{error.stack}</pre>
                </div>
                <button
                    onClick={resetErrorBoundary}
                    className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    アプリを再読み込み
                </button>
            </div>
        </div>
    );
}

/**
 * クライアントサイドのレイアウトラッパー
 * 
 * AuthProviderやErrorBoundaryなど、クライアントサイドで必要な
 * プロバイダーやラッパーを提供します。
 */
export function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={() => window.location.reload()}
        >
            <AuthProvider>
                <DataSourceProvider>
                    {children}
                    <Toaster />
                </DataSourceProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}
