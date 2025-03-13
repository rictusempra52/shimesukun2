"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Download, Eye, Search, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { documentsData } from "@/lib/document-data" // 新しい共通ライブラリからインポート

interface DocumentListProps {
  searchQuery?: string
}

export function DocumentList({ searchQuery = "" }: DocumentListProps) {
  const router = useRouter()
  const [buildingFilter, setBuildingFilter] = useState<string>("")
  const [typeFilter, setTypeFilter] = useState<string>("")
  const [localSearchQuery, setLocalSearchQuery] = useState<string>(searchQuery)
  const [viewMode, setViewMode] = useState<"table" | "card">("table")

  const documents = documentsData;

  // 検索とフィルタリングの適用
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      localSearchQuery === "" ||
      doc.title.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(localSearchQuery.toLowerCase()))

    const matchesBuilding = buildingFilter === "" || doc.building === buildingFilter

    const matchesType = typeFilter === "" || doc.type === typeFilter

    return matchesSearch && matchesBuilding && matchesType
  })

  // 画面幅を検出して表示モードを自動的に切り替え
  useEffect(() => {
    const handleResize = () => {
      setViewMode(window.innerWidth < 640 ? "card" : "table")
    }

    // 初期設定
    handleResize()

    // リサイズイベントのリスナーを追加
    window.addEventListener("resize", handleResize)

    // クリーンアップ
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // ドキュメントの詳細ページに遷移
  const navigateToDocumentDetails = (docId: number) => {
    router.push(`/documents/${docId}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Input
            placeholder="キーワードで検索..."
            value={localSearchQuery || searchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="w-full pl-10"
          />
          <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
        </div>
        <Select value={buildingFilter} onValueChange={setBuildingFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="マンション" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="グランドパレス東京">グランドパレス東京</SelectItem>
            <SelectItem value="サンシャインマンション">サンシャインマンション</SelectItem>
            <SelectItem value="パークハイツ横浜">パークハイツ横浜</SelectItem>
            <SelectItem value="リバーサイドタワー大阪">リバーサイドタワー大阪</SelectItem>
            <SelectItem value="グリーンヒルズ札幌">グリーンヒルズ札幌</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="ファイル形式" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="PDF">PDF</SelectItem>
            <SelectItem value="JPG">JPG</SelectItem>
            <SelectItem value="PNG">PNG</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {viewMode === "table" ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>タイトル</TableHead>
                <TableHead>マンション</TableHead>
                <TableHead>タグ</TableHead>
                <TableHead>アップロード日</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => (
                  <TableRow key={doc.id} className="cursor-pointer" onClick={() => navigateToDocumentDetails(doc.id)}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {doc.title}
                      </div>
                    </TableCell>
                    <TableCell>{doc.building}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {doc.tags.map((tag, i) => (
                          <Badge key={i} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{doc.uploadedAt}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigateToDocumentDetails(doc.id)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">表示</span>
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                          <span className="sr-only">ダウンロード</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    検索条件に一致する書類がありません
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDocuments.length > 0 ? (
            filteredDocuments.map((doc) => (
              <Card
                key={doc.id}
                className="overflow-hidden cursor-pointer"
                onClick={() => navigateToDocumentDetails(doc.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-medium text-sm">{doc.title}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">{doc.building}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {doc.tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">{doc.uploadedAt}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="ml-2">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">検索条件に一致する書類がありません</div>
          )}
        </div>
      )}
    </div>
  )
}
