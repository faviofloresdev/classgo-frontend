"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Trophy,
  Star,
  Zap,
  Target,
  Medal,
  Flame,
  Settings,
  LogOut,
  ChevronRight,
  Clock,
  Users,
  Sparkles,
} from "lucide-react"
import type { User, ClassroomWithDetails, StudentResultWithDetails } from "@/lib/types"
import { getAvatarUrl } from "@/lib/avatars"
import { AvatarSelector } from "../avatar-selector"
import { StudentClassroomView } from "./student-classroom-view"
import {
  getStudentClassrooms,
  getStudentResults,
  getLeaderboard,
  updateUserAvatar,
  getActiveTopicForClassroom,
} from "@/lib/store"

interface StudentDashboardProps {
  user: User
  onLogout: () => void
  onUserUpdate: (user: User) => void
  onStartChallenge: (classroomId: string, topicId: string) => void
}

export function StudentDashboard({
  user,
  onLogout,
  onUserUpdate,
  onStartChallenge,
}: StudentDashboardProps) {
  const [classrooms, setClassrooms] = useState<ClassroomWithDetails[]>([])
  const [results, setResults] = useState<StudentResultWithDetails[]>([])
  const [showAvatarSelector, setShowAvatarSelector] = useState(false)
  const [selectedClassroom, setSelectedClassroom] = useState<ClassroomWithDetails | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    setClassrooms(getStudentClassrooms(user.id))
    setResults(getStudentResults(user.id))
  }, [user.id])

  // Calculate total stats
  const totalScore = results.reduce((sum, r) => sum + r.score, 0)
  const completedChallenges = results.length
  const avgScore = completedChallenges > 0 ? Math.round(totalScore / completedChallenges) : 0
  const currentStreak = Math.min(completedChallenges, 5) // Mock streak

  const handleAvatarChange = (avatarId: string) => {
    const updated = updateUserAvatar(user.id, avatarId)
    if (updated) {
      onUserUpdate(updated)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }
  }

  if (selectedClassroom) {
    return (
      <StudentClassroomView
        user={user}
        classroom={selectedClassroom}
        onBack={() => setSelectedClassroom(null)}
        onStartChallenge={onStartChallenge}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-indigo-50 to-pink-100">
      {/* Confetti Animation */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-50"
          >
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: -20,
                  rotate: 0,
                }}
                animate={{
                  y: window.innerHeight + 20,
                  rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 0.5,
                  ease: "linear",
                }}
                className="absolute h-3 w-3 rounded-sm"
                style={{
                  backgroundColor: ["#FF6B6B", "#4ECDC4", "#FFE66D", "#95E1D3", "#F38181"][
                    Math.floor(Math.random() * 5)
                  ],
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-500 text-xl font-black text-white shadow-lg"
            >
              CG
            </motion.div>
            <span className="text-xl font-black text-indigo-900">ClassGo</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAvatarSelector(true)}
              className="relative"
            >
              <motion.img
                whileHover={{ scale: 1.1 }}
                src={getAvatarUrl(user.avatarId)}
                alt={user.name}
                className="h-12 w-12 rounded-full border-3 border-white bg-white shadow-lg"
                crossOrigin="anonymous"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-xs"
              >
                <Settings className="h-3 w-3 text-yellow-900" />
              </motion.div>
            </button>
            <button
              onClick={onLogout}
              className="rounded-xl bg-red-100 p-3 text-red-600 transition-colors hover:bg-red-200"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4 pb-24">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-black text-indigo-900 md:text-3xl">
            Hola, <span className="text-pink-500">{user.name.split(" ")[0]}</span>!
          </h1>
          <p className="text-indigo-600">Listo para el reto de hoy?</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              icon: Trophy,
              value: totalScore,
              label: "Puntos Totales",
              color: "from-yellow-400 to-orange-500",
              iconBg: "bg-yellow-100",
              iconColor: "text-yellow-600",
            },
            {
              icon: Target,
              value: completedChallenges,
              label: "Retos Completados",
              color: "from-green-400 to-emerald-500",
              iconBg: "bg-green-100",
              iconColor: "text-green-600",
            },
            {
              icon: Star,
              value: `${avgScore}%`,
              label: "Promedio",
              color: "from-blue-400 to-indigo-500",
              iconBg: "bg-blue-100",
              iconColor: "text-blue-600",
            },
            {
              icon: Flame,
              value: currentStreak,
              label: "Racha de Dias",
              color: "from-red-400 to-pink-500",
              iconBg: "bg-red-100",
              iconColor: "text-red-600",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="overflow-hidden rounded-2xl bg-white p-4 shadow-lg"
            >
              <div className={`mb-2 inline-flex rounded-xl ${stat.iconBg} p-2`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <div className="text-2xl font-black text-gray-900">{stat.value}</div>
              <div className="text-xs font-medium text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Classrooms */}
        <div className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-indigo-900">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            Mis Aulas
          </h2>

          {classrooms.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center rounded-3xl bg-white p-12 text-center shadow-lg"
            >
              <div className="mb-4 rounded-full bg-indigo-100 p-6">
                <Users className="h-12 w-12 text-indigo-500" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-900">
                No estas en ninguna aula
              </h3>
              <p className="text-gray-500">Pide a tu profesor el codigo para unirte</p>
            </motion.div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {classrooms.map((classroom, index) => {
                const activeTopic = getActiveTopicForClassroom(classroom.id)
                const classroomResults = results.filter(
                  (r) => r.classroomId === classroom.id
                )
                const hasCompletedCurrentWeek = classroomResults.some(
                  (r) => r.weekNumber === classroom.currentWeek
                )

                return (
                  <motion.button
                    key={classroom.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedClassroom(classroom)}
                    className="relative overflow-hidden rounded-3xl bg-white p-5 text-left shadow-lg transition-shadow hover:shadow-xl"
                  >
                    {/* Decorative gradient */}
                    <div
                      className="absolute right-0 top-0 h-32 w-32 rounded-bl-full opacity-30"
                      style={{
                        background: activeTopic
                          ? `linear-gradient(135deg, ${activeTopic.color}40, ${activeTopic.color}10)`
                          : "linear-gradient(135deg, #6366f140, #6366f110)",
                      }}
                    />

                    <div className="relative">
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{classroom.name}</h3>
                          <p className="text-sm text-gray-500">{classroom.teacher?.name}</p>
                        </div>
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl"
                          style={{
                            backgroundColor: activeTopic
                              ? activeTopic.color + "20"
                              : "#6366f120",
                          }}
                        >
                          <Zap
                            className="h-5 w-5"
                            style={{ color: activeTopic?.color || "#6366f1" }}
                          />
                        </div>
                      </div>

                      {activeTopic ? (
                        <div className="mb-3 rounded-2xl bg-gradient-to-r from-indigo-50 to-pink-50 p-3">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="rounded-full bg-indigo-500 px-2 py-0.5 text-xs font-bold text-white">
                              Semana {classroom.currentWeek}
                            </span>
                            {hasCompletedCurrentWeek && (
                              <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                                <Star className="h-3 w-3" fill="currentColor" />
                                Completado
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-gray-900">{activeTopic.name}</p>
                        </div>
                      ) : (
                        <div className="mb-3 rounded-2xl bg-gray-100 p-3">
                          <p className="text-sm text-gray-500">Sin reto activo</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Users className="h-4 w-4" />
                          {classroom.students?.length || 0} companeros
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        {results.length > 0 && (
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-indigo-900">
              <Medal className="h-6 w-6 text-yellow-500" />
              Actividad Reciente
            </h2>

            <div className="space-y-3">
              {results.slice(0, 5).map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-md"
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ backgroundColor: (result.topic?.color || "#6366f1") + "20" }}
                  >
                    <Zap className="h-6 w-6" style={{ color: result.topic?.color || "#6366f1" }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{result.topic?.name || "Reto"}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-3 w-3" />
                      {Math.round(result.timeSpent / 60)}m
                    </div>
                  </div>
                  <div
                    className={`rounded-full px-3 py-1 text-sm font-bold ${
                      result.score >= 80
                        ? "bg-green-100 text-green-700"
                        : result.score >= 60
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {result.score}%
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Avatar Selector Modal */}
      <AnimatePresence>
        {showAvatarSelector && (
          <AvatarSelector
            currentAvatarId={user.avatarId}
            onSelect={handleAvatarChange}
            onClose={() => setShowAvatarSelector(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
