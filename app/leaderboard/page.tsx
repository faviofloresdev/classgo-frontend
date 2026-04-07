"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, Trophy } from "lucide-react"
import Link from "next/link"

const fullLeaderboard = [
  { rank: 1, name: "Emma", points: 245, avatar: "E", color: "bg-pink-400" },
  { rank: 2, name: "You", points: 230, avatar: "A", color: "bg-gradient-to-br from-primary to-accent" },
  { rank: 3, name: "Lucas", points: 210, avatar: "L", color: "bg-blue-400" },
  { rank: 4, name: "Sofia", points: 185, avatar: "S", color: "bg-green-400" },
  { rank: 5, name: "Noah", points: 170, avatar: "N", color: "bg-orange-400" },
]

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-md space-y-6">
        <header className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Trophy className="size-5 text-yellow-300" />
          </div>
          <h1 className="text-xl font-bold">Class Leaderboard</h1>
        </header>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Trophy className="size-4 text-yellow-500" />
              Top Players
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {fullLeaderboard.map((player) => (
              <div
                key={player.rank}
                className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${
                  player.rank === 1 ? "bg-gradient-to-r from-yellow-50 to-orange-50" : "bg-muted/50"
                }`}
              >
                <div className={`flex size-8 items-center justify-center rounded-full font-bold ${
                  player.rank === 1
                    ? "bg-gradient-to-br from-yellow-400 to-orange-400 text-white"
                    : player.rank === 2
                    ? "bg-gradient-to-br from-slate-300 to-slate-400 text-white"
                    : "bg-gradient-to-br from-amber-600 to-amber-700 text-white"
                }`}>
                  {player.rank}
                </div>
                <Avatar className={`size-9 ${player.color}`}>
                  <AvatarFallback className={`${player.color} text-white text-xs font-semibold`}>{player.avatar}</AvatarFallback>
                </Avatar>
                <span className="flex-1 font-medium">{player.name}</span>
                <div className="flex items-center gap-1 font-semibold text-primary">
                  <Star className="size-4 text-yellow-500" />
                  {player.points}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Link href="/" className="block text-center text-sm text-muted-foreground underline">Back</Link>
      </div>
    </main>
  )
}
