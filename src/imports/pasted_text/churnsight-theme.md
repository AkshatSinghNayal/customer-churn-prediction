# Figma Design Prompt — ChurnSight: Customer Churn Prediction App
## 🆕 Multi-Theme Edition — Material Color Skins + Light/Dark Mode

> This is an **addendum/upgrade** to the base ChurnSight prompt. Everything in the original
> spec (routes, layouts, components, motion) stays the same — the only change is that
> **every color reference now resolves through a theming layer** instead of a fixed hex
> value, and the top nav gains two new controls copied from the reference UI
> (the "paint roller / palette" accent-color switcher and the "moon" appearance switcher).

---

## 🎨 1. THEME ARCHITECTURE — TWO INDEPENDENT SWITCHERS

ChurnSight ships with **two orthogonal theme controls**, exactly like the reference screenshots:

| Control | Reference screenshot | What it changes | Options |
|---|---|---|---|
| **Appearance Switcher** (🌙 icon) | Image 3 | Surface/ink/background tokens | `Light` / `Dark` / `System` |
| **Accent Switcher** (🎨 icon) | Images 4 & 5 | Primary brand/accent hue (buttons, links, active states, hero ghost numbers, chart strokes) | 6 Material-based presets, each shown with a colored dot |

Both controls live **side-by-side in the top nav** on every authenticated screen (Dashboard,
Customers, Predictions, Analytics, Models, Alerts, Settings, Profile) and near the
Login/Get Started links on public pages, in the exact same order as the reference:
`[Appearance ▾] [Accent ▾] [Primary CTA]`

**Critical rule — Risk semantics never change with theme.**
`coral-churn` (high risk), `amber-watch` (medium risk), and `green-safe` (low risk /
retained) are **fixed semantic tokens**. They do NOT shift with the Accent Switcher, so
risk pills, score bars, and charts always read the same way no matter which skin or mode
is active. Only the *brand/accent* color (CTAs, links, active nav, ghost hero numbers,
chart accent strokes, gradients) changes.

---

## 🎨 2. ACCENT THEME PRESETS (Standard Material Design Colors)

Six presets, mirroring the reference's `Default / Amethyst / City / Flat / Modern / Smooth`
dropdown (Images 4–5) — but built from **standard Material Design palette values** so
they're predictable to implement and extend.

Each row in the Accent Switcher dropdown shows the theme name + a filled color dot using
`--accent-primary` (Light mode value).

```
🎨 Accent Theme            Dot color (Light)   Material source
─────────────────────────────────────────────────────────────
1. Signal Teal  (Default)  #009688             Material Teal 500
2. Indigo Pulse             #3F51B5             Material Indigo 500
3. Violet Insight           #673AB7             Material Deep Purple 500
4. Azure Flow                #2196F3             Material Blue 500
5. Cyan Pulse                #00BCD4             Material Cyan 500
6. Slate Graphite            #607D8B             Material Blue Grey 500
```

### Per-theme token table (Light mode)

```
Theme            --accent-primary  --accent-deep    --accent-light    --accent-glass
Signal Teal      #009688           #00695C (T800)   #E0F2F1 (T50)     rgba(0,150,136,.12)
Indigo Pulse     #3F51B5           #283593 (I800)    #E8EAF6 (I50)     rgba(63,81,181,.12)
Violet Insight   #673AB7           #4527A0 (DP800)   #EDE7F6 (DP50)    rgba(103,58,183,.12)
Azure Flow       #2196F3           #1565C0 (B800)    #E3F2FD (B50)     rgba(33,150,243,.12)
Cyan Pulse       #00BCD4           #00838F (C800)    #E0F7FA (C50)     rgba(0,188,212,.12)
Slate Graphite   #607D8B           #37474F (BG800)   #ECEFF1 (BG50)    rgba(96,125,139,.12)
```

### Per-theme token table (Dark mode)

In dark mode, accent colors shift to the lighter **Material 300** tone of the same
palette for contrast against dark surfaces, and the "light/glass" washes become subtle
tinted overlays instead of pale backgrounds.

```
Theme            --accent-primary  --accent-deep    --accent-glass
Signal Teal      #4DB6AC (T300)    #009688 (T500)   rgba(77,182,172,.16)
Indigo Pulse     #7986CB (I300)    #3F51B5 (I500)   rgba(121,134,203,.16)
Violet Insight   #9575CD (DP300)   #673AB7 (DP500)  rgba(149,117,205,.16)
Azure Flow       #64B5F6 (B300)    #2196F3 (B500)   rgba(100,181,246,.16)
Cyan Pulse       #4DD0E1 (C300)    #00BCD4 (C500)   rgba(77,208,225,.16)
Slate Graphite   #90A4AE (BG300)   #607D8B (BG500)  rgba(144,164,174,.16)
```

`--accent-deep` is used for hover/active nav states and pressed buttons in both modes.
`--accent-light` (Light mode only) is used for card washes, table zebra striping, and
selected/active row backgrounds. In dark mode, `--accent-glass` substitutes for
`--accent-light` in those same roles.

---

## 🌓 3. APPEARANCE MODES (Light / Dark / System)

### Shared semantic tokens (fixed across ALL accent themes)

```
Light mode:
--coral-churn:   #EF5350   ← HIGH risk     (Material Red 400)
--amber-watch:   #FFA726   ← MEDIUM risk   (Material Orange 400)
--green-safe:    #66BB6A   ← LOW / Retained (Material Green 400)

Dark mode:
--coral-churn:   #FF8A80   ← HIGH risk     (Material Red A100)
--amber-watch:   #FFD180   ← MEDIUM risk   (Material Orange A100)
--green-safe:    #B9F6CA   ← LOW / Retained (Material Green A100)
```

### Neutral / surface tokens

```
Light mode:
--ink:           #0A1F1C   ← Primary text
--ink-muted:     #5C6F6C   ← Secondary text, captions
--surface:       #F7FAFA   ← Page background
--card:          #FFFFFF   ← Card / panel background
--border:        rgba(var(--accent-primary), 0.20)

Dark mode:
--ink:           #EAF2F1   ← Primary text
--ink-muted:     #9FB3B0   ← Secondary text, captions
--surface:       #121212   ← Page background (Material dark baseline)
--card:          #1E1E1E   ← Card / panel background
--border:        rgba(var(--accent-primary), 0.24)
```

### System mode
`System` simply binds the Appearance token set to the OS-level
`prefers-color-scheme` value and re-checks on focus. No additional design work needed —
just ensure both Light and Dark token sets exist for every screen (see Section 6,
"Per-Route Dark Mode Notes").

---

## 🧩 4. NEW COMPONENTS — THEME SWITCHERS

### `<AppearanceSwitcher>` (🌙 icon — mirrors Image 3)
- 40×40px icon button, 8px radius, icon = sun/moon glyph reflecting current mode
- On click: glassmorphic dropdown panel (`backdrop-filter: blur(16px)`), 12px radius,
  ~180px wide, 8px internal padding
- Rows (36px height, 8px/12px padding): each shows a leading icon + label
  - ⚙️ / sun icon — **Light**
  - 🌙 — **Dark**
  - 🖥️ — **System**
- Active row gets `--accent-glass` background highlight
- Hover state: subtle `--accent-light` (light mode) / lighter grey overlay (dark mode)

### `<AccentSwitcher>` (🎨 icon — mirrors Images 4 & 5)
- 40×40px icon button, 8px radius, palette/paint-roller glyph
- Dropdown panel: same glassmorphic styling as `<AppearanceSwitcher>`, ~200px wide
- Rows (36px height): theme name on the left, **16px filled circle** on the right showing
  that theme's `--accent-primary` (rendered in the *currently active appearance mode*, so
  the dot color itself updates between Light/Dark dot tables above)
- Active theme row: `--accent-glass` background highlight + the dot gets a 2px
  `--accent-deep` ring
- Order matches Section 2 table: Signal Teal → Indigo Pulse → Violet Insight → Azure Flow
  → Cyan Pulse → Slate Graphite

### Placement
- **Dashboard / authenticated top bar:** `[Search] [🔔 Alerts] [🌙 Appearance ▾] [🎨 Accent ▾] [Avatar]`
- **Landing / Auth pages:** insert both icons immediately before `Login` /
  `Get Started`, i.e. `\\ About \\ Features \\ Pricing \\ 🌙 \\ 🎨 \\ Login \\ Get Started`
- Both dropdowns close on outside click and share the same z-index layer as the modal
  overlay glass.

---

## 🪄 5. WHERE ACCENT TOKENS APPLY ACROSS THE APP

Replace every hardcoded `--teal-*` reference in the base spec with the equivalent accent
token. Quick mapping for the design team:

```
Base spec token          →  New theme token
--teal-primary           →  --accent-primary
--teal-deep               →  --accent-deep
--teal-light              →  --accent-light
--teal-glass              →  --accent-glass
```

Specifically, the following elements always use **accent tokens** (change per theme):

- The **ChurnSight Hero Stat** ghost typography (opacity 0.07 light / 0.10 dark, color =
  `--accent-primary`)
- Primary CTA buttons, links, active nav indicator, focus rings, toggle "on" states
- `<AreaChart>` stroke, `<BarChart>` bars, `<RadarChart>` polygon fill, `<HeatmapGrid>`
  scale (0% = `--surface` → 100% = `--accent-deep`)
- Glassmorphism nav/modal tint (`--accent-glass`)
- Card border + shadow tint (`0 4px 24px var(--accent-glass)`)
- Wizard step indicators (filled = `--accent-primary`, active ring = `--accent-primary`)
- Sidebar active-item indicator and icon color

The following elements **never** use accent tokens — they stay on the fixed semantic
risk palette (Section 3) regardless of theme/mode:

- `<RiskPill>`, `<ScoreBar>`, risk-coded KPI cards (At-Risk, Churned, Avg Risk Score)
- Risk distribution histogram buckets, confusion matrix "error" cells
- `<AlertBanner>` severity colors, `<TrendBadge>` up/down arrows (red = bad trend, green =
  good trend — independent of accent)
- Segment scatter-plot category colors (these stay a separate fixed categorical palette:
  SMB = Material Teal 300, Enterprise = Material Red 300, Startup = Material Amber 300 —
  chosen for colorblind-safe contrast, not tied to the accent switcher)

---

## 🌗 6. PER-ROUTE DARK MODE NOTES

All 25 routes from the base spec keep their original layouts. Apply these dark-mode
adjustments uniformly:

- **Hero/auth split-screen panels** (`/auth/login`, `/auth/register`): the teal brand
  panel becomes a gradient from `--accent-deep` → `--surface` (dark) instead of
  `--accent-primary` → `--accent-light` (light)
- **Dashboard hero stat banner**: gradient background swaps to
  `linear-gradient(135deg, var(--accent-deep), var(--card))`
- **Data tables**: zebra striping uses `--accent-glass` on even rows (dark) instead of
  `--accent-light` (light)
- **Charts**: axis lines and gridlines drop to 8% white opacity in dark mode (vs. 8%
  `--ink` opacity in light)
- **Glassmorphism nav/modals**: `backdrop-filter: blur(16px)` stays identical; the tint
  color becomes `rgba(255,255,255,0.04)` layered under `--accent-glass`
- **Empty states / loading skeletons**: shimmer base color shifts from `--accent-light`
  (light) to `#2A2A2A` with `--accent-glass` shimmer sweep (dark)

---

## 📐 7. FIGMA SETUP RECOMMENDATIONS

1. **Two Variable Collections:**
   - `Appearance` — modes: `Light`, `Dark` (controls ink/surface/card/border + the fixed
     risk-color set from Section 3)
   - `Accent` — modes: `Signal Teal`, `Indigo Pulse`, `Violet Insight`, `Azure Flow`,
     `Cyan Pulse`, `Slate Graphite` (controls `--accent-*` tokens from Section 2)
2. Alias every component color style to BOTH collections so any combination (6 accents ×
   2 appearances = 12 total looks) renders correctly without manual rework.
3. Build a **"Theme Matrix" QA page** — a 6×2 grid of the Dashboard hero banner + KPI row,
   one cell per Accent/Appearance combination, to sanity-check contrast and risk-color
   legibility everywhere.
4. Wire `<AppearanceSwitcher>` and `<AccentSwitcher>` as interactive components using
   Figma's native **"Set variable mode"** prototype action, so stakeholders can click
   through both dropdowns in prototype mode exactly as shown in the reference
   screenshots.
5. Default state for new files: `Signal Teal` + `Light`.

---

## ✅ UPDATED DESIGNER CHECKLIST (additions)

- [ ] Build both Variable Collections (`Appearance`, `Accent`) before touching any screen
- [ ] All 6 accent themes pass WCAG AA contrast in both Light and Dark for text-on-accent
      and accent-on-surface combinations
- [ ] Risk colors (`coral-churn` / `amber-watch` / `green-safe`) verified identical across
      all 6 accent themes — spot-check the `/customers` table and `/dashboard` KPI row
- [ ] `<AppearanceSwitcher>` and `<AccentSwitcher>` placed identically on every
      authenticated top nav and on the public landing nav
- [ ] Ghost Hero Stat opacity = 0.07 (Light) / 0.10 (Dark) in every accent theme
- [ ] "Theme Matrix" QA page completed (6 accents × 2 appearances)
- [ ] Segment scatter-plot categorical colors (SMB/Enterprise/Startup) confirmed
      colorblind-safe and NOT tied to the Accent Switcher
- [ ] System mode correctly mirrors OS `prefers-color-scheme` in prototype notes