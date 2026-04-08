"use client"

import type {
  Classroom,
  ClassroomWithDetails,
  LeaderboardEntry,
  Plan,
  PlanTopic,
  PlanWithTopics,
  StudentResultWithDetails,
  Topic,
  TopicQuestion,
  User,
} from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081"
const SESSION_STORAGE_KEY = "classgo.session"

type BackendRole = "TEACHER" | "STUDENT" | "PARENT"
type BackendActivationMode = "MANUAL" | "AUTO"
type BackendDifficulty = "EASY" | "MEDIUM" | "HARD"

interface AuthUserResponse {
  id: string
  name: string
  email: string
  role: BackendRole
  avatarId?: string | null
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
  avatarId?: string | null
}

interface BackendTeacher {
  id: string
  name: string
  avatarId?: string | null
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

export interface StudentPresenceStreamEvent {
  classroomId: string
  studentId: string
  studentName: string
  avatarId?: string | null
  message: string
  happenedAt: string
}

export interface GameplayStreamSubscribedEvent {
  classroomId: string
  status: string
}

export interface SessionData {
  accessToken: string
  refreshToken?: string
  user: User
}

function isBrowser() {
  return typeof window !== "undefined"
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
  return Array.isArray(questions) ? (questions as TopicQuestion[]) : []
}

function mapBasicUser(user: BackendBasicUser, role: User["role"]): User {
  return {
    id: user.id,
    name: user.name,
    email: "",
    role,
    avatarId: user.avatarId || "animal-1",
    createdAt: new Date(),
  }
}

function mapUser(user: AuthUserResponse): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email || "",
    role: toRole(user.role),
    avatarId: user.avatarId || "animal-1",
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
    normalized === "credenciales invalidas"
  ) {
    return "The email or password is incorrect."
  }

  if (normalized === "unauthorized") {
    return "Your session is invalid or has expired."
  }

  return message
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

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  })

  if (!response.ok) {
    let message = "No se pudo completar la solicitud."
    try {
      const contentType = response.headers.get("content-type") || ""
      if (contentType.includes("application/json")) {
        const payload = (await response.json()) as {
          error?: {
            message?: string
          }
          message?: string
        }
        message = payload.error?.message || payload.message || message
      } else {
        const text = await response.text()
        if (text) {
          message = text
        }
      }
    } catch {
      // Ignore text parsing failures.
    }
    throw new Error(normalizeApiErrorMessage(message))
  }

  if (response.status === 204) {
    return undefined as T
  }

  const contentType = response.headers.get("content-type") || ""
  if (!contentType.includes("application/json")) {
    return undefined as T
  }

  return (await response.json()) as T
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

export async function updateProfile(payload: { name?: string; avatarId?: string }) {
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
