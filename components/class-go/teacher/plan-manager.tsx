"use client"

import { useState } from "react"
import { motion, AnimatePresence, Reorder } from "framer-motion"
import {
  ArrowLeft,
  Plus,
  MoreVertical,
  Edit3,
  Trash2,
  Eye,
  GripVertical,
  Calendar,
  Zap,
  Play,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import type { PlanWithTopics, Topic } from "@/lib/types"

interface PlanManagerProps {
  plans: PlanWithTopics[]
  topics: Topic[]
  onBack: () => void
  onCreatePlan: () => void
  onCreateTopic: () => void
  onEditPlan: (plan: PlanWithTopics) => void
  onDeletePlan: (planId: string) => void
  onAddTopicToPlan: (planId: string, topicId: string) => void
  onRemoveTopicFromPlan: (planId: string, topicId: string) => void
  onReorderTopics: (planId: string, orderedTopicIds: string[]) => void
  onActivateWeek: (planId: string, weekNumber: number) => void
}

export function PlanManager({
  plans,
  topics,
  onBack,
  onCreatePlan,
  onCreateTopic,
  onEditPlan,
  onDeletePlan,
  onAddTopicToPlan,
  onRemoveTopicFromPlan,
  onReorderTopics,
  onActivateWeek,
}: PlanManagerProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [expandedPlan, setExpandedPlan] = useState<string | null>(plans[0]?.id || null)
  const [showAddTopic, setShowAddTopic] = useState<string | null>(null)

  const getAvailableTopics = (planId: string) => {
    const plan = plans.find((p) => p.id === planId)
    if (!plan) return topics
    const usedTopicIds = plan.topics.map((t) => t.topicId)
    return topics.filter((t) => !usedTopicIds.includes(t.id))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <button
            onClick={onBack}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">My Plans</h2>
            <p className="text-muted-foreground">Organize topics by week</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCreateTopic}
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 font-semibold text-foreground shadow-sm transition-colors hover:bg-muted"
          >
            <Zap className="h-5 w-5" />
            Create Topic
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              console.log("[v0] Nuevo Plan button clicked")
              onCreatePlan()
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
          >
            <Plus className="h-5 w-5" />
            New Plan
          </motion.button>
        </div>
      </div>

      {/* Plans List */}
      {plans.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card py-16"
        >
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">You don't have any plans yet</h3>
          <p className="mb-6 text-center text-muted-foreground">
            Create a plan to organize weekly topics
          </p>
          <button
            onClick={onCreatePlan}
            className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground"
          >
            Create Plan
          </button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
            >
              {/* Plan Header */}
              <div
                className="flex cursor-pointer items-center justify-between p-5"
                onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        plan.activationMode === "auto"
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {plan.activationMode === "auto" ? "Automatic" : "Manual"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                  <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{plan.topics.length} topics</span>
                    {plan.startDate && (
                      <span>Start: {new Date(plan.startDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpenMenu(openMenu === plan.id ? null : plan.id)
                      }}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>

                    <AnimatePresence>
                      {openMenu === plan.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 top-10 z-10 w-40 rounded-xl border border-border bg-card py-2 shadow-lg"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onEditPlan(plan)
                              setOpenMenu(null)
                            }}
                            className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-foreground hover:bg-muted"
                          >
                            <Edit3 className="h-4 w-4" />
                            Edit
                          </button>
                          <hr className="my-2 border-border" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeletePlan(plan.id)
                              setOpenMenu(null)
                            }}
                            className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button className="rounded-lg p-2 text-muted-foreground">
                    {expandedPlan === plan.id ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Topics List */}
              <AnimatePresence>
                {expandedPlan === plan.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-border"
                  >
                    <div className="p-5">
                      {plan.topics.length === 0 ? (
                        <p className="py-4 text-center text-muted-foreground">
                          There are no topics in this plan
                        </p>
                      ) : (
                        <Reorder.Group
                          axis="y"
                          values={plan.topics.map((t) => t.topicId)}
                          onReorder={(newOrder) => onReorderTopics(plan.id, newOrder)}
                          className="space-y-2"
                        >
                          {plan.topics.map((pt) => (
                            <Reorder.Item
                              key={pt.topicId}
                              value={pt.topicId}
                              className="flex items-center gap-3 rounded-xl border border-border bg-background p-4"
                            >
                              <GripVertical className="h-5 w-5 cursor-grab text-muted-foreground active:cursor-grabbing" />
                              <div
                                className="h-10 w-10 rounded-lg"
                                style={{ backgroundColor: pt.topic.color + "20" }}
                              >
                                <div
                                  className="flex h-full w-full items-center justify-center rounded-lg text-lg font-bold"
                                  style={{ color: pt.topic.color }}
                                >
                                  {pt.weekNumber}
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-foreground">{pt.topic.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  Week {pt.weekNumber}
                                </div>
                              </div>
                              {pt.isActive && (
                                <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                                  Active
                                </span>
                              )}
                              <button
                                onClick={() => onActivateWeek(plan.id, pt.weekNumber)}
                                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                                title="Activate week"
                              >
                                <Play className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => onRemoveTopicFromPlan(plan.id, pt.topicId)}
                                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </Reorder.Item>
                          ))}
                        </Reorder.Group>
                      )}

                      {/* Add Topic Button */}
                      <button
                        onClick={() => setShowAddTopic(plan.id)}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        <Plus className="h-5 w-5" />
                        Add Topic
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Topic Modal */}
      <AnimatePresence>
        {showAddTopic && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4"
            onClick={() => setShowAddTopic(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl bg-card p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">Add Topic</h3>
                <button
                  onClick={() => setShowAddTopic(null)}
                  className="rounded-full p-2 text-muted-foreground hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-2">
                {getAvailableTopics(showAddTopic).length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5 text-center">
                    <p className="text-sm text-muted-foreground">
                      There are no available topics. Create new topics and then add them to the plan.
                    </p>
                    <button
                      onClick={() => {
                        setShowAddTopic(null)
                        onCreateTopic()
                      }}
                      className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4" />
                      Create Topic
                    </button>
                  </div>
                ) : (
                  getAvailableTopics(showAddTopic).map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => {
                        onAddTopicToPlan(showAddTopic, topic.id)
                        setShowAddTopic(null)
                      }}
                      className="flex w-full items-center gap-3 rounded-xl border border-border p-4 text-left transition-colors hover:bg-muted"
                    >
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{ backgroundColor: topic.color + "20" }}
                      >
                        <Zap className="h-5 w-5" style={{ color: topic.color }} />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{topic.name}</div>
                        <div className="text-sm text-muted-foreground">{topic.description}</div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
