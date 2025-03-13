import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DataSourceProvider } from "@/contexts/data-source-context";
import { Toaster } from "sonner"; // sonnerのToasterをインポート

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "シメスくん - マンション書類管理システム",
  description: "マンションの書類をデジタル化し、効率的に管理・検索するためのWebアプリケーション",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <DataSourceProvider>
          {children}
          <Toaster /> {/* Toasterコンポーネントを追加 */}
        </DataSourceProvider>
      </body>
    </html>
  );
}
