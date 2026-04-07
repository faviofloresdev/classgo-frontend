"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X } from "lucide-react"
import type { Topic } from "@/lib/types"

interface TopicFormProps {
  topic?: Topic | null
  onSave: (data: {
    name: string
    description: string
    icon: string
    color: string
    difficulty: "easy" | "medium" | "hard"
  }) => void
  onClose: () => void
}

const colorOptions = [
  { value: "#10B981", label: "Verde" },
  { value: "#3B82F6", label: "Azul" },
  { value: "#8B5CF6", label: "Morado" },
  { value: "#F59E0B", label: "Naranja" },
  { value: "#EF4444", label: "Rojo" },
  { value: "#EC4899", label: "Rosa" },
  { value: "#06B6D4", label: "Cyan" },
  { value: "#84CC16", label: "Lima" },
]

const difficultyOptions = [
  { value: "easy", label: "Facil", description: "Para principiantes" },
  { value: "medium", label: "Medio", description: "Requiere practica" },
  { value: "hard", label: "Dificil", description: "Avanzado" },
]

export function TopicForm({ topic, onSave, onClose }: TopicFormProps) {
  const [name, setName] = useState(topic?.name || "")
  const [description, setDescription] = useState(topic?.description || "")
  const [color, setColor] = useState(topic?.color || "#10B981")
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    topic?.difficulty || "easy"
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!name.trim()) newErrors.name = "El nombre es requerido"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSave({
      name,
      description,
      icon: "Zap", // Default icon
      color,
      difficulty,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">
            {topic ? "Editar Topico" : "Nuevo Topico"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Nombre del Topico
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Sumas Basicas"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Descripcion
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el topico..."
              rows={3}
              className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Color */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Color</label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setColor(option.value)}
                  className={`h-10 w-10 rounded-xl border-2 transition-all ${
                    color === option.value
                      ? "border-foreground ring-2 ring-foreground ring-offset-2"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: option.value }}
                  title={option.label}
                />
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Dificultad</label>
            <div className="grid grid-cols-3 gap-2">
              {difficultyOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDifficulty(option.value as "easy" | "medium" | "hard")}
                  className={`rounded-xl border-2 p-3 text-center transition-all ${
                    difficulty === option.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs">{option.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border py-3 font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {topic ? "Guardar" : "Crear Topico"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
