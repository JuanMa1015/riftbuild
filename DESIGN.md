---
name: Wild Rift Build
description: A coach's tactics board for picking a champion, placing the rivals, and reading the build as a numbered play.
colors:
  felt: "#0f2a1f"
  felt-2: "#143626"
  felt-3: "#1b4631"
  chalk: "#eef3ea"
  chalk-dim: "#a9c0b0"
  chalk-line: "rgb(238 243 234 / 0.18)"
  ally-blue: "#5ab0ff"
  foe-red: "#ff6a57"
  marker-yellow: "#ffd23f"
  marker-ink: "#1d1a05"
typography:
  title:
    fontFamily: "Barlow Semi Condensed, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.025em"
  wordmark:
    fontFamily: "Barlow Semi Condensed, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Barlow Semi Condensed, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "Barlow Semi Condensed, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
  caption:
    fontFamily: "Barlow Semi Condensed, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
components:
  button-primary:
    backgroundColor: "{colors.marker-yellow}"
    textColor: "{colors.marker-ink}"
    rounded: "{rounded.lg}"
    height: "48px"
    padding: "0 16px"
  button-secondary:
    backgroundColor: "{colors.felt}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.lg}"
    size: "48px"
  stepper-step:
    textColor: "{colors.chalk-dim}"
    rounded: "{rounded.lg}"
    height: "44px"
  stepper-step-current:
    textColor: "{colors.chalk}"
  tab-active:
    backgroundColor: "{colors.marker-yellow}"
    textColor: "{colors.marker-ink}"
    rounded: "{rounded.md}"
    height: "40px"
  search-field:
    backgroundColor: "{colors.felt-2}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.lg}"
    height: "48px"
    padding: "0 12px"
  tag:
    textColor: "{colors.chalk-dim}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
---

# Design System: Wild Rift Build

## Overview

**Creative North Star: "The Coach's Tactics Board"**

A dark bottle-green felt with chalk-white type and 1px chalk lines. The match is laid out like a magnet board: your champion and the five rivals are circular tokens, the build is read as a numbered play. Navigation is standard (stepper, tabs, bottom dock) but dressed in the board's colors. Phone-first, one-handed; every tap target is at least 40px.

Color carries meaning, not decoration. Blue marks allies, red marks rivals, marker yellow marks only the one primary action and the current selection. Everything else is felt and chalk. Depth comes from stepping the felt one shade lighter, never from shadows.

**Key Characteristics:**
- Felt ground, one step lighter panels, chalk lines at 18% opacity
- Circular portrait tokens with a team-colored ring and a lane glyph badge
- One condensed sans (Barlow Semi Condensed), tabular numerals globally
- Lucide line icons (stroke 2), plus a hand-drawn pitch mark (rect, halfway line, centre circle) as the logo
- One authored motion: the token drop

## Colors

A restrained green-and-chalk palette with two team colors and a single highlighter.

### Primary
- **Marker Yellow** (#ffd23f): the primary action button, the active tab, the current step number and border, focus ring, text selection, input caret, the "me" token ring. Always paired with **Marker Ink** (#1d1a05) text.

### Secondary
- **Ally Blue** (#5ab0ff): ring around ally tokens.
- **Foe Red** (#ff6a57): ring around rival tokens, rival-side warnings.

### Neutral
- **Bottle-Green Felt** (#0f2a1f): app ground, dock, badge fill.
- **Raised Felt** (#143626): panels, search field, tab rail, hover fill.
- **Pressed Felt** (#1b4631): image placeholders, scrollbar thumb.
- **Chalk** (#eef3ea): primary text, completed-step fill.
- **Dim Chalk** (#a9c0b0): secondary text, placeholders, inactive icons and steps.
- **Chalk Line** (rgb 238 243 234 / 0.18): every 1px border and divider.

### Named Rules
**The One Highlighter Rule.** Marker yellow appears only on the primary action and the current selection (step, tab, focus, active slot). It never decorates.
**The Side Color Rule.** Blue means ally, red means rival, and they appear only as token rings and side indicators.

## Typography

**Display / Body / Label Font:** Barlow Semi Condensed (400, 500, 600, 700; fallback system-ui, sans-serif), self-hosted through Fontsource.

**Character:** A condensed workhorse that fits tight phone rows and long Spanish champion names without shrinking. Hierarchy comes from weight and size, not from a second face.

### Hierarchy
- **Wordmark / Title** (700 / 600, 1.25rem, 1.4, tracking -0.025em): app name, section titles.
- **Body** (400, 1rem, 1.4): inputs, descriptions.
- **Label** (600 or 500, 0.875rem): buttons, steps, tabs, field labels, dock hints.
- **Caption** (600 or 400, 0.75rem): champion names under tiles, patch chip, tags.

### Named Rules
**The Tabular Rule.** Numerals are tabular everywhere (set on body) so stats and prices align.

## Layout

Phone 375px is the base: top bar, three-column stepper, full-width search, a 4-column champion grid (5 at sm, back to 4 at md, 5 at xl; gaps 4px by 8px), and a fixed bottom dock. Content is centered in a max-w-xl column in the dock. From 768px the two panes split (inputs left, build with tabs right) and the stepper is dropped. A custom `short` variant (max-height 520px) hides the stepper and patch chip and tightens padding for the floating-window and landscape cases. Safe-area insets pad the top bar and dock. Spacing is a 4px rhythm; 16px page gutters, 8-12px between siblings.

## Elevation & Depth

Flat. There are no shadows. Depth is tonal: Raised Felt panels on Felt ground, Chalk Line borders, and a top border on the dock. Sticky search and tab rails sit on solid felt to mask scrolling content.

### Named Rules
**The No-Shadow Rule.** Separation is a felt step or a 1px chalk line, never a shadow.

## Shapes

Soft but not pill: 12px for buttons, search field and stepper steps, 8px for tabs and item thumbnails, 6px for focus outlines. Circles (9999px) for tokens, champion portraits, icon buttons, step numbers and tags. An empty token slot is a dashed 2px chalk-line circle holding a lane glyph; it turns marker yellow when active.

## Components

### Buttons
- **Shape:** 12px radius, 48px tall.
- **Primary:** Marker Yellow fill, Marker Ink bold text, optional trailing 18px arrow icon; one per screen (Next / View build / New match). 40% opacity when disabled.
- **Secondary:** Raised-outline 48px square with Chalk Line border and a 20px icon (back).
- **Icon button:** 44px circle, Dim Chalk icon, Raised Felt hover.

### Stepper
Three equal columns, 44px tall, 12px radius, 1px border. Current: marker border and chalk text with a yellow numbered disc; done: chalk disc with check; locked: 40% opacity.

### Tabs
Rail of Raised Felt with chalk line and 4px padding; 40px tabs, active is solid marker yellow, inactive Dim Chalk.

### Inputs / Fields
48px, 12px radius, Raised Felt fill, 1px chalk line, leading search icon; border turns marker yellow on focus-within, caret is yellow, placeholder Dim Chalk.

### Token (signature)
Circle portrait (56px default, 3px ring; 2px under 48px) ringed in side color; lane badge at bottom-right (38% of size, felt fill, chalk line). On placement it plays the drop animation: scale 1.18 to 0.95 to 1 over 200ms, cubic-bezier(0.22, 1, 0.36, 1). Tiles use active:scale-95 for press feedback.

### Tags
Pill, 1px chalk line, 12px semibold Dim Chalk text.

### Navigation
Stepper plus tabs plus bottom dock. The dock shows a peek of the first three build items (32px, 8px radius) and the primary button.

## Do's and Don'ts

### Do:
- **Do** use Marker Yellow only for the primary action and the current selection.
- **Do** ring tokens in blue for allies and red for rivals.
- **Do** separate surfaces with a felt step or a Chalk Line border.
- **Do** use Lucide line icons at stroke 2 and the lane glyph set (Shield, TreePine, Zap, Crosshair, HeartHandshake) wherever a lane appears.
- **Do** keep tap targets at 40px or more and honor prefers-reduced-motion (drop and slide-in are disabled).
- **Do** reserve the drop for a slot being filled; the slide-in (16px, 200ms) is for step changes only.

### Don't:
- **Don't** return to the dark-gold card dashboard with emoji headers.
- **Don't** use shadows, gradients, or card grids for content.
- **Don't** use blue or red for anything other than team side.
- **Don't** introduce a second typeface.

## Not canonized

Legacy lane emoji (src/data/champions.js ico fields) and "⚡" prefixed explanation strings in src/data/builds.js predate the world; they are defects, not house style.
