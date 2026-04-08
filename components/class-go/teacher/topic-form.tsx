"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import type {
  FillInBlankQuestion,
  MatchItemsQuestion,
  Topic,
  TopicChoiceOption,
  TopicMatchPair,
  TopicQuestion,
  TopicQuestionType,
} from "@/lib/types"

interface TopicFormProps {
  topic?: Topic | null
  onSave: (data: {
    name: string
    description: string
    icon: string
    color: string
    difficulty: "easy" | "medium" | "hard"
    questions: TopicQuestion[]
  }) => void
  onClose: () => void
}

const colorOptions = ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#EC4899", "#06B6D4", "#84CC16"]
const questionTypes: { value: TopicQuestionType; label: string }[] = [
  { value: "multiple_choice", label: "Multiple choice" },
  { value: "single_choice", label: "Single choice" },
  { value: "fill_in_blank", label: "Fill in the blank" },
  { value: "listen_and_select", label: "Listen and select" },
  { value: "match_items", label: "Match items" },
]

const createId = () => Math.random().toString(36).slice(2, 10)
const choice = (text = "", isCorrect = false): TopicChoiceOption => ({ id: createId(), text, isCorrect })
const pair = (): TopicMatchPair => ({ id: createId(), left: "", right: "" })

function createQuestion(type: TopicQuestionType): TopicQuestion {
  const base = { id: createId(), type, prompt: "", explanation: "" }
  if (type === "fill_in_blank") return { ...base, type, word: "", hiddenIndexes: [] }
  if (type === "match_items") return { ...base, type, instruction: "", pairs: [pair(), pair()] }
  if (type === "listen_and_select") return { ...base, type, audioText: "", options: [choice("", true), choice(), choice()] }
  return { ...base, type, options: [choice("", true), choice(), choice()] }
}

export function TopicForm({ topic, onSave, onClose }: TopicFormProps) {
  const [name, setName] = useState(topic?.name || "")
  const [description, setDescription] = useState(topic?.description || "")
  const [color, setColor] = useState(topic?.color || "#10B981")
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(topic?.difficulty || "easy")
  const [questions, setQuestions] = useState<TopicQuestion[]>(topic?.questions?.length ? topic.questions : [createQuestion("single_choice")])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateQuestion = (id: string, updater: (q: TopicQuestion) => TopicQuestion) =>
    setQuestions((current) => current.map((q) => (q.id === id ? updater(q) : q)))

  const updateFillQuestion = (id: string, updater: (q: FillInBlankQuestion) => FillInBlankQuestion) =>
    updateQuestion(id, (q) => (q.type === "fill_in_blank" ? updater(q) : q))

  const updateMatchQuestion = (id: string, updater: (q: MatchItemsQuestion) => MatchItemsQuestion) =>
    updateQuestion(id, (q) => (q.type === "match_items" ? updater(q) : q))

  const updateChoiceSet = (
    id: string,
    updater: (options: TopicChoiceOption[], type: "single_choice" | "multiple_choice" | "listen_and_select") => TopicChoiceOption[]
  ) =>
    updateQuestion(id, (q) => {
      if (q.type !== "single_choice" && q.type !== "multiple_choice" && q.type !== "listen_and_select") return q
      return { ...q, options: updater(q.options, q.type) }
    })

  const validate = () => {
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = "Name is required"
    if (!questions.length) next.questions = "Add at least one question"

    questions.forEach((q, index) => {
      const key = `question-${q.id}`
      if (!q.prompt.trim()) next[key] = `Question ${index + 1} needs a prompt`
      if (q.type === "fill_in_blank") {
        if (!q.word.trim()) next[key] = `Question ${index + 1} needs a word`
        if (!q.hiddenIndexes.length) next[key] = `Question ${index + 1} must hide at least one letter`
      }
      if (q.type === "match_items") {
        if (!q.instruction.trim()) next[key] = `Question ${index + 1} needs an instruction`
        if (q.pairs.filter((p) => p.left.trim() && p.right.trim()).length < 2) next[key] = `Question ${index + 1} needs two pairs`
        if (q.pairs.some((p) => p.right.trim().includes(" "))) next[key] = `Question ${index + 1} must match each prompt to a single word`
      }
      if (q.type === "single_choice" || q.type === "multiple_choice" || q.type === "listen_and_select") {
        if (q.options.filter((o) => o.text.trim()).length < 2) next[key] = `Question ${index + 1} needs two options`
        if (q.type === "single_choice" && q.options.filter((o) => o.isCorrect).length !== 1) next[key] = `Question ${index + 1} needs one correct answer`
        if (q.type === "multiple_choice" && !q.options.some((o) => o.isCorrect)) next[key] = `Question ${index + 1} needs at least one correct answer`
        if (q.type === "listen_and_select" && q.options.filter((o) => o.isCorrect).length !== 1) next[key] = `Question ${index + 1} needs exactly one correct answer`
        if (q.type === "listen_and_select" && !q.audioText.trim()) next[key] = `Question ${index + 1} needs audio text`
      }
    })

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSave({ name, description, icon: "Zap", color, difficulty, questions })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-6xl">
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <button onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground">{topic ? "Edit Topic" : "New Topic"}</h2>
          <p className="text-sm text-muted-foreground">Configure the topic on a full-screen layout.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_320px]">
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Topic Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-3" />
                {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3" />
              </div>
            </div>
            <div className="space-y-4 rounded-2xl border border-border bg-muted/20 p-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Color</label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((value) => (
                    <button key={value} type="button" onClick={() => setColor(value)} className={`h-10 w-10 rounded-xl border-2 ${color === value ? "border-foreground ring-2 ring-foreground ring-offset-2" : "border-transparent"}`} style={{ backgroundColor: value }} />
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Difficulty</label>
                <div className="grid gap-2">
                  {(["easy", "medium", "hard"] as const).map((value) => (
                    <button key={value} type="button" onClick={() => setDifficulty(value)} className={`rounded-xl border-2 p-3 text-left ${difficulty === value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Questions</h3>
                <p className="text-sm text-muted-foreground">Add questions and answers inside this topic.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {questionTypes.map((type) => (
                  <button key={type.value} type="button" onClick={() => setQuestions((current) => [...current, createQuestion(type.value)])} className="rounded-xl border border-border px-3 py-2 text-sm">
                    <Plus className="mr-1 inline h-4 w-4" />
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
            {errors.questions && <p className="text-sm text-destructive">{errors.questions}</p>}

            <div className="space-y-4">
              {questions.map((q, index) => (
                <div key={q.id} className="rounded-2xl border border-border p-4">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Question {index + 1}</p>
                      <p className="text-xs text-muted-foreground">{questionTypes.find((item) => item.value === q.type)?.label}</p>
                    </div>
                    <div className="flex gap-2">
                      <select value={q.type} onChange={(e) => updateQuestion(q.id, () => createQuestion(e.target.value as TopicQuestionType))} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
                        {questionTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                      </select>
                      <button type="button" onClick={() => setQuestions((current) => (current.length > 1 ? current.filter((item) => item.id !== q.id) : current))} className="rounded-xl border border-destructive/20 px-3 py-2 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Prompt</label>
                      <input value={q.prompt} onChange={(e) => updateQuestion(q.id, (current) => ({ ...current, prompt: e.target.value }))} className="w-full rounded-xl border border-border bg-background px-4 py-3" />
                    </div>

                    {q.type === "fill_in_blank" && (
                      <>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-foreground">Word</label>
                          <input
                            value={q.word}
                            onChange={(e) =>
                              updateFillQuestion(q.id, (current) => {
                                const nextWord = e.target.value.toUpperCase()
                                return {
                                  ...current,
                                  word: nextWord,
                                  hiddenIndexes: current.hiddenIndexes.filter((index: number) => index < nextWord.length),
                                }
                              })
                            }
                            placeholder="Ex: HOUSE"
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 uppercase"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-foreground">Letters to hide</label>
                          {q.word.trim() ? (
                            <div className="flex flex-wrap gap-2">
                              {Array.from(q.word).map((letter, letterIndex) => {
                                const hidden = q.hiddenIndexes.includes(letterIndex)
                                return (
                                  <button
                                    key={`${q.id}-letter-${letterIndex}`}
                                    type="button"
                                    onClick={() =>
                                      updateFillQuestion(q.id, (current) => ({
                                        ...current,
                                        hiddenIndexes: current.hiddenIndexes.includes(letterIndex)
                                          ? current.hiddenIndexes.filter((index: number) => index !== letterIndex)
                                          : [...current.hiddenIndexes, letterIndex].sort((a, b) => a - b),
                                      }))
                                    }
                                    className={`flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-semibold ${
                                      hidden
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border bg-background text-foreground"
                                    }`}
                                  >
                                    {letter}
                                  </button>
                                )
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Type the word and then mark the letters that should be hidden.</p>
                          )}
                        </div>
                        {q.word.trim() && (
                          <div className="rounded-xl bg-muted/40 p-3">
                            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Preview</p>
                            <p className="mt-2 text-lg font-bold tracking-[0.2em] text-foreground">
                              {Array.from(q.word)
                                .map((letter, letterIndex) => (q.hiddenIndexes.includes(letterIndex) ? "_" : letter))
                                .join(" ")}
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    {(q.type === "single_choice" || q.type === "multiple_choice" || q.type === "listen_and_select") && (
                      <>
                        {q.type === "listen_and_select" && (
                          <>
                            <textarea value={q.audioText} onChange={(e) => updateQuestion(q.id, (current) => ({ ...current, audioText: e.target.value }))} rows={3} placeholder="Text to read aloud" className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3" />
                            <p className="text-sm text-muted-foreground">Select a single correct answer for what the student will hear.</p>
                          </>
                        )}
                        <div className="space-y-2">
                          {q.options.map((option) => (
                            <div key={option.id} className="flex items-center gap-2 rounded-xl border border-border p-3">
                              <button
                                type="button"
                                onClick={() =>
                                  updateChoiceSet(q.id, (options, type) =>
                                    options.map((item) => ({
                                      ...item,
                                      isCorrect:
                                        type === "single_choice" || type === "listen_and_select"
                                          ? item.id === option.id
                                          : item.id === option.id
                                            ? !item.isCorrect
                                            : item.isCorrect,
                                    }))
                                  )
                                }
                                className={`rounded-full px-3 py-1 text-xs ${option.isCorrect ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                              >
                                {option.isCorrect ? "Correct" : "Mark"}
                              </button>
                              <input value={option.text} onChange={(e) => updateChoiceSet(q.id, (options) => options.map((item) => item.id === option.id ? { ...item, text: e.target.value } : item))} className="w-full rounded-xl border border-border bg-background px-4 py-2.5" />
                              <button type="button" onClick={() => updateChoiceSet(q.id, (options) => options.length > 2 ? options.filter((item) => item.id !== option.id) : options)} className="rounded-xl border border-border px-3 py-2 text-muted-foreground"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          ))}
                          <button type="button" onClick={() => updateChoiceSet(q.id, (options) => [...options, choice()])} className="rounded-xl border border-border px-3 py-2 text-sm">Add option</button>
                        </div>
                      </>
                    )}

                    {q.type === "match_items" && (
                      <>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-foreground">Instruction</label>
                          <input value={q.instruction} onChange={(e) => updateQuestion(q.id, (current) => ({ ...current, instruction: e.target.value }))} placeholder="Match each clue with the correct word" className="w-full rounded-xl border border-border bg-background px-4 py-3" />
                        </div>
                        <div className="rounded-xl bg-muted/40 p-3">
                          <p className="text-sm text-muted-foreground">Use short clues on the left and a single word on the right.</p>
                        </div>
                        <div className="space-y-2">
                          {q.pairs.map((item) => (
                            <div key={item.id} className="grid gap-2 rounded-xl border border-border p-3 sm:grid-cols-[1fr_1fr_auto]">
                              <input value={item.left} onChange={(e) => updateMatchQuestion(q.id, (current) => ({ ...current, pairs: current.pairs.map((pairItem: TopicMatchPair) => pairItem.id === item.id ? { ...pairItem, left: e.target.value } : pairItem) }))} placeholder="Short clue" className="w-full rounded-xl border border-border bg-background px-4 py-2.5" />
                              <input value={item.right} onChange={(e) => updateMatchQuestion(q.id, (current) => ({ ...current, pairs: current.pairs.map((pairItem: TopicMatchPair) => pairItem.id === item.id ? { ...pairItem, right: e.target.value } : pairItem) }))} placeholder="Word" className="w-full rounded-xl border border-border bg-background px-4 py-2.5" />
                              <button type="button" onClick={() => updateMatchQuestion(q.id, (current) => ({ ...current, pairs: current.pairs.length > 2 ? current.pairs.filter((pairItem: TopicMatchPair) => pairItem.id !== item.id) : current.pairs }))} className="rounded-xl border border-border px-3 py-2 text-muted-foreground"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          ))}
                          <button type="button" onClick={() => updateMatchQuestion(q.id, (current) => ({ ...current, pairs: [...current.pairs, pair()] }))} className="rounded-xl border border-border px-3 py-2 text-sm">Add pair</button>
                        </div>
                      </>
                    )}

                    <textarea value={q.explanation || ""} onChange={(e) => updateQuestion(q.id, (current) => ({ ...current, explanation: e.target.value }))} rows={2} placeholder="Optional explanation" className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3" />
                    {errors[`question-${q.id}`] && <p className="text-sm text-destructive">{errors[`question-${q.id}`]}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-border py-3 font-semibold text-foreground hover:bg-muted">
              Cancel
            </button>
            <button type="submit" className="flex-1 rounded-xl bg-primary py-3 font-semibold text-primary-foreground hover:bg-primary/90">
              {topic ? "Save" : "Create Topic"}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}

