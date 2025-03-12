"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileText, Download, Eye, ChevronLeft, Building2, Calendar, User, FileType, Tag, Clock } from "lucide-react"
import { documents } from "@/components/document-list"

export default function DocumentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [document, setDocument] = useState<(typeof documents)[0] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 実際の実装ではAPIからデータを取得する
    const docId = Number.parseInt(params.id)
    const foundDoc = documents.find((doc) => doc.id === docId)

    if (foundDoc) {
      setDocument(foundDoc)
    }

    setLoading(false)
  }, [params.id])

  // 関連書類を取得
  const getRelatedDocument = (id: number) => {
    return documents.find((doc) => doc.id === id)
  }

  // 前のページに戻る
  const goBack = () => {
    router.back()
  }

  // 別の書類に移動
  const navigateToDocument = (id: number) => {
    router.push(`/documents/${id}`)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse text-center">
            <div className="h-8 w-64 bg-muted rounded mb-4 mx-auto"></div>
            <div className="h-4 w-32 bg-muted rounded mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Button variant="ghost" onClick={goBack} className="mb-4">
          <ChevronLeft className="h-4 w-4 mr-2" />
          戻る
        </Button>
        <div className="text-center py-12">
          <h1 className="text-xl font-bold mb-2">書類が見つかりません</h1>
          <p className="text-muted-foreground">指定された書類は存在しないか、アクセス権限がありません。</p>
          <Button variant="outline" onClick={goBack} className="mt-4">
            書類一覧に戻る
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="ghost" onClick={goBack} className="mb-4">
        <ChevronLeft className="h-4 w-4 mr-2" />
        書類一覧に戻る
      </Button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{document.title}</h1>
        <div className="flex flex-wrap gap-1 mb-2">
          {document.tags.map((tag, i) => (
            <Badge key={i} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
        <p className="text-muted-foreground">{document.description}</p>
      </div>

      <Tabs defaultValue="preview" className="mt-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="preview">プレビュー</TabsTrigger>
          <TabsTrigger value="details">詳細情報</TabsTrigger>
          <TabsTrigger value="related">関連書類</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center">
                <img
                  src={document.previewUrl || "/placeholder.svg"}
                  alt={document.title}
                  className="max-w-full h-auto object-contain rounded border bg-white"
                />
                <div className="text-center mt-4 text-sm text-muted-foreground">
                  <p>
                    プレビュー: {document.title} (1/{document.pages}ページ)
                  </p>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    PDFで開く
                  </Button>
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    ダウンロード
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium">マンション</h3>
                      <p className="text-sm">{document.building}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium">アップロード日</h3>
                      <p className="text-sm">{document.uploadedAt}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium">アップロードユーザー</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={document.uploadedBy.avatar} alt={document.uploadedBy.name} />
                          <AvatarFallback>{document.uploadedBy.initials}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{document.uploadedBy.name}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <FileType className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium">ファイル情報</h3>
                      <p className="text-sm">形式: {document.type}</p>
                      <p className="text-sm">サイズ: {document.fileSize}</p>
                      <p className="text-sm">ページ数: {document.pages}ページ</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium">タグ</h3>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {document.tags.map((tag, i) => (
                          <Badge key={i} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium mb-2">説明</h3>
                <p className="text-sm">{document.description}</p>
              </div>

              <div className="mt-6 pt-6 border-t flex items-center justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>最終更新: {document.uploadedAt}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    PDFで開く
                  </Button>
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    ダウンロード
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="related" className="mt-4">
          <Card>
            <CardContent className="p-6">
              {document.relatedDocuments.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">関連書類</h3>
                  {document.relatedDocuments.map((relDoc) => {
                    const fullDoc = getRelatedDocument(relDoc.id)
                    if (!fullDoc) return null

                    return (
                      <Card
                        key={relDoc.id}
                        className="overflow-hidden cursor-pointer"
                        onClick={() => navigateToDocument(relDoc.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <h4 className="font-medium text-sm">{relDoc.title}</h4>
                                <p className="text-xs text-muted-foreground">{fullDoc.building}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-xs text-muted-foreground">{fullDoc.uploadedAt}</div>
                              <ChevronLeft className="h-4 w-4 text-muted-foreground rotate-180" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">関連書類はありません</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

