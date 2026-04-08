"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Users,
  Calendar,
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Zap,
} from "lucide-react"
import type { ClassroomWithDetails, StudentResultWithDetails, User } from "@/lib/types"
import { getAvatarUrl } from "@/lib/avatars"

interface ClassroomDetailProps {
  classroom: ClassroomWithDetails
  results: StudentResultWithDetails[]
  onBack: () => void
  onPreviousWeek: () => void
  onAdvanceWeek: () => void
}

export function ClassroomDetail({
  classroom,
  results,
  onBack,
  onPreviousWeek,
  onAdvanceWeek,
}: ClassroomDetailProps) {
  const [showHistory, setShowHistory] = useState(false)
  const [selectedWeek, setSelectedWeek] = useState<number>(classroom.currentWeek || 1)

  useEffect(() => {
    setSelectedWeek(classroom.currentWeek || 1)
  }, [classroom.currentWeek])

  // Group results by week
  const resultsByWeek = results.reduce(
    (acc, r) => {
      if (!acc[r.weekNumber]) acc[r.weekNumber] = []
      acc[r.weekNumber].push(r)
      return acc
    },
    {} as Record<number, StudentResultWithDetails[]>
  )

  const displayedWeek = selectedWeek || classroom.currentWeek || 1
  const currentWeekResults = resultsByWeek[displayedWeek] || []
  const pastWeeks = Object.keys(resultsByWeek)
    .map(Number)
    .filter((w) => w < classroom.currentWeek)
    .sort((a, b) => b - a)

  // The active topic badge follows the plan's single active week.
  const activeTopic = classroom.plan?.topics.find((t) => t.isActive)
  const activeColor = activeTopic?.topic.color || "#7C3AED"
  const activeColorSoft = `${activeColor}22`

  // Calculate stats
  const completedStudents = currentWeekResults.filter((r) => r.score > 0).length
  const avgScore =
    currentWeekResults.length > 0
      ? Math.round(currentWeekResults.reduce((sum, r) => sum + r.score, 0) / currentWeekResults.length)
      : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="rounded-xl border border-border p-3 text-muted-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </motion.button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{classroom.name}</h1>
          <p className="text-muted-foreground">Code: {classroom.code}</p>
        </div>
      </div>

      {/* Week Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-border bg-card"
      >
        <div
          className="p-6 text-white"
          style={{
            background: `linear-gradient(90deg, ${activeColor} 0%, ${activeColor}CC 100%)`,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-2 text-sm font-medium text-white/80">Current Week</p>
              <h2 className="text-3xl font-bold">{displayedWeek || "Not started"}</h2>
            </div>
            {activeTopic && (
              <div className="rounded-xl px-4 py-2" style={{ backgroundColor: "rgba(255,255,255,0.18)" }}>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  <span className="font-semibold">{activeTopic.topic.name}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-sm">Students</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {classroom.students?.length || 0}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm">Completed</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">{completedStudents}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Trophy className="h-4 w-4" />
              <span className="text-sm">Average</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">{avgScore}%</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <XCircle className="h-4 w-4" />
              <span className="text-sm">Pending</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {(classroom.students?.length || 0) - completedStudents}
            </p>
          </div>
        </div>

        {classroom.plan && classroom.currentWeek > 0 && (
          <div className="border-t border-border p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={onPreviousWeek}
                disabled={classroom.currentWeek <= 1}
                className="w-full rounded-xl border border-border py-3 font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Go Back to Week {Math.max(classroom.currentWeek - 1, 1)}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={onAdvanceWeek}
                className="w-full rounded-xl py-3 font-semibold text-white"
                style={{ backgroundColor: activeColor }}
              >
                Move to Week {classroom.currentWeek + 1}
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Students List */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-bold text-foreground">
          Students - Week {displayedWeek}
        </h3>

        {classroom.students && classroom.students.length > 0 ? (
          <div className="space-y-3">
            {classroom.students.map((student, index) => {
              const result = currentWeekResults.find((r) => r.studentId === student.id)
              return (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 rounded-xl border border-border bg-background p-4"
                >
                  <img
                    src={getAvatarUrl(student.studentAvatarId || student.avatarId)}
                    alt={student.name}
                    className="h-12 w-12 rounded-full bg-muted"
                    crossOrigin="anonymous"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{student.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {result ? `Completed - ${result.score}%` : "Pending"}
                    </p>
                  </div>
                  {result ? (
                    <div className="flex items-center gap-2">
                      <div
                        className={`rounded-full px-3 py-1 text-sm font-medium ${
                          result.score >= 80
                            ? "bg-green-100 text-green-700"
                            : result.score >= 60
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {result.score}%
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {Math.round(result.timeSpent / 60)}m
                      </div>
                    </div>
                  ) : (
                    <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                      Pending
                    </span>
                  )}
                </motion.div>
              )
            })}
          </div>
        ) : (
          <p className="py-8 text-center text-muted-foreground">
            There are no students in this classroom
          </p>
        )}
      </div>

      {/* Week History (Archived) */}
      {pastWeeks.length > 0 && (
        <div className="rounded-2xl border border-border bg-card">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex w-full items-center justify-between p-6"
          >
            <h3 className="text-lg font-bold text-foreground">
              Week History ({pastWeeks.length})
            </h3>
            {showHistory ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
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
                <div className="border-t border-border p-6 pt-0">
                  <div className="mt-4 space-y-2">
                    {pastWeeks.map((week) => {
                      const weekResults = resultsByWeek[week] || []
                      const weekAvg =
                        weekResults.length > 0
                          ? Math.round(
                              weekResults.reduce((sum, r) => sum + r.score, 0) / weekResults.length
                            )
                          : 0
                      return (
                        <button
                          key={week}
                          onClick={() => setSelectedWeek(week)}
                          className="flex w-full items-center justify-between rounded-xl border border-border bg-background p-4 text-left transition-colors hover:bg-muted"
                          style={selectedWeek === week ? { borderColor: activeColor, backgroundColor: activeColorSoft } : undefined}
                        >
                          <div>
                            <p className="font-semibold text-foreground">Week {week}</p>
                            <p className="text-sm text-muted-foreground">
                              {weekResults.length} results
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">{weekAvg}%</p>
                            <p className="text-sm text-muted-foreground">average</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
