import { db } from "./firebase-config";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

export async function getAllDocuments() {
  try {
    const querySnapshot = await getDocs(collection(db, "documents"));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("ドキュメント取得エラー:", error);
    return [];
  }
}

export async function getDocumentById(id) {
  try {
    const docRef = doc(db, "documents", id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    console.error("ドキュメント取得エラー:", error);
    return null;
  }
}
