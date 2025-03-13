import { getAllDocuments } from '@/lib/data/documents';
import { DocumentList } from '@/components/document-list';
import { cookies } from "next/headers";

// サーバーコンポーネントでデータを取得
export default async function DocumentsPage() {
    // クッキーからデータソース設定を取得（デフォルトはfirebase）
    const cookieStore = await cookies();  // awaitを追加
    const dataSource = cookieStore.get('dataSource')?.value as 'firebase' | 'mock' || 'firebase';

    // 統一インターフェースでデータを取得
    const documents = await getAllDocuments(dataSource);

    // クライアントコンポーネントにデータを渡す
    return <DocumentList initialDocuments={documents} />;
}
