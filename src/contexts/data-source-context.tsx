"use client"

import React, { createContext, useState, useContext, useEffect } from 'react';

// データソースの種類
export type DataSource = 'firebase' | 'mock';

// コンテキストの型定義
interface DataSourceContextType {
    dataSource: DataSource;
    setDataSource: (source: DataSource) => void;
}

// コンテキストの作成
const DataSourceContext = createContext<DataSourceContextType | undefined>(undefined);

/**
 * データソースプロバイダー
 * アプリ全体でデータソース設定を共有するためのプロバイダーコンポーネント
 */
export function DataSourceProvider({ children }: { children: React.ReactNode }) {
    // ローカルストレージから初期値を取得（デフォルトはfirebase）
    const [dataSource, setDataSourceState] = useState<DataSource>('firebase');

    // 初回レンダリング時にローカルストレージから設定を読み込み
    useEffect(() => {
        const savedSource = localStorage.getItem('dataSource') as DataSource;
        if (savedSource && (savedSource === 'firebase' || savedSource === 'mock')) {
            setDataSourceState(savedSource);
        }
    }, []);

    // データソースを変更して設定を保存する関数
    const setDataSource = (source: DataSource) => {
        setDataSourceState(source);
        localStorage.setItem('dataSource', source);
    };

    return (
        <DataSourceContext.Provider value={{ dataSource, setDataSource }}>
            {children}
        </DataSourceContext.Provider>
    );
}

/**
 * データソース設定を利用するためのカスタムフック
 */
export function useDataSource() {
    const context = useContext(DataSourceContext);
    if (context === undefined) {
        throw new Error('useDataSource must be used within a DataSourceProvider');
    }
    return context;
}
