"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, BookOpen, Plus, Sparkles, Trash2, Zap } from "lucide-react"

interface Question {
  id: string
  question: string
  options: string[]
  correctIndex: number
}

interface CreateTopicProps {
  onTopicCreated: () => void
  onBack: () => void
}

export function CreateTopic({ onTopicCreated, onBack }: CreateTopicProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState<Question[]>([
    { id: "1", question: "", options: ["", "", "", ""], correctIndex: 0 }
  ])

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { 
        id: Date.now().toString(), 
        question: "", 
        options: ["", "", "", ""], 
        correctIndex: 0 
      }
    ])
  }

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id))
    }
  }

  const updateQuestion = (id: string, field: string, value: string | number) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ))
  }

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options]
        newOptions[optionIndex] = value
        return { ...q, options: newOptions }
      }
      return q
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onTopicCreated()
  }

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-md space-y-6">
        {/* Header */}
        <header className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack}
            className="shrink-0"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Zap className="size-5" />
            </div>
            <span className="text-xl font-bold text-foreground">Class Go</span>
          </div>
        </header>

        {/* Hero */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent">
            <BookOpen className="size-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Create Topic</h1>
          <p className="mt-2 text-muted-foreground">
            Design a new weekly challenge for your students
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Topic Info */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="size-4 text-primary" />
                Topic Details
              </CardTitle>
              <CardDescription>
                Name and describe this week&apos;s challenge
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Topic Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Multiplications by 2 and 3"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what students will learn..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="size-4 text-primary" />
                Questions ({questions.length})
              </CardTitle>
              <CardDescription>
                Add multiple choice questions for this topic
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {questions.map((q, qIndex) => (
                <div 
                  key={q.id} 
                  className="space-y-4 rounded-xl border bg-muted/30 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary">
                      Question {qIndex + 1}
                    </span>
                    {questions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive"
                        onClick={() => removeQuestion(q.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Question Text</Label>
                    <Input
                      placeholder="e.g., What is 2 x 3?"
                      value={q.question}
                      onChange={(e) => updateQuestion(q.id, "question", e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Answer Options</Label>
                    {q.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <button
                          type="button"
                          className={`flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                            q.correctIndex === oIndex
                              ? "border-green-500 bg-green-500 text-white"
                              : "border-border bg-background text-muted-foreground hover:border-green-300"
                          }`}
                          onClick={() => updateQuestion(q.id, "correctIndex", oIndex)}
                        >
                          {String.fromCharCode(65 + oIndex)}
                        </button>
                        <Input
                          placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                          value={option}
                          onChange={(e) => updateOption(q.id, oIndex, e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground">
                      Click a letter to mark it as the correct answer
                    </p>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={addQuestion}
              >
                <Plus className="mr-2 size-4" />
                Add Question
              </Button>
            </CardContent>
          </Card>

          {/* Submit */}
          <Button type="submit" className="h-14 w-full rounded-xl text-lg font-semibold">
            Create Topic
          </Button>
        </form>
      </div>
    </div>
  )
}
