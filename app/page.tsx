"use client"

import { useEffect, useState } from "react"
import { LandingPage } from "@/components/class-go/landing-page"
import { LoginScreen } from "@/components/class-go/login-screen"
import { TeacherDashboardNew } from "@/components/class-go/teacher/teacher-dashboard-new"
import { StudentDashboard } from "@/components/class-go/student/student-dashboard"
import { StudentAchievementsPage } from "@/components/class-go/student/student-achievements-page"
import { GameplayScreen } from "@/components/class-go/gameplay-screen"
import { ResultsScreen } from "@/components/class-go/results-screen"
import { BadgeCeremony } from "@/components/class-go/badge-ceremony"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/hooks/use-toast"
import {
  ApiError,
  NETWORK_ACTIVITY_EVENT,
  getClassroomLeaderboard,
  getCurrentUser,
  getGameplayContext,
  getStoredSession,
  loginWithEmail,
  loginWithGoogle,
  logout,
  trackAchievementActivityType,
  submitResult,
} from "@/lib/api"
import { getCeremonyBadges, mergeAchievementPayloads } from "@/lib/badges"
import type {
  AchievementPayload,
  AchievementProgressSnapshot,
  LeaderboardEntry,
  StudentResultWithDetails,
  Topic,
  User,
} from "@/lib/types"

export type Screen =
  | "landing"
  | "login"
  | "teacher-dashboard"
  | "student-dashboard"
  | "student-achievements"
  | "gameplay"
  | "badge-ceremony"
  | "results"

export interface GameState {
  currentQuestion: number
  totalQuestions: number
  correctAnswers: number
  retryCount?: number
  answers: {
    questionId: string
    id: string
    question: string
    correct: boolean
    isCorrect: boolean
    selected: string
  }[]
  classroomId?: string
  topicId?: string
  topic?: Topic
  weekNumber?: number
  startedAt?: number
  leaderboard?: LeaderboardEntry[]
  submittedResult?: StudentResultWithDetails | null
}

const initialGameState: GameState = {
  currentQuestion: 0,
  totalQuestions: 0,
  correctAnswers: 0,
  retryCount: 0,
  answers: [],
  leaderboard: [],
  submittedResult: null,
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function calculateChallengeScore(params: {
  correctAnswers: number
  totalQuestions: number
  timeSpent: number
  retryCount: number
}) {
  const safeTotalQuestions = Math.max(params.totalQuestions, 1)
  const accuracyRatio = params.correctAnswers / safeTotalQuestions
  const averageSecondsPerQuestion = params.timeSpent / safeTotalQuestions

  const accuracyPoints = accuracyRatio * 100
  const speedRatio = clamp((50 - averageSecondsPerQuestion) / 40, 0, 1)
  const speedPoints = speedRatio * 40
  const perseverancePoints = Math.min(params.correctAnswers * 4, 20)
  const retryBonusPoints = Math.min(params.retryCount * 15, 30)

  return Math.round(
    clamp(accuracyPoints + speedPoints + perseverancePoints + retryBonusPoints, 0, 190)
  )
}

export default function ClassGoApp() {
  const [screen, setScreen] = useState<Screen>("landing")
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [gameState, setGameState] = useState<GameState>(initialGameState)
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [pendingRequestCount, setPendingRequestCount] = useState(0)
  const [showNetworkOverlay, setShowNetworkOverlay] = useState(false)
  const [earnedBadges, setEarnedBadges] = useState<ReturnType<typeof getCeremonyBadges>>([])
  const [achievementProgress, setAchievementProgress] = useState<AchievementProgressSnapshot | null>(null)
  const [screenAfterCeremony, setScreenAfterCeremony] = useState<Screen>("student-dashboard")

  useEffect(() => {
    const handleNetworkActivity = (event: Event) => {
      const detail = (event as CustomEvent<{ pendingCount?: number }>).detail
      setPendingRequestCount(detail?.pendingCount ?? 0)
    }

    window.addEventListener(NETWORK_ACTIVITY_EVENT, handleNetworkActivity)

    return () => {
      window.removeEventListener(NETWORK_ACTIVITY_EVENT, handleNetworkActivity)
    }
  }, [])

  useEffect(() => {
    const restoreSession = async () => {
      const session = getStoredSession()
      if (!session) {
        setIsBootstrapping(false)
        return
      }

      try {
        const user = await getCurrentUser()
        setCurrentUser(user)
        setAchievementProgress(user.achievements?.updatedProgress || null)
        setScreen(user.role === "teacher" ? "teacher-dashboard" : "student-dashboard")
      } catch {
        await logout().catch(() => undefined)
      } finally {
        setIsBootstrapping(false)
      }
    }

    void restoreSession()
  }, [])

  useEffect(() => {
    if (pendingRequestCount <= 0) {
      setShowNetworkOverlay(false)
      return
    }

    const timeoutId = window.setTimeout(() => {
      setShowNetworkOverlay(true)
    }, 350)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [pendingRequestCount])

  const handleGetStarted = () => {
    setScreen("login")
  }

  const handleTeacherLogin = async (email: string, password: string) => {
    const session = await loginWithEmail(email, password)

    if (session.user.role !== "teacher") {
      await logout()
      throw new Error("This account does not belong to a teacher.")
    }

    setCurrentUser(session.user)
    setScreen("teacher-dashboard")
  }

  const handleStudentLogin = async (email: string, password: string) => {
    const session = await loginWithEmail(email, password)

    if (session.user.role !== "student") {
      await logout()
      throw new Error("This account does not belong to a student.")
    }

    setCurrentUser(session.user)
    setScreen("student-dashboard")
  }

  const handleGoogleLogin = async (role: "teacher" | "student", idToken: string) => {
    const session = await loginWithGoogle(idToken, role)
    setCurrentUser(session.user)
    setScreen(session.user.role === "teacher" ? "teacher-dashboard" : "student-dashboard")
  }

  const handleLogout = async () => {
    await logout().catch(() => undefined)
    setCurrentUser(null)
    setGameState(initialGameState)
    setEarnedBadges([])
    setAchievementProgress(null)
    setScreen("landing")
  }

  const queueAchievementCeremony = (
    payload: AchievementPayload | null | undefined,
    resumeScreen: Screen
  ) => {
    if (payload?.updatedProgress) {
      setAchievementProgress(payload.updatedProgress)
    }

    const ceremonyBadges = getCeremonyBadges(payload?.newlyUnlockedAchievements || [])
    if (ceremonyBadges.length === 0) {
      return false
    }

    setEarnedBadges(ceremonyBadges)
    setScreenAfterCeremony(resumeScreen)
    setScreen("badge-ceremony")
    return true
  }

  const handleUserUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser)
    setAchievementProgress((currentProgress) => updatedUser.achievements?.updatedProgress || currentProgress)
  }

  const handleStartChallenge = async (
    classroomId: string,
    options: { retryCount?: number; forceRetry?: boolean } = {}
  ) => {
    setEarnedBadges([])
    const retryCount = options.retryCount || 0
    const context = await getGameplayContext(classroomId)

    if (!context.topic) {
      throw new Error("This classroom does not have an active challenge.")
    }

    if (!options.forceRetry && !context.attemptAllowed && context.existingResult) {
      setGameState({
        currentQuestion: context.existingResult.totalQuestions || 0,
        totalQuestions: context.existingResult.totalQuestions || 0,
        correctAnswers: context.existingResult.correctAnswers || 0,
        retryCount,
        answers: Array.isArray(context.existingResult.answers)
          ? (context.existingResult.answers as GameState["answers"])
          : [],
        classroomId,
        topicId: context.topic.id,
        topic: context.topic,
        weekNumber: context.currentWeek,
        leaderboard: await getClassroomLeaderboard(classroomId, context.currentWeek).catch(() => []),
        submittedResult: context.existingResult,
      })
      setScreen("results")
      return
    }

    setGameState({
      currentQuestion: 0,
      totalQuestions: context.topic.questions.length,
      correctAnswers: 0,
      retryCount,
      answers: [],
      classroomId,
      topicId: context.topic.id,
      topic: context.topic,
      weekNumber: context.currentWeek,
      startedAt: undefined,
      leaderboard: [],
      submittedResult: null,
    })
    setScreen("gameplay")
  }

  const handleRetryChallenge = async () => {
    if (!gameState.classroomId) return
    await handleStartChallenge(gameState.classroomId, {
      retryCount: (gameState.retryCount || 0) + 1,
      forceRetry: true,
    })
  }

  const handleGameComplete = async (finalState: GameState) => {
    if (!finalState.classroomId || !finalState.topicId || !finalState.weekNumber) {
      setGameState(finalState)
      setScreen("results")
      return
    }

    const timeSpent = Math.max(
      1,
      finalState.startedAt ? Math.round((Date.now() - finalState.startedAt) / 1000) : 1
    )
    const score = calculateChallengeScore({
      correctAnswers: finalState.correctAnswers,
      totalQuestions: finalState.totalQuestions,
      timeSpent,
      retryCount: finalState.retryCount || 0,
    })

    let submitTopicId = finalState.topicId
    let submitWeekNumber = finalState.weekNumber
    let submittedResult: StudentResultWithDetails

    try {
      const liveContext = await getGameplayContext(finalState.classroomId)

      if (liveContext.topic?.id === finalState.topicId) {
        submitTopicId = liveContext.topic.id
        submitWeekNumber = liveContext.currentWeek
      }

      submittedResult = await submitResult({
        classroomId: finalState.classroomId,
        topicId: submitTopicId,
        weekNumber: submitWeekNumber,
        score,
        timeSpent,
        correctAnswers: finalState.correctAnswers,
        totalQuestions: finalState.totalQuestions,
        answers: finalState.answers,
      })
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.message === "The result does not match the active topic or week"
      ) {
        toast({
          title: "This challenge changed",
          description:
            "The active topic or week changed while the student was playing. Please start the challenge again.",
          variant: "destructive",
        })
        setGameState({
          ...finalState,
          submittedResult: null,
        })
        setScreen("student-dashboard")
        return
      }

      throw error
    }

    const leaderboard = await getClassroomLeaderboard(
      finalState.classroomId,
      submitWeekNumber
    ).catch(() => [])

    const activityTypes = new Set<"QUIZ" | "MATCH" | "DRAG_DROP">()
    finalState.topic?.questions.forEach((question) => {
      if (
        question.type === "multiple_choice" ||
        question.type === "single_choice" ||
        question.type === "fill_in_blank" ||
        question.type === "listen_and_select" ||
        question.type === "listen_and_select_text" ||
        question.type === "listen_and_select_image" ||
        question.type === "image_selection" ||
        question.type === "image_multiple_selection"
      ) {
        activityTypes.add("QUIZ")
      } else if (question.type === "match_items") {
        activityTypes.add("MATCH")
      } else {
        activityTypes.add("DRAG_DROP")
      }
    })

    const activityPayloads = await Promise.all(
      [...activityTypes].map((activityType) =>
        trackAchievementActivityType(activityType).catch(() => null)
      )
    )
    const combinedAchievementPayload = mergeAchievementPayloads(
      submittedResult.achievements,
      ...activityPayloads
    )

    setGameState({
      ...finalState,
      leaderboard,
      submittedResult,
    })
    const showedCeremony = queueAchievementCeremony(combinedAchievementPayload, "results")
    if (!showedCeremony) {
      setScreen("results")
    }
  }

  const handleBackToHome = () => {
    setEarnedBadges([])
    if (currentUser?.role === "teacher") {
      setScreen("teacher-dashboard")
    } else {
      setScreen("student-dashboard")
    }
  }

  if (isBootstrapping) {
    return <main className="min-h-screen bg-background" />
  }

  return (
    <main className="min-h-screen">
      {showNetworkOverlay && (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
          <div className="flex items-center gap-3 rounded-full border border-primary/10 bg-white/92 px-4 py-2 text-sm font-medium text-foreground shadow-lg backdrop-blur">
            <Spinner className="size-4 text-primary" />
            <span>Loading, please wait...</span>
          </div>
        </div>
      )}

      {screen === "landing" && <LandingPage onGetStarted={handleGetStarted} />}

      {screen === "login" && (
        <LoginScreen
          onTeacherLogin={handleTeacherLogin}
          onStudentLogin={handleStudentLogin}
          onGoogleLogin={handleGoogleLogin}
          onBack={() => setScreen("landing")}
        />
      )}

      {screen === "teacher-dashboard" && currentUser && (
        <TeacherDashboardNew
          user={currentUser}
          onLogout={() => {
            void handleLogout()
          }}
          onUserUpdate={handleUserUpdate}
        />
      )}

      {screen === "student-dashboard" && currentUser && (
        <StudentDashboard
          user={currentUser}
          achievementProgress={achievementProgress}
          onAchievementEvent={(payload) => {
            queueAchievementCeremony(payload, "student-dashboard")
          }}
          onOpenRewards={() => {
            setScreen("student-achievements")
          }}
          onLogout={() => {
            void handleLogout()
          }}
          onUserUpdate={handleUserUpdate}
          onStartChallenge={handleStartChallenge}
        />
      )}

      {screen === "student-achievements" && currentUser && (
        <StudentAchievementsPage
          user={currentUser}
          achievementProgress={achievementProgress}
          onAchievementEvent={(payload) => {
            queueAchievementCeremony(payload, "student-achievements")
          }}
          onBack={() => {
            setScreen("student-dashboard")
          }}
        />
      )}

      {screen === "gameplay" && gameState.topic && (
        <GameplayScreen gameState={gameState} onGameComplete={handleGameComplete} />
      )}

      {screen === "badge-ceremony" && earnedBadges.length > 0 && (
        <BadgeCeremony
          badges={earnedBadges}
          onDone={() => {
            setScreen(screenAfterCeremony)
          }}
        />
      )}

      {screen === "results" && (
        <ResultsScreen
          gameState={gameState}
          currentUser={currentUser}
          onBackToHome={handleBackToHome}
          onRetry={gameState.classroomId ? handleRetryChallenge : undefined}
        />
      )}
    </main>
  )
}
