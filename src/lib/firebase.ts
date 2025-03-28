import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  Auth,
  connectAuthEmulator,
  User as FirebaseUser,
} from "firebase/auth";
import {
  getFirestore,
  Firestore,
  connectFirestoreEmulator,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import {
  getStorage,
  FirebaseStorage,
  connectStorageEmulator,
} from "firebase/storage";
import { AppUserData, createAppUserDataFromFirebaseUser } from "../types/user";
import { AppSettings } from "../types/settings";

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
let auth: Auth = {} as Auth; // 初期値を空オブジェクトに
let googleProvider: GoogleAuthProvider = {} as GoogleAuthProvider;
let db: Firestore = {} as Firestore;
let storage: FirebaseStorage = {} as FirebaseStorage;

// コレクション参照の変数を宣言
let usersCollection: any;
let buildingsCollection: any;
let documentsCollection: any;
let settingsCollection: any;

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

    // 開発環境のみエミュレーターに接続
    if (process.env.NODE_ENV === "development") {
      try {
        // エミュレーターに接続する前に待機
        setTimeout(() => {
          try {
            console.log("Firebaseエミュレーターに接続を試みます...");

            // 認証エミュレーターに接続（URLを正確に指定）
            connectAuthEmulator(auth, "http://127.0.0.1:9099", {
              disableWarnings: false,
            });

            // その他のエミュレーターに接続
            connectFirestoreEmulator(db, "127.0.0.1", 8080);
            connectStorageEmulator(storage, "127.0.0.1", 9199);

            console.log("Firebaseエミュレーターへの接続が完了しました");
          } catch (emulatorError) {
            console.error("エミュレーター接続エラー:", emulatorError);
          }
        }, 1000); // 1秒待機してからエミュレーターに接続
      } catch (timeoutError) {
        console.error(
          "エミュレーター接続のタイムアウト設定に失敗:",
          timeoutError
        );
      }
    }
  } catch (error) {
    // 初期化に失敗した場合もダミーのコレクション参照を用意
    console.error("Firebase初期化失敗: ダミーオブジェクトを使用します", error);
  }
}

// クライアントサイドでのみ初期化を実行
if (typeof window !== "undefined") {
  try {
    // Firebase の初期化
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    db = getFirestore(app);
    storage = getStorage(app);

    // コレクション参照もクライアント側でのみ初期化
    usersCollection = collection(db, "users");
    buildingsCollection = collection(db, "buildings");
    documentsCollection = collection(db, "documents");
    settingsCollection = collection(db, "settings");

    // 開発環境のみエミュレーターに接続
    if (process.env.NODE_ENV === "development") {
      connectAuthEmulator(auth, "http://localhost:9099");
      connectFirestoreEmulator(db, "localhost", 8080);
      connectStorageEmulator(storage, "localhost", 9199);
    }
  } catch (error) {
    // 初期化に失敗した場合もダミーのコレクション参照を用意
    console.error("Firebase初期化失敗: ダミーオブジェクトを使用します");
  }
}

// ユーザー関連の関数
export async function getUserData(uid: string): Promise<AppUserData | null> {
  try {
    const userDoc = await getDoc(doc(usersCollection, uid));
    if (userDoc.exists()) {
      return userDoc.data() as AppUserData;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

export async function createUserData(
  firebaseUser: FirebaseUser,
  additionalData?: Partial<AppUserData>
): Promise<void> {
  const newUser = createAppUserDataFromFirebaseUser(
    firebaseUser,
    additionalData
  );
  await setDoc(doc(usersCollection, firebaseUser.uid), newUser);
}

// 設定関連の関数
export async function getAppSettings(
  settingId = "global"
): Promise<AppSettings | null> {
  try {
    const settingDoc = await getDoc(doc(settingsCollection, settingId));
    if (settingDoc.exists()) {
      return settingDoc.data() as AppSettings;
    }
    return null;
  } catch (error) {
    console.error("Error fetching app settings:", error);
    return null;
  }
}

export { auth, googleProvider, db, storage };
