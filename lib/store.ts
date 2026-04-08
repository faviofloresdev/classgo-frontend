// Mock data store - Replace with PostgreSQL queries later
import type { 
  User, Classroom, Plan, Topic, PlanTopic, 
  Enrollment, StudentResult, ClassroomWithDetails, 
  PlanWithTopics, StudentResultWithDetails 
} from './types'

// Generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 15)

// Mock Users
export const users: User[] = [
  {
    id: 'teacher-1',
    name: 'Prof. Garcia',
    email: 'garcia@classgo.com',
    role: 'teacher',
    avatarId: 'char-1',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'student-1',
    name: 'Maria Lopez',
    email: 'maria@student.com',
    role: 'student',
    avatarId: 'animal-1',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'student-2',
    name: 'Carlos Ruiz',
    email: 'carlos@student.com',
    role: 'student',
    avatarId: 'robot-1',
    createdAt: new Date('2024-01-16'),
  },
  {
    id: 'student-3',
    name: 'Ana Martinez',
    email: 'ana@student.com',
    role: 'student',
    avatarId: 'monster-1',
    createdAt: new Date('2024-01-17'),
  },
  {
    id: 'student-4',
    name: 'Luis Fernandez',
    email: 'luis@student.com',
    role: 'student',
    avatarId: 'char-2',
    createdAt: new Date('2024-01-18'),
  },
  {
    id: 'student-5',
    name: 'Sofia Torres',
    email: 'sofia@student.com',
    role: 'student',
    avatarId: 'animal-3',
    createdAt: new Date('2024-01-19'),
  },
]

// Mock Topics
export const topics: Topic[] = [
  {
    id: 'topic-1',
    name: 'Sumas Basicas',
    description: 'Aprende a sumar numeros del 1 al 10',
    icon: 'Calculator',
    color: '#10B981',
    difficulty: 'easy',
    questions: [
      {
        id: 'topic-1-q1',
        type: 'single_choice',
        prompt: 'What is 3 + 4?',
        explanation: 'We add 3 and 4 to get 7.',
        options: [
          { id: 'a', text: '6', isCorrect: false },
          { id: 'b', text: '7', isCorrect: true },
          { id: 'c', text: '8', isCorrect: false },
        ],
      },
    ],
    teacherId: 'teacher-1',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'topic-2',
    name: 'Restas Basicas',
    description: 'Aprende a restar numeros del 1 al 10',
    icon: 'Minus',
    color: '#3B82F6',
    difficulty: 'easy',
    questions: [
      {
        id: 'topic-2-q1',
        type: 'fill_in_blank',
        prompt: 'Completa la palabra escondiendo letras.',
        word: 'CUATRO',
        hiddenIndexes: [1, 3],
      },
    ],
    teacherId: 'teacher-1',
    createdAt: new Date('2024-01-02'),
  },
  {
    id: 'topic-3',
    name: 'Multiplication',
    description: 'Multiplication tables from 1 to 5',
    icon: 'X',
    color: '#8B5CF6',
    difficulty: 'medium',
    questions: [
      {
        id: 'topic-3-q1',
        type: 'multiple_choice',
        prompt: 'Select all multiplication facts that equal 12.',
        options: [
          { id: 'a', text: '3 x 4', isCorrect: true },
          { id: 'b', text: '2 x 6', isCorrect: true },
          { id: 'c', text: '5 x 2', isCorrect: false },
          { id: 'd', text: '4 x 4', isCorrect: false },
        ],
      },
    ],
    teacherId: 'teacher-1',
    createdAt: new Date('2024-01-03'),
  },
  {
    id: 'topic-4',
    name: 'Division',
    description: 'Basic division with small numbers',
    icon: 'Divide',
    color: '#F59E0B',
    difficulty: 'medium',
    questions: [
      {
        id: 'topic-4-q1',
        type: 'listen_and_select',
        prompt: 'Listen and select the correct answer.',
        audioText: 'Six divided by two',
        options: [
          { id: 'a', text: '2', isCorrect: false },
          { id: 'b', text: '3', isCorrect: true },
          { id: 'c', text: '4', isCorrect: false },
        ],
      },
    ],
    teacherId: 'teacher-1',
    createdAt: new Date('2024-01-04'),
  },
  {
    id: 'topic-5',
    name: 'Fractions',
    description: 'Introduction to fractions',
    icon: 'PieChart',
    color: '#EF4444',
    difficulty: 'hard',
    questions: [
      {
        id: 'topic-5-q1',
        type: 'match_items',
        prompt: 'Match each clue with the correct word.',
        instruction: 'Connect each short clue with the correct word.',
        pairs: [
          { id: 'a', left: 'Has four equal sides', right: 'Square' },
          { id: 'b', left: 'Color of the sky', right: 'Blue' },
          { id: 'c', left: 'Animal that barks', right: 'Dog' },
        ],
      },
    ],
    teacherId: 'teacher-1',
    createdAt: new Date('2024-01-05'),
  },
]

// Mock Plans
export const plans: Plan[] = [
  {
    id: 'plan-1',
    name: 'Math Level 1',
    description: 'Basic math plan for beginners',
    teacherId: 'teacher-1',
    activationMode: 'manual',
    startDate: new Date('2024-02-01'),
    createdAt: new Date('2024-01-10'),
  },
  {
    id: 'plan-2',
    name: 'Matematicas Nivel 2',
    description: 'Plan intermedio de matematicas',
    teacherId: 'teacher-1',
    activationMode: 'auto',
    startDate: new Date('2024-03-01'),
    createdAt: new Date('2024-01-15'),
  },
]

// Mock Plan Topics (relationship)
export const planTopics: PlanTopic[] = [
  { id: 'pt-1', planId: 'plan-1', topicId: 'topic-1', weekNumber: 1, isActive: true },
  { id: 'pt-2', planId: 'plan-1', topicId: 'topic-2', weekNumber: 2, isActive: false },
  { id: 'pt-3', planId: 'plan-1', topicId: 'topic-3', weekNumber: 3, isActive: false },
  { id: 'pt-4', planId: 'plan-2', topicId: 'topic-3', weekNumber: 1, isActive: false },
  { id: 'pt-5', planId: 'plan-2', topicId: 'topic-4', weekNumber: 2, isActive: false },
  { id: 'pt-6', planId: 'plan-2', topicId: 'topic-5', weekNumber: 3, isActive: false },
]

// Mock Classrooms
export const classrooms: Classroom[] = [
  {
    id: 'classroom-1',
    name: 'Clase 3A - Matematicas',
    code: 'MAT3A',
    description: 'Clase de matematicas para tercer grado',
    teacherId: 'teacher-1',
    activePlanId: 'plan-1',
    currentWeek: 1,
    createdAt: new Date('2024-01-20'),
  },
  {
    id: 'classroom-2',
    name: 'Clase 4B - Matematicas',
    code: 'MAT4B',
    description: 'Clase de matematicas para cuarto grado',
    teacherId: 'teacher-1',
    activePlanId: null,
    currentWeek: 0,
    createdAt: new Date('2024-01-25'),
  },
]

// Mock Enrollments
export const enrollments: Enrollment[] = [
  { id: 'enroll-1', classroomId: 'classroom-1', studentId: 'student-1', joinedAt: new Date('2024-02-01') },
  { id: 'enroll-2', classroomId: 'classroom-1', studentId: 'student-2', joinedAt: new Date('2024-02-01') },
  { id: 'enroll-3', classroomId: 'classroom-1', studentId: 'student-3', joinedAt: new Date('2024-02-02') },
  { id: 'enroll-4', classroomId: 'classroom-1', studentId: 'student-4', joinedAt: new Date('2024-02-03') },
  { id: 'enroll-5', classroomId: 'classroom-1', studentId: 'student-5', joinedAt: new Date('2024-02-03') },
]

// Mock Student Results
export const studentResults: StudentResult[] = [
  { id: 'result-1', studentId: 'student-1', classroomId: 'classroom-1', topicId: 'topic-1', weekNumber: 1, score: 95, completedAt: new Date('2024-02-05'), timeSpent: 180 },
  { id: 'result-2', studentId: 'student-2', classroomId: 'classroom-1', topicId: 'topic-1', weekNumber: 1, score: 88, completedAt: new Date('2024-02-06'), timeSpent: 220 },
  { id: 'result-3', studentId: 'student-3', classroomId: 'classroom-1', topicId: 'topic-1', weekNumber: 1, score: 92, completedAt: new Date('2024-02-05'), timeSpent: 195 },
  { id: 'result-4', studentId: 'student-4', classroomId: 'classroom-1', topicId: 'topic-1', weekNumber: 1, score: 78, completedAt: new Date('2024-02-07'), timeSpent: 300 },
]

// Helper functions to query mock data

export function getTeacherClassrooms(teacherId: string): ClassroomWithDetails[] {
  return classrooms
    .filter(c => c.teacherId === teacherId)
    .map(c => ({
      ...c,
      teacher: users.find(u => u.id === c.teacherId),
      students: enrollments
        .filter(e => e.classroomId === c.id)
        .map(e => users.find(u => u.id === e.studentId))
        .filter((u): u is User => u !== undefined),
      plan: c.activePlanId ? getPlanWithTopics(c.activePlanId) : undefined,
    }))
}

export function getStudentClassrooms(studentId: string): ClassroomWithDetails[] {
  const studentEnrollments = enrollments.filter(e => e.studentId === studentId)
  return studentEnrollments
    .map(e => classrooms.find(c => c.id === e.classroomId))
    .filter((c): c is Classroom => c !== undefined)
    .map(c => ({
      ...c,
      teacher: users.find(u => u.id === c.teacherId),
      students: enrollments
        .filter(e => e.classroomId === c.id)
        .map(e => users.find(u => u.id === e.studentId))
        .filter((u): u is User => u !== undefined),
      plan: c.activePlanId ? getPlanWithTopics(c.activePlanId) : undefined,
    }))
}

export function getPlanWithTopics(planId: string): PlanWithTopics | undefined {
  const plan = plans.find(p => p.id === planId)
  if (!plan) return undefined
  
  const planTopicsList = planTopics
    .filter(pt => pt.planId === planId)
    .sort((a, b) => a.weekNumber - b.weekNumber)
    .map(pt => ({
      ...pt,
      topic: topics.find(t => t.id === pt.topicId)!,
    }))
    .filter(pt => pt.topic !== undefined)
  
  return { ...plan, topics: planTopicsList }
}

export function getTeacherPlans(teacherId: string): PlanWithTopics[] {
  return plans
    .filter(p => p.teacherId === teacherId)
    .map(p => getPlanWithTopics(p.id)!)
    .filter(p => p !== undefined)
}

export function getTeacherTopics(teacherId: string): Topic[] {
  return topics.filter(t => t.teacherId === teacherId)
}

export function getTopicById(topicId: string): Topic | undefined {
  return topics.find(t => t.id === topicId)
}

export function getClassroomResults(classroomId: string, weekNumber?: number): StudentResultWithDetails[] {
  let results = studentResults.filter(r => r.classroomId === classroomId)
  if (weekNumber !== undefined) {
    results = results.filter(r => r.weekNumber === weekNumber)
  }
  return results.map(r => ({
    ...r,
    student: users.find(u => u.id === r.studentId),
    topic: topics.find(t => t.id === r.topicId),
  }))
}

export function getStudentResults(studentId: string, classroomId?: string): StudentResultWithDetails[] {
  let results = studentResults.filter(r => r.studentId === studentId)
  if (classroomId) {
    results = results.filter(r => r.classroomId === classroomId)
  }
  return results.map(r => ({
    ...r,
    student: users.find(u => u.id === r.studentId),
    topic: topics.find(t => t.id === r.topicId),
  }))
}

export function getLeaderboard(classroomId: string, weekNumber?: number): { student: User; totalScore: number; rank: number }[] {
  const results = getClassroomResults(classroomId, weekNumber)
  const scoresByStudent = new Map<string, number>()
  
  results.forEach(r => {
    const current = scoresByStudent.get(r.studentId) || 0
    scoresByStudent.set(r.studentId, current + r.score)
  })
  
  const leaderboard = Array.from(scoresByStudent.entries())
    .map(([studentId, totalScore]) => ({
      student: users.find(u => u.id === studentId)!,
      totalScore,
      rank: 0,
    }))
    .filter(l => l.student !== undefined)
    .sort((a, b) => b.totalScore - a.totalScore)
  
  leaderboard.forEach((entry, index) => {
    entry.rank = index + 1
  })
  
  return leaderboard
}

// CRUD Operations (mutate mock data)

export function createClassroom(data: Omit<Classroom, 'id' | 'createdAt'>): Classroom {
  const newClassroom: Classroom = {
    ...data,
    id: generateId(),
    createdAt: new Date(),
  }
  classrooms.push(newClassroom)
  return newClassroom
}

export function updateClassroom(id: string, data: Partial<Classroom>): Classroom | undefined {
  const index = classrooms.findIndex(c => c.id === id)
  if (index === -1) return undefined
  classrooms[index] = { ...classrooms[index], ...data }
  return classrooms[index]
}

export function deleteClassroom(id: string): boolean {
  const index = classrooms.findIndex(c => c.id === id)
  if (index === -1) return false
  classrooms.splice(index, 1)
  // Also delete enrollments
  const enrollmentIndexes = enrollments
    .map((e, i) => e.classroomId === id ? i : -1)
    .filter(i => i !== -1)
    .reverse()
  enrollmentIndexes.forEach(i => enrollments.splice(i, 1))
  return true
}

export function createPlan(data: Omit<Plan, 'id' | 'createdAt'>): Plan {
  const newPlan: Plan = {
    ...data,
    id: generateId(),
    createdAt: new Date(),
  }
  plans.push(newPlan)
  return newPlan
}

export function updatePlan(id: string, data: Partial<Plan>): Plan | undefined {
  const index = plans.findIndex(p => p.id === id)
  if (index === -1) return undefined
  plans[index] = { ...plans[index], ...data }
  return plans[index]
}

export function deletePlan(id: string): boolean {
  const index = plans.findIndex(p => p.id === id)
  if (index === -1) return false
  plans.splice(index, 1)
  // Also delete plan topics
  const ptIndexes = planTopics
    .map((pt, i) => pt.planId === id ? i : -1)
    .filter(i => i !== -1)
    .reverse()
  ptIndexes.forEach(i => planTopics.splice(i, 1))
  return true
}

export function createTopic(data: Omit<Topic, 'id' | 'createdAt'>): Topic {
  const newTopic: Topic = {
    ...data,
    id: generateId(),
    createdAt: new Date(),
  }
  topics.push(newTopic)
  return newTopic
}

export function updateTopic(id: string, data: Partial<Topic>): Topic | undefined {
  const index = topics.findIndex(t => t.id === id)
  if (index === -1) return undefined
  topics[index] = { ...topics[index], ...data }
  return topics[index]
}

export function deleteTopic(id: string): boolean {
  const index = topics.findIndex(t => t.id === id)
  if (index === -1) return false
  topics.splice(index, 1)
  return true
}

export function addTopicToPlan(planId: string, topicId: string, weekNumber: number): PlanTopic {
  const newPlanTopic: PlanTopic = {
    id: generateId(),
    planId,
    topicId,
    weekNumber,
    isActive: false,
  }
  planTopics.push(newPlanTopic)
  return newPlanTopic
}

export function removeTopicFromPlan(planId: string, topicId: string): boolean {
  const index = planTopics.findIndex(pt => pt.planId === planId && pt.topicId === topicId)
  if (index === -1) return false
  planTopics.splice(index, 1)
  return true
}

export function reorderPlanTopics(planId: string, orderedTopicIds: string[]): void {
  orderedTopicIds.forEach((topicId, index) => {
    const pt = planTopics.find(pt => pt.planId === planId && pt.topicId === topicId)
    if (pt) {
      pt.weekNumber = index + 1
    }
  })
}

export function activateWeekTopic(planId: string, weekNumber: number): void {
  planTopics.forEach(pt => {
    if (pt.planId === planId) {
      pt.isActive = pt.weekNumber === weekNumber
    }
  })
}

export function updateUserAvatar(userId: string, avatarId: string): User | undefined {
  const index = users.findIndex(u => u.id === userId)
  if (index === -1) return undefined
  users[index].avatarId = avatarId
  return users[index]
}

export function updateUserProfile(userId: string, data: Partial<Pick<User, 'name' | 'avatarId'>>): User | undefined {
  const index = users.findIndex(u => u.id === userId)
  if (index === -1) return undefined
  users[index] = { ...users[index], ...data }
  return users[index]
}

export function getUserById(userId: string): User | undefined {
  return users.find(u => u.id === userId)
}

export function getClassroomById(classroomId: string): ClassroomWithDetails | undefined {
  const classroom = classrooms.find(c => c.id === classroomId)
  if (!classroom) return undefined
  
  return {
    ...classroom,
    teacher: users.find(u => u.id === classroom.teacherId),
    students: enrollments
      .filter(e => e.classroomId === classroom.id)
      .map(e => users.find(u => u.id === e.studentId))
      .filter((u): u is User => u !== undefined),
    plan: classroom.activePlanId ? getPlanWithTopics(classroom.activePlanId) : undefined,
  }
}

export function getActiveTopicForClassroom(classroomId: string): Topic | undefined {
  const classroom = classrooms.find(c => c.id === classroomId)
  if (!classroom || !classroom.activePlanId) return undefined
  
  const activePlanTopic = planTopics.find(
    pt => pt.planId === classroom.activePlanId && pt.isActive
  )
  if (!activePlanTopic) return undefined
  
  return topics.find(t => t.id === activePlanTopic.topicId)
}
