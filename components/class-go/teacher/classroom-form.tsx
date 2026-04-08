"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, Sparkles } from "lucide-react"
import type { Classroom } from "@/lib/types"

interface ClassroomFormProps {
  classroom?: Classroom | null
  onSave: (data: { name: string; code: string; description: string }) => void | Promise<void>
  onClose: () => void
}

const generateCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function ClassroomForm({ classroom, onSave, onClose }: ClassroomFormProps) {
  const [name, setName] = useState(classroom?.name || "")
  const [code, setCode] = useState(classroom?.code || generateCode())
  const [description, setDescription] = useState(classroom?.description || "")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!name.trim()) newErrors.name = "Name is required"
    if (!code.trim()) newErrors.code = "Code is required"
    if (code.length < 4) newErrors.code = "Code must be at least 4 characters"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSaving(true)
    try {
      await onSave({ name: name.trim(), code: code.trim().toUpperCase(), description: description.trim() })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not save the classroom."
      setErrors((currentErrors) => ({
        ...currentErrors,
        code: message,
      }))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4"
      onClick={isSaving ? undefined : onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">
            {classroom ? "Edit Classroom" : "New Classroom"}
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
              Classroom Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setErrors((currentErrors) => ({ ...currentErrors, name: "" }))
              }}
              placeholder="Ex: Math 3A"
              disabled={isSaving}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
          </div>

          {/* Code */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Access Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase())
                  setErrors((currentErrors) => ({ ...currentErrors, code: "" }))
                }}
                placeholder="Ex: MAT3A"
                maxLength={10}
                disabled={isSaving}
                className="flex-1 rounded-xl border border-border bg-background px-4 py-3 font-mono text-foreground uppercase placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setCode(generateCode())}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-muted-foreground transition-colors hover:bg-muted"
              >
                <Sparkles className="h-4 w-4" />
              </button>
            </div>
            {errors.code && <p className="mt-1 text-sm text-destructive">{errors.code}</p>}
            <p className="mt-1 text-xs text-muted-foreground">
              Students will use this code to join
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your classroom..."
              rows={3}
              disabled={isSaving}
              className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 rounded-xl border border-border py-3 font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {isSaving ? "Saving..." : classroom ? "Save" : "Create Classroom"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
