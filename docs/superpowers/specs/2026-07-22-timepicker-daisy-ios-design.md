# TimePicker: desktop menu columns + iOS mobile wheel

Approved 2026-07-22.

## Goals

- **Desktop**: bordered float dropdown + column menus — active row highlight, footer actions.
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

- `MenuColumns` — multi-column scroll menus (desktop pickers).
- `PickerWheels mode="drum"` — iOS wheel (mobile time/date/picker).
- Sheet chrome: `rounded-t-[14px]`, no hard border, confirm label 「完成」 for wheel sheets.

## Follow-up: align other pickers

| Component | Desktop | Mobile | Status |
|-----------|---------|--------|--------|
| **TimePicker** | Menu columns | iOS drum | Done |
| **Picker** | Multi-column menu via `MenuColumns` | iOS drum sheet aligned | Done |
| **DatePicker** | Keep calendar panel (float polish) | Year/month/day drum sheet aligned | Done |
| **Select** | Dropdown list (float polish) | Bottom sheet list (no drum) | Done |
| **Cascader** | Multi-level menu columns | Stepwise bottom sheet | Done |

**Order completed:** `Picker` → `DatePicker` mobile → `Select` / `Cascader`.

## Out of scope

- New props or format modes.
- Forcing drum wheels onto Select / Cascader mobile.
