"use client"

import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft,
  BookOpen, 
  CheckCircle2, 
  ChevronRight,
  Clock, 
  Copy, 
  Edit3,
  LogOut, 
  Plus, 
  TrendingUp, 
  Users, 
  Zap 
} from "lucide-react"

export interface Classroom {
  id: string
  name: string
  code: string
  students: number
}

interface TeacherDashboardProps {
  onCreateClassroom: () => void
  onCreateTopic: () => void
  onEditTopic?: (topicId: string) => void
  onLogout: () => void
  classroom: Classroom | null
}

type DashboardView = "classrooms" | "classroom-detail"

const mockClassrooms: Classroom[] = [
  { id: "1", name: "Math Stars", code: "MAT3A", students: 24 },
  { id: "2", name: "Science Explorers", code: "SCI4B", students: 18 },
]

const mockTopics = [
  {
    id: "1",
    title: "Multiplications by 2 and 3",
    status: "active" as const,
    completedBy: 18,
    totalStudents: 24,
    averageScore: 85,
    daysLeft: 3,
  },
  {
    id: "2",
    title: "Basic Addition",
    status: "completed" as const,
    completedBy: 24,
    totalStudents: 24,
    averageScore: 92,
    daysLeft: 0,
  },
  {
    id: "3",
    title: "Number Recognition 1-20",
    status: "completed" as const,
    completedBy: 24,
    totalStudents: 24,
    averageScore: 88,
    daysLeft: 0,
  },
]

const mockStudents = [
  { name: "Emma", avatar: "E", color: "bg-pink-400", score: 245, completed: true },
  { name: "Lucas", avatar: "L", color: "bg-blue-400", score: 210, completed: true },
  { name: "Sofia", avatar: "S", color: "bg-green-400", score: 185, completed: true },
  { name: "Noah", avatar: "N", color: "bg-purple-400", score: 170, completed: true },
  { name: "Mia", avatar: "M", color: "bg-orange-400", score: 165, completed: false },
  { name: "Oliver", avatar: "O", color: "bg-cyan-400", score: 150, completed: false },
]

export function TeacherDashboard({ 
  onCreateClassroom, 
  onCreateTopic,
  onEditTopic, 
  onLogout,
  classroom 
}: TeacherDashboardProps) {
  const [view, setView] = useState<DashboardView>("classrooms")
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(classroom)
  const [activeTab, setActiveTab] = useState<"students" | "topics">("topics")

  const allClassrooms = classroom 
    ? [classroom, ...mockClassrooms.filter(c => c.id !== classroom.id)]
    : mockClassrooms

  const copyClassCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  const handleSelectClassroom = (c: Classroom) => {
    setSelectedClassroom(c)
    setView("classroom-detail")
  }

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-md space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {view === "classroom-detail" && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setView("classrooms")}
              >
                <ArrowLeft className="size-5" />
              </Button>
            )}
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Zap className="size-5" />
            </div>
            <span className="text-xl font-bold text-foreground">Class Go</span>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onCreateClassroom}
              title="New Classroom"
            >
              <Plus className="size-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onCreateTopic}
              title="New Topic"
            >
              <BookOpen className="size-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onLogout}>
              <LogOut className="size-5" />
            </Button>
          </div>
        </header>

        {view === "classrooms" ? (
          /* Classrooms List View */
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Classrooms</h1>
              <p className="text-sm text-muted-foreground">Select a classroom to manage</p>
            </div>

            <div className="space-y-3">
              {allClassrooms.map((c) => (
                <Card 
                  key={c.id} 
                  className="cursor-pointer border-0 shadow-lg transition-all hover:shadow-xl"
                  onClick={() => handleSelectClassroom(c)}
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                        <BookOpen className="size-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{c.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="size-3" />
                          <span>{c.students} students</span>
                          <span className="font-mono text-xs">{c.code}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="size-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Create Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4"
                onClick={onCreateClassroom}
              >
                <Plus className="size-5" />
                <span className="text-sm">New Classroom</span>
              </Button>
              <Button
                className="h-auto flex-col gap-2 py-4"
                onClick={onCreateTopic}
              >
                <BookOpen className="size-5" />
                <span className="text-sm">New Topic</span>
              </Button>
            </div>

            {/* All Topics Section */}
            <div className="space-y-3 pt-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">All Topics</h2>
                <Button size="sm" variant="outline" onClick={onCreateTopic}>
                  <Plus className="mr-1 size-4" />
                  Create
                </Button>
              </div>
              
              {mockTopics.map((topic) => (
                <Card
                  key={topic.id}
                  className={`border-0 shadow-md ${
                    topic.status === "active" 
                      ? "ring-2 ring-primary/30" 
                      : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{topic.title}</h4>
                        <div className="mt-1 flex items-center gap-2">
                          {topic.status === "active" ? (
                            <Badge className="bg-primary/20 text-primary">
                              <Clock className="mr-1 size-3" />
                              Active - {topic.daysLeft} days left
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              <CheckCircle2 className="mr-1 size-3" />
                              Completed
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                            <TrendingUp className="size-4" />
                            {topic.averageScore}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {topic.completedBy}/{topic.totalStudents}
                          </div>
                        </div>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => onEditTopic?.(topic.id)}
                        >
                          <Edit3 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* Classroom Detail View */
          <div className="space-y-4">
            {/* Classroom Header Card */}
            <Card className="overflow-hidden border-0 shadow-xl">
              <div className="bg-gradient-to-br from-primary via-primary to-accent p-5 text-white">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-xl font-bold">{selectedClassroom?.name}</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-2 bg-white/20 text-white hover:bg-white/30"
                    onClick={() => copyClassCode(selectedClassroom?.code || "")}
                  >
                    <span className="font-mono font-bold">{selectedClassroom?.code}</span>
                    <Copy className="size-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-sm text-white/80">
                  <span className="flex items-center gap-1">
                    <Users className="size-4" />
                    {selectedClassroom?.students} students
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="size-4" />
                    {mockTopics.length} topics
                  </span>
                </div>
              </div>
            </Card>

            {/* Tabs */}
            <div className="flex gap-2">
              <Button
                variant={activeTab === "topics" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setActiveTab("topics")}
              >
                <BookOpen className="mr-2 size-4" />
                Topics
              </Button>
              <Button
                variant={activeTab === "students" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setActiveTab("students")}
              >
                <Users className="mr-2 size-4" />
                Students
              </Button>
            </div>

            {activeTab === "topics" ? (
              /* Topics List */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Weekly Topics</h3>
                  <Button size="sm" onClick={onCreateTopic}>
                    <Plus className="mr-1 size-4" />
                    Assign New
                  </Button>
                </div>
                
                {mockTopics.map((topic) => (
                  <Card
                    key={topic.id}
                    className={`border-0 shadow-md ${
                      topic.status === "active" 
                        ? "ring-2 ring-primary/30" 
                        : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{topic.title}</h4>
                          <div className="mt-1">
                            {topic.status === "active" ? (
                              <Badge className="bg-primary/20 text-primary">
                                <Clock className="mr-1 size-3" />
                                {topic.daysLeft} days left
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-green-100 text-green-700">
                                <CheckCircle2 className="mr-1 size-3" />
                                Completed
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                            <TrendingUp className="size-4" />
                            {topic.averageScore}%
                          </div>
                          <div className="text-xs text-muted-foreground">avg score</div>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Completion</span>
                          <span className="font-medium">
                            {topic.completedBy}/{topic.totalStudents}
                          </span>
                        </div>
                        <Progress 
                          value={(topic.completedBy / topic.totalStudents) * 100} 
                          className="h-2" 
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              /* Students List */
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2">
                      <Users className="size-4 text-primary" />
                      Students ({mockStudents.length})
                    </span>
                    <Badge variant="secondary">
                      {mockStudents.filter(s => s.completed).length} completed
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockStudents.map((student, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className={`size-10 ${student.color}`}>
                          <AvatarFallback className={`${student.color} text-white font-bold`}>
                            {student.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.score} pts</p>
                        </div>
                      </div>
                      {student.completed ? (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle2 className="mr-1 size-3" />
                          Done
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Clock className="mr-1 size-3" />
                          Pending
                        </Badge>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
