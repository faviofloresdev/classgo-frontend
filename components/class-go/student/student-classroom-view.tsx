"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Trophy,
  Star,
  Zap,
  Medal,
  Clock,
  Users,
  Play,
  Crown,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Calendar,
} from "lucide-react"
import type { ClassroomWithDetails, LeaderboardEntry, StudentResultWithDetails, Topic, User } from "@/lib/types"
import { getAvatarUrl } from "@/lib/avatars"

interface StudentClassroomViewProps {
  user: User
  classroom: ClassroomWithDetails
  results: StudentResultWithDetails[]
  leaderboard: LeaderboardEntry[]
  connectedStudentIds: string[]
  onBack: () => void
  onStartChallenge: (classroomId: string, options?: { retryCount?: number; forceRetry?: boolean }) => Promise<void>
}

function getActiveTopic(classroom: ClassroomWithDetails): Topic | undefined {
  return classroom.plan?.topics.find((topic) => topic.isActive)?.topic
}

function formatDuration(seconds: number) {
  if (seconds < 60) {
    return `${seconds}s`
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (remainingSeconds === 0) {
    return `${minutes}m`
  }

  return `${minutes}m ${remainingSeconds}s`
}

export function StudentClassroomView({
  user,
  classroom,
  results,
  leaderboard,
  connectedStudentIds,
  onBack,
  onStartChallenge,
}: StudentClassroomViewProps) {
  const [showHistory, setShowHistory] = useState(false)
  const activeTopic = getActiveTopic(classroom)
  const myResults = results
  const myCurrentWeekResult = myResults.find((result) => result.weekNumber === classroom.currentWeek)
  const pastWeeksResults = myResults
    .filter((result) => result.weekNumber < classroom.currentWeek)
    .sort((a, b) => b.weekNumber - a.weekNumber)

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { icon: Crown, color: "text-yellow-500", bg: "bg-yellow-100" }
    if (rank === 2) return { icon: Medal, color: "text-gray-400", bg: "bg-gray-100" }
    if (rank === 3) return { icon: Medal, color: "text-amber-600", bg: "bg-amber-100" }
    return { icon: Star, color: "text-indigo-500", bg: "bg-indigo-100" }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-indigo-50 to-pink-100">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-3 p-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="rounded-xl bg-indigo-100 p-3 text-indigo-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>
          <div className="flex-1">
            <h1 className="font-bold text-indigo-900">{classroom.name}</h1>
            <p className="text-sm text-indigo-600">{classroom.teacher?.name}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 overflow-hidden rounded-3xl bg-white shadow-xl"
        >
          <div
            className="relative p-6"
            style={{
              background: activeTopic
                ? `linear-gradient(135deg, ${activeTopic.color}, ${activeTopic.color}dd)`
                : "linear-gradient(135deg, #6366f1, #8b5cf6)",
            }}
          >
            <div className="absolute right-4 top-4 opacity-20">
              <Sparkles className="h-24 w-24 text-white" />
            </div>

            <div className="relative">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-bold text-white">
                  Week {classroom.currentWeek || 1}
                </span>
                {myCurrentWeekResult && (
                  <span className="flex items-center gap-1 rounded-full bg-green-500 px-3 py-1 text-sm font-bold text-white">
                    <Star className="h-3 w-3" fill="currentColor" />
                    Completed
                  </span>
                )}
              </div>

              <h2 className="mb-2 text-2xl font-black text-white md:text-3xl">
                {activeTopic?.name || "No active challenge"}
              </h2>

              {activeTopic && <p className="text-white/80">{activeTopic.description}</p>}
            </div>
          </div>

          <div className="p-6">
            {activeTopic ? (
              myCurrentWeekResult ? (
                <div className="py-4">
                  <div className="mb-6 flex flex-col items-center justify-center">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                      <Trophy className="h-10 w-10 text-green-600" />
                    </div>
                    <p className="mb-2 text-lg font-bold text-gray-900">Reto completado</p>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-black text-indigo-600">{myCurrentWeekResult.score}</div>
                        <div className="text-sm text-gray-500">Points</div>
                      </div>
                      <div className="h-12 w-px bg-gray-200" />
                      <div className="text-center">
                        <div className="text-3xl font-black text-indigo-600">
                          {formatDuration(myCurrentWeekResult.timeSpent)}
                        </div>
                        <div className="text-sm text-gray-500">Time</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        void onStartChallenge(classroom.id, { retryCount: 1, forceRetry: true })
                      }}
                      className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 to-pink-500 px-6 py-4 font-bold text-white shadow-lg transition-shadow hover:shadow-xl"
                    >
                      <Play className="h-6 w-6" fill="currentColor" />
                      Try again
                    </motion.button>
                  </div>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    void onStartChallenge(classroom.id)
                  }}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-pink-500 py-4 font-bold text-white shadow-lg transition-shadow hover:shadow-xl"
                >
                  <Play className="h-6 w-6" fill="currentColor" />
                  Start challenge
                </motion.button>
              )
            ) : (
              <div className="py-8 text-center text-gray-500">
                <Calendar className="mx-auto mb-2 h-12 w-12 text-gray-300" />
                <p>Wait for your teacher to activate the next challenge</p>
              </div>
            )}
          </div>
        </motion.div>

        {classroom.students && classroom.students.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-6 overflow-hidden rounded-3xl bg-white shadow-lg"
          >
            <div className="border-b border-gray-100 p-5">
              <h3 className="flex items-center gap-2 text-lg font-black text-indigo-900">
                <Users className="h-6 w-6 text-indigo-500" />
                Students in Class
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {classroom.students.length} classmates learning with you
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 p-4">
              {classroom.students.map((student, index) => {
                const isMe = student.id === user.id
                const isConnected = connectedStudentIds.includes(student.id)

                return (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.08 + index * 0.03 }}
                    className={`flex w-[120px] shrink-0 flex-col items-center rounded-2xl p-3 text-center sm:w-[132px] ${
                      isMe
                        ? "bg-gradient-to-b from-indigo-100 to-pink-100 ring-2 ring-indigo-400"
                        : isConnected
                          ? "bg-gradient-to-b from-emerald-50 to-green-100 ring-2 ring-emerald-300"
                          : "bg-gray-50"
                    }`}
                  >
                    <div className="relative mb-3">
                      <img
                        src={getAvatarUrl(student.studentAvatarId || student.avatarId)}
                        alt={student.name}
                        className="h-16 w-16 rounded-full border-4 border-white bg-white shadow-md"
                        crossOrigin="anonymous"
                      />
                      {isConnected && (
                        <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
                      )}
                    </div>
                    <p className="line-clamp-2 text-sm font-bold text-gray-900">
                      {student.name.split(" ").slice(0, 2).join(" ")}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center justify-center gap-1">
                      {isMe && (
                        <span className="rounded-full bg-indigo-500 px-2 py-0.5 text-xs font-bold text-white">
                          You
                        </span>
                      )}
                      {isConnected && (
                        <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white">
                          Online
                        </span>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 overflow-hidden rounded-3xl bg-white shadow-lg"
        >
          <div className="border-b border-gray-100 p-5">
            <h3 className="flex items-center gap-2 text-lg font-black text-indigo-900">
              <Trophy className="h-6 w-6 text-yellow-500" />
              Leaderboard - Week {classroom.currentWeek}
            </h3>
          </div>

          <div className="p-4">
            {leaderboard.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <Users className="mx-auto mb-2 h-12 w-12 text-gray-300" />
                <p>Be the first to complete the challenge</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.length >= 3 && (
                  <div className="mb-6 hidden items-end justify-center gap-4 sm:flex">
                    {[1, 0, 2].map((index) => {
                      const entry = leaderboard[index]
                      if (!entry) return null
                      const isFirst = index === 0
                      const isSecond = index === 1
                      return (
                        <motion.div
                          key={entry.student.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + index * 0.1 }}
                          className={`flex ${isFirst ? "w-28" : "w-24"} flex-col items-center`}
                        >
                          {isFirst && (
                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                              <Crown className="mb-1 h-8 w-8 text-yellow-500" />
                            </motion.div>
                          )}
                          <img
                            src={getAvatarUrl(entry.student.avatarId)}
                            alt={entry.student.name}
                            className={`mb-2 ${isFirst ? "h-20 w-20 border-4 border-yellow-400" : isSecond ? "h-16 w-16 border-3 border-gray-300" : "h-14 w-14 border-3 border-amber-500"} rounded-full bg-white shadow-lg`}
                            crossOrigin="anonymous"
                          />
                          <div
                            className={`w-full rounded-t-xl p-3 text-center ${
                              isFirst
                                ? "bg-gradient-to-b from-yellow-400 to-yellow-500"
                                : isSecond
                                ? "bg-gray-200"
                                : "bg-amber-100"
                            }`}
                          >
                            <div className={`mt-1 truncate text-sm font-bold ${isFirst ? "text-white" : isSecond ? "text-gray-700" : "text-amber-800"}`}>
                              {entry.student.name.split(" ")[0]}
                            </div>
                            <div className={`text-xs ${isFirst ? "text-white" : isSecond ? "text-gray-500" : "text-amber-600"}`}>
                              {entry.totalScore} pts
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}

                {leaderboard.map((entry, index) => {
                  const badge = getRankBadge(entry.rank)
                  const isMe = entry.student.id === user.id
                  return (
                    <motion.div
                      key={entry.student.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center gap-3 rounded-2xl p-3 ${
                        isMe
                          ? "bg-gradient-to-r from-indigo-100 to-pink-100 ring-2 ring-indigo-500"
                          : "bg-gray-50"
                      }`}
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${badge.bg}`}>
                        {entry.rank <= 3 ? (
                          <badge.icon className={`h-4 w-4 ${badge.color}`} />
                        ) : (
                          <span className="text-sm font-bold text-gray-500">{entry.rank}</span>
                        )}
                      </div>
                      <img
                        src={getAvatarUrl(entry.student.avatarId)}
                        alt={entry.student.name}
                        className="h-10 w-10 rounded-full border-2 border-white bg-white shadow"
                        crossOrigin="anonymous"
                      />
                      <div className="flex-1">
                        <p className={`font-bold ${isMe ? "text-indigo-900" : "text-gray-900"}`}>
                          {entry.student.name}
                          {isMe && (
                            <span className="ml-2 rounded-full bg-indigo-500 px-2 py-0.5 text-xs text-white">
                              Tu
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-indigo-600">{entry.totalScore}</div>
                        <div className="text-xs text-gray-500">puntos</div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>

        {pastWeeksResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="overflow-hidden rounded-3xl bg-white shadow-lg"
          >
            <button onClick={() => setShowHistory(!showHistory)} className="flex w-full items-center justify-between p-5">
              <h3 className="flex items-center gap-2 text-lg font-black text-indigo-900">
                <Clock className="h-6 w-6 text-indigo-500" />
                My History
              </h3>
              {showHistory ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>

            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-gray-100 p-4">
                    <div className="space-y-2">
                      {pastWeeksResults.map((result) => (
                        <div key={result.id} className="flex items-center gap-4 rounded-xl bg-gray-50 p-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
                            <span className="font-bold text-indigo-600">{result.weekNumber}</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-gray-900">{result.topic?.name || "Reto"}</p>
                            <p className="text-sm text-gray-500">Week {result.weekNumber}</p>
                          </div>
                          <div
                            className={`rounded-full px-3 py-1 text-sm font-bold ${
                              result.score >= 140
                                ? "bg-green-100 text-green-700"
                                : result.score >= 90
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {result.score} pts
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  )
}
