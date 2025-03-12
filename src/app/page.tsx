import type { Metadata } from "next"
import DashboardPage from "@/components/dashboard-page"

export const metadata: Metadata = {
  title: "書類管理システム",
  description: "マンションの書類管理を行うWebアプリケーション",
}

export default function Home() {
  return <DashboardPage />
}

