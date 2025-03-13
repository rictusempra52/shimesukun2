import { Metadata } from 'next'
import { DocumentViewer } from './document-viewer'
import { db } from '@/lib/firebase/admin-config'
import { Document } from '@/types/document'

type Props = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

// サーバーサイドでドキュメントを取得する関数
async function getDocument(id: string): Promise<Document | null> {
  try {
    const docRef = db.collection('documents').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data() as Omit<Document, 'id'>
    };
  } catch (error) {
    console.error("ドキュメント取得エラー:", error);
    return null;
  }
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { id } = params
  const document = await getDocument(id)

  return {
    title: document ? `${document.title} - 書類管理システム` : '書類が見つかりません',
    description: document?.description || '指定された書類は存在しないか、アクセス権限がありません。',
  }
}

export default async function DocumentPage({
  params,
  searchParams
}: Props) {
  const { id } = params
  const document = await getDocument(id)

  return <DocumentViewer initialDocument={document} documentId={id} />
}
