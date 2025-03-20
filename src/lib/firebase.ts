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
import { User } from "../types/user";
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

// 開発環境のみエミュレーターに接続
if (process.env.NODE_ENV === "development") {
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, "localhost", 8080);
  connectStorageEmulator(storage, "localhost", 9199);
}

// コレクションの参照
const usersCollection = collection(db, "users");
const buildingsCollection = collection(db, "buildings");
const documentsCollection = collection(db, "documents");
const settingsCollection = collection(db, "settings");

// ユーザー関連の関数
export async function getUserData(uid: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(usersCollection, uid));
    if (userDoc.exists()) {
      return userDoc.data() as User;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

export async function createUserData(userData: Partial<User>): Promise<void> {
  if (!userData.uid) throw new Error("User ID is required");

  const newUser: User = {
    uid: userData.uid,
    displayName: userData.displayName || "",
    email: userData.email || "",
    photoURL: userData.photoURL,
    initials: getInitials(userData.displayName || ""),
    role: "user", // デフォルトは一般ユーザー
    buildingAccess: {},
    preferences: {
      theme: "system",
      notifications: true,
    },
    lastLogin: Timestamp.now(),
    createdAt: Timestamp.now(),
  };

  await setDoc(doc(usersCollection, userData.uid), newUser);
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

// ユーティリティ関数
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export { auth, googleProvider, db, storage };
