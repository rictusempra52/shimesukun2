# シメスくんのデプロイ手順

## 目次

1. [環境要件](#環境要件)
2. [環境変数の準備](#環境変数の準備)
3. [セットアップ手順](#セットアップ手順)
4. [Firebase の設定](#firebase-の設定)
5. [Dify API の設定](#dify-api-の設定)
6. [本番環境へのデプロイ](#本番環境へのデプロイ)
7. [一般的な問題と解決策](#一般的な問題と解決策)

## 環境要件

- Node.js 18.x 以上
- npm または yarn
- Firebase プロジェクト
- Dify アカウントとAPI設定

## 環境変数の準備

Firebase プロジェクトと Dify の設定から必要な情報を取得し、以下の環境変数を準備します。

```
# Firebase関連
NEXT_PUBLIC_FIREBASE_API_KEY=xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_APP_ID=1:xxxxxxxxxxxx:web:xxxxxxxxxxxx

# Dify API関連
DIFY_API_KEY=your-dify-api-key
DIFY_API_ENDPOINT=https://api.dify.ai/v1 # または自己ホスティングのエンドポイント
```

## セットアップ手順

1. **リポジトリをクローン:**

```bash
git clone https://github.com/yourusername/shimesukun.git
cd shimesukun
```

2. **依存関係のインストール:**

```bash
npm install
# または
yarn install
```

3. **環境変数の設定:**

`.env.local` ファイルをプロジェクトのルートディレクトリに作成し、上記の環境変数を設定します。

4. **開発サーバーの起動:**

```bash
npm run dev
# または
yarn dev
```

## Firebase の設定

### 1. Firebase プロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセスし、新しいプロジェクトを作成します
2. プロジェクト名を入力し、利用規約に同意して「プロジェクトを作成」をクリックします

### 2. Firebase Authentication の有効化

1. 左側のメニューから「Authentication」を選択します
2. 「Sign-in method」タブをクリックします
3. 「メール/パスワード」と「Google」を有効にします

### 3. Firestore Database の設定

1. 左側のメニューから「Firestore Database」を選択します
2. 「データベースの作成」をクリックします
3. 「本番環境モード」または「テストモード」を選択します
4. データベースのロケーションを選択し、「作成」をクリックします

### 4. Storage の設定

1. 左側のメニューから「Storage」を選択します
2. 「開始する」をクリックします
3. セキュリティルールを設定し、「次へ」をクリックします
4. ストレージのロケーションを選択し、「完了」をクリックします

### 5. ウェブアプリの追加

1. プロジェクトの概要ページで「</>」（ウェブアプリ）アイコンをクリックします
2. アプリのニックネームを入力し、「アプリを登録」をクリックします
3. Firebase の設定情報が表示されるので、メモしておきます（環境変数に使用します）

## Dify API の設定

### 1. Dify アカウントの作成と設定

1. [Dify.ai](https://dify.ai/) にアクセスして、アカウントを作成します
   - または Dify を自己ホスティングする場合は、[GitHub リポジトリ](https://github.com/langgenius/dify)の手順に従ってインストールします

2. アカウント作成後、ダッシュボードにログインします

### 2. API キーの取得

1. Dify ダッシュボードにログインします
2. 右上のプロフィールアイコンをクリックし、「Settings」を選択します
3. API Keys の項目から「Create new API key」をクリックします
4. API キーの名前を入力し、「Create」をクリックします
5. 生成された API キーをコピーし、`.env.local` ファイルの `DIFY_API_KEY` 変数に設定します

### 3. ナレッジベースの設定

1. Dify ダッシュボードの左側メニューから「Knowledge」をクリックします
2. 「Create a Knowledge」ボタンをクリックします
3. ナレッジベースの名前と説明を入力し、「Create」をクリックします
4. 作成したナレッジベースを選択し、「Settings」タブを開きます
5. 「API Reference」セクションからナレッジベース ID をメモします（アプリケーション内で使用）

### 4. 埋め込みモデルの選択

1. ナレッジベースの「Settings」タブで「Embedding & Retrieval Model」セクションを開きます
2. 使用する埋め込みモデルを選択します（例: OpenAI embeddings）
3. 検索方法（Search Method）を設定します（推奨: hybrid_search）
4. 必要に応じて再ランキング（Reranking）を有効にします

### 5. ドキュメントのアップロード（オプション）

1. ナレッジベースの「Documents」タブを開きます
2. 「Upload Documents」ボタンをクリックします
3. ファイルをアップロードするか、テキストを入力します
4. インデックス作成方法を選択し（推奨: high_quality）、「Upload」をクリックします

## 本番環境へのデプロイ

### Vercel へのデプロイ

1. [Vercel](https://vercel.com/) にアカウント登録/ログインします
2. 「New Project」をクリックします
3. GitHub リポジトリを接続し、shimesukun リポジトリを選択します
4. 「Environment Variables」セクションで、上記の環境変数をすべて設定します
5. 「Deploy」ボタンをクリックしてデプロイを開始します

### Netlify へのデプロイ

1. [Netlify](https://www.netlify.com/) にアカウント登録/ログインします
2. 「New site from Git」をクリックします
3. GitHub を選択し、shimesukun リポジトリを選択します
4. ビルド設定を入力します:
   - Build command: `npm run build` または `yarn build`
   - Publish directory: `.next`
5. 「Advanced」セクションで環境変数を設定します
6. 「Deploy site」をクリックします

## 一般的な問題と解決策

### Firebase 認証関連のエラー

**症状**: ログインまたは登録時にエラーが表示される

**解決策**:
- Firebase コンソールで認証方法が有効になっているか確認します
- 環境変数が正しく設定されているか確認します
- Firebase のセキュリティルールを適切に設定します

### Firestore 接続エラー

**症状**: データの読み取りまたは書き込み時にエラーが表示される

**解決策**:
- Firestore セキュリティルールを確認します
- 環境変数が正しく設定されているか確認します
- コンソールでネットワークエラーを確認します

### Dify API 関連のエラー

**症状**: 「Failed to fetch data from Dify API」などのエラーが表示される

**解決策**:
- Dify API キーが正しく設定されているか確認します
- API エンドポイントが正しいか確認します
- Dify のダッシュボードでアプリケーションのステータスを確認します
- ネットワークタブでリクエスト/レスポンスを調査します

### ナレッジベース接続エラー

**症状**: ナレッジベースのコンテンツが表示されない、または検索結果が返らない

**解決策**:
- ナレッジベース ID が正しいか確認します
- API キーに十分な権限があるか確認します
- ナレッジベースにドキュメントがアップロードされているか確認します
- インデックス作成が完了しているか確認します
