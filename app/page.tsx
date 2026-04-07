"use client"

import { useState } from "react"
import { LandingPage } from "@/components/class-go/landing-page"
import { LoginScreen } from "@/components/class-go/login-screen"
import { TeacherDashboard } from "@/components/class-go/teacher-dashboard"
import { CreateClassroom } from "@/components/class-go/create-classroom"
import { CreateTopic } from "@/components/class-go/create-topic"
import { StudentJoinClassroom } from "@/components/class-go/student-join-classroom"
import { ChallengeHome } from "@/components/class-go/challenge-home"
import { GameplayScreen } from "@/components/class-go/gameplay-screen"
import { ResultsScreen } from "@/components/class-go/results-screen"

export type Screen = 
  | "landing" 
  | "login" 
  | "teacher-dashboard" 
  | "create-classroom" 
  | "create-topic"
  | "student-join"
  | "student-home" 
  | "gameplay" 
  | "results"

export type UserRole = "teacher" | "student" | null

export interface GameState {
  currentQuestion: number
  totalQuestions: number
  correctAnswers: number
  answers: { question: string; correct: boolean; selected: string }[]
}

export interface Classroom {
  id: string
  name: string
  code: string
  students: number
}

export interface Topic {
  id: string
  title: string
  description: string
  questions: { question: string; options: string[]; correct: number }[]
  status: "active" | "completed" | "draft"
  completedBy: number
  totalStudents: number
  averageScore: number
}

export default function ClassGoApp() {
  const [screen, setScreen] = useState<Screen>("landing")
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [currentClassroom, setCurrentClassroom] = useState<Classroom | null>(null)
  const [studentClassrooms, setStudentClassrooms] = useState<{ id: string; name: string; code: string; currentTopic?: string }[]>([])
  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: 0,
    totalQuestions: 10,
    correctAnswers: 0,
    answers: [],
  })

  const handleGetStarted = () => {
    setScreen("login")
  }

  const handleLogin = (role: UserRole) => {
    setUserRole(role)
    if (role === "teacher") {
      setScreen("teacher-dashboard")
    } else {
      setScreen("student-join")
    }
  }

  const handleJoinClassroom = (code: string) => {
    // Simulate joining a classroom
    const newClassroom = {
      id: Date.now().toString(),
      name: "Math Stars",
      code: code,
      currentTopic: "Multiplications by 2 and 3"
    }
    setStudentClassrooms(prev => [...prev, newClassroom])
    setScreen("student-home")
  }

  const handleSelectStudentClassroom = (classroomId: string) => {
    // Could set current classroom context here if needed
    setScreen("student-home")
  }

  const handleEditTopic = (topicId: string) => {
    // Navigate to create-topic with edit mode
    // For now, just go to create topic screen
    setScreen("create-topic")
  }

  const handleLogout = () => {
    setUserRole(null)
    setCurrentClassroom(null)
    setScreen("landing")
  }

  const handleCreateClassroom = () => {
    setScreen("create-classroom")
  }

  const handleClassroomCreated = (classroom: Classroom) => {
    setCurrentClassroom(classroom)
    setScreen("teacher-dashboard")
  }

  const handleCreateTopic = () => {
    setScreen("create-topic")
  }

  const handleTopicCreated = () => {
    setScreen("teacher-dashboard")
  }

  const handleStartGame = () => {
    setGameState({
      currentQuestion: 0,
      totalQuestions: 10,
      correctAnswers: 0,
      answers: [],
    })
    setScreen("gameplay")
  }

  const handleGameComplete = (finalState: GameState) => {
    setGameState(finalState)
    setScreen("results")
  }

  const handleBackToHome = () => {
    if (userRole === "teacher") {
      setScreen("teacher-dashboard")
    } else {
      setScreen("student-home")
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      {screen === "landing" && (
        <LandingPage onGetStarted={handleGetStarted} />
      )}
      {screen === "login" && (
        <LoginScreen onLogin={handleLogin} onBack={() => setScreen("landing")} />
      )}
      {screen === "teacher-dashboard" && (
        <TeacherDashboard 
          onCreateClassroom={handleCreateClassroom}
          onCreateTopic={handleCreateTopic}
          onEditTopic={handleEditTopic}
          onLogout={handleLogout}
          classroom={currentClassroom}
        />
      )}
      {screen === "create-classroom" && (
        <CreateClassroom 
          onClassroomCreated={handleClassroomCreated}
          onBack={() => setScreen("teacher-dashboard")}
        />
      )}
      {screen === "create-topic" && (
        <CreateTopic 
          onTopicCreated={handleTopicCreated}
          onBack={() => setScreen("teacher-dashboard")}
        />
      )}
      {screen === "student-join" && (
        <StudentJoinClassroom 
          onJoinClassroom={handleJoinClassroom}
          onLogout={handleLogout}
          joinedClassrooms={studentClassrooms}
          onSelectClassroom={handleSelectStudentClassroom}
        />
      )}
      {screen === "student-home" && (
        <ChallengeHome onStartGame={handleStartGame} onLogout={handleLogout} />
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
