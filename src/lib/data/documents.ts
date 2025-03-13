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
    // Firebase からデータ取得し、型変換
    const firebaseDocuments = await getFirebaseDocuments();
    return firebaseDocuments.map((doc) => ({
      ...doc,
      id: doc.id.toString(),
      relatedDocuments: doc.relatedDocuments.map((relatedDoc) => ({
        id: relatedDoc.id.toString(),
        title: relatedDoc.title,
      })),
    })) as Document[];
  } else {
    // モックデータから取得し、id及びrelatedDocumentsのidも文字列に変換
    return documentsData.map((doc) => ({
      ...doc,
      id: doc.id.toString(),
      relatedDocuments: doc.relatedDocuments.map((relatedDoc) => ({
        id: relatedDoc.id.toString(),
        title: relatedDoc.title,
      })),
    })) as Document[];
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
    // Firebase からデータ取得し、型変換
    const firebaseDocument = await getFirebaseDocumentById(id);
    return firebaseDocument
      ? ({
          ...firebaseDocument,
          id: firebaseDocument.id.toString(),
          relatedDocuments: firebaseDocument.relatedDocuments.map(
            (relatedDoc) => ({
              id: relatedDoc.id.toString(),
              title: relatedDoc.title,
            })
          ),
        } as Document)
      : null;
  } else {
    // モックデータから取得
    const numId = parseInt(id);
    const doc = documentsData.find((doc) => doc.id === numId);
    return doc
      ? ({
          ...doc,
          id: doc.id.toString(),
          relatedDocuments: doc.relatedDocuments.map((relatedDoc) => ({
            id: relatedDoc.id.toString(),
            title: relatedDoc.title,
          })),
        } as Document)
      : null;
  }
}
