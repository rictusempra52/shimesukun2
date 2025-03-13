import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Firebaseの設定情報
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// デバッグ用：環境変数が正しく読み込まれているか確認
if (typeof window !== "undefined") {
  console.log(
    "Firebase設定情報が設定されているか:",
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "✅" : "❌",
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "✅" : "❌",
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "✅" : "❌"
  );
}

// Firebase初期化
let app;
let auth: Auth;
let googleProvider: GoogleAuthProvider;
let db: Firestore;
let storage: FirebaseStorage;

try {
  if (typeof window !== "undefined") {
    console.log("Firebaseの初期化を試みています...");
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    db = getFirestore(app);
    storage = getStorage(app);
    console.log("Firebaseの初期化が完了しました");
  }
} catch (error) {
  console.error("Firebaseの初期化に失敗しました:", error);
  // エラーをキャッチしても、クライアントでは処理を続行可能にする
  if (typeof window !== "undefined") {
    // クライアントサイドでのみダミーオブジェクトを用意
    auth = {} as Auth;
    googleProvider = {} as GoogleAuthProvider;
    db = {} as Firestore;
    storage = {} as FirebaseStorage;
  }
}

export { auth, googleProvider, db, storage };
