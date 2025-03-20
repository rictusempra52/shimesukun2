/**
 * 書類情報を表す型定義
 */
export interface Document {
  id: string; // 文字列型のID
  title: string; // タイトル
  building: string; // 建物名
  type: string; // 書類のタイプ
  uploadedAt: string; // アップロード日時
  tags: string[]; // タグの配列
  description: string; // 説明文
  uploadedBy: {
    // アップロードしたユーザー情報
    name: string; // 名前
    avatar: string; // アバター画像URL
    initials: string; // イニシャル
  };
  fileSize: string; // ファイルサイズ
  pages: number; // ページ数
  previewUrl?: string; // プレビューURL（オプショナル）
  relatedDocuments: RelatedDocument[]; // 関連書類の配列
  content: string; // content プロパティを追加
}

/**
 * 関連書類の簡易情報を表す型定義
 */
export interface RelatedDocument {
  id: string;
  title: string;
}
