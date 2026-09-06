---
name: Python Lists Playground
description: Learn Python lists by playing with them.
colors:
  cream: "#fffaf6"
  ink: "#171717"
  paper: "#ffffff"
  signal: "#ff6b00"
  peach: "#fff1e6"
  stone: "#f4efe9"
  quiet: "#5c5c5c"
  hairline: "#e4d8cc"
  rust: "#c2410c"
  code-well: "#fff6ee"
  success: "#157a3a"
  night: "#12110f"
  bone: "#f5f2ee"
  panel: "#1c1a17"
  ember: "#ff8a33"
  dusk: "#2a261f"
  taupe: "#c4b8ac"
  night-line: "#2e2a24"
  coral: "#f87171"
typography:
  title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.65rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "normal"
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "normal"
  meta:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "0.04em"
  mono:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.625rem"
  xl: "0.875rem"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "color-mix(in oklab, #ff6b00 80%, transparent)"
    textColor: "{colors.ink}"
  button-outline:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
    height: "44px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.quiet}"
    rounded: "{rounded.lg}"
    height: "44px"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    height: "44px"
    padding: "8px 10px"
  chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "2px 8px"
    height: "20px"
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "16px 16px"
  list-cell:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "20px 20px"
    height: "112px"
---

# Design System: Python Lists Playground

## Overview

**Creative North Star: "The List Stage"**

The product is a teaching theater for beginner Python lists. The first viewport is the list itself: large cells, generated code as a caption, and a single orange Run control. Chrome stays quiet. Personality lives in the footer signature, never in the hero.

The world is warm paper and near-black ink, developer-tool precise without looking like a classroom kit. Motion explains mutation. When the visitor asks for less motion, the stage still changes state — highlight, fade, error outline — but cells do not travel and the stage does not shake.

**Key Characteristics:**
- Cream paper, ink type, orange only on Run, selection, and changed cells
- Geist Sans for UI; Geist Mono for code, values, and method names
- One surface per group; never a card inside a card
- 44px product controls; theater-scale list cells
- Teaching motion with a reduced path that keeps meaning

## Colors

Warm paper with one signal accent. Orange is scarce on purpose.

### Primary
- **Signal Orange** (`{colors.signal}`): Run, selected method border, inserted/matched cells. Dark mode uses Ember (`{colors.ember}`).

### Neutral
- **Warm Cream** (`{colors.cream}`): Page background.
- **Ink** (`{colors.ink}`): Body text and primary-button type. Dark mode Bone (`{colors.bone}`).
- **Paper** (`{colors.paper}`): Card and cell fill.
- **Peach** (`{colors.peach}`): Secondary / selected-toggle fill.
- **Stone** (`{colors.stone}`): Muted wells.
- **Quiet Ink** (`{colors.quiet}`): Secondary copy (≥4.5:1 on cream). Dark mode Taupe (`{colors.taupe}`).
- **Hairline** (`{colors.hairline}`): 1px borders.

### Semantic
- **Rust** (`{colors.rust}`): Errors and miss states. Dark mode Coral (`{colors.coral}`).
- **Success Green** (`{colors.success}`): Correct challenge feedback.

**The Scarce Orange Rule.** Orange is not a brand wash. If a screen has orange on more than Run, the current selection, and cells that just changed, it is too loud.

## Typography

**Display Font:** Geist Sans (ui-sans-serif, system-ui)
**Body Font:** Geist Sans
**Label/Mono Font:** Geist Mono

**Character:** Calm UI type with mono reserved for Python: variable names, values, method labels, generated code.

### Hierarchy
- **Title** (medium, 1.65rem, tight tracking): Section names — Methods, Comparisons, Challenges. The playground heading is 1.25rem (1.5rem on desktop).
- **Body** (regular, 0.875rem, relaxed leading): Teaching copy. Keep measure near 65ch.
- **Label** (medium, 0.875rem): Field names (Preset, Method).
- **Meta** (medium, 0.75rem): Index chips, kbd hints, history marks, x-ray axis labels.
- **Mono** (regular, 0.875–1.25rem): Code, cell values, captions. Theater cells step up to 1.125–1.25rem.

**The Mono-Is-Python Rule.** Geist Mono is for lists, code, and method names. It is not a costume for “technical” body copy.

## Layout

Max width 72rem (`max-w-6xl`), 16px page gutters, sticky header with `scroll-padding-top: 5.5rem` so hash links and focus clear the bar. Home reading order: playground heading and subtitle, list stage, method + Run, caption, result (after the first run), then Methods / Comparisons / Challenges.

The first visit is cells, method, Run, and caption. Advanced chrome (X-Ray, Step, speeds, History) waits until after the first run. Result docks to the caption at `max-w-[65ch]`.

Rhythm: tight inside a control group (`gap-1`–`gap-3`), generous between the teaching cluster and later sections (`gap-6`) and between page sections (`py-12`).

Narrow viewports: section nav collapses into a menu; the wordmark stays one line; Run sits beside Method in the first row; list cells stay theater-sized and scroll sideways with a fade peek. Product controls stay at least 44px tall. Desktop-only `Ctrl / Cmd + Enter` under Run.

## Elevation & Depth

Flat paper at rest. Depth is a 1px warm hairline plus a soft offset shadow, never a zero-offset glow.

### Shadow Vocabulary
- **Cell rest** (`box-shadow: 0 10px 24px -18px color-mix(in oklab, var(--foreground) 45%, transparent)`): Idle list cells.
- **Cell changed** (`box-shadow: 2px 6px 16px -6px color-mix(in oklab, var(--primary) 45%, transparent)`): Inserted, matched, moved, returned.
- **Run** (`box-shadow: 0 8px 20px -8px color-mix(in oklab, var(--primary) 70%, transparent)`): Primary Run only.

**The Offset-Blur Rule.** Shadows carry offset and blur. A colored halo with no offset is decoration and does not belong here.

## Shapes

12–16px corners. Controls use 10px (`{rounded.lg}`). Cells and lesson shells use 14px (`{rounded.xl}`). Borders are 1px `{colors.hairline}`. No organic clip-paths, no glass.

## Components

### Buttons
- **Shape:** 10px radius; product actions use `min-height: 44px` even when the primitive default is 32px.
- **Primary / Run:** `{colors.signal}` fill, `{colors.ink}` type, 48px tall on the stage. Hover at 80% orange.
- **Outline / Ghost:** Hairline or no fill; used for Undo, Share, Try it.
- **Focus:** 2px `{colors.ink}` outline (ember ring in dark) with 2px offset.

### Chips
- Compact badges for Ran / Preview / Built-in / Completed. Outline or secondary fill — not orange unless the state is the current playground method.

### Cards / Containers
- **Corner Style:** 14px on lesson and method shells.
- **Background:** `{colors.paper}` on `{colors.cream}`.
- **Border:** 1px hairline.
- **Internal Padding:** 16–20px.
- One shell only. Snapshots, columns, and Advanced notes sit in proximity, not in a second bordered box.

### Inputs / Fields
- 44px tall, 10px radius, hairline border. The variable name on the stage is borderless mono type, still 44px, labeled “Variable” for assistive tech.
- Preset and Method have visible labels.

### Navigation
- Sticky cream bar. Desktop: text links in Quiet Ink, hover to Ink. Small screens: “Page sections” menu, mark hidden, wordmark one line. Theme control is a 44px icon button.
- Playground chrome carries the visible heading **Playground** and the binding subtitle *Learn Python lists by playing with them.*

### List cells (signature)
Theater tiles: min-width 10rem (13rem on desktop), min-height 7rem, mono value, index above in Quiet Ink. State is border + fill + shadow, plus a live result announcement — never color alone. Reduced motion: highlight and fade, no Flip travel, no shake.

## Do's and Don'ts

### Do:
- **Do** land the visitor inside the list stage. The subtitle *Learn Python lists by playing with them.* lives in playground chrome, not a marketing hero.
- **Do** keep orange scarce: Run, selection, changed cells. No page-level orange radial.
- **Do** pair every operation with code, list state, explanation, and return or error.
- **Do** use 44px targets on product controls and keep reduced motion as highlight/fade/outline.

### Don't:
- **Don't** nest cards. One bordered shell per lesson or method.
- **Don't** put a kicker or eyebrow above a heading.
- **Don't** use orange as body text (`{colors.signal}` on `{colors.cream}` fails contrast).
- **Don't** put the creator signature anywhere but the small footer line: Made by kuya Rodge <3.
- **Don't** invent testimonials, accounts, or a backend. This is a local playground.
