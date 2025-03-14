# シメスくんのデプロイ手順

このドキュメントでは、シメスくんアプリケーションを Vercel にデプロイする方法について説明します。

## 前提条件

- [Vercel アカウント](https://vercel.com/signup)
- [GitHub アカウント](https://github.com/join)
- [Firebase プロジェクト](https://console.firebase.google.com/)

## デプロイ手順

### 1. 環境変数の準備

Firebase プロジェクトの設定から必要な情報を取得し、以下の環境変数を準備します。

```
NEXT_PUBLIC_FIREBASE_API_KEY=xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_APP_ID=1:xxxxxxxxxxxx:web:xxxxxxxxxxxx
```

### 2. Vercel でのデプロイ

1. [Vercel Dashboard](https://vercel.com/dashboard)にログインします
2. 「New Project」をクリックします
3. GitHub からリポジトリをインポートします
4. 「Environment Variables」セクションで、上記の環境変数を追加します
5. 「Deploy」ボタンをクリックしてデプロイを開始します

### 3. デプロイ後の設定

1. **Firebase 認証の設定**:

   - Firebase Console で「Authentication」→「Sign-in method」を開きます
   - 「承認済みドメイン」に Vercel のドメイン（例: `your-app.vercel.app`）を追加します

2. **Firebase セキュリティルールの確認**:
   - Firestore、Storage のセキュリティルールが適切に設定されていることを確認します

## 一般的な問題と解決策

### 環境変数関連のエラー

**症状**: 「Firebase is not initialized」などのエラーが表示される

**解決策**:

- Vercel のプロジェクト設定で環境変数が正しく設定されているか確認します
- 特に`NEXT_PUBLIC_`プレフィックスが付いているか確認します

### 認証エラー

**症状**: ログインは成功するが、すぐにログイン画面にリダイレクトされる

**解決策**:

- Firebase Console で Vercel ドメインが承認済みドメインに追加されているか確認します
- ブラウザの Cookie とローカルストレージをクリアしてみます

### React/Next.js に関するエラー

**症状**: ビルドエラーが発生する

**解決策**:

1. クライアントコンポーネントとサーバーコンポーネントの混在を確認します

   - サーバーコンポーネント(`layout.tsx`)からメタデータのみをエクスポート
   - クライアント機能は別ファイル(`client-layout.tsx`)に分離

2. React Hooks のルール違反を確認します
   - Hooks は常にコンポーネントのトップレベルで呼び出す
   - 条件付きでフックを呼び出さない

## 継続的デプロイ

GitHub リポジトリと Vercel を連携することで、main ブランチへのプッシュごとに自動的にデプロイが実行されます。
