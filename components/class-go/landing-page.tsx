"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Gamepad2, Trophy, Users, Zap } from "lucide-react"

interface LandingPageProps {
  onGetStarted: () => void
}

const features = [
  {
    icon: Gamepad2,
    title: "Learn by Playing",
    description: "Fun challenges that make learning feel like a game",
    color: "bg-pink-100 text-pink-600",
  },
  {
    icon: Users,
    title: "Virtual Classroom",
    description: "See your classmates and compete together",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Trophy,
    title: "Weekly Challenges",
    description: "New topics every week to keep you engaged",
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    icon: BookOpen,
    title: "Track Progress",
    description: "Teachers can monitor student performance",
    color: "bg-green-100 text-green-600",
  },
]

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-accent px-4 py-16 text-primary-foreground">
        {/* Decorative elements */}
        <div className="absolute -left-10 -top-10 size-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 -right-10 size-60 rounded-full bg-accent/30 blur-3xl" />
        
        <div className="relative mx-auto max-w-md text-center">
          {/* Logo */}
          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Zap className="size-8" />
            </div>
            <span className="text-3xl font-bold">Class Go</span>
          </div>
          
          <h1 className="mb-4 text-4xl font-bold leading-tight">
            Learning Made Fun
          </h1>
          <p className="mb-8 text-lg text-white/80">
            Transform your classroom into an exciting adventure with gamified weekly challenges
          </p>
          
          <Button
            onClick={onGetStarted}
            size="lg"
            className="h-14 w-full max-w-xs rounded-xl bg-white text-lg font-bold text-primary shadow-lg hover:bg-white/90"
          >
            Get Started
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-4 py-12">
        <div className="mx-auto max-w-md">
          <h2 className="mb-8 text-center text-2xl font-bold text-foreground">
            Why Class Go?
          </h2>
          
          <div className="grid gap-4">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-md transition-shadow hover:shadow-lg">
                <CardContent className="flex items-start gap-4 p-4">
                  <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${feature.color}`}>
                    <feature.icon className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-muted/50 px-4 py-10">
        <div className="mx-auto max-w-md">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Classrooms</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">10k+</div>
              <div className="text-sm text-muted-foreground">Students</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">95%</div>
              <div className="text-sm text-muted-foreground">Love it</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="px-4 py-10">
        <div className="mx-auto max-w-md text-center">
          <p className="mb-4 text-muted-foreground">
            Ready to transform your classroom?
          </p>
          <Button
            onClick={onGetStarted}
            size="lg"
            className="h-12 rounded-xl px-8 font-semibold"
          >
            Start Now
          </Button>
        </div>
      </div>
    </div>
  )
}
