/**
 * Document型の定義
 * Firestoreから取得したドキュメントデータの型
 */
export interface DocumentUploader {
  name: string;
  avatar: string;
  initials: string;
}

export interface RelatedDocument {
  id: string;
  title: string;
}

export interface Document {
  id: string; // FirestoreのドキュメントID
  title: string; // 書類タイトル
  building: string; // マンション名
  type: string; // ファイル形式（PDF/JPG/PNG）
  uploadedAt: string; // アップロード日
  tags: string[]; // タグ
  description: string; // 説明
  uploadedBy: DocumentUploader; // アップロードユーザー
  fileSize: string; // ファイルサイズ
  pages: number; // ページ数
  previewUrl: string; // プレビュー画像URL
  relatedDocuments: RelatedDocument[]; // 関連書類
}
