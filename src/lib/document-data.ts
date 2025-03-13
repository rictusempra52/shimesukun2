// ドキュメントデータを共通ライブラリとして提供します
// このファイルはサーバーコンポーネントとクライアントコンポーネントの両方からアクセス可能です

export const documentsData = [
  {
    id: 1,
    title: "管理組合総会議事録",
    building: "グランドパレス東京",
    type: "PDF",
    uploadedAt: "2023-12-15",
    tags: ["議事録", "総会"],
    description:
      "2023年度第2回管理組合総会の議事録です。主な議題は大規模修繕計画と予算承認について。",
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
    description:
      "外壁塗装および防水工事の見積書です。3社の相見積もりの中から最も安価な業者を選定しました。",
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
    description:
      "年次消防設備点検の報告書です。スプリンクラーシステムの一部に不具合が見つかり、修理が必要です。",
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
    description:
      "駐車場の利用に関する新しい規約です。料金体系の変更と来客用駐車スペースの利用方法が更新されています。",
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
];
