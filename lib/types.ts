// ClassGo Types

export type UserRole = 'teacher' | 'student'
export type AvatarId = string

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatarId: AvatarId
  studentAvatarId?: AvatarId | null
  parentAvatarId?: AvatarId | null
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

export type TopicQuestionType =
  | 'multiple_choice'
  | 'single_choice'
  | 'fill_in_blank'
  | 'listen_and_select'
  | 'listen_and_select_text'
  | 'listen_and_select_image'
  | 'image_selection'
  | 'image_multiple_selection'
  | 'single_text_ordering'
  | 'phrase_ordering'
  | 'text_ordering'
  | 'image_ordering'
  | 'match_items'

export interface TopicChoiceOption {
  id: string
  text: string
  imageUrl?: string
  isCorrect: boolean
}

export interface TopicMatchPair {
  id: string
  left: string
  right: string
}

export interface TopicOrderingItem {
  id: string
  text: string
  imageUrl?: string
}

interface TopicQuestionBase {
  id: string
  type: TopicQuestionType
  prompt: string
  imageUrl?: string
  explanation?: string
}

export interface MultipleChoiceQuestion extends TopicQuestionBase {
  type: 'multiple_choice'
  options: TopicChoiceOption[]
}

export interface SingleChoiceQuestion extends TopicQuestionBase {
  type: 'single_choice'
  options: TopicChoiceOption[]
}

export interface FillInBlankQuestion extends TopicQuestionBase {
  type: 'fill_in_blank'
  word: string
  hiddenIndexes: number[]
}

export interface ListenAndSelectQuestion extends TopicQuestionBase {
  type: 'listen_and_select'
  audioText: string
  options: TopicChoiceOption[]
}

export interface ListenAndSelectTextQuestion extends TopicQuestionBase {
  type: 'listen_and_select_text'
  audioText: string
  options: TopicChoiceOption[]
}

export interface ListenAndSelectImageQuestion extends TopicQuestionBase {
  type: 'listen_and_select_image'
  audioText: string
  options: TopicChoiceOption[]
}

export interface ImageSelectionQuestion extends TopicQuestionBase {
  type: 'image_selection'
  options: TopicChoiceOption[]
}

export interface ImageMultipleSelectionQuestion extends TopicQuestionBase {
  type: 'image_multiple_selection'
  options: TopicChoiceOption[]
}

export interface SingleTextOrderingQuestion extends TopicQuestionBase {
  type: 'single_text_ordering'
  items: TopicOrderingItem[]
}

export interface PhraseOrderingQuestion extends TopicQuestionBase {
  type: 'phrase_ordering'
  items: TopicOrderingItem[]
}

export interface TextOrderingQuestion extends TopicQuestionBase {
  type: 'text_ordering'
  items: TopicOrderingItem[]
}

export interface ImageOrderingQuestion extends TopicQuestionBase {
  type: 'image_ordering'
  items: TopicOrderingItem[]
}

export interface MatchItemsQuestion extends TopicQuestionBase {
  type: 'match_items'
  instruction: string
  pairs: TopicMatchPair[]
}

export type TopicQuestion =
  | MultipleChoiceQuestion
  | SingleChoiceQuestion
  | FillInBlankQuestion
  | ListenAndSelectQuestion
  | ListenAndSelectTextQuestion
  | ListenAndSelectImageQuestion
  | ImageSelectionQuestion
  | ImageMultipleSelectionQuestion
  | SingleTextOrderingQuestion
  | PhraseOrderingQuestion
  | TextOrderingQuestion
  | ImageOrderingQuestion
  | MatchItemsQuestion

export interface Topic {
  id: string
  name: string
  description: string
  icon: string
  color: string
  difficulty: 'easy' | 'medium' | 'hard'
  questions: TopicQuestion[]
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
  correctAnswers?: number
  totalQuestions?: number
  answers?: unknown
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

export interface LeaderboardEntry {
  student: User
  totalScore: number
  rank: number
}
