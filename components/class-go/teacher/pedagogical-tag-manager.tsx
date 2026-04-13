"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { ApiError, createPedagogicalTag, deletePedagogicalTag, getPedagogicalTags, updatePedagogicalTag } from "@/lib/api"
import type { PedagogicalTag } from "@/lib/types"
import { toast } from "@/hooks/use-toast"

interface PedagogicalTagManagerProps {
  onBack: () => void
}

export function PedagogicalTagManager({ onBack }: PedagogicalTagManagerProps) {
  const [tags, setTags] = useState<PedagogicalTag[]>([])
  const [search, setSearch] = useState("")
  const [newTagName, setNewTagName] = useState("")
  const [editingTagId, setEditingTagId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const loadTags = async (query?: string) => {
    setIsLoading(true)
    try {
      const nextTags = await getPedagogicalTags(query)
      setTags(nextTags)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTags(search)
    }, 250)

    return () => {
      window.clearTimeout(timer)
    }
  }, [search])

  const sortedTags = useMemo(
    () => [...tags].sort((a, b) => a.name.localeCompare(b.name)),
    [tags]
  )

  const handleCreate = async () => {
    const trimmedName = newTagName.trim()
    if (!trimmedName || isSaving) return

    setIsSaving(true)
    try {
      const created = await createPedagogicalTag(trimmedName)
      setTags((current) => [...current, created])
      setNewTagName("")
      toast({
        title: "Tag created",
        description: "The pedagogical tag was created successfully.",
      })
    } catch (error) {
      const message =
        error instanceof ApiError && error.code === "PEDAGOGICAL_TAG_ALREADY_EXISTS"
          ? "This pedagogical tag already exists."
          : error instanceof ApiError && error.code === "PEDAGOGICAL_TAG_INVALID"
            ? "This tag name is invalid."
            : error instanceof Error
              ? error.message
              : "Could not create the pedagogical tag."

      toast({
        title: "Tag couldn't be created",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleRename = async (tagId: string) => {
    const trimmedName = editingName.trim()
    if (!trimmedName || isSaving) return

    setIsSaving(true)
    try {
      const updated = await updatePedagogicalTag(tagId, trimmedName)
      setTags((current) => current.map((tag) => (tag.id === tagId ? updated : tag)))
      setEditingTagId(null)
      setEditingName("")
      toast({
        title: "Tag updated",
        description: "The pedagogical tag was updated successfully.",
      })
    } catch (error) {
      const message =
        error instanceof ApiError && error.code === "PEDAGOGICAL_TAG_ALREADY_EXISTS"
          ? "This pedagogical tag already exists."
          : error instanceof ApiError && error.code === "PEDAGOGICAL_TAG_INVALID"
            ? "This tag name is invalid."
            : error instanceof Error
              ? error.message
              : "Could not update the pedagogical tag."

      toast({
        title: "Tag couldn't be updated",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (tagId: string) => {
    if (!confirm("Are you sure you want to delete this pedagogical tag?")) return

    setIsSaving(true)
    try {
      await deletePedagogicalTag(tagId)
      setTags((current) => current.filter((tag) => tag.id !== tagId))
      toast({
        title: "Tag deleted",
        description: "The pedagogical tag was deleted successfully.",
      })
    } catch (error) {
      const message =
        error instanceof ApiError && error.code === "PEDAGOGICAL_TAG_IN_USE"
          ? "This tag is already being used in questions and cannot be deleted."
          : error instanceof Error
            ? error.message
            : "Could not delete the pedagogical tag."

      toast({
        title: "Tag couldn't be deleted",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <button
            onClick={onBack}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Pedagogical Tags</h2>
            <p className="text-muted-foreground">Create reusable tags for topics and analytics.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground">New Tag</h3>
          <p className="mt-1 text-sm text-muted-foreground">Teachers can reuse these tags across questions.</p>
          <div className="mt-4 space-y-3">
            <input
              value={newTagName}
              onChange={(event) => setNewTagName(event.target.value)}
              placeholder="Addition Facts"
              className="w-full rounded-xl border border-border bg-background px-4 py-3"
            />
            <button
              type="button"
              onClick={() => {
                void handleCreate()
              }}
              disabled={isSaving || !newTagName.trim()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              Create Tag
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-foreground">Your Tags</h3>
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tags"
                className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4"
              />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {isLoading ? (
              <p className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
                Loading pedagogical tags...
              </p>
            ) : sortedTags.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
                No pedagogical tags found yet.
              </p>
            ) : (
              sortedTags.map((tag, index) => (
                <motion.div
                  key={tag.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="rounded-2xl border border-border bg-background p-4"
                >
                  {editingTagId === tag.id ? (
                    <div className="space-y-3">
                      <input
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-4 py-3"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            void handleRename(tag.id)
                          }}
                          className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTagId(null)
                            setEditingName("")
                          }}
                          className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">{tag.name}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTagId(tag.id)
                            setEditingName(tag.name)
                          }}
                          className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                        >
                          <Pencil className="h-4 w-4" />
                          Rename
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            void handleDelete(tag.id)
                          }}
                          className="inline-flex items-center gap-2 rounded-xl border border-destructive/20 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
