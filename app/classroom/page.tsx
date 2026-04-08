"use client"

import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"

const participants = [
  { name: "Emma", avatar: "E", color: "bg-pink-400" },
  { name: "Lucas", avatar: "L", color: "bg-blue-400" },
  { name: "Sofia", avatar: "S", color: "bg-green-400" },
  { name: "Noah", avatar: "N", color: "bg-orange-400" },
  { name: "Mia", avatar: "M", color: "bg-purple-400" },
]

export default function ClassroomPage() {
  const secondRowParticipants: Array<{ name: string; avatar: string; color: string; isYou?: boolean }> = [
    { name: "You", avatar: "A", color: "bg-gradient-to-br from-primary to-accent", isYou: true },
    ...participants.slice(4, 5),
    { name: "Leo", avatar: "Le", color: "bg-cyan-400" },
    { name: "Ava", avatar: "Av", color: "bg-rose-400" },
  ]

  return (
    <main className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-md space-y-6">
        <header className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Users className="size-5" />
          </div>
          <h1 className="text-xl font-bold">My Classroom</h1>
        </header>

        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Users className="size-4 text-primary" />
              Classroom Visual
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative bg-gradient-to-b from-amber-50 to-orange-50 p-4">
              <div className="relative mx-auto mb-6 w-full max-w-[280px]">
                <div className="rounded-lg bg-gradient-to-b from-emerald-800 to-emerald-900 p-4 shadow-lg">
                  <div className="rounded border-2 border-emerald-700/50 bg-emerald-950/50 p-3">
                    <p className="text-center font-mono text-sm text-white/90">2 x 3 = ?</p>
                    <p className="mt-1 text-center text-xs text-emerald-300/70">Today's Challenge</p>
                  </div>
                </div>
                <div className="mx-auto h-2 w-[90%] rounded-b-sm bg-amber-700 shadow-sm" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-center gap-3">
                  {participants.slice(0, 4).map((p, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <Avatar className={`size-8 border-2 border-white shadow-md ${p.color}`}>
                        <AvatarFallback className={`${p.color} text-white text-xs font-bold`}>{p.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="mt-1 h-4 w-12 rounded-sm bg-gradient-to-b from-amber-600 to-amber-700 shadow-sm" />
                    </div>
                  ))}
                </div>

                <div className="flex justify-center gap-3">
                  {secondRowParticipants.map((p, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <Avatar className={`size-8 border-2 shadow-md ${p.isYou ? "border-yellow-400 ring-2 ring-yellow-400/50" : "border-white"} ${p.color}`}>
                        <AvatarFallback className={`${p.color} text-white text-xs font-bold`}>{p.avatar}</AvatarFallback>
                      </Avatar>
                      <div className={`mt-1 h-4 w-12 rounded-sm shadow-sm ${p.isYou ? "bg-gradient-to-b from-yellow-500 to-yellow-600" : "bg-gradient-to-b from-amber-600 to-amber-700"}`} />
                      {p.isYou && <span className="mt-0.5 text-[10px] font-semibold text-primary">You</span>}
                    </div>
                  ))}
                </div>

                <div className="flex justify-center gap-3">
                  {[
                    { name: "Zoe", avatar: "Z", color: "bg-indigo-400" },
                    { name: "Eli", avatar: "El", color: "bg-teal-400" },
                    { name: "Ivy", avatar: "I", color: "bg-fuchsia-400" },
                    { name: "Max", avatar: "Ma", color: "bg-lime-500" },
                  ].map((p, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <Avatar className={`size-8 border-2 border-white shadow-md ${p.color}`}>
                        <AvatarFallback className={`${p.color} text-white text-xs font-bold`}>{p.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="mt-1 h-4 w-12 rounded-sm bg-gradient-to-b from-amber-600 to-amber-700 shadow-sm" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-t from-amber-200/50 to-transparent" />
            </div>

            <div className="bg-card px-4 py-3 text-center text-sm text-muted-foreground">12 classmates participating this week</div>
          </CardContent>
        </Card>

        <Link href="/" className="block text-center text-sm text-muted-foreground underline">Back</Link>
      </div>
    </main>
  )
}
