"use client"

import { useEffect, useMemo, useRef, useState } from "react"
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
  Plus,
  Rocket,
  ArrowRight,
} from "lucide-react"
import type {
  AchievementPayload,
  AchievementProgressSnapshot,
  ClassroomWithDetails,
  StudentResultWithDetails,
  Topic,
  User,
} from "@/lib/types"
import { getAvatarUrl } from "@/lib/avatars"
import { AvatarSelector } from "../avatar-selector"
import { StudentClassroomView } from "./student-classroom-view"
import { HexBadgeSVG } from "@/components/class-go/badge-visual"
import { getBadgeProgress, mergeAchievementPayloads, mergeAchievementProgress } from "@/lib/badges"
import {
  connectGameplayPresence,
  disconnectGameplayPresence,
  getClassroomLeaderboard,
  getGameplayContext,
  getStudentClassrooms,
  getStudentResults,
  heartbeatGameplayPresence,
  joinClassroom,
  subscribeToGameplayStream,
  trackAchievementFeatureUse,
  updateProfile,
} from "@/lib/api"

interface StudentDashboardProps {
  user: User
  achievementProgress?: AchievementProgressSnapshot | null
  onAchievementEvent: (payload: AchievementPayload | null | undefined) => void
  onOpenRewards: () => void
  onLogout: () => void
  onUserUpdate: (user: User) => void
  onStartChallenge: (classroomId: string, options?: { retryCount?: number; forceRetry?: boolean }) => Promise<void>
}

interface PresenceNotification {
  id: string
  classroomName: string
  studentName: string
  avatarId: string
  message: string
}

type ConnectedStudentsByClassroom = Record<string, string[]>

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

export function StudentDashboard({
  user,
  achievementProgress,
  onAchievementEvent,
  onOpenRewards,
  onLogout,
  onUserUpdate,
  onStartChallenge,
}: StudentDashboardProps) {
  const [classrooms, setClassrooms] = useState<ClassroomWithDetails[]>([])
  const [results, setResults] = useState<StudentResultWithDetails[]>([])
  const [showAvatarSelector, setShowAvatarSelector] = useState(false)
  const [showParentAvatarSelector, setShowParentAvatarSelector] = useState(false)
  const [selectedClassroom, setSelectedClassroom] = useState<ClassroomWithDetails | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [joinCode, setJoinCode] = useState("")
  const [joinError, setJoinError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLeaderboard, setSelectedLeaderboard] = useState<Awaited<ReturnType<typeof getClassroomLeaderboard>>>([])
  const [presenceNotification, setPresenceNotification] = useState<PresenceNotification | null>(null)
  const [connectedStudentsByClassroom, setConnectedStudentsByClassroom] = useState<ConnectedStudentsByClassroom>({})
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const seenPresenceEventsRef = useRef<Set<string>>(new Set())

  const loadStudentData = async () => {
    setIsLoading(true)
    try {
      const [nextClassrooms, nextResults] = await Promise.all([
        getStudentClassrooms(),
        getStudentResults(),
      ])

      setClassrooms(nextClassrooms)
      setResults(nextResults)

      if (selectedClassroom) {
        const refreshed = nextClassrooms.find((classroom) => classroom.id === selectedClassroom.id) || null
        setSelectedClassroom(refreshed)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadStudentData()
  }, [user.id])

  useEffect(() => {
    if (typeof Audio === "undefined") {
      return
    }

    const audio = new Audio("/audio/friendConnected.mp3")
    audio.preload = "auto"
    audioRef.current = audio

    return () => {
      audio.pause()
      audioRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!selectedClassroom) {
      return
    }

    let isActive = true
    const classroomId = selectedClassroom.id
    let hasPresenceConnection = false
    let heartbeatId: ReturnType<typeof setInterval> | null = null
    let connectFallbackId: ReturnType<typeof setTimeout> | null = null

    const startPresenceConnection = async () => {
      if (!isActive || hasPresenceConnection) {
        return
      }

      try {
        await connectGameplayPresence(classroomId)
        if (!isActive) {
          return
        }

        hasPresenceConnection = true
        setConnectedStudentsByClassroom((currentState) => {
          const existingStudentIds = currentState[classroomId] || []
          const mergedStudentIds = Array.from(new Set([...existingStudentIds, user.id]))

          return {
            ...currentState,
            [classroomId]: mergedStudentIds,
          }
        })

        heartbeatId = setInterval(() => {
          void heartbeatGameplayPresence(classroomId).catch(() => undefined)
        }, 20000)
      } catch {
        // Presence falls back to backend timeout if connect fails.
      }
    }

    const unsubscribe = subscribeToGameplayStream(classroomId, {
      onSubscribed: () => {
        if (connectFallbackId) {
          clearTimeout(connectFallbackId)
          connectFallbackId = null
        }

        void startPresenceConnection()
      },
      onPresenceSnapshot: (event) => {
        if (!isActive) {
          return
        }

        setConnectedStudentsByClassroom((currentState) => {
          const existingStudentIds = currentState[event.classroomId] || []
          const snapshotStudentIds = event.students.map((student) => student.studentId)
          const mergedStudentIds = Array.from(new Set([...existingStudentIds, ...snapshotStudentIds]))

          return {
            ...currentState,
            [event.classroomId]: mergedStudentIds,
          }
        })
      },
      onStudentConnected: (event) => {
        if (!isActive || event.studentId === user.id) {
          return
        }

        const eventKey = `${event.classroomId}:${event.studentId}:${event.happenedAt}`
        if (seenPresenceEventsRef.current.has(eventKey)) {
          return
        }

        seenPresenceEventsRef.current.add(eventKey)
        if (seenPresenceEventsRef.current.size > 100) {
          const oldestKey = seenPresenceEventsRef.current.values().next().value
          if (oldestKey) {
            seenPresenceEventsRef.current.delete(oldestKey)
          }
        }

        setConnectedStudentsByClassroom((currentState) => {
          const existingStudentIds = currentState[event.classroomId] || []
          if (existingStudentIds.includes(event.studentId)) {
            return currentState
          }

          return {
            ...currentState,
            [event.classroomId]: [...existingStudentIds, event.studentId],
          }
        })

        setPresenceNotification({
          id: eventKey,
          classroomName: selectedClassroom.name,
          studentName: event.studentName,
          avatarId: event.avatarId || "animal-1",
          message: event.message || `${event.studentName} connected to the classroom.`,
        })

        if (audioRef.current) {
          audioRef.current.currentTime = 0
          void audioRef.current.play().catch(() => undefined)
        }
      },
      onStudentDisconnected: (event) => {
        if (!isActive || event.studentId === user.id) {
          return
        }

        setConnectedStudentsByClassroom((currentState) => {
          const existingStudentIds = currentState[event.classroomId] || []
          const nextStudentIds = existingStudentIds.filter((studentId) => studentId !== event.studentId)

          if (nextStudentIds.length === existingStudentIds.length) {
            return currentState
          }

          return {
            ...currentState,
            [event.classroomId]: nextStudentIds,
          }
        })
      },
    })

    connectFallbackId = setTimeout(() => {
      void startPresenceConnection()
    }, 1500)

    return () => {
      isActive = false
      if (heartbeatId) {
        clearInterval(heartbeatId)
      }
      if (connectFallbackId) {
        clearTimeout(connectFallbackId)
      }
      setConnectedStudentsByClassroom((currentState) => {
        const nextState = { ...currentState }
        delete nextState[classroomId]
        return nextState
      })

      if (hasPresenceConnection) {
        void disconnectGameplayPresence(classroomId, { keepalive: true })
          .catch(() => undefined)
          .finally(unsubscribe)
        return
      }

      unsubscribe()
    }
  }, [selectedClassroom, user.id])

  useEffect(() => {
    if (!presenceNotification) {
      return
    }

    const timeout = setTimeout(() => {
      setPresenceNotification((currentNotification) =>
        currentNotification?.id === presenceNotification.id ? null : currentNotification
      )
    }, 5000)

    return () => {
      clearTimeout(timeout)
    }
  }, [presenceNotification])

  const totalScore = useMemo(
    () => results.reduce((sum, result) => sum + result.score, 0),
    [results]
  )
  const achievementSummary = useMemo(
    () => mergeAchievementProgress(achievementProgress, results),
    [achievementProgress, results]
  )
  const badgeProgress = useMemo(
    () =>
      getBadgeProgress({
        user,
        results,
        progress: achievementSummary,
        recentAchievements: user.achievements?.newlyUnlockedAchievements,
      }),
    [achievementSummary, results, user]
  )
  const unlockedBadges = badgeProgress.filter((badge) => badge.unlocked)
  const completedChallenges = achievementSummary.completedChallenges
  const avgScore = completedChallenges > 0 ? Math.round(totalScore / completedChallenges) : 0
  const currentStreak = achievementSummary.currentWeeklyStreak

  const handleAvatarChange = async (avatarId: string, name?: string) => {
    const updated = await updateProfile({
      studentAvatarId: avatarId,
      name: name?.trim() ? name.trim() : user.name,
    })
    onUserUpdate(updated)
    const trimmedName = name?.trim()
    const featurePayloads = await Promise.all([
      trackAchievementFeatureUse("UPDATE_AVATAR").catch(() => null),
      trimmedName && trimmedName !== user.name
        ? trackAchievementFeatureUse("EDIT_PROFILE").catch(() => null)
        : Promise.resolve(null),
    ])
    onAchievementEvent(mergeAchievementPayloads(updated.achievements, ...featurePayloads))
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)
  }

  const handleParentAvatarChange = async (avatarId: string) => {
    const updated = await updateProfile({
      parentAvatarId: avatarId,
    })
    onUserUpdate(updated)
    const featurePayload = await trackAchievementFeatureUse("UPDATE_AVATAR").catch(() => null)
    onAchievementEvent(mergeAchievementPayloads(updated.achievements, featurePayload))
  }

  const handleJoinClassroom = async () => {
    setJoinError("")
    try {
      await joinClassroom(joinCode.trim().toUpperCase())
      setJoinCode("")
      await loadStudentData()
      const featurePayload = await trackAchievementFeatureUse("JOIN_CLASSROOM").catch(() => null)
      onAchievementEvent(featurePayload)
    } catch (error) {
      setJoinError(error instanceof Error ? error.message : "Could not join the classroom.")
    }
  }

  const openClassroom = async (classroom: ClassroomWithDetails) => {
    await getGameplayContext(classroom.id).catch(() => undefined)
    setSelectedClassroom(classroom)
    const leaderboard = await getClassroomLeaderboard(classroom.id, classroom.currentWeek).catch(() => [])
    setSelectedLeaderboard(leaderboard)
  }

  const presenceNotificationBanner = presenceNotification ? (
    <AnimatePresence>
      <motion.div
        key={presenceNotification.id}
        initial={{ opacity: 0, y: -24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -16, scale: 0.98 }}
        className="fixed right-4 top-4 z-50 w-[min(360px,calc(100vw-2rem))]"
      >
        <div className="overflow-hidden rounded-3xl border border-indigo-100 bg-white/95 p-4 shadow-2xl backdrop-blur">
          <div className="flex items-start gap-3">
            <img
                  src={getAvatarUrl(presenceNotification.avatarId)}
              alt={presenceNotification.studentName}
              className="h-12 w-12 rounded-2xl border-2 border-white bg-white shadow-md"
              crossOrigin="anonymous"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-indigo-900">
                {presenceNotification.studentName} joined {presenceNotification.classroomName}
              </p>
              <p className="mt-1 text-sm text-indigo-700">{presenceNotification.message}</p>
            </div>
            <button
              onClick={() => setPresenceNotification(null)}
              className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-600 transition-colors hover:bg-indigo-100"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  ) : null

  if (selectedClassroom) {
    return (
      <>
        <StudentClassroomView
          user={user}
          classroom={selectedClassroom}
          results={results.filter((result) => result.classroomId === selectedClassroom.id)}
          leaderboard={selectedLeaderboard}
          connectedStudentIds={connectedStudentsByClassroom[selectedClassroom.id] || [user.id]}
          onBack={() => setSelectedClassroom(null)}
          onStartChallenge={onStartChallenge}
        />
        {presenceNotificationBanner}
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-indigo-50 to-pink-100">
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

      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-500 text-white shadow-lg"
            >
              <Rocket className="h-6 w-6" />
            </motion.div>
            <span className="text-xl font-black text-indigo-900">ClassGo</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex items-end -space-x-3 pr-2">
              <motion.button
                whileHover={{ scale: 1.08 }}
                onClick={() => setShowParentAvatarSelector(true)}
                className="rounded-full"
                aria-label="Change parent avatar"
                title="Parent avatar"
              >
                <img
                  src={getAvatarUrl(user.parentAvatarId || "parent-1")}
                  alt="Parent avatar"
                  className="h-10 w-10 rounded-full border-2 border-white bg-white object-cover shadow-sm"
                  crossOrigin="anonymous"
                />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.08 }}
                onClick={() => setShowAvatarSelector(true)}
                className="relative rounded-full"
                aria-label="Change student avatar"
                title="Student avatar"
              >
                <img
                  src={getAvatarUrl(user.studentAvatarId || user.avatarId)}
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
              </motion.button>
            </div>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#4f46e5_0%,#7c3aed_48%,#ec4899_100%)] p-5 text-white shadow-xl"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 inline-flex rounded-full bg-white/20 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-yellow-100">
                Are you ready?
              </div>
              <h1 className="text-2xl font-black md:text-3xl">
                Hi, <span className="text-yellow-200">{user.name.split(" ")[0]}</span>!
              </h1>
              <p className="mt-2 max-w-xl text-sm font-semibold text-white/85 md:text-base">
                Pick your classroom, start your challenge, and win new badges today.
              </p>
            </div>
            <div className="flex items-center gap-3 self-start rounded-[1.5rem] bg-white/12 px-4 py-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-xl">
                ★
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-white/70">Let&apos;s go!</p>
                <p className="text-sm font-bold text-white">Your next challenge is waiting.</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              icon: Trophy,
              value: totalScore,
              label: "Total Points",
              color: "from-yellow-400 to-orange-500",
              iconBg: "bg-yellow-100",
              iconColor: "text-yellow-600",
            },
            {
              icon: Target,
              value: completedChallenges,
              label: "Completed Challenges",
              color: "from-green-400 to-emerald-500",
              iconBg: "bg-green-100",
              iconColor: "text-green-600",
            },
            {
              icon: Star,
              value: `${avgScore}`,
              label: "Average Points",
              color: "from-blue-400 to-indigo-500",
              iconBg: "bg-blue-100",
              iconColor: "text-blue-600",
            },
            {
              icon: Flame,
              value: currentStreak,
              label: "Day Streak",
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

        <div className="mb-8 rounded-3xl bg-white p-5 shadow-lg">
          <div className="mb-3 flex items-center gap-2">
            <Plus className="h-5 w-5 text-indigo-500" />
            <h2 className="text-lg font-black text-indigo-900">Join a Classroom</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={joinCode}
              onChange={(e) => {
                setJoinCode(e.target.value.toUpperCase())
                setJoinError("")
              }}
              placeholder="Classroom code"
              maxLength={10}
              className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 font-semibold uppercase tracking-[0.2em] text-gray-900 outline-none transition-colors focus:border-indigo-400"
            />
            <button
              onClick={() => {
                void handleJoinClassroom()
              }}
              disabled={joinCode.trim().length < 4}
              className="rounded-2xl bg-gradient-to-r from-indigo-500 to-pink-500 px-6 py-3 font-bold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              Join
            </button>
          </div>
          {joinError && <p className="mt-3 text-sm text-red-600">{joinError}</p>}
        </div>

        <div className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-indigo-900">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            My Classrooms
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
              <h3 className="mb-2 text-lg font-bold text-gray-900">You are not in any classroom yet</h3>
              <p className="text-gray-500">Use your teacher's code to join one</p>
            </motion.div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {classrooms.map((classroom, index) => {
                const activeTopic = getActiveTopic(classroom)
                const classroomResults = results.filter((result) => result.classroomId === classroom.id)
                const hasCompletedCurrentWeek = classroomResults.some(
                  (result) => result.weekNumber === classroom.currentWeek
                )

                return (
                  <motion.button
                    key={classroom.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      void openClassroom(classroom)
                    }}
                    className="relative overflow-hidden rounded-3xl bg-white p-5 text-left shadow-lg transition-shadow hover:shadow-xl"
                  >
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
                            backgroundColor: activeTopic ? activeTopic.color + "20" : "#6366f120",
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
                              Week {classroom.currentWeek}
                            </span>
                            {hasCompletedCurrentWeek && (
                              <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                                <Star className="h-3 w-3" fill="currentColor" />
                                Completed
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-gray-900">{activeTopic.name}</p>
                        </div>
                      ) : (
                        <div className="mb-3 rounded-2xl bg-gray-100 p-3">
                          <p className="text-sm text-gray-500">No active challenge</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Users className="h-4 w-4" />
                          {classroom.students?.length || 0} classmates
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

        <div className="mb-8 overflow-hidden rounded-3xl bg-white shadow-lg">
          <div className="bg-gradient-to-r from-indigo-50 via-sky-50 to-pink-50 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-black text-indigo-900">
                  <Medal className="h-6 w-6 text-amber-500" />
                  Rewards Summary
                </h2>
                <p className="mt-1 text-sm text-indigo-700">
                  Keep unlocking badges as you complete challenges, maintain streaks, and explore Class Go.
                </p>
              </div>
              <button
                onClick={onOpenRewards}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-indigo-900 shadow-sm transition-colors hover:bg-indigo-50"
              >
                Open rewards guide
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Unlocked</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{unlockedBadges.length}</p>
                <p className="mt-1 text-sm text-slate-500">out of {badgeProgress.length} total badges</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Closest Goal</p>
                <p className="mt-2 text-lg font-black text-slate-900">
                  {badgeProgress.find((badge) => !badge.unlocked)?.name || "All unlocked"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {badgeProgress.find((badge) => !badge.unlocked)?.progressLabel || "Amazing work"}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Latest Unlocks</p>
                <div className="mt-3 flex flex-wrap justify-center gap-3 lg:justify-start">
                  {unlockedBadges.slice(-3).map((badge) => (
                    <div key={badge.id} className="flex items-center gap-2">
                      <HexBadgeSVG badge={badge} size={66} compact />
                      <span className="text-xs font-bold text-slate-700">{badge.name}</span>
                    </div>
                  ))}
                  {unlockedBadges.length === 0 && (
                    <span className="text-sm text-slate-500">Your first badges will appear here.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {results.length > 0 && (
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-indigo-900">
              <Medal className="h-6 w-6 text-yellow-500" />
              Recent Activity
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
                    <p className="font-bold text-gray-900">{result.topic?.name || "Challenge"}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-3 w-3" />
                      {formatDuration(result.timeSpent)}
                    </div>
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
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {showAvatarSelector && (
          <AvatarSelector
            currentAvatarId={user.studentAvatarId || user.avatarId}
            currentName={user.name}
            showNameField
            title="Student Avatar"
            description="Choose the avatar that represents the student."
            onSelect={(avatarId, name) => {
              return handleAvatarChange(avatarId, name)
            }}
            onClose={() => setShowAvatarSelector(false)}
          />
        )}

        {showParentAvatarSelector && (
          <AvatarSelector
            currentAvatarId={user.parentAvatarId || "parent-1"}
            title="Parent Avatar"
            description="Choose the avatar that represents the parent."
            onSelect={(avatarId) => {
              return handleParentAvatarChange(avatarId)
            }}
            onClose={() => setShowParentAvatarSelector(false)}
          />
        )}
      </AnimatePresence>

      {isLoading && <div className="fixed inset-x-0 top-0 h-1 animate-pulse bg-indigo-500" />}
      {presenceNotificationBanner}
    </div>
  )
}
