"use client"

import {
  buildCompassIcon,
  buildFlameIcon,
  buildMedalIcon,
  buildRocketIcon,
  buildStarIcon,
} from "@/components/class-go/badge-visual"
import type {
  AchievementPayload,
  AchievementProgressSnapshot,
  AchievementUnlocked,
  StudentResultWithDetails,
  User,
} from "./types"

export interface BadgeDefinition {
  id: string
  code: string
  name: string
  category: string
  xp: number
  description: string
  unlockHint: string
  accentFrom: string
  accentTo: string
  glow: string
  catBg: string
  catTxt: string
  icon: "compass" | "flame" | "star" | "rocket" | "medal"
  c: {
    g0: string
    g1: string
    g2: string
    r0: string
    r1: string
    gw: string
    bg: string
    b1: string
    b2: string
  }
  buildIcon: (cx: number, cy: number, R: number) => string
}

export interface BadgeProgress extends BadgeDefinition {
  unlocked: boolean
  unlockedAt?: Date
  progressLabel: string
}

const BADGE_CATALOG: BadgeDefinition[] = [
  { id: "progress-1", code: "PROGRESS_CHALLENGE_1", name: "First Challenge", category: "Progress", xp: 40, description: "You completed your first challenge.", unlockHint: "Finish 1 challenge.", accentFrom: "#60a5fa", accentTo: "#2563eb", glow: "rgba(59,130,246,0.38)", catBg: "rgba(147,197,253,.18)", catTxt: "#bfdbfe", icon: "compass", c: createColors("#93c5fd", "#3b82f6", "#1d4ed8", "#dbeafe", "#60a5fa", "#60a5fa", "#081426", "#1d4ed8", "#1e40af"), buildIcon: buildCompassIcon },
  { id: "progress-3", code: "PROGRESS_CHALLENGE_3", name: "Getting Started", category: "Progress", xp: 55, description: "You are building momentum with your first challenges.", unlockHint: "Finish 3 challenges.", accentFrom: "#38bdf8", accentTo: "#0f766e", glow: "rgba(34,211,238,0.35)", catBg: "rgba(125,211,252,.18)", catTxt: "#bae6fd", icon: "compass", c: createColors("#7dd3fc", "#06b6d4", "#0f766e", "#cffafe", "#67e8f9", "#22d3ee", "#051923", "#0891b2", "#155e75"), buildIcon: buildCompassIcon },
  { id: "progress-5", code: "PROGRESS_CHALLENGE_5", name: "Challenge Apprentice", category: "Progress", xp: 65, description: "Five challenges complete. Your habit is growing.", unlockHint: "Finish 5 challenges.", accentFrom: "#22c55e", accentTo: "#15803d", glow: "rgba(34,197,94,0.35)", catBg: "rgba(134,239,172,.18)", catTxt: "#bbf7d0", icon: "compass", c: createColors("#86efac", "#22c55e", "#166534", "#dcfce7", "#4ade80", "#4ade80", "#071b10", "#15803d", "#166534"), buildIcon: buildCompassIcon },
  { id: "progress-10", code: "PROGRESS_CHALLENGE_10", name: "Double Digits", category: "Progress", xp: 90, description: "Ten completed challenges show real consistency.", unlockHint: "Finish 10 challenges.", accentFrom: "#10b981", accentTo: "#047857", glow: "rgba(16,185,129,0.35)", catBg: "rgba(110,231,183,.18)", catTxt: "#a7f3d0", icon: "medal", c: createColors("#6ee7b7", "#10b981", "#065f46", "#d1fae5", "#34d399", "#34d399", "#061712", "#059669", "#064e3b"), buildIcon: buildMedalIcon },
  { id: "progress-20", code: "PROGRESS_CHALLENGE_20", name: "Momentum Builder", category: "Progress", xp: 120, description: "You are stacking challenge after challenge.", unlockHint: "Finish 20 challenges.", accentFrom: "#14b8a6", accentTo: "#0f766e", glow: "rgba(20,184,166,0.35)", catBg: "rgba(94,234,212,.18)", catTxt: "#99f6e4", icon: "medal", c: createColors("#5eead4", "#14b8a6", "#115e59", "#ccfbf1", "#2dd4bf", "#2dd4bf", "#051617", "#0f766e", "#134e4a"), buildIcon: buildMedalIcon },
  { id: "progress-35", code: "PROGRESS_CHALLENGE_35", name: "Challenge Explorer", category: "Progress", xp: 150, description: "Your learning path is now full of completed missions.", unlockHint: "Finish 35 challenges.", accentFrom: "#06b6d4", accentTo: "#1d4ed8", glow: "rgba(6,182,212,0.35)", catBg: "rgba(103,232,249,.18)", catTxt: "#a5f3fc", icon: "rocket", c: createColors("#67e8f9", "#06b6d4", "#1d4ed8", "#cffafe", "#22d3ee", "#22d3ee", "#061425", "#0ea5e9", "#1e40af"), buildIcon: buildRocketIcon },
  { id: "progress-50", code: "PROGRESS_CHALLENGE_50", name: "Half Century", category: "Progress", xp: 180, description: "Fifty challenges completed is a major milestone.", unlockHint: "Finish 50 challenges.", accentFrom: "#818cf8", accentTo: "#4f46e5", glow: "rgba(99,102,241,0.36)", catBg: "rgba(165,180,252,.18)", catTxt: "#c7d2fe", icon: "rocket", c: createColors("#a5b4fc", "#6366f1", "#4338ca", "#e0e7ff", "#818cf8", "#818cf8", "#0b0b24", "#4f46e5", "#3730a3"), buildIcon: buildRocketIcon },
  { id: "progress-75", code: "PROGRESS_CHALLENGE_75", name: "Seventy Five Strong", category: "Progress", xp: 220, description: "You keep showing up and it shows.", unlockHint: "Finish 75 challenges.", accentFrom: "#a78bfa", accentTo: "#6d28d9", glow: "rgba(167,139,250,0.36)", catBg: "rgba(196,181,253,.18)", catTxt: "#ddd6fe", icon: "rocket", c: createColors("#c4b5fd", "#8b5cf6", "#5b21b6", "#ede9fe", "#a78bfa", "#a78bfa", "#120822", "#7c3aed", "#4c1d95"), buildIcon: buildRocketIcon },
  { id: "progress-100", code: "PROGRESS_CHALLENGE_100", name: "Century Learner", category: "Progress", xp: 280, description: "One hundred completed challenges. Outstanding dedication.", unlockHint: "Finish 100 challenges.", accentFrom: "#e879f9", accentTo: "#a21caf", glow: "rgba(232,121,249,0.36)", catBg: "rgba(244,114,182,.18)", catTxt: "#fbcfe8", icon: "medal", c: createColors("#f0abfc", "#d946ef", "#a21caf", "#fae8ff", "#e879f9", "#e879f9", "#230723", "#c026d3", "#86198f"), buildIcon: buildMedalIcon },
  { id: "consistency-2", code: "CONSISTENCY_WEEK_2", name: "Two Week Spark", category: "Consistency", xp: 55, description: "You kept your weekly streak alive for two weeks.", unlockHint: "Reach a 2-week streak.", accentFrom: "#fbbf24", accentTo: "#f97316", glow: "rgba(249,115,22,0.38)", catBg: "rgba(253,230,138,.18)", catTxt: "#fde68a", icon: "flame", c: createColors("#fde68a", "#f59e0b", "#c2410c", "#fef3c7", "#fbbf24", "#fbbf24", "#1b0f04", "#f59e0b", "#9a3412"), buildIcon: buildFlameIcon },
  { id: "consistency-3", code: "CONSISTENCY_WEEK_3", name: "Three Week Flame", category: "Consistency", xp: 70, description: "Your learning rhythm is becoming a habit.", unlockHint: "Reach a 3-week streak.", accentFrom: "#fb923c", accentTo: "#ea580c", glow: "rgba(251,146,60,0.38)", catBg: "rgba(253,186,116,.18)", catTxt: "#fdba74", icon: "flame", c: createColors("#fdba74", "#f97316", "#c2410c", "#ffedd5", "#fb923c", "#fb923c", "#200d05", "#ea580c", "#9a3412"), buildIcon: buildFlameIcon },
  { id: "consistency-5", code: "CONSISTENCY_WEEK_5", name: "Five Week Focus", category: "Consistency", xp: 95, description: "Five weeks of commitment. Strong work.", unlockHint: "Reach a 5-week streak.", accentFrom: "#f97316", accentTo: "#c2410c", glow: "rgba(249,115,22,0.4)", catBg: "rgba(251,146,60,.18)", catTxt: "#fdba74", icon: "flame", c: createColors("#fdba74", "#f97316", "#9a3412", "#ffedd5", "#fb923c", "#fb923c", "#1d0c04", "#ea580c", "#7c2d12"), buildIcon: buildFlameIcon },
  { id: "consistency-8", code: "CONSISTENCY_WEEK_8", name: "Eight Week Run", category: "Consistency", xp: 125, description: "Your streak is now one of your superpowers.", unlockHint: "Reach an 8-week streak.", accentFrom: "#ef4444", accentTo: "#be123c", glow: "rgba(244,63,94,0.38)", catBg: "rgba(252,165,165,.18)", catTxt: "#fecaca", icon: "flame", c: createColors("#fca5a5", "#ef4444", "#be123c", "#fee2e2", "#f87171", "#f87171", "#21070d", "#dc2626", "#9f1239"), buildIcon: buildFlameIcon },
  { id: "consistency-12", code: "CONSISTENCY_WEEK_12", name: "Twelve Week Streak", category: "Consistency", xp: 170, description: "Twelve weeks of consistency is something to celebrate.", unlockHint: "Reach a 12-week streak.", accentFrom: "#fb7185", accentTo: "#be185d", glow: "rgba(244,114,182,0.4)", catBg: "rgba(253,164,175,.18)", catTxt: "#fda4af", icon: "flame", c: createColors("#fda4af", "#f43f5e", "#be185d", "#ffe4e6", "#fb7185", "#fb7185", "#220713", "#e11d48", "#9f1239"), buildIcon: buildFlameIcon },
  { id: "consistency-20", code: "CONSISTENCY_WEEK_20", name: "Twenty Week Warrior", category: "Consistency", xp: 220, description: "You have sustained an impressive long-term streak.", unlockHint: "Reach a 20-week streak.", accentFrom: "#ec4899", accentTo: "#9d174d", glow: "rgba(236,72,153,0.4)", catBg: "rgba(244,114,182,.18)", catTxt: "#f9a8d4", icon: "flame", c: createColors("#f9a8d4", "#ec4899", "#9d174d", "#fce7f3", "#f472b6", "#f472b6", "#240713", "#db2777", "#9d174d"), buildIcon: buildFlameIcon },
  { id: "consistency-30", code: "CONSISTENCY_WEEK_30", name: "Thirty Week Legend", category: "Consistency", xp: 300, description: "An elite streak earned through real perseverance.", unlockHint: "Reach a 30-week streak.", accentFrom: "#d946ef", accentTo: "#86198f", glow: "rgba(217,70,239,0.42)", catBg: "rgba(233,213,255,.18)", catTxt: "#e9d5ff", icon: "flame", c: createColors("#e9d5ff", "#d946ef", "#86198f", "#fae8ff", "#e879f9", "#e879f9", "#1f0923", "#c026d3", "#86198f"), buildIcon: buildFlameIcon },
  { id: "performance-high-1", code: "PERFORMANCE_HIGH_1", name: "High Score", category: "Performance", xp: 65, description: "You earned your first high-scoring challenge.", unlockHint: "Get 1 high-score challenge.", accentFrom: "#34d399", accentTo: "#059669", glow: "rgba(52,211,153,0.35)", catBg: "rgba(110,231,183,.18)", catTxt: "#a7f3d0", icon: "star", c: createColors("#a7f3d0", "#34d399", "#059669", "#d1fae5", "#6ee7b7", "#6ee7b7", "#071a13", "#10b981", "#047857"), buildIcon: buildStarIcon },
  { id: "performance-high-3", code: "PERFORMANCE_HIGH_3", name: "High Score Streak", category: "Performance", xp: 90, description: "Several high scores show your skills are growing.", unlockHint: "Get 3 high-score challenges.", accentFrom: "#22c55e", accentTo: "#15803d", glow: "rgba(34,197,94,0.35)", catBg: "rgba(134,239,172,.18)", catTxt: "#bbf7d0", icon: "star", c: createColors("#bbf7d0", "#22c55e", "#15803d", "#dcfce7", "#4ade80", "#4ade80", "#08190f", "#16a34a", "#166534"), buildIcon: buildStarIcon },
  { id: "performance-high-10", code: "PERFORMANCE_HIGH_10", name: "Elite Scorer", category: "Performance", xp: 150, description: "Ten high-score challenges place you among the strongest performers.", unlockHint: "Get 10 high-score challenges.", accentFrom: "#10b981", accentTo: "#065f46", glow: "rgba(16,185,129,0.35)", catBg: "rgba(110,231,183,.18)", catTxt: "#a7f3d0", icon: "star", c: createColors("#a7f3d0", "#10b981", "#065f46", "#d1fae5", "#34d399", "#34d399", "#071713", "#059669", "#064e3b"), buildIcon: buildStarIcon },
  { id: "performance-perfect-1", code: "PERFORMANCE_PERFECT_1", name: "Perfect Start", category: "Performance", xp: 80, description: "You completed a challenge with perfect accuracy.", unlockHint: "Get 1 perfect challenge.", accentFrom: "#c084fc", accentTo: "#7c3aed", glow: "rgba(168,85,247,0.38)", catBg: "rgba(221,214,254,.18)", catTxt: "#ddd6fe", icon: "star", c: createColors("#ddd6fe", "#8b5cf6", "#6d28d9", "#ede9fe", "#a78bfa", "#a78bfa", "#130822", "#7c3aed", "#5b21b6"), buildIcon: buildStarIcon },
  { id: "performance-perfect-5", code: "PERFORMANCE_PERFECT_5", name: "Perfect Five", category: "Performance", xp: 130, description: "Five perfect challenges show incredible precision.", unlockHint: "Get 5 perfect challenges.", accentFrom: "#a78bfa", accentTo: "#6d28d9", glow: "rgba(167,139,250,0.38)", catBg: "rgba(196,181,253,.18)", catTxt: "#ddd6fe", icon: "star", c: createColors("#c4b5fd", "#8b5cf6", "#6d28d9", "#ede9fe", "#a78bfa", "#a78bfa", "#10061f", "#7c3aed", "#4c1d95"), buildIcon: buildStarIcon },
  { id: "performance-perfect-10", code: "PERFORMANCE_PERFECT_10", name: "Precision Master", category: "Performance", xp: 210, description: "Ten perfect challenges make you a true accuracy master.", unlockHint: "Get 10 perfect challenges.", accentFrom: "#8b5cf6", accentTo: "#4c1d95", glow: "rgba(139,92,246,0.4)", catBg: "rgba(192,132,252,.18)", catTxt: "#ddd6fe", icon: "star", c: createColors("#c4b5fd", "#8b5cf6", "#4c1d95", "#ede9fe", "#a78bfa", "#a78bfa", "#0d0820", "#6d28d9", "#4c1d95"), buildIcon: buildStarIcon },
  { id: "explore-avatar-student", code: "EXPLORATION_AVATAR_STUDENT", name: "Student Style", category: "Exploration", xp: 35, description: "You personalized the student avatar.", unlockHint: "Update the student avatar.", accentFrom: "#60a5fa", accentTo: "#0284c7", glow: "rgba(59,130,246,0.34)", catBg: "rgba(147,197,253,.18)", catTxt: "#bfdbfe", icon: "compass", c: createColors("#93c5fd", "#3b82f6", "#0284c7", "#dbeafe", "#60a5fa", "#60a5fa", "#071426", "#2563eb", "#075985"), buildIcon: buildCompassIcon },
  { id: "explore-avatar-parent", code: "EXPLORATION_AVATAR_PARENT", name: "Family Style", category: "Exploration", xp: 35, description: "You personalized the parent avatar.", unlockHint: "Update the parent avatar.", accentFrom: "#38bdf8", accentTo: "#0369a1", glow: "rgba(56,189,248,0.34)", catBg: "rgba(125,211,252,.18)", catTxt: "#bae6fd", icon: "compass", c: createColors("#7dd3fc", "#38bdf8", "#0369a1", "#e0f2fe", "#7dd3fc", "#7dd3fc", "#08131d", "#0ea5e9", "#075985"), buildIcon: buildCompassIcon },
  { id: "explore-profile", code: "EXPLORATION_PROFILE_COMPLETE", name: "Profile Complete", category: "Exploration", xp: 45, description: "Your profile setup is complete and ready to shine.", unlockHint: "Complete your profile information.", accentFrom: "#22d3ee", accentTo: "#0f766e", glow: "rgba(34,211,238,0.34)", catBg: "rgba(165,243,252,.18)", catTxt: "#a5f3fc", icon: "compass", c: createColors("#a5f3fc", "#22d3ee", "#0f766e", "#cffafe", "#67e8f9", "#67e8f9", "#061417", "#06b6d4", "#115e59"), buildIcon: buildCompassIcon },
  { id: "explore-sections-3", code: "EXPLORATION_SECTIONS_3", name: "Section Explorer", category: "Exploration", xp: 50, description: "You explored different parts of Class Go.", unlockHint: "Visit 3 different sections.", accentFrom: "#2dd4bf", accentTo: "#0f766e", glow: "rgba(45,212,191,0.34)", catBg: "rgba(153,246,228,.18)", catTxt: "#99f6e4", icon: "compass", c: createColors("#99f6e4", "#2dd4bf", "#0f766e", "#ccfbf1", "#5eead4", "#5eead4", "#061516", "#14b8a6", "#115e59"), buildIcon: buildCompassIcon },
  { id: "explore-feature-1", code: "EXPLORATION_FEATURE_1", name: "Feature Finder", category: "Exploration", xp: 40, description: "You started interacting with Class Go features.", unlockHint: "Use 1 tracked feature.", accentFrom: "#fbbf24", accentTo: "#ca8a04", glow: "rgba(250,204,21,0.34)", catBg: "rgba(253,230,138,.18)", catTxt: "#fde68a", icon: "rocket", c: createColors("#fde68a", "#fbbf24", "#ca8a04", "#fef3c7", "#fcd34d", "#fcd34d", "#1b1204", "#f59e0b", "#a16207"), buildIcon: buildRocketIcon },
  { id: "explore-feature-3", code: "EXPLORATION_FEATURE_3", name: "Feature Explorer", category: "Exploration", xp: 70, description: "You tried several features across the experience.", unlockHint: "Use 3 tracked features.", accentFrom: "#f59e0b", accentTo: "#b45309", glow: "rgba(245,158,11,0.34)", catBg: "rgba(253,186,116,.18)", catTxt: "#fdba74", icon: "rocket", c: createColors("#fdba74", "#f59e0b", "#b45309", "#ffedd5", "#fbbf24", "#fbbf24", "#1a1005", "#d97706", "#92400e"), buildIcon: buildRocketIcon },
  { id: "explore-activity-1", code: "EXPLORATION_ACTIVITY_TYPE_1", name: "Activity Sampler", category: "Exploration", xp: 50, description: "You completed your first tracked activity type.", unlockHint: "Complete 1 activity type.", accentFrom: "#f472b6", accentTo: "#be185d", glow: "rgba(244,114,182,0.36)", catBg: "rgba(249,168,212,.18)", catTxt: "#fbcfe8", icon: "rocket", c: createColors("#f9a8d4", "#f472b6", "#be185d", "#fce7f3", "#f9a8d4", "#f9a8d4", "#220714", "#ec4899", "#9d174d"), buildIcon: buildRocketIcon },
  { id: "explore-activity-3", code: "EXPLORATION_ACTIVITY_TYPE_3", name: "Activity Explorer", category: "Exploration", xp: 95, description: "You are exploring different ways to learn.", unlockHint: "Complete 3 activity types.", accentFrom: "#ec4899", accentTo: "#9d174d", glow: "rgba(236,72,153,0.36)", catBg: "rgba(244,114,182,.18)", catTxt: "#f9a8d4", icon: "rocket", c: createColors("#f9a8d4", "#ec4899", "#9d174d", "#fce7f3", "#f472b6", "#f472b6", "#220713", "#db2777", "#9d174d"), buildIcon: buildRocketIcon },
  { id: "special-first-completion", code: "SPECIAL_FIRST_COMPLETION", name: "First Completion", category: "Special", xp: 100, description: "You were the first to complete a classroom challenge.", unlockHint: "Be the first student to complete a challenge.", accentFrom: "#fde68a", accentTo: "#f59e0b", glow: "rgba(251,191,36,0.4)", catBg: "rgba(253,230,138,.18)", catTxt: "#fde68a", icon: "medal", c: createColors("#fde68a", "#f59e0b", "#92400e", "#fef3c7", "#fbbf24", "#fbbf24", "#1b1204", "#f59e0b", "#92400e"), buildIcon: buildMedalIcon },
]

function createColors(
  g0: string,
  g1: string,
  g2: string,
  r0: string,
  r1: string,
  gw: string,
  bgStart: string,
  b1: string,
  b2: string
) {
  return {
    g0,
    g1,
    g2,
    r0,
    r1,
    gw,
    bg: `linear-gradient(155deg,${bgStart} 0%,${b2} 50%,${b1} 100%)`,
    b1,
    b2,
  }
}

const CODE_TO_THRESHOLD: Record<string, number> = {
  PROGRESS_CHALLENGE_1: 1,
  PROGRESS_CHALLENGE_3: 3,
  PROGRESS_CHALLENGE_5: 5,
  PROGRESS_CHALLENGE_10: 10,
  PROGRESS_CHALLENGE_20: 20,
  PROGRESS_CHALLENGE_35: 35,
  PROGRESS_CHALLENGE_50: 50,
  PROGRESS_CHALLENGE_75: 75,
  PROGRESS_CHALLENGE_100: 100,
  CONSISTENCY_WEEK_2: 2,
  CONSISTENCY_WEEK_3: 3,
  CONSISTENCY_WEEK_5: 5,
  CONSISTENCY_WEEK_8: 8,
  CONSISTENCY_WEEK_12: 12,
  CONSISTENCY_WEEK_20: 20,
  CONSISTENCY_WEEK_30: 30,
  PERFORMANCE_HIGH_1: 1,
  PERFORMANCE_HIGH_3: 3,
  PERFORMANCE_HIGH_10: 10,
  PERFORMANCE_PERFECT_1: 1,
  PERFORMANCE_PERFECT_5: 5,
  PERFORMANCE_PERFECT_10: 10,
  EXPLORATION_SECTIONS_3: 3,
  EXPLORATION_FEATURE_1: 1,
  EXPLORATION_FEATURE_3: 3,
  EXPLORATION_ACTIVITY_TYPE_1: 1,
  EXPLORATION_ACTIVITY_TYPE_3: 3,
  SPECIAL_FIRST_COMPLETION: 1,
}

export function mergeAchievementProgress(
  currentProgress: AchievementProgressSnapshot | null | undefined,
  results: StudentResultWithDetails[]
): AchievementProgressSnapshot {
  const fallbackCompletedChallenges = results.length
  const fallbackHighScoreChallenges = results.filter((result) => result.score >= 90).length
  const fallbackPerfectChallenges = results.filter((result) => {
    const safeTotal = Math.max(result.totalQuestions || 0, 1)
    return safeTotal > 0 && (result.correctAnswers || 0) >= safeTotal
  }).length
  const fallbackFirstCompletionCount = Math.max(
    results.filter((result) => result.achievements?.newlyUnlockedAchievements.some((achievement) => achievement.code === "SPECIAL_FIRST_COMPLETION")).length,
    currentProgress?.firstCompletionCount || 0
  )

  return {
    completedChallenges: Math.max(currentProgress?.completedChallenges || 0, fallbackCompletedChallenges),
    currentWeeklyStreak: currentProgress?.currentWeeklyStreak || 0,
    highScoreChallenges: Math.max(currentProgress?.highScoreChallenges || 0, fallbackHighScoreChallenges),
    perfectChallenges: Math.max(currentProgress?.perfectChallenges || 0, fallbackPerfectChallenges),
    distinctSections: currentProgress?.distinctSections || 0,
    distinctFeatures: currentProgress?.distinctFeatures || 0,
    distinctActivityTypes: currentProgress?.distinctActivityTypes || 0,
    firstCompletionCount: fallbackFirstCompletionCount,
  }
}

function buildUnlockedMap(
  progress: AchievementProgressSnapshot,
  user: User,
  newlyUnlockedAchievements: AchievementUnlocked[]
) {
  const unlockedAtByCode = new Map<string, Date>()
  newlyUnlockedAchievements.forEach((achievement) => {
    unlockedAtByCode.set(achievement.code, achievement.unlockedAt)
  })

  const unlockedByCode: Record<string, boolean> = {
    PROGRESS_CHALLENGE_1: progress.completedChallenges >= 1,
    PROGRESS_CHALLENGE_3: progress.completedChallenges >= 3,
    PROGRESS_CHALLENGE_5: progress.completedChallenges >= 5,
    PROGRESS_CHALLENGE_10: progress.completedChallenges >= 10,
    PROGRESS_CHALLENGE_20: progress.completedChallenges >= 20,
    PROGRESS_CHALLENGE_35: progress.completedChallenges >= 35,
    PROGRESS_CHALLENGE_50: progress.completedChallenges >= 50,
    PROGRESS_CHALLENGE_75: progress.completedChallenges >= 75,
    PROGRESS_CHALLENGE_100: progress.completedChallenges >= 100,
    CONSISTENCY_WEEK_2: progress.currentWeeklyStreak >= 2,
    CONSISTENCY_WEEK_3: progress.currentWeeklyStreak >= 3,
    CONSISTENCY_WEEK_5: progress.currentWeeklyStreak >= 5,
    CONSISTENCY_WEEK_8: progress.currentWeeklyStreak >= 8,
    CONSISTENCY_WEEK_12: progress.currentWeeklyStreak >= 12,
    CONSISTENCY_WEEK_20: progress.currentWeeklyStreak >= 20,
    CONSISTENCY_WEEK_30: progress.currentWeeklyStreak >= 30,
    PERFORMANCE_HIGH_1: progress.highScoreChallenges >= 1,
    PERFORMANCE_HIGH_3: progress.highScoreChallenges >= 3,
    PERFORMANCE_HIGH_10: progress.highScoreChallenges >= 10,
    PERFORMANCE_PERFECT_1: progress.perfectChallenges >= 1,
    PERFORMANCE_PERFECT_5: progress.perfectChallenges >= 5,
    PERFORMANCE_PERFECT_10: progress.perfectChallenges >= 10,
    EXPLORATION_AVATAR_STUDENT: Boolean(user.studentAvatarId),
    EXPLORATION_AVATAR_PARENT: Boolean(user.parentAvatarId),
    EXPLORATION_PROFILE_COMPLETE: Boolean(user.name?.trim()) && Boolean(user.studentAvatarId || user.avatarId),
    EXPLORATION_SECTIONS_3: progress.distinctSections >= 3,
    EXPLORATION_FEATURE_1: progress.distinctFeatures >= 1,
    EXPLORATION_FEATURE_3: progress.distinctFeatures >= 3,
    EXPLORATION_ACTIVITY_TYPE_1: progress.distinctActivityTypes >= 1,
    EXPLORATION_ACTIVITY_TYPE_3: progress.distinctActivityTypes >= 3,
    SPECIAL_FIRST_COMPLETION: progress.firstCompletionCount >= 1,
  }

  return { unlockedByCode, unlockedAtByCode }
}

function getProgressLabel(code: string, progress: AchievementProgressSnapshot) {
  if (code.startsWith("PROGRESS_CHALLENGE_")) {
    const threshold = CODE_TO_THRESHOLD[code]
    return `${Math.min(progress.completedChallenges, threshold)}/${threshold} challenges`
  }
  if (code.startsWith("CONSISTENCY_WEEK_")) {
    const threshold = CODE_TO_THRESHOLD[code]
    return `${Math.min(progress.currentWeeklyStreak, threshold)}/${threshold} weeks`
  }
  if (code.startsWith("PERFORMANCE_HIGH_")) {
    const threshold = CODE_TO_THRESHOLD[code]
    return `${Math.min(progress.highScoreChallenges, threshold)}/${threshold} high scores`
  }
  if (code.startsWith("PERFORMANCE_PERFECT_")) {
    const threshold = CODE_TO_THRESHOLD[code]
    return `${Math.min(progress.perfectChallenges, threshold)}/${threshold} perfect`
  }
  if (code === "EXPLORATION_AVATAR_STUDENT") return "Update the student avatar"
  if (code === "EXPLORATION_AVATAR_PARENT") return "Update the parent avatar"
  if (code === "EXPLORATION_PROFILE_COMPLETE") return "Complete your profile"
  if (code.startsWith("EXPLORATION_SECTIONS_")) {
    const threshold = CODE_TO_THRESHOLD[code]
    return `${Math.min(progress.distinctSections, threshold)}/${threshold} sections`
  }
  if (code.startsWith("EXPLORATION_FEATURE_")) {
    const threshold = CODE_TO_THRESHOLD[code]
    return `${Math.min(progress.distinctFeatures, threshold)}/${threshold} features`
  }
  if (code.startsWith("EXPLORATION_ACTIVITY_TYPE_")) {
    const threshold = CODE_TO_THRESHOLD[code]
    return `${Math.min(progress.distinctActivityTypes, threshold)}/${threshold} activity types`
  }
  if (code === "SPECIAL_FIRST_COMPLETION") {
    return `${Math.min(progress.firstCompletionCount, 1)}/1 first completion`
  }
  return "Locked"
}

export function getBadgeProgress(params: {
  user: User
  results: StudentResultWithDetails[]
  progress?: AchievementProgressSnapshot | null
  recentAchievements?: AchievementUnlocked[]
}): BadgeProgress[] {
  const mergedProgress = mergeAchievementProgress(params.progress, params.results)
  const { unlockedByCode, unlockedAtByCode } = buildUnlockedMap(
    mergedProgress,
    params.user,
    params.recentAchievements || []
  )

  return BADGE_CATALOG.map((badge) => ({
    ...badge,
    unlocked: unlockedByCode[badge.code] || false,
    unlockedAt: unlockedAtByCode.get(badge.code),
    progressLabel: getProgressLabel(badge.code, mergedProgress),
  }))
}

export function getCeremonyBadges(achievements: AchievementUnlocked[]): BadgeDefinition[] {
  return achievements
    .map((achievement) => BADGE_CATALOG.find((badge) => badge.code === achievement.code))
    .filter((badge): badge is BadgeDefinition => Boolean(badge))
}

export function mergeAchievementPayloads(
  ...payloads: Array<AchievementPayload | null | undefined>
): AchievementPayload | null {
  const validPayloads = payloads.filter((payload): payload is AchievementPayload => Boolean(payload))
  if (validPayloads.length === 0) {
    return null
  }

  return {
    newlyUnlockedAchievements: validPayloads.flatMap((payload) => payload.newlyUnlockedAchievements),
    updatedProgress: {
      completedChallenges: Math.max(...validPayloads.map((payload) => payload.updatedProgress.completedChallenges)),
      currentWeeklyStreak: Math.max(...validPayloads.map((payload) => payload.updatedProgress.currentWeeklyStreak)),
      highScoreChallenges: Math.max(...validPayloads.map((payload) => payload.updatedProgress.highScoreChallenges)),
      perfectChallenges: Math.max(...validPayloads.map((payload) => payload.updatedProgress.perfectChallenges)),
      distinctSections: Math.max(...validPayloads.map((payload) => payload.updatedProgress.distinctSections)),
      distinctFeatures: Math.max(...validPayloads.map((payload) => payload.updatedProgress.distinctFeatures)),
      distinctActivityTypes: Math.max(...validPayloads.map((payload) => payload.updatedProgress.distinctActivityTypes)),
      firstCompletionCount: Math.max(...validPayloads.map((payload) => payload.updatedProgress.firstCompletionCount)),
    },
  }
}
