"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Headphones, RotateCcw, Volume2, XCircle, Zap } from "lucide-react"
import type {
  FillInBlankQuestion,
  MatchItemsQuestion,
  MultipleChoiceQuestion,
  SingleChoiceQuestion,
  TopicQuestion,
  TopicQuestionType,
} from "@/lib/types"
import type { GameState } from "@/app/page"
import { getTopicById } from "@/lib/store"
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
    prompt: "Cuanto es 3 + 4?",
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
      return "Seleccion multiple"
    case "single_choice":
      return "Seleccion unica"
    case "fill_in_blank":
      return "Completar palabra"
    case "listen_and_select":
      return "Escuchar y seleccionar"
    case "match_items":
      return "Relacionar items"
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
}

const emptyDraft = (): AnswerDraft => ({
  choiceIds: [],
  fillAnswers: {},
  matchAnswers: {},
})

export function GameplayScreen({ gameState, onGameComplete }: GameplayScreenProps) {
  const topic = gameState.topicId ? getTopicById(gameState.topicId) : undefined
  const questions = topic?.questions?.length ? topic.questions : fallbackQuestions

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [draft, setDraft] = useState<AnswerDraft>(emptyDraft)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")
  const [localGameState, setLocalGameState] = useState(gameState)
  const audioContextRef = useRef<AudioContext | null>(null)

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100
  const fillOptions = useMemo(
    () => (question.type === "fill_in_blank" ? createFillOptions(question) : {}),
    [question]
  )

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

  const speakPrompt = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "es-ES"
    utterance.rate = 0.9
    window.speechSynthesis.speak(utterance)
  }

  const getCorrectSummary = (current: TopicQuestion): string => {
    if (current.type === "single_choice" || current.type === "listen_and_select") {
      return current.options.find((option) => option.isCorrect)?.text || ""
    }
    if (current.type === "multiple_choice") {
      return current.options.filter((option) => option.isCorrect).map((option) => option.text).join(", ")
    }
    if (current.type === "fill_in_blank") {
      return current.word
    }
    return current.pairs.map((pair) => `${pair.left} -> ${pair.right}`).join(" | ")
  }

  const evaluateCurrentAnswer = (): { correct: boolean; selectedSummary: string } => {
    if (question.type === "single_choice" || question.type === "listen_and_select") {
      const selectedId = draft.choiceIds[0]
      const selectedOption = question.options.find((option) => option.id === selectedId)
      return {
        correct: Boolean(selectedOption?.isCorrect),
        selectedSummary: selectedOption?.text || "",
      }
    }

    if (question.type === "multiple_choice") {
      const selected = new Set(draft.choiceIds)
      const correctIds = new Set(question.options.filter((option) => option.isCorrect).map((option) => option.id))
      const selectedSummary = question.options
        .filter((option) => selected.has(option.id))
        .map((option) => option.text)
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
      answers: [...prev.answers, { question: question.prompt, correct, selected: selectedSummary }],
    }))
  }

  const handleChoiceClick = (choiceId: string) => {
    if (showFeedback) return

    if (question.type === "single_choice" || question.type === "listen_and_select") {
      setDraft({ choiceIds: [choiceId], fillAnswers: {}, matchAnswers: {} })
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
            answers: [...prev.answers, { question: question.prompt, correct, selected: selectedOption.text }],
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

  const isAnswerReady =
    question.type === "multiple_choice"
      ? draft.choiceIds.length > 0
      : question.type === "fill_in_blank"
        ? question.hiddenIndexes.every((index) => draft.fillAnswers[index])
        : question.type === "match_items"
          ? question.pairs.every((pair) => draft.matchAnswers[pair.id])
          : draft.choiceIds.length > 0

  useEffect(() => {
    if (!showFeedback) return

    const timer = setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1)
        setDraft(emptyDraft())
        setShowFeedback(false)
        setFeedbackText("")
      } else {
        playCompletionApplause()
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
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const renderChoiceQuestion = (current: MultipleChoiceQuestion | SingleChoiceQuestion) => (
    <div className="space-y-3">
      {current.options.map((option) => {
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
            className={cn("min-h-16 w-full whitespace-normal rounded-xl px-4 text-base font-semibold", buttonStyle)}
          >
            {option.text}
          </Button>
        )
      })}
    </div>
  )

  const renderFillInBlank = (current: FillInBlankQuestion) => {
    const characters = current.word.split("")

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap justify-center gap-2">
          {characters.map((character, index) => {
            const isHidden = current.hiddenIndexes.includes(index)
            const selectedLetter = draft.fillAnswers[index]

            return (
              <div
                key={`${character}-${index}`}
                className={cn(
                  "flex h-14 w-12 items-center justify-center rounded-2xl border text-xl font-black",
                  isHidden ? "border-dashed border-primary/40 bg-primary/5 text-primary" : "border-border bg-muted text-foreground"
                )}
              >
                {isHidden ? selectedLetter || "_" : character}
              </div>
            )
          })}
        </div>

        <div className="space-y-4">
          {current.hiddenIndexes.map((index) => (
            <div key={index} className="rounded-2xl bg-muted/50 p-4">
              <p className="mb-3 text-sm font-semibold text-muted-foreground">Elige la letra para el espacio {index + 1}</p>
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
                        isSelected ? "bg-primary text-primary-foreground hover:bg-primary" : "bg-background hover:bg-muted"
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

  const renderListenAndSelect = (current: SingleChoiceQuestion & { audioText: string }) => (
    <div className="space-y-4">
      <div className="rounded-2xl bg-primary/5 p-4 text-center">
        <Button
          type="button"
          variant="outline"
          onClick={() => speakPrompt(current.audioText)}
          className="rounded-xl"
        >
          <Volume2 className="mr-2 h-4 w-4" />
          Escuchar
        </Button>
        <p className="mt-3 text-sm text-muted-foreground">{current.audioText}</p>
      </div>
      {renderChoiceQuestion(current)}
    </div>
  )

  const renderMatchItems = (current: MatchItemsQuestion) => {
    const rightOptions = current.pairs.map((pair) => pair.right)

    return (
      <div className="space-y-4">
        <p className="rounded-2xl bg-muted/50 p-4 text-sm text-muted-foreground">{current.instruction}</p>
        {current.pairs.map((pair) => (
          <div key={pair.id} className="rounded-2xl border border-border p-4">
            <p className="mb-3 font-semibold text-foreground">{pair.left}</p>
            <div className="flex flex-wrap gap-2">
              {rightOptions.map((option) => {
                const isSelected = draft.matchAnswers[pair.id] === option

                return (
                  <Button
                    key={`${pair.id}-${option}`}
                    variant="ghost"
                    onClick={() => setDraft((currentDraft) => ({
                      ...currentDraft,
                      matchAnswers: { ...currentDraft.matchAnswers, [pair.id]: option },
                    }))}
                    disabled={showFeedback}
                    className={cn(
                      "rounded-xl",
                      isSelected ? "bg-primary text-primary-foreground hover:bg-primary" : "bg-secondary hover:bg-secondary/80"
                    )}
                  >
                    {option}
                  </Button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col px-4 py-6">
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
              Pregunta {currentQuestion + 1} de {questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-6 sm:p-8">
            <div className="mb-8 text-center">
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                {topic?.name || "Reto activo"}
              </p>
              <h2 className="text-2xl font-bold text-foreground sm:text-4xl">{question.prompt}</h2>
            </div>

            {question.type === "single_choice" && renderChoiceQuestion(question)}
            {question.type === "multiple_choice" && renderChoiceQuestion(question)}
            {question.type === "fill_in_blank" && renderFillInBlank(question)}
            {question.type === "listen_and_select" &&
              renderListenAndSelect(question as SingleChoiceQuestion & { audioText: string })}
            {question.type === "match_items" && renderMatchItems(question)}

            {(question.type === "multiple_choice" || question.type === "fill_in_blank" || question.type === "match_items") && (
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={commitAnswer}
                  disabled={!isAnswerReady || showFeedback}
                  className="min-w-52 rounded-xl px-6 py-6 text-base font-bold"
                >
                  Revisar respuesta
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
                      <p className="font-bold text-green-700">Correcto</p>
                      <p className="text-sm text-green-700">{feedbackText}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="mt-0.5 size-8 text-red-500" />
                    <div>
                      <p className="font-bold text-red-700">Intentalo otra vez la proxima</p>
                      <p className="text-sm text-red-700">Respuesta correcta: {feedbackText}</p>
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
