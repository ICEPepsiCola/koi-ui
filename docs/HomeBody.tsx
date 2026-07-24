import { useLang } from '@rspress/core/runtime';
import { ThemeLab } from './ThemeLab';

const FEATURES = {
  en: [
    {
      title: 'Adaptive by default',
      details:
        'Table, Modal, Form, and Select flip between desktop and mobile layouts at the breakpoint.',
    },
    {
      title: 'Theme skins',
      details:
        'Six data-theme skins with shared semantic colors — switch live in the docs.',
    },
    {
      title: 'Shared appearance',
      details: 'solid / soft / outline / ghost across Button, Tag, Badge, and Alert.',
    },
    {
      title: 'Copy-ready recipes',
      details:
        'Sign-in, data list, and settings slices that already feel product-complete.',
    },
  ],
  zh: [
    {
      title: '默认自适应',
      details: 'Table、Modal、Form、Select 等按断点自动切换桌面 / 移动布局。',
    },
    {
      title: '主题皮肤',
      details: '内置 6 套 data-theme 皮肤与语义色，文档站可即时切换。',
    },
    {
      title: '统一外观读法',
      details: 'Button、Tag、Badge、Alert 共用 solid / soft / outline / ghost。',
    },
    {
      title: '可抄场景',
      details: '登录、列表、设置表单等成品切片，可直接带进业务。',
    },
  ],
} as const;

export function HomeBody() {
  const lang = useLang() === 'zh' ? 'zh' : 'en';
  const features = FEATURES[lang];

  return (
    <div className="koi-home">
      <section className="koi-home__features" aria-label={lang === 'zh' ? '能力' : 'Features'}>
        {features.map((item) => (
          <article key={item.title} className="koi-home__feature">
            <h2 className="koi-home__feature-title">{item.title}</h2>
            <p className="koi-home__feature-detail">{item.details}</p>
          </article>
        ))}
      </section>

      <section className="koi-home__lab" aria-label={lang === 'zh' ? '主题皮肤' : 'Theme skins'}>
        <ThemeLab />
      </section>
    </div>
  );
}
