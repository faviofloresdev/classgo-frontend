"use client"

import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, BookOpen, GraduationCap, Zap } from "lucide-react"
import Link from "next/link"

type UserRole = "teacher" | "student" | null

interface LoginScreenProps {
  onLogin: (role: UserRole) => void
  onBack: () => void
}

export function LoginScreen({ onLogin, onBack }: LoginScreenProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin(selectedRole)
  }

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <header className="mb-8 flex items-center gap-4">
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

        {/* Role Selection */}
        {!selectedRole ? (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">Welcome!</h1>
              <p className="mt-2 text-muted-foreground">Who are you?</p>
            </div>

            <div className="grid gap-4">
              {/* Teacher Card */}
              <Card 
                className="cursor-pointer border-2 border-transparent transition-all hover:border-primary hover:shadow-lg"
                onClick={() => setSelectedRole("teacher")}
              >
                <CardContent className="flex items-center gap-4 p-6">
                  <Avatar className="size-16 bg-gradient-to-br from-blue-400 to-blue-600">
                    <AvatarFallback className="bg-transparent text-white">
                      <GraduationCap className="size-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">I&apos;m a Teacher</h3>
                    <p className="text-sm text-muted-foreground">
                      Create classrooms and manage topics
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Student Card */}
              <Card 
                className="cursor-pointer border-2 border-transparent transition-all hover:border-primary hover:shadow-lg"
                onClick={() => setSelectedRole("student")}
              >
                <CardContent className="flex items-center gap-4 p-6">
                  <Avatar className="size-16 bg-gradient-to-br from-pink-400 to-purple-500">
                    <AvatarFallback className="bg-transparent text-white">
                      <BookOpen className="size-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">I&apos;m a Student</h3>
                    <p className="text-sm text-muted-foreground">
                      Join a classroom and play challenges
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Login Form */
          <div className="space-y-6">
            <div className="text-center">
              <div className={`mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl ${
                selectedRole === "teacher" 
                  ? "bg-gradient-to-br from-blue-400 to-blue-600" 
                  : "bg-gradient-to-br from-pink-400 to-purple-500"
              }`}>
                {selectedRole === "teacher" ? (
                  <GraduationCap className="size-8 text-white" />
                ) : (
                  <BookOpen className="size-8 text-white" />
                )}
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                {selectedRole === "teacher" ? "Teacher Login" : "Student Login"}
              </h1>
              <p className="mt-2 text-muted-foreground">
                Enter your details to continue
              </p>
            </div>

            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Sign In</CardTitle>
                <CardDescription>
                  {selectedRole === "teacher" 
                    ? "Access your classroom dashboard" 
                    : "Join your classroom"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Google Sign In Button */}
                  <Button 
                    type="button"
                    variant="outline" 
                    className="h-12 w-full gap-3 rounded-xl font-medium"
                    onClick={() => onLogin(selectedRole)}
                  >
                    <svg className="size-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continue with Google
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="********"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12"
                    />
                  </div>
                  <div className="text-center text-sm">
                    <Link href="/signup" className="text-primary underline">Create an internal account</Link>
                  </div>
                  {/* Classroom code removed per request */}

                  <Button type="submit" className="h-12 w-full rounded-xl font-semibold">
                    Sign In with Email
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setSelectedRole(null)}
            >
              <ArrowLeft className="mr-2 size-4" />
              Choose different role
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
