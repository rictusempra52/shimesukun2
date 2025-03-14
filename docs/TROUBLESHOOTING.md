# シメスくんのトラブルシューティングガイド

このドキュメントでは、シメスくん開発中によく遭遇する問題とその解決策をまとめています。

## Next.js 関連の問題

### エラー: You are attempting to export "metadata" from a component marked with "use client"

**問題**:
クライアントコンポーネント（`"use client"` ディレクティブがある）からメタデータをエクスポートしようとしています。

**解決策**:

1. コンポーネントを 2 つに分割します:
   - サーバーコンポーネント (`layout.tsx`) - メタデータを提供
   - クライアントコンポーネント (`client-layout.tsx`) - クライアント機能を提供

```tsx
// layout.tsx (サーバーコンポーネント)
export const metadata = { ... }

export default function Layout({ children }) {
  return <ClientLayout>{children}</ClientLayout>
}

// client-layout.tsx (クライアントコンポーネント)
"use client"
export function ClientLayout({ children }) {
  // クライアント側の機能
}
```

### エラー: Minified React error #310 (React Hooks のルール違反)

**問題**:
React Hooks が条件付きで使用されているか、コンポーネントのトップレベルでない場所で使用されています。

**解決策**:

1. すべての Hooks をコンポーネントのトップレベルで呼び出します
2. 条件付きでフックを使用している場合、ロジックを修正します

```tsx
// 誤った使用法
function Component() {
  const [isClient, setIsClient] = useState(false);

  // ❌ 条件付きでフックを使用
  let auth;
  if (isClient) {
    auth = useAuth();
  }

  // ...
}

// 正しい使用法
function Component() {
  const [isClient, setIsClient] = useState(false);

  // ✅ トップレベルでフックを呼び出し
  const auth = useAuth();

  // 条件付きでフックの結果を使用するのはOK
  useEffect(() => {
    if (isClient && auth) {
      // ...
    }
  }, [isClient, auth]);

  // ...
}
```

## Firebase 関連の問題

### エラー: Firebase is not initialized

**問題**:
Firebase の初期化が適切に行われていないか、環境変数が設定されていません。

**解決策**:

1. `.env.local` ファイルに必要な環境変数が設定されているか確認します
2. 環境変数名が `NEXT_PUBLIC_` プレフィックスで始まっていることを確認します
3. `firebase.ts` での初期化コードを確認します
4. クライアントサイドでのみ初期化が行われているか確認します

### エラー: Firebase Authentication failed

**問題**:
認証プロセスが失敗しています。

**解決策**:

1. Firebase Console で認証方式が有効になっていることを確認します
2. デプロイ環境のドメインが Firebase の承認済みドメインに追加されているか確認します
3. Network タブで API リクエストのエラーを確認します
4. タイムアウト処理を実装して、応答がない場合にユーザーに通知します

## クライアント/サーバーコンポーネントの問題

### エラー: "Component cannot be used as a Client Component"

**問題**:
サーバーコンポーネントが必要とするコンポーネントをクライアントコンポーネントでインポートしています。

**解決策**:

1. コンポーネントを適切に分離します
2. サーバーコンポーネントとクライアントコンポーネントの境界を明確にします
3. データフェッチはサーバーコンポーネントで行い、UI の状態管理はクライアントコンポーネントで行います

## パフォーマンス問題

### 問題: ページの初期読み込みが遅い

**解決策**:

1. コンポーネントの不要な再レンダリングを減らします
2. 大きなライブラリは動的インポートを使用します
3. 画像を最適化します（Next.js の`Image`コンポーネントを使用）
4. ルートセグメントをコンポーネント化して必要なものだけを再レンダリングします

## ヘルプとサポート

さらに質問がある場合は、以下のリソースを参照してください：

- [Next.js ドキュメント](https://nextjs.org/docs)
- [Firebase ドキュメント](https://firebase.google.com/docs)
- [React Hooks ルール](https://reactjs.org/docs/hooks-rules.html)
