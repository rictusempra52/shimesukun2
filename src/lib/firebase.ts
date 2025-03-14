import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  Auth,
  connectAuthEmulator,
} from "firebase/auth";
import {
  getFirestore,
  Firestore,
  connectFirestoreEmulator,
} from "firebase/firestore";
import {
  getStorage,
  FirebaseStorage,
  connectStorageEmulator,
} from "firebase/storage";

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
let app: FirebaseApp;
let auth: Auth;
let googleProvider: GoogleAuthProvider;
let db: Firestore;
let storage: FirebaseStorage;

// Firebase実装の初期化関数
function initializeFirebase() {
  try {
    console.log("Firebaseの初期化を試みています...");

    // すでに初期化されている場合は既存のインスタンスを使用
    if (getApps().length > 0) {
      app = getApps()[0];
      console.log("既存のFirebaseインスタンスを使用します");
    } else {
      // 新しくインスタンスを作成
      app = initializeApp(firebaseConfig);
      console.log("新しいFirebaseインスタンスを作成しました");
    }

    // 各サービスの初期化
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    db = getFirestore(app);
    storage = getStorage(app);

    // GoogleログインのUXを改善
    googleProvider.setCustomParameters({
      prompt: "select_account",
    });

    console.log("Firebaseの初期化が完了しました");
    return true;
  } catch (error) {
    console.error("Firebaseの初期化に失敗しました:", error);
    return false;
  }
}

// クライアントサイドでのみ初期化を実行
if (typeof window !== "undefined") {
  const initialized = initializeFirebase();

  if (!initialized) {
    // 初期化に失敗した場合は、ダミーオブジェクトを作成
    auth = {} as Auth;
    googleProvider = {} as GoogleAuthProvider;
    db = {} as Firestore;
    storage = {} as FirebaseStorage;
    console.error("Firebase初期化失敗: ダミーオブジェクトを使用します");
  }
}

export { auth, googleProvider, db, storage };
