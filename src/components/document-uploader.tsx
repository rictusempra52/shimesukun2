app:
  mode: workflow
  name: フロント担当者向けマンション管理チャットボット
  version: 1.0.0

workflow:
  graph:
    edges:
      - source: start_node
        target: question_classifier_node
        data:
          sourceType: start
          targetType: question_classifier
      - source: question_classifier_node
        target: data_retrieval_node
        data:
          sourceType: question_classifier
          targetType: data_retrieval
          sourceHandle: '区分所有法'  # 例：区分所有法に関する質問
      - source: question_classifier_node
        target: case_analysis_node
        data:
          sourceType: question_classifier
          targetType: case_analysis
          sourceHandle: '事例'  # 例：過去の事例に関する質問
      - source: data_retrieval_node
        target: llm_node
        data:
          sourceType: data_retrieval
          targetType: llm
      - source: case_analysis_node
        target: llm_node
        data:
          sourceType: case_analysis
          targetType: llm
      - source: llm_node
        target: response_node
        data:
          sourceType: llm
          targetType: response


    nodes:
      start_node:
        id: start_node_id
        type: start
        variables:
          - type: text-input
            variable: user_question
            label: 質問内容
            required: true
            max_length: 500
      question_classifier_node:
        id: question_classifier_node_id
        type: question_classifier
        data:
          title: 質問分類
          model:
            provider: openai
            name: gpt-3.5-turbo
            mode: chat
            completion_params:
              temperature: 0.7
          query_variable_selector:
            - start_node_id
            - user_question
          classes:
            - id: '区分所有法'
              name: 区分所有法
            - id: '事例'
              name: 事例
            - id: '実務'
              name: 管理実務
            - id: 'その他'
              name: その他
      data_retrieval_node:
        id: data_retrieval_node_id
        type: data_retrieval
        data:
          title: 法令データ取得
          dataset_ids:
            - civil_code
            - property_law
          query_variable_selector:
            - question_classifier_node_id
            - class_id
          output_variable: legal_documents
      case_analysis_node:
        id: case_analysis_node_id
        type: case_analysis
        data:
          title: 事例分析
          dataset_ids:
            - case_studies
          query_variable_selector:
            - question_classifier_node_id
            - class_id
          output_variable: case_details
      llm_node:
        id: llm_node_id
        type: llm
        data:
          title: 回答生成
          model:
            provider: openai
            name: gpt-3.5-turbo
            mode: chat
            completion_params:
              temperature: 0.7
          prompt_template:
            - role: system
              text: |
                以下の質問に対する回答を、法的・実務的な観点から生成してください。法的根拠を示せる場合は、法令の条文も明記してください。示せない場合はその旨を明記し、信頼できる情報源を参考に説明してください。
                質問: {{#user_question#}}
                法令情報: {{#legal_documents#}}
                事例情報: {{#case_details#}}
          context:
            enabled: true
            variable_selector:
              - data_retrieval_node_id
              - legal_documents
              - case_analysis_node_id
              - case_details
      response_node:
        id: response_node_id
        type: response
        data:
          title: 回答出力
          outputs:
            - variable: response_text
              value_selector:
                - llm_node_id
                - generated_text
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { FileUp, Upload, Check, AlertCircle, Sparkles, Database, FileText } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getKnowledgeBasesFromClient, uploadDocumentToKnowledgeBase, analyzeDocumentWithAI } from "@/lib/dify/browser"
import { Badge } from "@/components/ui/badge"

export function DocumentUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [building, setBuilding] = useState("")
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isProcessingOcr, setIsProcessingOcr] = useState(false)

  // Difyナレッジベース関連の状態
  const [knowledgeBases, setKnowledgeBases] = useState<Array<{ id: string; name: string }>>([])
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState("")
  const [isLoadingKnowledgeBases, setIsLoadingKnowledgeBases] = useState(false)

  // AI提案用の状態
  const [suggestedTitle, setSuggestedTitle] = useState<string | null>(null)
  const [suggestedBuilding, setSuggestedBuilding] = useState<string | null>(null)
  const [suggestedDescription, setSuggestedDescription] = useState<string | null>(null)

  // Gemini変換関連の状態
  const [markdownChunks, setMarkdownChunks] = useState<string[]>([])
  const [isConvertingToMarkdown, setIsConvertingToMarkdown] = useState(false)
  const [conversionComplete, setConversionComplete] = useState(false)
  const [conversionProgress, setConversionProgress] = useState(0)
  const [useGeminiOCR, setUseGeminiOCR] = useState(false)

  // コンポーネント初期化時にナレッジベース一覧を取得
  useEffect(() => {
    async function fetchKnowledgeBases() {
      try {
        setIsLoadingKnowledgeBases(true)
        const result = await getKnowledgeBasesFromClient()
        if (result.data) {
          setKnowledgeBases(
            result.data.map((kb: any) => ({
              id: kb.id,
              name: kb.name,
            }))
          )
          // デフォルト値を設定（最初のナレッジベース）
          if (result.data.length > 0) {
            setSelectedKnowledgeBase(result.data[0].id)
          }
        }
      } catch (err: any) {
        console.error("ナレッジベース取得エラー:", err)
        setError("ナレッジベース一覧の取得に失敗しました: " + (err.message || "不明なエラー"))
      } finally {
        setIsLoadingKnowledgeBases(false)
      }
    }

    fetchKnowledgeBases()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("ファイルサイズは10MB以下にしてください")
        return
      }

      const fileType = selectedFile.type
      if (fileType !== "application/pdf" && fileType !== "image/jpeg" && fileType !== "image/png") {
        setError("PDF、JPG、PNG形式のファイルのみアップロード可能です")
        return
      }

      setFile(selectedFile)
      setError(null)

      // OCR処理とAIによる各種提案を開始
      processOcrAndSuggestMetadata(selectedFile)
    }
  }

  const processOcrAndSuggestMetadata = async (file: File) => {
    setIsProcessingOcr(true)
    setError(null)

    try {
      // Dify AIを使用してドキュメントを分析
      const aiAnalysisResult = await analyzeDocumentWithAI(file)

      console.log("AI分析が完了しました:", aiAnalysisResult)

      // 分析結果からメタデータ提案を設定
      if (aiAnalysisResult.title) {
        setSuggestedTitle(aiAnalysisResult.title)
      }

      if (aiAnalysisResult.building) {
        setSuggestedBuilding(aiAnalysisResult.building)
      }

      if (aiAnalysisResult.description) {
        setSuggestedDescription(aiAnalysisResult.description)

        // 既存の説明があれば、AIによる提案で自動置換
        if (description) {
          setDescription(aiAnalysisResult.description)
          setSuggestedDescription(null) // 提案を適用したのでクリア
        }
      }

      // 提案がない場合のフォールバック処理
      if (!aiAnalysisResult.title && !aiAnalysisResult.building && !aiAnalysisResult.description) {
        console.warn("AIからの提案が得られませんでした。フォールバックを使用します。")

        // ファイル名から拡張子を除いたものをベースにタイトルを提案
        const baseName = file.name.replace(/\.[^/.]+$/, "")
        setSuggestedTitle(`${baseName} （文書）`)

        // 説明のフォールバック
        const fallbackDescription = `${baseName}に関する文書です。内容の詳細は本文をご確認ください。`
        setSuggestedDescription(fallbackDescription)

        // 既存の説明があれば、フォールバックの説明で自動置換
        if (description) {
          setDescription(fallbackDescription)
          setSuggestedDescription(null) // 提案を適用したのでクリア
        }
      }
    } catch (err: any) {
      console.error("AI分析エラー:", err)
      setError(`AI分析中にエラーが発生しました: ${err.message || "不明なエラー"}`)

      // エラー時はフォールバック提案を設定
      const baseName = file.name.replace(/\.[^/.]+$/, "")
      setSuggestedTitle(`${baseName}`)
    } finally {
      setIsProcessingOcr(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setError("ファイルを選択してください")
      return
    }

    if (!title) {
      setError("タイトルを入力してください")
      return
    }

    if (!building) {
      setError("マンションを選択してください")
      return
    }

    if (!selectedKnowledgeBase) {
      setError("ナレッジベースを選択してください")
      return
    }

    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      // メタデータの準備
      const metadata = {
        title,
        building,
        description,
        uploadedAt: new Date().toISOString(),
        buildingName: {
          building1: "グランドパレス東京",
          building2: "サンシャインマンション",
          building3: "パークハイツ横浜",
          building4: "リバーサイドタワー大阪",
          building5: "グリーンヒルズ札幌",
        }[building] || "",
      }

      // 進捗表示開始
      let progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            return 90 // 90%で停止（API完了を待つ）
          }
          return prev + 5
        })
      }, 300)

      // Difyのナレッジベースにファイルをアップロード
      const uploadResult = await uploadDocumentToKnowledgeBase(selectedKnowledgeBase, file, metadata)

      console.log("Difyアップロード結果:", uploadResult)

      // 進捗を100%に設定
      clearInterval(progressInterval)
      setProgress(100)

      // 成功状態に設定
      setTimeout(() => {
        setUploading(false)
        setSuccess(true)
      }, 500)
    } catch (err: any) {
      setError(err.message || "アップロード中にエラーが発生しました")
      setUploading(false)
      console.error("Difyアップロードエラー:", err)
    }
  }

  const resetForm = () => {
    setFile(null)
    setTitle("")
    setDescription("")
    setBuilding("")
    setSuccess(false)
    setError(null)
    setSuggestedTitle(null)
    setSuggestedBuilding(null)
    setSuggestedDescription(null)
    setIsProcessingOcr(false)
    setMarkdownChunks([])
    setConversionComplete(false)
    setConversionProgress(0)
    setUseGeminiOCR(false)
  }

  // 全ての提案を一括で適用する
  const applyAllSuggestions = () => {
    if (suggestedTitle) setTitle(suggestedTitle)
    if (suggestedBuilding) setBuilding(suggestedBuilding)
    if (suggestedDescription) setDescription(suggestedDescription)

    // 提案をクリア
    setSuggestedTitle(null)
    setSuggestedBuilding(null)
    setSuggestedDescription(null)
  }

  // Gemini PDF→Markdown変換処理
  const handleGeminiConversion = async () => {
    // クライアントサイドでのみ実行可能
    if (typeof window === "undefined") {
      setError("この機能はブラウザ環境でのみ使用できます");
      return;
    }

    if (!file || file.type !== "application/pdf") {
      setError("PDFファイルを選択してください");
      return;
    }

    setIsConvertingToMarkdown(true);
    setConversionProgress(0);
    setError(null);
    setMarkdownChunks([]); // 前回の結果をクリア
    setConversionComplete(false);

    try {
      // 動的インポートを使用してクライアントサイドでのみモジュールを読み込む
      const { processPDFToMarkdown } = await import("@/lib/pdf-utils");

      // PDFをMarkdownに変換（進捗状況を受け取るコールバックを渡す）
      const result = await processPDFToMarkdown(file, (progress) => {
        setConversionProgress(progress);
      });

      // 結果を保存
      setMarkdownChunks(result);
      setConversionComplete(true);

      // 変換結果をメタデータに適用
      if (result.length > 0) {
        // 最初のチャンクから概要を生成
        const firstChunk = result[0].substring(0, 100) + "...";
        if (!description) {
          setDescription(firstChunk);
        } else {
          setSuggestedDescription(firstChunk);
        }
      }
    } catch (err: any) {
      console.error("Gemini変換エラー:", err);
      setError(`Gemini変換中にエラーが発生しました: ${err.message || "不明なエラー"}`);
    } finally {
      setIsConvertingToMarkdown(false);
    }
  };

  if (success) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <Check className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">アップロード完了</AlertTitle>
        <AlertDescription className="text-green-700">
          書類が正常にアップロードされました。OCRによるテキスト抽出が完了次第、検索可能になります。
        </AlertDescription>
        <Button onClick={resetForm} className="mt-4">
          新しい書類をアップロード
        </Button>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>エラー</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="file">ファイル選択</Label>
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("file")?.click()}
            className="w-full h-24 border-dashed flex flex-col items-center justify-center gap-2"
          >
            <FileUp className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{file ? file.name : "クリックしてファイルを選択"}</span>
          </Button>
          <Input id="file" type="file" onChange={handleFileChange} className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
        </div>
        <p className="text-xs text-muted-foreground">PDF、JPG、PNG形式のファイル（最大10MB）</p>
      </div>

      {/* ナレッジベース選択UI */}
      <div className="space-y-2">
        <Label htmlFor="knowledgeBase">ナレッジベース</Label>
        <div className="space-y-2">
          <Select
            value={selectedKnowledgeBase}
            onValueChange={setSelectedKnowledgeBase}
            required
            disabled={isProcessingOcr || isLoadingKnowledgeBases}
          >
            <SelectTrigger>
              <SelectValue placeholder="ナレッジベースを選択" />
            </SelectTrigger>
            <SelectContent>
              {isLoadingKnowledgeBases ? (
                <SelectItem value="loading" disabled>
                  読み込み中...
                </SelectItem>
              ) : knowledgeBases.length === 0 ? (
                <SelectItem value="none" disabled>
                  ナレッジベースがありません
                </SelectItem>
              ) : (
                knowledgeBases.map((kb) => (
                  <SelectItem key={kb.id} value={kb.id}>
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      {kb.name}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isProcessingOcr && (
        <Alert className="bg-blue-50 border-blue-200">
          <div className="flex items-center">
            <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-blue-500 mr-2"></span>
            <AlertTitle className="text-blue-800">OCRとAI分析中...</AlertTitle>
          </div>
          <AlertDescription className="text-blue-700">
            アップロードされた書類を分析しています。タイトル、マンション、説明の提案を生成中です。
          </AlertDescription>
        </Alert>
      )}

      {(suggestedTitle || suggestedBuilding || suggestedDescription) && !isProcessingOcr && (
        <Alert className="bg-purple-50 border-purple-200">
          <Sparkles className="h-4 w-4 text-purple-600" />
          <AlertTitle className="text-purple-800">AI提案が利用可能です</AlertTitle>
          <AlertDescription className="text-purple-700">
            OCR結果に基づいて、以下のメタデータが提案されました。
          </AlertDescription>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2 bg-purple-100 hover:bg-purple-200 border-purple-300"
            onClick={applyAllSuggestions}
          >
            <Sparkles className="h-3 w-3 mr-2" />
            すべての提案を適用
          </Button>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">タイトル</Label>
        <div className="space-y-2">
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="書類のタイトルを入力"
            required
            disabled={isProcessingOcr}
          />
          {suggestedTitle && !isProcessingOcr && (
            <div className="text-sm p-2 border rounded bg-muted/50">
              <div className="flex items-center justify-between">
                <p className="text-blue-600">{suggestedTitle}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTitle(suggestedTitle)
                    setSuggestedTitle(null)
                  }}
                >
                  採用する
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="building">マンション</Label>
        <div className="space-y-2">
          <Select value={building} onValueChange={setBuilding} required disabled={isProcessingOcr}>
            <SelectTrigger>
              <SelectValue placeholder="マンションを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="building1">グランドパレス東京</SelectItem>
              <SelectItem value="building2">サンシャインマンション</SelectItem>
              <SelectItem value="building3">パークハイツ横浜</SelectItem>
              <SelectItem value="building4">リバーサイドタワー大阪</SelectItem>
              <SelectItem value="building5">グリーンヒルズ札幌</SelectItem>
            </SelectContent>
          </Select>
          {suggestedBuilding && !isProcessingOcr && (
            <div className="text-sm p-2 border rounded bg-muted/50">
              <div className="flex items-center justify-between">
                <p className="text-blue-600">
                  {suggestedBuilding === "building1" && "グランドパレス東京"}
                  {suggestedBuilding === "building2" && "サンシャインマンション"}
                  {suggestedBuilding === "building3" && "パークハイツ横浜"}
                  {suggestedBuilding === "building4" && "リバーサイドタワー大阪"}
                  {suggestedBuilding === "building5" && "グリーンヒルズ札幌"}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBuilding(suggestedBuilding)
                    setSuggestedBuilding(null)
                  }}
                >
                  採用する
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">説明（任意）</Label>
        <div className="space-y-2">
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="ファイルをアップロードすると、AIが自動で内容の説明を生成します（100字以内）"
            rows={3}
            disabled={isProcessingOcr}
            className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          />
          {suggestedDescription && !isProcessingOcr && (
            <div className="text-sm p-2 border rounded bg-muted/50">
              <div className="flex items-center justify-between">
                <p className="text-blue-600">{suggestedDescription}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDescription(suggestedDescription)
                    setSuggestedDescription(null)
                  }}
                >
                  採用する
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>アップロード中...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {file && file.type === "application/pdf" && (
        <div className="space-y-2">
          <Label htmlFor="geminiConversion">Gemini PDF→Markdown変換</Label>
          <Button
            type="button"
            onClick={handleGeminiConversion}
            disabled={isConvertingToMarkdown}
            className="w-full"
          >
            {isConvertingToMarkdown ? (
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4 animate-pulse" />
                変換中...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Markdownに変換
              </span>
            )}
          </Button>
          {isConvertingToMarkdown && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>変換中...</span>
                <span>{conversionProgress}%</span>
              </div>
              <Progress value={conversionProgress} className="h-2" />
            </div>
          )}
          {conversionComplete && (
            <div className="space-y-2">
              <Label>変換結果</Label>
              <div className="space-y-2">
                {markdownChunks.map((chunk, index) => (
                  <Badge key={index} className="block w-full text-left">
                    {chunk}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Button
        type="submit"
        disabled={uploading || isProcessingOcr || !selectedKnowledgeBase || isLoadingKnowledgeBases}
        className="w-full"
      >
        {uploading ? (
          <span className="flex items-center gap-2">
            <Upload className="h-4 w-4 animate-pulse" />
            アップロード中...
          </span>
        ) : isProcessingOcr ? (
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 animate-pulse" />
            AI分析中...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            アップロード
          </span>
        )}
      </Button>
    </form>
  )
}

