# The Subpar Journal — Design System

## 1. Concept

**"Newspaper from the year 3000"**

The aesthetic fuses two opposing eras: the tactile materiality of old-world print journalism (parchment, ink, serif type, ruled lines, dense columns) with cold futurism (precise geometry, monospace data, a slowly rotating cube floating in space). The tension between these two extremes is the point. It should feel like an artifact — something excavated, not designed.

The Three.js cube is the site's visual anchor. It rotates slowly on a diagonal axis, neither fully mechanical nor fully organic. Each face is a category icon rendered in flat, editorial style. It is purely decorative and makes no attempt to be interactive or explain itself.

---

## 2. Color Palette

### Base (Public)

| Token | Hex | Usage |
|---|---|---|
| `--color-parchment` | `#F0E6CE` | Page background |
| `--color-parchment-dark` | `#E5D8B8` | Card backgrounds, subtle dividers |
| `--color-parchment-deep` | `#D4C5A0` | Hover states, ruled line color |
| `--color-ink` | `#0F0F0F` | Primary text, borders |
| `--color-ink-mid` | `#3A3A3A` | Secondary text, metadata |
| `--color-ink-faint` | `#7A7570` | Tertiary text, disabled states |
| `--color-rule` | `#2A2A2A` | Horizontal rules, table borders |
| `--color-rule-light` | `#C8BAA0` | Light interior dividers |

### Accent (Used sparingly)

| Token | Hex | Usage |
|---|---|---|
| `--color-accent-red` | `#8B1A1A` | Category: Sports / destructive actions |
| `--color-accent-gold` | `#9A7D2E` | Category: Stocks / highlights |
| `--color-accent-navy` | `#1A2E4A` | Category: AI |
| `--color-accent-plum` | `#4A1A4A` | Category: Music |
| `--color-accent-forest` | `#1A3A1A` | Category: Life |

### Dashboard (Private)

The dashboard is a tonal inversion — dark background, same serif type system, same ruled-line structure. It reads as the "back office" of the newspaper.

| Token | Hex | Usage |
|---|---|---|
| `--color-dash-bg` | `#111111` | Dashboard page background |
| `--color-dash-surface` | `#1C1C1C` | Cards, panels |
| `--color-dash-border` | `#2E2E2E` | Borders, dividers |
| `--color-dash-text` | `#E8E0D0` | Primary text (warm off-white) |
| `--color-dash-text-mid` | `#9A9088` | Secondary text |
| `--color-dash-accent` | `#C8A84B` | Active states, interactive highlights |

### Check-In Calendar Colors

| State | Hex | Meaning |
|---|---|---|
| `--checkin-full` | `#2D5A1B` | All goals completed |
| `--checkin-partial` | `#8B7A1A` | Some goals completed |
| `--checkin-minimal` | `#7A2A1A` | Checked in but no goals done |
| `--checkin-empty` | `#2A2A2A` | No check-in (dashboard) / `#C8BAA0` (light mode) |

---

## 3. Typography

### Typeface Stack

**Display / Masthead**
- Font: `Playfair Display` (Google Fonts)
- Weights: 400, 700, 900
- Use: Site name, section mastheads, feature headlines
- Characteristics: High contrast strokes, prominent serifs — unmistakably editorial

**Body / Article**
- Font: `Libre Baskerville` (Google Fonts)
- Weights: 400, 400 italic, 700
- Use: Post body copy, card excerpts, paragraph text
- Characteristics: Optimized for screen readability, traditional newspaper feel

**UI / Metadata**
- Font: `IBM Plex Mono` (Google Fonts)
- Weights: 400, 500
- Use: Dates, post counts, tags, form labels, dashboard data
- Characteristics: The "year 3000" contrast element — mono data amid analogue type

### Type Scale

```
--text-masthead:    clamp(2.5rem, 6vw, 5rem)     /* Site name */
--text-headline:    clamp(1.75rem, 3vw, 2.5rem)  /* Post titles, section heads */
--text-subhead:     1.25rem                       /* Card titles, sub-sections */
--text-body:        1rem                          /* Body copy (16px base) */
--text-small:       0.875rem                      /* Excerpts, secondary info */
--text-micro:       0.75rem                       /* Dates, tags, metadata */
--text-mono:        0.8125rem                     /* IBM Plex Mono instances */
```

### Line Height & Tracking

```
--leading-tight:    1.2    /* Headlines */
--leading-body:     1.65   /* Body copy — slightly looser than newspaper, better for screen */
--leading-relaxed:  1.8    /* Long-form article text */

--tracking-wide:    0.08em  /* Uppercase labels, category badges */
--tracking-normal:  0       /* All other text */
--tracking-tight:  -0.02em  /* Large display type */
```

---

## 4. Spacing & Layout

### Grid

The public blog uses a **newspaper column grid**: centered max-width with internal column logic for the feed.

```
--max-width-site:   1100px   /* Global content max-width */
--max-width-prose:  680px    /* Article body max-width */
--gutter:           clamp(1rem, 4vw, 2.5rem)  /* Horizontal page padding */
--col-gap:          1.5rem   /* Gap between feed columns */
```

Feed layout:
- Desktop: 3-column card grid (or 2-column with one wide featured post)
- Tablet: 2-column
- Mobile: single column, full-width cards

### Spacing Scale (Tailwind-compatible)

```
4px   — xs   (tight internal spacing)
8px   — sm   (component padding, icon gaps)
16px  — md   (section internals)
24px  — lg   (card padding, form spacing)
40px  — xl   (between major sections)
64px  — 2xl  (page-level vertical rhythm)
96px  — 3xl  (hero spacing, cube area)
```

---

## 5. Component Styles

### 5.1 Masthead (Public Header)

```
Layout:     Full-width, centered content
Background: --color-parchment with a thick top border rule (3px, --color-rule)
            and a thin bottom border rule (1px, --color-rule-light)
Site name:  Playfair Display 900, --text-masthead, tracked tight
            All caps or mixed case (decide at implementation)
Tagline:    IBM Plex Mono, --text-micro, --color-ink-mid
            Below the name, small and restrained
Links:      GitHub + LinkedIn as text links (not icon-only)
            IBM Plex Mono, --text-micro, right-aligned or below name
            No hover color change — underline appears on hover
```

Ruled line system: Three horizontal rules frame the masthead — top (heavy), below tagline (medium, 1px), below nav/links (hairline). Mirrors newspaper section headers.

### 5.2 SpinningCube

```
Container:  96px × 96px centered, 120px vertical margin above/below
            No background — floats on parchment
Cube size:  ~60px edges
Rotation:   Slow diagonal rotation (~0.003 rad/frame on X and Y axes)
            Axis: not perfectly diagonal — slightly more Y rotation (0.004) than X (0.002)
            No interaction on public side
Materials:  MeshStandardMaterial — matte, slight roughness (0.8)
            Face color: --color-ink (near-black)
            Icon color: --color-parchment (engraved look)
Lighting:   Ambient + one directional light from upper-left
            Subtle, not dramatic — the cube should feel present, not spotlit
Icons:      SVG-based, one per face, centered
            AI: circuit/brain fragment
            Music: waveform or note
            Sports: minimal abstract form (not a specific sport)
            Stocks: simple line chart fragment
            Life: leaf or sun fragment
```

### 5.3 Post Card (Feed)

```
Background:  --color-parchment-dark (slightly darker than page)
Border:      1px solid --color-rule-light
             No border-radius — sharp corners only
Padding:     24px
Category:    IBM Plex Mono, uppercase, --text-micro, category accent color
             No pill/badge border — just colored uppercase text
Title:       Playfair Display 700, --text-subhead
             --color-ink, hover: underline (no color change)
Excerpt:     Libre Baskerville 400, --text-small, --color-ink-mid
             2–3 lines, clamped with CSS
Date:        IBM Plex Mono, --text-micro, --color-ink-faint
             Formatted as: 24 FEB 2026
Hover state: Background shifts to --color-parchment (lighter)
             Transition: 150ms ease
No images in feed cards — editorial, text-forward
```

### 5.4 Post Page (Article)

```
Max-width:   --max-width-prose, centered
Header:      Category (mono, colored), title (Playfair Display 900, large),
             date + "X min read" in mono
Body:        Libre Baskerville 400, --text-body, --leading-relaxed
             H2: Playfair Display 700
             H3: Libre Baskerville 700
             Blockquote: left border 3px --color-rule, italic, inset
             Code: IBM Plex Mono on --color-parchment-dark background
             Images: full-width within prose column, 1px border
Rule between sections
Back to feed: simple text link, no button styling
```

### 5.5 Dashboard Sidebar

```
Width:       220px fixed, full viewport height
Background:  --color-dash-surface
Border:      1px solid --color-dash-border on right edge only
Nav items:   IBM Plex Mono 400, --text-mono
             Padding: 12px 20px
             Active: left border 2px --color-dash-accent, text --color-dash-accent
             Hover: background lightens slightly (+5% lightness)
Section labels: uppercase, --text-micro, --color-dash-text-mid,
                letter-spacing wide, not interactive
Logo/name:   Top of sidebar, Playfair Display, smaller than public masthead
```

### 5.6 TipTap Editor

```
Container:   White/near-white surface in dark dashboard — #F0E6CE (parchment)
             Full contrast between editor surface and dashboard chrome
Toolbar:     Row of icon buttons above editor
             Dark background --color-dash-surface, icon color --color-dash-text
             Active button: --color-dash-accent background
Border:      1px --color-dash-border, sharp corners
Prose inside editor mirrors public post styles (same font, scale, leading)
Metadata form: Below editor, same surface
             Labels: IBM Plex Mono uppercase
             Inputs: dark background, parchment text, 1px border
```

### 5.7 Check-In Form

```
Layout:      Clean single-column, max-width 480px, centered
Workout:     Large toggle — OFF (gray) / ON (green)
             Label: "Workout" in Playfair Display
Weight:      Number input with unit label
Goals:       Checklist — each goal is a row with checkbox + label
             Checkboxes styled as squares (not rounded)
             Checked state: filled with --color-dash-accent
Today's note: Simple textarea, no toolbar
Submit:      Full-width button, --color-dash-accent background,
             --color-ink text, Playfair Display, no border-radius
```

### 5.8 Check-In Calendar

```
Layout:      Month grid view (default) with year overview toggle
Day cells:   Square cells, small (28–32px)
             Color-coded by check-in state (see palette section 2)
             Current day: accent border
             Hover: tooltip showing summary (workout ✓, weight, goals X/N)
Month labels: IBM Plex Mono uppercase, small
Year view:   Condensed cells (~12px), GitHub heatmap style
Legend:      Inline below calendar, horizontal
```

### 5.9 Analytics

```
Layout:      2-column grid of stat cards on desktop, 1-column mobile
Stat card:   --color-dash-surface, 1px border, 24px padding
             Large number in Playfair Display (the stat)
             Label in IBM Plex Mono below
Charts:      Recharts library — minimal styling
             Line/bar charts: single accent color, no grid fill,
             thin gridlines (1px, --color-dash-border)
             No chart borders or backgrounds
```

### 5.10 Project Board

```
Kanban columns: Three columns (Backlog / Active / Done)
                Each column: --color-dash-surface background, 1px border, rounded-none
Column header:  IBM Plex Mono uppercase + count badge
Project card:   Inner card, darker surface, 1px border, 12px padding
                Title: Libre Baskerville 700
                Priority: colored dot (low=faint, medium=gold, high=red)
                Tags: small mono pills
Add button:     Dotted border card, centered + icon, muted
```

---

## 6. Interaction Principles

1. **No animations except the cube.** Nothing slides, bounces, or pulses. Page transitions are instant. Form feedback is immediate color/state change, not animated.

2. **Hover = underline or subtle background shift.** Never color changes on text. Links underline on hover. Cards lighten slightly. Nothing else.

3. **Sharp corners everywhere.** `border-radius: 0` is the default across all components. The only exception is small utility chips/tags where 2px radius is acceptable.

4. **Ruled lines are structural.** Horizontal rules (`<hr>`) are used as section dividers throughout the site, not decorative flourishes. They carry the newspaper grid logic.

5. **Whitespace is editorial.** The cube needs breathing room. The masthead needs vertical space. Post cards should not feel cramped. When in doubt, add more vertical margin.

6. **Mono text is data, serif text is content.** IBM Plex Mono is reserved for: dates, counts, labels, tags, metadata, code. It should never appear in headlines or body prose. This contrast is intentional and should be maintained strictly.

---

## 7. Responsive Behavior

| Breakpoint | Public layout | Dashboard |
|---|---|---|
| < 640px (mobile) | Single column feed, cube scales to 80px | Sidebar collapses to hamburger, full-width panels |
| 640–1024px (tablet) | 2-column feed, masthead scales | Sidebar persists at 180px, 1-col panels |
| > 1024px (desktop) | 3-column feed or 2+featured | Full 220px sidebar, multi-col panels |

The cube never disappears on mobile — it scales down. The masthead newspaper feel must hold at all widths.

---

## 8. What Not To Do

- No drop shadows (on anything)
- No gradients (backgrounds are flat color)
- No rounded corners on major containers
- No icon-only navigation (labels must accompany icons in the dashboard sidebar)
- No skeleton loaders that pulse or shimmer — use static placeholder rectangles
- No color backgrounds on the public homepage other than the parchment base
- No sans-serif fonts in article body copy
- No hero images, banner images, or decorative photography on the public homepage — the cube is the only visual element in the header zone
