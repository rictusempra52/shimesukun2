import { db } from '@/lib/firebase/admin-config';
import DocumentList from '@/components/document-list';

// サーバーコンポーネントでデータを取得
export default async function DocumentsPage() {
    // サーバーサイドでFirebaseからデータ取得
    const snapshot = await db.collection('documents').get();
    const documents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    // クライアントコンポーネントにデータを渡す
    return <DocumentList initialDocuments={documents} />;
}
