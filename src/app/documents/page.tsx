import DifyDocumentSearch from '@/components/dify-document-search';

/**
 * 書類を探すページコンポーネント
 * Dify ナレッジAPIを使用して書類を検索する機能を提供
 */
export default function DocumentsPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">書類を探す</h1>

            {/* Dify ナレッジAPIによる書類検索 */}
            <DifyDocumentSearch />
        </div>
    );
}
