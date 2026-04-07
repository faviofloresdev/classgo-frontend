// ClassGo Types

export type UserRole = 'teacher' | 'student'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatarId: string
  createdAt: Date
}

export interface Classroom {
  id: string
  name: string
  code: string
  description: string
  teacherId: string
  activePlanId: string | null
  currentWeek: number
  createdAt: Date
}

export interface Enrollment {
  id: string
  classroomId: string
  studentId: string
  joinedAt: Date
}

export interface Plan {
  id: string
  name: string
  description: string
  teacherId: string
  activationMode: 'manual' | 'auto'
  startDate: Date | null
  createdAt: Date
}

export interface Topic {
  id: string
  name: string
  description: string
  icon: string
  color: string
  difficulty: 'easy' | 'medium' | 'hard'
  teacherId: string
  createdAt: Date
}

export interface PlanTopic {
  id: string
  planId: string
  topicId: string
  weekNumber: number
  isActive: boolean
}

export interface StudentResult {
  id: string
  studentId: string
  classroomId: string
  topicId: string
  weekNumber: number
  score: number
  completedAt: Date
  timeSpent: number // seconds
}

export interface WeekHistory {
  id: string
  classroomId: string
  weekNumber: number
  topicId: string
  startDate: Date
  endDate: Date
  isArchived: boolean
}

// Extended types with relations
export interface ClassroomWithDetails extends Classroom {
  teacher?: User
  students?: User[]
  plan?: PlanWithTopics
  currentTopic?: Topic
}

export interface PlanWithTopics extends Plan {
  topics: (PlanTopic & { topic: Topic })[]
}

export interface StudentResultWithDetails extends StudentResult {
  student?: User
  topic?: Topic
}

export interface TopicWithWeek extends Topic {
  weekNumber: number
  isActive: boolean
}
