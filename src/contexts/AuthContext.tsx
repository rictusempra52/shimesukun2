"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import {
    User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

/**
 * 認証コンテキストの型定義
 * 
 * アプリ全体で利用できる認証関連の状態と関数を定義します。
 * これにより、どのコンポーネントからでも認証機能を利用できるようになります。
 */
type AuthContextType = {
    currentUser: User | null;      // 現在ログインしているユーザー情報
    loading: boolean;              // 認証状態の読み込み中フラグ
    login: (email: string, password: string) => Promise<any>; // メール/パスワードでのログイン
    signup: (email: string, password: string) => Promise<any>; // 新規ユーザー登録
    loginWithGoogle: () => Promise<any>; // Googleアカウントでのログイン
    logout: () => Promise<void>;   // ログアウト
};

/**
 * 認証コンテキストの作成
 * 
 * Reactのコンテキスト機能を利用して、アプリ全体で認証状態を共有できるようにします。
 * 初期値はnullで、AuthProviderコンポーネントで実際の値をセットします。
 */
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * 認証コンテキストを使用するためのカスタムフック
 * 
 * このフックを使うことで、どのコンポーネントからでも簡単に認証機能にアクセスできます。
 * 例: const { currentUser, login, logout } = useAuth();
 */
export const useAuth = () => {
    return useContext(AuthContext) as AuthContextType;
};

/**
 * 認証プロバイダーコンポーネント
 * 
 * このコンポーネントでアプリをラップすることで、すべての子コンポーネントに
 * 認証関連の機能（ログイン、ログアウトなど）を提供します。
 * 
 * @param {object} props - コンポーネントのプロパティ
 * @param {React.ReactNode} props.children - 子コンポーネント
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    // 現在のユーザー状態を管理
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    // 認証状態の読み込み中かどうかのフラグ
    const [loading, setLoading] = useState(true);

    /**
     * メール/パスワードでのユーザー登録
     * 
     * Firebase Authenticationを使用して新しいユーザーアカウントを作成します。
     * 
     * @param {string} email - 登録するメールアドレス
     * @param {string} password - 設定するパスワード
     * @returns {Promise} - Firebase認証操作のPromise
     */
    const signup = (email: string, password: string) => {
        return createUserWithEmailAndPassword(auth, email, password);
    };

    /**
     * メール/パスワードでのログイン
     * 
     * 既存のユーザーアカウントでログインします。
     * 
     * @param {string} email - ユーザーのメールアドレス
     * @param {string} password - ユーザーのパスワード
     * @returns {Promise} - Firebase認証操作のPromise
     */
    const login = (email: string, password: string) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    /**
     * Googleアカウントでのログイン
     * 
     * Googleのポップアップ認証を使用してログインします。
     * ユーザーは自分のGoogleアカウントを選択してログインできます。
     * 
     * @returns {Promise} - Firebase認証操作のPromise
     */
    const loginWithGoogle = () => {
        return signInWithPopup(auth, googleProvider);
    };

    /**
     * ログアウト処理
     * 
     * 現在ログインしているユーザーをログアウトさせます。
     * 
     * @returns {Promise} - Firebase認証操作のPromise
     */
    const logout = () => {
        return signOut(auth);
    };

    /**
     * 認証状態の監視
     * 
     * コンポーネントのマウント時に認証状態の監視を開始し、
     * ユーザーのログイン状態が変わるたびに自動的に状態を更新します。
     * アンマウント時に監視を解除します。
     */
    useEffect(() => {
        // Firebase認証の状態変化を監視する関数をセット
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user); // ユーザー情報を更新
            setLoading(false);    // 読み込み完了フラグをセット
        });

        // コンポーネントのクリーンアップ時に監視を解除
        return unsubscribe;
    }, []);

    // コンテキストで提供する値をまとめる
    const value = {
        currentUser,
        loading,
        login,
        signup,
        loginWithGoogle,
        logout,
    };

    return (
        // 認証情報をアプリ全体に提供
        // ローディング中は子コンポーネントをレンダリングしない
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
