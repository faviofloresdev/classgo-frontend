"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Users,
  BookOpen,
  MoreVertical,
  Edit3,
  Trash2,
  Eye,
  Calendar,
  X,
  Copy,
  Check,
} from "lucide-react"
import type { ClassroomWithDetails, Plan } from "@/lib/types"

interface ClassroomManagerProps {
  classrooms: ClassroomWithDetails[]
  plans: Plan[]
  onCreateClassroom: () => void
  onCreatePlan: () => void
  onManagePlans: () => void
  onManageTopics: () => void
  onEditClassroom: (classroom: ClassroomWithDetails) => void
  onDeleteClassroom: (classroomId: string) => void
  onViewClassroom: (classroom: ClassroomWithDetails) => void
  onAssignPlan: (classroomId: string, planId: string | null) => void
}

export function ClassroomManager({
  classrooms,
  plans,
  onCreateClassroom,
  onCreatePlan,
  onManagePlans,
  onManageTopics,
  onEditClassroom,
  onDeleteClassroom,
  onViewClassroom,
  onAssignPlan,
}: ClassroomManagerProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [showAssignPlan, setShowAssignPlan] = useState<string | null>(null)

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">My Classrooms</h2>
          <p className="text-muted-foreground">Manage your classrooms and students</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onManagePlans}
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 font-semibold text-foreground shadow-sm transition-colors hover:bg-muted"
          >
            <BookOpen className="h-5 w-5" />
            Manage Plans
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onManageTopics}
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 font-semibold text-foreground shadow-sm transition-colors hover:bg-muted"
          >
            <BookOpen className="h-5 w-5" />
            Manage Topics
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCreateClassroom}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
          >
            <Plus className="h-5 w-5" />
            New Classroom
          </motion.button>
        </div>
      </div>

      {/* Classrooms Grid */}
      {classrooms.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card py-16"
        >
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">You don't have any classrooms yet</h3>
          <p className="mb-6 text-center text-muted-foreground">
            Create your first classroom to get started
          </p>
          <button
            onClick={onCreateClassroom}
            className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground"
          >
            Create Classroom
          </button>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classrooms.map((classroom, index) => (
            <motion.div
              key={classroom.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative overflow-visible rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Menu Button */}
              <div className="absolute right-3 top-3">
                <button
                  onClick={() => setOpenMenu(openMenu === classroom.id ? null : classroom.id)}
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>

                <AnimatePresence>
                  {openMenu === classroom.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 top-10 z-20 w-48 rounded-xl border border-border bg-card py-2 shadow-lg"
                    >
                      <button
                        onClick={() => {
                          onViewClassroom(classroom)
                          setOpenMenu(null)
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-foreground hover:bg-muted"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                      <button
                        onClick={() => {
                          onEditClassroom(classroom)
                          setOpenMenu(null)
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-foreground hover:bg-muted"
                      >
                        <Edit3 className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setShowAssignPlan(classroom.id)
                          setOpenMenu(null)
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-foreground hover:bg-muted"
                      >
                        <BookOpen className="h-4 w-4" />
                        Assign Plan
                      </button>
                      <hr className="my-2 border-border" />
                      <button
                        onClick={() => {
                          onDeleteClassroom(classroom.id)
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

              {/* Classroom Info */}
              <div className="mb-4">
                <h3 className="pr-8 text-lg font-bold text-foreground">{classroom.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {classroom.description}
                </p>
              </div>

              {/* Code Badge */}
              <button
                onClick={() => handleCopyCode(classroom.code)}
                className="mb-4 flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
              >
                {copiedCode === classroom.code ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Code: {classroom.code}
                  </>
                )}
              </button>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  <span>{classroom.students?.length || 0} students</span>
                </div>
                {classroom.plan && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>Week {classroom.currentWeek}</span>
                  </div>
                )}
              </div>

              {/* Plan Badge */}
              {classroom.plan ? (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-accent/50 px-3 py-2">
                  <BookOpen className="h-4 w-4 text-accent-foreground" />
                  <span className="text-sm font-medium text-accent-foreground">
                    {classroom.plan.name}
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => setShowAssignPlan(classroom.id)}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Plus className="h-4 w-4" />
                  Assign Plan
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Assign Plan Modal */}
      <AnimatePresence>
        {showAssignPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4"
            onClick={() => setShowAssignPlan(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">Assign Plan</h3>
                <button
                  onClick={() => setShowAssignPlan(null)}
                  className="rounded-full p-2 text-muted-foreground hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-2">
                {plans.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5 text-center">
                    <p className="text-sm text-muted-foreground">
                      You don't have any plans yet. Create one first to assign it to this classroom.
                    </p>
                    <button
                      onClick={() => {
                        setShowAssignPlan(null)
                        onCreatePlan()
                      }}
                      className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4" />
                      Create Plan
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        onAssignPlan(showAssignPlan, null)
                        setShowAssignPlan(null)
                      }}
                      className="w-full rounded-xl border border-border p-4 text-left transition-colors hover:bg-muted"
                    >
                      <span className="text-muted-foreground">No plan assigned</span>
                    </button>
                    {plans.map((plan) => (
                      <button
                        key={plan.id}
                        onClick={() => {
                          onAssignPlan(showAssignPlan, plan.id)
                          setShowAssignPlan(null)
                        }}
                        className="w-full rounded-xl border border-border p-4 text-left transition-colors hover:bg-muted"
                      >
                        <div className="font-semibold text-foreground">{plan.name}</div>
                        <div className="text-sm text-muted-foreground">{plan.description}</div>
                      </button>
                    ))}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
