import { Metadata } from 'next'
import { DocumentViewer } from './document-viewer'
import { getDocumentById } from '@/lib/data/documents'
import { cookies } from "next/headers";
import { Document } from '@/types/document'

type Props = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

// サーバーサイドでドキュメントを取得する関数
async function getDocument(id: string): Promise<Document | null> {
  // クッキーからデータソース設定を取得
  const cookieStore = await cookies();
  const dataSource = cookieStore.get('dataSource')?.value as 'firebase' | 'mock' || 'firebase';

  return await getDocumentById(id, dataSource);
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
