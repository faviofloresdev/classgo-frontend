"use client"

import type { BadgeDefinition } from "@/lib/badges"

const ICO = 0.4

function hexPoints(cx: number, cy: number, r: number, angleDeg = 0) {
  return Array.from({ length: 6 }, (_, index) => {
    const angle = (Math.PI / 180) * (60 * index - 30 + angleDeg)
    return `${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`
  }).join(" ")
}

interface HexBadgeSVGProps {
  badge: BadgeDefinition
  size?: number
  rotAngle?: number
  glowOpacity?: number
  locked?: boolean
  compact?: boolean
}

export function HexBadgeSVG({
  badge,
  size = 228,
  rotAngle = 0,
  glowOpacity = 0.38,
  locked = false,
  compact = false,
}: HexBadgeSVGProps) {
  const c = badge.c
  const R = 90
  const pad = 24
  const cx = R + pad
  const cy = R + pad
  const W = (R + pad) * 2
  const uid = `${badge.id}-${size}-${locked ? "locked" : "open"}`

  const pts = hexPoints(cx, cy, R)
  const ptsI = hexPoints(cx, cy, R - 7)
  const ptsI2 = hexPoints(cx, cy, R - 16)
  const ptsRim = hexPoints(cx, cy, R + 5)
  const ptsO = hexPoints(cx, cy, R + 14)
  const ptsRot = hexPoints(cx, cy, R + 20, rotAngle)

  const iconHTML = badge.buildIcon(cx, cy, R)
  const pipCx = (cx + R * 0.64).toFixed(1)
  const pipCy = (cy - R * 0.6).toFixed(1)
  const grayscale = locked ? "grayscale(1) saturate(.4) brightness(.9)" : undefined

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${W} ${W}`}
      style={{
        overflow: "visible",
        filter: `${locked ? grayscale : ""} ${
          compact
            ? `drop-shadow(0 8px 16px ${c.gw}66) drop-shadow(0 3px 8px rgba(0,0,0,.35))`
            : `drop-shadow(0 18px 44px ${c.gw}cc) drop-shadow(0 6px 18px rgba(0,0,0,.6))`
        }`,
      }}
    >
      <defs>
        <linearGradient id={`gM-${uid}`} x1=".15" y1="0" x2=".85" y2="1">
          <stop offset="0%" stopColor={c.g0} />
          <stop offset="45%" stopColor={c.g1} />
          <stop offset="100%" stopColor={c.g2} />
        </linearGradient>
        <linearGradient id={`gR-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.r0} stopOpacity=".95" />
          <stop offset="100%" stopColor={c.r1} />
        </linearGradient>
        <linearGradient id={`gT-${uid}`} x1=".08" y1="0" x2=".9" y2=".55">
          <stop offset="0%" stopColor="white" stopOpacity=".9" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`gB-${uid}`} x1="0" y1=".2" x2="0" y2="1">
          <stop offset="0%" stopColor={c.g2} stopOpacity="0" />
          <stop offset="100%" stopColor={c.g2} stopOpacity=".6" />
        </linearGradient>
        <radialGradient id={`gC-${uid}`} cx="35%" cy="26%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity=".45" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`gA-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={c.g1} stopOpacity=".7" />
          <stop offset="100%" stopColor={c.g1} stopOpacity="0" />
        </radialGradient>
        <clipPath id={`cp-${uid}`}>
          <polygon points={pts} />
        </clipPath>
        <filter id={`bl-${uid}`}>
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id={`ib-${uid}`}>
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
      </defs>

      <polygon points={ptsRot} fill="none" stroke={c.r1} strokeWidth="2" strokeDasharray="8 12" opacity=".55" />
      <polygon points={ptsO} fill="none" stroke={c.gw} strokeWidth="6" opacity={glowOpacity} />
      <polygon points={pts} fill={`url(#gA-${uid})`} filter={`url(#bl-${uid})`} transform="translate(0,16)" opacity=".95" />
      <polygon points={ptsRim} fill={`url(#gR-${uid})`} stroke={c.r1} strokeWidth="2" opacity=".95" />
      <polygon points={pts} fill={`url(#gM-${uid})`} stroke={c.g2} strokeWidth="3" />
      <polygon points={ptsI} fill="none" stroke="white" strokeWidth="1.8" opacity=".28" />
      <polygon points={ptsI2} fill="none" stroke="white" strokeWidth=".9" opacity=".12" />
      <polygon points={pts} fill={`url(#gB-${uid})`} clipPath={`url(#cp-${uid})`} />
      <polygon points={pts} fill={`url(#gT-${uid})`} clipPath={`url(#cp-${uid})`} opacity=".9" />
      <polygon points={pts} fill={`url(#gC-${uid})`} clipPath={`url(#cp-${uid})`} />

      <g
        opacity=".3"
        filter={`url(#ib-${uid})`}
        transform="translate(0,5)"
        dangerouslySetInnerHTML={{ __html: iconHTML }}
      />
      <g dangerouslySetInnerHTML={{ __html: iconHTML }} />

      {!locked && (
        <>
          <circle cx={pipCx} cy={pipCy} r="12" fill={c.g1} stroke="white" strokeWidth="3" />
          <text
            x={pipCx}
            y={`${(parseFloat(pipCy) + 6.5).toFixed(1)}`}
            textAnchor="middle"
            fontSize="12"
            fill="white"
            fontWeight="900"
            fontFamily="-apple-system,sans-serif"
          >
            ✦
          </text>
        </>
      )}
    </svg>
  )
}

export function buildCompassIcon(cx: number, cy: number, R: number) {
  const s = R * ICO
  const r = s
  const r2 = s * 0.72
  const r3 = s * 0.34
  let d = ""
  d += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="white" stroke-width="3.5" opacity=".35"/>`
  d += `<circle cx="${cx}" cy="${cy}" r="${r3}" fill="none" stroke="white" stroke-width="1.5" opacity=".2"/>`
  for (let i = 0; i < 8; i += 1) {
    const a = (Math.PI / 180) * 45 * i
    const major = i % 2 === 0
    const x1 = cx + Math.cos(a) * (r - 1)
    const y1 = cy + Math.sin(a) * (r - 1)
    const x2 = cx + Math.cos(a) * (r - (major ? 16 : 9))
    const y2 = cy + Math.sin(a) * (r - (major ? 16 : 9))
    d += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="white" stroke-width="${major ? 3.5 : 2}" stroke-linecap="round" opacity="${major ? 0.8 : 0.4}"/>`
  }
  d += `<text x="${cx}" y="${(cy - r + 22).toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-size="15" font-weight="900" fill="white" opacity=".7" font-family="-apple-system,sans-serif">N</text>`
  const ang = -Math.PI / 4
  const np = { x: cx + Math.cos(ang) * r2, y: cy + Math.sin(ang) * r2 }
  const sp = { x: cx + Math.cos(ang + Math.PI) * r2 * 0.68, y: cy + Math.sin(ang + Math.PI) * r2 * 0.68 }
  const pw = 14
  const perp = { x: Math.cos(ang + Math.PI / 2) * pw, y: Math.sin(ang + Math.PI / 2) * pw }
  d += `<polygon points="${np.x.toFixed(1)},${np.y.toFixed(1)} ${(cx + perp.x).toFixed(1)},${(cy + perp.y).toFixed(1)} ${sp.x.toFixed(1)},${sp.y.toFixed(1)} ${(cx - perp.x).toFixed(1)},${(cy - perp.y).toFixed(1)}" fill="white" opacity=".95"/>`
  d += `<circle cx="${np.x.toFixed(1)}" cy="${np.y.toFixed(1)}" r="6" fill="white" opacity="1"/>`
  d += `<circle cx="${cx}" cy="${cy}" r="8" fill="white" opacity=".95"/>`
  d += `<circle cx="${cx}" cy="${cy}" r="4" fill="white" opacity=".5"/>`
  return d
}

export function buildFlameIcon(cx: number, cy: number, R: number) {
  const s = R * ICO
  const h = s * 1.04
  const w = s * 0.7
  let d = ""
  d += `<path d="M${cx} ${(cy - h).toFixed(1)} C${(cx + w * 0.78).toFixed(1)} ${(cy - h * 0.56).toFixed(1)} ${(cx + w * 0.9).toFixed(1)} ${(cy + h * 0.02).toFixed(1)} ${(cx + w * 0.42).toFixed(1)} ${(cy + h * 0.56).toFixed(1)} C${(cx + w * 0.16).toFixed(1)} ${(cy + h * 0.84).toFixed(1)} ${(cx + w * 0.08).toFixed(1)} ${(cy + h * 1.02).toFixed(1)} ${cx} ${(cy + h * 1.02).toFixed(1)} C${(cx - w * 0.08).toFixed(1)} ${(cy + h * 1.02).toFixed(1)} ${(cx - w * 0.16).toFixed(1)} ${(cy + h * 0.84).toFixed(1)} ${(cx - w * 0.42).toFixed(1)} ${(cy + h * 0.56).toFixed(1)} C${(cx - w * 0.9).toFixed(1)} ${(cy + h * 0.02).toFixed(1)} ${(cx - w * 0.78).toFixed(1)} ${(cy - h * 0.56).toFixed(1)} ${cx} ${(cy - h).toFixed(1)} Z" fill="white" opacity=".9"/>`
  const h2 = h * 0.58
  const w2 = w * 0.52
  d += `<path d="M${cx} ${(cy - h2 * 0.82).toFixed(1)} C${(cx + w2 * 0.64).toFixed(1)} ${(cy - h2 * 0.28).toFixed(1)} ${(cx + w2 * 0.7).toFixed(1)} ${(cy + h2 * 0.18).toFixed(1)} ${(cx + w2 * 0.24).toFixed(1)} ${(cy + h2 * 0.58).toFixed(1)} C${(cx + w2 * 0.1).toFixed(1)} ${(cy + h2 * 0.78).toFixed(1)} ${(cx + w2 * 0.04).toFixed(1)} ${(cy + h2 * 0.92).toFixed(1)} ${cx} ${(cy + h2 * 0.92).toFixed(1)} C${(cx - w2 * 0.04).toFixed(1)} ${(cy + h2 * 0.92).toFixed(1)} ${(cx - w2 * 0.1).toFixed(1)} ${(cy + h2 * 0.78).toFixed(1)} ${(cx - w2 * 0.24).toFixed(1)} ${(cy + h2 * 0.58).toFixed(1)} C${(cx - w2 * 0.7).toFixed(1)} ${(cy + h2 * 0.18).toFixed(1)} ${(cx - w2 * 0.64).toFixed(1)} ${(cy - h2 * 0.28).toFixed(1)} ${cx} ${(cy - h2 * 0.82).toFixed(1)} Z" fill="white" opacity=".44"/>`
  d += `<ellipse cx="${cx}" cy="${(cy + h * 0.22).toFixed(1)}" rx="${(w * 0.24).toFixed(1)}" ry="${(h * 0.18).toFixed(1)}" fill="white" opacity=".2"/>`
  ;[
    [cx - w * 0.52, cy - h * 0.1],
    [cx + w * 0.54, cy - h * 0.08],
    [cx - w * 0.28, cy - h * 0.68],
    [cx + w * 0.28, cy - h * 0.66],
  ].forEach(([x, y]) => {
    d += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" fill="white" opacity=".52"/>`
  })
  return d
}

export function buildStarIcon(cx: number, cy: number, R: number) {
  const s = R * ICO
  function star5(x: number, y: number, r: number, rot = -Math.PI / 2) {
    const inner = r * 0.4
    const pts = 5
    const step = Math.PI / pts
    let p = ""
    for (let i = 0; i < pts * 2; i += 1) {
      const a = i * step + rot
      const rr = i % 2 === 0 ? r : inner
      p += `${i === 0 ? "M" : "L"}${(x + Math.cos(a) * rr).toFixed(2)},${(y + Math.sin(a) * rr).toFixed(2)}`
    }
    return `${p}Z`
  }
  let d = ""
  d += `<circle cx="${cx}" cy="${cy}" r="${(s * 0.52).toFixed(1)}" fill="white" opacity=".07"/>`
  d += `<path d="${star5(cx, cy, s)}" fill="white" opacity=".95"/>`
  ;[
    { x: cx - s * 0.58, y: cy - s * 0.5, r: s * 0.28 },
    { x: cx + s * 0.6, y: cy - s * 0.48, r: s * 0.22 },
    { x: cx - s * 0.52, y: cy + s * 0.54, r: s * 0.2 },
    { x: cx + s * 0.55, y: cy + s * 0.52, r: s * 0.25 },
  ].forEach((point) => {
    d += `<path d="${star5(point.x, point.y, point.r)}" fill="white" opacity=".68"/>`
  })
  ;[0, 72, 144, 216, 288].forEach((deg) => {
    const a = (deg * Math.PI) / 180 - Math.PI / 2
    d += `<line x1="${cx}" y1="${cy}" x2="${(cx + Math.cos(a) * s * 0.98).toFixed(1)}" y2="${(cy + Math.sin(a) * s * 0.98).toFixed(1)}" stroke="white" stroke-width="1.5" opacity=".12"/>`
  })
  return d
}

export function buildRocketIcon(cx: number, cy: number, R: number) {
  const s = R * ICO
  const bodyH = s * 1.25
  const bodyW = s * 0.58
  let d = ""
  d += `<path d="M${cx} ${(cy - bodyH).toFixed(1)} C${(cx + bodyW * 0.75).toFixed(1)} ${(cy - bodyH * 0.55).toFixed(1)} ${(cx + bodyW * 0.76).toFixed(1)} ${(cy + bodyH * 0.2).toFixed(1)} ${cx} ${(cy + bodyH * 0.7).toFixed(1)} C${(cx - bodyW * 0.76).toFixed(1)} ${(cy + bodyH * 0.2).toFixed(1)} ${(cx - bodyW * 0.75).toFixed(1)} ${(cy - bodyH * 0.55).toFixed(1)} ${cx} ${(cy - bodyH).toFixed(1)}Z" fill="white" opacity=".92"/>`
  d += `<ellipse cx="${cx}" cy="${(cy - bodyH * 0.18).toFixed(1)}" rx="${(bodyW * 0.25).toFixed(1)}" ry="${(bodyW * 0.32).toFixed(1)}" fill="${"rgba(255,255,255,.38)"}"/>`
  d += `<path d="M${(cx - bodyW * 0.95).toFixed(1)} ${(cy + bodyH * 0.1).toFixed(1)} L${(cx - bodyW * 0.38).toFixed(1)} ${(cy + bodyH * 0.02).toFixed(1)} L${(cx - bodyW * 0.42).toFixed(1)} ${(cy + bodyH * 0.42).toFixed(1)} Z" fill="white" opacity=".78"/>`
  d += `<path d="M${(cx + bodyW * 0.95).toFixed(1)} ${(cy + bodyH * 0.1).toFixed(1)} L${(cx + bodyW * 0.38).toFixed(1)} ${(cy + bodyH * 0.02).toFixed(1)} L${(cx + bodyW * 0.42).toFixed(1)} ${(cy + bodyH * 0.42).toFixed(1)} Z" fill="white" opacity=".78"/>`
  d += `<path d="M${(cx - bodyW * 0.24).toFixed(1)} ${(cy + bodyH * 0.56).toFixed(1)} L${cx} ${(cy + bodyH * 1.04).toFixed(1)} L${(cx + bodyW * 0.24).toFixed(1)} ${(cy + bodyH * 0.56).toFixed(1)} Z" fill="white" opacity=".9"/>`
  d += `<path d="M${(cx - bodyW * 0.18).toFixed(1)} ${(cy + bodyH * 1.02).toFixed(1)} C${(cx - bodyW * 0.1).toFixed(1)} ${(cy + bodyH * 1.26).toFixed(1)} ${(cx + bodyW * 0.1).toFixed(1)} ${(cy + bodyH * 1.26).toFixed(1)} ${(cx + bodyW * 0.18).toFixed(1)} ${(cy + bodyH * 1.02).toFixed(1)} C${(cx + bodyW * 0.06).toFixed(1)} ${(cy + bodyH * 1.12).toFixed(1)} ${(cx - bodyW * 0.06).toFixed(1)} ${(cy + bodyH * 1.12).toFixed(1)} ${(cx - bodyW * 0.18).toFixed(1)} ${(cy + bodyH * 1.02).toFixed(1)}Z" fill="white" opacity=".48"/>`
  return d
}

export function buildMedalIcon(cx: number, cy: number, R: number) {
  const s = R * ICO
  let d = ""
  d += `<path d="M${(cx - s * 0.5).toFixed(1)} ${(cy - s * 1.05).toFixed(1)} L${(cx - s * 0.12).toFixed(1)} ${(cy - s * 0.2).toFixed(1)} L${(cx - s * 0.45).toFixed(1)} ${(cy + s * 0.08).toFixed(1)} L${(cx - s * 0.9).toFixed(1)} ${(cy - s * 0.74).toFixed(1)} Z" fill="white" opacity=".88"/>`
  d += `<path d="M${(cx + s * 0.5).toFixed(1)} ${(cy - s * 1.05).toFixed(1)} L${(cx + s * 0.12).toFixed(1)} ${(cy - s * 0.2).toFixed(1)} L${(cx + s * 0.45).toFixed(1)} ${(cy + s * 0.08).toFixed(1)} L${(cx + s * 0.9).toFixed(1)} ${(cy - s * 0.74).toFixed(1)} Z" fill="white" opacity=".88"/>`
  d += `<circle cx="${cx}" cy="${(cy + s * 0.36).toFixed(1)}" r="${(s * 0.7).toFixed(1)}" fill="white" opacity=".96"/>`
  d += `<circle cx="${cx}" cy="${(cy + s * 0.36).toFixed(1)}" r="${(s * 0.48).toFixed(1)}" fill="none" stroke="rgba(255,255,255,.48)" stroke-width="5"/>`
  d += `<path d="M${cx} ${(cy - s * 0.05).toFixed(1)} L${(cx + s * 0.16).toFixed(1)} ${(cy + s * 0.28).toFixed(1)} L${(cx + s * 0.52).toFixed(1)} ${(cy + s * 0.33).toFixed(1)} L${(cx + s * 0.26).toFixed(1)} ${(cy + s * 0.58).toFixed(1)} L${(cx + s * 0.32).toFixed(1)} ${(cy + s * 0.94).toFixed(1)} L${cx} ${(cy + s * 0.77).toFixed(1)} L${(cx - s * 0.32).toFixed(1)} ${(cy + s * 0.94).toFixed(1)} L${(cx - s * 0.26).toFixed(1)} ${(cy + s * 0.58).toFixed(1)} L${(cx - s * 0.52).toFixed(1)} ${(cy + s * 0.33).toFixed(1)} L${(cx - s * 0.16).toFixed(1)} ${(cy + s * 0.28).toFixed(1)} Z" fill="rgba(255,255,255,.55)"/>`
  return d
}
