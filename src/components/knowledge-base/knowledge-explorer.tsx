"use client";

import { useState, useEffect } from "react";
import { 
  getKnowledgeBases,
  getDocuments,
  searchKnowledgeBase,
  createKnowledgeBase,
  createDocumentFromText,
  createDocumentFromFile,
  deleteDocument,
  deleteKnowledgeBase
} from "@/lib/client/dify";

/**
 * ナレッジベース探索コンポーネント
 * Dify API を使用してナレッジベースとドキュメントを操作するためのUI
 */
export default function KnowledgeExplorer() {
  const [knowledgeBases, setKnowledgeBases] = useState<any[]>([]);
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ナレッジベース一覧を取得
  useEffect(() => {
    async function fetchKnowledgeBases() {
      setLoading(true);
      setError(null);
      try {
        const result = await getKnowledgeBases();
        setKnowledgeBases(result.data || []);
      } catch (error: any) {
        setError(error.message || "ナレッジベースの取得に失敗しました");
        console.error("ナレッジベース取得エラー:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchKnowledgeBases();
  }, []);

  // 選択したナレッジベースのドキュメント一覧を取得
  useEffect(() => {
    async function fetchDocuments() {
      if (!selectedKnowledgeBase) return;

      setLoading(true);
      setError(null);
      try {
        const result = await getDocuments(selectedKnowledgeBase);
        setDocuments(result.data || []);
      } catch (error: any) {
        setError(error.message || "ドキュメントの取得に失敗しました");
        console.error("ドキュメント取得エラー:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDocuments();
  }, [selectedKnowledgeBase]);

  // ナレッジベース選択時の処理
  const handleSelectKnowledgeBase = (datasetId: string) => {
    setSelectedKnowledgeBase(datasetId);
  };

  // 新しいナレッジベース作成
  const handleCreateKnowledgeBase = async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      await createKnowledgeBase({ name });
      // 再読み込み
      const result = await getKnowledgeBases();
      setKnowledgeBases(result.data || []);
    } catch (error: any) {
      setError(error.message || "ナレッジベースの作成に失敗しました");
      console.error("ナレッジベース作成エラー:", error);
    } finally {
      setLoading(false);
    }
  };

  // ナレッジベース削除
  const handleDeleteKnowledgeBase = async (datasetId: string) => {
    if (!confirm("このナレッジベースを削除しますか？")) return;
    
    setLoading(true);
    setError(null);
    try {
      await deleteKnowledgeBase(datasetId);
      // 再読み込み
      const result = await getKnowledgeBases();
      setKnowledgeBases(result.data || []);
      if (selectedKnowledgeBase === datasetId) {
        setSelectedKnowledgeBase(null);
        setDocuments([]);
      }
    } catch (error: any) {
      setError(error.message || "ナレッジベースの削除に失敗しました");
      console.error("ナレッジベース削除エラー:", error);
    } finally {
      setLoading(false);
    }
  };

  // テキストからドキュメントを作成
  const handleCreateDocumentFromText = async (name: string, text: string) => {
    if (!selectedKnowledgeBase) {
      setError("先にナレッジベースを選択してください");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await createDocumentFromText(selectedKnowledgeBase, name, text);
      // 再読み込み
      const result = await getDocuments(selectedKnowledgeBase);
      setDocuments(result.data || []);
    } catch (error: any) {
      setError(error.message || "ドキュメントの作成に失敗しました");
      console.error("ドキュメント作成エラー:", error);
    } finally {
      setLoading(false);
    }
  };

  // ファイルからドキュメントを作成
  const handleFileUpload = async (file: File) => {
    if (!selectedKnowledgeBase) {
      setError("先にナレッジベースを選択してください");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await createDocumentFromFile(selectedKnowledgeBase, file);
      // 再読み込み
      const result = await getDocuments(selectedKnowledgeBase);
      setDocuments(result.data || []);
    } catch (error: any) {
      setError(error.message || "ファイルのアップロードに失敗しました");
      console.error("ファイルアップロードエラー:", error);
    } finally {
      setLoading(false);
    }
  };

  // ドキュメントを削除
  const handleDeleteDocument = async (documentId: string) => {
    if (!selectedKnowledgeBase) return;
    if (!confirm("このドキュメントを削除しますか？")) return;

    setLoading(true);
    setError(null);
    try {
      await deleteDocument(selectedKnowledgeBase, documentId);
      // 再読み込み
      const result = await getDocuments(selectedKnowledgeBase);
      setDocuments(result.data || []);
    } catch (error: any) {
      setError(error.message || "ドキュメントの削除に失敗しました");
      console.error("ドキュメント削除エラー:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">ナレッジベース管理</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      {loading && <p className="text-gray-500">データを読み込み中...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ナレッジベース一覧 */}
        <div className="border rounded p-4">
          <h2 className="text-xl font-semibold mb-2">ナレッジベース一覧</h2>
          
          {/* ナレッジベース作成フォーム */}
          <div className="mb-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const nameInput = form.elements.namedItem("name") as HTMLInputElement;
                if (nameInput.value) {
                  handleCreateKnowledgeBase(nameInput.value);
                  nameInput.value = "";
                }
              }}
            >
              <div className="flex">
                <input
                  type="text"
                  name="name"
                  placeholder="新しいナレッジベース名"
                  className="flex-grow border rounded p-2"
                  required
                />
                <button
                  type="submit"
                  className="ml-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                  disabled={loading}
                >
                  作成
                </button>
              </div>
            </form>
          </div>

          {/* ナレッジベースリスト */}
          <ul className="space-y-2">
            {knowledgeBases.map((kb) => (
              <li
                key={kb.id}
                className={`p-2 border rounded flex justify-between ${
                  selectedKnowledgeBase === kb.id ? "bg-blue-100" : ""
                }`}
              >
                <button
                  onClick={() => handleSelectKnowledgeBase(kb.id)}
                  className="text-left flex-grow"
                >
                  <div className="font-medium">{kb.name}</div>
                  <div className="text-sm text-gray-500">
                    ドキュメント: {kb.document_count} | 作成日: {new Date(kb.created_at * 1000).toLocaleDateString()}
                  </div>
                </button>
                <button
                  onClick={() => handleDeleteKnowledgeBase(kb.id)}
                  className="text-red-500 hover:text-red-700"
                  disabled={loading}
                >
                  削除
                </button>
              </li>
            ))}
          </ul>

          {knowledgeBases.length === 0 && !loading && (
            <p className="text-gray-500 p-2">ナレッジベースがありません</p>
          )}
        </div>

        {/* ドキュメント一覧 */}
        <div className="border rounded p-4">
          <h2 className="text-xl font-semibold mb-2">ドキュメント一覧</h2>

          {selectedKnowledgeBase ? (
            <>
              {/* テキストからドキュメント作成フォーム */}
              <div className="mb-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const nameInput = form.elements.namedItem("name") as HTMLInputElement;
                    const textInput = form.elements.namedItem("text") as HTMLTextAreaElement;
                    
                    if (nameInput.value && textInput.value) {
                      handleCreateDocumentFromText(nameInput.value, textInput.value);
                      nameInput.value = "";
                      textInput.value = "";
                    }
                  }}
                >
                  <div className="mb-2">
                    <input
                      type="text"
                      name="name"
                      placeholder="ドキュメント名"
                      className="w-full border rounded p-2"
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <textarea
                      name="text"
                      placeholder="テキスト内容"
                      className="w-full border rounded p-2 h-20"
                      required
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                    disabled={loading}
                  >
                    テキストから作成
                  </button>
                </form>
              </div>

              {/* ファイルアップロード */}
              <div className="mb-4">
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file);
                    }
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {/* ドキュメントリスト */}
              <ul className="space-y-2">
                {documents.map((doc) => (
                  <li key={doc.id} className="p-2 border rounded flex justify-between">
                    <div>
                      <div className="font-medium">{doc.name}</div>
                      <div className="text-sm text-gray-500">
                        状態: {doc.indexing_status} | 作成日: {new Date(doc.created_at * 1000).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="text-red-500 hover:text-red-700"
                      disabled={loading}
                    >
                      削除
                    </button>
                  </li>
                ))}
              </ul>

              {documents.length === 0 && !loading && (
                <p className="text-gray-500 p-2">ドキュメントがありません</p>
              )}
            </>
          ) : (
            <p className="text-gray-500 p-2">ナレッジベースを選択してください</p>
          )}
        </div>
      </div>
    </div>
  );
}
