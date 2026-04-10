"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react"
import type {
  FillInBlankQuestion,
  ImageOrderingQuestion,
  MatchItemsQuestion,
  PhraseOrderingQuestion,
  SingleTextOrderingQuestion,
  Topic,
  TopicChoiceOption,
  TopicMatchPair,
  TopicOrderingItem,
  TopicQuestion,
  TopicQuestionType,
  TextOrderingQuestion,
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
  { value: "multiple_choice", label: "Text multiple choice" },
  { value: "single_choice", label: "Text single choice" },
  { value: "fill_in_blank", label: "Fill in the blank" },
  { value: "listen_and_select_text", label: "Listen and select text" },
  { value: "single_text_ordering", label: "Single text ordering" },
  { value: "phrase_ordering", label: "Phrase ordering" },
  { value: "listen_and_select_image", label: "Listen and select image" },
  { value: "image_selection", label: "Image single selection" },
  { value: "image_multiple_selection", label: "Image multiple selection" },
  { value: "image_ordering", label: "Image ordering" },
  { value: "match_items", label: "Match items" },
]
const questionTypeGroups: { title: string; items: { value: TopicQuestionType; label: string }[] }[] = [
  {
    title: "Text",
    items: questionTypes.filter((type) =>
      ["multiple_choice", "single_choice", "fill_in_blank", "listen_and_select_text", "single_text_ordering", "phrase_ordering"].includes(type.value)
    ),
  },
  {
    title: "Image",
    items: questionTypes.filter((type) =>
      ["listen_and_select_image", "image_selection", "image_multiple_selection", "image_ordering"].includes(type.value)
    ),
  },
  {
    title: "Logic",
    items: questionTypes.filter((type) => ["match_items"].includes(type.value)),
  },
]

const createId = () => Math.random().toString(36).slice(2, 10)
const choice = (text = "", isCorrect = false): TopicChoiceOption => ({ id: createId(), text, imageUrl: "", isCorrect })
const pair = (): TopicMatchPair => ({ id: createId(), left: "", right: "" })
const orderingItem = (): TopicOrderingItem => ({ id: createId(), text: "", imageUrl: "" })
const hasImageUrl = (value?: string) => Boolean(value?.trim())
const getQuestionTypeLabel = (type: TopicQuestionType) =>
  questionTypes.find((item) => item.value === type)?.label ?? (type === "text_ordering" ? "Phrase ordering" : type)
const orderingLinesToItems = (value: string, previousItems: TopicOrderingItem[] = []): TopicOrderingItem[] =>
  value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((text, index) => ({
      id: previousItems[index]?.id ?? createId(),
      text,
      imageUrl: previousItems[index]?.imageUrl ?? "",
    }))
const wordToItems = (value: string, previousItems: TopicOrderingItem[] = []): TopicOrderingItem[] =>
  Array.from(value.replace(/\s+/g, ""))
    .filter(Boolean)
    .map((character, index) => ({
      id: previousItems[index]?.id ?? createId(),
      text: character,
      imageUrl: previousItems[index]?.imageUrl ?? "",
    }))
const phraseToItems = (value: string, previousItems: TopicOrderingItem[] = []): TopicOrderingItem[] =>
  value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) => ({
      id: previousItems[index]?.id ?? createId(),
      text: word,
      imageUrl: previousItems[index]?.imageUrl ?? "",
    }))

function createQuestion(type: TopicQuestionType): TopicQuestion {
  const base = { id: createId(), type, prompt: "", imageUrl: "", explanation: "" }
  if (type === "fill_in_blank") return { ...base, type, word: "", hiddenIndexes: [] }
  if (type === "match_items") return { ...base, type, instruction: "", pairs: [pair(), pair()] }
  if (type === "listen_and_select") return { ...base, type, audioText: "", options: [choice("", true), choice(), choice()] }
  if (type === "listen_and_select_text") return { ...base, type, audioText: "", options: [choice("", true), choice(), choice()] }
  if (type === "listen_and_select_image") return { ...base, type, audioText: "", options: [choice("", true), choice(), choice()] }
  if (type === "image_selection") return { ...base, type, options: [choice("", true), choice(), choice()] }
  if (type === "image_multiple_selection") return { ...base, type, options: [choice("", true), choice(), choice()] }
  if (type === "single_text_ordering") return { ...base, type, items: wordToItems("CAT") }
  if (type === "phrase_ordering") return { ...base, type, items: phraseToItems("I am ready") }
  if (type === "text_ordering") return { ...base, type, items: phraseToItems("I am ready") }
  if (type === "image_ordering") return { ...base, type, items: [orderingItem(), orderingItem(), orderingItem()] }
  return { ...base, type, options: [choice("", true), choice(), choice()] }
}

export function TopicForm({ topic, onSave, onClose }: TopicFormProps) {
  const [name, setName] = useState(topic?.name || "")
  const [description, setDescription] = useState(topic?.description || "")
  const [color, setColor] = useState(topic?.color || "#10B981")
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(topic?.difficulty || "easy")
  const [questions, setQuestions] = useState<TopicQuestion[]>(topic?.questions?.length ? topic.questions : [createQuestion("single_choice")])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [typePickerQuestionId, setTypePickerQuestionId] = useState<string | null>(null)
  const [addQuestionSearch, setAddQuestionSearch] = useState("")
  const [typePickerSearch, setTypePickerSearch] = useState<Record<string, string>>({})
  const [phraseOrderingInput, setPhraseOrderingInput] = useState<Record<string, string>>({})

  const updateQuestion = (id: string, updater: (q: TopicQuestion) => TopicQuestion) =>
    setQuestions((current) => current.map((q) => (q.id === id ? updater(q) : q)))

  const updateFillQuestion = (id: string, updater: (q: FillInBlankQuestion) => FillInBlankQuestion) =>
    updateQuestion(id, (q) => (q.type === "fill_in_blank" ? updater(q) : q))

  const updateMatchQuestion = (id: string, updater: (q: MatchItemsQuestion) => MatchItemsQuestion) =>
    updateQuestion(id, (q) => (q.type === "match_items" ? updater(q) : q))

  const updateTextOrderingQuestion = (
    id: string,
    updater: (q: SingleTextOrderingQuestion | PhraseOrderingQuestion | TextOrderingQuestion) => SingleTextOrderingQuestion | PhraseOrderingQuestion | TextOrderingQuestion
  ) =>
    updateQuestion(id, (q) => (q.type === "single_text_ordering" || q.type === "phrase_ordering" || q.type === "text_ordering" ? updater(q) : q))

  const updateImageOrderingQuestion = (id: string, updater: (q: ImageOrderingQuestion) => ImageOrderingQuestion) =>
    updateQuestion(id, (q) => (q.type === "image_ordering" ? updater(q) : q))

  const updateChoiceSet = (
    id: string,
    updater: (options: TopicChoiceOption[], type: "single_choice" | "multiple_choice" | "listen_and_select" | "listen_and_select_text" | "listen_and_select_image" | "image_selection" | "image_multiple_selection") => TopicChoiceOption[]
  ) =>
    updateQuestion(id, (q) => {
      if (q.type !== "single_choice" && q.type !== "multiple_choice" && q.type !== "listen_and_select" && q.type !== "listen_and_select_text" && q.type !== "listen_and_select_image" && q.type !== "image_selection" && q.type !== "image_multiple_selection") return q
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
      if (q.type === "single_text_ordering") {
        if (q.items.length < 2) next[key] = `Question ${index + 1} needs a word with at least two letters`
      }
      if (q.type === "phrase_ordering" || q.type === "text_ordering") {
        if (q.items.filter((item) => item.text.trim()).length < 2) next[key] = `Question ${index + 1} needs at least two text items`
      }
      if (q.type === "image_ordering") {
        if (q.items.filter((item) => item.imageUrl?.trim()).length < 2) next[key] = `Question ${index + 1} needs at least two image items`
      }
      if (q.type === "single_choice" || q.type === "multiple_choice" || q.type === "listen_and_select" || q.type === "listen_and_select_text") {
        if (q.options.filter((o) => o.text.trim()).length < 2) next[key] = `Question ${index + 1} needs two options`
        if (q.type === "single_choice" && q.options.filter((o) => o.isCorrect).length !== 1) next[key] = `Question ${index + 1} needs one correct answer`
        if (q.type === "multiple_choice" && !q.options.some((o) => o.isCorrect)) next[key] = `Question ${index + 1} needs at least one correct answer`
        if ((q.type === "listen_and_select" || q.type === "listen_and_select_text") && q.options.filter((o) => o.isCorrect).length !== 1) next[key] = `Question ${index + 1} needs exactly one correct answer`
        if ((q.type === "listen_and_select" || q.type === "listen_and_select_text") && !q.audioText.trim()) next[key] = `Question ${index + 1} needs audio text`
      }
      if (q.type === "listen_and_select_image") {
        if (q.options.filter((o) => o.imageUrl?.trim()).length < 2) next[key] = `Question ${index + 1} needs two answer images`
        if (q.options.filter((o) => o.isCorrect).length !== 1) next[key] = `Question ${index + 1} needs exactly one correct answer`
        if (!q.audioText.trim()) next[key] = `Question ${index + 1} needs audio text`
      }
      if (q.type === "image_selection") {
        if (!q.imageUrl?.trim()) next[key] = `Question ${index + 1} needs a question image`
        if (q.options.filter((o) => o.imageUrl?.trim()).length < 2) next[key] = `Question ${index + 1} needs two answer images`
        if (q.options.filter((o) => o.isCorrect).length !== 1) next[key] = `Question ${index + 1} needs one correct answer`
      }
      if (q.type === "image_multiple_selection") {
        if (!q.imageUrl?.trim()) next[key] = `Question ${index + 1} needs a question image`
        if (q.options.filter((o) => o.imageUrl?.trim()).length < 2) next[key] = `Question ${index + 1} needs two answer images`
        if (!q.options.some((o) => o.isCorrect)) next[key] = `Question ${index + 1} needs at least one correct answer`
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

  const getFilteredGroups = (search: string) => {
    const normalizedSearch = search.trim().toLowerCase()

    if (!normalizedSearch) return questionTypeGroups

    return questionTypeGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.label.toLowerCase().includes(normalizedSearch)),
      }))
      .filter((group) => group.items.length > 0)
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
              <div className="space-y-3">
                <input
                  value={addQuestionSearch}
                  onChange={(e) => setAddQuestionSearch(e.target.value)}
                  placeholder="Search question type"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm"
                />
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {getFilteredGroups(addQuestionSearch).map((group) => (
                  <div key={group.title} className="rounded-2xl border border-border bg-muted/20 p-3">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {group.title}
                    </p>
                    <div className="grid gap-2">
                      {group.items.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setQuestions((current) => [...current, createQuestion(type.value)])}
                          className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-left text-sm hover:bg-muted"
                        >
                          <span>{type.label}</span>
                          <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                </div>
                {getFilteredGroups(addQuestionSearch).length === 0 && (
                  <p className="text-sm text-muted-foreground">No question types match that search.</p>
                )}
              </div>
            </div>
            {errors.questions && <p className="text-sm text-destructive">{errors.questions}</p>}

            <div className="space-y-4">
              {questions.map((q, index) => (
                <div key={q.id} className="rounded-2xl border border-border p-4">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Question {index + 1}</p>
                      <p className="text-xs text-muted-foreground">{getQuestionTypeLabel(q.type)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setQuestions((current) => (current.length > 1 ? current.filter((item) => item.id !== q.id) : current))}
                      className="shrink-0 rounded-xl border border-destructive/20 px-3 py-2 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mb-4 rounded-2xl border border-border bg-muted/20 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-foreground">Question type</label>
                        <p className="text-sm text-muted-foreground">{getQuestionTypeLabel(q.type)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setTypePickerQuestionId((current) => (current === q.id ? null : q.id))
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground"
                      >
                        Change
                        {typePickerQuestionId === q.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>

                    {typePickerQuestionId === q.id && (
                      <div className="mt-3 space-y-3">
                        <input
                          value={typePickerSearch[q.id] || ""}
                          onChange={(e) =>
                            setTypePickerSearch((current) => ({ ...current, [q.id]: e.target.value }))
                          }
                          placeholder="Search question type"
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm"
                        />
                        {getFilteredGroups(typePickerSearch[q.id] || "").map((group) => (
                          <div key={`${q.id}-${group.title}`} className="rounded-xl border border-border bg-background p-3">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                              {group.title}
                            </p>
                            <div className="grid gap-2 sm:grid-cols-2">
                              {group.items.map((type) => {
                                const isActive = q.type === type.value

                                return (
                                  <button
                                  key={type.value}
                                  type="button"
                                  onClick={() => {
                                      updateQuestion(q.id, () => createQuestion(type.value))
                                      setTypePickerSearch((current) => ({ ...current, [q.id]: "" }))
                                      setTypePickerQuestionId(null)
                                    }}
                                    className={`rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
                                      isActive
                                        ? "border-primary bg-primary/10 font-semibold text-primary"
                                        : "border-border bg-background text-foreground hover:bg-muted"
                                    }`}
                                  >
                                    {type.label}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                        {getFilteredGroups(typePickerSearch[q.id] || "").length === 0 && (
                          <p className="text-sm text-muted-foreground">No question types match that search.</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Prompt</label>
                      <input value={q.prompt} onChange={(e) => updateQuestion(q.id, (current) => ({ ...current, prompt: e.target.value }))} className="w-full rounded-xl border border-border bg-background px-4 py-3" />
                    </div>
                    {(q.type === "image_selection" || q.type === "image_multiple_selection") && (
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">Question Image URL</label>
                        <input
                          value={q.imageUrl || ""}
                          onChange={(e) => updateQuestion(q.id, (current) => ({ ...current, imageUrl: e.target.value }))}
                          placeholder="https://example.com/question-image.png"
                          className="w-full rounded-xl border border-border bg-background px-4 py-3"
                        />
                        <p className="mt-1 text-xs text-muted-foreground">Required for image-based questions.</p>
                      </div>
                    )}
                    {(q.type === "image_selection" || q.type === "image_multiple_selection") && hasImageUrl(q.imageUrl) && (
                      <div className="rounded-xl border border-border bg-muted/20 p-3">
                        <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Question image preview</p>
                        <div className="mx-auto aspect-[4/3] w-full max-w-sm overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm">
                          <img
                            src={q.imageUrl}
                            alt={`Question ${index + 1} preview`}
                            className="h-full w-full object-contain"
                            crossOrigin="anonymous"
                          />
                        </div>
                      </div>
                    )}

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

                    {(q.type === "single_choice" || q.type === "multiple_choice" || q.type === "listen_and_select" || q.type === "listen_and_select_text" || q.type === "listen_and_select_image" || q.type === "image_selection" || q.type === "image_multiple_selection") && (
                      <>
                        {(q.type === "listen_and_select" || q.type === "listen_and_select_text" || q.type === "listen_and_select_image") && (
                          <>
                            <textarea value={q.audioText} onChange={(e) => updateQuestion(q.id, (current) => ({ ...current, audioText: e.target.value }))} rows={3} placeholder="Text to read aloud" className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3" />
                            <p className="text-sm text-muted-foreground">Select a single correct answer for what the student will hear.</p>
                          </>
                        )}
                        {(q.type === "image_selection" || q.type === "image_multiple_selection" || q.type === "listen_and_select_image") && (
                          <p className="text-sm text-muted-foreground">Use a question image and answer images. The student will select an image directly during gameplay.</p>
                        )}
                        <div className="space-y-2">
                          {q.options.map((option) => (
                            <div key={option.id} className="space-y-3 rounded-xl border border-border p-3">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateChoiceSet(q.id, (options, type) =>
                                      options.map((item) => ({
                                      ...item,
                                      isCorrect:
                                        type === "single_choice" || type === "listen_and_select" || type === "listen_and_select_text" || type === "listen_and_select_image" || type === "image_selection"
                                          ? item.id === option.id
                                          : type === "image_multiple_selection"
                                            ? item.id === option.id
                                              ? !item.isCorrect
                                              : item.isCorrect
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
                              {(q.type === "image_selection" || q.type === "image_multiple_selection" || q.type === "listen_and_select_image") && (
                                <div>
                                  <input
                                    value={option.imageUrl || ""}
                                    onChange={(e) =>
                                      updateChoiceSet(q.id, (options) =>
                                        options.map((item) =>
                                          item.id === option.id ? { ...item, imageUrl: e.target.value } : item
                                        )
                                      )
                                    }
                                    placeholder="https://example.com/answer-image.png"
                                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5"
                                  />
                                  <p className="mt-1 text-xs text-muted-foreground">Image URL for this answer.</p>
                                </div>
                              )}
                              {(q.type === "image_selection" || q.type === "image_multiple_selection" || q.type === "listen_and_select_image") && hasImageUrl(option.imageUrl) && (
                                <div className="mx-auto aspect-[4/3] w-full max-w-xs overflow-hidden rounded-2xl border border-border/60 bg-muted/30 shadow-sm">
                                  <img
                                    src={option.imageUrl}
                                    alt={`Answer option preview for question ${index + 1}`}
                                    className="h-full w-full object-contain"
                                    crossOrigin="anonymous"
                                  />
                                </div>
                              )}
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

                    {(q.type === "single_text_ordering" || q.type === "phrase_ordering" || q.type === "text_ordering") && (
                      <>
                        <div className="rounded-xl bg-muted/40 p-3">
                          <p className="text-sm text-muted-foreground">
                            {q.type === "single_text_ordering"
                              ? "Write the correct word. The student will see its letters shuffled and drag them into the right order."
                              : "Write the correct phrase. The student will see its words shuffled and drag them into the right order."}
                          </p>
                        </div>
                        <div className="space-y-3">
                          {q.type === "single_text_ordering" ? (
                            <input
                              value={q.items.map((item) => item.text).join("")}
                              onChange={(e) =>
                                updateTextOrderingQuestion(q.id, (current) => ({
                                  ...current,
                                  items: wordToItems(e.target.value, current.items),
                                }))
                              }
                              placeholder="Example: butterfly"
                              className="w-full rounded-xl border border-border bg-background px-4 py-3"
                            />
                          ) : (
                            <input
                              value={phraseOrderingInput[q.id] ?? q.items.map((item) => item.text).join(" ")}
                              onChange={(e) =>
                                {
                                  const nextValue = e.target.value
                                  setPhraseOrderingInput((current) => ({ ...current, [q.id]: nextValue }))
                                  updateTextOrderingQuestion(q.id, (current) => ({
                                    ...current,
                                    items: phraseToItems(nextValue, current.items),
                                  }))
                                }
                              }
                              placeholder="Example: I am ready"
                              className="w-full rounded-xl border border-border bg-background px-4 py-3"
                            />
                          )}
                          <div className="rounded-xl bg-background p-3">
                            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Preview</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {q.items.map((item, itemIndex) => (
                                <span key={item.id} className="rounded-xl border border-border bg-muted px-3 py-2 text-sm font-medium text-foreground">
                                  {item.text || (q.type === "single_text_ordering" ? `Letter ${itemIndex + 1}` : `Word ${itemIndex + 1}`)}
                                </span>
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {q.type === "single_text_ordering"
                              ? "Each letter becomes one draggable tile in gameplay."
                              : "Each word becomes one draggable tile in gameplay."}
                          </p>
                        </div>
                      </>
                    )}

                    {q.type === "image_ordering" && (
                      <>
                        <div className="rounded-xl bg-muted/40 p-3">
                          <p className="text-sm text-muted-foreground">Add the images in the correct order. The student will see them shuffled and reorder them in gameplay.</p>
                        </div>
                        <div className="space-y-2">
                          {q.items.map((item, itemIndex) => (
                            <div key={item.id} className="space-y-3 rounded-xl border border-border p-3">
                              <div className="flex items-center gap-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-sm font-semibold text-foreground">
                                  {itemIndex + 1}
                                </div>
                                <input
                                  value={item.text}
                                  onChange={(e) =>
                                    updateImageOrderingQuestion(q.id, (current) => ({
                                      ...current,
                                      items: current.items.map((currentItem) =>
                                        currentItem.id === item.id ? { ...currentItem, text: e.target.value } : currentItem
                                      ),
                                    }))
                                  }
                                  placeholder="Optional caption"
                                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateImageOrderingQuestion(q.id, (current) => {
                                      if (itemIndex === 0) return current
                                      const nextItems = [...current.items]
                                      ;[nextItems[itemIndex - 1], nextItems[itemIndex]] = [nextItems[itemIndex], nextItems[itemIndex - 1]]
                                      return { ...current, items: nextItems }
                                    })
                                  }
                                  className="rounded-xl border border-border px-3 py-2 text-sm"
                                >
                                  Up
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateImageOrderingQuestion(q.id, (current) => ({
                                      ...current,
                                      items: current.items.length > 2 ? current.items.filter((currentItem) => currentItem.id !== item.id) : current.items,
                                    }))
                                  }
                                  className="rounded-xl border border-border px-3 py-2 text-muted-foreground"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                              <div>
                                <input
                                  value={item.imageUrl || ""}
                                  onChange={(e) =>
                                    updateImageOrderingQuestion(q.id, (current) => ({
                                      ...current,
                                      items: current.items.map((currentItem) =>
                                        currentItem.id === item.id ? { ...currentItem, imageUrl: e.target.value } : currentItem
                                      ),
                                    }))
                                  }
                                  placeholder="https://example.com/order-image.png"
                                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5"
                                />
                              </div>
                              {hasImageUrl(item.imageUrl) && (
                                <div className="mx-auto aspect-[4/3] w-full max-w-xs overflow-hidden rounded-2xl border border-border/60 bg-muted/30 shadow-sm">
                                  <img
                                    src={item.imageUrl}
                                    alt={`Ordering item ${itemIndex + 1}`}
                                    className="h-full w-full object-contain"
                                    crossOrigin="anonymous"
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                          <button type="button" onClick={() => updateImageOrderingQuestion(q.id, (current) => ({ ...current, items: [...current.items, orderingItem()] }))} className="rounded-xl border border-border px-3 py-2 text-sm">Add item</button>
                        </div>
                      </>
                    )}

                    <textarea value={q.explanation || ""} onChange={(e) => updateQuestion(q.id, (current) => ({ ...current, explanation: e.target.value }))} rows={2} placeholder="Optional explanation" className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3" />
                    {errors[`question-${q.id}`] && <p className="text-sm text-destructive">{errors[`question-${q.id}`]}</p>}
                  </div>
                </div>
              ))}

              <div className="rounded-2xl border border-dashed border-border bg-muted/10 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Add another question</p>
                    <p className="text-sm text-muted-foreground">Create the next question without scrolling back to the top.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuestions((current) => [...current, createQuestion("single_choice")])}
                    className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add question
                  </button>
                </div>
              </div>
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

