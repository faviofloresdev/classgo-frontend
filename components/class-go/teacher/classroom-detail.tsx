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
  Target,
} from "lucide-react"
import { getClassroomPedagogicalTagsOverview, getStudentPedagogicalTags } from "@/lib/api"
import type {
  ClassroomPedagogicalTagsOverview,
  ClassroomWithDetails,
  PedagogicalTagMetric,
  StudentPedagogicalTagsOverview,
  StudentResultWithDetails,
} from "@/lib/types"
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
  const [overviewSort, setOverviewSort] = useState<"worst" | "best" | "usage">("worst")
  const [pedagogicalOverview, setPedagogicalOverview] = useState<ClassroomPedagogicalTagsOverview | null>(null)
  const [studentTagOverview, setStudentTagOverview] = useState<StudentPedagogicalTagsOverview | null>(null)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [isOverviewLoading, setIsOverviewLoading] = useState(true)
  const [isStudentOverviewLoading, setIsStudentOverviewLoading] = useState(false)
  const [overviewError, setOverviewError] = useState<string | null>(null)
  const [studentOverviewError, setStudentOverviewError] = useState<string | null>(null)

  useEffect(() => {
    setSelectedWeek(classroom.currentWeek || 1)
  }, [classroom.currentWeek])

  useEffect(() => {
    let isCancelled = false
    setIsOverviewLoading(true)
    setOverviewError(null)

    void getClassroomPedagogicalTagsOverview(classroom.id)
      .then((overview) => {
        if (!isCancelled) {
          setPedagogicalOverview(overview)
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setPedagogicalOverview(null)
          setOverviewError("We couldn't load the pedagogical tags overview for this classroom.")
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsOverviewLoading(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [classroom.id])

  useEffect(() => {
    if (!selectedStudentId) {
      setStudentTagOverview(null)
      setStudentOverviewError(null)
      return
    }

    let isCancelled = false
    setIsStudentOverviewLoading(true)
    setStudentOverviewError(null)

    void getStudentPedagogicalTags(classroom.id, selectedStudentId)
      .then((overview) => {
        if (!isCancelled) {
          setStudentTagOverview(overview)
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setStudentTagOverview(null)
          setStudentOverviewError("We couldn't load this student's pedagogical tag details.")
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsStudentOverviewLoading(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [classroom.id, selectedStudentId])

  const getStudentTagStatus = (metric: PedagogicalTagMetric) => {
    if (metric.accuracy >= 0.85) return { label: "Strong", className: "bg-green-100 text-green-700" }
    if (metric.accuracy >= 0.6) return { label: "Developing", className: "bg-yellow-100 text-yellow-700" }
    return { label: "Needs support", className: "bg-red-100 text-red-700" }
  }

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
  const sortedOverviewMetrics = [...(pedagogicalOverview?.metrics || [])].sort((a, b) => {
    if (overviewSort === "best") return b.accuracy - a.accuracy
    if (overviewSort === "usage") return b.answeredCount - a.answeredCount
    return a.accuracy - b.accuracy
  })

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
                <motion.button
                  key={student.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    setSelectedStudentId((current) => (current === student.id ? null : student.id))
                  }}
                  className={`flex w-full items-center gap-4 rounded-xl border bg-background p-4 text-left ${
                    selectedStudentId === student.id ? "border-primary bg-primary/5" : "border-border"
                  }`}
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
                </motion.button>
              )
            })}
          </div>
        ) : (
          <p className="py-8 text-center text-muted-foreground">
            There are no students in this classroom
          </p>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">Pedagogical Tags Overview</h3>
              <p className="text-sm text-muted-foreground">See where the class is strongest and where students need more support.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "worst", label: "Worst accuracy" },
                { id: "best", label: "Best accuracy" },
                { id: "usage", label: "Most used" },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setOverviewSort(option.id as "worst" | "best" | "usage")}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    overviewSort === option.id
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background text-muted-foreground"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {isOverviewLoading ? (
              <p className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
                Loading pedagogical analytics...
              </p>
            ) : overviewError ? (
              <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-10 text-center text-sm text-destructive">
                {overviewError}
              </p>
            ) : sortedOverviewMetrics.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
                No pedagogical tag data is available yet for this classroom.
              </p>
            ) : (
              sortedOverviewMetrics.map((metric) => (
                <div key={metric.slug} className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{metric.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">{Math.round(metric.accuracy * 100)}%</p>
                      <p className="text-xs text-muted-foreground">accuracy</p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-4">
                    <div className="rounded-xl bg-muted/30 p-3">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Questions</p>
                      <p className="mt-1 text-lg font-bold text-foreground">{metric.questionCount}</p>
                    </div>
                    <div className="rounded-xl bg-muted/30 p-3">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Answers</p>
                      <p className="mt-1 text-lg font-bold text-foreground">{metric.answeredCount}</p>
                    </div>
                    <div className="rounded-xl bg-muted/30 p-3">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Correct</p>
                      <p className="mt-1 text-lg font-bold text-foreground">{metric.correctCount}</p>
                    </div>
                    <div className="rounded-xl bg-muted/30 p-3">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Avg score</p>
                      <p className="mt-1 text-lg font-bold text-foreground">{metric.averageScore}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Student Tag Detail</h3>
              <p className="text-sm text-muted-foreground">
                {selectedStudentId
                  ? "Strengths and areas of support by tag."
                  : "Choose a student above to see their pedagogical tags."}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {!selectedStudentId ? (
              <p className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
                Select a student card to open their pedagogical tag analytics.
              </p>
            ) : isStudentOverviewLoading ? (
              <p className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
                Loading student analytics...
              </p>
            ) : studentOverviewError ? (
              <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-10 text-center text-sm text-destructive">
                {studentOverviewError}
              </p>
            ) : !studentTagOverview || studentTagOverview.metrics.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
                No pedagogical tag data is available yet for this student.
              </p>
            ) : (
              <>
                <div className="rounded-2xl bg-muted/20 p-4">
                  <p className="text-sm text-muted-foreground">Student</p>
                  <p className="text-lg font-bold text-foreground">{studentTagOverview.studentName}</p>
                </div>
                {studentTagOverview.metrics.map((metric) => {
                  const status = getStudentTagStatus(metric)

                  return (
                    <div key={metric.slug} className="rounded-2xl border border-border bg-background p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">{metric.name}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="mt-3 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-2xl font-bold text-foreground">{Math.round(metric.accuracy * 100)}%</p>
                          <p className="text-xs text-muted-foreground">accuracy</p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <p>{metric.correctCount}/{metric.answeredCount} correct</p>
                          <p>Average score {metric.averageScore}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </>
            )}
          </div>
        </div>
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
