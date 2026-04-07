"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Sparkles, Users, Zap } from "lucide-react"

interface Classroom {
  id: string
  name: string
  code: string
  students: number
}

interface CreateClassroomProps {
  onClassroomCreated: (classroom: Classroom) => void
  onBack: () => void
}

export function CreateClassroom({ onClassroomCreated, onBack }: CreateClassroomProps) {
  const [classroomName, setClassroomName] = useState("")
  const [grade, setGrade] = useState("")
  const [section, setSection] = useState("")

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let code = ""
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newClassroom: Classroom = {
      id: Date.now().toString(),
      name: classroomName || `Grade ${grade} - Section ${section}`,
      code: generateCode(),
      students: 0,
    }
    onClassroomCreated(newClassroom)
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
            <Users className="size-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Create Classroom</h1>
          <p className="mt-2 text-muted-foreground">
            Set up a new virtual classroom for your students
          </p>
        </div>

        {/* Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4 text-primary" />
              Classroom Details
            </CardTitle>
            <CardDescription>
              Fill in the information to create your classroom
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="classroomName">Classroom Name</Label>
                <Input
                  id="classroomName"
                  placeholder="e.g., My Math Class"
                  value={classroomName}
                  onChange={(e) => setClassroomName(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade</Label>
                  <Select value={grade} onValueChange={setGrade}>
                    <SelectTrigger id="grade" className="h-12">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Grade 1</SelectItem>
                      <SelectItem value="2">Grade 2</SelectItem>
                      <SelectItem value="3">Grade 3</SelectItem>
                      <SelectItem value="4">Grade 4</SelectItem>
                      <SelectItem value="5">Grade 5</SelectItem>
                      <SelectItem value="6">Grade 6</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="section">Section</Label>
                  <Select value={section} onValueChange={setSection}>
                    <SelectTrigger id="section" className="h-12">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Section A</SelectItem>
                      <SelectItem value="B">Section B</SelectItem>
                      <SelectItem value="C">Section C</SelectItem>
                      <SelectItem value="D">Section D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="h-12 w-full rounded-xl font-semibold">
                Create Classroom
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Box */}
        <Card className="border-0 bg-muted/50">
          <CardContent className="p-4">
            <p className="text-center text-sm text-muted-foreground">
              After creating your classroom, you&apos;ll receive a unique code that students can use to join.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
