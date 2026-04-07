"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, BookOpen, LogOut, Users, Zap } from "lucide-react"

interface StudentJoinClassroomProps {
  onJoinClassroom: (code: string) => void
  onLogout: () => void
  onBack?: () => void
  joinedClassrooms?: { id: string; name: string; code: string; currentTopic?: string }[]
  onSelectClassroom?: (classroomId: string) => void
}

export function StudentJoinClassroom({ 
  onJoinClassroom, 
  onLogout,
  joinedClassrooms = [],
  onSelectClassroom
}: StudentJoinClassroomProps) {
  const [classCode, setClassCode] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (classCode.length < 4) {
      setError("Please enter a valid classroom code")
      return
    }
    setError("")
    onJoinClassroom(classCode)
  }

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-md space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Zap className="size-5" />
            </div>
            <span className="text-xl font-bold text-foreground">Class Go</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onLogout}>
            <LogOut className="size-5" />
          </Button>
        </header>

        {/* Welcome Section */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Welcome, Student!</h1>
          <p className="text-sm text-muted-foreground">Join a classroom or continue your challenges</p>
        </div>

        {/* Joined Classrooms */}
        {joinedClassrooms.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-foreground">My Classrooms</h2>
            {joinedClassrooms.map((classroom) => (
              <Card 
                key={classroom.id}
                className="cursor-pointer border-0 shadow-lg transition-all hover:shadow-xl"
                onClick={() => onSelectClassroom?.(classroom.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                      <BookOpen className="size-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{classroom.name}</h3>
                      {classroom.currentTopic && (
                        <p className="text-sm text-muted-foreground">
                          Current: {classroom.currentTopic}
                        </p>
                      )}
                    </div>
                    <div className="rounded-lg bg-primary/10 px-2 py-1">
                      <span className="font-mono text-xs font-semibold text-primary">{classroom.code}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Join New Classroom */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent">
              <Users className="size-8 text-white" />
            </div>
            <CardTitle>Join a Classroom</CardTitle>
            <CardDescription>
              Enter the code your teacher gave you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="classCode">Classroom Code</Label>
                <Input
                  id="classCode"
                  type="text"
                  placeholder="ABC123"
                  value={classCode}
                  onChange={(e) => {
                    setClassCode(e.target.value.toUpperCase())
                    setError("")
                  }}
                  className="h-14 text-center font-mono text-2xl uppercase tracking-[0.5em]"
                  maxLength={6}
                />
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="h-12 w-full rounded-xl font-semibold"
                disabled={classCode.length < 4}
              >
                <ArrowLeft className="mr-2 size-4 rotate-180" />
                Join Classroom
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Help text */}
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have a code? Ask your teacher for the classroom code to join.
        </p>
      </div>
    </div>
  )
}
