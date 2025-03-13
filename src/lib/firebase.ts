import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/**
 * Firebaseの設定
 *
 * 環境変数から取得したFirebaseのプロジェクト情報を設定します。
 * これらの情報はアプリケーションとFirebaseサービスを接続するために使用されます。
 * 重要: 環境変数はクライアントサイドでも安全に使用できる公開情報のみを含めてください。
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/**
 * Firebase初期化
 *
 * アプリケーション内でFirebaseを一度だけ初期化します。
 * すでに初期化されている場合は既存のインスタンスを再利用します。
 * これにより、複数回の初期化によるエラーやリソース無駄遣いを防ぎます。
 */
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

/**
 * Firebase認証サービスのインスタンス
 *
 * ユーザーのログイン、登録、認証状態の管理に使用します。
 */
const auth = getAuth(app);

/**
 * Google認証プロバイダー
 *
 * Googleアカウントでのログイン機能を提供するためのプロバイダー設定です。
 */
const googleProvider = new GoogleAuthProvider();

/**
 * Firestoreデータベースのインスタンス
 *
 * マンション情報や書類のメタデータなどのデータを保存・取得するために使用します。
 */
const db = getFirestore(app);

/**
 * Firebaseストレージのインスタンス
 *
 * PDFや画像などの実際のファイルデータを保存するために使用します。
 */
const storage = getStorage(app);

// 他のコンポーネントで使用できるようにエクスポート
export { auth, googleProvider, db, storage };
