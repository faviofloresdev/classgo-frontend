"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Flame, Lock, Medal, Trophy } from "lucide-react"
import { BadgeCeremony } from "@/components/class-go/badge-ceremony"
import { HexBadgeSVG } from "@/components/class-go/badge-visual"
import type {
  AchievementPayload,
  AchievementProgressSnapshot,
  StudentResultWithDetails,
  User,
} from "@/lib/types"
import {
  getBadgeProgress,
  mergeAchievementPayloads,
  mergeAchievementProgress,
} from "@/lib/badges"
import {
  getStudentResults,
  trackAchievementFeatureUse,
  trackAchievementSectionVisit,
} from "@/lib/api"

interface StudentAchievementsPageProps {
  user: User
  achievementProgress?: AchievementProgressSnapshot | null
  onAchievementEvent: (payload: AchievementPayload | null | undefined) => void
  onBack: () => void
}

export function StudentAchievementsPage({
  user,
  achievementProgress,
  onAchievementEvent,
  onBack,
}: StudentAchievementsPageProps) {
  const trackedVisitRef = useRef(false)
  const scrollPositionRef = useRef(0)
  const [results, setResults] = useState<StudentResultWithDetails[]>([])
  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null)

  useEffect(() => {
    void getStudentResults()
      .then((nextResults) => {
        setResults(nextResults)
      })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    if (trackedVisitRef.current) {
      return
    }

    trackedVisitRef.current = true
    void Promise.all([
      trackAchievementSectionVisit("REWARDS").catch(() => null),
      trackAchievementFeatureUse("OPEN_ACHIEVEMENTS").catch(() => null),
    ])
      .then(([sectionPayload, featurePayload]) => {
        onAchievementEvent(mergeAchievementPayloads(sectionPayload, featurePayload))
      })
      .catch(() => undefined)
  }, [onAchievementEvent])

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
  const selectedBadge = badgeProgress.find((badge) => badge.id === selectedBadgeId) || null

  if (selectedBadge) {
    return (
      <BadgeCeremony
        badges={[selectedBadge]}
        onDone={() => {
          setSelectedBadgeId(null)
          window.requestAnimationFrame(() => {
            window.scrollTo({ top: scrollPositionRef.current, behavior: "auto" })
          })
        }}
      />
    )
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
            <h1 className="text-xl font-black text-indigo-900">Rewards & Badge Guide</h1>
            <p className="text-sm text-indigo-600">Tap any badge to view it in full ceremony mode.</p>
          </div>
          <div className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-indigo-900 shadow-sm">
            {unlockedBadges.length}/{badgeProgress.length} unlocked
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4 pb-24">
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Trophy, label: "Completed Challenges", value: achievementSummary.completedChallenges, tone: "bg-green-100 text-green-700" },
            { icon: Flame, label: "Weekly Streak", value: achievementSummary.currentWeeklyStreak, tone: "bg-orange-100 text-orange-700" },
            { icon: Medal, label: "Unlocked Badges", value: unlockedBadges.length, tone: "bg-amber-100 text-amber-700" },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl bg-white p-5 shadow-lg">
              <div className={`mb-3 inline-flex rounded-2xl p-3 ${item.tone}`}>
                <item.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-black text-slate-900">{item.value}</p>
              <p className="text-sm text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {badgeProgress.map((badge, index) => (
            <motion.button
              type="button"
              key={badge.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              whileHover={badge.unlocked ? { y: -4, scale: 1.02 } : undefined}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (!badge.unlocked) {
                  return
                }
                scrollPositionRef.current = window.scrollY
                setSelectedBadgeId(badge.id)
              }}
              disabled={!badge.unlocked}
              className={`flex h-full flex-col rounded-[1.5rem] border p-3 text-left shadow-sm transition-transform lg:rounded-[1.75rem] lg:p-4 ${
                badge.unlocked
                  ? "border-transparent bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-700"
              } ${badge.unlocked ? "cursor-pointer" : "cursor-not-allowed"}`}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${
                      badge.unlocked ? "" : "bg-slate-200 text-slate-600"
                    }`}
                    style={badge.unlocked ? { background: badge.catBg, color: badge.catTxt } : undefined}
                  >
                    {badge.category}
                  </span>
                  {!badge.unlocked && (
                    <span className="rounded-full bg-slate-200 p-2 text-slate-500">
                      <Lock className="h-3.5 w-3.5" />
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-3 flex min-h-[128px] justify-center lg:mb-4 lg:min-h-[156px]">
                <div className="flex w-full justify-center">
                  <div className="origin-center scale-[0.84] lg:scale-100">
                    <HexBadgeSVG badge={badge} size={156} locked={!badge.unlocked} />
                  </div>
                </div>
              </div>

              <h3 className={`min-h-[2.5rem] text-sm font-black leading-tight lg:min-h-[3.5rem] lg:text-lg ${badge.unlocked ? "text-white" : "text-slate-900"}`}>
                {badge.name}
              </h3>
              <p className={`mt-1.5 min-h-[5rem] text-xs leading-5 lg:mt-2 lg:min-h-[5.5rem] lg:text-sm lg:leading-6 ${badge.unlocked ? "text-white/75" : "text-slate-600"}`}>
                {badge.description}
              </p>

              <div className="mt-auto flex flex-col gap-2 pt-3 lg:gap-3 lg:pt-4">
                <div className={`min-h-[2rem] text-[11px] font-bold leading-4 lg:min-h-0 lg:text-xs ${badge.unlocked ? "text-amber-300" : "text-slate-500"}`}>
                  {badge.progressLabel}
                </div>
                <div
                  className={`inline-flex w-fit items-center justify-center self-start rounded-full px-2.5 py-1 text-[11px] font-black lg:px-3 lg:text-xs ${
                    badge.unlocked ? "bg-amber-400/15 text-amber-200" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  +{badge.xp} XP
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </main>
    </div>
  )
}
