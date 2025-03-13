import { Document, RelatedDocument } from "@/types/document";
import { documentsData } from "@/lib/document-data";
import {
  getAllDocuments as getFirebaseDocuments,
  getDocumentById as getFirebaseDocumentById,
} from "@/lib/firebase/documents";

/**
 * ドキュメントデータを統一形式に変換する共通関数
 * @param doc 処理対象のドキュメント
 * @returns 統一形式のドキュメント
 */
function normalizeDocument(doc: any): Document {
  return {
    ...doc,
    id: doc.id.toString(),
    relatedDocuments: Array.isArray(doc.relatedDocuments)
      ? doc.relatedDocuments.map((relatedDoc: any) => ({
          id: relatedDoc.id?.toString() || "",
          title: relatedDoc.title || "",
        }))
      : [],
  } as Document;
}

/**
 * 設定されたデータソースに応じて全ドキュメントを取得
 * @param dataSource データソース設定（'firebase' または 'mock'）
 */
export async function getAllDocuments(
  dataSource: "firebase" | "mock"
): Promise<Document[]> {
  if (dataSource === "firebase") {
    // Firebase からデータ取得し、型変換
    const firebaseDocuments = await getFirebaseDocuments();
    return firebaseDocuments.map(normalizeDocument);
  } else {
    // モックデータから取得し、型変換
    return documentsData.map(normalizeDocument);
  }
}

/**
 * 設定されたデータソースに応じて特定のドキュメントを取得
 * @param id ドキュメントID
 * @param dataSource データソース設定
 */
export async function getDocumentById(
  id: string,
  dataSource: "firebase" | "mock"
): Promise<Document | null> {
  if (dataSource === "firebase") {
    const firebaseDocument = await getFirebaseDocumentById(id);
    return firebaseDocument ? normalizeDocument(firebaseDocument) : null;
  } else {
    // モックデータから取得
    const numId = parseInt(id);
    const doc = documentsData.find((doc) => doc.id === numId);
    return doc ? normalizeDocument(doc) : null;
  }
}
