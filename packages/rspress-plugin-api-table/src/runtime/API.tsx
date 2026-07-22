import { useLang } from '@rspress/core/runtime';
import { usePage } from '@rspress/core/runtime';
import commonI18n from '../../../../i18n/common.json';
import type { ComponentDoc, PropDoc } from '../types';
import { apiData } from 'virtual-koi-api';
import { hasCjk, toEnglishDemoText } from './locale';

type Lang = 'en' | 'zh';

export interface APIProps {
  /** Component export name, e.g. `Button`. Inferred from route slug when omitted. */
  name?: string;
}

function tApi(key: keyof typeof commonI18n.api, lang: Lang) {
  return commonI18n.api[key]?.[lang] ?? commonI18n.api[key]?.en ?? key;
}

function propDesc(name: string, raw: string | undefined, lang: Lang) {
  const i18n =
    commonI18n.prop[name as keyof typeof commonI18n.prop]?.[lang] ??
    commonI18n.prop[name as keyof typeof commonI18n.prop]?.en;
  if (i18n) return i18n;
  if (!raw) return '-';
  if (lang === 'en' && hasCjk(raw)) {
    const localized = toEnglishDemoText(raw);
    return hasCjk(localized) ? '-' : localized;
  }
  return raw;
}

function softBreakType(typeName: string) {
  return String(typeName ?? '').replace(/([|&,])/g, '$1\u200B');
}

export function inferComponentName(routePath: string): string {
  const slug =
    routePath.replace(/\/$/, '').split('/').filter(Boolean).pop() || '';
  const match = Object.keys(apiData).find(
    (name) => name.toLowerCase() === slug.toLowerCase(),
  );
  return match ?? slug;
}

function sortPropNames(props: Record<string, PropDoc>) {
  return Object.keys(props).sort((a, b) => {
    const aRequired = props[a]?.required ? 0 : 1;
    const bRequired = props[b]?.required ? 0 : 1;
    if (aRequired !== bRequired) return aRequired - bRequired;
    return a.localeCompare(b);
  });
}

function ComponentDocBlock({
  doc,
  lang,
}: {
  doc: ComponentDoc;
  lang: Lang;
}) {
  const props = doc.props ?? {};
  const propNames = sortPropNames(props);
  if (!propNames.length) return null;

  let intro: string | null = null;
  if (doc.description) {
    const localized =
      lang === 'en' ? toEnglishDemoText(doc.description) : doc.description;
    if (!(lang === 'en' && hasCjk(localized))) intro = localized;
  }

  const requiredLabel = tApi('required', lang);

  return (
    <div className="koi-api-docs-section">
      {doc.displayName ? <h3>{doc.displayName}</h3> : null}
      {intro ? <p>{intro}</p> : null}
      <table>
        <thead>
          <tr>
            <th>{tApi('property', lang)}</th>
            <th>{tApi('description', lang)}</th>
            <th>{tApi('type', lang)}</th>
            <th>{tApi('defaultValue', lang)}</th>
          </tr>
        </thead>
        <tbody>
          {propNames.map((propName) => {
            const prop = props[propName]!;
            const typeText = softBreakType(prop.type.name);
            const rawDefault = prop.defaultValue?.value ?? '-';
            const defaultText =
              lang === 'en' ? toEnglishDemoText(rawDefault) : rawDefault;
            const desc = propDesc(prop.name, prop.description, lang);
            return (
              <tr key={prop.name}>
                <td>
                  <code>{prop.name}</code>
                </td>
                <td>{desc}</td>
                <td>
                  <code>{typeText}</code>
                  {prop.required ? (
                    <>
                      {' '}
                      <strong>({requiredLabel})</strong>
                    </>
                  ) : null}
                </td>
                <td>
                  <code>{defaultText}</code>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const API = ({ name }: APIProps) => {
  const lang = (useLang() === 'zh' ? 'zh' : 'en') as Lang;
  const { page } = usePage();
  const componentName = name ?? inferComponentName(page.routePath);
  const parsed = apiData[componentName];
  const docs = parsed?.docs;

  if (!docs?.length) {
    return <p>{tApi('empty', lang)}</p>;
  }

  const sections = docs as ComponentDoc[];

  return (
    <div className="koi-api-docs space-y-8">
      {sections.map((doc) => (
        <ComponentDocBlock
          key={doc.displayName ?? componentName}
          doc={doc}
          lang={lang}
        />
      ))}
    </div>
  );
};

export default API;
