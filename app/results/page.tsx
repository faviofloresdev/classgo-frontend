"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ResultsScreen } from "@/components/class-go/results-screen"

function ResultsPageContent() {
  const router = useRouter()
  const params = useSearchParams()

  const correct = Number(params.get("correct") || "0")
  const total = Number(params.get("total") || "10")

  const gameState = {
    currentQuestion: total,
    totalQuestions: total,
    correctAnswers: correct,
    answers: [],
  }

  return <ResultsScreen gameState={gameState} onBackToHome={() => router.push("/")} />
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-gradient-to-br from-background via-secondary to-background" />}>
      <ResultsPageContent />
    </Suspense>
  )
}
