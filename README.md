# GYMVERSE

A cinematic 3D gym experience for a 14,000 sq ft strength and conditioning arena in Mumbai.

GYMVERSE is an interactive Next.js site where visitors can enter a walkable 3D gym, explore six training zones, accept training missions, review coaches, compare memberships, and send an inquiry.

## What is inside

- **Walkable 3D arena** built with React Three Fiber and Three.js
- **Six zones**: Entry, Cardio, Strength, Free Weights, Functional, Recovery, and Exit
- **Interactive stations** with XP, progression, and HUD feedback
- **Content terminals** for About, Programs, Trainers, Facility, Membership, and Contact
- **Cinematic UI** with an intro sequence, loading sequence, map, settings, and profile

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Because the production build uses `basePath: "/ai-website"`, the local dev route is also served under that prefix.

## Production build

```bash
npm run build
```

The project uses `output: "export"`, so the static site is written to `out/`. GitHub Pages serves it at:

`https://krishp091205.github.io/ai-website/`

## Controls

| Action | Desktop | Mobile |
| --- | --- | --- |
| Move | `W A S D` | Virtual joystick |
| Look | Mouse | Swipe |
| Sprint | `Shift` | — |
| Jump | `Space` | — |
| Interact | `E` | Tap interact |
| Map | `M` | Map button |
| Menu | `Esc` | Menu button |

## Optional configuration

Set `NEXT_PUBLIC_FORM_ENDPOINT` to a JSON endpoint that accepts contact form submissions. Without it, the contact form uses `mailto:` so inquiries still reach the gym.

## Tech stack

Next.js 16, React 19, TypeScript, Tailwind CSS 4, Three.js, React Three Fiber, drei, postprocessing, Framer Motion, GSAP, Lenis, and Zustand.
