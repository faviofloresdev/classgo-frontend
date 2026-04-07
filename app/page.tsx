"use client"

import { useState } from "react"
import { LandingPage } from "@/components/class-go/landing-page"
import { LoginScreen } from "@/components/class-go/login-screen"
import { TeacherDashboardNew } from "@/components/class-go/teacher/teacher-dashboard-new"
import { StudentDashboard } from "@/components/class-go/student/student-dashboard"
import { GameplayScreen } from "@/components/class-go/gameplay-screen"
import { ResultsScreen } from "@/components/class-go/results-screen"
import type { User } from "@/lib/types"
import { getTopicById, getUserById, users } from "@/lib/store"

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
  answers: { question: string; correct: boolean; selected: string }[]
  classroomId?: string
  topicId?: string
}

export default function ClassGoApp() {
  const [screen, setScreen] = useState<Screen>("landing")
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: 0,
    totalQuestions: 10,
    correctAnswers: 0,
    answers: [],
  })

  const handleGetStarted = () => {
    setScreen("login")
  }

  const handleLogin = (role: "teacher" | "student") => {
    // Mock login - in production, this would be real authentication
    const mockUser = role === "teacher" 
      ? users.find(u => u.role === "teacher") 
      : users.find(u => u.role === "student")
    
    if (mockUser) {
      setCurrentUser(mockUser)
      setScreen(role === "teacher" ? "teacher-dashboard" : "student-dashboard")
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setScreen("landing")
  }

  const handleUserUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser)
  }

  const handleStartChallenge = (classroomId: string, topicId: string) => {
    const topic = getTopicById(topicId)
    setGameState({
      currentQuestion: 0,
      totalQuestions: topic?.questions.length || 1,
      correctAnswers: 0,
      answers: [],
      classroomId,
      topicId,
    })
    setScreen("gameplay")
  }

  const handleGameComplete = (finalState: GameState) => {
    setGameState(finalState)
    setScreen("results")
  }

  const handleBackToHome = () => {
    if (currentUser?.role === "teacher") {
      setScreen("teacher-dashboard")
    } else {
      setScreen("student-dashboard")
    }
  }

  return (
    <main className="min-h-screen">
      {screen === "landing" && (
        <LandingPage onGetStarted={handleGetStarted} />
      )}
      
      {screen === "login" && (
        <LoginScreen 
          onLogin={handleLogin} 
          onBack={() => setScreen("landing")} 
        />
      )}
      
      {screen === "teacher-dashboard" && currentUser && (
        <TeacherDashboardNew
          user={currentUser}
          onLogout={handleLogout}
          onUserUpdate={handleUserUpdate}
        />
      )}
      
      {screen === "student-dashboard" && currentUser && (
        <StudentDashboard
          user={currentUser}
          onLogout={handleLogout}
          onUserUpdate={handleUserUpdate}
          onStartChallenge={handleStartChallenge}
        />
      )}
      
      {screen === "gameplay" && (
        <GameplayScreen
          gameState={gameState}
          onGameComplete={handleGameComplete}
        />
      )}
      
      {screen === "results" && (
        <ResultsScreen
          gameState={gameState}
          onBackToHome={handleBackToHome}
        />
      )}
    </main>
  )
}
