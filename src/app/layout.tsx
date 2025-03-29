import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "シメスくん - マンション書類管理アプリ",
  description: "マンションの書類をデジタル化し、効率的に管理・検索するためのアプリケーション",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <Navbar />
        <div className="min-h-screen bg-gray-50">{children}</div>
      </body>
    </html>
  );
}
