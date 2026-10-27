import { useEffect, useState } from "react"
import { animate, motion, useReducedMotion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { ease, fmt } from "./anim"

/**
 * Building blocks for the hero dashboard screens. Everything here is drawn
 * on a light "app" surface regardless of the site theme, like a screenshot.
 */

/** Counts up from 0 when it mounts. */
export function Count({ to, prefix = "", suffix = "", decimals = 0, delay = 0 }: { to: number; prefix?: string; suffix?: string; decimals?: number; delay?: number }) {
  const reduce = useReducedMotion()
  const [value, setValue] = useState(reduce ? to : 0)
  useEffect(() => {
    if (reduce) return
    const controls = animate(0, to, { duration: 1.4, delay, ease, onUpdate: setValue })
    return () => controls.stop()
  }, [to, delay, reduce])
  return (
    <span className="tabular-nums">
      {prefix}
      {fmt(value, decimals)}
      {suffix}
    </span>
  )
}

export function Kpi({
  icon: Icon,
  label,
  value,
  trend,
  tone = "default",
  index = 0,
}: {
  icon: LucideIcon
  label: string
  value: React.ReactNode
  trend?: string
  tone?: "default" | "warn" | "good"
  index?: number
}) {
  const toneClass =
    tone === "warn" ? "bg-amber-50 text-amber-600" : tone === "good" ? "bg-emerald-50 text-emerald-600" : "bg-primary/10 text-primary"
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.08 * index, ease }}
      className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-slate-500">{label}</span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${toneClass}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-3 text-[26px] font-semibold tracking-tight text-slate-900">{value}</div>
      {trend && <div className="mt-1 text-[12px] font-medium text-emerald-600">{trend}</div>}
    </motion.div>
  )
}

export function Panel({ title, action, children, className = "", delay = 0 }: { title: string; action?: React.ReactNode; children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease }}
      className={`flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${className}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[14px] font-semibold text-slate-900">{title}</span>
        {action}
      </div>
      {children}
    </motion.div>
  )
}

export function Pill({ children, tone = "slate" }: { children: React.ReactNode; tone?: "slate" | "green" | "amber" | "red" | "primary" | "blue" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-600",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-600",
    primary: "bg-primary/10 text-primary",
    blue: "bg-sky-50 text-sky-700",
  }
  return <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tones[tone]}`}>{children}</span>
}

/** Smooth area chart that draws itself in. */
export function AreaChart({ values, labels, highlight }: { values: number[]; labels: string[]; highlight?: number }) {
  // Matches the chart panel on the fixed 1240px canvas, so nothing is letterboxed.
  const W = 680
  const H = 150
  const max = Math.max(...values) * 1.15
  const pts = values.map((v, i) => [(i / (values.length - 1)) * W, H - (v / max) * H] as const)
  // Catmull-Rom → cubic Bézier for a soft curve.
  const d = pts
    .map(([x, y], i) => {
      if (i === 0) return `M ${x} ${y}`
      const [x0, y0] = pts[i - 2] ?? pts[i - 1]
      const [x1, y1] = pts[i - 1]
      const [x3, y3] = pts[i + 1] ?? [x, y]
      const c1 = [x1 + (x - x0) / 6, y1 + (y - y0) / 6]
      const c2 = [x - (x3 - x1) / 6, y - (y3 - y1) / 6]
      return `C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${x} ${y}`
    })
    .join(" ")
  const hi = highlight != null ? pts[highlight] : null
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H + 4}`} className="h-auto w-full overflow-visible">
        <defs>
          <linearGradient id="hd-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="#e2e8f0" strokeDasharray="4 6" />
        ))}
        <motion.path
          d={`${d} L ${W} ${H} L 0 ${H} Z`}
          fill="url(#hd-area)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        />
        <motion.path
          d={d}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.6, delay: 0.3, ease }}
        />
        {hi && (
          <motion.g initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.7, duration: 0.4 }} style={{ transformOrigin: `${hi[0]}px ${hi[1]}px` }}>
            <circle cx={hi[0]} cy={hi[1]} r="14" fill="var(--primary)" opacity="0.15">
              <animate attributeName="r" values="10;16;10" dur="2.4s" repeatCount="indefinite" />
            </circle>
            <circle cx={hi[0]} cy={hi[1]} r="6" fill="white" stroke="var(--primary)" strokeWidth="3" />
          </motion.g>
        )}
      </svg>
      <div className="mt-2 flex justify-between text-[11px] font-medium text-slate-400">
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </div>
  )
}

/** Vertical bars that grow in. */
export function Bars({ values, labels, highlightLast = true }: { values: number[]; labels: string[]; highlightLast?: boolean }) {
  const max = Math.max(...values)
  const floor = Math.min(...values) * 0.75
  return (
    <div>
      <div className="flex h-[170px] items-end gap-3">
        {values.map((v, i) => (
          <div key={i} className="flex h-full flex-1 flex-col justify-end">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${((v - floor) / (max - floor)) * 100}%` }}
              transition={{ duration: 0.9, delay: 0.25 + i * 0.06, ease }}
              className={`rounded-t-lg ${highlightLast && i === values.length - 1 ? "bg-primary" : "bg-primary/20"}`}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-3 text-center text-[11px] font-medium text-slate-400">
        {labels.map((l) => (
          <span key={l} className="flex-1">
            {l}
          </span>
        ))}
      </div>
    </div>
  )
}

/** Thin progress bar that fills in. */
export function Meter({ value, tone = "primary", delay = 0 }: { value: number; tone?: "primary" | "red" | "amber" | "green"; delay?: number }) {
  const color = { primary: "bg-primary", red: "bg-red-500", amber: "bg-amber-500", green: "bg-emerald-500" }[tone]
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, delay, ease }}
      />
    </div>
  )
}

/** A row that slides in, for lists. */
export function Row({ children, index = 0, base = 0.4 }: { children: React.ReactNode; index?: number; base?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: base + index * 0.12, ease }}
      className="flex items-center gap-3 border-t border-slate-100 py-2.5 first:border-t-0 first:pt-0"
    >
      {children}
    </motion.div>
  )
}

export function Avatar({ name, tone = 0 }: { name: string; tone?: number }) {
  const tones = ["bg-rose-100 text-rose-700", "bg-sky-100 text-sky-700", "bg-amber-100 text-amber-700", "bg-emerald-100 text-emerald-700", "bg-violet-100 text-violet-700"]
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
  return <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${tones[tone % tones.length]}`}>{initials}</span>
}
