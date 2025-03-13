import * as admin from "firebase-admin";

// 環境変数からサービスアカウント情報を取得する方法
// または、JSON設定ファイルをインポート
let serviceAccount;

try {
  // 本番環境では環境変数から取得
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  } else {
    // 開発環境ではJSONファイルから取得（注：このファイルはGitにコミットしないこと）
    serviceAccount = require("../../../firebase-service-account.json");
  }
} catch (error) {
  console.error("Firebase Admin初期化エラー:", error);
}

// Firebaseアプリの初期化（一度だけ）
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // 他の必要な設定（データベースURLなど）
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  } catch (error) {
    console.error("Firebase admin初期化エラー:", error);
  }
}

// Firestoreのエクスポート
export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();

export default admin;
