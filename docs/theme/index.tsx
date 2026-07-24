import type { ComponentProps } from 'react';
import { usePage } from '@rspress/core/runtime';
import {
  Layout as BasicLayout,
  Nav as BasicNav,
  type LayoutProps,
} from '@rspress/core/theme-original';
import corePackage from '../../packages/core/package.json';
import { HomeBody } from '../HomeBody';

export function Nav(props: ComponentProps<typeof BasicNav>) {
  return (
    <BasicNav
      {...props}
      afterNavMenu={
        <>
          {props.afterNavMenu}
          <span className="koi-docs-version" aria-label="Package version">
            v{corePackage.version}
          </span>
        </>
      }
    />
  );
}

export function Layout(props: LayoutProps) {
  const { page } = usePage();
  const isHome = page.pageType === 'home';

  return (
    <BasicLayout
      {...props}
      afterFeatures={
        <>
          {props.afterFeatures}
          {isHome ? <HomeBody /> : null}
        </>
      }
    />
  );
}

export * from '@rspress/core/theme-original';
