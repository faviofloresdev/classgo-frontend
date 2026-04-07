"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, MoreVertical, Edit3, Trash2, Zap, BookOpen } from "lucide-react"
import type { Topic } from "@/lib/types"

interface TopicManagerProps {
  topics: Topic[]
  onCreateTopic: () => void
  onEditTopic: (topic: Topic) => void
  onDeleteTopic: (topicId: string) => void
}

const difficultyLabels = {
  easy: { label: "Facil", color: "bg-green-100 text-green-700" },
  medium: { label: "Medio", color: "bg-yellow-100 text-yellow-700" },
  hard: { label: "Dificil", color: "bg-red-100 text-red-700" },
}

export function TopicManager({
  topics,
  onCreateTopic,
  onEditTopic,
  onDeleteTopic,
}: TopicManagerProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Mis Topicos</h2>
          <p className="text-muted-foreground">Crea topicos para tus planes</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreateTopic}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
        >
          <Plus className="h-5 w-5" />
          Nuevo Topico
        </motion.button>
      </div>

      {/* Topics Grid */}
      {topics.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card py-16"
        >
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">No tienes topicos aun</h3>
          <p className="mb-6 text-center text-muted-foreground">
            Crea topicos para agregar a tus planes
          </p>
          <button
            onClick={onCreateTopic}
            className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground"
          >
            Crear Topico
          </button>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic, index) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Menu Button */}
              <div className="absolute right-3 top-3">
                <button
                  onClick={() => setOpenMenu(openMenu === topic.id ? null : topic.id)}
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>

                <AnimatePresence>
                  {openMenu === topic.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 top-10 z-10 w-36 rounded-xl border border-border bg-card py-2 shadow-lg"
                    >
                      <button
                        onClick={() => {
                          onEditTopic(topic)
                          setOpenMenu(null)
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-foreground hover:bg-muted"
                      >
                        <Edit3 className="h-4 w-4" />
                        Editar
                      </button>
                      <hr className="my-2 border-border" />
                      <button
                        onClick={() => {
                          onDeleteTopic(topic.id)
                          setOpenMenu(null)
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Topic Icon */}
              <div
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl"
                style={{ backgroundColor: topic.color + "20" }}
              >
                <Zap className="h-7 w-7" style={{ color: topic.color }} />
              </div>

              {/* Topic Info */}
              <h3 className="pr-8 text-lg font-bold text-foreground">{topic.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{topic.description}</p>

              {/* Difficulty Badge */}
              <div className="mt-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${difficultyLabels[topic.difficulty].color}`}
                >
                  {difficultyLabels[topic.difficulty].label}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
