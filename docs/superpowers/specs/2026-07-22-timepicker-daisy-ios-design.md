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

## Out of scope

- DatePicker / Picker / Select visual overhaul.
- New props or format modes.
