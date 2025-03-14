"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DataSourceProvider } from "@/contexts/data-source-context";
import { Toaster } from "sonner"; // sonnerのToasterをインポート
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "react-error-boundary";

const inter = Inter({ subsets: ["latin"] });

// Next.jsの型エラーを回避するためのメタデータ定義
const metadata = {
  title: "シメスくん - マンション書類管理システム",
  description: "マンションの書類をデジタル化し、効率的に管理・検索するためのWebアプリケーション",
};

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => window.location.reload()}
        >
          <AuthProvider>
            <DataSourceProvider>
              {children}
              <Toaster /> {/* Toasterコンポーネントを追加 */}
            </DataSourceProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

// Next.jsにメタデータを伝えるためのエクスポート
// "use client" を使う場合はこのように静的にエクスポートする必要がある
export { metadata };
