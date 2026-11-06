"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface BorderBeamProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Laenge des Lichtpunkts in px */
  size?: number
  /** Umlaufdauer in Sekunden */
  duration?: number
  /** Randbreite in px */
  borderWidth?: number
  /** Eckenradius des Pfads in px (wie die Karte) */
  radius?: number
  colorFrom?: string
  colorTo?: string
}

/**
 * Border Beam (Magic UI, angepasst): ein weicher Lichtpunkt wandert um den Rand.
 * Nur sichtbar, wenn offset-path rect() unterstuetzt wird und keine reduzierte Bewegung gewuenscht ist.
 */
export function BorderBeam({
  size = 56,
  duration = 7,
  borderWidth = 2,
  radius = 22,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
  className,
  style,
  ...props
}: BorderBeamProps) {
  const [ok, setOk] = React.useState(false)
  React.useEffect(() => {
    try {
      const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      setOk(!rm && !!(window.CSS && CSS.supports && CSS.supports("offset-path", "rect(0 auto auto 0)")))
    } catch (_e) {
      setOk(false)
    }
  }, [])
  if (!ok) return null
  return (
    <div
      aria-hidden
      className="tw:pointer-events-none tw:absolute tw:inset-0 tw:rounded-[inherit]"
      style={{
        padding: borderWidth,
        mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
      }}
    >
      <div
        className={cn("tw:absolute tw:aspect-square tw:animate-border-beam", className)}
        style={
          {
            width: size,
            offsetPath: `rect(0 auto auto 0 round ${radius}px)`,
            "--duration": duration,
            backgroundImage: `linear-gradient(to left, ${colorFrom}, ${colorTo}, transparent)`,
            ...style,
          } as React.CSSProperties
        }
        {...props}
      />
    </div>
  )
}
