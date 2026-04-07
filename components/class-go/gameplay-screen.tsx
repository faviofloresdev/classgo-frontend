"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Zap } from "lucide-react"
import type { GameState } from "@/app/page"
import { cn } from "@/lib/utils"
import confetti from "canvas-confetti"

interface GameplayScreenProps {
  gameState: GameState
  onGameComplete: (finalState: GameState) => void
}

interface Question {
  question: string
  options: string[]
  correctAnswer: string
}

const questions: Question[] = [
  { question: "What is 3 × 2?", options: ["4", "5", "6", "7"], correctAnswer: "6" },
  { question: "What is 2 × 4?", options: ["6", "8", "10", "12"], correctAnswer: "8" },
  { question: "What is 3 × 3?", options: ["6", "9", "12", "15"], correctAnswer: "9" },
  { question: "What is 2 × 7?", options: ["12", "13", "14", "16"], correctAnswer: "14" },
  { question: "What is 3 × 5?", options: ["12", "15", "18", "20"], correctAnswer: "15" },
  { question: "What is 2 × 9?", options: ["16", "17", "18", "19"], correctAnswer: "18" },
  { question: "What is 3 × 4?", options: ["9", "10", "11", "12"], correctAnswer: "12" },
  { question: "What is 2 × 6?", options: ["10", "11", "12", "14"], correctAnswer: "12" },
  { question: "What is 3 × 7?", options: ["18", "19", "20", "21"], correctAnswer: "21" },
  { question: "What is 2 × 8?", options: ["14", "15", "16", "18"], correctAnswer: "16" },
]

export function GameplayScreen({ gameState, onGameComplete }: GameplayScreenProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [localGameState, setLocalGameState] = useState(gameState)
  const audioContextRef = useRef<AudioContext | null>(null)

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

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
      ].forEach(note => {
        createNote(note.frequency, note.start, note.duration, note.type, note.volume)
      })
    } else {
      ;[
        { frequency: 392, start: now, duration: 0.14, type: "sine" as const, volume: 0.09 },
        { frequency: 329.63, start: now + 0.12, duration: 0.18, type: "triangle" as const, volume: 0.08 },
      ].forEach(note => {
        createNote(note.frequency, note.start, note.duration, note.type, note.volume)
      })
      
      const wobble = context.createOscillator()
      const wobbleGain = context.createGain()
      wobble.type = "sine"
      wobble.frequency.setValueAtTime(260, now + 0.05)
      wobble.frequency.exponentialRampToValueAtTime(220, now + 0.28)
      wobbleGain.gain.setValueAtTime(0.0001, now + 0.05)
      wobbleGain.gain.exponentialRampToValueAtTime(0.04, now + 0.08)
      wobbleGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3)
      wobble.connect(wobbleGain)
      wobbleGain.connect(context.destination)
      wobble.start(now + 0.05)
      wobble.stop(now + 0.3)
    }
  }

  const handleAnswer = (answer: string) => {
    if (showFeedback) return
    
    setSelectedAnswer(answer)
    const correct = answer === question.correctAnswer
    setIsCorrect(correct)
    setShowFeedback(true)
    playFeedbackSound(correct)
    
    // Trigger confetti burst on correct answer
    if (correct) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#7c3aed", "#2dd4bf", "#fbbf24", "#22c55e"],
      })
    }
    
    setLocalGameState(prev => ({
      ...prev,
      correctAnswers: correct ? prev.correctAnswers + 1 : prev.correctAnswers,
      answers: [...prev.answers, { question: question.question, correct, selected: answer }],
    }))
  }

  useEffect(() => {
    if (showFeedback) {
      const timer = setTimeout(() => {
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(prev => prev + 1)
          setSelectedAnswer(null)
          setShowFeedback(false)
        } else {
          onGameComplete({
            ...localGameState,
            currentQuestion: currentQuestion + 1,
            totalQuestions: questions.length,
          })
        }
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [showFeedback, currentQuestion, localGameState, onGameComplete])

  useEffect(() => {
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        void audioContextRef.current.close()
      }
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col px-4 py-6">
      <div className="mx-auto w-full max-w-md flex-1 space-y-6">
        {/* Top Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Zap className="size-4" />
              </div>
              <span className="font-semibold text-foreground">Class Go</span>
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Question Card */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="mb-8 text-center">
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                Solve this multiplication
              </p>
              <h2 className="text-4xl font-bold text-foreground">{question.question}</h2>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === option
                const isCorrectAnswer = option === question.correctAnswer
                
                let buttonStyle = "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                
                if (showFeedback) {
                  if (isCorrectAnswer) {
                    buttonStyle = "bg-green-500 text-white hover:bg-green-500"
                  } else if (isSelected && !isCorrect) {
                    buttonStyle = "bg-red-400 text-white hover:bg-red-400"
                  } else {
                    buttonStyle = "bg-muted text-muted-foreground hover:bg-muted"
                  }
                } else if (isSelected) {
                  buttonStyle = "bg-primary text-primary-foreground hover:bg-primary"
                }

                return (
                  <Button
                    key={index}
                    variant="ghost"
                    size="lg"
                    onClick={() => handleAnswer(option)}
                    disabled={showFeedback}
                    className={cn(
                      "h-16 w-full justify-center rounded-xl text-xl font-semibold transition-all",
                      buttonStyle
                    )}
                  >
                    {option}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Feedback Area */}
        <div className="h-20">
          {showFeedback && (
            <Card className={cn(
              "border-0 shadow-lg",
              isCorrect ? "bg-green-50" : "bg-red-50"
            )}>
              <CardContent className="flex items-center gap-3 p-4">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="size-8 text-green-500" />
                    <div>
                      <p className="font-bold text-green-700">Correct!</p>
                      <p className="text-sm text-green-600">Great job! Keep going!</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="size-8 text-red-500" />
                    <div>
                      <p className="font-bold text-red-700">Not quite!</p>
                      <p className="text-sm text-red-600">
                        The answer was {question.correctAnswer}
                      </p>
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
