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
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Star,
  BarChart3,
  BookOpen,
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

// ─── helpers ──────────────────────────────────────────────────────────────────

function accuracyLevel(accuracy: number): {
  label: string
  shortLabel: string
  color: string
  bg: string
  ring: string
  icon: React.ReactNode
} {
  if (accuracy >= 0.85)
    return {
      label: "Strong",
      shortLabel: "Strong",
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      ring: "ring-emerald-200",
      icon: <Star className="h-3.5 w-3.5" />,
    }
  if (accuracy >= 0.6)
    return {
      label: "Developing",
      shortLabel: "OK",
      color: "text-amber-700",
      bg: "bg-amber-50",
      ring: "ring-amber-200",
      icon: <Minus className="h-3.5 w-3.5" />,
    }
  return {
    label: "Needs support",
    shortLabel: "Weak",
    color: "text-red-700",
    bg: "bg-red-50",
    ring: "ring-red-200",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  }
}

function AccuracyBar({ value, color }: { value: number; color?: string }) {
  const pct = Math.round(value * 100)
  const barColor =
    value >= 0.85
      ? "bg-emerald-500"
      : value >= 0.6
        ? "bg-amber-400"
        : "bg-red-400"

  return (
    <div className="flex items-center gap-2">
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`absolute inset-y-0 left-0 rounded-full ${barColor}`}
          style={color ? { backgroundColor: color } : undefined}
        />
      </div>
      <span className="w-9 text-right text-xs font-bold tabular-nums text-foreground">
        {pct}%
      </span>
    </div>
  )
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl bg-muted/40 px-3 py-2 text-center">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="text-base font-bold tabular-nums text-foreground">{value}</span>
    </div>
  )
}

// ─── Pedagogical Tags Overview card ───────────────────────────────────────────

function PedagogicalTagsOverview({
  isLoading,
  error,
  metrics,
  sort,
  onSortChange,
}: {
  isLoading: boolean
  error: string | null
  metrics: PedagogicalTagMetric[]
  sort: "worst" | "best" | "usage"
  onSortChange: (s: "worst" | "best" | "usage") => void
}) {
  const sortOptions = [
    { id: "worst" as const, label: "Needs work", icon: <TrendingDown className="h-3.5 w-3.5" /> },
    { id: "best" as const, label: "Strongest", icon: <TrendingUp className="h-3.5 w-3.5" /> },
    { id: "usage" as const, label: "Most answered", icon: <BarChart3 className="h-3.5 w-3.5" /> },
  ]

  // Summary counts
  const strong = metrics.filter((m) => m.accuracy >= 0.85).length
  const developing = metrics.filter((m) => m.accuracy >= 0.6 && m.accuracy < 0.85).length
  const needsSupport = metrics.filter((m) => m.accuracy < 0.6).length

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Pedagogical Tags — Class Overview</h3>
            <p className="text-sm text-muted-foreground">
              Where the class excels and where they need more support.
            </p>
          </div>
        </div>

        {/* Sort pills */}
        <div className="flex flex-wrap gap-1.5">
          {sortOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSortChange(opt.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                sort === opt.id
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary strip */}
      {!isLoading && !error && metrics.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-muted/30 p-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Star className="h-3 w-3" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Strong</p>
              <p className="text-sm font-bold text-foreground">{strong} tags</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <Minus className="h-3 w-3" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Developing</p>
              <p className="text-sm font-bold text-foreground">{developing} tags</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-700">
              <AlertTriangle className="h-3 w-3" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Needs support</p>
              <p className="text-sm font-bold text-foreground">{needsSupport} tags</p>
            </div>
          </div>
        </div>
      )}

      {/* Tag list */}
      <div className="mt-4 space-y-2.5">
        {isLoading ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-12 text-center text-sm text-muted-foreground">
            Loading pedagogical analytics…
          </div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-12 text-center text-sm text-destructive">
            {error}
          </div>
        ) : metrics.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-12 text-center text-sm text-muted-foreground">
            No pedagogical tag data available yet for this classroom.
          </div>
        ) : (
          metrics.map((metric, i) => {
            const level = accuracyLevel(metric.accuracy)
            const pct = Math.round(metric.accuracy * 100)
            return (
              <motion.div
                key={metric.slug}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`rounded-xl border bg-background p-4 ring-1 ${level.ring}`}
              >
                {/* Top row: name + badge + accuracy */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${level.bg} ${level.color} ${level.ring}`}
                    >
                      {level.icon}
                      {level.label}
                    </span>
                    <p className="truncate font-semibold text-foreground">{metric.name}</p>
                  </div>
                  <span className="shrink-0 text-lg font-black tabular-nums text-foreground">
                    {pct}%
                  </span>
                </div>

                {/* Accuracy bar */}
                <div className="mt-2.5">
                  <AccuracyBar value={metric.accuracy} />
                </div>

                {/* Stat pills */}
                <div className="mt-3 grid grid-cols-4 gap-2">
                  <StatPill label="Questions" value={metric.questionCount} />
                  <StatPill label="Answers" value={metric.answeredCount} />
                  <StatPill label="Correct" value={metric.correctCount} />
                  <StatPill
                    label="Avg score"
                    value={typeof metric.averageScore === "number" ? `${Math.round(metric.averageScore)}%` : metric.averageScore}
                  />
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ─── Student Tag Detail card ───────────────────────────────────────────────────

function StudentTagDetail({
  selectedStudentId,
  isLoading,
  error,
  overview,
}: {
  selectedStudentId: string | null
  isLoading: boolean
  error: string | null
  overview: StudentPedagogicalTagsOverview | null
}) {
  if (!selectedStudentId) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Student Tag Detail</h3>
            <p className="text-sm text-muted-foreground">Select a student above to see their tag breakdown.</p>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-12 text-center text-sm text-muted-foreground">
          Click any student card to open their pedagogical tag analytics.
        </div>
      </div>
    )
  }

  const metrics = overview?.metrics ?? []
  const strong = metrics.filter((m) => m.accuracy >= 0.85)
  const developing = metrics.filter((m) => m.accuracy >= 0.6 && m.accuracy < 0.85)
  const weak = metrics.filter((m) => m.accuracy < 0.6)

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Target className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Student Tag Detail</h3>
          <p className="text-sm text-muted-foreground">
            {overview ? `${overview.studentName}'s strengths and areas to improve.` : "Loading…"}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-12 text-center text-sm text-muted-foreground">
          Loading student analytics…
        </div>
      ) : error ? (
        <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-12 text-center text-sm text-destructive">
          {error}
        </div>
      ) : !overview || metrics.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-12 text-center text-sm text-muted-foreground">
          No pedagogical tag data available yet for this student.
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {/* Student summary header */}
          <div className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-3">
            <p className="font-bold text-foreground">{overview.studentName}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 font-semibold text-emerald-700">
                <Star className="h-3 w-3" /> {strong.length}
              </span>
              <span className="flex items-center gap-1 font-semibold text-amber-700">
                <Minus className="h-3 w-3" /> {developing.length}
              </span>
              <span className="flex items-center gap-1 font-semibold text-red-700">
                <AlertTriangle className="h-3 w-3" /> {weak.length}
              </span>
            </div>
          </div>

          {/* Needs support — always first, most actionable */}
          {weak.length > 0 && (
            <TagGroup
              title="Needs support"
              icon={<AlertTriangle className="h-4 w-4" />}
              color="text-red-700"
              headerBg="bg-red-50"
              metrics={weak}
            />
          )}

          {developing.length > 0 && (
            <TagGroup
              title="Developing"
              icon={<Minus className="h-4 w-4" />}
              color="text-amber-700"
              headerBg="bg-amber-50"
              metrics={developing}
            />
          )}

          {strong.length > 0 && (
            <TagGroup
              title="Strong"
              icon={<Star className="h-4 w-4" />}
              color="text-emerald-700"
              headerBg="bg-emerald-50"
              metrics={strong}
            />
          )}
        </div>
      )}
    </div>
  )
}

function TagGroup({
  title,
  icon,
  color,
  headerBg,
  metrics,
}: {
  title: string
  icon: React.ReactNode
  color: string
  headerBg: string
  metrics: PedagogicalTagMetric[]
}) {
  const [open, setOpen] = useState(true)

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between px-4 py-2.5 text-left ${headerBg}`}
      >
        <span className={`flex items-center gap-2 text-sm font-bold ${color}`}>
          {icon}
          {title}
          <span className="ml-1 rounded-full bg-white/60 px-2 py-0.5 text-xs font-semibold">
            {metrics.length}
          </span>
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="divide-y divide-border">
              {metrics.map((metric) => {
                const pct = Math.round(metric.accuracy * 100)
                return (
                  <div key={metric.slug} className="bg-background px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">{metric.name}</p>
                      <span className="shrink-0 text-sm font-bold tabular-nums text-foreground">
                        {pct}%
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <AccuracyBar value={metric.accuracy} />
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>
                        <b className="text-foreground">{metric.correctCount}</b>/{metric.answeredCount} correct
                      </span>
                      <span>·</span>
                      <span>
                        Avg score{" "}
                        <b className="text-foreground">
                          {typeof metric.averageScore === "number"
                            ? `${Math.round(metric.averageScore)}%`
                            : metric.averageScore}
                        </b>
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

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
        if (!isCancelled) setPedagogicalOverview(overview)
      })
      .catch(() => {
        if (!isCancelled) {
          setPedagogicalOverview(null)
          setOverviewError("We couldn't load the pedagogical tags overview for this classroom.")
        }
      })
      .finally(() => {
        if (!isCancelled) setIsOverviewLoading(false)
      })

    return () => { isCancelled = true }
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
        if (!isCancelled) setStudentTagOverview(overview)
      })
      .catch(() => {
        if (!isCancelled) {
          setStudentTagOverview(null)
          setStudentOverviewError("We couldn't load this student's pedagogical tag details.")
        }
      })
      .finally(() => {
        if (!isCancelled) setIsStudentOverviewLoading(false)
      })

    return () => { isCancelled = true }
  }, [classroom.id, selectedStudentId])

  // Sort overview metrics
  const sortedOverviewMetrics = [...(pedagogicalOverview?.metrics || [])].sort((a, b) => {
    if (overviewSort === "best") return b.accuracy - a.accuracy
    if (overviewSort === "usage") return b.answeredCount - a.answeredCount
    return a.accuracy - b.accuracy
  })

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

  const activeTopic = classroom.plan?.topics.find((t) => t.isActive)
  const activeColor = activeTopic?.topic.color || "#7C3AED"
  const activeColorSoft = `${activeColor}22`

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
          Students — Week {displayedWeek}
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
                      {result ? `Completed — ${result.score}%` : "Pending"}
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

      {/* ── Analytics section ─────────────────────────────────────────────── */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <PedagogicalTagsOverview
          isLoading={isOverviewLoading}
          error={overviewError}
          metrics={sortedOverviewMetrics}
          sort={overviewSort}
          onSortChange={setOverviewSort}
        />

        <StudentTagDetail
          selectedStudentId={selectedStudentId}
          isLoading={isStudentOverviewLoading}
          error={studentOverviewError}
          overview={studentTagOverview}
        />
      </div>

      {/* Week History */}
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
                          style={
                            selectedWeek === week
                              ? { borderColor: activeColor, backgroundColor: activeColorSoft }
                              : undefined
                          }
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
