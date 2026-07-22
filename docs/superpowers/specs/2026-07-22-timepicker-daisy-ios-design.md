# TimePicker: daisyUI desktop + iOS mobile

Approved 2026-07-22.

## Goals

- **Desktop**: daisyUI-like `dropdown` + `menu` — bordered float, column lists, active row highlight, footer actions.
- **Mobile**: classic iOS wheel — bottom sheet, cancel/title/done, center highlight, fade masks, snap.

## Approach

Option A: restyle `TimeDropdownView` and polish `TimeWheelView` / shared drum chrome. No API changes.

## Desktop

- Keep `FieldTrigger` + clock trailing icon.
- Panel: `FloatMenu` with rounded border, soft shadow, no drum highlight.
- Columns: independent scrollable menus (hour / minute [/ second]); click updates draft.
- Active item: solid soft highlight (menu-active feel), tabular nums.
- Footer: 「此刻」 (commit now) + 「确定」 (commit draft). Outside click closes without commit.

## Mobile

- Portal + Overlay + bottom `MotionPanel` + `SheetChrome`.
- `PickerWheels mode="drum"` with clearer center band and fade.
- Confirm commits; cancel / scrim dismiss discards draft.
- Wheel columns support native vertical scroll + snap (mouse wheel / touch); scrollbar is hidden by design.

## Follow-up: align other pickers

Same adaptive pattern can roll out to related components (approved direction 2026-07-22):

| Component | Desktop | Mobile | Notes |
|-----------|---------|--------|-------|
| **TimePicker** | Done (daisyUI menu columns) | Done (iOS drum) | Baseline |
| **Picker** | daisyUI multi-column menu | Polish existing drum to match | Closest; do first |
| **DatePicker** | Keep calendar panel | Year/month/day drum sheet aligned with TimePicker | Do not force menu columns on PC |
| **Select** | Already dropdown-like | Bottom sheet list (no drum) | Single-column options |
| **Cascader** | Multi-level menu / panel | Multi-column drum or stepwise sheet | More complex; later |

**Suggested order:** `Picker` → `DatePicker` mobile → `Select` / `Cascader` as needed.

## Out of scope (this change)

- Implementing the follow-up table above (documented only).
- New props or format modes.
