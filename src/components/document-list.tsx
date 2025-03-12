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

// サンプルデータ - 実際の実装ではAPIから取得するか、サーバーコンポーネントでデータを渡す
export const documents = [
  {
    id: 1,
    title: "管理組合総会議事録",
    building: "グランドパレス東京",
    type: "PDF",
    uploadedAt: "2023-12-15",
    tags: ["議事録", "総会"],
    description: "2023年度第2回管理組合総会の議事録です。主な議題は大規模修繕計画と予算承認について。",
    uploadedBy: {
      name: "田中太郎",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "TT",
    },
    fileSize: "1.2 MB",
    pages: 5,
    previewUrl: "/placeholder.svg?height=500&width=400",
    relatedDocuments: [
      { id: 2, title: "修繕工事見積書" },
      { id: 5, title: "エレベーター保守点検報告書" },
    ],
  },
  {
    id: 2,
    title: "修繕工事見積書",
    building: "サンシャインマンション",
    type: "PDF",
    uploadedAt: "2023-12-10",
    tags: ["見積書", "修繕"],
    description: "外壁塗装および防水工事の見積書です。3社の相見積もりの中から最も安価な業者を選定しました。",
    uploadedBy: {
      name: "佐藤花子",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "SH",
    },
    fileSize: "3.5 MB",
    pages: 12,
    previewUrl: "/placeholder.svg?height=500&width=400",
    relatedDocuments: [{ id: 1, title: "管理組合総会議事録" }],
  },
  {
    id: 3,
    title: "消防設備点検報告書",
    building: "パークハイツ横浜",
    type: "PDF",
    uploadedAt: "2023-12-05",
    tags: ["点検", "消防"],
    description: "年次消防設備点検の報告書です。スプリンクラーシステムの一部に不具合が見つかり、修理が必要です。",
    uploadedBy: {
      name: "鈴木一郎",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "SI",
    },
    fileSize: "2.8 MB",
    pages: 8,
    previewUrl: "/placeholder.svg?height=500&width=400",
    relatedDocuments: [],
  },
  {
    id: 4,
    title: "駐車場利用規約",
    building: "リバーサイドタワー大阪",
    type: "PDF",
    uploadedAt: "2023-11-28",
    tags: ["規約", "駐車場"],
    description: "駐車場の利用に関する新しい規約です。料金体系の変更と来客用駐車スペースの利用方法が更新されています。",
    uploadedBy: {
      name: "山田健太",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "YK",
    },
    fileSize: "0.9 MB",
    pages: 3,
    previewUrl: "/placeholder.svg?height=500&width=400",
    relatedDocuments: [],
  },
  {
    id: 5,
    title: "エレベーター保守点検報告書",
    building: "グリーンヒルズ札幌",
    type: "PDF",
    uploadedAt: "2023-11-20",
    tags: ["点検", "エレベーター"],
    description:
      "定期エレベーター保守点検の報告書です。特に問題は見つかりませんでしたが、次回の定期交換部品についての案内が含まれています。",
    uploadedBy: {
      name: "高橋恵子",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "TK",
    },
    fileSize: "1.7 MB",
    pages: 6,
    previewUrl: "/placeholder.svg?height=500&width=400",
    relatedDocuments: [{ id: 1, title: "管理組合総会議事録" }],
  },
]

interface DocumentListProps {
  searchQuery?: string
}

export function DocumentList({ searchQuery = "" }: DocumentListProps) {
  const router = useRouter()
  const [buildingFilter, setBuildingFilter] = useState<string>("")
  const [typeFilter, setTypeFilter] = useState<string>("")
  const [localSearchQuery, setLocalSearchQuery] = useState<string>(searchQuery)
  const [viewMode, setViewMode] = useState<"table" | "card">("table")

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
        <div className="flex-1">
          <Input
            placeholder="キーワードで検索..."
            value={localSearchQuery || searchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="w-full"
            icon={Search}
          />
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

