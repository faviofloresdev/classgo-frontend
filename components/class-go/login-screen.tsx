"use client"

import { useEffect, useRef, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, BookOpen, GraduationCap, Zap } from "lucide-react"
import Link from "next/link"

interface LoginScreenProps {
  onTeacherLogin: (email: string, password: string) => Promise<void>
  onStudentLogin: (email: string, password: string) => Promise<void>
  onGoogleLogin: (role: "teacher" | "student", idToken: string) => Promise<void>
  onBack: () => void
}

const GOOGLE_SCRIPT_ID = "google-identity-services"
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || ""
const HAS_VALID_GOOGLE_CLIENT_ID = GOOGLE_CLIENT_ID.endsWith(".apps.googleusercontent.com")

export function LoginScreen({
  onTeacherLogin,
  onStudentLogin,
  onGoogleLogin,
  onBack,
}: LoginScreenProps) {
  const [selectedRole, setSelectedRole] = useState<"teacher" | "student" | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const googleButtonRef = useRef<HTMLDivElement | null>(null)
  const selectedRoleRef = useRef<"teacher" | "student" | null>(null)
  const onGoogleLoginRef = useRef(onGoogleLogin)
  const hasInitializedGoogleRef = useRef(false)

  useEffect(() => {
    selectedRoleRef.current = selectedRole
  }, [selectedRole])

  useEffect(() => {
    onGoogleLoginRef.current = onGoogleLogin
  }, [onGoogleLogin])

  useEffect(() => {
    if (!selectedRole || !HAS_VALID_GOOGLE_CLIENT_ID || !googleButtonRef.current) {
      return
    }

    let isCancelled = false

    const handleGoogleError = () => {
      if (isCancelled) return
      setIsGoogleLoading(false)
      setError("Could not load Google Login.")
    }

    const renderGoogleButton = () => {
      if (
        isCancelled ||
        !googleButtonRef.current ||
        !window.google?.accounts?.id
      ) {
        return
      }

      googleButtonRef.current.innerHTML = ""
      if (!hasInitializedGoogleRef.current) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async ({ credential }) => {
            const currentRole = selectedRoleRef.current

            if (!credential) {
              setError("Google did not return a valid token.")
              return
            }

            if (!currentRole) {
              setError("Choose a role before continuing with Google.")
              return
            }

            setIsSubmitting(true)
            setError("")

            try {
              await onGoogleLoginRef.current(currentRole, credential)
            } catch (submissionError) {
              setError(
                submissionError instanceof Error
                  ? submissionError.message
                  : "Google sign-in failed."
              )
            } finally {
              setIsSubmitting(false)
            }
          },
        })
        hasInitializedGoogleRef.current = true
      }

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "continue_with",
        width: 360,
      })
      setIsGoogleLoading(false)
    }

    setIsGoogleLoading(true)

    if (window.google?.accounts?.id) {
      renderGoogleButton()
      return
    }

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null
    if (existingScript) {
      existingScript.addEventListener("load", renderGoogleButton)
      existingScript.addEventListener("error", handleGoogleError)

      return () => {
        isCancelled = true
        existingScript.removeEventListener("load", renderGoogleButton)
        existingScript.removeEventListener("error", handleGoogleError)
      }
    }

    const script = document.createElement("script")
    script.id = GOOGLE_SCRIPT_ID
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.addEventListener("load", renderGoogleButton)
    script.addEventListener("error", handleGoogleError)
    document.head.appendChild(script)

    return () => {
      isCancelled = true
      script.removeEventListener("load", renderGoogleButton)
      script.removeEventListener("error", handleGoogleError)
    }
  }, [selectedRole])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) return

    setIsSubmitting(true)
    setError("")

    try {
      if (selectedRole === "teacher") {
        await onTeacherLogin(email, password)
      } else {
        await onStudentLogin(email, password)
      }
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Sign-in failed."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-md">
        <header className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
            <ArrowLeft className="size-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Zap className="size-5" />
            </div>
            <span className="text-xl font-bold text-foreground">Class Go</span>
          </div>
        </header>

        {!selectedRole ? (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">Welcome!</h1>
              <p className="mt-2 text-muted-foreground">Who are you?</p>
            </div>

            <div className="grid gap-4">
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
                      Access your classrooms, plans, and topics
                    </p>
                  </div>
                </CardContent>
              </Card>

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
                      Sign in, create an account, or continue with Google
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <div
                className={`mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl ${
                  selectedRole === "teacher"
                    ? "bg-gradient-to-br from-blue-400 to-blue-600"
                    : "bg-gradient-to-br from-pink-400 to-purple-500"
                }`}
              >
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
                {selectedRole === "teacher"
                  ? "Sign in with your account"
                  : "Sign in with your student account"}
              </p>
            </div>

            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">
                  Sign In
                </CardTitle>
                <CardDescription>
                  {selectedRole === "teacher"
                    ? "Access your teacher dashboard"
                    : "Access your classrooms and challenges"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {HAS_VALID_GOOGLE_CLIENT_ID && (
                    <>
                      <div className="space-y-2">
                        <div ref={googleButtonRef} className="flex min-h-11 justify-center" />
                        {isGoogleLoading && (
                          <p className="text-center text-xs text-muted-foreground">
                            Loading Google sign-in...
                          </p>
                        )}
                      </div>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-card px-2 text-muted-foreground">
                            Or continue with email
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  {!HAS_VALID_GOOGLE_CLIENT_ID && (
                    <p className="text-sm text-muted-foreground">
                      Google Login is disabled because `NEXT_PUBLIC_GOOGLE_CLIENT_ID` does not contain a valid web client ID.
                    </p>
                  )}

                  <>
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
                      <Link
                        href={`/signup?role=${selectedRole === "teacher" ? "teacher" : "student"}`}
                        className="text-primary underline"
                      >
                        {selectedRole === "teacher"
                          ? "Create a teacher account"
                          : "Create a student account"}
                      </Link>
                    </div>
                  </>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <Button
                    type="submit"
                    className="h-12 w-full rounded-xl font-semibold"
                    disabled={isSubmitting || !email.trim() || !password.trim()}
                  >
                    {isSubmitting ? (
                      "Signing in..."
                    ) : selectedRole === "teacher" ? (
                      "Sign In with Email"
                    ) : (
                      "Sign In as Student"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setSelectedRole(null)
                setError("")
              }}
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
