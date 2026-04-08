"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getAvatarUrl } from "@/lib/avatars"
import { BookOpen, Heart, LineChart, ShieldCheck, Users } from "lucide-react"

interface LandingPageProps {
  onGetStarted: () => void
}

const featureCards = [
  {
    icon: BookOpen,
    title: "Support school learning",
    description:
      "Activities designed to review what children learn in class through games, competition, and weekly points.",
    tone: "bg-primary/10 text-primary",
  },
  {
    icon: Users,
    title: "Meaningful family time",
    description:
      "Moms and dads can support from home and take part in learning in a simple, close way.",
    tone: "bg-pink-100 text-pink-500",
  },
  {
    icon: ShieldCheck,
    title: "Guided and safe technology",
    description:
      "A controlled digital space that works as a safe bridge for information between home and school.",
    tone: "bg-accent/20 text-accent-foreground",
  },
]

const teacherCards = [
  {
    icon: LineChart,
    title: "See progress beyond the classroom",
    description:
      "Teachers can follow how students are doing at home and understand their progress on any topic they choose to work on.",
    tone: "bg-primary/10 text-primary",
  },
  {
    icon: BookOpen,
    title: "Guide the next learning step",
    description:
      "With clearer information, teachers can reinforce a specific skill, revisit a topic, or focus on what each group needs most.",
    tone: "bg-accent/20 text-accent-foreground",
  },
]

const floatingAvatars = [
  {
    id: "parent-1",
    alt: "Avatar de familia",
    className: "left-2 top-20 sm:left-4 lg:left-8",
    size: "h-14 w-14 md:h-16 md:w-16",
    delay: 0,
  },
  {
    id: "animal-3",
    alt: "Avatar de estudiante",
    className: "right-3 top-24 sm:right-5 lg:right-10",
    size: "h-13 w-13 md:h-15 md:w-15",
    delay: 0.5,
  },
  {
    id: "char-2",
    alt: "Avatar de estudiante",
    className: "right-2 top-[28rem] sm:right-8 lg:top-80",
    size: "h-12 w-12 md:h-14 md:w-14",
    delay: 1,
  },
  {
    id: "animal-6",
    alt: "Avatar de estudiante",
    className: "left-4 top-[22rem] sm:left-8 lg:left-14",
    size: "h-13 w-13 md:h-15 md:w-15",
    delay: 1.4,
  },
  {
    id: "robot-5",
    alt: "Avatar de estudiante",
    className: "right-6 top-[11rem] md:right-12 lg:right-20",
    size: "h-12 w-12 md:h-14 md:w-14",
    delay: 1.8,
  },
]

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const introAudioRef = useRef<HTMLAudioElement | null>(null)
  const howItWorksRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const audio = new Audio("/audio/intro.mp3")
    audio.volume = 0.35
    audio.loop = true
    introAudioRef.current = audio

    void audio.play().catch(() => {
      // Some browsers require user interaction before playback.
    })

    return () => {
      audio.pause()
      audio.currentTime = 0
    }
  }, [])

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f2ff_0%,#fffdfd_28%,#faf7fb_100%)]">
      <div className="relative overflow-hidden px-2 py-2 sm:px-4">
        <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.10)_0%,transparent_30%)]" />
        <div className="absolute left-0 top-0 h-40 w-40 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute bottom-24 right-0 h-40 w-40 rounded-full bg-pink-200/25 blur-3xl" />

        {floatingAvatars.map((avatar) => (
          <motion.img
            key={avatar.id}
            src={getAvatarUrl(avatar.id)}
            alt={avatar.alt}
            crossOrigin="anonymous"
            className={`absolute ${avatar.className} ${avatar.size} rounded-full border-4 border-white bg-white shadow-lg`}
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: avatar.delay,
            }}
          />
        ))}

        <div className="relative mx-auto max-w-6xl rounded-[2rem] border border-primary/8 bg-white/55 shadow-[0_20px_60px_rgba(91,33,182,0.08)] backdrop-blur-sm">
          <section className="px-6 pb-10 pt-6 md:px-10 lg:px-14 lg:pb-14">
            <header className="mb-10 flex items-center justify-center gap-3 pt-2 md:justify-start">
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl shadow-md">
                <svg viewBox="0 0 180 180" className="h-full w-full" aria-hidden="true">
                  <defs>
                    <linearGradient id="landing-logo-bg" x1="24" y1="18" x2="156" y2="162" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#6366F1" />
                      <stop offset="1" stopColor="#EC4899" />
                    </linearGradient>
                  </defs>
                  <rect width="180" height="180" rx="40" fill="url(#landing-logo-bg)" />
                  <path
                    d="M118.557 51.5781C119.69 45.5391 112.931 41.0469 107.697 44.25L53.7422 77.2656C48.1172 80.6953 49.8398 89.2812 56.2891 90.2812L77.7188 93.5859C79.9219 93.9258 82.0703 92.9727 83.3359 91.1328L103.861 61.3594L88.1699 92.5312C86.8828 95.0898 87.7617 98.2148 90.1914 99.7109L101.42 106.625C104.757 108.68 109.103 106.728 109.804 102.875L118.557 51.5781Z"
                    fill="white"
                  />
                  <path
                    d="M74.6719 108.281L65.5 125.234C63.5156 128.906 68.0859 132.707 71.4453 129.758L89.1406 114.227C90.7266 112.836 90.3672 110.281 88.4375 109.375L79.9141 105.375C77.9688 104.461 75.707 106.367 74.6719 108.281Z"
                    fill="#FDE68A"
                  />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-[2rem] font-black tracking-tight text-foreground">Class Go</p>
              </div>
            </header>

            <div className="mx-auto grid min-h-[calc(100svh-6rem)] max-w-5xl items-center gap-10 md:min-h-[620px] md:grid-cols-[1.05fr_0.95fr] md:gap-8">
              <div className="order-2 flex flex-col items-center text-center md:order-1 md:items-start md:text-left">
                <h1 className="text-[2.65rem] font-black leading-[0.98] tracking-tight text-foreground md:max-w-xl md:text-[3.4rem]">
                  Learning together
                  <span className="block text-primary">feels more fun</span>
                </h1>

                <p className="mt-5 max-w-sm text-[1.03rem] leading-8 text-muted-foreground md:max-w-lg md:text-lg">
                  A space where children and families share learning, follow weekly points, and
                  stay involved together through guided technology.
                </p>

                <div className="mt-8 flex w-full max-w-sm flex-col gap-3 md:max-w-md">
                  <Button
                    onClick={onGetStarted}
                    size="lg"
                    className="h-14 rounded-2xl bg-primary text-lg font-black text-primary-foreground shadow-[0_18px_35px_rgba(91,33,182,0.18)] hover:bg-primary/90"
                  >
                    Join with us
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      howItWorksRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      })
                    }}
                    className="h-14 rounded-2xl border-white bg-white/75 text-base font-bold text-foreground shadow-sm hover:bg-white"
                  >
                    How does it work?
                  </Button>
                </div>

                <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <span className="text-yellow-500">✦</span>
                  Designed to learn, compete, and grow as a family
                </div>
              </div>

              <div className="order-1 flex justify-center md:order-2 md:justify-end">
                <div className="w-full max-w-md rounded-[2rem] bg-white/80 px-6 py-6 shadow-[0_18px_40px_rgba(91,33,182,0.08)] md:max-w-[430px]">
                  <div className="mb-6 flex items-center justify-center gap-2">
                    <img
                      src={getAvatarUrl("parent-1")}
                      alt="Avatar familiar"
                      className="h-14 w-14 rounded-full border-4 border-white shadow-md md:h-16 md:w-16"
                      crossOrigin="anonymous"
                    />
                    <img
                      src={getAvatarUrl("animal-2")}
                      alt="Avatar estudiante"
                      className="h-16 w-16 rounded-full border-4 border-white shadow-md md:h-20 md:w-20"
                      crossOrigin="anonymous"
                    />
                    <img
                      src={getAvatarUrl("animal-5")}
                      alt="Avatar estudiante"
                      className="h-14 w-14 rounded-full border-4 border-white shadow-md md:h-16 md:w-16"
                      crossOrigin="anonymous"
                    />
                  </div>

                  <div className="grid gap-3">
                    <div className="rounded-[1.4rem] border border-primary/8 bg-background px-4 py-4 text-left">
                      <p className="text-sm font-black text-foreground">Competition with purpose</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Weekly points help keep motivation and consistency high.
                      </p>
                    </div>
                    <div className="rounded-[1.4rem] border border-primary/8 bg-background px-4 py-4 text-left">
                      <p className="text-sm font-black text-foreground">Family participation</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Families follow the process and better understand how to support.
                      </p>
                    </div>
                    <div className="rounded-[1.4rem] border border-primary/8 bg-background px-4 py-4 text-left">
                      <p className="text-sm font-black text-foreground">Guided technology</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        An organized environment to learn and share useful information.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            ref={howItWorksRef}
            className="border-t border-primary/6 bg-[linear-gradient(180deg,rgba(120,83,220,0.04)_0%,rgba(255,255,255,0)_100%)] px-6 py-14 md:px-10 lg:px-14"
          >
            <div className="mx-auto max-w-5xl">
              <h2 className="text-center text-3xl font-black tracking-tight text-foreground">
                Why families choose Class Go
              </h2>
              <p className="mt-3 text-center text-base leading-7 text-muted-foreground">
                Because learning together can feel clear, safe, and exciting.
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {featureCards.map((feature) => (
                  <Card
                    key={feature.title}
                    className="h-full rounded-[2rem] border border-primary/8 bg-white/92 shadow-[0_14px_35px_rgba(15,23,42,0.06)]"
                  >
                    <CardContent className="p-6">
                      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${feature.tone}`}>
                        <feature.icon className="size-5" />
                      </div>
                      <h3 className="text-[1.55rem] font-black leading-tight text-foreground">
                        {feature.title}
                      </h3>
                      <p className="mt-3 text-base leading-8 text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          <section className="border-t border-primary/6 px-6 py-14 md:px-10 lg:px-14">
            <div className="mx-auto max-w-5xl">
              <h2 className="text-center text-3xl font-black tracking-tight text-foreground">
                Built for teachers too
              </h2>
              <p className="mt-3 text-center text-base leading-7 text-muted-foreground">
                Class Go helps teachers understand student progress outside class and use that
                information to guide what matters most next.
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {teacherCards.map((card) => (
                  <Card
                    key={card.title}
                    className="h-full rounded-[2rem] border border-primary/8 bg-white/92 shadow-[0_14px_35px_rgba(15,23,42,0.06)]"
                  >
                    <CardContent className="p-6">
                      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${card.tone}`}>
                        <card.icon className="size-5" />
                      </div>
                      <h3 className="text-[1.55rem] font-black leading-tight text-foreground">
                        {card.title}
                      </h3>
                      <p className="mt-3 text-base leading-8 text-muted-foreground">
                        {card.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          <section className="px-6 py-16 md:px-10 lg:px-14">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-pink-100 text-pink-500">
                <Heart className="size-8" />
              </div>
              <h2 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
                Grow, play, and learn
                <span className="block">together as a family</span>
              </h2>
              <p className="mt-4 text-base leading-8 text-muted-foreground md:text-lg">
                Class Go turns screen time into meaningful time: weekly competition, recognition,
                useful information, and support from home.
              </p>

              <Button
                onClick={onGetStarted}
                size="lg"
                className="mt-8 h-14 w-full rounded-2xl bg-primary text-lg font-black text-primary-foreground shadow-[0_18px_35px_rgba(91,33,182,0.18)] hover:bg-primary/90 md:mx-auto md:max-w-md"
              >
                Join Class Go
              </Button>

              <p className="mt-4 text-sm font-medium text-muted-foreground">
                Free for families · Weekly competition · Guided environment
              </p>
            </div>
          </section>

          <footer className="border-t border-primary/6 px-6 py-8">
            <div className="mx-auto max-w-md text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-2 text-sm font-bold text-primary-foreground">
                <span>✦</span>
                Class Go
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                learn + play + family + trust
              </p>
              <p className="mt-2 text-sm text-muted-foreground">© 2026 Class Go</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
