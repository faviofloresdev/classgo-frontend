"use client"

import { useEffect, useRef, useState } from "react"
import { Volume2, VolumeX } from "lucide-react"
import { HexBadgeSVG } from "@/components/class-go/badge-visual"
import type { BadgeDefinition } from "@/lib/badges"

interface BadgeCeremonyProps {
  badges: BadgeDefinition[]
  onDone?: () => void
}

const MELODIES = [
  [523, 659, 784, 1047],
  [440, 554, 659, 880],
  [392, 494, 587, 784],
]

function playSequence(frequencies: number[], soundOn: boolean) {
  if (!soundOn || typeof window === "undefined") return

  const AudioContextClass =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

  if (!AudioContextClass) return

  try {
    const context = new AudioContextClass()
    frequencies.forEach((frequency, index) => {
      const oscillator = context.createOscillator()
      const gainNode = context.createGain()
      const startAt = context.currentTime + index * 0.12

      oscillator.type = index % 2 === 0 ? "sine" : "triangle"
      oscillator.frequency.setValueAtTime(frequency, startAt)
      gainNode.gain.setValueAtTime(0.0001, startAt)
      gainNode.gain.exponentialRampToValueAtTime(0.14, startAt + 0.03)
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.34)

      oscillator.connect(gainNode)
      gainNode.connect(context.destination)
      oscillator.start(startAt)
      oscillator.stop(startAt + 0.38)
    })

    window.setTimeout(() => {
      void context.close().catch(() => undefined)
    }, 1200)
  } catch {
    // Ignore audio failures.
  }
}

export function BadgeCeremony({ badges, onDone }: BadgeCeremonyProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [phase, setPhase] = useState<"enter" | "idle" | "exit">("enter")
  const [soundOn, setSoundOn] = useState(true)
  const [rotAngle, setRotAngle] = useState(0)
  const [glowOpacity, setGlowOpacity] = useState(0.38)
  const timerRef = useRef<number | null>(null)
  const phaseTimerRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const badge = badges[currentIndex]

  useEffect(() => {
    let angle = 0
    const loop = () => {
      angle += 0.26
      setRotAngle(angle)
      setGlowOpacity(0.25 + 0.35 * Math.abs(Math.sin(Date.now() / 950)))
      rafRef.current = window.requestAnimationFrame(loop)
    }
    rafRef.current = window.requestAnimationFrame(loop)
    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  useEffect(() => {
    setPhase("enter")
    playSequence(MELODIES[currentIndex % MELODIES.length], soundOn)

    phaseTimerRef.current = window.setTimeout(() => {
      setPhase("idle")
    }, 950)

    timerRef.current = window.setTimeout(() => {
      setPhase("exit")
      window.setTimeout(() => {
        if (currentIndex >= badges.length - 1) {
          onDone?.()
          return
        }

        setCurrentIndex((value) => value + 1)
      }, 420)
    }, 3200)

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
      }
      if (phaseTimerRef.current) {
        window.clearTimeout(phaseTimerRef.current)
      }
    }
  }, [badges.length, currentIndex, onDone, soundOn])

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 text-white"
      style={{ background: badge.c.bg }}
    >
      <style>{`
        @keyframes badge-drop-in {
          0% { transform: translateY(-140px) scale(.55) rotate(-18deg); opacity: 0; }
          65% { transform: translateY(16px) scale(1.06) rotate(4deg); opacity: 1; }
          100% { transform: translateY(0) scale(1) rotate(0); opacity: 1; }
        }
        @keyframes badge-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes badge-fly-out {
          from { transform: translateY(0) scale(1); opacity: 1; }
          to { transform: translateY(-90px) scale(.72) rotate(8deg); opacity: 0; }
        }
        @keyframes badge-pulse {
          0%, 100% { transform: scale(1); opacity: .45; }
          50% { transform: scale(1.08); opacity: .75; }
        }
      `}</style>

      <div className="absolute left-[-4rem] top-[-2rem] h-48 w-48 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-[-3rem] right-[-3rem] h-64 w-64 rounded-full bg-pink-400/20 blur-3xl" />

      <button
        type="button"
        onClick={() => setSoundOn((value) => !value)}
        className="absolute right-4 top-4 z-20 rounded-full border border-white/15 bg-white/10 p-3 text-white/90 backdrop-blur"
        aria-label={soundOn ? "Mute ceremony sound" : "Enable ceremony sound"}
      >
        {soundOn ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
      </button>

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center">
        <p className="mb-4 text-xs font-black uppercase tracking-[0.42em] text-white/65">
          Reward Unlocked
        </p>

        <div
          className="relative mb-7 flex h-64 w-64 items-center justify-center sm:h-72 sm:w-72"
          style={{
            animation:
              phase === "enter"
                ? "badge-drop-in .95s cubic-bezier(.34,1.1,.64,1) both"
                : phase === "exit"
                  ? "badge-fly-out .42s ease-in both"
                  : "badge-float 3s ease-in-out infinite",
          }}
        >
          <div
            className="absolute inset-4 rounded-[2.5rem] blur-2xl"
            style={{ background: `radial-gradient(circle, ${badge.glow} 0%, transparent 70%)`, animation: "badge-pulse 1.8s ease-in-out infinite" }}
          />
          <HexBadgeSVG badge={badge} size={290} rotAngle={rotAngle} glowOpacity={glowOpacity} />
        </div>

        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{badge.name}</h1>
        <p
          className="mt-3 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.22em]"
          style={{ background: badge.catBg, color: badge.catTxt }}
        >
          {badge.category}
        </p>
        <p className="mt-5 max-w-lg text-base leading-7 text-white/80 sm:text-lg">{badge.description}</p>
        <p className="mt-3 text-sm font-medium text-white/70">{currentIndex + 1} of {badges.length}</p>
      </div>
    </div>
  )
}
