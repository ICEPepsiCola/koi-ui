# Apple HIG Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor Koi UI toward Apple HIG — system Light/Dark, spring motion language, interruptible sheet physics, and iOS-like materials/typography — shipped as a major release in three phases (A → B → C).

**Architecture:** Centralize design language in `@koi-ui/tokens` + `packages/core/src/motion/*` + `utils/interaction.ts`. Gesture physics live in a shared runtime consumed by FloatingPanel / ActionSheet / Drawer / mobile sheets. Components adopt materials and springs through shared fragments, not one-off styles.

**Tech Stack:** React 19, Tailwind v4 CSS vars (`@koi-ui/tokens`), `motion/react` springs, Pointer Events, existing Overlay / MotionPanel / SheetChrome.

## Global Constraints

- Release as **major** (breaking): theme skins removed; default motion/visuals change.
- Visual target: **close to iOS / Apple HIG**, not “Koi personality with Apple motion only”.
- Themes: **only `light` + `dark`**; keep `primaryColor` override.
- Phases ship in order: **A foundation → B gesture physics → C visual sweep**. Do not start B until A’s tests/docs gate passes.
- Prefer compositor props: `transform` / `opacity`. Honor `prefers-reduced-motion` and `prefers-reduced-transparency`.
- Conventional Commits: Phase A commits use `feat!` / `BREAKING CHANGE`; later phases `feat` / `fix` / `refactor` as appropriate.
- After each task: `pnpm lint` + `pnpm typecheck` (+ targeted tests named in the task).
- Do **not** vendor SF Pro font files; keep `system-ui`.
- Do **not** rewrite Swiper / PullToRefresh in Phase B (defer).

## File map

| File | Responsibility |
|------|----------------|
| `packages/tokens/src/theme.css` | Light/Dark tokens, materials, radii, shadows, type tracking, reduced-transparency |
| `packages/core/src/provider/context.ts` | `KOI_THEME_NAMES` → `light` \| `dark` |
| `packages/core/src/provider/KoiProvider.tsx` | Apply theme; no colorful skins |
| `packages/core/src/motion/presets.ts` | Spring presets + panel/float variants |
| `packages/core/src/motion/physics.ts` | `project`, `rubberband`, velocity helpers |
| `packages/core/src/motion/gesture.ts` | Shared drag session (capture, history, release) |
| `packages/core/src/utils/interaction.ts` | `pressable`, `materialRegular` / `Thick`, floatPanel |
| `packages/core/src/components/shared/{Overlay,MotionPanel,SheetChrome,FloatMenu}.tsx` | Consume new presets/materials |
| `packages/core/src/components/FloatingPanel/FloatingPanel.tsx` | Phase B: snap via projection |
| `packages/core/src/components/ActionSheet/ActionSheet.tsx` | Phase B: shared gesture runtime |
| `packages/core/src/components/Drawer/Drawer.tsx` | Phase B: rubber-band + velocity |
| `docs/{en,zh}/guide/theming.mdx`, `ThemeLab.tsx`, `DevicePreviewShell.tsx` | Light/Dark only |
| Component batches (Phase C) | Button, fields, chrome, lists — visual HIG |

---

# Phase A — Foundation

### Task 1: Converge themes to Light + Dark

**Files:**
- Modify: `packages/tokens/src/theme.css`
- Modify: `packages/core/src/provider/context.ts`
- Modify: `packages/core/src/provider/KoiProvider.tsx` (if it references skin lists)
- Modify: `packages/core/tests/index.test.tsx` (ocean → dark/light)
- Modify: `docs/ThemeLab.tsx`, `docs/DevicePreviewShell.tsx`, `docs/HomeBody.tsx`
- Modify: `docs/en/guide/theming.mdx`, `docs/zh/guide/theming.mdx`

**Interfaces:**
- Consumes: none
- Produces: `KOI_THEME_NAMES = ['light', 'dark'] as const`; `KoiThemeName = 'light' | 'dark'`

- [ ] **Step 1: Update failing provider test expectation**

In `packages/core/tests/index.test.tsx`, change the theme application test from `ocean` to `dark`:

```tsx
test('KoiProvider applies data-theme and CSS overrides', () => {
  render(
    <KoiProvider theme={{ name: 'dark', primaryColor: 'hsl(200 80% 40%)' }}>
      <span>hi</span>
    </KoiProvider>,
  );
  const root = document.querySelector('[data-theme]');
  expect(root).toHaveAttribute('data-theme', 'dark');
});
```

- [ ] **Step 2: Run test — may still pass if ocean exists; proceed to remove skins**

Run: `pnpm --filter @koi-ui/core test -- tests/index.test.tsx`

- [ ] **Step 3: Narrow theme names in context**

```ts
export const KOI_THEME_NAMES = ['light', 'dark'] as const;
export type KoiThemeName = (typeof KOI_THEME_NAMES)[number];
```

- [ ] **Step 4: Delete colorful skins from `theme.css`**

Remove `[data-theme='ocean'|'forest'|'sunset'|'violet']` blocks entirely. Keep `[data-theme='light']`, `html.dark` / `html.rp-dark` / `[data-theme='dark']`. Retune light/dark primary toward system blue:

```css
/* light */
--color-primary: hsl(211 100% 50%);
/* dark */
--color-primary: hsl(210 100% 52%);
```

Shift surface/muted/border toward iOS gray ramps (approximate):

```css
/* light examples — adjust as a set, not one-off */
--color-surface: hsl(0 0% 100%);
--color-muted: hsl(240 5% 96%);
--color-muted-foreground: hsl(240 4% 46%);
--color-border: hsl(240 6% 90%);
--color-surface-foreground: hsl(240 6% 10%);
```

- [ ] **Step 5: Update ThemeLab + DevicePreviewShell + HomeBody + theming docs**

Only expose `light` / `dark` labels. Default ThemeLab to `light`. Rewrite theming MDX: “Two appearances: light and dark. Override `--color-primary` via `KoiProvider`.”

- [ ] **Step 6: Verify**

Run:

```bash
pnpm lint && pnpm typecheck && pnpm --filter @koi-ui/core test -- tests/index.test.tsx
```

Expected: pass.

- [ ] **Step 7: Commit**

```bash
git add packages/tokens/src/theme.css packages/core/src/provider docs packages/core/tests/index.test.tsx
git commit -m "$(cat <<'EOF'
feat!: converge themes to light and dark only

BREAKING CHANGE: remove ocean/forest/sunset/violet data-theme skins.
EOF
)"
```

---

### Task 2: Material + radius + shadow tokens

**Files:**
- Modify: `packages/tokens/src/theme.css`
- Modify: `packages/core/src/utils/interaction.ts`
- Test: `packages/core/tests/interaction-materials.test.ts` (new; assert class strings export)

**Interfaces:**
- Consumes: Task 1 themes
- Produces:
  - CSS: `--material-regular-bg`, `--material-thick-bg`, `--blur-regular`, `--blur-thick`
  - JS: `materialRegular`, `materialThick` string constants

- [ ] **Step 1: Add material CSS variables under `@theme` and both appearances**

```css
@theme {
  --blur-regular: 20px;
  --blur-thick: 40px;
  --material-regular-bg: hsl(0 0% 100% / 0.72);
  --material-thick-bg: hsl(0 0% 100% / 0.84);
  /* bump radii toward iOS */
  --radius-selector: 0.5rem;
  --radius-field: 0.625rem;
  --radius-box: 1rem;
}

[data-theme='light'] {
  --material-regular-bg: hsl(0 0% 100% / 0.72);
  --material-thick-bg: hsl(0 0% 100% / 0.84);
}

[data-theme='dark'] {
  --material-regular-bg: hsl(240 6% 12% / 0.72);
  --material-thick-bg: hsl(240 6% 12% / 0.84);
}

@media (prefers-reduced-transparency: reduce) {
  [data-theme='light'],
  [data-theme='dark'],
  :root {
    --material-regular-bg: hsl(0 0% 100%);
    --blur-regular: 0px;
    --blur-thick: 0px;
  }
  [data-theme='dark'] {
    --material-regular-bg: hsl(240 6% 12%);
  }
}
```

Also soften float/overlay shadows to ambient (less harsh black).

- [ ] **Step 2: Export material class fragments**

In `interaction.ts`:

```ts
export const materialRegular =
  'bg-[var(--material-regular-bg)] backdrop-blur-[length:var(--blur-regular)] backdrop-saturate-150 border border-white/40 dark:border-white/10';

export const materialThick =
  'bg-[var(--material-thick-bg)] backdrop-blur-[length:var(--blur-thick)] backdrop-saturate-150 border border-white/40 dark:border-white/10';
```

If Tailwind v4 arbitrary `backdrop-blur-[length:var(...)]` is awkward in this repo, use fixed `backdrop-blur-xl` / `backdrop-blur-2xl` mapped to regular/thick and keep bg as CSS var.

Update `floatPanel`:

```ts
export const floatPanel = cn(
  'rounded-box p-1 shadow-float',
  materialRegular,
);
```

(Import `cn` or use string join consistent with file style.)

- [ ] **Step 3: Smoke test exports**

```ts
// packages/core/tests/interaction-materials.test.ts
import { materialRegular, materialThick, floatPanel } from '../src/utils/interaction';

test('material fragments are non-empty', () => {
  expect(materialRegular.length).toBeGreaterThan(10);
  expect(materialThick.length).toBeGreaterThan(10);
  expect(floatPanel).toContain('shadow-float');
});
```

- [ ] **Step 4: Run tests + lint/typecheck**

```bash
pnpm --filter @koi-ui/core test -- tests/interaction-materials.test.ts
pnpm lint && pnpm typecheck
```

- [ ] **Step 5: Commit**

```bash
git commit -m "feat!: add material tokens and shared material surface classes"
```

---

### Task 3: Spring motion presets

**Files:**
- Modify: `packages/core/src/motion/presets.ts`
- Modify: consumers already importing `motionTransition` (Overlay/MotionPanel/FloatMenu/Collapse/Toast — keep exports, change implementation)
- Test: `packages/core/tests/motion-presets.test.ts` (new)

**Interfaces:**
- Consumes: `motion/react` `Transition`
- Produces:
  - `springSnappy`, `springSoft`, `springMomentum: Transition`
  - `motionTransition` → alias of `springSoft` (or snappy for floats — document choice: **floats use snappy, panels use soft, sheets use momentum**)
  - Panel variants use spring transitions

- [ ] **Step 1: Write preset shape test**

```ts
import {
  springSnappy,
  springSoft,
  springMomentum,
  motionTransition,
} from '../src/motion/presets';

test('spring presets use spring type', () => {
  for (const t of [springSnappy, springSoft, springMomentum, motionTransition]) {
    expect(t).toMatchObject({ type: 'spring' });
  }
});
```

- [ ] **Step 2: Run — expect fail (exports missing)**

```bash
pnpm --filter @koi-ui/core test -- tests/motion-presets.test.ts
```

- [ ] **Step 3: Implement springs (Apple damping/response via Motion bounce/duration)**

```ts
import type { Transition, Variants } from 'motion/react';

/** Critically damped-ish, snappy UI (~response 0.3s). */
export const springSnappy: Transition = {
  type: 'spring',
  bounce: 0,
  duration: 0.3,
};

/** Soft reposition / center modal (~response 0.4s). */
export const springSoft: Transition = {
  type: 'spring',
  bounce: 0,
  duration: 0.4,
};

/** Momentum sheet — slight bounce only when flick handed off later. */
export const springMomentum: Transition = {
  type: 'spring',
  bounce: 0.2,
  duration: 0.35,
};

/** Default overlay/panel transition — soft, no bounce. */
export const motionTransition: Transition = springSoft;
```

Wire `panelBottomVariants` / `panelCenterVariants` / `floatPanelVariants` / `overlayScrimVariants` to use these (scrim may stay short tween opacity for predictability):

```ts
export const overlayScrimVariants: Variants = {
  open: { opacity: 1, transition: { duration: 0.25, ease: 'easeOut' } },
  closed: { opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
};

export const panelBottomVariants: Variants = {
  open: { y: 0, transition: springMomentum },
  closed: { y: '100%', transition: springSoft },
};
```

Keep `useReducedMotion` behavior in components: when reduced, pass `{ duration: 0.01 }` or opacity-only variants (add `resolveTransition(reduce: boolean)` helper if needed).

- [ ] **Step 4: Run tests + lint/typecheck**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat!: replace duration easing presets with Apple-style springs"
```

---

### Task 4: Physics helpers + pressable feedback

**Files:**
- Create: `packages/core/src/motion/physics.ts`
- Modify: `packages/core/src/utils/interaction.ts` (`pressable`)
- Modify: `packages/core/src/motion/presets.ts` — re-export physics if useful
- Test: `packages/core/tests/motion-physics.test.ts`

**Interfaces:**
- Produces:

```ts
export function project(
  initialVelocity: number,
  decelerationRate = 0.998,
): number; // px displacement

export function rubberband(
  overshoot: number,
  dimension: number,
  constant = 0.55,
): number;

export function relativeVelocity(
  gestureVelocity: number,
  current: number,
  target: number,
): number;
```

- [ ] **Step 1: Failing tests for Apple projection + rubberband**

```ts
import { project, rubberband, relativeVelocity } from '../src/motion/physics';

test('project uses exponential deceleration', () => {
  const d = 0.998;
  const v = 1000; // px/s
  expect(project(v, d)).toBeCloseTo((v / 1000) * d / (1 - d), 5);
});

test('rubberband resists past bound', () => {
  expect(rubberband(100, 300, 0.55)).toBeLessThan(100);
  expect(rubberband(0, 300)).toBe(0);
});

test('relativeVelocity normalizes by remaining distance', () => {
  expect(relativeVelocity(50, 50, 150)).toBeCloseTo(0.5);
});
```

- [ ] **Step 2: Implement `physics.ts` exactly from Apple skill formulas**

```ts
export function project(initialVelocity: number, decelerationRate = 0.998) {
  return (initialVelocity / 1000) * decelerationRate / (1 - decelerationRate);
}

export function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  if (dimension === 0) return 0;
  return (
    (overshoot * dimension * constant) /
    (dimension + constant * Math.abs(overshoot))
  );
}

export function relativeVelocity(
  gestureVelocity: number,
  current: number,
  target: number,
) {
  const delta = target - current;
  if (delta === 0) return 0;
  return gestureVelocity / delta;
}
```

- [ ] **Step 3: Tighten pressable**

```ts
/** Instant press — skill: scale ~0.97 on pointer-down feel via :active */
export const pressable =
  'active:scale-[0.97] transition-transform duration-100 ease-out motion-reduce:active:scale-100 motion-reduce:transition-none';
```

- [ ] **Step 4: Soften global reduced-motion nuke in tokens**

Replace the aggressive `* { animation-duration: 0.01ms !important }` block with a comment that components handle reduced motion; keep only `scroll-behavior: auto` globally, OR scope the nuke away from `.koi-pressable` if you must keep it. Prefer component-level handling so press feedback survives.

- [ ] **Step 5: Verify + commit**

```bash
pnpm --filter @koi-ui/core test -- tests/motion-physics.test.ts
pnpm lint && pnpm typecheck
git commit -m "feat: add gesture physics helpers and snappier pressable"
```

---

### Task 5: Apply materials to shared chrome (Phase A gate)

**Files:**
- Modify: `packages/core/src/components/shared/FloatMenu.tsx`
- Modify: `packages/core/src/components/shared/SheetChrome.tsx`
- Modify: `packages/core/src/components/shared/MotionPanel.tsx` (bottom sheet surface)
- Modify: `docs/en/guide/theming.mdx` (+ zh) — mention materials + springs briefly

**Interfaces:**
- Consumes: `materialRegular` / `materialThick`, spring presets

- [ ] **Step 1: Sheet / float surfaces use materials**

Bottom `MotionPanel` / sheet wrappers: `materialThick` + large top radius (`rounded-t-[1.25rem]`). `FloatMenu`: already via `floatPanel`. Toast/Notification can wait for Phase C if risky — at minimum FloatMenu + SheetChrome.

- [ ] **Step 2: Manual check**

Run `pnpm doc`, open Select / DatePicker (desktop float) and a mobile sheet preview — confirm blur/translucency and spring open (no 200ms linear feel).

- [ ] **Step 3: Commit**

```bash
git commit -m "feat: apply material surfaces to float menus and sheets"
```

**Phase A done when:** themes are light/dark only; springs are default; materials exist; physics utils exist; lint/typecheck/tests green.

---

# Phase B — Gesture physics

### Task 6: Shared gesture runtime

**Files:**
- Create: `packages/core/src/motion/gesture.ts`
- Test: `packages/core/tests/motion-gesture.test.ts` (unit-test pure helpers extracted from gesture: sample velocity from history)

**Interfaces:**
- Produces:

```ts
export type PointSample = { y: number; t: number };

export function velocityFromSamples(
  samples: PointSample[],
  axis: 'y' | 'x' = 'y',
): number; // px/s, last window

export function nearestAnchor(
  projected: number,
  anchors: number[], // absolute px heights or positions
): number;

export function shouldDismiss(options: {
  velocity: number; // px/s, positive = toward dismiss
  offset: number;
  dismissOffset: number;
  dismissVelocity: number;
}): boolean;
```

- [ ] **Step 1: Tests for velocityFromSamples / nearestAnchor / shouldDismiss**
- [ ] **Step 2: Implement helpers**
- [ ] **Step 3: Optional `useVerticalDrag` hook** in `packages/core/src/hooks/useVerticalDrag.ts` wrapping pointer capture + sample buffer + rubberband beyond min/max
- [ ] **Step 4: Commit** `feat: add shared vertical drag gesture helpers`

---

### Task 7: FloatingPanel — projection snap + interruptible spring

**Files:**
- Modify: `packages/core/src/components/FloatingPanel/FloatingPanel.tsx`
- Test: existing FloatingPanel tests if any; else add `packages/core/tests/floating-panel.test.tsx` for dismiss threshold behavior with mocked velocity helper

**Interfaces:**
- Consumes: `project`, `rubberband`, `nearestAnchor`, `springMomentum`
- Breaking: dismiss uses projected endpoint + velocity sign, not only “half of lowest anchor”

- [ ] **Step 1: On pointer release, compute `projected = currentY + project(v)`**, map to height, `nearestAnchor`, animate with `velocity` option into spring
- [ ] **Step 2: During drag, 1:1 track with grab offset; rubberband above max / below min**
- [ ] **Step 3: Mid-animation pointerdown interrupts — cancel spring, continue from live translateY**
- [ ] **Step 4: Scrim opacity tracks drag progress continuously**
- [ ] **Step 5: Manual QA checklist from design (grab mid-flight, flick dismiss, rubberband)**
- [ ] **Step 6: Commit** `feat!: FloatingPanel momentum projection and interruptible drag`

---

### Task 8: ActionSheet + Drawer adopt shared runtime

**Files:**
- Modify: `packages/core/src/components/ActionSheet/ActionSheet.tsx`
- Modify: `packages/core/src/components/Drawer/Drawer.tsx` (+ view files if split)
- Delete local one-off velocity math in ActionSheet

- [ ] **Step 1: Replace ActionSheet drag block with shared helpers; keep API `closeOnDrag`**
- [ ] **Step 2: Drawer edge drag — independent axis spring; rubberband past edge**
- [ ] **Step 3: Symmetric enter/exit paths unchanged (bottom/left/right)**
- [ ] **Step 4: Tests + commit** `feat!: ActionSheet and Drawer use shared gesture physics`

---

### Task 9: Modal mobile sheet + SheetChrome consumers

**Files:**
- Modify: Modal mobile path (`DrawerView` / bottom placement)
- Verify DatePicker / Select / Picker mobile sheets inherit MotionPanel/SheetChrome behavior (no per-picker physics)

- [ ] **Step 1: Ensure mobile Modal uses same bottom spring + dismiss physics**
- [ ] **Step 2: Smoke test pickers on mobile preview in docs**
- [ ] **Step 3: Docs note in theming or new short `docs/zh/guide/motion.mdx` (+ en): projection, rubberband, reduced-motion**
- [ ] **Step 4: Commit** `feat: unify mobile sheet physics for Modal and pickers`

**Phase B done when:** FloatingPanel / ActionSheet / Drawer / mobile Modal pass manual gesture checklist; unit tests for physics/gesture green.

---

# Phase C — Visual HIG sweep

### Task 10: Semantic system colors + type scale tokens

**Files:**
- Modify: `packages/tokens/src/theme.css` — add label/separator/fill steps if missing; display/title/body/caption tracking vars
- Modify: `packages/core/src/components/Typography/Typography.tsx` — consume tracking/leading

- [ ] **Step 1: Add `--text-display-tracking: -0.02em` etc.**
- [ ] **Step 2: Typography Title uses tighter leading + negative tracking**
- [ ] **Step 3: Commit** `feat: system typography tracking and label hierarchy`

---

### Task 11: Control batch — Button, Input, Switch, Slider, Segmented

**Files:** respective component folders + smoke tests

- [ ] **Step 1: Hit targets ≥ 44px where primary controls; visual height may stay compact with padding**
- [ ] **Step 2: Unified `pressable` on interactive controls**
- [ ] **Step 3: Fields use hairline separators / softer borders; open state glow stays accessible**
- [ ] **Step 4: Commit** `feat: iOS-like control density and press feedback`

---

### Task 12: Chrome batch — NavBar, TabBar, Menu, Dropdown, Popover, Tooltip

- [ ] **Step 1: Nav/TabBar → materialRegular; content scrolls underneath where applicable**
- [ ] **Step 2: Popover/Menu → material + springSnappy; transform-origin toward trigger when possible**
- [ ] **Step 3: Commit** `feat: material chrome for navigation and floating UI`

---

### Task 13: Data display batch — List, Card, Table, Empty, Descriptions

- [ ] **Step 1: Prefer inset grouped list styling primitives (shared class)**
- [ ] **Step 2: Cards: less border, more grouping + separator**
- [ ] **Step 3: Commit** `feat: inset-grouped list and calmer data display surfaces`

---

### Task 14: Feedback batch + ThemeLab finalization

- [ ] **Step 1: Toast/Notification/Alert materials + soft springs**
- [ ] **Step 2: Form inline error patterns remain; destructive confirms stay rare**
- [ ] **Step 3: ThemeLab only Light/Dark + primary; Home copy updated**
- [ ] **Step 4: Full `pnpm check` (or `pnpm push:check`)**
- [ ] **Step 5: Commit** `feat: finalize Apple HIG visual sweep for feedback components`

**Phase C / project done when:** `pnpm check` green; docs show Light/Dark only; sheet gestures + materials + springs feel coherent in doc preview.

---

## Self-review (plan)

1. **Coverage:** A themes/materials/springs/physics/pressable/chrome ✓ — B gesture/FloatingPanel/ActionSheet/Drawer/Modal ✓ — C type/controls/chrome/lists/feedback ✓
2. **Placeholders:** none intentional; Phase B/C steps are thinner on full file dumps but name exact files and acceptance criteria
3. **Types:** `KoiThemeName`, spring presets, `project`/`rubberband`/`velocityFromSamples` naming consistent across tasks

## Execution note

Execute **Phase A (Tasks 1–5)** first end-to-end. Pause for visual/doc review, then **Phase B (6–9)**, then **Phase C (10–14)**. Do not squash phases into one commit.
