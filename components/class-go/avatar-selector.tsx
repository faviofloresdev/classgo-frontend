"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Check } from "lucide-react"
import { avatars, avatarCategories, type Avatar } from "@/lib/avatars"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AvatarSelectorProps {
  currentAvatarId: string
  currentName?: string
  showNameField?: boolean
  onSelect: (avatarId: string, name?: string) => void
  onClose: () => void
}

export function AvatarSelector({
  currentAvatarId,
  currentName = "",
  showNameField = false,
  onSelect,
  onClose,
}: AvatarSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<Avatar["category"]>("animals")
  const [selectedId, setSelectedId] = useState(currentAvatarId)
  const [name, setName] = useState(currentName)

  const filteredAvatars = avatars.filter((a) => a.category === selectedCategory)

  const handleConfirm = () => {
    onSelect(selectedId, name.trim())
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Selecciona tu Avatar</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {showNameField && (
            <div className="mb-4 space-y-2">
              <Label htmlFor="student-profile-name">Tu nombre</Label>
              <Input
                id="student-profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Escribe tu nombre"
                className="h-12"
              />
            </div>
          )}

          {/* Category Tabs */}
          <div className="mb-4 flex flex-wrap gap-2">
            {avatarCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as Avatar["category"])}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Avatar Grid */}
          <div className="mb-6 grid grid-cols-4 gap-3 sm:grid-cols-5">
            {filteredAvatars.map((avatar) => (
              <motion.button
                key={avatar.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedId(avatar.id)}
                className={`relative aspect-square overflow-hidden rounded-xl border-3 transition-all ${
                  selectedId === avatar.id
                    ? "border-primary ring-2 ring-primary ring-offset-2"
                    : "border-transparent hover:border-primary/30"
                }`}
              >
                <img
                  src={avatar.url}
                  alt={avatar.name}
                  className="h-full w-full object-cover"
                  crossOrigin="anonymous"
                />
                {selectedId === avatar.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary"
                  >
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-border py-3 font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={showNameField && !name.trim()}
              className="flex-1 rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Confirmar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
