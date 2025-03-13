import { Metadata } from 'next'
import { DocumentViewer } from './document-viewer'
import { documentsData } from "@/lib/document-data" // 新しい共通ライブラリからインポート

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function getDocument(id: string) {
  const docId = Number.parseInt(id)
  const doc = documentsData.find((doc) => doc.id === docId)
  return doc || null
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
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
  const { id } = await params
  const document = await getDocument(id)

  return <DocumentViewer initialDocument={document} documentId={id} />
}
