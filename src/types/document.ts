/**
 * 書類情報を表す型定義
 */
export interface Document {
  id: string;
  title: string;
  building: string;
  type: string;
  uploadedAt: string;
  tags: string[];
  description: string;
  uploadedBy: {
    name: string;
    avatar: string;
    initials: string;
  };
  fileSize: string;
  pages: number;
  previewUrl?: string;
  relatedDocuments: RelatedDocument[];
}

/**
 * 関連書類の簡易情報を表す型定義
 */
export interface RelatedDocument {
  id: string;
  title: string;
}
