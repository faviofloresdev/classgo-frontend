"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { AnimatePresence } from "framer-motion"
import { BookOpen, Lightbulb, LogOut, Settings, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/hooks/use-toast"
import { getAvatarUrl } from "@/lib/avatars"
import type { ClassroomWithDetails, Plan, PlanWithTopics, StudentResultWithDetails, Topic, User } from "@/lib/types"
import {
  activatePlanWeek,
  addTopicToPlan,
  assignPlan,
  createClassroom,
  createPlan,
  createTopic,
  deleteClassroom,
  deletePlan,
  deleteTopic,
  getTeacherClassroomDetail,
  getTeacherClassrooms,
  getTeacherPlans,
  getTeacherTopics,
  reorderPlanTopics,
  removeTopicFromPlan,
  updateClassroom,
  updatePlan,
  updateProfile,
  updateTopic,
} from "@/lib/api"
import { AvatarSelector } from "../avatar-selector"
import { ClassroomDetail } from "./classroom-detail"
import { ClassroomForm } from "./classroom-form"
import { ClassroomManager } from "./classroom-manager"
import { PlanForm } from "./plan-form"
import { PlanManager } from "./plan-manager"
import { TopicForm } from "./topic-form"
import { TopicManager } from "./topic-manager"

type TabId = "classrooms" | "plans" | "topics"

interface TeacherDashboardNewProps {
  user: User
  onLogout: () => void
  onUserUpdate: (user: User) => void
}

export function TeacherDashboardNew({ user, onLogout, onUserUpdate }: TeacherDashboardNewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("classrooms")
  const [showAvatarSelector, setShowAvatarSelector] = useState(false)
  const [classrooms, setClassrooms] = useState<ClassroomWithDetails[]>([])
  const [plans, setPlans] = useState<PlanWithTopics[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [classroomResults, setClassroomResults] = useState<StudentResultWithDetails[]>([])
  const [showClassroomForm, setShowClassroomForm] = useState(false)
  const [editingClassroom, setEditingClassroom] = useState<ClassroomWithDetails | null>(null)
  const [viewingClassroom, setViewingClassroom] = useState<ClassroomWithDetails | null>(null)
  const [showPlanForm, setShowPlanForm] = useState(false)
  const [editingPlan, setEditingPlan] = useState<PlanWithTopics | null>(null)
  const [showTopicForm, setShowTopicForm] = useState(false)
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const viewingClassroomId = viewingClassroom?.id ?? null

  const loadDashboardData = useCallback(async () => {
    const [nextClassrooms, nextPlans, nextTopics] = await Promise.all([
      getTeacherClassrooms(),
      getTeacherPlans(),
      getTeacherTopics(),
    ])

    setClassrooms(nextClassrooms)
    setPlans(nextPlans)
    setTopics(nextTopics)
  }, [])

  const refreshData = useCallback(async () => {
    setIsLoading(true)
    try {
      await loadDashboardData()

      if (viewingClassroomId) {
        const detail = await getTeacherClassroomDetail(viewingClassroomId)
        setViewingClassroom(detail.classroom)
        setClassroomResults(detail.results)
      }
    } finally {
      setIsLoading(false)
    }
  }, [loadDashboardData, viewingClassroomId])

  useEffect(() => {
    void refreshData()
  }, [refreshData])

  const openClassroomDetail = async (classroom: ClassroomWithDetails) => {
    setIsLoading(true)
    try {
      const detail = await getTeacherClassroomDetail(classroom.id)
      setViewingClassroom(detail.classroom)
      setClassroomResults(detail.results)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveClassroom = async (data: { name: string; code: string; description: string }) => {
    if (editingClassroom) {
      await updateClassroom(editingClassroom.id, data)
    } else {
      await createClassroom(data)
    }

    setShowClassroomForm(false)
    setEditingClassroom(null)
    await refreshData()
  }

  const handleDeleteClassroom = async (classroomId: string) => {
    if (!confirm("Are you sure you want to delete this classroom?")) return
    await deleteClassroom(classroomId)
    await refreshData()
  }

  const handleAssignPlan = async (classroomId: string, planId: string | null) => {
    await assignPlan(classroomId, planId)

    if (planId) {
      await activatePlanWeek(planId, 1).catch(() => undefined)
      await updateClassroom(classroomId, { currentWeek: 1 })
    }

    await refreshData()
  }

  const handleAdvanceWeek = async () => {
    if (!viewingClassroom) return
    await updateClassroom(viewingClassroom.id, {
      currentWeek: viewingClassroom.currentWeek + 1,
    })
    await refreshData()
  }

  const handlePreviousWeek = async () => {
    if (!viewingClassroom || viewingClassroom.currentWeek <= 1) return
    await updateClassroom(viewingClassroom.id, {
      currentWeek: viewingClassroom.currentWeek - 1,
    })
    await refreshData()
  }

  const handleSavePlan = async (data: {
    name: string
    description: string
    activationMode: "manual" | "auto"
    startDate: Date | null
  }) => {
    try {
      if (editingPlan) {
        await updatePlan(editingPlan.id, data)
      } else {
        await createPlan(data)
      }

      setShowPlanForm(false)
      setEditingPlan(null)
      await refreshData()
      toast({
        title: editingPlan ? "Plan updated" : "Plan created",
        description: editingPlan
          ? "The plan was saved successfully."
          : "The plan was created successfully.",
      })
    } catch (error) {
      toast({
        title: editingPlan ? "Plan couldn't be updated" : "Plan couldn't be created",
        description: error instanceof Error ? error.message : "Could not complete the request.",
        variant: "destructive",
      })
    }
  }

  const handleDeletePlan = async (planId: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return
    try {
      await deletePlan(planId)
      await refreshData()
      toast({
        title: "Plan deleted",
        description: "The plan was deleted successfully.",
      })
    } catch (error) {
      toast({
        title: "Plan couldn't be deleted",
        description: error instanceof Error ? error.message : "Could not complete the request.",
        variant: "destructive",
      })
    }
  }

  const handleAddTopicToPlan = async (planId: string, topicId: string) => {
    const plan = plans.find((item) => item.id === planId)
    const weekNumber = (plan?.topics.length || 0) + 1
    await addTopicToPlan(planId, topicId, weekNumber)
    await refreshData()
  }

  const handleRemoveTopicFromPlan = async (planId: string, topicId: string) => {
    await removeTopicFromPlan(planId, topicId)
    await refreshData()
  }

  const handleReorderTopics = async (planId: string, orderedTopicIds: string[]) => {
    await reorderPlanTopics(planId, orderedTopicIds)
    await refreshData()
  }

  const handleActivateWeek = async (planId: string, weekNumber: number) => {
    await activatePlanWeek(planId, weekNumber)

    await Promise.all(
      classrooms
        .filter((classroom) => classroom.activePlanId === planId)
        .map((classroom) => updateClassroom(classroom.id, { currentWeek: weekNumber }))
    )

    await refreshData()
  }

  const handleSaveTopic = async (data: {
    name: string
    description: string
    icon: string
    color: string
    difficulty: "easy" | "medium" | "hard"
    questions: Topic["questions"]
  }) => {
    try {
      if (editingTopic) {
        await updateTopic(editingTopic.id, data)
      } else {
        await createTopic(data)
      }

      setShowTopicForm(false)
      setEditingTopic(null)
      await refreshData()
      toast({
        title: editingTopic ? "Topic updated" : "Topic created",
        description: editingTopic
          ? "The topic was saved successfully."
          : "The topic was created successfully.",
      })
    } catch (error) {
      toast({
        title: editingTopic ? "Topic couldn't be updated" : "Topic couldn't be created",
        description: error instanceof Error ? error.message : "Could not complete the request.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm("Are you sure you want to delete this topic?")) return
    try {
      await deleteTopic(topicId)
      await refreshData()
      toast({
        title: "Topic deleted",
        description: "The topic was deleted successfully.",
      })
    } catch (error) {
      toast({
        title: "Topic couldn't be deleted",
        description: error instanceof Error ? error.message : "Could not complete the request.",
        variant: "destructive",
      })
    }
  }

  const handleAvatarChange = async (avatarId: string) => {
    const updated = await updateProfile({ avatarId })
    onUserUpdate(updated)
  }

  const tabs = useMemo(
    () => [
      { id: "classrooms" as const, label: "Classrooms", icon: Users },
      { id: "plans" as const, label: "Plans", icon: BookOpen },
      { id: "topics" as const, label: "Topics", icon: Lightbulb },
    ],
    []
  )

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl p-4 lg:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground">Teacher Dashboard</p>
            <div className="mt-3 flex items-start gap-3">
              <button
                onClick={() => setShowAvatarSelector(true)}
                className="shrink-0 rounded-full transition-transform hover:scale-105"
                aria-label="Change avatar"
              >
                <Avatar className="size-14 border-2 border-white bg-card shadow-md">
                  <AvatarImage src={getAvatarUrl(user.avatarId)} alt={user.name} crossOrigin="anonymous" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>

              <div className="min-w-0">
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                  <h1 className="break-words text-2xl font-bold text-foreground sm:truncate">{user.name}</h1>
                  <button
                    onClick={onLogout}
                    className="inline-flex w-fit items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-1.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/15"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">Your teacher profile</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowAvatarSelector(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2 font-semibold text-foreground transition-colors hover:bg-muted sm:w-auto"
          >
            <Settings className="h-4 w-4" />
            Profile
          </button>
        </div>

        {!viewingClassroom && !showTopicForm && (
          <div className="mb-4 rounded-3xl border border-border bg-card p-4 shadow-sm lg:p-5">
            <div className="grid grid-cols-3 gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setViewingClassroom(null)
                    setShowTopicForm(false)
                  }}
                  className={`inline-flex min-w-0 items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-semibold transition-colors sm:px-4 sm:text-base ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <tab.icon className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                  <span className="truncate">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {showTopicForm ? (
          <TopicForm
            topic={editingTopic}
            onSave={(data) => {
              void handleSaveTopic(data)
            }}
            onClose={() => {
              setShowTopicForm(false)
              setEditingTopic(null)
            }}
          />
        ) : viewingClassroom ? (
          <ClassroomDetail
            classroom={viewingClassroom}
            results={classroomResults}
            onBack={() => setViewingClassroom(null)}
            onPreviousWeek={() => {
              void handlePreviousWeek()
            }}
            onAdvanceWeek={() => {
              void handleAdvanceWeek()
            }}
          />
        ) : (
          <>
            {activeTab === "classrooms" && (
              <ClassroomManager
                classrooms={classrooms}
                plans={plans as Plan[]}
                onCreateClassroom={() => {
                  setEditingClassroom(null)
                  setShowClassroomForm(true)
                }}
                onCreatePlan={() => {
                  setEditingPlan(null)
                  setShowPlanForm(true)
                }}
                onManagePlans={() => {
                  setViewingClassroom(null)
                  setActiveTab("plans")
                }}
                onManageTopics={() => {
                  setViewingClassroom(null)
                  setActiveTab("topics")
                }}
                onEditClassroom={(classroom) => {
                  setEditingClassroom(classroom)
                  setShowClassroomForm(true)
                }}
                onDeleteClassroom={(classroomId) => {
                  void handleDeleteClassroom(classroomId)
                }}
                onViewClassroom={(classroom) => {
                  void openClassroomDetail(classroom)
                }}
                onAssignPlan={(classroomId, planId) => {
                  void handleAssignPlan(classroomId, planId)
                }}
              />
            )}

            {activeTab === "plans" && (
              <PlanManager
                plans={plans}
                topics={topics}
                onBack={() => setActiveTab("classrooms")}
                onCreatePlan={() => {
                  setEditingPlan(null)
                  setShowPlanForm(true)
                }}
                onCreateTopic={() => {
                  setEditingTopic(null)
                  setShowTopicForm(true)
                }}
                onEditPlan={(plan) => {
                  setEditingPlan(plan)
                  setShowPlanForm(true)
                }}
                onDeletePlan={(planId) => {
                  void handleDeletePlan(planId)
                }}
                onAddTopicToPlan={(planId, topicId) => {
                  void handleAddTopicToPlan(planId, topicId)
                }}
                onRemoveTopicFromPlan={(planId, topicId) => {
                  void handleRemoveTopicFromPlan(planId, topicId)
                }}
                onReorderTopics={(planId, orderedTopicIds) => {
                  void handleReorderTopics(planId, orderedTopicIds)
                }}
                onActivateWeek={(planId, weekNumber) => {
                  void handleActivateWeek(planId, weekNumber)
                }}
              />
            )}

            {activeTab === "topics" && (
              <TopicManager
                topics={topics}
                onBack={() => setActiveTab("classrooms")}
                onCreateTopic={() => {
                  setEditingTopic(null)
                  setShowTopicForm(true)
                }}
                onEditTopic={(topic) => {
                  setEditingTopic(topic)
                  setShowTopicForm(true)
                }}
                onDeleteTopic={(topicId) => {
                  void handleDeleteTopic(topicId)
                }}
              />
            )}
          </>
        )}
      </main>

      <AnimatePresence>
        {showClassroomForm && (
          <ClassroomForm
            classroom={editingClassroom}
            onSave={(data) => {
              return handleSaveClassroom(data)
            }}
            onClose={() => {
              setShowClassroomForm(false)
              setEditingClassroom(null)
            }}
          />
        )}

        {showPlanForm && (
          <PlanForm
            plan={editingPlan}
            onSave={(data) => {
              void handleSavePlan(data)
            }}
            onClose={() => {
              setShowPlanForm(false)
              setEditingPlan(null)
            }}
          />
        )}

        {showAvatarSelector && (
          <AvatarSelector
            currentAvatarId={user.avatarId}
            onSelect={(avatarId) => {
              void handleAvatarChange(avatarId)
            }}
            onClose={() => setShowAvatarSelector(false)}
          />
        )}
      </AnimatePresence>

      {isLoading && <div className="fixed inset-x-0 top-0 h-1 animate-pulse bg-primary" />}
    </div>
  )
}
