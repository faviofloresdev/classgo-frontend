"use client"

import type {
  AchievementPayload,
  AvatarId,
  Classroom,
  ClassroomPedagogicalTagsOverview,
  ClassroomWithDetails,
  LeaderboardEntry,
  PedagogicalTag,
  Plan,
  PlanTopic,
  PlanWithTopics,
  StudentPedagogicalTagsOverview,
  StudentResultWithDetails,
  Topic,
  TopicQuestion,
  User,
} from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081"
const SESSION_STORAGE_KEY = "classgo.session"
export const NETWORK_ACTIVITY_EVENT = "classgo:network-activity"
let pendingRequestCount = 0

type BackendRole = "TEACHER" | "STUDENT" | "PARENT"
type BackendActivationMode = "MANUAL" | "AUTO"
type BackendDifficulty = "EASY" | "MEDIUM" | "HARD"

interface AuthUserResponse {
  id: string
  name: string
  email: string
  role: BackendRole
  avatarId?: AvatarId | null
  studentAvatarId?: AvatarId | null
  parentAvatarId?: AvatarId | null
  achievements?: BackendAchievementPayload | null
}

interface LearningAuthResponse {
  token: string
  user: AuthUserResponse
}

interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: AuthUserResponse
}

interface CoreAuthUserResponse {
  userId: string
  email: string
  role: BackendRole
  fullName: string
}

interface CoreAuthResponse {
  accessToken: string
  refreshToken: string
  user: CoreAuthUserResponse
}

interface BackendBasicUser {
  id: string
  name: string
  avatarId?: AvatarId | null
  studentAvatarId?: AvatarId | null
  parentAvatarId?: AvatarId | null
}

interface BackendTeacher {
  id: string
  name: string
  avatarId?: AvatarId | null
}

interface BackendTopicSummary {
  id: string
  name: string
  color: string
  questions?: unknown
}

interface BackendPlanTopic {
  id: string
  planId: string
  topicId: string
  weekNumber: number
  isActive: boolean
  topic: BackendTopicSummary
}

interface BackendPlan {
  id: string
  name: string
  description?: string | null
  teacherId: string
  activationMode: BackendActivationMode
  startDate?: string | null
  createdAt: string
  topics?: BackendPlanTopic[]
}

interface BackendClassroom {
  id: string
  name: string
  code: string
  description?: string | null
  teacherId: string
  activePlanId?: string | null
  currentWeek?: number | null
  createdAt: string
  teacher?: BackendTeacher
  students?: BackendBasicUser[]
  plan?: BackendPlan
}

interface BackendTopic {
  id: string
  name: string
  description?: string | null
  icon?: string | null
  color: string
  difficulty: BackendDifficulty
  questions: unknown
  teacherId: string
  createdAt: string
}

interface BackendStudentResult {
  id: string
  studentId: string
  classroomId: string
  topicId: string
  weekNumber: number
  score: number
  completedAt: string
  timeSpent: number
  correctAnswers?: number
  totalQuestions?: number
  answers?: unknown
  achievements?: BackendAchievementPayload | null
  student?: BackendBasicUser
  topic?: {
    id: string
    name: string
    color: string
  }
}

interface BackendTeacherClassroomDetail {
  classroom: BackendClassroom
  results: Array<{
    studentId: string
    weekNumber: number
    score: number
    timeSpent: number
    student: BackendBasicUser
  }>
}

interface BackendLeaderboardEntry {
  student: BackendBasicUser
  totalScore: number
  rank: number
}

interface BackendGameplayContext {
  classroom: {
    id: string
    name: string
    currentWeek: number
  }
  topic?: {
    id: string
    name: string
    description?: string | null
    color: string
    questions: unknown
  } | null
  attemptAllowed: boolean
  existingResult?: BackendStudentResult | null
}

interface BackendAchievementUnlocked {
  code: string
  name: string
  category: "PROGRESS" | "CONSISTENCY" | "PERFORMANCE" | "EXPLORATION" | "SPECIAL"
  unlockedAt: string
}

interface BackendAchievementProgress {
  completedChallenges: number
  currentWeeklyStreak: number
  highScoreChallenges: number
  perfectChallenges: number
  distinctSections: number
  distinctFeatures: number
  distinctActivityTypes: number
  firstCompletionCount: number
}

interface BackendAchievementPayload {
  newlyUnlockedAchievements: BackendAchievementUnlocked[]
  updatedProgress: BackendAchievementProgress
}

interface BackendPedagogicalTag {
  id: string
  name: string
  slug: string
}

interface BackendPedagogicalTagMetric {
  slug: string
  name: string
  questionCount: number
  answeredCount: number
  correctCount: number
  accuracy: number
  averageScore: number
}

interface BackendClassroomPedagogicalTagsOverview {
  classroomId: string
  classroomName: string
  metrics: BackendPedagogicalTagMetric[]
}

interface BackendStudentPedagogicalTagsOverview {
  studentId: string
  studentName: string
  metrics: BackendPedagogicalTagMetric[]
}

export interface StudentPresenceStreamEvent {
  classroomId: string
  studentId: string
  studentName: string
  avatarId?: AvatarId | null
  message: string
  happenedAt: string
}

export interface GameplayStreamSubscribedEvent {
  classroomId: string
  status: string
}

export interface PresenceSnapshotStudent {
  studentId: string
  studentName: string
  avatarId?: AvatarId | null
  lastSeenAt: string
}

export interface PresenceSnapshotEvent {
  classroomId: string
  students: PresenceSnapshotStudent[]
  happenedAt: string
}

export interface SessionData {
  accessToken: string
  refreshToken?: string
  user: User
}

function isBrowser() {
  return typeof window !== "undefined"
}

function notifyNetworkActivity() {
  if (!isBrowser()) return

  window.dispatchEvent(
    new CustomEvent(NETWORK_ACTIVITY_EVENT, {
      detail: { pendingCount: pendingRequestCount },
    })
  )
}

function toRole(role: BackendRole): User["role"] {
  if (role === "TEACHER") return "teacher"
  return "student"
}

function toActivationMode(mode: BackendActivationMode): Plan["activationMode"] {
  return mode === "AUTO" ? "auto" : "manual"
}

function toDifficulty(difficulty: BackendDifficulty): Topic["difficulty"] {
  if (difficulty === "HARD") return "hard"
  if (difficulty === "MEDIUM") return "medium"
  return "easy"
}

function ensureQuestions(questions: unknown): TopicQuestion[] {
  if (!Array.isArray(questions)) {
    return []
  }

  return (questions as TopicQuestion[]).map((question) => ({
    ...question,
    pedagogicalTags: Array.isArray(question.pedagogicalTags)
      ? [...new Set(question.pedagogicalTags.map((tag) => String(tag).toLowerCase()))]
      : [],
  }))
}

function mapPedagogicalTag(tag: BackendPedagogicalTag): PedagogicalTag {
  return {
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
  }
}

function mapPedagogicalTagMetric(metric: BackendPedagogicalTagMetric) {
  return {
    slug: metric.slug,
    name: metric.name,
    questionCount: metric.questionCount,
    answeredCount: metric.answeredCount,
    correctCount: metric.correctCount,
    accuracy: metric.accuracy,
    averageScore: metric.averageScore,
  }
}

function mapBasicUser(user: BackendBasicUser, role: User["role"]): User {
  const studentAvatarId = user.studentAvatarId ?? user.avatarId ?? "animal-1"
  return {
    id: user.id,
    name: user.name,
    email: "",
    role,
    avatarId: studentAvatarId,
    studentAvatarId,
    parentAvatarId: user.parentAvatarId ?? null,
    achievements: null,
    createdAt: new Date(),
  }
}

function mapAchievementPayload(payload?: BackendAchievementPayload | null): AchievementPayload | null {
  if (!payload) {
    return null
  }

  return {
    newlyUnlockedAchievements: (payload.newlyUnlockedAchievements || []).map((achievement) => ({
      code: achievement.code,
      name: achievement.name,
      category: achievement.category,
      unlockedAt: new Date(achievement.unlockedAt),
    })),
    updatedProgress: {
      completedChallenges: payload.updatedProgress?.completedChallenges ?? 0,
      currentWeeklyStreak: payload.updatedProgress?.currentWeeklyStreak ?? 0,
      highScoreChallenges: payload.updatedProgress?.highScoreChallenges ?? 0,
      perfectChallenges: payload.updatedProgress?.perfectChallenges ?? 0,
      distinctSections: payload.updatedProgress?.distinctSections ?? 0,
      distinctFeatures: payload.updatedProgress?.distinctFeatures ?? 0,
      distinctActivityTypes: payload.updatedProgress?.distinctActivityTypes ?? 0,
      firstCompletionCount: payload.updatedProgress?.firstCompletionCount ?? 0,
    },
  }
}

function mapUser(user: AuthUserResponse): User {
  const studentAvatarId = user.studentAvatarId ?? user.avatarId ?? "animal-1"
  return {
    id: user.id,
    name: user.name,
    email: user.email || "",
    role: toRole(user.role),
    avatarId: studentAvatarId,
    studentAvatarId,
    parentAvatarId: user.parentAvatarId ?? null,
    achievements: mapAchievementPayload(user.achievements),
    createdAt: new Date(),
  }
}

function mapCoreAuthUser(user: CoreAuthUserResponse): User {
  return {
    id: user.userId,
    name: user.fullName,
    email: user.email || "",
    role: toRole(user.role),
    avatarId: "animal-1",
    achievements: null,
    createdAt: new Date(),
  }
}

function mapTopic(topic: BackendTopic): Topic {
  return {
    id: topic.id,
    name: topic.name,
    description: topic.description || "",
    icon: topic.icon || "Zap",
    color: topic.color,
    difficulty: toDifficulty(topic.difficulty),
    questions: ensureQuestions(topic.questions),
    teacherId: topic.teacherId,
    createdAt: new Date(topic.createdAt),
  }
}

function mapTopicSummary(topic: BackendTopicSummary): Topic {
  return {
    id: topic.id,
    name: topic.name,
    description: "",
    icon: "Zap",
    color: topic.color,
    difficulty: "easy",
    questions: ensureQuestions(topic.questions),
    teacherId: "",
    createdAt: new Date(),
  }
}

function mapPlanTopic(planTopic: BackendPlanTopic): PlanTopic & { topic: Topic } {
  return {
    id: planTopic.id,
    planId: planTopic.planId,
    topicId: planTopic.topicId,
    weekNumber: planTopic.weekNumber,
    isActive: planTopic.isActive,
    topic: mapTopicSummary(planTopic.topic),
  }
}

function mapPlan(plan: BackendPlan): PlanWithTopics {
  return {
    id: plan.id,
    name: plan.name,
    description: plan.description || "",
    teacherId: plan.teacherId,
    activationMode: toActivationMode(plan.activationMode),
    startDate: plan.startDate ? new Date(plan.startDate) : null,
    createdAt: new Date(plan.createdAt),
    topics: (plan.topics || [])
      .slice()
      .sort((a, b) => a.weekNumber - b.weekNumber)
      .map(mapPlanTopic),
  }
}

function mapClassroom(classroom: BackendClassroom): ClassroomWithDetails {
  return {
    id: classroom.id,
    name: classroom.name,
    code: classroom.code,
    description: classroom.description || "",
    teacherId: classroom.teacherId,
    activePlanId: classroom.activePlanId || null,
    currentWeek: classroom.currentWeek || 0,
    createdAt: new Date(classroom.createdAt),
    teacher: classroom.teacher ? mapBasicUser(classroom.teacher, "teacher") : undefined,
    students: (classroom.students || []).map((student) => mapBasicUser(student, "student")),
    plan: classroom.plan ? mapPlan(classroom.plan) : undefined,
  }
}

function mapStudentResult(result: BackendStudentResult): StudentResultWithDetails {
  return {
    id: result.id,
    studentId: result.studentId,
    classroomId: result.classroomId,
    topicId: result.topicId,
    weekNumber: result.weekNumber,
    score: result.score,
    completedAt: new Date(result.completedAt),
    timeSpent: result.timeSpent,
    correctAnswers: result.correctAnswers,
    totalQuestions: result.totalQuestions,
    answers: result.answers,
    achievements: mapAchievementPayload(result.achievements),
    student: result.student ? mapBasicUser(result.student, "student") : undefined,
    topic: result.topic
      ? {
          id: result.topic.id,
          name: result.topic.name,
          description: "",
          icon: "Zap",
          color: result.topic.color,
          difficulty: "easy",
          questions: [],
          teacherId: "",
          createdAt: new Date(),
        }
      : undefined,
  }
}

function readSession(): SessionData | null {
  if (!isBrowser()) return null

  const rawValue = window.localStorage.getItem(SESSION_STORAGE_KEY)
  if (!rawValue) return null

  try {
    const parsed = JSON.parse(rawValue) as SessionData
    return {
      ...parsed,
      user: {
        ...parsed.user,
        achievements: parsed.user.achievements
          ? {
              ...parsed.user.achievements,
              newlyUnlockedAchievements: parsed.user.achievements.newlyUnlockedAchievements.map((achievement) => ({
                ...achievement,
                unlockedAt: new Date(achievement.unlockedAt),
              })),
            }
          : null,
        createdAt: new Date(parsed.user.createdAt),
      },
    }
  } catch {
    window.localStorage.removeItem(SESSION_STORAGE_KEY)
    return null
  }
}

function writeSession(session: SessionData | null) {
  if (!isBrowser()) return

  if (!session) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

function normalizeApiErrorMessage(message: string) {
  const normalized = message.trim().toLowerCase()

  if (
    normalized === "bad credentials" ||
    normalized === "invalid credentials" ||
    normalized === "credenciales invalidas" ||
    normalized === "user not found"
  ) {
    return "The email or password is incorrect."
  }

  if (normalized === "unauthorized") {
    return "Your session is invalid or has expired."
  }

  if (normalized === "forbidden") {
    return "You are not allowed to perform this action."
  }

  return message
}

export class ApiError extends Error {
  code?: string
  status?: number

  constructor(message: string, options: { code?: string; status?: number } = {}) {
    super(message)
    this.name = "ApiError"
    this.code = options.code
    this.status = options.status
  }
}

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = readSession()
  const headers = new Headers(init.headers)

  if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  if (session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`)
  }

  try {
    pendingRequestCount += 1
    notifyNetworkActivity()

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
    })

    if (!response.ok) {
      let message = "Could not complete the request."
      try {
        const contentType = response.headers.get("content-type") || ""
        if (contentType.includes("application/json")) {
          const payload = (await response.json()) as {
            error?: {
              code?: string
              message?: string
            }
            message?: string
          }
          message = payload.error?.message || payload.message || message
          throw new ApiError(normalizeApiErrorMessage(message), {
            code: payload.error?.code,
            status: response.status,
          })
        } else {
          const text = await response.text()
          if (text) {
            message = text
          }
        }
      } catch {
        // Ignore text parsing failures.
      }

      if (response.status === 403 && message === "Could not complete the request.") {
        if (path.includes("/results")) {
          message = "You are not allowed to submit results for this classroom."
        } else {
          message = "You are not allowed to perform this action."
        }
      }
      throw new ApiError(normalizeApiErrorMessage(message), { status: response.status })
    }

    if (response.status === 204) {
      return undefined as T
    }

    const contentType = response.headers.get("content-type") || ""
    if (!contentType.includes("application/json")) {
      return undefined as T
    }

    return (await response.json()) as T
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Could not connect to the backend at ${API_BASE_URL}. Check that the server is running and that CORS allows this frontend origin.`
      )
    }

    throw error
  } finally {
    pendingRequestCount = Math.max(0, pendingRequestCount - 1)
    notifyNetworkActivity()
  }
}

export function getStoredSession() {
  return readSession()
}

export function clearStoredSession() {
  writeSession(null)
}

export async function loginWithEmail(email: string, password: string) {
  const response = await apiRequest<LearningAuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })

  const session: SessionData = {
    accessToken: response.token,
    user: mapUser(response.user),
  }

  writeSession(session)
  return session
}

export async function quickStudentLogin(name: string) {
  const response = await apiRequest<LearningAuthResponse>("/api/auth/student-quick-login", {
    method: "POST",
    body: JSON.stringify({ name }),
  })

  const session: SessionData = {
    accessToken: response.token,
    user: mapUser(response.user),
  }

  writeSession(session)
  return session
}

export async function loginWithGoogle(idToken: string, role: "teacher" | "student") {
  const response = await apiRequest<CoreAuthResponse>("/auth/google", {
    method: "POST",
    body: JSON.stringify({
      idToken,
      role: role === "teacher" ? "TEACHER" : "STUDENT",
    }),
  })

  const session: SessionData = {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    user: mapCoreAuthUser(response.user),
  }

  writeSession(session)
  return session
}

export async function registerUser(payload: {
  fullName: string
  email: string
  password: string
  role: "TEACHER" | "STUDENT"
}) {
  const response = await apiRequest<CoreAuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  })

  const session: SessionData = {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    user: mapCoreAuthUser(response.user),
  }

  writeSession(session)
  return session
}

export async function getCurrentUser() {
  const user = await apiRequest<AuthUserResponse>("/api/auth/me")
  const session = readSession()
  const updatedUser = mapUser(user)

  if (session) {
    writeSession({
      ...session,
      user: updatedUser,
    })
  }

  return updatedUser
}

export async function logout() {
  try {
    await apiRequest<void>("/api/auth/logout", { method: "POST" })
  } finally {
    writeSession(null)
  }
}

export async function updateProfile(payload: {
  name?: string
  avatarId?: AvatarId
  studentAvatarId?: AvatarId
  parentAvatarId?: AvatarId
}) {
  const response = await apiRequest<AuthUserResponse>("/api/users/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  })

  const session = readSession()
  const updatedUser = mapUser(response)

  if (session) {
    writeSession({
      ...session,
      user: updatedUser,
    })
  }

  return updatedUser
}

export async function trackAchievementSectionVisit(section: "HOME" | "PROFILE" | "CLASSROOMS" | "ACHIEVEMENTS" | "REWARDS") {
  const response = await apiRequest<BackendAchievementPayload>("/api/achievements/section-visits", {
    method: "POST",
    body: JSON.stringify({ section }),
  })

  return mapAchievementPayload(response)
}

export async function trackAchievementFeatureUse(feature: "UPDATE_AVATAR" | "EDIT_PROFILE" | "JOIN_CLASSROOM" | "OPEN_ACHIEVEMENTS" | "VIEW_PROGRESS") {
  const response = await apiRequest<BackendAchievementPayload>("/api/achievements/feature-uses", {
    method: "POST",
    body: JSON.stringify({ feature }),
  })

  return mapAchievementPayload(response)
}

export async function trackAchievementActivityType(activityType: "QUIZ" | "MEMORY" | "MATCH" | "DRAG_DROP") {
  const response = await apiRequest<BackendAchievementPayload>("/api/achievements/activity-types", {
    method: "POST",
    body: JSON.stringify({ activityType }),
  })

  return mapAchievementPayload(response)
}

export async function getTeacherClassrooms() {
  const response = await apiRequest<BackendClassroom[]>("/api/classrooms/teachers/me")
  return response.map(mapClassroom)
}

export async function getTeacherClassroomDetail(classroomId: string) {
  const response = await apiRequest<BackendTeacherClassroomDetail>(`/api/classrooms/teachers/me/${classroomId}/detail`)
  return {
    classroom: mapClassroom(response.classroom),
    results: response.results.map((result) => ({
      id: `${result.studentId}-${result.weekNumber}`,
      studentId: result.studentId,
      classroomId: response.classroom.id,
      topicId: "",
      weekNumber: result.weekNumber,
      score: result.score,
      completedAt: new Date(),
      timeSpent: result.timeSpent,
      student: mapBasicUser(result.student, "student"),
    })),
  }
}

export async function getClassroomPedagogicalTagsOverview(classroomId: string): Promise<ClassroomPedagogicalTagsOverview> {
  const response = await apiRequest<BackendClassroomPedagogicalTagsOverview>(
    `/api/classrooms/${classroomId}/pedagogical-tags/overview`
  )

  return {
    classroomId: response.classroomId,
    classroomName: response.classroomName,
    metrics: (response.metrics || []).map(mapPedagogicalTagMetric),
  }
}

export async function getStudentPedagogicalTags(
  classroomId: string,
  studentId: string
): Promise<StudentPedagogicalTagsOverview> {
  const response = await apiRequest<BackendStudentPedagogicalTagsOverview>(
    `/api/classrooms/${classroomId}/students/${studentId}/pedagogical-tags`
  )

  return {
    studentId: response.studentId,
    studentName: response.studentName,
    metrics: (response.metrics || []).map(mapPedagogicalTagMetric),
  }
}

export async function createClassroom(payload: Pick<Classroom, "name" | "code" | "description">) {
  const response = await apiRequest<BackendClassroom>("/api/classrooms", {
    method: "POST",
    body: JSON.stringify(payload),
  })
  return mapClassroom(response)
}

export async function updateClassroom(classroomId: string, payload: Partial<Pick<Classroom, "name" | "code" | "description" | "activePlanId" | "currentWeek">>) {
  const response = await apiRequest<BackendClassroom>(`/api/classrooms/${classroomId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
  return mapClassroom(response)
}

export async function deleteClassroom(classroomId: string) {
  await apiRequest<void>(`/api/classrooms/${classroomId}`, { method: "DELETE" })
}

export async function assignPlan(classroomId: string, planId: string | null) {
  const response = await apiRequest<BackendClassroom>(`/api/classrooms/${classroomId}/assign-plan`, {
    method: "POST",
    body: JSON.stringify({ planId }),
  })
  return mapClassroom(response)
}

export async function getTeacherPlans() {
  const response = await apiRequest<BackendPlan[]>("/api/plans/teachers/me")
  return response.map(mapPlan)
}

export async function createPlan(payload: {
  name: string
  description: string
  activationMode: Plan["activationMode"]
  startDate: Date | null
}) {
  const response = await apiRequest<BackendPlan>("/api/plans", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      activationMode: payload.activationMode.toUpperCase(),
      startDate: payload.startDate ? payload.startDate.toISOString().split("T")[0] : null,
    }),
  })
  return mapPlan(response)
}

export async function updatePlan(planId: string, payload: {
  name: string
  description: string
  activationMode: Plan["activationMode"]
  startDate: Date | null
}) {
  const response = await apiRequest<BackendPlan>(`/api/plans/${planId}`, {
    method: "PATCH",
    body: JSON.stringify({
      ...payload,
      activationMode: payload.activationMode.toUpperCase(),
      startDate: payload.startDate ? payload.startDate.toISOString().split("T")[0] : null,
    }),
  })
  return mapPlan(response)
}

export async function deletePlan(planId: string) {
  await apiRequest<void>(`/api/plans/${planId}`, { method: "DELETE" })
}

export async function addTopicToPlan(planId: string, topicId: string, weekNumber: number) {
  const response = await apiRequest<BackendPlan>(`/api/plans/${planId}/topics`, {
    method: "POST",
    body: JSON.stringify({ topicId, weekNumber }),
  })
  return mapPlan(response)
}

export async function removeTopicFromPlan(planId: string, topicId: string) {
  const response = await apiRequest<BackendPlan>(`/api/plans/${planId}/topics/${topicId}`, {
    method: "DELETE",
  })
  return mapPlan(response)
}

export async function reorderPlanTopics(planId: string, orderedTopicIds: string[]) {
  const response = await apiRequest<BackendPlan>(`/api/plans/${planId}/topics/reorder`, {
    method: "PUT",
    body: JSON.stringify({ orderedTopicIds }),
  })
  return mapPlan(response)
}

export async function activatePlanWeek(planId: string, weekNumber: number) {
  return apiRequest<{ planId: string; activeWeekNumber: number }>(`/api/plans/${planId}/activate-week`, {
    method: "POST",
    body: JSON.stringify({ weekNumber }),
  })
}

export async function getTeacherTopics() {
  const response = await apiRequest<BackendTopic[]>("/api/topics/teachers/me")
  return response.map(mapTopic)
}

export async function getPedagogicalTags(query?: string) {
  const search = query?.trim() ? `?query=${encodeURIComponent(query.trim())}` : ""
  const response = await apiRequest<BackendPedagogicalTag[]>(`/api/pedagogical-tags${search}`)
  return response.map(mapPedagogicalTag)
}

export async function createPedagogicalTag(name: string) {
  const response = await apiRequest<BackendPedagogicalTag>("/api/pedagogical-tags", {
    method: "POST",
    body: JSON.stringify({ name }),
  })

  return mapPedagogicalTag(response)
}

export async function updatePedagogicalTag(tagId: string, name: string) {
  const response = await apiRequest<BackendPedagogicalTag>(`/api/pedagogical-tags/${tagId}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  })

  return mapPedagogicalTag(response)
}

export async function deletePedagogicalTag(tagId: string) {
  await apiRequest<void>(`/api/pedagogical-tags/${tagId}`, {
    method: "DELETE",
  })
}

export async function createTopic(payload: {
  name: string
  description: string
  icon: string
  color: string
  difficulty: Topic["difficulty"]
  questions: TopicQuestion[]
}) {
  const response = await apiRequest<BackendTopic>("/api/topics", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      difficulty: payload.difficulty.toUpperCase(),
    }),
  })
  return mapTopic(response)
}

export async function updateTopic(topicId: string, payload: {
  name: string
  description: string
  icon: string
  color: string
  difficulty: Topic["difficulty"]
  questions: TopicQuestion[]
}) {
  const response = await apiRequest<BackendTopic>(`/api/topics/${topicId}`, {
    method: "PATCH",
    body: JSON.stringify({
      ...payload,
      difficulty: payload.difficulty.toUpperCase(),
    }),
  })
  return mapTopic(response)
}

export async function deleteTopic(topicId: string) {
  await apiRequest<void>(`/api/topics/${topicId}`, { method: "DELETE" })
}

export async function getStudentClassrooms() {
  const response = await apiRequest<BackendClassroom[]>("/api/classrooms/students/me")
  return response.map(mapClassroom)
}

export async function getStudentResults(classroomId?: string) {
  const query = classroomId ? `?classroomId=${encodeURIComponent(classroomId)}` : ""
  const response = await apiRequest<BackendStudentResult[]>(`/api/students/me/results${query}`)
  return response.map(mapStudentResult)
}

export async function joinClassroom(code: string) {
  const response = await apiRequest<BackendClassroom>("/api/classrooms/join", {
    method: "POST",
    body: JSON.stringify({ code }),
  })
  return mapClassroom(response)
}

export async function getClassroomLeaderboard(classroomId: string, weekNumber?: number) {
  const query = weekNumber ? `?weekNumber=${weekNumber}` : ""
  const response = await apiRequest<BackendLeaderboardEntry[]>(`/api/classrooms/${classroomId}/leaderboard${query}`)
  return response.map<LeaderboardEntry>((entry) => ({
    student: mapBasicUser(entry.student, "student"),
    totalScore: entry.totalScore,
    rank: entry.rank,
  }))
}

export async function getGameplayContext(classroomId: string) {
  const response = await apiRequest<BackendGameplayContext>(`/api/gameplay/context?classroomId=${encodeURIComponent(classroomId)}`)
  return {
    classroomId: response.classroom.id,
    classroomName: response.classroom.name,
    currentWeek: response.classroom.currentWeek || 0,
    attemptAllowed: response.attemptAllowed,
    topic: response.topic
      ? ({
          id: response.topic.id,
          name: response.topic.name,
          description: response.topic.description || "",
          icon: "Zap",
          color: response.topic.color,
          difficulty: "easy",
          questions: ensureQuestions(response.topic.questions),
          teacherId: "",
          createdAt: new Date(),
        } satisfies Topic)
      : null,
    existingResult: response.existingResult ? mapStudentResult(response.existingResult) : null,
  }
}

export async function connectGameplayPresence(classroomId: string) {
  await apiRequest<void>(`/api/gameplay/presence/connect?classroomId=${encodeURIComponent(classroomId)}`, {
    method: "POST",
  })
}

export async function heartbeatGameplayPresence(classroomId: string) {
  await apiRequest<void>(`/api/gameplay/presence/heartbeat?classroomId=${encodeURIComponent(classroomId)}`, {
    method: "POST",
  })
}

export async function disconnectGameplayPresence(
  classroomId: string,
  options: { keepalive?: boolean } = {}
) {
  await apiRequest<void>(`/api/gameplay/presence/disconnect?classroomId=${encodeURIComponent(classroomId)}`, {
    method: "POST",
    keepalive: options.keepalive,
  })
}

export function subscribeToGameplayStream(
  classroomId: string,
  options: {
    onSubscribed?: (event: GameplayStreamSubscribedEvent) => void
    onPresenceSnapshot?: (event: PresenceSnapshotEvent) => void
    onStudentConnected: (event: StudentPresenceStreamEvent) => void
    onStudentDisconnected?: (event: StudentPresenceStreamEvent) => void
    onError?: (error: Error) => void
  }
) {
  const session = readSession()
  if (!session?.accessToken || !isBrowser()) {
    return () => undefined
  }

  let isClosed = false
  let source: EventSource | null = null
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null

  const scheduleReconnect = () => {
    if (isClosed) return

    reconnectTimeout = setTimeout(() => {
      connect()
    }, 3000)
  }

  const connect = () => {
    if (isClosed) {
      return
    }

    source = new EventSource(
      `${API_BASE_URL}/api/gameplay/stream?classroomId=${encodeURIComponent(classroomId)}&accessToken=${encodeURIComponent(session.accessToken)}`
    )

    source.addEventListener("subscribed", (event) => {
      try {
        options.onSubscribed?.(JSON.parse((event as MessageEvent<string>).data) as GameplayStreamSubscribedEvent)
      } catch {
        // Ignore malformed SSE payloads.
      }
    })

    source.addEventListener("presence-snapshot", (event) => {
      try {
        options.onPresenceSnapshot?.(JSON.parse((event as MessageEvent<string>).data) as PresenceSnapshotEvent)
      } catch {
        // Ignore malformed SSE payloads.
      }
    })

    source.addEventListener("student-connected", (event) => {
      try {
        options.onStudentConnected(JSON.parse((event as MessageEvent<string>).data) as StudentPresenceStreamEvent)
      } catch {
        // Ignore malformed SSE payloads.
      }
    })

    source.addEventListener("student-disconnected", (event) => {
      try {
        options.onStudentDisconnected?.(JSON.parse((event as MessageEvent<string>).data) as StudentPresenceStreamEvent)
      } catch {
        // Ignore malformed SSE payloads.
      }
    })

    source.onerror = () => {
      source?.close()
      source = null

      if (!isClosed) {
        options.onError?.(new Error("The live classroom stream connection failed."))
        scheduleReconnect()
      }
    }
  }

  connect()

  return () => {
    isClosed = true
    source?.close()
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout)
    }
  }
}

export async function submitResult(params: {
  classroomId: string
  topicId: string
  weekNumber: number
  score: number
  timeSpent: number
  correctAnswers: number
  totalQuestions: number
  answers: unknown
}) {
  const response = await apiRequest<BackendStudentResult>(
    `/api/classrooms/${params.classroomId}/topics/${params.topicId}/results`,
    {
      method: "POST",
      body: JSON.stringify({
        weekNumber: params.weekNumber,
        score: params.score,
        timeSpent: params.timeSpent,
        correctAnswers: params.correctAnswers,
        totalQuestions: params.totalQuestions,
        answers: params.answers,
      }),
    }
  )

  return mapStudentResult(response)
}
