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

## Shared building blocks

- `MenuColumns` — daisyUI multi-column scroll menus (desktop pickers).
- `PickerWheels mode="drum"` — iOS wheel (mobile time/date/picker).
- Sheet chrome: `rounded-t-[14px]`, no hard border, confirm label 「完成」 for wheel sheets.

## Follow-up: align other pickers

| Component | Desktop | Mobile | Status |
|-----------|---------|--------|--------|
| **TimePicker** | daisyUI menu columns | iOS drum | Done |
| **Picker** | daisyUI multi-column menu via `MenuColumns` | iOS drum sheet aligned | Done |
| **DatePicker** | Keep calendar panel (daisyUI float polish) | Year/month/day drum sheet aligned | Done |
| **Select** | Dropdown list (daisyUI float polish) | Bottom sheet list (no drum) | Done |
| **Cascader** | Multi-level daisyUI menu columns | Stepwise bottom sheet | Done |

**Order completed:** `Picker` → `DatePicker` mobile → `Select` / `Cascader`.

## Out of scope

- New props or format modes.
- Forcing drum wheels onto Select / Cascader mobile.
