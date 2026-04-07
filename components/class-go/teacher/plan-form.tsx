"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, Calendar, Zap } from "lucide-react"
import type { Plan } from "@/lib/types"

interface PlanFormProps {
  plan?: Plan | null
  onSave: (data: {
    name: string
    description: string
    activationMode: "manual" | "auto"
    startDate: Date | null
  }) => void
  onClose: () => void
}

export function PlanForm({ plan, onSave, onClose }: PlanFormProps) {
  const [name, setName] = useState(plan?.name || "")
  const [description, setDescription] = useState(plan?.description || "")
  const [activationMode, setActivationMode] = useState<"manual" | "auto">(
    plan?.activationMode || "manual"
  )
  const [startDate, setStartDate] = useState<string>(
    plan?.startDate ? new Date(plan.startDate).toISOString().split("T")[0] : ""
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!name.trim()) newErrors.name = "El nombre es requerido"
    if (activationMode === "auto" && !startDate) {
      newErrors.startDate = "La fecha de inicio es requerida para modo automatico"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSave({
      name,
      description,
      activationMode,
      startDate: startDate ? new Date(startDate) : null,
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
        className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">
            {plan ? "Editar Plan" : "Nuevo Plan"}
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
              Nombre del Plan
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Matematicas Nivel 1"
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
              placeholder="Describe tu plan..."
              rows={3}
              className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Activation Mode */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Modo de Activacion
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setActivationMode("manual")}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all ${
                  activationMode === "manual"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                <Zap className="h-5 w-5" />
                <span className="font-medium">Manual</span>
              </button>
              <button
                type="button"
                onClick={() => setActivationMode("auto")}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all ${
                  activationMode === "auto"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                <Calendar className="h-5 w-5" />
                <span className="font-medium">Automatico</span>
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {activationMode === "manual"
                ? "Activa los topicos manualmente cuando estes listo"
                : "Los topicos se activaran automaticamente cada semana"}
            </p>
          </div>

          {/* Start Date (for auto mode) */}
          {activationMode === "auto" && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Fecha de Inicio
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-destructive">{errors.startDate}</p>
              )}
            </div>
          )}

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
              {plan ? "Guardar" : "Crear Plan"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
