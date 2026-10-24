"use client"

// Demo page for the scroll-locked-video-hero (MetroHero) component.
// The component reads shadcn-style HSL triplets (e.g. hsl(var(--background)))
// with dark fallbacks. gymverse's global tokens are plain hex colors, so we
// supply the HSL triplets it expects on a local wrapper to keep the global
// theme untouched.
import type { CSSProperties } from "react"
import MetroHero from "@/components/ui/scroll-locked-video-hero"

const mhTheme = {
  "--background": "220 25% 4%",
  "--foreground": "210 40% 98%",
  "--card": "220 20% 10%",
} as CSSProperties

export default function DemoOne() {
  return (
    <div style={mhTheme}>
      <MetroHero />
    </div>
  )
}