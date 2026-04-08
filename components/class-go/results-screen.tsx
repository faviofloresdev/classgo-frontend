"use client"

import { useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Medal, Sparkles, Star, Target, TrendingUp, Trophy, Zap } from "lucide-react"
import type { GameState } from "@/app/page"
import type { User } from "@/lib/types"
import { getAvatarUrl } from "@/lib/avatars"
import confetti from "canvas-confetti"

interface ResultsScreenProps {
  gameState: GameState
  currentUser: User | null
  onBackToHome: () => void
  onRetry?: () => void
}

export function ResultsScreen({ gameState, currentUser, onBackToHome, onRetry }: ResultsScreenProps) {
  const applauseAudioRef = useRef<HTMLAudioElement | null>(null)
  const safeTotalQuestions = Math.max(gameState.totalQuestions, 1)
  const accuracy = Math.round((gameState.correctAnswers / safeTotalQuestions) * 100)
  const points = gameState.submittedResult?.score ?? accuracy
  const leaderboard = gameState.leaderboard || []
  const currentEntry = leaderboard.find((entry) => entry.student.id === currentUser?.id)
  const rank = currentEntry?.rank ?? (leaderboard.length ? leaderboard.length : 1)

  const performanceLabel =
    accuracy >= 90 ? "Excellent" : accuracy >= 75 ? "Very good" : accuracy >= 60 ? "Good progress" : "Keep practicing"
  const improvementArea =
    accuracy >= 80 ? "Your progress looks strong. Keep working with mixed questions." : "It would help to review this week's exercises again."

  const stats = [
    {
      title: "Points",
      value: `${points}`,
      icon: Star,
      tileClassName: "from-yellow-50 to-orange-50",
      iconClassName: "text-yellow-500",
    },
    {
      title: "Accuracy",
      value: `${accuracy}%`,
      icon: Target,
      tileClassName: "from-green-50 to-emerald-50",
      iconClassName: "text-green-500",
    },
    {
      title: "Correct",
      value: `${gameState.correctAnswers}/${safeTotalQuestions}`,
      icon: Medal,
      tileClassName: "from-sky-50 to-cyan-50",
      iconClassName: "text-sky-500",
    },
    {
      title: "Rank",
      value: `#${rank}`,
      icon: Trophy,
      tileClassName: "from-fuchsia-50 to-pink-50",
      iconClassName: "text-fuchsia-500",
    },
  ]

  useEffect(() => {
    const applause = new Audio("/audio/clapping.mp3")
    applause.volume = 0.6
    applauseAudioRef.current = applause

    const playTimeout = window.setTimeout(() => {
      void applause.play().catch(() => undefined)
    }, 180)

    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 }
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()
      if (timeLeft <= 0) {
        clearInterval(interval)
        return
      }

      const particleCount = 50 * (timeLeft / duration)

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#7c3aed", "#2dd4bf", "#fbbf24", "#f472b6", "#60a5fa"],
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#7c3aed", "#2dd4bf", "#fbbf24", "#f472b6", "#60a5fa"],
      })
    }, 250)

    return () => {
      window.clearTimeout(playTimeout)
      clearInterval(interval)
      applause.pause()
      applause.currentTime = 0
    }
  }, [])

  return (
    <div className="min-h-screen px-3 py-4 sm:px-4 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 lg:gap-6">
        <header className="flex items-center justify-between gap-3 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-sm backdrop-blur sm:px-5 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Zap className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Class Go</p>
              <h1 className="truncate text-lg font-bold text-foreground sm:text-xl lg:text-2xl">Challenge Results</h1>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_360px] lg:gap-6">
          <div className="grid gap-4 lg:gap-6">
            <Card className="gap-0 overflow-hidden border-0 bg-gradient-to-br from-primary via-primary to-accent py-0 shadow-xl">
              <CardContent className="p-4 text-primary-foreground sm:p-5 lg:p-7">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <Badge className="mb-3 bg-white/15 text-white hover:bg-white/15">Challenge Complete</Badge>
                    <h2 className="text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">Great job this week!</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-white/85 sm:text-base">
                      You answered {gameState.correctAnswers} of {safeTotalQuestions} correctly and earned {points} points. {performanceLabel} work.
                    </p>
                  </div>
                  <div className="flex justify-start sm:justify-end">
                    <div className="relative flex size-20 items-center justify-center rounded-2xl bg-white/12 ring-4 ring-white/10 sm:size-24 lg:size-28">
                      <Trophy className="size-10 text-yellow-300 sm:size-12 lg:size-14" />
                      <Sparkles className="absolute -right-1 -top-1 size-5 text-yellow-100" />
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {stats.map(({ title, value, icon: Icon, tileClassName, iconClassName }) => (
                    <div key={title} className={`rounded-2xl bg-gradient-to-br ${tileClassName} p-3 text-foreground sm:p-4`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{title}</p>
                          <p className="mt-2 truncate text-2xl font-bold sm:text-3xl">{value}</p>
                        </div>
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/80">
                          <Icon className={`size-4 ${iconClassName}`} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {onRetry && (
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <Button
                      onClick={onRetry}
                      className="h-12 rounded-xl bg-white text-base font-bold text-primary hover:bg-white/90"
                    >
                      Try again
                    </Button>
                    <Button
                      onClick={onBackToHome}
                      variant="outline"
                      className="h-12 rounded-xl border-white/40 bg-white/10 text-base font-bold text-white hover:bg-white/15"
                    >
                      Back
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(260px,320px)]">
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <TrendingUp className="size-4 text-primary" />
                    Progress Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-green-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-green-100">
                        <Sparkles className="size-5 text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-green-800">Strength</p>
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Strong</Badge>
                        </div>
                        <p className="mt-2 text-sm leading-5 text-green-700">
                          {accuracy >= 80 ? "You completed the challenge with great accuracy." : "You are already solving part of this challenge correctly."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-orange-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-orange-100">
                        <Target className="size-5 text-orange-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-orange-800">Focus Area</p>
                          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Focus</Badge>
                        </div>
                        <p className="mt-2 text-sm leading-5 text-orange-700">{improvementArea}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <Medal className="size-4 text-primary" />
                    Next Step
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-2xl bg-muted/60 p-4">
                    <p className="text-sm font-semibold text-foreground">Keep the streak going</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Return to your dashboard to review the ranking and wait for the next active challenge.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-primary/70">Class Position</p>
                    <p className="mt-2 text-3xl font-bold text-primary">#{rank}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {leaderboard.length ? "Your position already reflects the real classroom ranking." : "The ranking will appear once there are results."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="border-0 shadow-xl lg:sticky lg:top-8">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Trophy className="size-4 text-yellow-500" />
                Class Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {leaderboard.length === 0 ? (
                <div className="rounded-2xl bg-muted/50 p-4 text-sm text-muted-foreground">
                  There is no ranking data for this week yet.
                </div>
              ) : (
                leaderboard.map((player) => {
                  const isYou = player.student.id === currentUser?.id
                  return (
                    <div
                      key={player.student.id}
                      className={`flex items-center gap-3 rounded-2xl p-3 sm:p-4 ${
                        isYou
                          ? "bg-gradient-to-r from-primary/10 to-accent/10 ring-2 ring-primary/20"
                          : player.rank === 1
                          ? "bg-gradient-to-r from-yellow-50 to-orange-50"
                          : "bg-muted/50"
                      }`}
                    >
                      <div
                        className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          player.rank === 1
                            ? "bg-gradient-to-br from-yellow-400 to-orange-400 text-white"
                            : player.rank === 2
                            ? "bg-gradient-to-br from-slate-300 to-slate-400 text-white"
                            : player.rank === 3
                            ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {player.rank}
                      </div>
                      <Avatar className="size-10 shrink-0 bg-gradient-to-br from-primary to-accent">
                        <AvatarImage
                          src={getAvatarUrl(player.student.studentAvatarId || player.student.avatarId)}
                          alt={player.student.name}
                          crossOrigin="anonymous"
                        />
                        <AvatarFallback className="text-xs font-semibold text-white">
                          {player.student.name.slice(0, 1).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-sm font-medium sm:text-base ${isYou ? "text-primary" : "text-foreground"}`}>
                          {player.student.name}
                          {isYou && <span className="ml-1 text-xs text-muted-foreground">(You)</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">Rank #{player.rank} in class</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="flex items-center gap-1 font-semibold text-primary">
                          <Star className="size-4 text-yellow-500" />
                          {player.totalScore}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </section>

        <div className="lg:hidden">
          <div className="space-y-3">
            {onRetry && (
              <Button onClick={onRetry} size="lg" className="h-12 w-full rounded-xl font-semibold">
                Try again
              </Button>
            )}
            <Button onClick={onBackToHome} size="lg" className="h-12 w-full rounded-xl font-semibold">
              <ArrowLeft className="mr-2 size-5" />
              Back to Classroom
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
