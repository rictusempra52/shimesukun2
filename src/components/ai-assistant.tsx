"use client";

/**
 * 最小限のAIアシスタントコンポーネント
 * ビルドエラーを診断するために単純化
 */
import React from "react";

// プロパティ型定義
interface AiAssistantProps {
    documentId?: string;
    documentTitle?: string;
}

// シンプル化したコンポーネント
export function AiAssistant(props: AiAssistantProps) {
    return (
        <p>AIアシスタント（デバッグ用の単純化バージョン）</p>
    );
}
