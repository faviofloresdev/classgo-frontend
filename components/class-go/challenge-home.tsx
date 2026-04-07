"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, LogOut, Sparkles, Star, Trophy, Users, Zap } from "lucide-react"

interface ChallengeHomeProps {
  onStartGame: () => void
  onLogout?: () => void
}

const participants = [
  { name: "Emma", avatar: "E", color: "bg-pink-400" },
  { name: "Lucas", avatar: "L", color: "bg-blue-400" },
  { name: "Sofia", avatar: "S", color: "bg-green-400" },
  { name: "Noah", avatar: "N", color: "bg-orange-400" },
  { name: "Mia", avatar: "M", color: "bg-purple-400" },
]

const leaderboard = [
  { rank: 1, name: "Emma", points: 245, avatar: "E", color: "bg-pink-400" },
  { rank: 2, name: "Lucas", points: 210, avatar: "L", color: "bg-blue-400" },
  { rank: 3, name: "Sofia", points: 185, avatar: "S", color: "bg-green-400" },
]

export function ChallengeHome({ onStartGame, onLogout }: ChallengeHomeProps) {
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
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Alex</span>
            <Avatar className="size-10 ring-2 ring-primary/20">
              <AvatarImage src="/placeholder.svg" alt="Alex" />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold">
                A
              </AvatarFallback>
            </Avatar>
            {onLogout && (
              <Button variant="ghost" size="icon" onClick={onLogout}>
                <LogOut className="size-5" />
              </Button>
            )}
          </div>
        </header>

        {/* Main Challenge Card */}
        <Card className="overflow-hidden border-0 shadow-xl">
          <div className="bg-gradient-to-br from-primary via-primary to-primary/80 p-6 text-primary-foreground">
            <div className="mb-4 flex items-start justify-between">
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                <Sparkles className="mr-1 size-3" />
                This week&apos;s challenge
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                <Clock className="mr-1 size-3" />
                3 days left
              </Badge>
            </div>
            
            <h2 className="mb-2 text-2xl font-bold">Multiplications by 2 and 3</h2>
            <p className="mb-6 text-sm text-white/80">Master your multiplication tables with fun challenges!</p>
            
            <div className="mb-6 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span className="font-semibold">60%</span>
              </div>
              <Progress value={60} className="h-3 bg-white/20" />
            </div>
            
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                <div className="text-2xl font-bold">3/5</div>
                <div className="text-xs text-white/70">Activities done</div>
              </div>
              <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                <div className="flex items-center gap-1 text-2xl font-bold">
                  <Star className="size-5 text-yellow-300" />
                  120
                </div>
                <div className="text-xs text-white/70">Points earned</div>
              </div>
            </div>
            
            <Button
              onClick={onStartGame}
              size="lg"
              className="w-full bg-white text-primary hover:bg-white/90 font-bold text-lg h-14 rounded-xl shadow-lg"
            >
              <Zap className="mr-2 size-5" />
              Continue
            </Button>
          </div>
        </Card>

        {/* Links to full pages */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-0 shadow-lg p-4 flex flex-col items-stretch justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base font-semibold mb-2">
                <Users className="size-4 text-primary" />
                My Classroom
              </CardTitle>
              <p className="text-sm text-muted-foreground">Manage your classroom, students and codes.</p>
            </div>
            <Link href="/classroom" className="mt-4">
              <Button className="w-full">Open Classroom</Button>
            </Link>
          </Card>

          <Card className="border-0 shadow-lg p-4 flex flex-col items-stretch justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base font-semibold mb-2">
                <Trophy className="size-4 text-yellow-500" />
                Leaderboard
              </CardTitle>
              <p className="text-sm text-muted-foreground">See full class rankings and progress.</p>
            </div>
            <Link href="/leaderboard" className="mt-4">
              <Button className="w-full">View Leaderboard</Button>
            </Link>
          </Card>
        </div>

        {/* removed inline leaderboard preview - use full page */}
      </div>
    </div>
  )
}
