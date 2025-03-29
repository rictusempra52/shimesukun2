"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * アプリケーションのナビゲーションバー
 * 画面上部に表示されるメニュー
 */
export default function Navbar() {
  const pathname = usePathname();

  // 現在のパスに基づいてアクティブなリンクにスタイルを適用
  const getLinkClass = (path: string) => {
    const baseClass = "px-3 py-2 rounded-md text-sm font-medium";
    const activeClass = "bg-gray-900 text-white";
    const inactiveClass = "text-gray-300 hover:bg-gray-700 hover:text-white";
    
    return pathname === path 
      ? `${baseClass} ${activeClass}` 
      : `${baseClass} ${inactiveClass}`;
  };

  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="text-white font-bold text-xl">
                シメスくん
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/" className={getLinkClass("/")}>
                  ホーム
                </Link>
                <Link href="/knowledge/search" className={getLinkClass("/knowledge/search")}>
                  知識ベース検索
                </Link>
                <Link href="/knowledge" className={getLinkClass("/knowledge")}>
                  知識ベース管理
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {/* ここに通知アイコンやユーザーメニューなどを追加 */}
            </div>
          </div>
          
          {/* モバイル用メニューボタン */}
          <div className="md:hidden">
            <button
              type="button"
              className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">メニューを開く</span>
              {/* アイコン */}
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* モバイルメニュー */}
      <div className="md:hidden" id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link href="/" className={getLinkClass("/") + " block"}>
            ホーム
          </Link>
          <Link href="/knowledge/search" className={getLinkClass("/knowledge/search") + " block"}>
            知識ベース検索
          </Link>
          <Link href="/knowledge" className={getLinkClass("/knowledge") + " block"}>
            知識ベース管理
          </Link>
        </div>
      </div>
    </nav>
  );
}
