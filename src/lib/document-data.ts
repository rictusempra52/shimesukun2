/**
 * ドキュメントデータを管理するモジュール
 *
 * このファイルは書類データのモックを提供し、サーバーコンポーネントとクライアントコンポーネントの
 * 両方からアクセスできます。将来的には実際のAPIやデータベースからデータを取得する実装に
 * 置き換えることを想定しています。
 */

// 書類データの型定義（暗黙的）
// id: 書類の一意の識別子
// title: 書類のタイトル
// building: 管理対象のマンション名
// type: ファイル形式（PDF/JPG/PNGなど）
// uploadedAt: アップロード日（YYYY-MM-DD形式）
// tags: 関連するタグの配列
// description: 書類の詳細説明
// uploadedBy: アップロードしたユーザー情報
//   - name: ユーザー名
//   - avatar: アバター画像のURL
//   - initials: イニシャル（アバター画像がない場合の代替表示）
// fileSize: ファイルサイズ（文字列形式、例: "1.2 MB"）
// pages: ドキュメントのページ数
// previewUrl: プレビュー画像のURL
// relatedDocuments: 関連書類の配列
//   - id: 関連書類のID（documentsData内の対応するidを参照）
//   - title: 関連書類のタイトル

/**
 * マンション管理に関連する書類データのサンプル
 *
 * このデータは開発およびデモ用で、実際のデータはFirebaseなどから取得します。
 * データ構造は実際のアプリケーションの要件に合わせて変更できます。
 */
export const documentsData = [
  {
    id: 1,
    title: "管理組合総会議事録", // 管理組合の総会で作成された議事録
    building: "グランドパレス東京", // 対象マンション名
    type: "PDF", // ファイル形式
    uploadedAt: "2023-12-15", // アップロード日
    tags: ["議事録", "総会"], // 検索やフィルタリング用のタグ
    description:
      "2023年度第2回管理組合総会の議事録です。主な議題は大規模修繕計画と予算承認について。", // 内容の要約
    uploadedBy: {
      name: "田中太郎", // アップロードしたユーザー
      avatar: "/placeholder.svg?height=32&width=32", // アバター画像のURL
      initials: "TT", // イニシャル（アバター画像がない場合に表示）
    },
    fileSize: "1.2 MB", // ファイルサイズ
    pages: 5, // ドキュメントのページ数
    previewUrl: "/placeholder.svg?height=500&width=400", // プレビュー画像のURL
    relatedDocuments: [
      // このドキュメントに関連する他の書類（ID参照）
      { id: 2, title: "修繕工事見積書" },
      { id: 5, title: "エレベーター保守点検報告書" },
    ],
  },
  {
    id: 2,
    title: "修繕工事見積書", // 修繕工事の業者からの見積書
    building: "サンシャインマンション",
    type: "PDF",
    uploadedAt: "2023-12-10",
    tags: ["見積書", "修繕"], // 書類の種類を表すタグ
    description:
      "外壁塗装および防水工事の見積書です。3社の相見積もりの中から最も安価な業者を選定しました。", // 書類の概要
    uploadedBy: {
      name: "佐藤花子",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "SH",
    },
    fileSize: "3.5 MB",
    pages: 12, // 複数ページの書類
    previewUrl: "/placeholder.svg?height=500&width=400",
    relatedDocuments: [{ id: 1, title: "管理組合総会議事録" }], // 関連する議事録へのリンク
  },
  // 消防設備点検報告書 - 法令で定められた定期点検の結果報告書
  {
    id: 3,
    title: "消防設備点検報告書",
    building: "パークハイツ横浜", // 別のマンション
    type: "PDF",
    uploadedAt: "2023-12-05",
    tags: ["点検", "消防"], // 点検種別を示すタグ
    description:
      "年次消防設備点検の報告書です。スプリンクラーシステムの一部に不具合が見つかり、修理が必要です。", // 要点と問題点
    uploadedBy: {
      name: "鈴木一郎",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "SI",
    },
    fileSize: "2.8 MB",
    pages: 8,
    previewUrl: "/placeholder.svg?height=500&width=400",
    relatedDocuments: [], // 関連書類なし
  },
  // 駐車場利用規約 - マンションの駐車場利用に関するルールを記載した文書
  {
    id: 4,
    title: "駐車場利用規約",
    building: "リバーサイドタワー大阪",
    type: "PDF",
    uploadedAt: "2023-11-28",
    tags: ["規約", "駐車場"], // 文書種別とテーマ
    description:
      "駐車場の利用に関する新しい規約です。料金体系の変更と来客用駐車スペースの利用方法が更新されています。", // 主な変更点
    uploadedBy: {
      name: "山田健太",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "YK",
    },
    fileSize: "0.9 MB",
    pages: 3, // 比較的短い文書
    previewUrl: "/placeholder.svg?height=500&width=400",
    relatedDocuments: [], // 関連書類なし
  },
  // エレベーター保守点検報告書 - 設備の定期点検結果報告書
  {
    id: 5,
    title: "エレベーター保守点検報告書",
    building: "グリーンヒルズ札幌",
    type: "PDF",
    uploadedAt: "2023-11-20",
    tags: ["点検", "エレベーター"],
    description:
      "定期エレベーター保守点検の報告書です。特に問題は見つかりませんでしたが、次回の定期交換部品についての案内が含まれています。", // 点検結果と今後の予定
    uploadedBy: {
      name: "高橋恵子",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "TK",
    },
    fileSize: "1.7 MB",
    pages: 6,
    previewUrl: "/placeholder.svg?height=500&width=400",
    relatedDocuments: [{ id: 1, title: "管理組合総会議事録" }], // 総会で議題になった関連議事録
  },
];

/**
 * 使用方法:
 *
 * 1. インポート:
 *   import { documentsData } from "@/lib/document-data"
 *
 * 2. 全てのドキュメントにアクセス:
 *   const allDocuments = documentsData;
 *
 * 3. 特定のドキュメントを検索:
 *   const document = documentsData.find(doc => doc.id === documentId);
 *
 * 4. フィルタリング:
 *   const filteredDocs = documentsData.filter(doc =>
 *     doc.building === "グランドパレス東京" &&
 *     doc.tags.includes("議事録")
 *   );
 *
 * 5. 関連ドキュメントの取得:
 *   const relatedDocs = document.relatedDocuments.map(
 *     relDoc => documentsData.find(d => d.id === relDoc.id)
 *   ).filter(Boolean);
 */
