---
version: 1
slug: "src-pages-homepage-jsx"
primary_target: "src/pages/HomePage.jsx"
related_targets: []
---

# Surface brief: whole app (phone-first flow, responsive split in window mode)

Mode: Operate. Visitor = a Wild Rift player, one hand, little time, picking champions then glancing at the build.

## Scope
Replace the whole UI. Keep: React/Tailwind/Zustand/Capacitor, local build engine, i18n (es-LATAM default, en), game.json updates, bubble overlay, AI optional.

## Direction contract
THESIS: The match is a coach's tactics board: your pick and the five enemies are magnetic tokens on felt, and the build is read as a numbered play. Refuses the dark-gold card dashboard with emoji headers.
OWN-WORLD: Bottle-green felt ground (#0f2a1f family) with one step lighter panels, chalk-white type and 1px chalk lines, blue ally tokens, red enemy tokens, marker-yellow only for the primary action and current selection. One condensed workhorse sans (Barlow Semi Condensed), drawn line icons, no emoji, no card grids. Tokens are circles with portrait, ring in side color, lane glyph badge.
STORY: Player opens the app, types a few letters, taps the champion (step 1), taps/types the rivals onto the board (step 2), reads the build as a numbered play with tabs (step 3). Dock at the bottom shows the live build preview from the first pick.
FIRST VIEWPORT: Phone 375x812: top bar (wordmark, patch chip, settings icon), three-part stepper (Tú, Rivales, Build), search field full width, recents row of tokens, then a 4-column grid of champion tiles filtered live as you type; fixed bottom dock with the first three item icons of the live build and a yellow "Siguiente" button. Window mode >=768: left pane stacks champion + board inputs, right pane is the build with tabs, no stepper.
FORM: Operate world #5 on the grounded list (football tactics board), seed key 5fe00878. Standard navigation (stepper, tabs, bottom dock) in the board's colors; signature move: a token drops onto its position with a quick magnet snap.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
