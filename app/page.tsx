"use client"

import { useEffect, useState } from "react"
import { LandingPage } from "@/components/class-go/landing-page"
import { LoginScreen } from "@/components/class-go/login-screen"
import { TeacherDashboardNew } from "@/components/class-go/teacher/teacher-dashboard-new"
import { StudentDashboard } from "@/components/class-go/student/student-dashboard"
import { GameplayScreen } from "@/components/class-go/gameplay-screen"
import { ResultsScreen } from "@/components/class-go/results-screen"
import {
  getClassroomLeaderboard,
  getCurrentUser,
  getGameplayContext,
  getStoredSession,
  loginWithEmail,
  loginWithGoogle,
  logout,
  submitResult,
} from "@/lib/api"
import type { LeaderboardEntry, StudentResultWithDetails, Topic, User } from "@/lib/types"

export type Screen =
  | "landing"
  | "login"
  | "teacher-dashboard"
  | "student-dashboard"
  | "gameplay"
  | "results"

export interface GameState {
  currentQuestion: number
  totalQuestions: number
  correctAnswers: number
  retryCount?: number
  answers: { question: string; correct: boolean; selected: string }[]
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
        setScreen(user.role === "teacher" ? "teacher-dashboard" : "student-dashboard")
      } catch {
        await logout().catch(() => undefined)
      } finally {
        setIsBootstrapping(false)
      }
    }

    void restoreSession()
  }, [])

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
    setScreen("landing")
  }

  const handleUserUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser)
  }

  const handleStartChallenge = async (classroomId: string, retryCount = 0) => {
    const context = await getGameplayContext(classroomId)

    if (!context.topic) {
      throw new Error("This classroom does not have an active challenge.")
    }

    if (!context.attemptAllowed && context.existingResult) {
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
      startedAt: Date.now(),
      leaderboard: [],
      submittedResult: null,
    })
    setScreen("gameplay")
  }

  const handleRetryChallenge = async () => {
    if (!gameState.classroomId) return
    await handleStartChallenge(gameState.classroomId, (gameState.retryCount || 0) + 1)
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

    const submittedResult = await submitResult({
      classroomId: finalState.classroomId,
      topicId: finalState.topicId,
      weekNumber: finalState.weekNumber,
      score,
      timeSpent,
      correctAnswers: finalState.correctAnswers,
      totalQuestions: finalState.totalQuestions,
      answers: finalState.answers,
    })

    const leaderboard = await getClassroomLeaderboard(
      finalState.classroomId,
      finalState.weekNumber
    ).catch(() => [])

    setGameState({
      ...finalState,
      leaderboard,
      submittedResult,
    })
    setScreen("results")
  }

  const handleBackToHome = () => {
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
          onLogout={() => {
            void handleLogout()
          }}
          onUserUpdate={handleUserUpdate}
          onStartChallenge={handleStartChallenge}
        />
      )}

      {screen === "gameplay" && gameState.topic && (
        <GameplayScreen gameState={gameState} onGameComplete={handleGameComplete} />
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
