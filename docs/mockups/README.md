# Mockup 本地副本

文档预览用的浏览器 / 手机 / 窗口 / 代码框样式。

| 文件 | 说明 |
|------|------|
| `mockup.css` | 四组件可读 CSS（含变量回退） |
| `mockup.daisyui.css` | 压缩版 CSS 备份 |
| `examples.tsx` | React 用法示例 |

**尚未接入**现有 `DevicePreviewShell` / `docs/styles.css`。要用时自行 `@import`。

## 类名

- `mockup-browser` + `mockup-browser-toolbar` + `.input`
- `mockup-phone` + `mockup-phone-camera` + `mockup-phone-display`
- `mockup-window`
- `mockup-code`（`pre[data-prefix]`）
