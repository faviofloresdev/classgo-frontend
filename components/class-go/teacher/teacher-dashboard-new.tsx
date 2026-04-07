"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Lightbulb,
  LogOut,
  Menu,
  X,
  Settings,
} from "lucide-react"
import type { User, ClassroomWithDetails, PlanWithTopics, Topic, Classroom, Plan } from "@/lib/types"
import { getAvatarUrl } from "@/lib/avatars"
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
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
    if (viewingClassroom.activePlanId) {
      activateWeekTopic(viewingClassroom.activePlanId, newWeek)
    }
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
    <div className="flex min-h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-foreground/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : "-100%" }}
        className="fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-border bg-card lg:relative lg:translate-x-0"
      >
        {/* Logo/Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-xl font-bold text-primary-foreground">
              CG
            </div>
            <span className="text-lg font-bold text-foreground">ClassGo</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-muted-foreground lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Profile */}
        <div className="border-b border-border p-4">
          <button
            onClick={() => setShowAvatarSelector(true)}
            className="flex w-full items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted"
          >
            <img
              src={getAvatarUrl(user.avatarId)}
              alt={user.name}
              className="h-12 w-12 rounded-full bg-muted"
              crossOrigin="anonymous"
            />
            <div className="flex-1 text-left">
              <p className="font-semibold text-foreground">{user.name}</p>
              <p className="text-sm text-muted-foreground">Profesor</p>
            </div>
            <Settings className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setViewingClassroom(null)
                  setSidebarOpen(false)
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Logout */}
        <div className="border-t border-border p-4">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-5 w-5" />
            Cerrar Sesion
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card p-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-muted-foreground"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="text-lg font-bold text-foreground">ClassGo</span>
          <img
            src={getAvatarUrl(user.avatarId)}
            alt={user.name}
            className="h-10 w-10 rounded-full bg-muted"
            crossOrigin="anonymous"
          />
        </header>

        {/* Content */}
        <div className="p-4 lg:p-8">
          {viewingClassroom ? (
            <ClassroomDetail
              classroom={viewingClassroom}
              results={getClassroomResults(viewingClassroom.id)}
              onBack={() => setViewingClassroom(null)}
              onAdvanceWeek={handleAdvanceWeek}
            />
          ) : (
            <>
              {activeTab === "classrooms" && (
                <ClassroomManager
                  classrooms={classrooms}
                  plans={allPlans.filter((p) => p.teacherId === user.id)}
                  onCreateClassroom={handleCreateClassroom}
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
                  onCreatePlan={handleCreatePlan}
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
                  onCreateTopic={handleCreateTopic}
                  onEditTopic={handleEditTopic}
                  onDeleteTopic={handleDeleteTopic}
                />
              )}
            </>
          )}
        </div>
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

        {showTopicForm && (
          <TopicForm
            topic={editingTopic}
            onSave={handleSaveTopic}
            onClose={() => {
              setShowTopicForm(false)
              setEditingTopic(null)
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
