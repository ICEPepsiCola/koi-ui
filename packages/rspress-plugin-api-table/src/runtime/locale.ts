/** Demo / API default-value locale helpers (Chinese → English phrase map). */

const DEMO_ZH_TO_EN_SOURCE: Array<[string, string]> = [
  ['请输入有效内容', 'Enter valid content'],
  ['请输入密码', 'Enter password'],
  ['请输入', 'Enter text'],
  ['必填', 'Required'],
  ['加载中', 'Loading'],
  ['禁用', 'Disabled'],
];

const DEMO_ZH_TO_EN = [...DEMO_ZH_TO_EN_SOURCE].sort(
  (a, b) => b[0].length - a[0].length || a[0].localeCompare(b[0]),
);

const HAS_CJK = /[\u4e00-\u9fff]/;

export function hasCjk(value: unknown) {
  return HAS_CJK.test(String(value ?? ''));
}

export function toEnglishDemoText(value: unknown) {
  let out = String(value ?? '');
  if (!hasCjk(out)) return out;
  for (const [zh, en] of DEMO_ZH_TO_EN) {
    if (out.includes(zh)) out = out.split(zh).join(en);
  }
  return out;
}
