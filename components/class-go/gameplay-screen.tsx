"use client"

import { Reorder, useDragControls } from "framer-motion"
import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { CheckCircle2, GripVertical, Headphones, Volume2, XCircle, Zap } from "lucide-react"
import type {
  FillInBlankQuestion,
  ImageMultipleSelectionQuestion,
  ImageOrderingQuestion,
  ImageSelectionQuestion,
  ListenAndSelectQuestion,
  ListenAndSelectImageQuestion,
  ListenAndSelectTextQuestion,
  MatchItemsQuestion,
  MultipleChoiceQuestion,
  PhraseOrderingQuestion,
  SingleTextOrderingQuestion,
  SingleChoiceQuestion,
  TextOrderingQuestion,
  TopicQuestion,
  TopicQuestionType,
} from "@/lib/types"
import type { GameState } from "@/app/page"
import { cn } from "@/lib/utils"
import confetti from "canvas-confetti"

interface GameplayScreenProps {
  gameState: GameState
  onGameComplete: (finalState: GameState) => void
}

const fallbackQuestions: SingleChoiceQuestion[] = [
  {
    id: "fallback-q1",
    type: "single_choice",
    prompt: "What is 3 + 4?",
    options: [
      { id: "a", text: "6", isCorrect: false },
      { id: "b", text: "7", isCorrect: true },
      { id: "c", text: "8", isCorrect: false },
    ],
  },
]

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

function shuffleArray<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5)
}

function getQuestionTypeLabel(type: TopicQuestionType): string {
  switch (type) {
    case "multiple_choice":
      return "Text multiple choice"
    case "single_choice":
      return "Text single choice"
    case "fill_in_blank":
      return "Fill in the blank"
    case "listen_and_select":
      return "Listen and select"
    case "listen_and_select_text":
      return "Listen and select text"
    case "listen_and_select_image":
      return "Listen and select image"
    case "image_selection":
      return "Image single selection"
    case "image_multiple_selection":
      return "Image multiple selection"
    case "single_text_ordering":
      return "Single text ordering"
    case "phrase_ordering":
      return "Phrase ordering"
    case "text_ordering":
      return "Phrase ordering"
    case "image_ordering":
      return "Image ordering"
    case "match_items":
      return "Match items"
  }
}

function createFillOptions(question: FillInBlankQuestion): Record<number, string[]> {
  return question.hiddenIndexes.reduce<Record<number, string[]>>((acc, index) => {
    const correctLetter = question.word[index]?.toUpperCase() || ""
    const distractors = letters.filter((letter) => letter !== correctLetter).slice(0, 3)
    acc[index] = shuffleArray([correctLetter, ...distractors])
    return acc
  }, {})
}

type AnswerDraft = {
  choiceIds: string[]
  fillAnswers: Record<number, string>
  matchAnswers: Record<string, string>
  orderingIds: string[]
}

const emptyDraft = (): AnswerDraft => ({
  choiceIds: [],
  fillAnswers: {},
  matchAnswers: {},
  orderingIds: [],
})

function getSingleTextOrderingMetrics(itemCount: number) {
  const safeCount = Math.max(itemCount, 1)
  const gap = safeCount > 8 ? 6 : 8
  const availableWidth = 280
  const tileSize = Math.max(18, Math.min(64, Math.floor((availableWidth - gap * (safeCount - 1)) / safeCount)))
  const fontSize = Math.max(12, Math.min(32, Math.floor(tileSize * 0.5)))

  return { gap, tileSize, fontSize }
}

function getFillInBlankMetrics(itemCount: number) {
  const safeCount = Math.max(itemCount, 1)
  const gap = safeCount > 8 ? 4 : 6
  const availableWidth = 300
  const tileWidth = Math.max(20, Math.min(48, Math.floor((availableWidth - gap * (safeCount - 1)) / safeCount)))
  const tileHeight = Math.max(28, Math.min(56, tileWidth + 8))
  const fontSize = Math.max(12, Math.min(24, Math.floor(tileWidth * 0.5)))

  return { gap, tileWidth, tileHeight, fontSize }
}

type TextOrderingTileProps = {
  index: number
  itemId: string
  label: string
  isLetterOrdering: boolean
  isPhraseOrdering: boolean
  disabled: boolean
}

function TextOrderingTile({ index, itemId, label, isLetterOrdering, isPhraseOrdering, disabled }: TextOrderingTileProps) {
  const dragControls = useDragControls()

  return (
    <Reorder.Item
      value={itemId}
      dragListener={false}
      dragControls={dragControls}
      dragConstraints={isLetterOrdering ? { left: 0, right: 0 } : { top: 0, bottom: 0 }}
      className={cn(
        "rounded-2xl border border-border bg-background shadow-sm",
        isLetterOrdering
          ? "relative flex h-24 w-24 shrink-0 touch-pan-x items-center justify-center p-3"
          : isPhraseOrdering
            ? "flex w-full touch-pan-y items-center gap-3 rounded-2xl border-b-4 border-b-border/80 px-4 py-3"
            : "flex touch-pan-y items-center gap-3 p-4",
        disabled && "pointer-events-none"
      )}
    >
      {isLetterOrdering ? (
        <>
          <div className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
            {index + 1}
          </div>
          <div className="flex items-center justify-center text-center text-3xl font-black uppercase leading-none text-foreground">
            {label || "?"}
          </div>
        </>
      ) : isPhraseOrdering ? (
        <>
          <div className="flex h-7 min-w-7 items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-bold text-primary">
            {index + 1}
          </div>
          <div className="flex-1 text-left text-sm font-bold leading-none text-foreground">
            {label || "Word"}
          </div>
        </>
      ) : (
        <>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
            {index + 1}
          </div>
          <div className="flex-1 text-base font-semibold text-foreground">
            {label || "Item"}
          </div>
        </>
      )}
      <button
        type="button"
        onPointerDown={(event) => {
          if (disabled) return
          dragControls.start(event)
        }}
        disabled={disabled}
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/40 text-muted-foreground",
          isLetterOrdering && "absolute bottom-2 right-2 h-8 w-8 rounded-lg",
          isPhraseOrdering && "h-8 w-8 rounded-full border-none bg-transparent text-muted-foreground/80"
        )}
        aria-label="Drag to reorder"
      >
        <GripVertical className={cn("h-5 w-5", isPhraseOrdering && "h-4 w-4")} />
      </button>
    </Reorder.Item>
  )
}

export function GameplayScreen({ gameState, onGameComplete }: GameplayScreenProps) {
  const topic = gameState.topic
  const questions = topic?.questions?.length ? topic.questions : fallbackQuestions

  const [countdownValue, setCountdownValue] = useState<3 | 2 | 1 | "go">(3)
  const [showCountdown, setShowCountdown] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [draft, setDraft] = useState<AnswerDraft>(emptyDraft)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")
  const [selectedPhraseSwapId, setSelectedPhraseSwapId] = useState<string | null>(null)
  const [draggedMatchOption, setDraggedMatchOption] = useState<string | null>(null)
  const [activeDropZone, setActiveDropZone] = useState<string | null>(null)
  const [dragPoint, setDragPoint] = useState<{ x: number; y: number } | null>(null)
  const [localGameState, setLocalGameState] = useState(gameState)
  const audioContextRef = useRef<AudioContext | null>(null)
  const applauseAudioRef = useRef<HTMLAudioElement | null>(null)
  const matchBoardRef = useRef<HTMLDivElement | null>(null)
  const matchOptionRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const matchTargetRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100
  const countdownHeadline = countdownValue === "go" ? "Let's go!" : "Are you ready?"
  const countdownSubcopy =
    countdownValue === "go"
      ? "Jump in and have fun!"
      : "Count with us... your challenge starts in"
  const fillOptions = useMemo(
    () => (question.type === "fill_in_blank" ? createFillOptions(question) : {}),
    [question]
  )
  const shuffledChoiceOptions = useMemo(
    () =>
      question.type === "single_choice" ||
      question.type === "multiple_choice" ||
      question.type === "listen_and_select" ||
      question.type === "listen_and_select_text" ||
      question.type === "listen_and_select_image" ||
      question.type === "image_selection" ||
      question.type === "image_multiple_selection"
        ? shuffleArray(question.options)
        : [],
    [question]
  )
  const shuffledMatchOptions = useMemo(
    () => (question.type === "match_items" ? shuffleArray(question.pairs.map((pair) => pair.right)) : []),
    [question]
  )
  const shuffledOrderingItems = useMemo(
    () =>
      question.type === "single_text_ordering" ||
      question.type === "phrase_ordering" ||
      question.type === "text_ordering" ||
      question.type === "image_ordering"
        ? shuffleArray(question.items)
        : [],
    [question]
  )

  useEffect(() => {
    setShowCountdown(true)
    setCountdownValue(3)
    setLocalGameState((prev) => ({
      ...prev,
      startedAt: undefined,
    }))

    const countdownTimers = [3, 2, 1].map((value, index) =>
      window.setTimeout(() => {
        setCountdownValue(value as 3 | 2 | 1)
      }, index * 900)
    )

    const goTimer = window.setTimeout(() => {
      setCountdownValue("go")
    }, 2700)

    const finishTimer = window.setTimeout(() => {
      setShowCountdown(false)
      setLocalGameState((prev) => ({
        ...prev,
        startedAt: Date.now(),
      }))
    }, 3600)

    return () => {
      countdownTimers.forEach((timer) => window.clearTimeout(timer))
      window.clearTimeout(goTimer)
      window.clearTimeout(finishTimer)
    }
  }, [])

  const playFeedbackSound = (correct: boolean) => {
    if (typeof window === "undefined") return

    const AudioContextClass = window.AudioContext || (window as typeof window & {
      webkitAudioContext?: typeof AudioContext
    }).webkitAudioContext

    if (!AudioContextClass) return

    const context = audioContextRef.current ?? new AudioContextClass()
    audioContextRef.current = context

    if (context.state === "suspended") {
      void context.resume()
    }

    const now = context.currentTime
    const createNote = (
      frequency: number,
      startTime: number,
      duration: number,
      type: OscillatorType,
      volume: number
    ) => {
      const oscillator = context.createOscillator()
      const gainNode = context.createGain()

      oscillator.type = type
      oscillator.frequency.setValueAtTime(frequency, startTime)
      gainNode.gain.setValueAtTime(0.0001, startTime)
      gainNode.gain.exponentialRampToValueAtTime(volume, startTime + 0.015)
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

      oscillator.connect(gainNode)
      gainNode.connect(context.destination)
      oscillator.start(startTime)
      oscillator.stop(startTime + duration)
    }

    if (correct) {
      ;[
        { frequency: 523.25, start: now, duration: 0.12, type: "triangle" as const, volume: 0.12 },
        { frequency: 659.25, start: now + 0.1, duration: 0.12, type: "triangle" as const, volume: 0.12 },
        { frequency: 783.99, start: now + 0.2, duration: 0.16, type: "sine" as const, volume: 0.14 },
        { frequency: 1046.5, start: now + 0.28, duration: 0.22, type: "sine" as const, volume: 0.1 },
      ].forEach((note) => createNote(note.frequency, note.start, note.duration, note.type, note.volume))
    } else {
      ;[
        { frequency: 392, start: now, duration: 0.14, type: "sine" as const, volume: 0.09 },
        { frequency: 329.63, start: now + 0.12, duration: 0.18, type: "triangle" as const, volume: 0.08 },
      ].forEach((note) => createNote(note.frequency, note.start, note.duration, note.type, note.volume))
    }
  }

  const playCompletionApplause = () => {
    const playSynthApplause = () => {
      if (typeof window === "undefined") return

      const AudioContextClass = window.AudioContext || (window as typeof window & {
        webkitAudioContext?: typeof AudioContext
      }).webkitAudioContext

      if (!AudioContextClass) return

      const context = audioContextRef.current ?? new AudioContextClass()
      audioContextRef.current = context

      if (context.state === "suspended") {
        void context.resume()
      }

      const now = context.currentTime

      for (let i = 0; i < 14; i += 1) {
        const burstTime = now + i * 0.085
        const buffer = context.createBuffer(1, context.sampleRate * 0.08, context.sampleRate)
        const channelData = buffer.getChannelData(0)

        for (let j = 0; j < channelData.length; j += 1) {
          const fade = 1 - j / channelData.length
          channelData[j] = (Math.random() * 2 - 1) * fade
        }

        const source = context.createBufferSource()
        source.buffer = buffer
        const gainNode = context.createGain()

        gainNode.gain.setValueAtTime(0.0001, burstTime)
        gainNode.gain.exponentialRampToValueAtTime(0.11, burstTime + 0.01)
        gainNode.gain.exponentialRampToValueAtTime(0.0001, burstTime + 0.08)

        source.connect(gainNode)
        gainNode.connect(context.destination)
        source.start(burstTime)
        source.stop(burstTime + 0.08)
      }
    }

    if (typeof window !== "undefined") {
      const applause = applauseAudioRef.current ?? new Audio("/audio/clapping.mp3")
      applauseAudioRef.current = applause
      applause.currentTime = 0
      applause.volume = 0.6
      void applause.play().catch(() => {
        playSynthApplause()
      })
      return
    }

    playSynthApplause()
  }

  const speakPrompt = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "en-US"
    utterance.rate = 0.9
    window.speechSynthesis.speak(utterance)
  }

  const getCorrectSummary = (current: TopicQuestion): string => {
    if (current.type === "single_choice" || current.type === "listen_and_select" || current.type === "listen_and_select_text" || current.type === "listen_and_select_image" || current.type === "image_selection") {
      return current.options.find((option) => option.isCorrect)?.text || "Correct image"
    }
    if (current.type === "multiple_choice" || current.type === "image_multiple_selection") {
      return current.options.filter((option) => option.isCorrect).map((option) => option.text).join(", ")
    }
    if (current.type === "single_text_ordering" || current.type === "phrase_ordering" || current.type === "text_ordering" || current.type === "image_ordering") {
      return current.items.map((item) => item.text || "Item").join(" -> ")
    }
    if (current.type === "fill_in_blank") {
      return current.word
    }
    return current.pairs.map((pair) => `${pair.left} -> ${pair.right}`).join(" | ")
  }

  const evaluateCurrentAnswer = (): { correct: boolean; selectedSummary: string } => {
    if (question.type === "single_choice" || question.type === "listen_and_select" || question.type === "listen_and_select_text" || question.type === "listen_and_select_image" || question.type === "image_selection") {
      const selectedId = draft.choiceIds[0]
      const selectedOption = question.options.find((option) => option.id === selectedId)
      return {
        correct: Boolean(selectedOption?.isCorrect),
        selectedSummary: selectedOption?.text || "Image option",
      }
    }

    if (question.type === "multiple_choice" || question.type === "image_multiple_selection") {
      const selected = new Set(draft.choiceIds)
      const correctIds = new Set(question.options.filter((option) => option.isCorrect).map((option) => option.id))
      const selectedSummary = question.options
        .filter((option) => selected.has(option.id))
        .map((option) => option.text || "Image option")
        .join(", ")

      return {
        correct:
          selected.size === correctIds.size &&
          [...selected].every((selectedId) => correctIds.has(selectedId)),
        selectedSummary,
      }
    }

    if (question.type === "fill_in_blank") {
      const selectedSummary = question.hiddenIndexes
        .map((index) => draft.fillAnswers[index] || "_")
        .join("")
      const correct = question.hiddenIndexes.every(
        (index) => (draft.fillAnswers[index] || "").toUpperCase() === question.word[index]?.toUpperCase()
      )
      return { correct, selectedSummary }
    }

    if (question.type === "single_text_ordering" || question.type === "phrase_ordering" || question.type === "text_ordering" || question.type === "image_ordering") {
      const correctOrder = question.items.map((item) => item.id)
      const selectedSummary = draft.orderingIds
        .map((itemId) => question.items.find((item) => item.id === itemId)?.text || "Item")
        .join(question.type === "single_text_ordering" ? "" : " -> ")

      return {
        correct:
          draft.orderingIds.length === correctOrder.length &&
          draft.orderingIds.every((itemId, index) => itemId === correctOrder[index]),
        selectedSummary,
      }
    }

    const selectedSummary = question.pairs
      .map((pair) => `${pair.left} -> ${draft.matchAnswers[pair.id] || "-"}`)
      .join(" | ")
    const correct = question.pairs.every((pair) => draft.matchAnswers[pair.id] === pair.right)
    return { correct, selectedSummary }
  }

  const commitAnswer = () => {
    if (showFeedback) return

    const { correct, selectedSummary } = evaluateCurrentAnswer()
    setIsCorrect(correct)
    setShowFeedback(true)
    setFeedbackText(correct ? question.explanation || "Muy bien, sigue asi." : getCorrectSummary(question))
    playFeedbackSound(correct)

    if (correct) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#7c3aed", "#2dd4bf", "#fbbf24", "#22c55e"],
      })
    }

    setLocalGameState((prev) => ({
      ...prev,
      correctAnswers: correct ? prev.correctAnswers + 1 : prev.correctAnswers,
      answers: [
        ...prev.answers,
        {
          questionId: question.id,
          id: question.id,
          question: question.prompt,
          correct,
          isCorrect: correct,
          selected: selectedSummary,
        },
      ],
    }))
  }

  const handleChoiceClick = (choiceId: string) => {
    if (showFeedback) return

    if (question.type === "single_choice" || question.type === "listen_and_select" || question.type === "listen_and_select_text" || question.type === "listen_and_select_image" || question.type === "image_selection") {
      setDraft({ choiceIds: [choiceId], fillAnswers: {}, matchAnswers: {}, orderingIds: [] })
      setTimeout(() => {
        setDraft((currentDraft) => ({ ...currentDraft, choiceIds: [choiceId] }))
        const selectedOption = question.options.find((option) => option.id === choiceId)
        if (selectedOption) {
          const correct = selectedOption.isCorrect
          setIsCorrect(correct)
          setShowFeedback(true)
          setFeedbackText(correct ? question.explanation || "Muy bien, sigue asi." : getCorrectSummary(question))
          playFeedbackSound(correct)
          if (correct) {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ["#7c3aed", "#2dd4bf", "#fbbf24", "#22c55e"],
            })
          }
          setLocalGameState((prev) => ({
            ...prev,
            correctAnswers: correct ? prev.correctAnswers + 1 : prev.correctAnswers,
            answers: [
              ...prev.answers,
              {
                questionId: question.id,
                id: question.id,
                question: question.prompt,
                correct,
                isCorrect: correct,
                selected: selectedOption.text || "Image option",
              },
            ],
          }))
        }
      }, 0)
      return
    }

    setDraft((currentDraft) => {
      const alreadySelected = currentDraft.choiceIds.includes(choiceId)
      return {
        ...currentDraft,
        choiceIds: alreadySelected
          ? currentDraft.choiceIds.filter((id) => id !== choiceId)
          : [...currentDraft.choiceIds, choiceId],
      }
    })
  }

  const addImageOrderingItem = (itemId: string) => {
    if (showFeedback || question.type !== "image_ordering") return

    setDraft((currentDraft) => {
      if (currentDraft.orderingIds.includes(itemId) || currentDraft.orderingIds.length >= question.items.length) {
        return currentDraft
      }

      return { ...currentDraft, orderingIds: [...currentDraft.orderingIds, itemId] }
    })
  }

  const removeImageOrderingItem = (slotIndex: number) => {
    if (showFeedback || question.type !== "image_ordering") return

    setDraft((currentDraft) => ({
      ...currentDraft,
      orderingIds: currentDraft.orderingIds.filter((_, index) => index !== slotIndex),
    }))
  }

  const addSingleTextOrderingItem = (itemId: string) => {
    if (showFeedback || question.type !== "single_text_ordering") return

    setDraft((currentDraft) => {
      if (currentDraft.orderingIds.includes(itemId) || currentDraft.orderingIds.length >= question.items.length) {
        return currentDraft
      }

      return { ...currentDraft, orderingIds: [...currentDraft.orderingIds, itemId] }
    })
  }

  const removeSingleTextOrderingItem = (slotIndex: number) => {
    if (showFeedback || question.type !== "single_text_ordering") return

    setDraft((currentDraft) => ({
      ...currentDraft,
      orderingIds: currentDraft.orderingIds.filter((_, index) => index !== slotIndex),
    }))
  }

  const handlePhraseSwapClick = (itemId: string) => {
    if (showFeedback || (question.type !== "phrase_ordering" && question.type !== "text_ordering")) return

    if (!selectedPhraseSwapId) {
      setSelectedPhraseSwapId(itemId)
      return
    }

    if (selectedPhraseSwapId === itemId) {
      setSelectedPhraseSwapId(null)
      return
    }

    setDraft((currentDraft) => {
      const nextOrderingIds = [...currentDraft.orderingIds]
      const firstIndex = nextOrderingIds.indexOf(selectedPhraseSwapId)
      const secondIndex = nextOrderingIds.indexOf(itemId)

      if (firstIndex === -1 || secondIndex === -1) {
        return currentDraft
      }

      ;[nextOrderingIds[firstIndex], nextOrderingIds[secondIndex]] = [nextOrderingIds[secondIndex], nextOrderingIds[firstIndex]]

      return { ...currentDraft, orderingIds: nextOrderingIds }
    })

    setSelectedPhraseSwapId(null)
  }

  const moveOrderingItem = (fromIndex: number, toIndex: number) => {
    if (showFeedback || toIndex < 0 || toIndex >= draft.orderingIds.length) return

    setDraft((currentDraft) => {
      const nextOrderingIds = [...currentDraft.orderingIds]
      const [movedItem] = nextOrderingIds.splice(fromIndex, 1)
      if (!movedItem) return currentDraft
      nextOrderingIds.splice(toIndex, 0, movedItem)
      return { ...currentDraft, orderingIds: nextOrderingIds }
    })
  }

  const isAnswerReady =
    question.type === "multiple_choice" || question.type === "image_multiple_selection"
      ? draft.choiceIds.length > 0
      : question.type === "single_text_ordering" || question.type === "phrase_ordering" || question.type === "text_ordering" || question.type === "image_ordering"
        ? draft.orderingIds.length === question.items.length
      : question.type === "fill_in_blank"
        ? question.hiddenIndexes.every((index) => draft.fillAnswers[index])
        : question.type === "match_items"
          ? question.pairs.every((pair) => draft.matchAnswers[pair.id])
          : draft.choiceIds.length > 0

  useEffect(() => {
    if (question.type === "image_ordering" || question.type === "single_text_ordering") {
      setDraft({
        choiceIds: [],
        fillAnswers: {},
        matchAnswers: {},
        orderingIds: [],
      })
      setSelectedPhraseSwapId(null)
      return
    }

    if (question.type === "phrase_ordering" || question.type === "text_ordering") {
      setDraft({
        choiceIds: [],
        fillAnswers: {},
        matchAnswers: {},
        orderingIds: shuffledOrderingItems.map((item) => item.id),
      })
      setSelectedPhraseSwapId(null)
      return
    }

    setDraft(emptyDraft())
    setSelectedPhraseSwapId(null)
  }, [question, shuffledOrderingItems])

  useEffect(() => {
    if (!showFeedback) return

    const timer = setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1)
        setDraft(emptyDraft())
        setShowFeedback(false)
        setFeedbackText("")
        setSelectedPhraseSwapId(null)
      } else {
        onGameComplete({
          ...localGameState,
          currentQuestion: currentQuestion + 1,
          totalQuestions: questions.length,
        })
      }
    }, 1500)

    return () => clearTimeout(timer)
  }, [showFeedback, currentQuestion, localGameState, onGameComplete, questions.length])

  useEffect(() => {
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        void audioContextRef.current.close()
      }
      if (applauseAudioRef.current) {
        applauseAudioRef.current.pause()
        applauseAudioRef.current.currentTime = 0
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  useEffect(() => {
    if (!draggedMatchOption) return

    const updateDropZone = (clientX: number, clientY: number) => {
      const targetElement = document.elementFromPoint(clientX, clientY)?.closest<HTMLElement>("[data-match-target-id]")
      setActiveDropZone(targetElement?.dataset.matchTargetId || null)
    }

    const handlePointerMove = (event: PointerEvent) => {
      const board = matchBoardRef.current
      if (!board) return

      const rect = board.getBoundingClientRect()
      setDragPoint({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      })
      updateDropZone(event.clientX, event.clientY)
    }

    const handlePointerUp = () => {
      if (draggedMatchOption && activeDropZone) {
        setDraft((currentDraft) => {
          const nextAnswers = { ...currentDraft.matchAnswers }

          Object.entries(nextAnswers).forEach(([currentPairId, currentOption]) => {
            if (currentOption === draggedMatchOption) {
              delete nextAnswers[currentPairId]
            }
          })

          nextAnswers[activeDropZone] = draggedMatchOption

          return { ...currentDraft, matchAnswers: nextAnswers }
        })
      }

      setDraggedMatchOption(null)
      setActiveDropZone(null)
      setDragPoint(null)
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [activeDropZone, draggedMatchOption])

  const renderChoiceQuestion = (
    current: MultipleChoiceQuestion | SingleChoiceQuestion | ListenAndSelectQuestion | ListenAndSelectTextQuestion
  ) => {
    const renderedOptions = current.id === question.id ? shuffledChoiceOptions : current.options

    return (
      <div className="space-y-3">
        {renderedOptions.map((option) => {
          const isSelected = draft.choiceIds.includes(option.id)
          const isCorrectOption = option.isCorrect

          let buttonStyle = "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          if (showFeedback) {
            if (isCorrectOption) {
              buttonStyle = "bg-green-500 text-white hover:bg-green-500"
            } else if (isSelected) {
              buttonStyle = "bg-red-400 text-white hover:bg-red-400"
            } else {
              buttonStyle = "bg-muted text-muted-foreground hover:bg-muted"
            }
          } else if (isSelected) {
            buttonStyle = "bg-primary text-primary-foreground hover:bg-primary"
          }

        return (
          <Button
            key={option.id}
            variant="ghost"
            size="lg"
            onClick={() => handleChoiceClick(option.id)}
            disabled={showFeedback}
            className={cn("min-h-16 w-full whitespace-normal rounded-xl px-4 py-4 text-base font-semibold", buttonStyle)}
          >
            <div className="flex w-full flex-col items-center gap-3 text-center">
              {option.text && <span>{option.text}</span>}
            </div>
          </Button>
        )
      })}
      </div>
    )
  }

  const renderImageSelectionQuestion = (
    current: ImageSelectionQuestion | ListenAndSelectImageQuestion,
    options?: { mobileTwoByTwo?: boolean }
  ) => {
    const renderedOptions = current.id === question.id ? shuffledChoiceOptions : current.options

    return (
      <div className={cn("grid gap-4 sm:grid-cols-2", (options?.mobileTwoByTwo || current.type === "image_selection") && "grid-cols-2")}>
        {renderedOptions.map((option) => {
          const isSelected = draft.choiceIds.includes(option.id)
          const isCorrectOption = option.isCorrect

          let imageStateClass = "border-border/70 hover:border-primary/40"
          if (showFeedback) {
            if (isCorrectOption) {
              imageStateClass = "border-green-500 ring-4 ring-green-200"
            } else if (isSelected) {
              imageStateClass = "border-red-400 ring-4 ring-red-200"
            } else {
              imageStateClass = "border-border/40 opacity-75"
            }
          } else if (isSelected) {
            imageStateClass = "border-primary ring-4 ring-primary/20"
          }

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleChoiceClick(option.id)}
              disabled={showFeedback}
              className="group text-left"
            >
              <div className={cn(
                "mx-auto max-w-[150px] overflow-hidden rounded-3xl border-2 bg-white shadow-sm transition-all sm:max-w-[170px]",
                (options?.mobileTwoByTwo || current.type === "image_selection") && "max-w-[130px]"
              , imageStateClass)}>
                <div className="aspect-[4/3] w-full bg-muted/20">
                  {option.imageUrl?.trim() ? (
                    <img
                      src={option.imageUrl}
                      alt={option.text || "Image answer option"}
                      className="h-full w-full object-contain"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-4 text-center text-sm font-medium text-muted-foreground">
                      Add an image URL for this option
                    </div>
                  )}
                </div>
              </div>
              {option.text && (
                <p className="mt-2 text-center text-sm font-medium text-foreground">{option.text}</p>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  const renderImageMultipleSelectionQuestion = (current: ImageMultipleSelectionQuestion) => {
    const renderedOptions = current.id === question.id ? shuffledChoiceOptions : current.options

    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
          {renderedOptions.map((option) => {
            const isSelected = draft.choiceIds.includes(option.id)
            const isCorrectOption = option.isCorrect

            let imageStateClass = "border-border/70 hover:border-primary/40"
            if (showFeedback) {
              if (isCorrectOption) {
                imageStateClass = "border-green-500 ring-4 ring-green-200"
              } else if (isSelected) {
                imageStateClass = "border-red-400 ring-4 ring-red-200"
              } else {
                imageStateClass = "border-border/40 opacity-75"
              }
            } else if (isSelected) {
              imageStateClass = "border-primary ring-4 ring-primary/20"
            }

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleChoiceClick(option.id)}
                disabled={showFeedback}
                className="group text-left"
              >
                <div className={cn("mx-auto max-w-[130px] overflow-hidden rounded-3xl border-2 bg-white shadow-sm transition-all sm:max-w-[170px]", imageStateClass)}>
                  <div className="aspect-[4/3] w-full bg-muted/20">
                    {option.imageUrl?.trim() ? (
                      <img
                        src={option.imageUrl}
                        alt={option.text || "Image answer option"}
                        className="h-full w-full object-contain"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-4 text-center text-sm font-medium text-muted-foreground">
                        Add an image URL for this option
                      </div>
                    )}
                  </div>
                </div>
                {option.text && (
                  <p className="mt-2 text-center text-sm font-medium text-foreground">{option.text}</p>
                )}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const renderFillInBlank = (current: FillInBlankQuestion) => {
    const characters = current.word.split("")
    const fillInBlankMetrics = getFillInBlankMetrics(characters.length)

    return (
      <div className="space-y-6">
        <div
          className="flex flex-nowrap justify-center"
          style={{ gap: `${fillInBlankMetrics.gap}px` }}
        >
          {characters.map((character, index) => {
            const isHidden = current.hiddenIndexes.includes(index)
            const selectedLetter = draft.fillAnswers[index]

            return (
              <div
                key={`${character}-${index}`}
                className={cn(
                  "flex shrink-0 items-center justify-center rounded-2xl border font-black",
                  showFeedback && isCorrect
                    ? "border-green-500 bg-green-100 text-green-700"
                    : isHidden
                      ? "border-dashed border-primary/40 bg-primary/5 text-primary"
                      : "border-border bg-muted text-foreground"
                )}
                style={{
                  width: `${fillInBlankMetrics.tileWidth}px`,
                  height: `${fillInBlankMetrics.tileHeight}px`,
                  fontSize: `${fillInBlankMetrics.fontSize}px`,
                }}
              >
                {isHidden ? selectedLetter || "_" : character}
              </div>
            )
          })}
        </div>

        <div className="space-y-4">
          {current.hiddenIndexes.map((index) => (
            <div key={index} className="rounded-2xl bg-muted/50 p-4">
              <p className="mb-3 text-sm font-semibold text-muted-foreground">Choose the letter for blank {index + 1}</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {fillOptions[index]?.map((letter) => {
                  const isSelected = draft.fillAnswers[index] === letter

                  return (
                    <Button
                      key={`${index}-${letter}`}
                      variant="ghost"
                      onClick={() => setDraft((currentDraft) => ({
                        ...currentDraft,
                        fillAnswers: { ...currentDraft.fillAnswers, [index]: letter },
                      }))}
                      disabled={showFeedback}
                      className={cn(
                        "h-14 rounded-xl text-xl font-black",
                        showFeedback && isCorrect
                          ? "bg-green-500 text-white hover:bg-green-500"
                          : isSelected
                            ? "bg-primary text-primary-foreground hover:bg-primary"
                            : "bg-background hover:bg-muted"
                      )}
                    >
                      {letter}
                    </Button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderListenAndSelect = (current: ListenAndSelectQuestion | ListenAndSelectTextQuestion) => (
    <div className="space-y-4">
      <div className="rounded-2xl bg-primary/5 p-4 text-center">
        <Button
          type="button"
          variant="outline"
          onClick={() => speakPrompt(current.audioText)}
          className="rounded-xl"
        >
          <Volume2 className="mr-2 h-4 w-4" />
          Listen
        </Button>
      </div>
      {renderChoiceQuestion(current)}
    </div>
  )

  const renderListenAndSelectImage = (current: ListenAndSelectImageQuestion) => (
    <div className="space-y-4">
      <div className="rounded-2xl bg-primary/5 p-4 text-center">
        <Button
          type="button"
          variant="outline"
          onClick={() => speakPrompt(current.audioText)}
          className="rounded-xl"
        >
          <Volume2 className="mr-2 h-4 w-4" />
          Listen
        </Button>
      </div>
      {renderImageSelectionQuestion(current, { mobileTwoByTwo: true })}
    </div>
  )

  const renderTextOrderingQuestion = (current: SingleTextOrderingQuestion | PhraseOrderingQuestion | TextOrderingQuestion) => {
    const orderedItems = draft.orderingIds
      .map((itemId) => current.items.find((item) => item.id === itemId))
      .filter((item): item is TextOrderingQuestion["items"][number] => Boolean(item))
  const isLetterOrdering = current.type === "single_text_ordering"
  const isPhraseOrdering = current.type === "phrase_ordering" || current.type === "text_ordering"
  const availableItems = shuffledOrderingItems.filter((item) => !draft.orderingIds.includes(item.id))
  const singleTextOrderingMetrics = getSingleTextOrderingMetrics(current.items.length)

    return (
      <div className="space-y-4">
        <p className="rounded-2xl bg-muted/50 p-4 text-sm text-muted-foreground">
          {isLetterOrdering
            ? "Tap the letters below to build the correct word. Tap a filled slot to remove it."
            : isPhraseOrdering
              ? "Tap one word and then another to swap their positions."
              : "Press and drag each item to place it in the correct order."}
        </p>
        {isLetterOrdering ? (
          <div className="space-y-4">
            <div className="space-y-3">
              <p className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Word slots
              </p>
              <div
                className="flex flex-nowrap justify-center"
                style={{ gap: `${singleTextOrderingMetrics.gap}px` }}
              >
                {Array.from({ length: current.items.length }).map((_, index) => {
                  const item = orderedItems[index]

                  return (
                    <button
                      key={`letter-slot-${index}`}
                      type="button"
                      onClick={() => item && removeSingleTextOrderingItem(index)}
                      disabled={showFeedback || !item}
                      className={cn(
                        "flex shrink-0 items-center justify-center rounded-2xl border border-dashed font-black uppercase shadow-sm transition-colors",
                        showFeedback && isCorrect
                          ? "border-green-500 bg-green-100 text-green-700"
                          : item
                            ? "border-primary/30 bg-background text-foreground"
                            : "border-border bg-muted/15 text-muted-foreground/45"
                      )}
                      style={{
                        width: `${singleTextOrderingMetrics.tileSize}px`,
                        height: `${singleTextOrderingMetrics.tileSize}px`,
                        fontSize: `${singleTextOrderingMetrics.fontSize}px`,
                      }}
                    >
                      {item ? item.text : `${index + 1}`}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Letter bank
              </p>
              <div
                className="flex flex-nowrap justify-center"
                style={{ gap: `${singleTextOrderingMetrics.gap}px` }}
              >
                {availableItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => addSingleTextOrderingItem(item.id)}
                    disabled={showFeedback}
                    className={cn(
                      "flex shrink-0 items-center justify-center rounded-2xl border font-black uppercase shadow-sm transition-transform hover:scale-[1.02]",
                      showFeedback && isCorrect
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-border bg-background text-foreground"
                    )}
                    style={{
                      width: `${singleTextOrderingMetrics.tileSize}px`,
                      height: `${singleTextOrderingMetrics.tileSize}px`,
                      fontSize: `${singleTextOrderingMetrics.fontSize}px`,
                    }}
                  >
                    {item.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : isPhraseOrdering ? (
          <div className="mx-auto flex w-full max-w-md flex-col gap-3">
            {orderedItems.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handlePhraseSwapClick(item.id)}
                disabled={showFeedback}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border border-border border-b-4 border-b-border/80 bg-background px-4 py-3 text-left shadow-sm transition-colors",
                  showFeedback && isCorrect && "border-green-500 border-b-green-600 bg-green-100",
                  selectedPhraseSwapId === item.id && "border-primary bg-primary/10"
                )}
              >
                <div className="flex h-7 min-w-7 items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-bold text-primary">
                  {index + 1}
                </div>
                <div className="flex-1 text-sm font-bold leading-none text-foreground">
                  {item.text || "Word"}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <Reorder.Group
            axis="x"
            values={draft.orderingIds}
            onReorder={(nextOrderingIds) =>
              !showFeedback &&
              setDraft((currentDraft) => ({ ...currentDraft, orderingIds: nextOrderingIds }))
            }
            className="mx-auto flex w-fit max-w-full gap-3 overflow-x-auto pb-2"
          >
            {orderedItems.map((item, index) => (
              <TextOrderingTile
                key={item.id}
                index={index}
                itemId={item.id}
                label={item.text}
                isLetterOrdering={isLetterOrdering}
                isPhraseOrdering={false}
                disabled={showFeedback}
              />
            ))}
          </Reorder.Group>
        )}
      </div>
    )
  }

  const renderImageOrderingQuestion = (current: ImageOrderingQuestion) => {
    const selectedItems = draft.orderingIds
      .map((itemId) => current.items.find((item) => item.id === itemId))
      .filter((item): item is ImageOrderingQuestion["items"][number] => Boolean(item))
    const availableItems = shuffledOrderingItems.filter(
      (item) => !draft.orderingIds.includes(item.id)
    )
    const totalSlots = current.items.length

    return (
      <div className="space-y-4">
        <p className="rounded-2xl bg-muted/50 p-4 text-sm text-muted-foreground">
          Tap the images below to place them in the correct order. Tap a filled slot to remove it.
        </p>
        <div className="space-y-3">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Order slots
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: totalSlots }).map((_, index) => {
              const item = selectedItems[index]

              return (
                <button
                  key={`slot-${index}`}
                  type="button"
                  onClick={() => item && removeImageOrderingItem(index)}
                  disabled={showFeedback || !item}
                  className={cn(
                    "mx-auto w-fit overflow-hidden rounded-3xl border border-dashed bg-background shadow-sm transition-colors",
                    showFeedback && isCorrect
                      ? "border-green-500 bg-green-50"
                      : item
                        ? "border-primary/30"
                        : "border-border"
                  )}
                >
                  <div className="flex h-7 items-center justify-center bg-muted/30 text-[11px] font-bold text-muted-foreground">
                    {index + 1}
                  </div>
                  <div className="aspect-square w-full max-w-[96px] bg-muted/20 sm:max-w-[110px]">
                    {item?.imageUrl?.trim() ? (
                      <img
                        src={item.imageUrl}
                        alt={item.text || `Selected image ${index + 1}`}
                        className="h-full w-full object-contain"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-3 text-center text-xs font-medium text-muted-foreground">
                        Tap an image below
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Image bank
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {availableItems.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => addImageOrderingItem(item.id)}
                disabled={showFeedback}
                className={cn(
                  "mx-auto w-fit overflow-hidden rounded-3xl border shadow-sm transition-transform hover:scale-[1.02]",
                  showFeedback && isCorrect
                    ? "border-green-500 bg-green-50"
                    : "border-border bg-background"
                )}
              >
                <div className="aspect-square w-full max-w-[96px] bg-muted/20 sm:max-w-[110px]">
                  {item.imageUrl?.trim() ? (
                    <img
                      src={item.imageUrl}
                      alt={item.text || `Ordering option ${index + 1}`}
                      className="h-full w-full object-contain"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-3 text-center text-xs font-medium text-muted-foreground">
                      Add an image URL for this item
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderMatchItems = (current: MatchItemsQuestion) => {
    const rightOptions = shuffledMatchOptions
    const assignedOptions = Object.values(draft.matchAnswers)
    const getRelativePoint = (element: HTMLElement | null) => {
      const board = matchBoardRef.current
      if (!board || !element) return null

      const boardRect = board.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()

      return {
        left: elementRect.left - boardRect.left,
        right: elementRect.right - boardRect.left,
        y: elementRect.top - boardRect.top + elementRect.height / 2,
      }
    }

    const committedLines = current.pairs
      .map((pair) => {
        const option = draft.matchAnswers[pair.id]
        if (!option) return null

        const from = getRelativePoint(matchOptionRefs.current[option])
        const to = getRelativePoint(matchTargetRefs.current[pair.id])

        if (!from || !to) return null
        return { id: pair.id, from, to }
      })
      .filter((line): line is NonNullable<typeof line> => Boolean(line))

    const previewStart = draggedMatchOption ? getRelativePoint(matchOptionRefs.current[draggedMatchOption]) : null
    const previewEnd =
      activeDropZone && draggedMatchOption
        ? getRelativePoint(matchTargetRefs.current[activeDropZone])
        : dragPoint

    return (
      <div ref={matchBoardRef} className="relative space-y-4">
        <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
          {committedLines.map((line) => (
            <line
              key={line.id}
              x1={line.from.right}
              y1={line.from.y}
              x2={line.to.left}
              y2={line.to.y}
              stroke="#6366F1"
              strokeWidth="4"
              strokeLinecap="round"
            />
          ))}
          {previewStart && previewEnd && (
            <line
              x1={previewStart.right}
              y1={previewStart.y}
              x2={"left" in previewEnd ? previewEnd.left : previewEnd.x}
              y2={previewEnd.y}
              stroke="#EC4899"
              strokeWidth="4"
              strokeDasharray="10 8"
              strokeLinecap="round"
            />
          )}
        </svg>

        <p className="rounded-2xl bg-muted/50 p-4 text-sm text-muted-foreground">{current.instruction}</p>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 sm:gap-4">
          <div className="space-y-3">
            <p className="text-center text-sm font-medium text-muted-foreground">Words</p>
            {rightOptions.map((option) => {
              const isUsed = assignedOptions.includes(option)

              return (
                <div
                  key={option}
                    className={cn(
                      "mx-auto w-full max-w-[180px] rounded-xl border shadow-sm transition-all sm:max-w-[220px]",
                      showFeedback && isCorrect && "border-green-500 bg-green-50",
                      isUsed ? "border-primary/20 bg-primary/5" : "border-border bg-background"
                    )}
                >
                  <button
                    type="button"
                    ref={(element) => {
                      matchOptionRefs.current[option] = element
                    }}
                    onPointerDown={(event) => {
                      if (showFeedback) return

                      const board = matchBoardRef.current
                      if (!board) return

                      const rect = board.getBoundingClientRect()
                      setDraggedMatchOption(option)
                      setDragPoint({
                        x: event.clientX - rect.left,
                        y: event.clientY - rect.top,
                      })
                    }}
                    disabled={showFeedback}
                    className={cn(
                      "flex min-h-12 w-full touch-none items-center justify-center rounded-xl px-3 py-2 text-center text-sm font-medium transition-all sm:px-4",
                      showFeedback && isCorrect
                        ? "bg-green-500 text-white"
                        : 
                      isUsed
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                      draggedMatchOption === option && "scale-105 bg-pink-100 text-pink-700 shadow-lg"
                    )}
                  >
                    {option}
                  </button>
                </div>
              )
            })}
          </div>

          <div className="space-y-3">
            <p className="text-center text-sm font-medium text-muted-foreground">Answers</p>
            {current.pairs.map((pair) => (
              <div key={pair.id} className="mx-auto w-full max-w-[180px] rounded-xl border border-border bg-background shadow-sm sm:max-w-[220px]">
                <div
                  ref={(element) => {
                    matchTargetRefs.current[pair.id] = element
                  }}
                  data-match-target-id={pair.id}
                  className={cn(
                    "flex min-h-12 w-full items-center justify-center rounded-xl px-3 py-2 text-center text-sm font-medium transition-all sm:px-4",
                    showFeedback && isCorrect
                      ? "bg-green-500 text-white"
                      :
                    activeDropZone === pair.id
                      ? "bg-pink-100 text-pink-700"
                      : "bg-secondary text-secondary-foreground"
                  )}
                >
                  <span>{pair.left}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col px-4 py-6">
      {showCountdown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#4f46e5_0%,#7c3aed_48%,#ec4899_100%)] backdrop-blur-md">
          <style>{`
            @keyframes countdown-bounce {
              0% { transform: scale(.72) rotate(-8deg); opacity: 0; }
              55% { transform: scale(1.08) rotate(4deg); opacity: 1; }
              100% { transform: scale(1) rotate(0); opacity: 1; }
            }
            @keyframes float-cloud {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
            @keyframes twinkle-star {
              0%, 100% { transform: scale(.9) rotate(0deg); opacity: .55; }
              50% { transform: scale(1.15) rotate(12deg); opacity: 1; }
            }
          `}</style>
          <div className="absolute left-[-5rem] top-[-4rem] h-64 w-64 rounded-full bg-yellow-300/25 blur-3xl" />
          <div className="absolute bottom-[-6rem] right-[-4rem] h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl" />
          <div className="absolute left-8 top-20 text-white/80" style={{ animation: "twinkle-star 1.8s ease-in-out infinite" }}>★</div>
          <div className="absolute right-10 top-28 text-yellow-200/90" style={{ animation: "twinkle-star 2.1s ease-in-out infinite" }}>★</div>
          <div className="absolute left-6 top-24 hidden h-20 w-28 rounded-full bg-white/12 blur-sm sm:block" style={{ animation: "float-cloud 3.8s ease-in-out infinite" }} />
          <div className="absolute right-8 top-36 hidden h-16 w-24 rounded-full bg-white/12 blur-sm sm:block" style={{ animation: "float-cloud 4.4s ease-in-out infinite" }} />
          <div className="relative mx-4 flex w-full max-w-md flex-col items-center rounded-[2rem] border-4 border-white/20 bg-white/12 px-6 py-8 text-center text-white shadow-[0_24px_90px_rgba(49,46,129,0.35)]">
            <div className="mb-3 rounded-full bg-white/20 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-yellow-100">
              Challenge Time
            </div>
            <p className="mb-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
              {countdownHeadline}
            </p>
            <p className="mb-6 text-sm font-semibold text-white/85 sm:text-base">
              {countdownSubcopy}
            </p>
            <div className="flex h-48 w-48 items-center justify-center rounded-full border-4 border-white/25 bg-white/10 shadow-[0_24px_90px_rgba(34,211,238,0.3)]">
              <div
                className="flex h-36 w-36 items-center justify-center rounded-full bg-[linear-gradient(135deg,#fbbf24_0%,#fb7185_45%,#60a5fa_100%)] shadow-[0_12px_40px_rgba(251,191,36,.35)]"
                style={{ animation: "countdown-bounce .45s ease both" }}
              >
                <span className="text-5xl font-black tracking-tight text-white sm:text-7xl">
                  {countdownValue === "go" ? "GO!" : countdownValue}
                </span>
              </div>
            </div>
            <p className="mt-6 max-w-sm text-lg font-black tracking-tight text-yellow-100 sm:text-2xl">
              {countdownValue === "go" ? "Let's go!" : "3... 2... 1..."}
            </p>
            <p className="mt-2 max-w-sm text-sm leading-6 text-white/85 sm:text-base">
              {countdownValue === "go"
                ? "Show what you know and earn new rewards!"
                : "Get ready to play, learn, and win badges."}
            </p>
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-3xl flex-1 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Zap className="size-4" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Class Go</p>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{getQuestionTypeLabel(question.type)}</p>
              </div>
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-6 sm:p-8">
            <div className="mb-8 text-center">
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                {topic?.name || "Active challenge"}
              </p>
              {(question.type === "image_selection" || question.type === "image_multiple_selection") && question.imageUrl?.trim() && (
                <div className="mx-auto mb-5 aspect-[4/3] w-full max-w-md overflow-hidden rounded-3xl border border-border/60 bg-muted/30 shadow-sm">
                  <img
                    src={question.imageUrl}
                    alt={question.prompt || "Question image"}
                    className="h-full w-full object-contain"
                    crossOrigin="anonymous"
                  />
                </div>
              )}
              {question.type !== "listen_and_select" && (
                <h2 className="text-2xl font-bold text-foreground sm:text-4xl">{question.prompt}</h2>
              )}
            </div>

            {question.type === "single_choice" && renderChoiceQuestion(question)}
            {question.type === "multiple_choice" && renderChoiceQuestion(question)}
            {question.type === "fill_in_blank" && renderFillInBlank(question)}
            {question.type === "listen_and_select" && renderListenAndSelect(question as ListenAndSelectQuestion)}
            {question.type === "listen_and_select_text" && renderListenAndSelect(question as ListenAndSelectTextQuestion)}
            {question.type === "listen_and_select_image" && renderListenAndSelectImage(question as ListenAndSelectImageQuestion)}
            {question.type === "image_selection" && renderImageSelectionQuestion(question as ImageSelectionQuestion)}
            {question.type === "image_multiple_selection" && renderImageMultipleSelectionQuestion(question as ImageMultipleSelectionQuestion)}
            {question.type === "single_text_ordering" && renderTextOrderingQuestion(question as SingleTextOrderingQuestion)}
            {question.type === "phrase_ordering" && renderTextOrderingQuestion(question as PhraseOrderingQuestion)}
            {question.type === "text_ordering" && renderTextOrderingQuestion(question as TextOrderingQuestion)}
            {question.type === "image_ordering" && renderImageOrderingQuestion(question as ImageOrderingQuestion)}
            {question.type === "match_items" && renderMatchItems(question)}

            {(question.type === "multiple_choice" || question.type === "image_multiple_selection" || question.type === "fill_in_blank" || question.type === "single_text_ordering" || question.type === "phrase_ordering" || question.type === "text_ordering" || question.type === "image_ordering" || question.type === "match_items") && (
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={commitAnswer}
                  disabled={!isAnswerReady || showFeedback}
                  className="min-w-52 rounded-xl px-6 py-6 text-base font-bold"
                >
                  Check answer
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="min-h-24">
          {showFeedback && (
            <Card className={cn("border-0 shadow-lg", isCorrect ? "bg-green-50" : "bg-red-50")}>
              <CardContent className="flex items-start gap-3 p-4">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="mt-0.5 size-8 text-green-500" />
                    <div>
                      <p className="font-bold text-green-700">Correct</p>
                      <p className="text-sm text-green-700">{feedbackText}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="mt-0.5 size-8 text-red-500" />
                    <div>
                      <p className="font-bold text-red-700">Try again next time</p>
                      <p className="text-sm text-red-700">Correct answer: {feedbackText}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
