import { documentsData } from "@/lib/document-data";
import {
  getAllDocuments as getFirebaseDocuments,
  getDocumentById as getFirebaseDocumentById,
} from "@/lib/firebase/documents";
import { Document } from "@/types/document";

/**
 * 設定されたデータソースに応じて全ドキュメントを取得
 * @param dataSource データソース設定（'firebase' または 'mock'）
 */
export async function getAllDocuments(
  dataSource: "firebase" | "mock"
): Promise<Document[]> {
  if (dataSource === "firebase") {
    // Firebase からデータ取得
    return await getFirebaseDocuments();
  } else {
    // モックデータから取得
    return documentsData as Document[];
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
    // Firebase からデータ取得
    return await getFirebaseDocumentById(id);
  } else {
    // モックデータから取得
    const numId = parseInt(id);
    const doc = documentsData.find((doc) => doc.id === numId);
    return doc ? ({ ...doc, id: id.toString() } as Document) : null;
  }
}
