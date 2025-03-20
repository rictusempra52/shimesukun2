import { Timestamp } from "firebase/firestore";

export type UserRole = "admin" | "manager" | "user";
export type BuildingAccessLevel = "admin" | "member" | "none";
export type ThemePreference = "light" | "dark" | "system";

export interface User {
  uid: string; // ユーザーID（Firebase Authと同一）
  displayName: string; // 表示名
  email: string; // メールアドレス
  photoURL?: string; // プロフィール画像URL
  initials: string; // イニシャル
  role: UserRole; // システム全体での役割
  buildingAccess: {
    // マンションごとのアクセス権限
    [buildingId: string]: BuildingAccessLevel;
  };
  preferences: {
    // ユーザー設定
    theme: ThemePreference;
    notifications: boolean;
    // その他の設定
  };
  lastLogin: Timestamp; // 最終ログイン日時
  createdAt: Timestamp; // アカウント作成日時
}
