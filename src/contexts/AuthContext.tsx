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
    initError: string | null;      // 初期化エラーの状態
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
 * アプリケーション全体に認証機能を提供するラッパーコンポーネントです。
 * 
 * @param {object} props - コンポーネントのプロパティ
 * @param {ReactNode} props.children - 子コンポーネント
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
    // 現在のユーザー状態を管理
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    // 認証状態の読み込み中かどうかのフラグ
    const [loading, setLoading] = useState(true);
    // 初期化エラーの状態
    const [initError, setInitError] = useState<string | null>(null);

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
        console.log('AuthProvider: 認証状態の監視を開始します');

        try {
            // Firebase認証の状態変化を監視する関数をセット
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                console.log('AuthProvider: 認証状態が変更されました', user ? `ユーザーID: ${user.uid}` : 'ユーザーなし');
                setCurrentUser(user); // ユーザー情報を更新
                setLoading(false);    // 読み込み完了フラグをセット
            }, (error) => {
                console.error('AuthProvider: 認証状態の監視中にエラーが発生しました', error);
                setInitError(error.message);
                setLoading(false);
            });

            // コンポーネントのクリーンアップ時に監視を解除
            return () => {
                console.log('AuthProvider: 認証状態の監視を解除します');
                unsubscribe();
            };
        } catch (error) {
            console.error('AuthProvider: 認証初期化エラー', error);
            setInitError(error instanceof Error ? error.message : '認証の初期化に失敗しました');
            setLoading(false);
        }
    }, []);

    // コンテキストで提供する値をまとめる
    const value = {
        currentUser,
        loading,
        initError,
        login,
        signup,
        loginWithGoogle,
        logout,
    };

    return (
        // 認証情報をアプリ全体に提供
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
