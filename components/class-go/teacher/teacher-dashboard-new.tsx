"use client"

import { useState, useCallback } from "react"
import { AnimatePresence } from "framer-motion"
import {
  Users,
  BookOpen,
  Lightbulb,
  LogOut,
  Settings,
} from "lucide-react"
import type { User, ClassroomWithDetails, PlanWithTopics, Topic, Classroom, Plan } from "@/lib/types"
import { AvatarSelector } from "../avatar-selector"
import { ClassroomManager } from "./classroom-manager"
import { ClassroomForm } from "./classroom-form"
import { ClassroomDetail } from "./classroom-detail"
import { PlanManager } from "./plan-manager"
import { PlanForm } from "./plan-form"
import { TopicManager } from "./topic-manager"
import { TopicForm } from "./topic-form"
import {
  getTeacherClassrooms,
  getTeacherPlans,
  getTeacherTopics,
  getClassroomResults,
  createClassroom,
  updateClassroom,
  deleteClassroom,
  createPlan,
  updatePlan,
  deletePlan,
  createTopic,
  updateTopic,
  deleteTopic,
  addTopicToPlan,
  removeTopicFromPlan,
  reorderPlanTopics,
  activateWeekTopic,
  updateUserAvatar,
  plans as allPlans,
  classrooms as allClassrooms,
} from "@/lib/store"

type TabId = "classrooms" | "plans" | "topics"

interface TeacherDashboardNewProps {
  user: User
  onLogout: () => void
  onUserUpdate: (user: User) => void
}

export function TeacherDashboardNew({ user, onLogout, onUserUpdate }: TeacherDashboardNewProps) {
  // State
  const [activeTab, setActiveTab] = useState<TabId>("classrooms")
  const [showAvatarSelector, setShowAvatarSelector] = useState(false)

  // Data state (in real app, use SWR)
  const [classrooms, setClassrooms] = useState<ClassroomWithDetails[]>(() =>
    getTeacherClassrooms(user.id)
  )
  const [plans, setPlans] = useState<PlanWithTopics[]>(() => getTeacherPlans(user.id))
  const [topics, setTopics] = useState<Topic[]>(() => getTeacherTopics(user.id))

  // Form states
  const [showClassroomForm, setShowClassroomForm] = useState(false)
  const [editingClassroom, setEditingClassroom] = useState<ClassroomWithDetails | null>(null)
  const [viewingClassroom, setViewingClassroom] = useState<ClassroomWithDetails | null>(null)
  const [showPlanForm, setShowPlanForm] = useState(false)
  const [editingPlan, setEditingPlan] = useState<PlanWithTopics | null>(null)
  const [showTopicForm, setShowTopicForm] = useState(false)
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null)

  // Refresh data
  const refreshData = useCallback(() => {
    setClassrooms(getTeacherClassrooms(user.id))
    setPlans(getTeacherPlans(user.id))
    setTopics(getTeacherTopics(user.id))
  }, [user.id])

  // Classroom handlers
  const handleCreateClassroom = () => {
    setEditingClassroom(null)
    setShowClassroomForm(true)
  }

  const handleEditClassroom = (classroom: ClassroomWithDetails) => {
    setEditingClassroom(classroom)
    setShowClassroomForm(true)
  }

  const handleSaveClassroom = (data: { name: string; code: string; description: string }) => {
    if (editingClassroom) {
      updateClassroom(editingClassroom.id, data)
    } else {
      createClassroom({
        ...data,
        teacherId: user.id,
        activePlanId: null,
        currentWeek: 0,
      })
    }
    setShowClassroomForm(false)
    setEditingClassroom(null)
    refreshData()
  }

  const handleDeleteClassroom = (classroomId: string) => {
    if (confirm("Estas seguro de eliminar esta aula?")) {
      deleteClassroom(classroomId)
      refreshData()
    }
  }

  const handleAssignPlan = (classroomId: string, planId: string | null) => {
    updateClassroom(classroomId, { activePlanId: planId, currentWeek: planId ? 1 : 0 })
    if (planId) {
      activateWeekTopic(planId, 1)
    }
    refreshData()
  }

  const handleAdvanceWeek = () => {
    if (!viewingClassroom) return
    const newWeek = viewingClassroom.currentWeek + 1
    updateClassroom(viewingClassroom.id, { currentWeek: newWeek })
    refreshData()
    setViewingClassroom(getTeacherClassrooms(user.id).find((c) => c.id === viewingClassroom.id) || null)
  }

  const handlePreviousWeek = () => {
    if (!viewingClassroom || viewingClassroom.currentWeek <= 1) return
    const previousWeek = viewingClassroom.currentWeek - 1
    updateClassroom(viewingClassroom.id, { currentWeek: previousWeek })
    refreshData()
    setViewingClassroom(getTeacherClassrooms(user.id).find((c) => c.id === viewingClassroom.id) || null)
  }

  // Plan handlers
  const handleCreatePlan = () => {
    console.log("[v0] handleCreatePlan called")
    setEditingPlan(null)
    setShowPlanForm(true)
  }

  const handleEditPlan = (plan: PlanWithTopics) => {
    setEditingPlan(plan)
    setShowPlanForm(true)
  }

  const handleSavePlan = (data: {
    name: string
    description: string
    activationMode: "manual" | "auto"
    startDate: Date | null
  }) => {
    if (editingPlan) {
      updatePlan(editingPlan.id, data)
    } else {
      createPlan({
        ...data,
        teacherId: user.id,
      })
    }
    setShowPlanForm(false)
    setEditingPlan(null)
    refreshData()
  }

  const handleDeletePlan = (planId: string) => {
    if (confirm("Estas seguro de eliminar este plan?")) {
      deletePlan(planId)
      refreshData()
    }
  }

  const handleAddTopicToPlan = (planId: string, topicId: string) => {
    const plan = plans.find((p) => p.id === planId)
    const weekNumber = (plan?.topics.length || 0) + 1
    addTopicToPlan(planId, topicId, weekNumber)
    refreshData()
  }

  const handleRemoveTopicFromPlan = (planId: string, topicId: string) => {
    removeTopicFromPlan(planId, topicId)
    refreshData()
  }

  const handleReorderTopics = (planId: string, orderedTopicIds: string[]) => {
    reorderPlanTopics(planId, orderedTopicIds)
    refreshData()
  }

  const handleActivateWeek = (planId: string, weekNumber: number) => {
    activateWeekTopic(planId, weekNumber)
    // Also update classrooms using this plan
    allClassrooms.forEach((c) => {
      if (c.activePlanId === planId) {
        updateClassroom(c.id, { currentWeek: weekNumber })
      }
    })
    refreshData()
  }

  // Topic handlers
  const handleCreateTopic = () => {
    console.log("[v0] handleCreateTopic called")
    setEditingTopic(null)
    setShowTopicForm(true)
  }

  const handleEditTopic = (topic: Topic) => {
    setEditingTopic(topic)
    setShowTopicForm(true)
  }

  const handleSaveTopic = (data: {
    name: string
    description: string
    icon: string
    color: string
    difficulty: "easy" | "medium" | "hard"
    questions: Topic["questions"]
  }) => {
    if (editingTopic) {
      updateTopic(editingTopic.id, data)
    } else {
      createTopic({
        ...data,
        teacherId: user.id,
      })
    }
    setShowTopicForm(false)
    setEditingTopic(null)
    refreshData()
  }

  const handleDeleteTopic = (topicId: string) => {
    if (confirm("Estas seguro de eliminar este topico?")) {
      deleteTopic(topicId)
      refreshData()
    }
  }

  // Avatar handler
  const handleAvatarChange = (avatarId: string) => {
    const updated = updateUserAvatar(user.id, avatarId)
    if (updated) {
      onUserUpdate(updated)
    }
  }

  const tabs = [
    { id: "classrooms" as const, label: "Aulas", icon: Users },
    { id: "plans" as const, label: "Planes", icon: BookOpen },
    { id: "topics" as const, label: "Topicos", icon: Lightbulb },
  ]

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl p-4 lg:p-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Panel del profesor</p>
            <h1 className="truncate text-2xl font-bold text-foreground">{user.name}</h1>
          </div>
        </div>

        {!viewingClassroom && !showTopicForm && (
          <div className="mb-4 rounded-3xl border border-border bg-card p-4 shadow-sm lg:p-5">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setViewingClassroom(null)
                    setShowTopicForm(false)
                  }}
                  className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 font-semibold transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6 flex justify-end gap-2">
          <button
            onClick={() => setShowAvatarSelector(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <Settings className="h-4 w-4" />
            Perfil
          </button>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-2 font-semibold text-destructive transition-colors hover:bg-destructive/15"
          >
            <LogOut className="h-4 w-4" />
            Salir
          </button>
        </div>

        {showTopicForm ? (
          <TopicForm
            topic={editingTopic}
            onSave={handleSaveTopic}
            onClose={() => {
              setShowTopicForm(false)
              setEditingTopic(null)
            }}
          />
        ) : viewingClassroom ? (
          <ClassroomDetail
            classroom={viewingClassroom}
            results={getClassroomResults(viewingClassroom.id)}
            onBack={() => setViewingClassroom(null)}
            onPreviousWeek={handlePreviousWeek}
            onAdvanceWeek={handleAdvanceWeek}
          />
        ) : (
          <>
            {activeTab === "classrooms" && (
              <ClassroomManager
                classrooms={classrooms}
                plans={allPlans.filter((p) => p.teacherId === user.id)}
                onCreateClassroom={handleCreateClassroom}
                onManagePlans={() => {
                  setViewingClassroom(null)
                  setActiveTab("plans")
                }}
                onManageTopics={() => {
                  setViewingClassroom(null)
                  setActiveTab("topics")
                }}
                onEditClassroom={handleEditClassroom}
                onDeleteClassroom={handleDeleteClassroom}
                onViewClassroom={setViewingClassroom}
                onAssignPlan={handleAssignPlan}
              />
            )}

            {activeTab === "plans" && (
              <PlanManager
                plans={plans}
                topics={topics}
                onBack={() => setActiveTab("classrooms")}
                onCreatePlan={handleCreatePlan}
                onCreateTopic={handleCreateTopic}
                onEditPlan={handleEditPlan}
                onDeletePlan={handleDeletePlan}
                onAddTopicToPlan={handleAddTopicToPlan}
                onRemoveTopicFromPlan={handleRemoveTopicFromPlan}
                onReorderTopics={handleReorderTopics}
                onActivateWeek={handleActivateWeek}
              />
            )}

            {activeTab === "topics" && (
              <TopicManager
                topics={topics}
                onBack={() => setActiveTab("classrooms")}
                onCreateTopic={handleCreateTopic}
                onEditTopic={handleEditTopic}
                onDeleteTopic={handleDeleteTopic}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {console.log("[v0] Modal states:", { showPlanForm, showTopicForm, showClassroomForm, showAvatarSelector })}
      <AnimatePresence>
        {showClassroomForm && (
          <ClassroomForm
            classroom={editingClassroom}
            onSave={handleSaveClassroom}
            onClose={() => {
              setShowClassroomForm(false)
              setEditingClassroom(null)
            }}
          />
        )}

        {showPlanForm && (
          <PlanForm
            plan={editingPlan}
            onSave={handleSavePlan}
            onClose={() => {
              setShowPlanForm(false)
              setEditingPlan(null)
            }}
          />
        )}
        {showAvatarSelector && (
          <AvatarSelector
            currentAvatarId={user.avatarId}
            onSelect={handleAvatarChange}
            onClose={() => setShowAvatarSelector(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
