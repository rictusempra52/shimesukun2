import { useQuery, useMutation, useQueryClient } from "react-query";

export function useDocuments() {
  return useQuery("documents", async () => {
    const res = await fetch("/api/documents");
    if (!res.ok) throw new Error("データ取得に失敗しました");
    return res.json();
  });
}

export function useDocument(id) {
  return useQuery(["document", id], async () => {
    const res = await fetch(`/api/documents/${id}`);
    if (!res.ok) throw new Error("データ取得に失敗しました");
    return res.json();
  });
}
